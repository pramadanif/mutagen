use std::str::FromStr;

use cosmwasm_std::{Addr, Deps, Env, Order, QueryRequest, StakingQuery, StdResult, Uint128};
use cw_storage_plus::Bound;

use crate::msg::{
    ConfigResponse, InterventionLogResponse, ListExperimentsResponse, QueryMsg,
    ResonanceBonusResponse,
};
use crate::state::{
    AuditorState, Config, CurveState, Experiment, LootTableState, AUDITOR, CONFIG, CURVE,
    EXPERIMENTS, LOOT_TABLE,
};

const DEFAULT_LIMIT: u32 = 20;
const MAX_LIMIT: u32 = 50;
const MIN_STAKE_BONUS: u128 = 1_000_000;

pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<cosmwasm_std::Binary> {
    match msg {
        QueryMsg::GetConfig {} => cosmwasm_std::to_json_binary(&query_config(deps)?),
        QueryMsg::GetCurveState {} => cosmwasm_std::to_json_binary(&CURVE.load(deps.storage)?),
        QueryMsg::GetLootTable {} => cosmwasm_std::to_json_binary(&LOOT_TABLE.load(deps.storage)?),
        QueryMsg::GetAuditorState {} => {
            cosmwasm_std::to_json_binary(&AUDITOR.load(deps.storage)?)
        }
        QueryMsg::GetExperiment { id } => {
            cosmwasm_std::to_json_binary(&EXPERIMENTS.load(deps.storage, id)?)
        }
        QueryMsg::ListExperiments { start_after, limit } => cosmwasm_std::to_json_binary(
            &list_experiments(deps, start_after, limit, None)?,
        ),
        QueryMsg::GetPlayerExperiments { player } => {
            let addr = deps.api.addr_validate(&player)?;
            cosmwasm_std::to_json_binary(&list_experiments(deps, None, None, Some(addr))?)
        }
        QueryMsg::CheckResonanceBonus { address } => {
            cosmwasm_std::to_json_binary(&query_resonance(deps, address)?)
        }
        QueryMsg::GetInterventionLog { limit } => {
            cosmwasm_std::to_json_binary(&query_interventions(deps, limit)?)
        }
    }
}

fn query_config(deps: Deps) -> StdResult<ConfigResponse> {
    let config: Config = CONFIG.load(deps.storage)?;
    Ok(ConfigResponse {
        relayer: config.relayer,
        owner: config.owner,
    })
}

fn list_experiments(
    deps: Deps,
    start_after: Option<u64>,
    limit: Option<u32>,
    player: Option<Addr>,
) -> StdResult<ListExperimentsResponse> {
    let limit = limit.unwrap_or(DEFAULT_LIMIT).min(MAX_LIMIT) as usize;
    let start = start_after.map(Bound::exclusive);

    let experiments: Vec<Experiment> = EXPERIMENTS
        .range(deps.storage, start, None, Order::Ascending)
        .take(limit * 3)
        .filter_map(|item| {
            item.ok().and_then(|(id, exp)| {
                if let Some(ref p) = player {
                    if exp.player != *p {
                        return None;
                    }
                }
                Some((id, exp))
            })
        })
        .take(limit)
        .map(|(_, exp)| exp)
        .collect();

    Ok(ListExperimentsResponse { experiments })
}

fn query_resonance(deps: Deps, address: String) -> StdResult<ResonanceBonusResponse> {
    let addr = deps.api.addr_validate(&address)?;
    let res: cosmwasm_std::AllDelegationsResponse = deps.querier.query(&QueryRequest::Staking(
        StakingQuery::AllDelegations {
            delegator: addr.to_string(),
        },
    ))?;
    let total = res
        .delegations
        .iter()
        .map(|d| d.amount.amount)
        .fold(Uint128::zero(), |acc, v| acc + v);

    let hub_staker = total.u128() >= MIN_STAKE_BONUS;
    let bonus_multiplier = if hub_staker {
        cosmwasm_std::Decimal::from_str("1.15").unwrap()
    } else {
        cosmwasm_std::Decimal::one()
    };

    Ok(ResonanceBonusResponse {
        hub_staker,
        total_staked: total,
        bonus_multiplier,
        nft_holder: false,
        lab_holder: false,
    })
}

fn query_interventions(deps: Deps, limit: Option<u32>) -> StdResult<InterventionLogResponse> {
    let auditor: AuditorState = AUDITOR.load(deps.storage)?;
    let take = limit.unwrap_or(20).min(100) as usize;
    let start = auditor.intervention_log.len().saturating_sub(take);
    let interventions = auditor.intervention_log[start..].to_vec();
    Ok(InterventionLogResponse { interventions })
}
