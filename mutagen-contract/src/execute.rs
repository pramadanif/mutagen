use std::str::FromStr;

use cosmwasm_std::{
    attr, BankMsg, Coin, Deps, DepsMut, Env, Fraction, MessageInfo, Order, QueryRequest,
    Response, StakingQuery, StdResult, Uint128,
};
use cw_storage_plus::Bound;
use cw2::set_contract_version;

use crate::auditor::maybe_run_audit;
use crate::error::ContractError;
use crate::loot::{apply_resonance_bonus, draw_tier, rescale_loot_table};
use crate::msg::ExecuteMsg;
use crate::specimen::{compute_archetype, compute_power, apply_phase_modifier, Phase, tier_index};
use crate::state::{
    AuditorState, BossState, Config, CurveState, Experiment, PlayerRewardClaim, Specimen,
    ATTACK_COOLDOWN_SECS, AUDITOR, BOSS_STATE, CONFIG, CONSUMED_EXPERIMENTS, CURVE,
    DEFAULT_BOSS_HP, EXPERIMENT_COUNT, EXPERIMENTS, LOOT_TABLE, PENDING_BONDS,
    PLAYER_CLAIM_EPOCH, PLAYER_DAMAGE, SPECIMEN_COUNT, SPECIMENS, CONTRACT_NAME, CONTRACT_VERSION,
};

const MIN_BOND: u128 = 1_000;
const MIN_STAKE_BONUS: u128 = 1_000_000;

pub fn instantiate(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    relayer: String,
) -> Result<Response, ContractError> {
    set_contract_version(deps.storage, CONTRACT_NAME, CONTRACT_VERSION)?;

    let relayer_addr = deps.api.addr_validate(&relayer)?;
    CONFIG.save(
        deps.storage,
        &Config {
            relayer: relayer_addr,
            owner: info.sender.clone(),
        },
    )?;

    CURVE.save(
        deps.storage,
        &CurveState {
            slope: cosmwasm_std::Decimal::one(),
            fee_rate: cosmwasm_std::Decimal::from_str("0.01").unwrap(),
            payout_cap: cosmwasm_std::Decimal::one(),
            total_bonded: Uint128::zero(),
            total_pulls: 0,
        },
    )?;

    LOOT_TABLE.save(deps.storage, &rescale_loot_table(0, env.block.time))?;

    AUDITOR.save(
        deps.storage,
        &AuditorState {
            zero_sum_index: cosmwasm_std::Decimal::zero(),
            intervention_count: 0,
            last_check_at_pull: 0,
            k_interval: 10,
            intervention_log: vec![],
        },
    )?;

    EXPERIMENT_COUNT.save(deps.storage, &0u64)?;

    Ok(Response::new()
        .add_attribute("method", "instantiate")
        .add_attribute("relayer", relayer))
}

pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, ContractError> {
    match msg {
        ExecuteMsg::Bond {} => execute_bond(deps, info),
        ExecuteMsg::TriggerExposure {} => execute_trigger(deps, env, info),
        ExecuteMsg::UpdateRegimeScore {
            score,
            bonded_delta,
            gov_delta,
            ibc_delta,
        } => execute_update_regime(deps, env, info, score, bonded_delta, gov_delta, ibc_delta),
        ExecuteMsg::RunAudit {} => execute_run_audit(deps, env, info),
        // ─── Raid Boss handlers ───────────────────────────────────────────
        ExecuteMsg::MergeSpecimen { experiment_ids } =>
            execute_merge_specimen(deps, env, info, experiment_ids),
        ExecuteMsg::AttackBoss { specimen_id } =>
            execute_attack_boss(deps, env, info, specimen_id),
        ExecuteMsg::ClaimReward {} => execute_claim_reward(deps, info),
        ExecuteMsg::RespawnBoss { new_hp } => execute_respawn_boss(deps, env, info, new_hp),
    }
}

