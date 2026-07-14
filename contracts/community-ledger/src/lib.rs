#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype,
    symbol_short, vec,
    Address, Env, Symbol, Vec,
    log,
};

// ─── Storage Keys ────────────────────────────────────────────────────────────

const ADMIN:       Symbol = symbol_short!("ADMIN");
const BANK:        Symbol = symbol_short!("BANK");
const TOTAL_HOURS: Symbol = symbol_short!("TOTALHRS");

#[contracttype]
pub enum DataKey {
    Member(Address),
    Contribution(u64),
    TopContributors,
}

// ─── Member Standing ─────────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub enum Standing {
    Seedling,    // score 0–99   — new to the community
    Grower,      // score 100–249
    Contributor, // score 250–499
    Steward,     // score 500–799
    Pillar,      // score 800–1199
    Elder,       // score 1200+
}

// ─── Member Profile ───────────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone, Debug)]
pub struct MemberProfile {
    pub member:         Address,
    pub hours_given:    u64,    // total hours contributed to community
    pub hours_taken:    u64,    // total hours consumed from community
    pub tasks_given:    u32,    // number of tasks completed as provider
    pub tasks_taken:    u32,    // number of tasks completed as requester
    pub community_score:u64,
    pub standing:       Standing,
    pub joined_at:      u64,
    pub last_active:    u64,
}

// ─── Contribution Log ─────────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone, Debug)]
pub struct ContributionLog {
    pub task_id:   u64,
    pub provider:  Address,
    pub requester: Address,
    pub hours:     u32,
    pub timestamp: u64,
}

// ─── Events ──────────────────────────────────────────────────────────────────

const EV_CONTRIBUTED: Symbol = symbol_short!("CONTRIB");
const EV_STANDING_UP: Symbol = symbol_short!("STANDUP");

// ─── Contract ────────────────────────────────────────────────────────────────

#[contract]
pub struct CommunityLedger;

#[contractimpl]
impl CommunityLedger {

    pub fn initialize(env: Env, admin: Address, bank_address: Address) {
        if env.storage().instance().has(&ADMIN) {
            panic!("already initialized");
        }
        admin.require_auth();
        env.storage().instance().set(&ADMIN, &admin);
        env.storage().instance().set(&BANK,  &bank_address);
        env.storage().instance().set(&TOTAL_HOURS, &0u64);
    }

    /// Called by TimeBank when a task completes — records provider contribution
    /// and requester consumption, then recomputes both scores.
    pub fn record_contribution(
        env:       Env,
        provider:  Address,
        requester: Address,
        task_id:   u64,
        hours:     u32,
    ) {
        // Only the registered TimeBank may call this
        let bank: Address = env.storage().instance().get(&BANK).unwrap();
        bank.require_auth();

        let now = env.ledger().timestamp();

        // Log the contribution
        let log_entry = ContributionLog {
            task_id,
            provider:  provider.clone(),
            requester: requester.clone(),
            hours,
            timestamp: now,
        };
        env.storage().persistent().set(&DataKey::Contribution(task_id), &log_entry);

        // Update provider profile (gave hours)
        let mut prov = Self::load_or_create(&env, &provider, now);
        let old_standing = prov.standing.clone();
        prov.hours_given += hours as u64;
        prov.tasks_given += 1;
        prov.last_active  = now;
        prov.community_score = Self::calc_score(prov.hours_given, prov.hours_taken, prov.tasks_given);
        prov.standing = Self::score_to_standing(prov.community_score);

        if prov.standing != old_standing {
            env.events().publish((EV_STANDING_UP, provider.clone()), (prov.community_score,));
        }
        env.storage().persistent().set(&DataKey::Member(provider.clone()), &prov);

        // Update total hours counter
        let total: u64 = env.storage().instance().get(&TOTAL_HOURS).unwrap_or(0u64);
        env.storage().instance().set(&TOTAL_HOURS, &(total + hours as u64));

        env.events().publish(
            (EV_CONTRIBUTED, provider.clone()),
            (task_id, hours),
        );

        log!(&env, "Contribution recorded: task={} provider={} hours={}", task_id, provider, hours);
    }

    /// Called by TimeBank when a requester's task is fulfilled — records consumption
    pub fn record_consumption(env: Env, requester: Address, hours: u32) {
        let bank: Address = env.storage().instance().get(&BANK).unwrap();
        bank.require_auth();

        let now = env.ledger().timestamp();
        let mut profile = Self::load_or_create(&env, &requester, now);
        let old_standing = profile.standing.clone();

        profile.hours_taken += hours as u64;
        profile.tasks_taken += 1;
        profile.last_active  = now;
        profile.community_score = Self::calc_score(
            profile.hours_given, profile.hours_taken, profile.tasks_given
        );
        profile.standing = Self::score_to_standing(profile.community_score);

        if profile.standing != old_standing {
            env.events().publish((EV_STANDING_UP, requester.clone()), (profile.community_score,));
        }

        env.storage().persistent().set(&DataKey::Member(requester.clone()), &profile);
    }

    // ─── Scoring Algorithm ────────────────────────────────────────────────────
    //
    // community_score = (hours_given × 80)
    //                 + (tasks_given  × 20)          ← task diversity bonus
    //                 − (hours_taken  × 15)           ← modest cost for consuming
    //                 + give_ratio_bonus(given, taken) ← rewards balanced members
    //
    // give_ratio_bonus:
    //   if given >= taken  → bonus = min(given - taken, 20) × 10  (max +200)
    //   else               → penalty = min(taken - given, 10) × 8 (max −80)

    fn calc_score(hours_given: u64, hours_taken: u64, tasks_given: u32) -> u64 {
        let base = hours_given * 80 + tasks_given as u64 * 20;
        let cost = hours_taken * 15;

        let ratio_adj: i64 = if hours_given >= hours_taken {
            (hours_given.saturating_sub(hours_taken)).min(20) as i64 * 10
        } else {
            -((hours_taken.saturating_sub(hours_given)).min(10) as i64 * 8)
        };

        let raw = base as i64 - cost as i64 + ratio_adj;
        raw.max(0) as u64
    }

    fn score_to_standing(score: u64) -> Standing {
        match score {
            0..=99    => Standing::Seedling,
            100..=249 => Standing::Grower,
            250..=499 => Standing::Contributor,
            500..=799 => Standing::Steward,
            800..=1199=> Standing::Pillar,
            _         => Standing::Elder,
        }
    }

    fn load_or_create(env: &Env, member: &Address, now: u64) -> MemberProfile {
        env.storage().persistent()
            .get(&DataKey::Member(member.clone()))
            .unwrap_or(MemberProfile {
                member:          member.clone(),
                hours_given:     0,
                hours_taken:     0,
                tasks_given:     0,
                tasks_taken:     0,
                community_score: 0,
                standing:        Standing::Seedling,
                joined_at:       now,
                last_active:     now,
            })
    }

    // ─── Query Methods ────────────────────────────────────────────────────────

    pub fn get_member(env: Env, member: Address) -> MemberProfile {
        let now = env.ledger().timestamp();
        Self::load_or_create(&env, &member, now)
    }

    pub fn get_contribution_log(env: Env, task_id: u64) -> ContributionLog {
        env.storage().persistent()
            .get(&DataKey::Contribution(task_id))
            .expect("contribution log not found")
    }

    pub fn get_total_hours(env: Env) -> u64 {
        env.storage().instance().get(&TOTAL_HOURS).unwrap_or(0u64)
    }

    pub fn get_admin(env: Env) -> Address {
        env.storage().instance().get(&ADMIN).unwrap()
    }
}

mod test;
