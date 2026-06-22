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
use crate::state::{
    AuditorState, Config, CurveState, Experiment, AUDITOR, CONFIG, CURVE, EXPERIMENT_COUNT,
    EXPERIMENTS, LOOT_TABLE, PENDING_BONDS, CONTRACT_NAME, CONTRACT_VERSION,
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
