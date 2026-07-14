# ⏱ CHRONOVAULT — On-Chain Time Banking Protocol

> **One hour of any skill = one TIME credit. Contribute, earn, repeat.**

[![CI/CD](https://github.com/yourusername/chronovault/actions/workflows/ci.yml/badge.svg)](https://github.com/yourusername/chronovault/actions)
[![Stellar Testnet](https://img.shields.io/badge/Stellar-Testnet-3B82F6?logo=stellar)](https://stellar.expert/explorer/testnet)
[![License: MIT](https://img.shields.io/badge/License-MIT-D4A843.svg)](LICENSE)

---

## 🕰 What is ChronoVault?

ChronoVault is a **decentralized time banking protocol** built on Stellar Soroban. Inspired by the global time banking movement — where communities exchange services using time as the unit of value — ChronoVault brings this model on-chain.

**The core idea:** 1 hour of your Rust expertise equals 1 hour of UI design, which equals 1 hour of copywriting. Skills are equal. Your `TIME` credits can be earned by helping others and spent to get help yourself. Your contribution history is public, permanent, and verified by smart contracts.

### Why this stands out

| Feature | ChronoVault | Typical DeFi Vault |
|---|---|---|
| Domain | Time economy / community | Token yield farming |
| Inter-contract calls | ✅ Bank → Ledger on completion | ❌ |
| Credit minting logic | ✅ Earned by contributing | ❌ Simple deposit |
| Task lifecycle | ✅ 6-state machine with escrow | ❌ |
| Community score | ✅ Give/take ratio algorithm | ❌ |
| Social mechanics | ✅ Claim, submit, confirm, dispute | ❌ |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   CHRONOVAULT PROTOCOL                       │
│                                                             │
│  ┌──────────────────────────┐                               │
│  │       TimeBank            │  Inter-contract calls        │
│  │   (Soroban Contract)      │ ──────────────────────────►  │
│  │                           │                              │
│  │  post_task()              │  record_contribution()       │
│  │  claim_task()         ────┼──► record_consumption()      │
│  │  submit_work()            │                              │
│  │  confirm_completion() ────┼──►  ┌──────────────────────┐ │
│  │  cancel_task()            │     │  CommunityLedger     │ │
│  │  dispute_task()           │     │  (Soroban Contract)  │ │
│  │  mint()                   │     │                      │ │
│  │                           │     │  get_member()        │ │
│  │  [escrows TIME on post]   │     │  Standings:          │ │
│  │  [transfers on confirm]   │     │  Seedling → Elder    │ │
│  └──────────────────────────┘     └──────────────────────┘ │
│                                                             │
│  Task lifecycle:                                            │
│  Open → Claimed → Submitted → Completed                     │
│                └→ Disputed                                  │
│  Open → Cancelled                                           │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         React 18 + TypeScript Frontend               │   │
│  │  Board │ Post Task │ My Tasks │ Profile              │   │
│  │  Midnight blue · clockwork aesthetic · Zustand       │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📜 Smart Contracts

### `time-bank` — The Exchange Engine

| Function | Description |
|---|---|
| `initialize(admin, ledger)` | One-time setup |
| `post_task(requester, title, desc, category, hours, deadline)` | Post task; **escrows TIME credits** |
| `claim_task(provider, task_id)` | Provider claims the task |
| `submit_work(provider, task_id)` | Mark work as done |
| `confirm_completion(requester, task_id)` | Confirm + **transfer credits + inter-contract call** |
| `cancel_task(requester, task_id)` | Cancel Open task; **refunds escrow** |
| `dispute_task(caller, task_id)` | Raise dispute |
| `mint(admin, recipient, amount)` | Bootstrap member credits |
| `get_balance(user)` | TIME credit balance |
| `get_user_tasks(user)` | All tasks for an address |

**Task state machine:**
```
Open ──claim──► Claimed ──submit──► Submitted ──confirm──► Completed
  │               │                                         ↑ (inter-contract)
  └──cancel──► Cancelled  └──dispute──► Disputed
```

### `community-ledger` — The Trust Record

Called exclusively by `TimeBank` via **inter-contract communication**.

| Function | Caller | Description |
|---|---|---|
| `record_contribution(provider, requester, task_id, hours)` | TimeBank | Awards points, logs contribution |
| `record_consumption(requester, hours)` | TimeBank | Adjusts requester score |
| `get_member(address)` | Anyone | Full member profile |
| `get_contribution_log(task_id)` | Anyone | Contribution entry for a task |

**Community Score Algorithm:**
```
score = (hours_given × 80)
      + (tasks_given × 20)            ← diversity bonus
      − (hours_taken × 15)            ← consumption cost
      + give_surplus_bonus             ← min(surplus, 20) × 10, max +200
      − take_deficit_penalty           ← min(deficit, 10) × 8, max −80

score = max(0, score)                 ← floor at 0
```

**Standing Tiers:**
| Standing | Score | Glyph |
|---|---|---|
| Seedling | 0–99 | ◌ |
| Grower | 100–249 | ◎ |
| Contributor | 250–499 | ◉ |
| Steward | 500–799 | ⊛ |
| Pillar | 800–1199 | ✦ |
| Elder | 1200+ | ✸ |

---

## 🚀 Quick Start

```bash
# Rust + wasm target
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup target add wasm32-unknown-unknown

# Soroban CLI
cargo install soroban-cli --features opt

# Frontend
cd frontend && npm install && npm run dev
```

### One-command testnet deploy

```bash
chmod +x scripts/deploy.sh && ./scripts/deploy.sh
```

### Run tests

```bash
# Rust tests
cd contracts && cargo test --features testutils -- --nocapture

# Frontend tests
cd frontend && npm test
```

---

## 📁 Project Structure

```
chronovault/
├── .github/workflows/ci.yml         # CI: test → build → deploy → vercel
├── contracts/
│   ├── Cargo.toml
│   ├── time-bank/src/
│   │   ├── lib.rs                   # 6-state task machine, TIME escrow
│   │   └── test.rs                  # 12 unit tests
│   └── community-ledger/src/
│       ├── lib.rs                   # Give/take scoring, inter-contract receiver
│       └── test.rs                  # 9 unit tests
├── frontend/src/
│   ├── components/                  # ClockFace, StandingBadge, StatusPill, TaskCard, Nav
│   ├── pages/                       # Board, PostTask, MyTasks, Profile
│   ├── lib/                         # store, constants, mockData
│   ├── styles/globals.css           # Midnight blue clockwork aesthetic
│   └── test/chronovault.test.tsx    # 35+ Vitest test cases
├── scripts/deploy.sh
└── README.md
```

---

## 🧪 Test Coverage

### Rust Tests — 21 total

**`time-bank`** (12 tests):
- `test_initialize`
- `test_mint_increases_balance_and_supply`
- `test_post_task_escrows_credits`
- `test_claim_task`
- `test_submit_work`
- `test_full_task_lifecycle_transfers_credits`
- `test_cancel_open_task_refunds_credits`
- `test_dispute_task`
- `test_user_task_list`
- `test_post_task_without_balance_fails`
- `test_requester_cannot_claim_own_task`
- `test_zero_hours_fails`

**`community-ledger`** (9 tests):
- `test_initialize`
- `test_record_contribution_creates_profile`
- `test_record_consumption_updates_requester`
- `test_score_increases_with_contributions`
- `test_standing_progression` — all 6 boundaries
- `test_give_ratio_bonus_rewards_givers`
- `test_score_never_negative`
- `test_contribution_log_recorded`
- `test_multiple_contributions_accumulate`

### Frontend Tests (Vitest) — 35+ cases
- `truncAddr`, `timeAgo`, `formatDeadline` utilities
- `MOCK_TASKS` integrity (6 tests)
- `MOCK_PROFILES` sort order
- `STANDING_META` structure and ascending mins
- `TASK_STATUS_META` completeness
- Community score algorithm (8 tests)
- TIME credit escrow logic (7 tests)
- `StandingBadge` component (4 tests)
- `StatusPill` component (5 tests)

---

## 🎨 Design System — "Midnight Clockwork"

| Token | Value | Usage |
|---|---|---|
| `midnight` | `#080C14` | Page background |
| `deep` | `#0E1420` | Card fill |
| `gold` | `#D4A843` | TIME credits, CTAs, clock accents |
| `blue` | `#3B82F6` | Primary actions, grid lines |
| `cyan` | `#22D3EE` | In-progress states |
| `silver` | `#CBD5E1` | Primary text |

Signature elements:
- **Blueprint grid** — faint CSS grid lines across the entire page
- **Animated SVG clock** — live rotating hands in the logo and hero
- **Clock rings** — gold-bordered circles for credit amounts
- **Space Mono** — monospaced clock typography for TIME amounts
- **Task cards** — gold hover glow with `translateY(-1px)` lift

---

## 🔄 CI/CD Pipeline

```
push to main
    │
    ├── 🦀 contract-tests
    │   ├── cargo fmt + clippy
    │   ├── cargo test time-bank (12 tests)
    │   ├── cargo test community-ledger (9 tests)
    │   └── wasm build + optimize
    │
    ├── ⚡ frontend-tests
    │   ├── eslint
    │   ├── vitest (35+ tests)
    │   └── vite build
    │
    └── 🚀 deploy (main only)
        ├── Deploy CommunityLedger
        ├── Deploy TimeBank
        ├── Initialize (cross-references)
        ├── Mint starter credits
        └── vercel --prod
```

---

## 🔗 Deployed Contracts

| Contract | Address |
|---|---|
| TimeBank | `See deployment/testnet.json` |
| CommunityLedger | `See deployment/testnet.json` |

→ [Stellar Expert Testnet Explorer](https://stellar.expert/explorer/testnet)

---

## 📄 License

MIT © 2024 ChronoVault

---

*Built for the Stellar Hackathon — Level 3 Orange Belt.*  
*"Time is the only truly equal currency."*
