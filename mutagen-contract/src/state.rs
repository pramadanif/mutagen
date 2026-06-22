use cosmwasm_schema::cw_serde;
use cosmwasm_std::{Addr, Decimal, Timestamp, Uint128};
use cw_storage_plus::{Item, Map};

pub const CONTRACT_NAME: &str = "crates.io:mutagen-contract";
pub const CONTRACT_VERSION: &str = env!("CARGO_PKG_VERSION");

#[cw_serde]
pub struct Config {
    pub relayer: Addr,
    pub owner: Addr,
}

#[cw_serde]
pub struct CurveState {
    pub slope: Decimal,
    pub fee_rate: Decimal,
    pub payout_cap: Decimal,
    pub total_bonded: Uint128,
    pub total_pulls: u64,
}

#[cw_serde]
pub struct LootTier {
    pub name: String,
    pub base_weight: u32,
    pub current_weight: u32,
    pub payout_multiplier: Decimal,
}

#[cw_serde]
pub struct LootTableState {
    pub regime_score: u8,
    pub tiers: Vec<LootTier>,
    pub last_updated: Timestamp,
}

#[cw_serde]
pub struct Intervention {
    pub timestamp: Timestamp,
    pub pull_number: u64,
    pub gini_before: Decimal,
    pub threshold: Decimal,
    pub action: String,
    pub param_after: Decimal,
}

#[cw_serde]
pub struct AuditorState {
    pub zero_sum_index: Decimal,
    pub intervention_count: u64,
    pub last_check_at_pull: u64,
    pub k_interval: u64,
    pub intervention_log: Vec<Intervention>,
}

#[cw_serde]
pub struct PendingBond {
    pub amount: Uint128,
    pub denom: String,
}

#[cw_serde]
pub struct Experiment {
    pub id: u64,
    pub player: Addr,
    pub bonded_amount: Uint128,
    pub bonded_denom: String,
    pub regime_score_at_pull: u8,
    pub outcome_tier: String,
    pub payout_amount: Uint128,
    pub exposure_score: Decimal,
    pub timestamp: Timestamp,
}

pub const CONFIG: Item<Config> = Item::new("config");
pub const CURVE: Item<CurveState> = Item::new("curve");
pub const LOOT_TABLE: Item<LootTableState> = Item::new("loot_table");
pub const AUDITOR: Item<AuditorState> = Item::new("auditor");
pub const PENDING_BONDS: Map<&Addr, PendingBond> = Map::new("pending_bonds");
pub const EXPERIMENTS: Map<u64, Experiment> = Map::new("experiments");
pub const EXPERIMENT_COUNT: Item<u64> = Item::new("experiment_count");
