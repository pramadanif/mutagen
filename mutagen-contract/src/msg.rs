use cosmwasm_schema::{cw_serde, QueryResponses};
use cosmwasm_std::{Addr, Decimal, Timestamp, Uint128};

use crate::state::{
    AuditorState, Config, CurveState, Experiment, Intervention, LootTableState,
};

#[cw_serde]
pub struct InstantiateMsg {
    pub relayer: String,
}

#[cw_serde]
pub enum ExecuteMsg {
    Bond {},
    TriggerExposure {},
    UpdateRegimeScore {
        score: u8,
        bonded_delta: Decimal,
        gov_delta: Decimal,
        ibc_delta: Decimal,
    },
    RunAudit {},
}

#[cw_serde]
#[derive(QueryResponses)]
pub enum QueryMsg {
    #[returns(ConfigResponse)]
    GetConfig {},
    #[returns(CurveState)]
    GetCurveState {},
    #[returns(LootTableState)]
    GetLootTable {},
    #[returns(AuditorState)]
    GetAuditorState {},
    #[returns(Experiment)]
    GetExperiment { id: u64 },
    #[returns(ListExperimentsResponse)]
    ListExperiments {
        start_after: Option<u64>,
        limit: Option<u32>,
    },
    #[returns(ListExperimentsResponse)]
    GetPlayerExperiments { player: String },
    #[returns(ResonanceBonusResponse)]
    CheckResonanceBonus { address: String },
    #[returns(InterventionLogResponse)]
    GetInterventionLog { limit: Option<u32> },
}

#[cw_serde]
pub struct ConfigResponse {
    pub relayer: Addr,
    pub owner: Addr,
}

#[cw_serde]
pub struct ListExperimentsResponse {
    pub experiments: Vec<Experiment>,
}

#[cw_serde]
pub struct ResonanceBonusResponse {
    pub hub_staker: bool,
    pub total_staked: Uint128,
    pub bonus_multiplier: Decimal,
    pub nft_holder: bool,
    pub lab_holder: bool,
}

#[cw_serde]
pub struct InterventionLogResponse {
    pub interventions: Vec<Intervention>,
}

#[cw_serde]
pub struct MigrateMsg {}

#[cw_serde]
pub struct ExperimentEvent {
    pub id: u64,
    pub player: Addr,
    pub tier: String,
    pub payout: Uint128,
    pub timestamp: Timestamp,
}