fn execute_bond(deps: DepsMut, info: MessageInfo) -> Result<Response, ContractError> {
    if PENDING_BONDS.may_load(deps.storage, &info.sender)?.is_some() {
        return Err(ContractError::BondAlreadyPending {});
    }

    let coin = info
        .funds
        .iter()
        .find(|c| c.denom == "uatom")
        .ok_or(ContractError::UnsupportedDenom {
            denom: info
                .funds
                .first()
                .map(|c| c.denom.clone())
                .unwrap_or_else(|| "none".to_string()),
        })?;

    if coin.amount.u128() < MIN_BOND {
        return Err(ContractError::InvalidBondAmount {});
    }

    PENDING_BONDS.save(
        deps.storage,
        &info.sender,
        &crate::state::PendingBond {
            amount: coin.amount,
            denom: coin.denom.clone(),
        },
    )?;

    let mut curve = CURVE.load(deps.storage)?;
    curve.total_bonded += coin.amount;
    CURVE.save(deps.storage, &curve)?;

    Ok(Response::new()
        .add_attribute("action", "bond")
        .add_attribute("player", info.sender)
        .add_attribute("amount", coin.amount))
}

fn execute_trigger(
    mut deps: DepsMut,
    env: Env,
    info: MessageInfo,
) -> Result<Response, ContractError> {
    let pending = PENDING_BONDS
        .may_load(deps.storage, &info.sender)?
        .ok_or(ContractError::NoPendingBond {})?;

    PENDING_BONDS.remove(deps.storage, &info.sender);

    let hub_staker = total_staked(deps.as_ref(), &info.sender)
        .map(|t| t.u128() >= MIN_STAKE_BONUS)
        .unwrap_or(false);
    let loot = LOOT_TABLE.load(deps.storage)?;
    let tiers = apply_resonance_bonus(&loot.tiers, hub_staker);

    let mut curve = CURVE.load(deps.storage)?;
    let seed = env
        .block
        .height
        .wrapping_add(env.block.time.seconds())
        .wrapping_add(curve.total_pulls)
        .wrapping_add(info.sender.as_bytes().iter().map(|b| *b as u64).sum());

    let tier_idx = draw_tier(&tiers, seed);
    let tier = &tiers[tier_idx];

    let gross_payout = decimal_mul(pending.amount, tier.payout_multiplier);
    let capped = decimal_mul(gross_payout, curve.payout_cap);
    let fee = decimal_mul(capped, curve.fee_rate);
    let payout = capped.saturating_sub(fee).min(pending.amount);

    let exposure_score = cosmwasm_std::Decimal::from_ratio(
        payout.u128().min(9999),
        pending.amount.u128().max(1),
    );

    let mut count = EXPERIMENT_COUNT.load(deps.storage)?;
    count += 1;
    EXPERIMENT_COUNT.save(deps.storage, &count)?;

    let experiment = Experiment {
        id: count,
        player: info.sender.clone(),
        bonded_amount: pending.amount,
        bonded_denom: pending.denom.clone(),
        regime_score_at_pull: loot.regime_score,
        outcome_tier: tier.name.clone(),
        payout_amount: payout,
        exposure_score,
        timestamp: env.block.time,
    };
    EXPERIMENTS.save(deps.storage, count, &experiment)?;

    curve.total_pulls += 1;
    CURVE.save(deps.storage, &curve)?;

    let audit_action = run_audit_internal(&mut deps, &env, curve.total_pulls)?
        .map(|i| i.action)
        .unwrap_or_else(|| "none".to_string());

    let mut messages = vec![];
    if !payout.is_zero() {
        messages.push(BankMsg::Send {
            to_address: info.sender.to_string(),
            amount: vec![Coin {
                denom: pending.denom.clone(),
                amount: payout,
            }],
        });
    }

    let mut attrs = vec![
        attr("action", "trigger_exposure"),
        attr("player", info.sender.clone()),
        attr("tier", tier.name.clone()),
        attr("payout", payout),
        attr("experiment_id", count.to_string()),
        attr("audit_action", audit_action),
    ];

    Ok(Response::new()
        .add_messages(messages)
        .add_attributes(attrs))
}

fn execute_update_regime(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    score: u8,
    bonded_delta: cosmwasm_std::Decimal,
    gov_delta: cosmwasm_std::Decimal,
    ibc_delta: cosmwasm_std::Decimal,
) -> Result<Response, ContractError> {
    let config = CONFIG.load(deps.storage)?;
    if info.sender != config.relayer {
        return Err(ContractError::Unauthorized {});
    }

    let table = rescale_loot_table(score.min(100), env.block.time);
    LOOT_TABLE.save(deps.storage, &table)?;

    Ok(Response::new()
        .add_attribute("action", "update_regime_score")
        .add_attribute("score", score.to_string())
        .add_attribute("bonded_delta", bonded_delta.to_string())
        .add_attribute("gov_delta", gov_delta.to_string())
        .add_attribute("ibc_delta", ibc_delta.to_string()))
}

