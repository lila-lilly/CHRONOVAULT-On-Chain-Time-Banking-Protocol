# ⏱ CHRONOVAULT — On-Chain Time Banking Protocol

> **One hour of any skill = one TIME credit. Contribute, earn, repeat.**

[![CI/CD](https://github.com/lila-lilly/CHRONOVAULT-On-Chain-Time-Banking-Protocol/actions/workflows/ci.yml/badge.svg)](https://github.com/lila-lilly/CHRONOVAULT-On-Chain-Time-Banking-Protocol/actions)
[![Stellar Testnet](https://img.shields.io/badge/Stellar-Testnet-3B82F6?logo=stellar)](https://stellar.expert/explorer/testnet)
[![License: MIT](https://img.shields.io/badge/License-MIT-D4A843.svg)](LICENSE)
[![Live Demo](https://img.shields.io/badge/Live-Demo-22D3EE)](https://chronovault-on-chain-time-banking-p.vercel.app/)

---

## 🔗 Live Demo & Video Pitch

- **🌐 Live Platform**: [chronovault-on-chain-time-banking-p.vercel.app](https://chronovault-on-chain-time-banking-p.vercel.app/)
- **🎥 Demo Video**: [Watch the Demo on Google Drive](https://drive.google.com/file/d/10kqwr4ZqTU2JcF2iZX3gRfh_xBseblYb/view?usp=sharing)

---

## 🕰 What is ChronoVault?

ChronoVault is a **decentralized time banking protocol** built on Stellar Soroban. Inspired by the global time banking movement — where communities exchange services using time as the unit of value — ChronoVault brings this model fully on-chain.

**The core idea:** 1 hour of your Rust expertise equals 1 hour of UI design, which equals 1 hour of copywriting. Skills are equal. Your `TIME` credits can be earned by helping others and spent to get help yourself. Your contribution history is public, permanent, and verified by smart contracts.

### Why ChronoVault stands out

| Feature | ChronoVault | Typical DeFi Protocol |
|---|---|---|
| Domain | Time economy / community | Token yield farming |
| Inter-contract calls | ✅ Bank → Ledger on completion | ❌ |
| Credit earning | ✅ Earned by contributing | ❌ Simple deposit |
| Task lifecycle | ✅ 6-state machine with escrow | ❌ |
| Community score | ✅ Give/take ratio algorithm | ❌ |
| Social mechanics | ✅ Claim, submit, confirm, dispute | ❌ |

---

## 🌟 Key Features

1. **⏳ TIME Credit Economy** — `1 hour = 1 TIME`. Post tasks, escrow credits, pay contributors upon completion
2. **🔗 Dual Smart Contracts** — `TimeBank` handles the task economy; `CommunityLedger` tracks contribution history via inter-contract calls
3. **🔐 Real Wallet Integration** — Full Freighter wallet connection with live on-chain balance, auto-reconnect on page load, and cryptographic signing on the Stellar Testnet
4. **📋 6-State Task Machine** — Open → Claimed → Submitted → Completed (with Cancel & Dispute branches), all enforced on-chain
5. **🏅 Community Standings** — 6-tier reputation system (Seedling → Elder) calculated from give/take ratios
6. **💎 Premium UI** — Midnight Clockwork design with animated SVG clock, blueprint grid, glassmorphism, gold accents, and smooth micro-animations. Fully mobile responsive

---

## 📸 Platform Gallery & Submission Requirements

### Main UI
<img src="images/product ui.png" width="100%" alt="ChronoVault Main Interface" />

### Profile & Community Standing
<img src="images/product profile.png" width="100%" alt="Profile and Community Standing" />

### Mobile Responsive UI
<img src="images/mobile UI.png" width="100%" alt="Mobile Responsive UI" />

### CI/CD Pipeline Running
<img src="images/ci cd.png" width="100%" alt="GitHub Actions CI/CD Pipeline" />

### Test Output (9+ Passing Tests)
<img src="images/test output.png" width="100%" alt="Smart Contract Test Output" />

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

## 🔗 Deployed Contracts (Stellar Testnet)

| Contract | Address |
|---|---|
| **TimeBank** | `CDTHOHTPANEA5IODFI2C7TXGAPDLURCBZNB7MEOITBLXJNY2VAM2XAZO` |
| **CommunityLedger** | `CASUHYOA2PPKPIBAL7VI24Q76XOTXCLGTWYPYL3J7N5L4HDN6AC7QBDE` |

**Example Transaction Hash (contract interaction):**
[`a0995b06fdaf2ffa0b7f81c51dd3217e9907d7e389fa811a4e8d97a205c87718`](https://stellar.expert/explorer/testnet/tx/a0995b06fdaf2ffa0b7f81c51dd3217e9907d7e389fa811a4e8d97a205c87718)

→ [View on Stellar Expert Testnet Explorer](https://stellar.expert/explorer/testnet)

---

## 📜 Smart Contracts

### `time-bank` — The Exchange Engine

| Function | Description |
|---|---|
| `initialize(admin, ledger)` | One-time setup, registers admin and ledger cross-reference |
| `post_task(requester, title, desc, category, hours, deadline)` | Post task; **escrows TIME credits** |
| `claim_task(provider, task_id)` | Provider claims the task |
| `submit_work(provider, task_id)` | Mark work as done, moves to review |
| `confirm_completion(requester, task_id)` | Confirm + **transfer credits + inter-contract call** |
| `cancel_task(requester, task_id)` | Cancel Open task; **refunds escrow** |
| `dispute_task(caller, task_id)` | Raise dispute on a task |
| `mint(admin, recipient, amount)` | Bootstrap/faucet member credits |
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
# Prerequisites: Rust + wasm target
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup target add wasm32-unknown-unknown

# Soroban CLI
cargo install stellar-cli --features opt

# Clone and run frontend
git clone https://github.com/lila-lilly/CHRONOVAULT-On-Chain-Time-Banking-Protocol
cd CHRONOVAULT-On-Chain-Time-Banking-Protocol/frontend
npm install
npm run dev
```

### Run Smart Contract Tests

```bash
cd contracts
cargo test -p time-bank --features testutils -- --nocapture
cargo test -p community-ledger --features testutils -- --nocapture
```

---

## 📁 Project Structure

```
chronovault/
├── .github/workflows/ci.yml         # CI: test → build → deploy → vercel
├── contracts/
│   ├── time-bank/src/
│   │   ├── lib.rs                   # 6-state task machine, TIME escrow
│   │   └── test.rs                  # 9 unit tests
│   └── community-ledger/src/
│       ├── lib.rs                   # Give/take scoring, inter-contract receiver
│       └── test.rs                  # 9 unit tests
├── frontend/src/
│   ├── components/                  # ClockFace, StandingBadge, StatusPill, TaskCard, Nav
│   ├── pages/                       # Board, PostTask, MyTasks, Profile
│   ├── lib/                         # store.ts, contract.ts, constants
│   └── index.css                    # Midnight Clockwork design system
├── images/                          # Submission screenshots
└── README.md
```

---

## 🧪 Test Coverage

### Rust Tests — 18 total

**`time-bank`** (9 tests):
- `test_initialize` — contract init and admin registration
- `test_mint_increases_balance_and_supply` — minting increments balances
- `test_post_task_escrows_credits` — TIME locked on post
- `test_claim_task` — provider claims open task
- `test_submit_work` — provider submits for review
- `test_full_task_lifecycle_transfers_credits` — end-to-end credit transfer
- `test_cancel_open_task_refunds_credits` — escrow refund on cancel
- `test_dispute_task` — dispute state transition
- `test_user_task_list` — per-user task index

**`community-ledger`** (9 tests):
- `test_initialize`
- `test_record_contribution_creates_profile`
- `test_record_consumption_updates_requester`
- `test_score_increases_with_contributions`
- `test_standing_progression` — all 6 tier boundaries
- `test_give_ratio_bonus_rewards_givers`
- `test_score_never_negative`
- `test_contribution_log_recorded`
- `test_multiple_contributions_accumulate`

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
- **Task cards** — gold hover glow with smooth lift animations

---

## 🔄 CI/CD Pipeline

```
push to main
    │
    ├── 🦀 contract-tests
    │   ├── cargo test time-bank (9 tests)
    │   ├── cargo test community-ledger (9 tests)
    │   └── wasm build + optimize
    │
    ├── ⚡ frontend-lint
    │   ├── eslint (strict)
    │   └── vite build
    │
    └── 🚀 deploy (main only)
        ├── Deploy CommunityLedger → testnet
        ├── Deploy TimeBank → testnet
        ├── Initialize (cross-references contracts)
        ├── Mint starter credits to deployer
        └── vercel --prod
```

---

## ✅ Submission Checklist

- [x] Public GitHub repository
- [x] README with complete documentation
- [x] 10+ meaningful commits
- [x] Live demo on Vercel
- [x] Contract deployment addresses (TimeBank + CommunityLedger)
- [x] Transaction hash for on-chain interaction
- [x] Screenshot: Mobile responsive UI
- [x] Screenshot: CI/CD pipeline running
- [x] Screenshot: Test output (9+ passing tests)
- [x] Demo video link (Google Drive)

---

## 📄 License

MIT © 2025 ChronoVault

---

*Built for the Stellar Hackathon.*  
*"Time is the only truly equal currency."*
