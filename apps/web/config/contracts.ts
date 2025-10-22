/**
 * Smart Contract Configuration
 * Update these addresses after deploying contracts
 */

// Sepolia Testnet Addresses
export const CONTRACTS = {
  STAKING_MANAGER: process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000",
  SOULBOUND: process.env.NEXT_PUBLIC_SOULBOUND_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000",
  REPUTATION: process.env.NEXT_PUBLIC_REPUTATION_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000",
} as const;

// Network Configuration
export const NETWORK_CONFIG = {
  chainId: 11155111, // Sepolia
  chainName: "Sepolia",
  rpcUrl: "https://sepolia.infura.io/v3/",
  blockExplorer: "https://sepolia.etherscan.io",
} as const;

// Course Configuration
export const COURSES = [
  {
    id: 1,
    stakeAmount: "0.002", // ETH
  },
  {
    id: 2,
    stakeAmount: "0.005", // ETH
  },
] as const;
