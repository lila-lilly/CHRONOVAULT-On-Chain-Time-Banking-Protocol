#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

#[contract]
pub struct DummyLedger;

#[contractimpl]
impl DummyLedger {
    pub fn record_contribution(_env: Env, _provider: Address, _requester: Address, _task_id: u64, _hours: u32) {}
    pub fn record_consumption(_env: Env, _requester: Address, _hours: u32) {}
}

fn setup() -> (
    Env,
    TimeBankClient<'static>,
    Address,
    Address,
    Address,
    Address,
) {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, TimeBank);
    let client = TimeBankClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    
    // Register the dummy ledger
    let ledger_id = env.register_contract(None, DummyLedger);
    let ledger = ledger_id.clone(); 

    let requester = Address::generate(&env);
    let provider = Address::generate(&env);

    client.initialize(&admin, &ledger);

    // Bootstrap requester with TIME credits
    client.mint(&admin, &requester, &10u64);

    (env, client, admin, ledger, requester, provider)
}

fn make_task(env: &Env, client: &TimeBankClient, requester: &Address) -> u64 {
    client.post_task(
        requester,
        &String::from_str(env, "Build a Soroban DEX"),
        &String::from_str(env, "Implement a basic AMM with XLM/USDC pair"),
        &String::from_str(env, "Smart Contracts"),
        &3u32,
        &604800u64,
    )
}

#[test]
fn test_initialize() {
    let (_, client, admin, _, _, _) = setup();
    assert_eq!(client.get_admin(), admin);
    assert_eq!(client.get_total_tasks(), 0u64);
    assert_eq!(client.get_total_supply(), 10u64); // minted in setup
}

#[test]
fn test_mint_increases_balance_and_supply() {
    let (env, client, admin, _, _, _) = setup();
    let user = Address::generate(&env);
    let supply_before = client.get_total_supply();

    client.mint(&admin, &user, &5u64);

    assert_eq!(client.get_balance(&user), 5u64);
    assert_eq!(client.get_total_supply(), supply_before + 5);
}

#[test]
fn test_post_task_escrows_credits() {
    let (env, client, _, _, requester, _) = setup();
    let balance_before = client.get_balance(&requester);

    let id = make_task(&env, &client, &requester);

    assert_eq!(id, 0u64);
    assert_eq!(client.get_total_tasks(), 1u64);
    // 3 hours escrowed
    assert_eq!(client.get_balance(&requester), balance_before - 3);

    let task = client.get_task(&id);
    assert_eq!(task.status, TaskStatus::Open);
    assert_eq!(task.hours, 3u32);
}

#[test]
fn test_claim_task() {
    let (env, client, _, _, requester, provider) = setup();
    let id = make_task(&env, &client, &requester);

    client.claim_task(&provider, &id);

    let task = client.get_task(&id);
    assert_eq!(task.status, TaskStatus::Claimed);
    assert_eq!(task.provider, provider);
}

#[test]
fn test_submit_work() {
    let (env, client, _, _, requester, provider) = setup();
    let id = make_task(&env, &client, &requester);
    client.claim_task(&provider, &id);
    client.submit_work(&provider, &id);

    let task = client.get_task(&id);
    assert_eq!(task.status, TaskStatus::Submitted);
}

#[test]
fn test_full_task_lifecycle_transfers_credits() {
    let (env, client, _, _, requester, provider) = setup();
    let req_balance_before = client.get_balance(&requester);
    let prov_balance_before = client.get_balance(&provider);
    let supply_before = client.get_total_supply();

    let id = make_task(&env, &client, &requester); // escrow 3 credits
    client.claim_task(&provider, &id);
    client.submit_work(&provider, &id);
    client.confirm_completion(&requester, &id);

    let task = client.get_task(&id);
    assert_eq!(task.status, TaskStatus::Completed);
    assert!(task.completed_at > 0);

    // Requester paid 3 credits (already escrowed, not returned)
    assert_eq!(client.get_balance(&requester), req_balance_before - 3);
    // Provider earned 3 credits
    assert_eq!(client.get_balance(&provider), prov_balance_before + 3);
    // New supply minted = hours contributed
    assert_eq!(client.get_total_supply(), supply_before + 3);
}

#[test]
fn test_cancel_open_task_refunds_credits() {
    let (env, client, _, _, requester, _) = setup();
    let balance_before = client.get_balance(&requester);

    let id = make_task(&env, &client, &requester);
    assert_eq!(client.get_balance(&requester), balance_before - 3);

    client.cancel_task(&requester, &id);

    // Refunded
    assert_eq!(client.get_balance(&requester), balance_before);
    assert_eq!(client.get_task(&id).status, TaskStatus::Cancelled);
}

#[test]
fn test_dispute_task() {
    let (env, client, _, _, requester, provider) = setup();
    let id = make_task(&env, &client, &requester);
    client.claim_task(&provider, &id);

    client.dispute_task(&requester, &id);
    assert_eq!(client.get_task(&id).status, TaskStatus::Disputed);
}

#[test]
fn test_user_task_list() {
    let (env, client, _, _, requester, provider) = setup();
    let id = make_task(&env, &client, &requester);
    client.claim_task(&provider, &id);

    assert_eq!(client.get_user_tasks(&requester).len(), 1);
    assert_eq!(client.get_user_tasks(&provider).len(), 1);
}

#[test]
fn test_post_task_without_balance_fails() {
    let (env, client, _, _, _, provider) = setup();
    // provider has 0 credits
    let res = client.try_post_task(
        &provider,
        &String::from_str(&env, "Need help"),
        &String::from_str(&env, "desc"),
        &String::from_str(&env, "Dev"),
        &2u32,
        &604800u64,
    );
    assert!(res.is_err());
}

#[test]
fn test_requester_cannot_claim_own_task() {
    let (env, client, _, _, requester, _) = setup();
    let id = make_task(&env, &client, &requester);
    let res = client.try_claim_task(&requester, &id);
    assert!(res.is_err());
}

#[test]
fn test_zero_hours_fails() {
    let (env, client, _, _, requester, _) = setup();
    let res = client.try_post_task(
        &requester,
        &String::from_str(&env, "title"),
        &String::from_str(&env, "desc"),
        &String::from_str(&env, "cat"),
        &0u32,
        &604800u64,
    );
    assert!(res.is_err());
}
