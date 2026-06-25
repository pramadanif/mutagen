use cosmwasm_schema::{cw_serde, QueryResponses};
use cosmwasm_std::{Addr, Decimal, Timestamp, Uint128};

use crate::state::{
    AuditorState, Experiment, Intervention, LootTableState,
    Specimen,
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

    // ─── Raid Boss milestone ─────────────────────────────────────────────

    /// Merge exactly 4 owned Mutation NFTs (Experiments) into one Specimen.
    MergeSpecimen {
        experiment_ids: [u64; 4],
    },
    /// Attack the shared Boss using a Specimen (subject to cooldown).
    AttackBoss {
        specimen_id: u64,
    },
    /// Claim reward credits after the Boss is defeated.
    ClaimReward {},
    /// Respawn a new Boss — relayer/owner only.
    RespawnBoss {
        new_hp: u32,
    },
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

    // ─── Raid Boss milestone ─────────────────────────────────────────────

    #[returns(BossStateResponse)]
    GetBossState {},
    #[returns(LeaderboardResponse)]
    GetLeaderboard {},
    #[returns(SpecimensResponse)]
    GetPlayerSpecimens { player: String },
    #[returns(Specimen)]
    GetSpecimen { id: u64 },
}

// ─── Existing response types ──────────────────────────────────────────────

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

// ─── Raid Boss response types ─────────────────────────────────────────────

#[cw_serde]
pub struct BossStateResponse {
    pub max_hp: u32,
    pub current_hp: u32,
    pub defeated: bool,
    pub respawn_count: u64,
    /// Percentage HP remaining (0–100)
    pub hp_percent: u32,
}

#[cw_serde]
pub struct LeaderboardEntry {
    pub player: Addr,
    pub damage: u32,
    /// Share in basis points (e.g. 4250 = 42.50%)
    pub share_bps: u32,
    pub reward_credits: u64,
    pub claimed: bool,
}

#[cw_serde]
pub struct LeaderboardResponse {
    pub entries: Vec<LeaderboardEntry>,
    pub total_damage: u32,
    pub boss_defeated: bool,
    pub respawn_count: u64,
}

#[cw_serde]
pub struct SpecimensResponse {
    pub specimens: Vec<Specimen>,
}

#[cw_serde]
pub struct MergeSpecimenResponse {
    pub specimen_id: u64,
    pub archetype: String,
    pub tier: String,
    pub power: u32,
}

#[cw_serde]
pub struct AttackBossResponse {
    pub damage_dealt: u32,
    pub boss_hp_remaining: u32,
    pub boss_defeated: bool,
    pub cooldown_until_seconds: u64,
}
