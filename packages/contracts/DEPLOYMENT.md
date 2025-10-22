# Smart Contract Deployment Guide

## Prerequisites

1. Node.js v18 or higher
2. A wallet with Sepolia ETH (get from [Sepolia Faucet](https://sepoliafaucet.com/))
3. Alchemy or Infura account for RPC URL
4. Etherscan API key (optional, for contract verification)

## Environment Setup

Create a `.env` file in `packages/contracts/`:

```env
# Required: Your wallet private key (DO NOT COMMIT THIS!)
DEPLOYER_PRIVATE_KEY=your_private_key_here

# Required: RPC URL for Sepolia testnet
ALCHEMY_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY

# Optional: For contract verification on Etherscan
ETHERSCAN_API_KEY=your_etherscan_api_key

# Optional: AI verifier address (defaults to deployer address)
AI_VERIFIER_ADDRESS=0x...
```

## Installation

Navigate to the contracts directory and install dependencies:

```bash
cd packages/contracts
npm install
```

## Compile Contracts

```bash
npm run build
```

This will compile all Solidity contracts and generate TypeScript types.

## Run Tests

```bash
npm test
```

All tests should pass before deployment.

## Deploy to Sepolia

```bash
npm run deploy
```

The deployment script will:
1. Deploy the Soulbound contract
2. Deploy the Reputation contract
3. Deploy the StakingManager contract
4. Add sample courses (Course 1: 0.002 ETH, Course 2: 0.005 ETH)
5. Save deployment addresses to `deployments.json`

## After Deployment

1. Copy the StakingManager contract address from the output
2. Update your frontend environment variables with the contract address
3. Optionally verify contracts on Etherscan:

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

## Contract Addresses

After deployment, addresses will be saved in `deployments.json`:

```json
{
  "network": "sepolia",
  "deployer": "0x...",
  "contracts": {
    "Soulbound": "0x...",
    "Reputation": "0x...",
    "StakingManager": "0x..."
  },
  "timestamp": "2025-01-..."
}
```

## Security Notes

- Never commit your `.env` file
- Keep your private key secure
- Test thoroughly on testnet before mainnet deployment
- Use a hardware wallet for mainnet deployments
- Consider using a multi-sig wallet for production
