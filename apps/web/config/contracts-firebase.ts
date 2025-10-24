/**
 * Firebase-powered Smart Contract Configuration
 * Dynamically loads RPC URLs and network configurations from Firebase
 */

import { rpcService, NetworkRPC } from '../lib/rpcService';
import { contractService, ContractAddresses } from '../lib/contractService';

// Network-specific contract addresses (these can also be stored in Firebase)
export const CONTRACTS = {
  // Ethereum Sepolia
  sepolia: {
    STAKING_MANAGER: process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_SEPOLIA || "0x9Eda33d2aa6F2f65Cb7710EA55b5458F98cB88c4",
    SOULBOUND: process.env.NEXT_PUBLIC_SOULBOUND_CONTRACT_ADDRESS_SEPOLIA || "0x94A8DDf14a32c792B191b29Dc1A8583D5E108AF3",
    REPUTATION: process.env.NEXT_PUBLIC_REPUTATION_CONTRACT_ADDRESS_SEPOLIA || "0x75749472F369d4935E946AEDD0F34355Af2504C9",
  },
  // Worldchain Testnet
  worldchain: {
    STAKING_MANAGER: process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_WORLDCHAIN || "",
    SOULBOUND: process.env.NEXT_PUBLIC_SOULBOUND_CONTRACT_ADDRESS_WORLDCHAIN || "",
    REPUTATION: process.env.NEXT_PUBLIC_REPUTATION_CONTRACT_ADDRESS_WORLDCHAIN || "",
  },
  // Base Sepolia
  baseSepolia: {
    STAKING_MANAGER: process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_BASE_SEPOLIA || "",
    SOULBOUND: process.env.NEXT_PUBLIC_SOULBOUND_CONTRACT_ADDRESS_BASE_SEPOLIA || "",
    REPUTATION: process.env.NEXT_PUBLIC_REPUTATION_CONTRACT_ADDRESS_BASE_SEPOLIA || "",
  },
  // Base Mainnet
  base: {
    STAKING_MANAGER: process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_BASE || "",
    SOULBOUND: process.env.NEXT_PUBLIC_SOULBOUND_CONTRACT_ADDRESS_BASE || "",
    REPUTATION: process.env.NEXT_PUBLIC_REPUTATION_CONTRACT_ADDRESS_BASE || "",
  },
  // Ethereum Mainnet
  ethereum: {
    STAKING_MANAGER: process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_ETHEREUM || "",
    SOULBOUND: process.env.NEXT_PUBLIC_SOULBOUND_CONTRACT_ADDRESS_ETHEREUM || "",
    REPUTATION: process.env.NEXT_PUBLIC_REPUTATION_CONTRACT_ADDRESS_ETHEREUM || "",
  },
  // Polygon Mumbai
  polygonMumbai: {
    STAKING_MANAGER: process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_POLYGON_MUMBAI || "",
    SOULBOUND: process.env.NEXT_PUBLIC_SOULBOUND_CONTRACT_ADDRESS_POLYGON_MUMBAI || "",
    REPUTATION: process.env.NEXT_PUBLIC_REPUTATION_CONTRACT_ADDRESS_POLYGON_MUMBAI || "",
  },
  // Arbitrum Sepolia
  arbitrumSepolia: {
    STAKING_MANAGER: process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_ARBITRUM_SEPOLIA || "",
    SOULBOUND: process.env.NEXT_PUBLIC_SOULBOUND_CONTRACT_ADDRESS_ARBITRUM_SEPOLIA || "",
    REPUTATION: process.env.NEXT_PUBLIC_REPUTATION_CONTRACT_ADDRESS_ARBITRUM_SEPOLIA || "",
  },
  // Arbitrum Mainnet
  arbitrum: {
    STAKING_MANAGER: process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_ARBITRUM || "",
    SOULBOUND: process.env.NEXT_PUBLIC_SOULBOUND_CONTRACT_ADDRESS_ARBITRUM || "",
    REPUTATION: process.env.NEXT_PUBLIC_REPUTATION_CONTRACT_ADDRESS_ARBITRUM || "",
  },
  // Binance Smart Chain
  bsc: {
    STAKING_MANAGER: process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_BSC || "",
    SOULBOUND: process.env.NEXT_PUBLIC_SOULBOUND_CONTRACT_ADDRESS_BSC || "",
    REPUTATION: process.env.NEXT_PUBLIC_REPUTATION_CONTRACT_ADDRESS_BSC || "",
  },
  // Binance Smart Chain Testnet
  bscTestnet: {
    STAKING_MANAGER: process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_BSC_TESTNET || "",
    SOULBOUND: process.env.NEXT_PUBLIC_SOULBOUND_CONTRACT_ADDRESS_BSC_TESTNET || "",
    REPUTATION: process.env.NEXT_PUBLIC_REPUTATION_CONTRACT_ADDRESS_BSC_TESTNET || "",
  },
  // Filecoin Mainnet
  filecoin: {
    STAKING_MANAGER: process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_FILECOIN || "",
    SOULBOUND: process.env.NEXT_PUBLIC_SOULBOUND_CONTRACT_ADDRESS_FILECOIN || "",
    REPUTATION: process.env.NEXT_PUBLIC_REPUTATION_CONTRACT_ADDRESS_FILECOIN || "",
  },
  // Filecoin Calibration Testnet
  filecoinCalibration: {
    STAKING_MANAGER: process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_FILECOIN_CALIBRATION || "",
    SOULBOUND: process.env.NEXT_PUBLIC_SOULBOUND_CONTRACT_ADDRESS_FILECOIN_CALIBRATION || "",
    REPUTATION: process.env.NEXT_PUBLIC_REPUTATION_CONTRACT_ADDRESS_FILECOIN_CALIBRATION || "",
  },
  // Yellow Network
  yellow: {
    STAKING_MANAGER: process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_YELLOW || "",
    SOULBOUND: process.env.NEXT_PUBLIC_SOULBOUND_CONTRACT_ADDRESS_YELLOW || "",
    REPUTATION: process.env.NEXT_PUBLIC_REPUTATION_CONTRACT_ADDRESS_YELLOW || "",
  },
  // 0G Network
  zeroG: {
    STAKING_MANAGER: process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_0G || "",
    SOULBOUND: process.env.NEXT_PUBLIC_SOULBOUND_CONTRACT_ADDRESS_0G || "",
    REPUTATION: process.env.NEXT_PUBLIC_REPUTATION_CONTRACT_ADDRESS_0G || "",
  },
  // Avalanche C-Chain
  avalanche: {
    STAKING_MANAGER: process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_AVALANCHE || "",
    SOULBOUND: process.env.NEXT_PUBLIC_SOULBOUND_CONTRACT_ADDRESS_AVALANCHE || "",
    REPUTATION: process.env.NEXT_PUBLIC_REPUTATION_CONTRACT_ADDRESS_AVALANCHE || "",
  },
  // Avalanche Fuji Testnet
  avalancheFuji: {
    STAKING_MANAGER: process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_AVALANCHE_FUJI || "",
    SOULBOUND: process.env.NEXT_PUBLIC_SOULBOUND_CONTRACT_ADDRESS_AVALANCHE_FUJI || "",
    REPUTATION: process.env.NEXT_PUBLIC_REPUTATION_CONTRACT_ADDRESS_AVALANCHE_FUJI || "",
  },
} as const;

