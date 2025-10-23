/**
 * Smart Contract Configuration
 * Update these addresses after deploying contracts
 */

// Sepolia Testnet Addresses - Updated with Lighthouse integration
export const CONTRACTS = {
  STAKING_MANAGER: process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS || "0x9Eda33d2aa6F2f65Cb7710EA55b5458F98cB88c4",
  SOULBOUND: process.env.NEXT_PUBLIC_SOULBOUND_CONTRACT_ADDRESS || "0x94A8DDf14a32c792B191b29Dc1A8583D5E108AF3",
  REPUTATION: process.env.NEXT_PUBLIC_REPUTATION_CONTRACT_ADDRESS || "0x75749472F369d4935E946AEDD0F34355Af2504C9",
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
