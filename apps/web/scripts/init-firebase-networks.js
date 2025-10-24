/**
 * Script to initialize Firebase with default network configurations
 * Run this script to populate your Firebase Firestore with network RPC data
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

// Firebase configuration - replace with your actual config
const firebaseConfig = {
    apiKey: "AIzaSyDP9CjqacDr9bfBRPOvUglri9HaS-0cEgs",
    authDomain: "ethonline-57983.firebaseapp.com",
    projectId: "ethonline-57983",
    storageBucket: "ethonline-57983.firebasestorage.app",
    messagingSenderId: "547398520803",
    appId: "1:547398520803:web:4ef4763e641b06366d9ad6",
    measurementId: "G-LRH4Y3MYJ8"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Default network configurations
const defaultNetworks = [
  // Ethereum Networks
  {
    id: "1",
    chainId: 1,
    chainName: "Ethereum",
    rpcUrl: "https://eth-mainnet.g.alchemy.com/v2/",
    backupRpcUrls: [
      "https://mainnet.infura.io/v3/",
      "https://ethereum.publicnode.com"
    ],
    blockExplorer: "https://etherscan.io",
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    isTestnet: false,
    isActive: true,
    priority: 1,
    lastUpdated: Date.now(),
    createdBy: "system"
  },
  {
    id: "11155111",
    chainId: 11155111,
    chainName: "Ethereum Sepolia",
    rpcUrl: "https://eth-sepolia.g.alchemy.com/v2/",
    backupRpcUrls: [
      "https://sepolia.infura.io/v3/",
      "https://rpc.sepolia.org"
    ],
    blockExplorer: "https://sepolia.etherscan.io",
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    isTestnet: true,
    isActive: true,
    priority: 2,
    lastUpdated: Date.now(),
    createdBy: "system"
  },
  // Base Networks
  {
    id: "8453",
    chainId: 8453,
    chainName: "Base",
    rpcUrl: "https://mainnet.base.org",
    backupRpcUrls: [
      "https://base-mainnet.g.alchemy.com/v2/",
      "https://base.publicnode.com"
    ],
    blockExplorer: "https://basescan.org",
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    isTestnet: false,
    isActive: true,
    priority: 3,
    lastUpdated: Date.now(),
    createdBy: "system"
  },
  {
    id: "84532",
    chainId: 84532,
    chainName: "Base Sepolia",
    rpcUrl: "https://sepolia.base.org",
    backupRpcUrls: [
      "https://base-sepolia.g.alchemy.com/v2/"
    ],
    blockExplorer: "https://sepolia.basescan.org",
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    isTestnet: true,
    isActive: true,
    priority: 4,
    lastUpdated: Date.now(),
    createdBy: "system"
  },
  // Arbitrum Networks
  {
    id: "42161",
    chainId: 42161,
    chainName: "Arbitrum One",
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    backupRpcUrls: [
      "https://arbitrum-mainnet.g.alchemy.com/v2/",
      "https://arbitrum.publicnode.com"
    ],
    blockExplorer: "https://arbiscan.io",
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    isTestnet: false,
    isActive: true,
    priority: 5,
    lastUpdated: Date.now(),
    createdBy: "system"
  },
  {
    id: "421614",
    chainId: 421614,
    chainName: "Arbitrum Sepolia",
    rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
    backupRpcUrls: [
      "https://arbitrum-sepolia.g.alchemy.com/v2/"
    ],
    blockExplorer: "https://sepolia.arbiscan.io",
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    isTestnet: true,
    isActive: true,
    priority: 6,
    lastUpdated: Date.now(),
    createdBy: "system"
  },
  // BSC Networks
  {
    id: "56",
    chainId: 56,
    chainName: "BNB Smart Chain",
    rpcUrl: "https://bsc-dataseed1.binance.org",
    backupRpcUrls: [
      "https://bsc-dataseed2.binance.org",
      "https://bsc-dataseed3.binance.org"
    ],
    blockExplorer: "https://bscscan.com",
    nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
    isTestnet: false,
    isActive: true,
    priority: 7,
    lastUpdated: Date.now(),
    createdBy: "system"
  },
  {
    id: "97",
    chainId: 97,
    chainName: "BNB Smart Chain Testnet",
    rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545",
    backupRpcUrls: [
      "https://data-seed-prebsc-2-s1.binance.org:8545"
    ],
    blockExplorer: "https://testnet.bscscan.com",
    nativeCurrency: { name: "tBNB", symbol: "tBNB", decimals: 18 },
    isTestnet: true,
    isActive: true,
    priority: 8,
    lastUpdated: Date.now(),
    createdBy: "system"
  },
  // Avalanche Networks
  {
    id: "43114",
    chainId: 43114,
    chainName: "Avalanche C-Chain",
    rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
    backupRpcUrls: [
      "https://avalanche-mainnet.g.alchemy.com/v2/",
      "https://avalanche.publicnode.com"
    ],
    blockExplorer: "https://snowtrace.io",
    nativeCurrency: { name: "AVAX", symbol: "AVAX", decimals: 18 },
    isTestnet: false,
    isActive: true,
    priority: 9,
    lastUpdated: Date.now(),
    createdBy: "system"
  },
  {
    id: "43113",
    chainId: 43113,
    chainName: "Avalanche Fuji",
    rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc",
    backupRpcUrls: [
      "https://avalanche-fuji.g.alchemy.com/v2/"
    ],
    blockExplorer: "https://testnet.snowtrace.io",
    nativeCurrency: { name: "AVAX", symbol: "AVAX", decimals: 18 },
    isTestnet: true,
    isActive: true,
    priority: 10,
    lastUpdated: Date.now(),
    createdBy: "system"
  },
  // Polygon Networks
  {
    id: "80001",
    chainId: 80001,
    chainName: "Polygon Mumbai",
    rpcUrl: "https://polygon-mumbai.g.alchemy.com/v2/",
    backupRpcUrls: [
      "https://rpc-mumbai.maticvigil.com",
      "https://polygon-mumbai.infura.io/v3/"
    ],
    blockExplorer: "https://mumbai.polygonscan.com",
    nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
    isTestnet: true,
    isActive: true,
    priority: 11,
    lastUpdated: Date.now(),
    createdBy: "system"
  },
  // Filecoin Networks
  {
    id: "314",
    chainId: 314,
    chainName: "Filecoin Mainnet",
    rpcUrl: "https://api.node.glif.io/rpc/v1",
    backupRpcUrls: [
      "https://api.node.glif.io/rpc/v0"
    ],
    blockExplorer: "https://filscan.io",
    nativeCurrency: { name: "FIL", symbol: "FIL", decimals: 18 },
    isTestnet: false,
    isActive: true,
    priority: 12,
    lastUpdated: Date.now(),
    createdBy: "system"
  },
  {
    id: "314159",
    chainId: 314159,
    chainName: "Filecoin Calibration",
    rpcUrl: "https://api.calibration.node.glif.io/rpc/v1",
    backupRpcUrls: [
      "https://api.calibration.node.glif.io/rpc/v0"
    ],
    blockExplorer: "https://calibration.filscan.io",
    nativeCurrency: { name: "tFIL", symbol: "tFIL", decimals: 18 },
    isTestnet: true,
    isActive: true,
    priority: 13,
    lastUpdated: Date.now(),
    createdBy: "system"
  },
  // Worldchain
  {
    id: "480",
    chainId: 480,
    chainName: "Worldchain Testnet",
    rpcUrl: "https://worldchain-testnet.g.alchemy.com/v2/",
    backupRpcUrls: [
      "https://worldchain-testnet.blockscout.com"
    ],
    blockExplorer: "https://worldchain-testnet.blockscout.com",
    nativeCurrency: { name: "WLD", symbol: "WLD", decimals: 18 },
    isTestnet: true,
    isActive: true,
    priority: 14,
    lastUpdated: Date.now(),
    createdBy: "system"
  },
  // Yellow Network
  {
    id: "23011913",
    chainId: 23011913,
    chainName: "Yellow Network",
    rpcUrl: "https://rpc.yellow.org",
    backupRpcUrls: [],
    blockExplorer: "https://explorer.yellow.org",
    nativeCurrency: { name: "YELLOW", symbol: "YELLOW", decimals: 18 },
    isTestnet: false,
    isActive: true,
    priority: 15,
    lastUpdated: Date.now(),
    createdBy: "system"
  },
  // 0G Network
  {
    id: "2043",
    chainId: 2043,
    chainName: "0G Network",
    rpcUrl: "https://rpc.0g.ai",
    backupRpcUrls: [],
    blockExplorer: "https://explorer.0g.ai",
    nativeCurrency: { name: "0G", symbol: "0G", decimals: 18 },
    isTestnet: false,
    isActive: true,
    priority: 16,
    lastUpdated: Date.now(),
    createdBy: "system"
  }
];

async function initializeFirebaseNetworks() {
  try {
    console.log('🔥 Initializing Firebase with network configurations...');
    
    for (const network of defaultNetworks) {
      const docRef = doc(db, 'networkRPCs', network.id);
      await setDoc(docRef, network);
      console.log(`✅ Added ${network.chainName} (Chain ID: ${network.chainId})`);
    }
    
    console.log('🎉 Successfully initialized Firebase with all network configurations!');
    console.log(`📊 Total networks added: ${defaultNetworks.length}`);
    
    // Summary
    const testnets = defaultNetworks.filter(n => n.isTestnet).length;
    const mainnets = defaultNetworks.filter(n => !n.isTestnet).length;
    
    console.log('\n📈 Summary:');
    console.log(`   • Mainnets: ${mainnets}`);
    console.log(`   • Testnets: ${testnets}`);
    console.log(`   • Total: ${defaultNetworks.length}`);
    
  } catch (error) {
    console.error('❌ Error initializing Firebase networks:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeFirebaseNetworks();
