# Proof of Contribution

Full-stack Web3 dApp that verifies GitHub commits via an AI agent and mints non-transferable Soulbound Tokens (SBTs) using EIP-712 signature verification on Sepolia.

## Architecture

- **Frontend**: Next.js 14 (App Router) with wagmi + viem + ConnectKit
- **Smart Contracts**: Hardhat + Solidity (Soulbound.sol, Reputation.sol)
- **AI Agent**: FastAPI service for commit verification and EIP-712 signing
- **Storage**: IPFS/Pinata for metadata
- **Blockchain**: Ethereum Sepolia testnet

## Project Structure

```
proof-of-contribution/
├── apps/
│   ├── web/                     # Next.js frontend
│   │   ├── app/                 # App router pages and API routes
│   │   ├── _components/         # React components
│   │   ├── _context/            # Context providers
│   │   └── _utils/              # Utilities
│   └── ai-agent/                # FastAPI verification service
│       ├── src/
│       │   ├── main.py          # FastAPI app
│       │   ├── verify_commit.py # Core verification logic
│       │   ├── github_api.py    # GitHub API integration
│       │   ├── scoring.py       # LLM-based scoring
│       │   └── signatures.py    # EIP-712 signing
│       └── requirements.txt
├── packages/
│   ├── contracts/               # Hardhat workspace
│   │   ├── contracts/
│   │   │   ├── Soulbound.sol    # Non-transferable ERC-721
│   │   │   └── Reputation.sol   # Reputation aggregation
│   │   ├── scripts/
│   │   │   └── deploy.ts        # Deployment script
│   │   └── test/
│   └── sdk/                     # TypeScript SDK
│       ├── index.ts             # Main SDK exports
│       └── utils.ts             # Utilities and types
└── .env.local                   # Environment variables
```

## Prerequisites

- Node.js 18+
- Python 3.10+
- Git
- Sepolia ETH for gas fees
- Alchemy RPC URL
- GitHub OAuth app
- Pinata account (optional, for IPFS)
- OpenAI API key (optional, for LLM scoring)

## Quick Start

### 1. Install Dependencies

```bash
# Web app
cd apps/web && npm install && cd -

# Contracts
cd packages/contracts && npm install && cd -

# SDK
cd packages/sdk && npm install && cd -

# AI Agent
cd apps/ai-agent && python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt && cd -
```

### 2. Environment Setup

Create `.env.local` in the project root:

```bash
# Blockchain
ALCHEMY_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
NEXT_PUBLIC_ALCHEMY_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
CHAIN_ID=11155111

# Contract addresses (set after deployment)
SBT_ADDRESS=
NEXT_PUBLIC_SBT_ADDRESS=
REPUTATION_ADDRESS=

# AI Service
AI_SERVICE_URL=http://127.0.0.1:8000
AI_VERIFIER_ADDRESS=

# Storage
PINATA_JWT=

# GitHub OAuth
GITHUB_ID=
GITHUB_SECRET=
NEXTAUTH_SECRET=

# AI Agent (set in shell)
# AI_VERIFIER_PRIVATE_KEY=0x...
# OPENAI_API_KEY=sk-...
# GITHUB_TOKEN=ghp_...
```

### 3. Deploy Contracts

```bash
cd packages/contracts

# Set deployment environment
export ALCHEMY_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
export DEPLOYER_PRIVATE_KEY=0x...

# Deploy
npm run build
npm run deploy

# Copy the deployed addresses to your .env.local
```

### 4. Start AI Agent

```bash
cd apps/ai-agent
source .venv/bin/activate

# Set AI agent environment
export AI_VERIFIER_PRIVATE_KEY=0x...  # Private key for EIP-712 signing
export OPENAI_API_KEY=sk-...          # Optional: for LLM scoring
export GITHUB_TOKEN=ghp_...           # Optional: for GitHub API

# Start the service
uvicorn src.main:app --reload --port 8000
```

### 5. Start Web App

```bash
cd apps/web
npm run dev
```

Open http://localhost:3000

## Usage Flow

1. **Connect Wallet**: Use ConnectKit to connect your wallet
2. **GitHub Login**: Authenticate with GitHub to access your repositories
3. **Verify Commit**: 
   - Go to Dashboard
   - Enter repository (format: `owner/repo`)
   - Enter commit SHA
   - Click "Verify" to send to AI agent
4. **Mint SBT**: If verification succeeds, click "Mint" to create your Soulbound Token

## Smart Contracts

### Soulbound.sol
- Non-transferable ERC-721 token
- EIP-712 signature verification for minting
- Only authorized verifier can sign permits
- Replay protection via commit hash tracking

### Reputation.sol
- Tracks contribution scores per address
- Provides leaderboard functionality
- Can be called by Soulbound contract to record contributions

## EIP-712 Signature Structure

```solidity
struct Permit {
    address to;           // Recipient address
    bytes32 commitHash;   // keccak256(repo|sha|author)
    uint256 reputation;   // AI-assigned score (1-100)
    uint256 expiry;       // Unix timestamp
    string tokenURI;      // IPFS metadata URI
}
```

Domain:
- name: "ProofOfContribution"
- version: "1"
- chainId: 11155111 (Sepolia)
- verifyingContract: SBT_ADDRESS

## API Endpoints

### Web App APIs
- `POST /api/verify` - Verify commit with AI agent
- `POST /api/mint` - Validate signature and return mint calldata
- `GET /api/reputation` - Fetch leaderboard data

### AI Agent APIs
- `POST /verify_commit` - Core verification endpoint
- `GET /health` - Health check

## Development

### Running Tests
```bash
cd packages/contracts
npm test
```

### Building for Production
```bash
cd apps/web
npm run build
```

### Docker (AI Agent)
```bash
cd apps/ai-agent
docker build -t proof-of-contribution-ai .
docker run -p 8000:8000 --env-file .env proof-of-contribution-ai
```

## Security Considerations

- SBTs are non-transferable by design
- EIP-712 signatures prevent replay attacks
- AI agent private key should be kept secure
- Rate limiting recommended for production
- GitHub tokens should have minimal permissions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
