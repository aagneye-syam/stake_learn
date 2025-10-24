# Environment Setup Guide

This guide lists all environment variables across the monorepo, what they do, and how to obtain them.

Contents
- Web (Next.js)
- AI Agent (FastAPI)
- Contracts (Hardhat)
- SDK (TypeScript)
- Where to get each key

---

## Web (apps/web)
Create `apps/web/.env.local` with:

```
# Public RPC for client reads (Sepolia)
NEXT_PUBLIC_ALCHEMY_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/<ALCHEMY_KEY>

# Server-side RPC (used by API routes)
ALCHEMY_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/<ALCHEMY_KEY>

# Chain
CHAIN_ID=11155111

# Contracts (fill after deploy)
SBT_ADDRESS=0x...
NEXT_PUBLIC_SBT_ADDRESS=0x...
REPUTATION_ADDRESS=0x...

# AI Service
AI_SERVICE_URL=http://127.0.0.1:8000
AI_VERIFIER_ADDRESS=0x...  # derived from AI_VERIFIER_PRIVATE_KEY

# Pinata (IPFS) for metadata uploads
PINATA_JWT=eyJhbGciOiJI...  # JWT token

# GitHub OAuth (NextAuth)
GITHUB_ID=Iv...  # GitHub OAuth App Client ID
GITHUB_SECRET=... # GitHub OAuth App Client Secret
NEXTAUTH_SECRET=... # random string, e.g. from `openssl rand -base64 32`
```

Notes
- `NEXT_PUBLIC_*` vars are exposed to the browser; keep other secrets server-only.
- `AI_VERIFIER_ADDRESS` must match the signer address from the AI agent.

---

## AI Agent (apps/ai-agent)
Create `apps/ai-agent/.env` (or export in shell) with:

```
# EIP-712 signing key used by the agent
export AI_VERIFIER_PRIVATE_KEY=0x<private_key>

# Optional – improves scoring
export OPENAI_API_KEY=sk-...

# Optional – to fetch private repo commit diffs, or increase rate limits
export GITHUB_TOKEN=ghp_...
```

Notes
- Keep `AI_VERIFIER_PRIVATE_KEY` secure. The corresponding address is `AI_VERIFIER_ADDRESS` for web.
- If you skip `OPENAI_API_KEY`, scoring falls back to a heuristic.

---

## Contracts (packages/contracts)
Keep these in your shell exports when running Hardhat:

```
# RPC for Sepolia deployment
export ALCHEMY_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/<ALCHEMY_KEY>

# Deployer private key (Sepolia)
export DEPLOYER_PRIVATE_KEY=0x<private_key>

# Optional – enables `npx hardhat verify`
export ETHERSCAN_API_KEY=<etherscan_key>

# Optional – AI verifier signer address to set during deploy (defaults to deployer)
export AI_VERIFIER_ADDRESS=0x...
```

After `npm run deploy`, copy emitted addresses into Web env:
- `SBT_ADDRESS`, `NEXT_PUBLIC_SBT_ADDRESS`, `REPUTATION_ADDRESS`.

---

## SDK (packages/sdk)
No environment variables required. Consumers must supply:
- Contract addresses (`SBT_ADDRESS`, `REPUTATION_ADDRESS`)
- RPC URL if not using default public transport

---

## Where to get each key

### Alchemy RPC (Sepolia)
1. Go to `https://www.alchemy.com/`
2. Create an app for Sepolia
3. Copy the HTTPS URL (keep the API key private)

### GitHub OAuth (for NextAuth)
1. Go to `https://github.com/settings/developers` → OAuth Apps → New OAuth App
2. Application name: Proof of Contribution
3. Homepage URL: `http://localhost:3000`
4. Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
5. Save, then copy `Client ID` → `GITHUB_ID`, generate `Client Secret` → `GITHUB_SECRET`

### NEXTAUTH_SECRET
Generate a random string, e.g.:
```
openssl rand -base64 32
```

### Pinata JWT (IPFS)
1. Create an account at `https://www.pinata.cloud/`
2. In the dashboard, create a JWT (API Keys → JWT)
3. Copy the token to `PINATA_JWT`

### Etherscan API Key (optional)
1. Go to `https://etherscan.io/myapikey`
2. Create an API key for contract verification

### AI Verifier Keypair
- Generate an EOA private key (e.g., in a local wallet). The address is your `AI_VERIFIER_ADDRESS`.
- Set `AI_VERIFIER_PRIVATE_KEY` in the AI agent environment.
- Ensure the Web `.env.local` uses the matching `AI_VERIFIER_ADDRESS`.

---

## Sanity Checklist
- Web `.env.local` contains RPCs, chain id, contract addresses, AI service URL, and NextAuth/Pinata settings
- AI agent `.env` has `AI_VERIFIER_PRIVATE_KEY` (and optionally OpenAI/GitHub tokens)
- Contracts env exports are set before running deploy/verify tasks
- Addresses from deployment are copied back to web env