fn execute_run_audit(
    mut deps: DepsMut,
    env: Env,
    info: MessageInfo,
) -> Result<Response, ContractError> {
    let config = CONFIG.load(deps.storage)?;
    if info.sender != config.relayer && info.sender != config.owner {
        return Err(ContractError::Unauthorized {});
    }

    let curve = CURVE.load(deps.storage)?;
    let intervention = run_audit_internal(&mut deps, &env, curve.total_pulls)?;

    Ok(Response::new()
        .add_attribute("action", "run_audit")
        .add_attribute(
            "audit_ran",
            intervention.is_some().to_string(),
        ))
}

fn run_audit_internal(
    deps: &mut DepsMut,
    env: &Env,
    pull_count: u64,
) -> Result<Option<crate::state::Intervention>, ContractError> {
    let auditor = AUDITOR.load(deps.storage)?;
    if pull_count == 0 || pull_count % auditor.k_interval != 0 {
        return Ok(None);
    }

    let start = pull_count.saturating_sub(auditor.k_interval) + 1;
    let payouts: Vec<Uint128> = EXPERIMENTS
        .range(
            deps.storage,
            Some(Bound::inclusive(start)),
            None,
            Order::Ascending,
        )
        .take(auditor.k_interval as usize)
        .map(|item| item.map(|(_, exp)| exp.payout_amount))
        .collect::<StdResult<_>>()?;

    let mut auditor = auditor;
    let mut curve = CURVE.load(deps.storage)?;
    let result = maybe_run_audit(&mut auditor, &mut curve, &payouts, pull_count, env.block.time);
    AUDITOR.save(deps.storage, &auditor)?;
    CURVE.save(deps.storage, &curve)?;
    Ok(result)
}

fn decimal_mul(amount: Uint128, ratio: cosmwasm_std::Decimal) -> Uint128 {
    amount.multiply_ratio(ratio.numerator(), ratio.denominator())
}

fn total_staked(deps: Deps, addr: &cosmwasm_std::Addr) -> StdResult<Uint128> {
    let res: cosmwasm_std::AllDelegationsResponse = deps.querier.query(&QueryRequest::Staking(
        StakingQuery::AllDelegations {
            delegator: addr.to_string(),
        },
    ))?;
    Ok(res
        .delegations
        .iter()
        .map(|d| d.amount.amount)
        .fold(Uint128::zero(), |acc, v| acc + v))
}

// ─────────────────────────────────────────────────────────────────────────────
// Raid Boss milestone execute handlers
// ─────────────────────────────────────────────────────────────────────────────

/// Initialise BossState on first access (lazy init avoids requiring a separate
/// admin call after deployment).
fn ensure_boss_state(deps: &mut DepsMut) -> Result<BossState, ContractError> {
    if let Some(boss) = BOSS_STATE.may_load(deps.storage)? {
        return Ok(boss);
    }
    let boss = BossState {
        max_hp: DEFAULT_BOSS_HP,
        current_hp: DEFAULT_BOSS_HP,
        defeated: false,
        respawn_count: 0,
    };
    BOSS_STATE.save(deps.storage, &boss)?;
    Ok(boss)
}