/**
 * Get network configuration from Firebase
 */
export async function getNetworkConfig(chainId: number): Promise<NetworkRPC | null> {
  return await rpcService.getNetworkRPC(chainId);
}

/**
 * Get all network configurations from Firebase
 */
export async function getAllNetworkConfigs(): Promise<NetworkRPC[]> {
  return await rpcService.getAllNetworkRPCs();
}

/**
 * Get the best RPC URL for a network
 */
export async function getBestRPCUrl(chainId: number): Promise<string | null> {
  return await rpcService.getBestRPCUrl(chainId);
}

/**
 * Get contract addresses for a specific network
 */
export async function getContractAddresses(chainId: number): Promise<ContractAddresses | null> {
  return await contractService.getContractAddresses(chainId);
}

/**
 * Get all contract addresses
 */
export async function getAllContractAddresses(): Promise<ContractAddresses[]> {
  return await contractService.getAllContractAddresses();
}

/**
 * Get contract addresses for a specific network (simplified)
 */
export async function getContractsForNetwork(chainId: number): Promise<{
  stakingManager: string;
  soulbound: string;
  reputation: string;
  dataCoin?: string;
  isActive: boolean;
} | null> {
  const addresses = await contractService.getContractAddresses(chainId);
  if (!addresses) return null;

  return {
    stakingManager: addresses.stakingManager,
    soulbound: addresses.soulbound,
    reputation: addresses.reputation,
    dataCoin: addresses.dataCoin,
    isActive: addresses.isActive
  };
}

/**
 * Initialize default network configurations in Firebase
 */
export async function initializeNetworkConfigs(): Promise<void> {
  await rpcService.initializeDefaultRPCs();
}

// Course Configuration
export const COURSES = [
  {
    id: 1,
    stakeAmount: "0.00001", // ETH
  },
  {
    id: 2,
    stakeAmount: "0.00001", // ETH
  },
] as const;
