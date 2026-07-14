#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env};

fn setup() -> (Env, CommunityLedgerClient<'static>, Address, Address) {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register_contract(None, CommunityLedger);
    let client      = CommunityLedgerClient::new(&env, &contract_id);
    let admin = Address::generate(&env);
    let bank  = Address::generate(&env);
    client.initialize(&admin, &bank);
    (env, client, admin, bank)
}

#[test]
fn test_initialize() {
    let (_, client, admin, _) = setup();
    assert_eq!(client.get_admin(), admin);
    assert_eq!(client.get_total_hours(), 0u64);
}

#[test]
fn test_record_contribution_creates_profile() {
    let (env, client, _, _) = setup();
    let provider  = Address::generate(&env);
    let requester = Address::generate(&env);

    client.record_contribution(&provider, &requester, &0u64, &4u32);

    let profile = client.get_member(&provider);
    assert_eq!(profile.hours_given, 4u64);
    assert_eq!(profile.tasks_given, 1u32);
    assert_eq!(client.get_total_hours(), 4u64);
}

#[test]
fn test_record_consumption_updates_requester() {
    let (env, client, _, _) = setup();
    let provider  = Address::generate(&env);
    let requester = Address::generate(&env);

    client.record_contribution(&provider, &requester, &0u64, &3u32);
    client.record_consumption(&requester, &3u32);

    let profile = client.get_member(&requester);
    assert_eq!(profile.hours_taken, 3u64);
    assert_eq!(profile.tasks_taken, 1u32);
}

#[test]
fn test_score_increases_with_contributions() {
    let (env, client, _, _) = setup();
    let provider  = Address::generate(&env);
    let requester = Address::generate(&env);

    client.record_contribution(&provider, &requester, &0u64, &2u32);
    let score_after_1 = client.get_member(&provider).community_score;

    client.record_contribution(&provider, &requester, &1u64, &3u32);
    let score_after_2 = client.get_member(&provider).community_score;

    assert!(score_after_2 > score_after_1);
}

#[test]
fn test_standing_progression() {
    assert_eq!(CommunityLedger::score_to_standing(0),    Standing::Seedling);
    assert_eq!(CommunityLedger::score_to_standing(99),   Standing::Seedling);
    assert_eq!(CommunityLedger::score_to_standing(100),  Standing::Grower);
    assert_eq!(CommunityLedger::score_to_standing(250),  Standing::Contributor);
    assert_eq!(CommunityLedger::score_to_standing(500),  Standing::Steward);
    assert_eq!(CommunityLedger::score_to_standing(800),  Standing::Pillar);
    assert_eq!(CommunityLedger::score_to_standing(1200), Standing::Elder);
    assert_eq!(CommunityLedger::score_to_standing(9999), Standing::Elder);
}

#[test]
fn test_give_ratio_bonus_rewards_givers() {
    // Pure giver: 10 given, 0 taken
    // score = 10*80 + 0*20 - 0*15 + min(10,20)*10 = 800 + 0 + 100 = 900
    let score_giver = CommunityLedger::calc_score(10, 0, 0);
    // Balanced: 5 given, 5 taken
    // score = 5*80 + 0*20 - 5*15 + min(0,20)*10 = 400 - 75 + 0 = 325
    let score_balanced = CommunityLedger::calc_score(5, 5, 0);
    // Taker: 1 given, 9 taken
    // score = 1*80 - 9*15 - min(8,10)*8 = 80 - 135 - 64 → 0 (floor)
    let score_taker = CommunityLedger::calc_score(1, 9, 0);

    assert!(score_giver > score_balanced);
    assert!(score_balanced > score_taker);
    assert_eq!(score_taker, 0); // floor at 0
}

#[test]
fn test_score_never_negative() {
    // 0 given, 100 taken → floored at 0
    let score = CommunityLedger::calc_score(0, 100, 0);
    assert_eq!(score, 0u64);
}

#[test]
fn test_contribution_log_recorded() {
    let (env, client, _, _) = setup();
    let provider  = Address::generate(&env);
    let requester = Address::generate(&env);

    client.record_contribution(&provider, &requester, &42u64, &5u32);

    let log = client.get_contribution_log(&42u64);
    assert_eq!(log.task_id, 42u64);
    assert_eq!(log.hours, 5u32);
    assert_eq!(log.provider, provider);
    assert_eq!(log.requester, requester);
}

#[test]
fn test_multiple_contributions_accumulate() {
    let (env, client, _, _) = setup();
    let provider  = Address::generate(&env);
    let requester = Address::generate(&env);

    client.record_contribution(&provider, &requester, &0u64, &2u32);
    client.record_contribution(&provider, &requester, &1u64, &3u32);
    client.record_contribution(&provider, &requester, &2u64, &1u32);

    let profile = client.get_member(&provider);
    assert_eq!(profile.hours_given, 6u64);
    assert_eq!(profile.tasks_given, 3u32);
    assert_eq!(client.get_total_hours(), 6u64);
}
