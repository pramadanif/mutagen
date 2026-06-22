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
}
