# ⏱ CHRONOVAULT — On-Chain Time Banking Protocol

ChronoVault is a decentralized time banking protocol built on Stellar (Soroban). Users post tasks, escrow TIME credits, and transfer them upon completion — all enforced on-chain. 1 hour of any skill = 1 TIME credit. Contribute, earn, repeat.

## 🔗 Live Demo & Video Pitch
- **Live Platform**: [chronovault-on-chain-time-banking-p.vercel.app](https://chronovault-on-chain-time-banking-p.vercel.app/)
- **Demo Video**: [Watch the Demo on Google Drive](https://drive.google.com/file/d/10kqwr4ZqTU2JcF2iZX3gRfh_xBseblYb/view?usp=sharing)

## 🌟 Key Features

1. **TIME Credit Economy**: 1 hour of any skill = 1 TIME. Post tasks, escrow credits, pay contributors on completion.
2. **Dual Smart Contracts**: `TimeBank` handles the task economy; `CommunityLedger` tracks contributions via inter-contract calls.
3. **Real Wallet Integration**: Full Freighter wallet support with live on-chain balance and cryptographic transaction signing on Stellar Testnet.
4. **6-State Task Machine**: Open → Claimed → Submitted → Completed (with Cancel & Dispute branches), all enforced on-chain.

## 🔗 Deployed Contracts
- **TimeBank**: `CDTHOHTPANEA5IODFI2C7TXGAPDLURCBZNB7MEOITBLXJNY2VAM2XAZO`
- **CommunityLedger**: `CASUHYOA2PPKPIBAL7VI24Q76XOTXCLGTWYPYL3J7N5L4HDN6AC7QBDE`
- **Transaction Hash**: [`a0995b06fdaf2ffa0b7f81c51dd3217e9907d7e389fa811a4e8d97a205c87718`](https://stellar.expert/explorer/testnet/tx/a0995b06fdaf2ffa0b7f81c51dd3217e9907d7e389fa811a4e8d97a205c87718)

---

## 📸 Platform Gallery & Submission Requirements

As per the submission checklist, here are the required screenshots demonstrating the platform's capabilities:

### 1. Mobile Responsive UI
The platform is fully responsive and optimized for mobile devices.
<img src="images/mobile UI.png" width="100%" alt="Mobile Responsive UI" />

### 2. CI/CD Pipeline Running
Automated GitHub Actions workflow running tests and deploying the frontend.
<img src="images/ci cd.png" width="100%" alt="CI/CD Pipeline" />

### 3. Test Output (9+ Passing Tests)
Comprehensive Rust integration tests validating the smart contract logic.
<img src="images/test output.png" width="100%" alt="Test Output" />

### 4. Platform UI
<img src="images/product ui.png" width="100%" alt="ChronoVault Main Interface" />

### 5. Profile & Community Standing
<img src="images/product profile.png" width="100%" alt="Profile Page" />

---

## 🛠️ Tech Stack & Architecture
- **Frontend**: React 18, TypeScript, Vite, Vanilla CSS (Glassmorphism / Midnight Clockwork UI)
- **Blockchain**: Stellar Network, Soroban Smart Contracts (Rust)
- **Wallet Integration**: `@creit.tech/stellar-wallets-kit`, `@stellar/stellar-sdk`
- **CI/CD**: GitHub Actions (automated testing & deployments)
- **Deployment**: Vercel

## 🚀 Setup & Deployment

**Run Locally**
```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm run dev
```

**Run Tests**
```bash
# Smart Contract Tests (Rust)
cd contracts
cargo test -p time-bank --features testutils
cargo test -p community-ledger --features testutils
```