/// Execute: MergeSpecimen — consume 4 Experiments, mint one Specimen.
fn execute_merge_specimen(
    mut deps: DepsMut,
    env: Env,
    info: MessageInfo,
    experiment_ids: [u64; 4],
) -> Result<Response, ContractError> {
    // 1. Reject duplicate IDs
    {
        let mut seen = std::collections::HashSet::new();
        for id in &experiment_ids {
            if !seen.insert(*id) {
                return Err(ContractError::InvalidMergeInput {});
            }
        }
    }

    // 2. Validate ownership + not-already-consumed for each Experiment
    let mut tier_indices = [0u8; 4];
    let mut dominant_tier = "COMMON".to_string();
    let mut dominant_power = 0u8;

    for (slot, &exp_id) in experiment_ids.iter().enumerate() {
        // Consumed check
        if CONSUMED_EXPERIMENTS.may_load(deps.storage, exp_id)?.is_some() {
            return Err(ContractError::ExperimentAlreadyConsumed { id: exp_id });
        }
        // Ownership check
        let exp = EXPERIMENTS
            .may_load(deps.storage, exp_id)?
            .ok_or(ContractError::NotExperimentOwner { id: exp_id })?;
        if exp.player != info.sender {
            return Err(ContractError::NotExperimentOwner { id: exp_id });
        }
        let idx = tier_index(&exp.outcome_tier);
        tier_indices[slot] = idx;
        // Track dominant (highest-index) tier for art
        if idx > dominant_power {
            dominant_power = idx;
            dominant_tier = exp.outcome_tier.clone();
        }
    }

    // 3. Mark all 4 as consumed
    for &exp_id in &experiment_ids {
        CONSUMED_EXPERIMENTS.save(deps.storage, exp_id, &true)?;
    }

    // 4. Compute archetype + power
    let archetype = compute_archetype(tier_indices);
    let power = compute_power(tier_indices, archetype);

    // 5. Mint Specimen
    let mut count = SPECIMEN_COUNT.may_load(deps.storage)?.unwrap_or(0);
    count += 1;
    SPECIMEN_COUNT.save(deps.storage, &count)?;

    let specimen = Specimen {
        id: count,
        owner: info.sender.clone(),
        archetype: archetype.as_str().to_string(),
        tier: dominant_tier.clone(),
        power,
        consumed_experiment_ids: experiment_ids,
        last_attack_at: None,
        created_at: env.block.time,
    };
    SPECIMENS.save(deps.storage, count, &specimen)?;

    Ok(Response::new()
        .add_attribute("action", "merge_specimen")
        .add_attribute("specimen_id", count.to_string())
        .add_attribute("archetype", archetype.as_str())
        .add_attribute("tier", dominant_tier)
        .add_attribute("power", power.to_string())
        .add_attribute("player", info.sender))
}

/// Execute: AttackBoss — deal damage with a Specimen, respecting cooldown.
fn execute_attack_boss(
    mut deps: DepsMut,
    env: Env,
    info: MessageInfo,
    specimen_id: u64,
) -> Result<Response, ContractError> {
    // 1. Load + validate Specimen ownership
    let mut specimen = SPECIMENS
        .may_load(deps.storage, specimen_id)?
        .ok_or(ContractError::NotSpecimenOwner {})?;
    if specimen.owner != info.sender {
        return Err(ContractError::NotSpecimenOwner {});
    }

    // 2. Check cooldown
    if let Some(last) = specimen.last_attack_at {
        let elapsed = env.block.time.seconds().saturating_sub(last.seconds());
        if elapsed < ATTACK_COOLDOWN_SECS {
            return Err(ContractError::SpecimenOnCooldown {});
        }
    }

    // 3. Load Boss state (lazy init)
    let mut boss = ensure_boss_state(&mut deps)?;
    if boss.defeated {
        return Err(ContractError::BossAlreadyDefeated {});
    }

    // 4. Compute damage using current regime score
    let loot = LOOT_TABLE.load(deps.storage)?;
    let phase = Phase::from_score(loot.regime_score);
    let damage = apply_phase_modifier(specimen.power, {
        // Parse archetype back from string
        match specimen.archetype.as_str() {
            "Pure" => crate::specimen::Archetype::Pure,
            "Balanced" => crate::specimen::Archetype::Balanced,
            _ => crate::specimen::Archetype::Hybrid,
        }
    }, phase);

    // 5. Apply damage to Boss
    boss.current_hp = boss.current_hp.saturating_sub(damage);
    let defeated = boss.current_hp == 0;
    boss.defeated = defeated;
    BOSS_STATE.save(deps.storage, &boss)?;

    // 6. Update specimen cooldown
    specimen.last_attack_at = Some(env.block.time);
    SPECIMENS.save(deps.storage, specimen_id, &specimen)?;

    // 7. Update player damage ledger
    let cooldown_until = env.block.time.seconds() + ATTACK_COOLDOWN_SECS;
    let epoch = boss.respawn_count;
    let player_epoch = PLAYER_CLAIM_EPOCH
        .may_load(deps.storage, &info.sender)?
        .unwrap_or(0);

    // Reset ledger entry if this is a new Boss life
    let existing = if player_epoch == epoch {
        PLAYER_DAMAGE.may_load(deps.storage, &info.sender)?.unwrap_or(PlayerRewardClaim {
            damage_dealt: 0,
            claimed: false,
            reward_credits: 0,
        })
    } else {
        PLAYER_CLAIM_EPOCH.save(deps.storage, &info.sender, &epoch)?;
        PlayerRewardClaim { damage_dealt: 0, claimed: false, reward_credits: 0 }
    };

    let updated = PlayerRewardClaim {
        damage_dealt: existing.damage_dealt + damage,
        claimed: false,
        reward_credits: 0, // computed at claim time
    };
    PLAYER_DAMAGE.save(deps.storage, &info.sender, &updated)?;

    let mut resp = Response::new()
        .add_attribute("action", "attack_boss")
        .add_attribute("player", info.sender)
        .add_attribute("specimen_id", specimen_id.to_string())
        .add_attribute("damage", damage.to_string())
        .add_attribute("boss_hp", boss.current_hp.to_string())
        .add_attribute("cooldown_until", cooldown_until.to_string());

    if defeated {
        resp = resp.add_attribute("boss_defeated", "true");
    }

    Ok(resp)
}

