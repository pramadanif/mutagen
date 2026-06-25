use cosmwasm_schema::cw_serde;
use cosmwasm_std::{Addr, Decimal, Timestamp, Uint128};
use cw_storage_plus::{Item, Map};

/// Attack cooldown in seconds (5 minutes — matches oracle cycle).
pub const ATTACK_COOLDOWN_SECS: u64 = 300;
/// Default Boss HP for a fresh / respawned Boss.
pub const DEFAULT_BOSS_HP: u32 = 10_000;

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

// ─── Raid Boss milestone storage ─────────────────────────────────────────

/// A Specimen created by merging 4 Mutation NFTs (Experiments).
#[cw_serde]
pub struct Specimen {
    pub id: u64,
    pub owner: Addr,
    /// "Pure" | "Balanced" | "Hybrid"
    pub archetype: String,
    /// Dominant tier name used for art asset lookup
    pub tier: String,
    /// Raw power before phase modifier
    pub power: u32,
    /// The 4 Experiment IDs that were consumed
    pub consumed_experiment_ids: [u64; 4],
    /// Timestamp of the last attack (None = never attacked)
    pub last_attack_at: Option<Timestamp>,
    pub created_at: Timestamp,
}

/// Shared on-chain Boss HP pool.
#[cw_serde]
pub struct BossState {
    pub max_hp: u32,
    pub current_hp: u32,
    pub defeated: bool,
    /// Incremented each time the Boss is respawned.
    pub respawn_count: u64,
}

/// Per-player reward claim record for the current Boss life.
#[cw_serde]
pub struct PlayerRewardClaim {
    /// Total damage dealt in this Boss life.
    pub damage_dealt: u32,
    /// True once ClaimReward has been called.
    pub claimed: bool,
    /// Reward credit points (proportional to damage share).
    pub reward_credits: u64,
}

pub const SPECIMENS: Map<u64, Specimen> = Map::new("specimens");
pub const SPECIMEN_COUNT: Item<u64> = Item::new("specimen_count");
/// Experiment IDs that have been consumed in a merge — value is always true.
pub const CONSUMED_EXPERIMENTS: Map<u64, bool> = Map::new("consumed_exp");
pub const BOSS_STATE: Item<BossState> = Item::new("boss_state");
/// Damage ledger keyed by player address.
pub const PLAYER_DAMAGE: Map<&Addr, PlayerRewardClaim> = Map::new("player_damage");
/// Tracks the Boss respawn_count at the time of last claim per player,
/// so claims reset automatically when a new Boss spawns.
pub const PLAYER_CLAIM_EPOCH: Map<&Addr, u64> = Map::new("player_claim_epoch");
