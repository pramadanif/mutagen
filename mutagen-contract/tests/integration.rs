use cosmwasm_std::{coins, Addr, Uint128};
use cosmwasm_std::testing::MockApi;
use cw_multi_test::{App, AppBuilder, BankSudo, ContractWrapper, Executor, StakeKeeper, SudoMsg};

use mutagen_contract::msg::{ExecuteMsg, InstantiateMsg, QueryMsg};
use mutagen_contract::state::{CurveState, LootTableState};

const RELAYER: &str = "cosmos18tl6csmj6meh3t4u5zpvkjd78un4mwf6sz27kr";
const PLAYER: &str = "cosmos17p3erf5gv2436fd4vyjwmudakts563a497syuz";

fn setup() -> (App, Addr) {
    let mut app = AppBuilder::new()
        .with_api(MockApi::default().with_prefix("cosmos"))
        .with_staking(StakeKeeper::default())
        .build(|_router, _api, _storage| {});

    let code = ContractWrapper::new(
        mutagen_contract::contract::execute,
        mutagen_contract::contract::instantiate,
        mutagen_contract::contract::query,
    );
    let code_id = app.store_code(Box::new(code));

    let contract = app
        .instantiate_contract(
            code_id,
            Addr::unchecked("owner"),
            &InstantiateMsg {
                relayer: RELAYER.to_string(),
            },
            &[],
            "MUTAGEN",
            None,
        )
        .unwrap();

    app.sudo(SudoMsg::Bank(BankSudo::Mint {
        to_address: PLAYER.to_string(),
        amount: coins(5_000_000, "uatom"),
    }))
    .unwrap();

    (app, contract)
}

#[test]
fn bond_and_trigger_logs_experiment() {
    let (mut app, contract) = setup();

    app.execute_contract(
        Addr::unchecked(PLAYER),
        contract.clone(),
        &ExecuteMsg::Bond {},
        &coins(100_000, "uatom"),
    )
    .unwrap();

    app.execute_contract(
        Addr::unchecked(PLAYER),
        contract.clone(),
        &ExecuteMsg::TriggerExposure {},
        &[],
    )
    .unwrap();

    let curve: CurveState = app
        .wrap()
        .query_wasm_smart(&contract, &QueryMsg::GetCurveState {})
        .unwrap();

    assert_eq!(curve.total_pulls, 1);
    assert_eq!(curve.total_bonded, Uint128::new(100_000));
}

#[test]
fn relayer_updates_regime() {
    let (mut app, contract) = setup();

    app.execute_contract(
        Addr::unchecked(RELAYER),
        contract.clone(),
        &ExecuteMsg::UpdateRegimeScore {
            score: 75,
            bonded_delta: cosmwasm_std::Decimal::zero(),
            gov_delta: cosmwasm_std::Decimal::zero(),
            ibc_delta: cosmwasm_std::Decimal::zero(),
        },
        &[],
    )
    .unwrap();

    let loot: LootTableState = app
        .wrap()
        .query_wasm_smart(&contract, &QueryMsg::GetLootTable {})
        .unwrap();

    assert_eq!(loot.regime_score, 75);
}

#[test]
fn unauthorized_regime_update_fails() {
    let (mut app, contract) = setup();

    let err = app
        .execute_contract(
            Addr::unchecked(PLAYER),
            contract,
            &ExecuteMsg::UpdateRegimeScore {
                score: 50,
                bonded_delta: cosmwasm_std::Decimal::zero(),
                gov_delta: cosmwasm_std::Decimal::zero(),
                ibc_delta: cosmwasm_std::Decimal::zero(),
            },
            &[],
        )
        .unwrap_err();

    assert!(err.root_cause().to_string().contains("Unauthorized"));
}
