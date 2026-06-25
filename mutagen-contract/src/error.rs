use cosmwasm_std::StdError;
use thiserror::Error;

#[derive(Error, Debug, PartialEq)]
pub enum ContractError {
    #[error("{0}")]
    Std(#[from] StdError),

    #[error("Unauthorized")]
    Unauthorized {},

    #[error("No bonded amount — call Bond first")]
    NoPendingBond {},

    #[error("Bond already pending")]
    BondAlreadyPending {},

    #[error("Invalid bond amount")]
    InvalidBondAmount {},

    #[error("Unsupported denom: {denom}")]
    UnsupportedDenom { denom: String },

    #[error("Insufficient contract balance for payout")]
    InsufficientBalance {},

    // ─── Raid Boss errors ────────────────────────────────────────────────

    #[error("Experiment {id} was not found or not owned by sender")]
    NotExperimentOwner { id: u64 },

    #[error("Experiment {id} has already been consumed in a merge")]
    ExperimentAlreadyConsumed { id: u64 },

    #[error("Must provide exactly 4 distinct experiment IDs")]
    InvalidMergeInput {},

    #[error("Specimen not found or not owned by sender")]
    NotSpecimenOwner {},

    #[error("Specimen is still on attack cooldown")]
    SpecimenOnCooldown {},

    #[error("Boss is already defeated — wait for respawn")]
    BossAlreadyDefeated {},

    #[error("Boss is still alive — cannot claim reward")]
    BossStillAlive {},

    #[error("No damage contribution recorded for this player")]
    NoDamageContribution {},

    #[error("Reward already claimed for this Boss life")]
    RewardAlreadyClaimed {},
}

