#!/usr/bin/env bash
# =============================================================================
# ChronoVault — Deploy to Stellar Testnet
# Usage: ./scripts/deploy.sh
# =============================================================================
set -euo pipefail

BLUE='\033[0;34m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
log()   { echo -e "${BLUE}[CHRONO]${NC} $*"; }
ok()    { echo -e "${GREEN}[  OK  ]${NC} $*"; }
warn()  { echo -e "${YELLOW}[ WARN ]${NC} $*"; }
error() { echo -e "${RED}[ERROR ]${NC} $*"; exit 1; }

log "ChronoVault — Stellar Testnet Deployment"
echo "=========================================="

command -v soroban >/dev/null 2>&1 || error "soroban CLI not found. Run: cargo install soroban-cli --features opt"
command -v cargo   >/dev/null 2>&1 || error "cargo not found. Install Rust: https://rustup.rs"
command -v jq      >/dev/null 2>&1 || error "jq not found."

log "Configuring testnet..."
soroban network add \
  --rpc-url https://soroban-testnet.stellar.org \
  --network-passphrase "Test SDF Network ; September 2015" \
  testnet 2>/dev/null || warn "already configured"

log "Setting up deployer keypair..."
soroban keys generate chrono-deployer --network testnet 2>/dev/null || warn "Key already exists"
DEPLOYER=$(soroban keys address chrono-deployer)
ok "Deployer: $DEPLOYER"

log "Funding via Friendbot..."
curl -sf "https://friendbot.stellar.org?addr=$DEPLOYER" > /dev/null || warn "May already be funded"
ok "Funded"

log "Building contracts..."
cd contracts
cargo build --target wasm32-unknown-unknown --release -p time-bank -p community-ledger
ok "Build complete"

log "Optimizing WASM..."
soroban contract optimize \
  --wasm target/wasm32-unknown-unknown/release/time_bank.wasm \
  --wasm-out target/wasm32-unknown-unknown/release/time_bank.optimized.wasm

soroban contract optimize \
  --wasm target/wasm32-unknown-unknown/release/community_ledger.wasm \
  --wasm-out target/wasm32-unknown-unknown/release/community_ledger.optimized.wasm
ok "Optimization complete"

log "Deploying CommunityLedger..."
LEDGER_ID=$(soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/community_ledger.optimized.wasm \
  --source chrono-deployer --network testnet)
ok "CommunityLedger: $LEDGER_ID"

log "Deploying TimeBank..."
BANK_ID=$(soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/time_bank.optimized.wasm \
  --source chrono-deployer --network testnet)
ok "TimeBank: $BANK_ID"

log "Initializing CommunityLedger..."
INIT_L=$(soroban contract invoke --id "$LEDGER_ID" \
  --source chrono-deployer --network testnet \
  -- initialize --admin "$DEPLOYER" --bank_address "$BANK_ID")
ok "Ledger initialized (tx: ${INIT_L:0:16}...)"

log "Initializing TimeBank..."
INIT_B=$(soroban contract invoke --id "$BANK_ID" \
  --source chrono-deployer --network testnet \
  -- initialize --admin "$DEPLOYER" --ledger_address "$LEDGER_ID")
ok "Bank initialized (tx: ${INIT_B:0:16}...)"

log "Minting starter TIME credits to deployer..."
soroban contract invoke --id "$BANK_ID" \
  --source chrono-deployer --network testnet \
  -- mint --admin "$DEPLOYER" --recipient "$DEPLOYER" --amount 100
ok "100 TIME minted to deployer"

cd ..
mkdir -p deployment
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

cat > frontend/.env.local << EOF
VITE_TIME_BANK_ID=$BANK_ID
VITE_COMMUNITY_LEDGER_ID=$LEDGER_ID
EOF

cat > deployment/testnet.json << EOF
{
  "network":          "testnet",
  "deployed_at":      "$TIMESTAMP",
  "deployer":         "$DEPLOYER",
  "time_bank":        "$BANK_ID",
  "community_ledger": "$LEDGER_ID",
  "bank_init_tx":     "$INIT_B",
  "ledger_init_tx":   "$INIT_L"
}
EOF

echo ""
echo "=========================================="
echo -e "${GREEN}✅ DEPLOYMENT COMPLETE${NC}"
echo "=========================================="
echo ""
echo "  TimeBank         : $BANK_ID"
echo "  CommunityLedger  : $LEDGER_ID"
echo ""
echo "  Explorer (Bank)  : https://stellar.expert/explorer/testnet/contract/$BANK_ID"
echo "  Explorer (Ledger): https://stellar.expert/explorer/testnet/contract/$LEDGER_ID"
echo ""
echo "  frontend/.env.local written."
echo "  Run: cd frontend && npm run dev"
echo ""
