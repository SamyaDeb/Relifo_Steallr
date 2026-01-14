#!/bin/bash

# Relifo Contracts Deployment Script
# Deploys all 4 contracts to Stellar Testnet
# Admin Address: GBDD6IDWYK5XM77GYSPKW7BC2KY3D4DPNP3MFQVHZJ3BCWMHB3T7NDWT

set -e

echo "🚀 Relifo Contract Deployment"
echo "=============================="
echo ""

# Configuration
NETWORK="testnet"
ADMIN_ADDRESS="GBDD6IDWYK5XM77GYSPKW7BC2KY3D4DPNP3MFQVHZJ3BCWMHB3T7NDWT"

echo "Admin Address: $ADMIN_ADDRESS"
echo "Network: $NETWORK"
echo ""

# Check if admin account is funded
echo "💰 Checking admin account funding..."
curl -s "https://horizon-testnet.stellar.org/accounts/$ADMIN_ADDRESS" > /dev/null 2>&1 || {
    echo "⚠️  Admin account not found on testnet. Funding from friendbot..."
    curl -X POST "https://friendbot.stellar.org?addr=$ADMIN_ADDRESS" > /dev/null 2>&1
    sleep 3
    echo "✅ Account funded"
}
echo ""

# Build all contracts
echo "🔨 Building contracts..."
echo "  - ReliefVault (default)"
cargo build --release --target wasm32-unknown-unknown --quiet
cp target/wasm32-unknown-unknown/release/relifo_contracts.wasm target/wasm32-unknown-unknown/release/vault.wasm

echo "  - NGORegistry"
cargo build --release --target wasm32-unknown-unknown --features ngo --quiet
cp target/wasm32-unknown-unknown/release/relifo_contracts.wasm target/wasm32-unknown-unknown/release/ngo.wasm

echo "  - BeneficiaryRegistry"
cargo build --release --target wasm32-unknown-unknown --features beneficiary --quiet
cp target/wasm32-unknown-unknown/release/relifo_contracts.wasm target/wasm32-unknown-unknown/release/beneficiary.wasm

echo "  - MerchantRegistry"
cargo build --release --target wasm32-unknown-unknown --features merchant --quiet
cp target/wasm32-unknown-unknown/release/relifo_contracts.wasm target/wasm32-unknown-unknown/release/merchant.wasm

echo "✅ All contracts built"
echo ""

# Deploy contracts (these will use the wallet's signing)
echo "📦 Deploying contracts..."
echo "⚠️  You'll need to approve each transaction in Freighter wallet"
echo ""

# For deployment without a secret key, we need to use stellar contract install first
echo "📤 Installing WASM files..."

echo "  Installing ReliefVault WASM..."
VAULT_WASM_HASH=$(stellar contract install \
  --wasm target/wasm32-unknown-unknown/release/vault.wasm \
  --network $NETWORK \
  --source $ADMIN_ADDRESS 2>&1 | tail -1)
echo "    Hash: $VAULT_WASM_HASH"

echo "  Installing NGO WASM..."
NGO_WASM_HASH=$(stellar contract install \
  --wasm target/wasm32-unknown-unknown/release/ngo.wasm \
  --network $NETWORK \
  --source $ADMIN_ADDRESS 2>&1 | tail -1)
echo "    Hash: $NGO_WASM_HASH"

echo "  Installing Beneficiary WASM..."
BENEFICIARY_WASM_HASH=$(stellar contract install \
  --wasm target/wasm32-unknown-unknown/release/beneficiary.wasm \
  --network $NETWORK \
  --source $ADMIN_ADDRESS 2>&1 | tail -1)
echo "    Hash: $BENEFICIARY_WASM_HASH"

echo "  Installing Merchant WASM..."
MERCHANT_WASM_HASH=$(stellar contract install \
  --wasm target/wasm32-unknown-unknown/release/merchant.wasm \
  --network $NETWORK \
  --source $ADMIN_ADDRESS 2>&1 | tail -1)
echo "    Hash: $MERCHANT_WASM_HASH"

echo ""
echo "✅ All WASM files installed"
echo ""

# Deploy contract instances
echo "🚀 Deploying contract instances..."

echo "  Deploying ReliefVault..."
VAULT_ID=$(stellar contract deploy \
  --wasm-hash $VAULT_WASM_HASH \
  --source $ADMIN_ADDRESS \
  --network $NETWORK 2>&1 | tail -1)
echo "    Contract ID: $VAULT_ID"

echo "  Deploying NGORegistry..."
NGO_ID=$(stellar contract deploy \
  --wasm-hash $NGO_WASM_HASH \
  --source $ADMIN_ADDRESS \
  --network $NETWORK 2>&1 | tail -1)
echo "    Contract ID: $NGO_ID"

echo "  Deploying BeneficiaryRegistry..."
BENEFICIARY_ID=$(stellar contract deploy \
  --wasm-hash $BENEFICIARY_WASM_HASH \
  --source $ADMIN_ADDRESS \
  --network $NETWORK 2>&1 | tail -1)
echo "    Contract ID: $BENEFICIARY_ID"

echo "  Deploying MerchantRegistry..."
MERCHANT_ID=$(stellar contract deploy \
  --wasm-hash $MERCHANT_WASM_HASH \
  --source $ADMIN_ADDRESS \
  --network $NETWORK 2>&1 | tail -1)
echo "    Contract ID: $MERCHANT_ID"

echo ""
echo "✅ All contracts deployed"
echo ""

# Save contract IDs
echo "💾 Saving contract IDs..."
cat > ../frontend/.env.production << EOF
# Relifo Contract IDs - Deployed $(date)
NEXT_PUBLIC_VAULT_CONTRACT_ID=$VAULT_ID
NEXT_PUBLIC_NGO_CONTRACT_ID=$NGO_ID
NEXT_PUBLIC_BENEFICIARY_CONTRACT_ID=$BENEFICIARY_ID
NEXT_PUBLIC_MERCHANT_CONTRACT_ID=$MERCHANT_ID

# Admin Address
NEXT_PUBLIC_ADMIN_ADDRESS=$ADMIN_ADDRESS

# Stellar Network Configuration
NEXT_PUBLIC_STELLAR_NETWORK=TESTNET
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org

# USDC Configuration (Testnet)
NEXT_PUBLIC_USDC_ASSET_CODE=USDC
NEXT_PUBLIC_USDC_ISSUER=GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5
EOF

# Also update .env.local
cp ../frontend/.env.production ../frontend/.env.local

echo "✅ Contract IDs saved to frontend/.env.production and .env.local"
echo ""

# Summary
echo "=============================="
echo "✅ DEPLOYMENT COMPLETE"
echo "=============================="
echo ""
echo "📋 Contract Addresses:"
echo ""
echo "ReliefVault Contract:"
echo "  $VAULT_ID"
echo ""
echo "NGORegistry Contract:"
echo "  $NGO_ID"
echo ""
echo "BeneficiaryRegistry Contract:"
echo "  $BENEFICIARY_ID"
echo ""
echo "MerchantRegistry Contract:"
echo "  $MERCHANT_ID"
echo ""
echo "Admin Address:"
echo "  $ADMIN_ADDRESS"
echo ""
echo "=============================="
echo ""
echo "Next steps:"
echo "1. Initialize contracts (see initialize.sh)"
echo "2. Start frontend: cd ../frontend && npm run dev"
echo "3. Connect Freighter wallet with admin address"
echo ""
