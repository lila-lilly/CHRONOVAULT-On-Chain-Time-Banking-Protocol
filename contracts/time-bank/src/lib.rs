#![no_std]

use soroban_sdk::{
    contract, contractclient, contractimpl, contracttype, log, symbol_short, vec, Address, Env,
    String, Symbol, Vec,
};

// ─── Inter-Contract Interface ─────────────────────────────────────────────────
// TimeBank calls CommunityLedger when tasks complete or when credits are minted

#[contractclient(name = "CommunityLedgerClient")]
pub trait CommunityLedgerInterface {
    fn record_contribution(
        env: Env,
        provider: Address,
        requester: Address,
        task_id: u64,
        hours: u32,
    );
    fn record_consumption(env: Env, requester: Address, hours: u32);
}

// ─── Storage Keys ────────────────────────────────────────────────────────────

const ADMIN: Symbol = symbol_short!("ADMIN");
const LEDGER: Symbol = symbol_short!("LEDGER");
const NEXT_ID: Symbol = symbol_short!("NEXT_ID");
const SUPPLY: Symbol = symbol_short!("SUPPLY");

#[contracttype]
pub enum DataKey {
    Task(u64),
    UserTasks(Address),
    Balance(Address),
    TotalMembers,
}

// ─── Task Status ─────────────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub enum TaskStatus {
    Open,      // Posted, seeking a provider
    Claimed,   // Provider claimed it, work in progress
    Submitted, // Provider marked done, awaiting requester confirmation
    Completed, // Requester confirmed → TIME credits transferred + ledger updated
    Cancelled, // Cancelled before claim
    Disputed,  // Under dispute
}

// ─── Task ─────────────────────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone, Debug)]
pub struct Task {
    pub id: u64,
    pub requester: Address, // Who needs help
    pub provider: Address,  // Who will help (set on claim)
    pub title: String,
    pub description: String,
    pub category: String,
    pub hours: u32, // TIME credits offered (1 hour = 1 credit)
    pub deadline: u64,
    pub status: TaskStatus,
    pub created_at: u64,
    pub completed_at: u64,
}

// ─── Events ──────────────────────────────────────────────────────────────────

const EV_POSTED: Symbol = symbol_short!("POSTED");
const EV_CLAIMED: Symbol = symbol_short!("CLAIMED");
const EV_SUBMITTED: Symbol = symbol_short!("SUBMITTED");
const EV_COMPLETED: Symbol = symbol_short!("COMPLETED");
const EV_CANCELLED: Symbol = symbol_short!("CANCELLED");
const EV_DISPUTED: Symbol = symbol_short!("DISPUTED");
const EV_MINTED: Symbol = symbol_short!("MINTED");

// ─── Contract ────────────────────────────────────────────────────────────────

#[contract]
pub struct TimeBank;

#[contractimpl]
impl TimeBank {
    /// Initialize the time bank
    pub fn initialize(env: Env, admin: Address, ledger_address: Address) {
        if env.storage().instance().has(&ADMIN) {
            panic!("already initialized");
        }
        admin.require_auth();
        env.storage().instance().set(&ADMIN, &admin);
        env.storage().instance().set(&LEDGER, &ledger_address);
        env.storage().instance().set(&NEXT_ID, &0u64);
        env.storage().instance().set(&SUPPLY, &0u64);
        env.storage().instance().set(&DataKey::TotalMembers, &0u32);
    }

    /// Post a task offering TIME credits in exchange for help
    pub fn post_task(
        env: Env,
        requester: Address,
        title: String,
        description: String,
        category: String,
        hours: u32,
        deadline_offset: u64,
    ) -> u64 {
        requester.require_auth();

        if hours == 0 || hours > 40 {
            panic!("hours must be between 1 and 40");
        }
        if title.len() == 0 {
            panic!("title required");
        }

        // Requester must have enough TIME credits to pay
        let balance = Self::get_balance_inner(&env, &requester);
        if balance < hours as u64 {
            panic!("insufficient TIME balance");
        }

        // Reserve (escrow) the credits
        Self::set_balance(&env, &requester, balance - hours as u64);

        let id: u64 = env.storage().instance().get(&NEXT_ID).unwrap_or(0u64);
        let now = env.ledger().timestamp();

        // Dummy provider address (unfilled)
        let empty_provider = env.current_contract_address();

        let task = Task {
            id,
            requester: requester.clone(),
            provider: empty_provider,
            title: title.clone(),
            description,
            category: category.clone(),
            hours,
            deadline: now + deadline_offset,
            status: TaskStatus::Open,
            created_at: now,
            completed_at: 0,
        };

        env.storage().persistent().set(&DataKey::Task(id), &task);
        Self::push_user_task(&env, &requester, id);
        env.storage().instance().set(&NEXT_ID, &(id + 1));

        env.events()
            .publish((EV_POSTED, requester.clone()), (id, title, hours));
        log!(
            &env,
            "Task {} posted by {} for {} hours",
            id,
            requester,
            hours
        );
        id
    }