/// Execute: ClaimReward — collect reward credits proportional to damage share.
fn execute_claim_reward(
    deps: DepsMut,
    info: MessageInfo,
) -> Result<Response, ContractError> {
    let boss = BOSS_STATE
        .may_load(deps.storage)?
        .unwrap_or(BossState { max_hp: 0, current_hp: 0, defeated: false, respawn_count: 0 });

    if !boss.defeated {
        return Err(ContractError::BossStillAlive {});
    }

    // Validate player is in the current epoch
    let epoch = boss.respawn_count;
    let player_epoch = PLAYER_CLAIM_EPOCH
        .may_load(deps.storage, &info.sender)?
        .unwrap_or(u64::MAX);
    if player_epoch != epoch {
        return Err(ContractError::NoDamageContribution {});
    }

    let mut claim = PLAYER_DAMAGE
        .may_load(deps.storage, &info.sender)?
        .ok_or(ContractError::NoDamageContribution {})?;

    if claim.claimed {
        return Err(ContractError::RewardAlreadyClaimed {});
    }
    if claim.damage_dealt == 0 {
        return Err(ContractError::NoDamageContribution {});
    }

    // Compute total damage dealt in this Boss life across all players
    // (we sum over PLAYER_DAMAGE for players in the current epoch)
    // Simple approach: award credits = damage_dealt (1:1 credits per damage point)
    // Frontend can display share% relative to total leaderboard damage.
    let reward_credits = claim.damage_dealt as u64;

    claim.claimed = true;
    claim.reward_credits = reward_credits;
    PLAYER_DAMAGE.save(deps.storage, &info.sender, &claim)?;

    Ok(Response::new()
        .add_attribute("action", "claim_reward")
        .add_attribute("player", info.sender)
        .add_attribute("reward_credits", reward_credits.to_string())
        .add_attribute("damage_dealt", claim.damage_dealt.to_string()))
}

/// Execute: RespawnBoss — relayer/owner only.
fn execute_respawn_boss(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    new_hp: u32,
) -> Result<Response, ContractError> {
    let config = CONFIG.load(deps.storage)?;
    if info.sender != config.relayer && info.sender != config.owner {
        return Err(ContractError::Unauthorized {});
    }

    let current = BOSS_STATE
        .may_load(deps.storage)?
        .unwrap_or(BossState { max_hp: 0, current_hp: 0, defeated: true, respawn_count: 0 });

    let hp = if new_hp == 0 { DEFAULT_BOSS_HP } else { new_hp };
    let boss = BossState {
        max_hp: hp,
        current_hp: hp,
        defeated: false,
        respawn_count: current.respawn_count + 1,
    };
    BOSS_STATE.save(deps.storage, &boss)?;

    Ok(Response::new()
        .add_attribute("action", "respawn_boss")
        .add_attribute("new_hp", hp.to_string())
        .add_attribute("respawn_count", boss.respawn_count.to_string()))
}
