/**
 * Smart Contract Configuration
 * Multi-network support for Ethereum, Worldchain, Base, and more
 */

// Network-specific contract addresses
export const CONTRACTS = {
  // Ethereum Sepolia
  sepolia: {
    STAKING_MANAGER: process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_SEPOLIA,
    SOULBOUND: process.env.NEXT_PUBLIC_SOULBOUND_CONTRACT_ADDRESS_SEPOLIA,
    REPUTATION: process.env.NEXT_PUBLIC_REPUTATION_CONTRACT_ADDRESS_SEPOLIA,
    DATACOIN: process.env.NEXT_PUBLIC_DATACOIN_CONTRACT_ADDRESS_SEPOLIA,
    COURSE_REGISTRY: process.env.NEXT_PUBLIC_COURSE_REGISTRY_CONTRACT_ADDRESS_SEPOLIA,
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

// Multi-network configuration
export const NETWORKS = {
  sepolia: {
    chainId: 11155111,
    chainName: "Ethereum Sepolia",
    rpcUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/",
    blockExplorer: "https://sepolia.etherscan.io",
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    isTestnet: true,
  },
  worldchain: {
    chainId: 480, // Worldchain testnet
    chainName: "Worldchain Testnet",
    rpcUrl: process.env.NEXT_PUBLIC_WORLDCHAIN_RPC_URL || "https://worldchain-testnet.g.alchemy.com/v2/",
    blockExplorer: "https://worldchain-testnet.blockscout.com",
    nativeCurrency: { name: "WLD", symbol: "WLD", decimals: 18 },
    isTestnet: true,
  },
  baseSepolia: {
    chainId: 84532,
    chainName: "Base Sepolia",
    rpcUrl: process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
    blockExplorer: "https://sepolia.basescan.org",
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    isTestnet: true,
  },
  base: {
    chainId: 8453,
    chainName: "Base",
    rpcUrl: process.env.NEXT_PUBLIC_BASE_RPC_URL || "https://mainnet.base.org",
    blockExplorer: "https://basescan.org",
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    isTestnet: false,
  },
  ethereum: {
    chainId: 1,
    chainName: "Ethereum",
    rpcUrl: process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL || "https://eth-mainnet.g.alchemy.com/v2/",
    blockExplorer: "https://etherscan.io",
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    isTestnet: false,
  },
  polygonMumbai: {
    chainId: 80001,
    chainName: "Polygon Mumbai",
    rpcUrl: process.env.NEXT_PUBLIC_POLYGON_MUMBAI_RPC_URL || "https://polygon-mumbai.g.alchemy.com/v2/",
    blockExplorer: "https://mumbai.polygonscan.com",
    nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
    isTestnet: true,
  },
  arbitrumSepolia: {
    chainId: 421614,
    chainName: "Arbitrum Sepolia",
    rpcUrl: process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL || "https://sepolia-rollup.arbitrum.io/rpc",
    blockExplorer: "https://sepolia.arbiscan.io",
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    isTestnet: true,
  },
  arbitrum: {
    chainId: 42161,
    chainName: "Arbitrum One",
    rpcUrl: process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL || "https://arb1.arbitrum.io/rpc",
    blockExplorer: "https://arbiscan.io",
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    isTestnet: false,
  },
  bsc: {
    chainId: 56,
    chainName: "BNB Smart Chain",
    rpcUrl: process.env.NEXT_PUBLIC_BSC_RPC_URL || "https://bsc-dataseed1.binance.org",
    blockExplorer: "https://bscscan.com",
    nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
    isTestnet: false,
  },
  bscTestnet: {
    chainId: 97,
    chainName: "BNB Smart Chain Testnet",
    rpcUrl: process.env.NEXT_PUBLIC_BSC_TESTNET_RPC_URL || "https://data-seed-prebsc-1-s1.binance.org:8545",
    blockExplorer: "https://testnet.bscscan.com",
    nativeCurrency: { name: "tBNB", symbol: "tBNB", decimals: 18 },
    isTestnet: true,
  },
  filecoin: {
    chainId: 314,
    chainName: "Filecoin Mainnet",
    rpcUrl: process.env.NEXT_PUBLIC_FILECOIN_RPC_URL || "https://api.node.glif.io/rpc/v1",
    blockExplorer: "https://filscan.io",
    nativeCurrency: { name: "FIL", symbol: "FIL", decimals: 18 },
    isTestnet: false,
  },
  filecoinCalibration: {
    chainId: 314159,
    chainName: "Filecoin Calibration",
    rpcUrl: process.env.NEXT_PUBLIC_FILECOIN_CALIBRATION_RPC_URL || "https://api.calibration.node.glif.io/rpc/v1",
    blockExplorer: "https://calibration.filscan.io",
    nativeCurrency: { name: "tFIL", symbol: "tFIL", decimals: 18 },
    isTestnet: true,
  },
  yellow: {
    chainId: 23011913,
    chainName: "Yellow Network",
    rpcUrl: process.env.NEXT_PUBLIC_YELLOW_RPC_URL || "https://rpc.yellow.org",
    blockExplorer: "https://explorer.yellow.org",
    nativeCurrency: { name: "YELLOW", symbol: "YELLOW", decimals: 18 },
    isTestnet: false,
  },
  zeroG: {
    chainId: 2043,
    chainName: "0G Network",
    rpcUrl: process.env.NEXT_PUBLIC_0G_RPC_URL || "https://rpc.0g.ai",
    blockExplorer: "https://explorer.0g.ai",
    nativeCurrency: { name: "0G", symbol: "0G", decimals: 18 },
    isTestnet: false,
  },
  avalanche: {
    chainId: 43114,
    chainName: "Avalanche C-Chain",
    rpcUrl: process.env.NEXT_PUBLIC_AVALANCHE_RPC_URL || "https://api.avax.network/ext/bc/C/rpc",
    blockExplorer: "https://snowtrace.io",
    nativeCurrency: { name: "AVAX", symbol: "AVAX", decimals: 18 },
    isTestnet: false,
  },
  avalancheFuji: {
    chainId: 43113,
    chainName: "Avalanche Fuji",
    rpcUrl: process.env.NEXT_PUBLIC_AVALANCHE_FUJI_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc",
    blockExplorer: "https://testnet.snowtrace.io",
    nativeCurrency: { name: "AVAX", symbol: "AVAX", decimals: 18 },
    isTestnet: true,
  },
} as const;

// Default network (for backward compatibility)
export const NETWORK_CONFIG = NETWORKS.sepolia;

// Course Configuration
export const COURSES = [
  {
    id: 1,
    stakeAmount: "0.0001", // ETH (matches deployed contract)
  },
  {
    id: 2,
    stakeAmount: "0.0001", // ETH (matches deployed contract)
  },
  {
    id: 3,
    stakeAmount: "0.0001", // ETH (matches deployed contract)
  },
  {
    id: 4,
    stakeAmount: "0.0001", // ETH (matches deployed contract)
  },
  {
    id: 5,
    stakeAmount: "0.0001", // ETH (matches deployed contract)
  },
  {
    id: 6,
    stakeAmount: "0.0001", // ETH (matches deployed contract)
  },
] as const;