    /// Provider claims an open task
    pub fn claim_task(env: Env, provider: Address, task_id: u64) {
        provider.require_auth();

        let mut task: Task = Self::get_task_inner(&env, task_id);

        if task.status != TaskStatus::Open {
            panic!("task not open");
        }
        if task.requester == provider {
            panic!("cannot claim your own task");
        }
        if env.ledger().timestamp() > task.deadline {
            panic!("task deadline passed");
        }

        // Register provider if new member
        Self::ensure_member(&env, &provider);

        task.provider = provider.clone();
        task.status = TaskStatus::Claimed;
        env.storage()
            .persistent()
            .set(&DataKey::Task(task_id), &task);
        Self::push_user_task(&env, &provider, task_id);

        env.events()
            .publish((EV_CLAIMED, provider.clone()), (task_id,));
        log!(&env, "Task {} claimed by {}", task_id, provider);
    }

    /// Provider submits work for review
    pub fn submit_work(env: Env, provider: Address, task_id: u64) {
        provider.require_auth();

        let mut task: Task = Self::get_task_inner(&env, task_id);

        if task.provider != provider {
            panic!("not the task provider");
        }
        if task.status != TaskStatus::Claimed {
            panic!("task not in Claimed state");
        }

        task.status = TaskStatus::Submitted;
        env.storage()
            .persistent()
            .set(&DataKey::Task(task_id), &task);

        env.events()
            .publish((EV_SUBMITTED, provider.clone()), (task_id,));
    }

    /// Requester confirms work and releases TIME credits to provider
    pub fn confirm_completion(env: Env, requester: Address, task_id: u64) {
        requester.require_auth();

        let mut task: Task = Self::get_task_inner(&env, task_id);

        if task.requester != requester {
            panic!("not the requester");
        }
        if task.status != TaskStatus::Submitted {
            panic!("work not yet submitted");
        }

        let now = env.ledger().timestamp();
        task.status = TaskStatus::Completed;
        task.completed_at = now;

        // Transfer TIME credits to provider
        let provider_bal = Self::get_balance_inner(&env, &task.provider);
        Self::set_balance(&env, &task.provider, provider_bal + task.hours as u64);

        // Mint new TIME credits = net contribution to the ecosystem
        let new_supply: u64 = env.storage().instance().get(&SUPPLY).unwrap_or(0u64);
        env.storage()
            .instance()
            .set(&SUPPLY, &(new_supply + task.hours as u64));

        env.storage()
            .persistent()
            .set(&DataKey::Task(task_id), &task);

        // ── Inter-Contract Call → CommunityLedger ────────────────────────────
        let ledger_addr: Address = env.storage().instance().get(&LEDGER).unwrap();
        let ledger = CommunityLedgerClient::new(&env, &ledger_addr);
        ledger.record_contribution(&task.provider, &requester, &task_id, &task.hours);
        ledger.record_consumption(&requester, &task.hours);
        // ─────────────────────────────────────────────────────────────────────

        env.events().publish(
            (EV_COMPLETED, requester.clone()),
            (task_id, task.provider.clone(), task.hours),
        );
        env.events()
            .publish((EV_MINTED, task.provider.clone()), (task.hours,));

        log!(
            &env,
            "Task {} completed. {} TIME minted to provider",
            task_id,
            task.hours
        );
    }

    /// Cancel an Open task — refund escrowed credits
    pub fn cancel_task(env: Env, requester: Address, task_id: u64) {
        requester.require_auth();

        let mut task: Task = Self::get_task_inner(&env, task_id);

        if task.requester != requester {
            panic!("only requester can cancel");
        }
        if task.status != TaskStatus::Open {
            panic!("can only cancel Open tasks");
        }

        // Refund escrowed credits
        let balance = Self::get_balance_inner(&env, &requester);
        Self::set_balance(&env, &requester, balance + task.hours as u64);

        task.status = TaskStatus::Cancelled;
        env.storage()
            .persistent()
            .set(&DataKey::Task(task_id), &task);

        env.events()
            .publish((EV_CANCELLED, requester.clone()), (task_id,));
    }

