pub mod auditor;
pub mod contract;
pub mod error;
pub mod execute;
pub mod loot;
pub mod msg;
pub mod query;
pub mod state;

#[cfg(all(not(feature = "library"), not(target_arch = "wasm32")))]
pub mod bin {
    use cosmwasm_schema::write_api;

    use crate::msg::{ExecuteMsg, InstantiateMsg, QueryMsg};

    pub fn main() {
        write_api! {
            instantiate: InstantiateMsg,
            execute: ExecuteMsg,
            query: QueryMsg,
        }
    }
}