    /// Raise a dispute on a Claimed or Submitted task
    pub fn dispute_task(env: Env, caller: Address, task_id: u64) {
        caller.require_auth();

        let mut task: Task = Self::get_task_inner(&env, task_id);

        if caller != task.requester && caller != task.provider {
            panic!("not a party to this task");
        }
        if task.status != TaskStatus::Claimed && task.status != TaskStatus::Submitted {
            panic!("cannot dispute at this stage");
        }

        task.status = TaskStatus::Disputed;
        env.storage()
            .persistent()
            .set(&DataKey::Task(task_id), &task);

        env.events()
            .publish((EV_DISPUTED, caller.clone()), (task_id,));
    }

    /// Admin mints initial TIME credits to bootstrap members
    pub fn mint(env: Env, admin: Address, recipient: Address, amount: u64) {
        admin.require_auth();
        let stored_admin: Address = env.storage().instance().get(&ADMIN).unwrap();
        if admin != stored_admin {
            panic!("not admin");
        }

        Self::ensure_member(&env, &recipient);
        let balance = Self::get_balance_inner(&env, &recipient);
        Self::set_balance(&env, &recipient, balance + amount);

        let supply: u64 = env.storage().instance().get(&SUPPLY).unwrap_or(0u64);
        env.storage().instance().set(&SUPPLY, &(supply + amount));

        env.events()
            .publish((EV_MINTED, recipient.clone()), (amount,));
    }

    // ─── Internal helpers ─────────────────────────────────────────────────────

    fn get_balance_inner(env: &Env, user: &Address) -> u64 {
        env.storage()
            .persistent()
            .get(&DataKey::Balance(user.clone()))
            .unwrap_or(0u64)
    }

    fn set_balance(env: &Env, user: &Address, amount: u64) {
        env.storage()
            .persistent()
            .set(&DataKey::Balance(user.clone()), &amount);
    }

    fn ensure_member(env: &Env, user: &Address) {
        if !env
            .storage()
            .persistent()
            .has(&DataKey::Balance(user.clone()))
        {
            Self::set_balance(env, user, 0u64);
            let total: u32 = env
                .storage()
                .instance()
                .get(&DataKey::TotalMembers)
                .unwrap_or(0u32);
            env.storage()
                .instance()
                .set(&DataKey::TotalMembers, &(total + 1));
        }
    }

    fn push_user_task(env: &Env, user: &Address, task_id: u64) {
        let mut list: Vec<u64> = env
            .storage()
            .persistent()
            .get(&DataKey::UserTasks(user.clone()))
            .unwrap_or(vec![env]);
        list.push_back(task_id);
        env.storage()
            .persistent()
            .set(&DataKey::UserTasks(user.clone()), &list);
    }

    fn get_task_inner(env: &Env, task_id: u64) -> Task {
        env.storage()
            .persistent()
            .get(&DataKey::Task(task_id))
            .expect("task not found")
    }

    // ─── Query Methods ────────────────────────────────────────────────────────

    pub fn get_task(env: Env, task_id: u64) -> Task {
        Self::get_task_inner(&env, task_id)
    }

    pub fn get_balance(env: Env, user: Address) -> u64 {
        Self::get_balance_inner(&env, &user)
    }

    pub fn get_user_tasks(env: Env, user: Address) -> Vec<Task> {
        let ids: Vec<u64> = env
            .storage()
            .persistent()
            .get(&DataKey::UserTasks(user.clone()))
            .unwrap_or(vec![&env]);
        let mut result: Vec<Task> = vec![&env];
        for id in ids.iter() {
            if let Some(t) = env.storage().persistent().get(&DataKey::Task(id)) {
                result.push_back(t);
            }
        }
        result
    }

    pub fn get_total_tasks(env: Env) -> u64 {
        env.storage().instance().get(&NEXT_ID).unwrap_or(0u64)
    }

    pub fn get_total_supply(env: Env) -> u64 {
        env.storage().instance().get(&SUPPLY).unwrap_or(0u64)
    }

    pub fn get_total_members(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::TotalMembers)
            .unwrap_or(0u32)
    }

    pub fn get_admin(env: Env) -> Address {
        env.storage().instance().get(&ADMIN).unwrap()
    }
}

mod test;
