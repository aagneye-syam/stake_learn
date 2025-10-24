import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  query, 
  orderBy,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from './firebase';

export interface NetworkRPC {
  id: string;
  chainId: number;
  chainName: string;
  rpcUrl: string;
  backupRpcUrls: string[];
  blockExplorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  isTestnet: boolean;
  isActive: boolean;
  priority: number;
  lastUpdated: number;
  createdBy: string;
}

export interface RPCStats {
  totalRequests: number;
  successRate: number;
  averageResponseTime: number;
  lastChecked: number;
}

class RPCService {
  private cache: Map<number, NetworkRPC> = new Map();
  private cacheExpiry: Map<number, number> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Get RPC configuration for a specific network
   */
  async getNetworkRPC(chainId: number): Promise<NetworkRPC | null> {
    // Check cache first
    if (this.cache.has(chainId)) {
      const expiry = this.cacheExpiry.get(chainId) || 0;
      if (Date.now() < expiry) {
        return this.cache.get(chainId) || null;
      }
    }

    try {
      const docRef = doc(db, 'networkRPCs', chainId.toString());
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as NetworkRPC;
        this.cache.set(chainId, data);
        this.cacheExpiry.set(chainId, Date.now() + this.CACHE_DURATION);
        return data;
      }
    } catch (error) {
      console.error('Error fetching RPC config:', error);
    }

    return null;
  }

  /**
   * Get all active network RPCs
   */
  async getAllNetworkRPCs(): Promise<NetworkRPC[]> {
    try {
      const q = query(
        collection(db, 'networkRPCs'),
        orderBy('priority', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      const networks: NetworkRPC[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as NetworkRPC;
        if (data.isActive) {
          networks.push(data);
          this.cache.set(data.chainId, data);
          this.cacheExpiry.set(data.chainId, Date.now() + this.CACHE_DURATION);
        }
      });

      return networks;
    } catch (error) {
      console.error('Error fetching all RPC configs:', error);
      return [];
    }
  }

  /**
   * Subscribe to real-time updates for network RPCs
   */
  subscribeToNetworkRPCs(callback: (networks: NetworkRPC[]) => void): Unsubscribe {
    const q = query(
      collection(db, 'networkRPCs'),
      orderBy('priority', 'asc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const networks: NetworkRPC[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as NetworkRPC;
        if (data.isActive) {
          networks.push(data);
          this.cache.set(data.chainId, data);
          this.cacheExpiry.set(data.chainId, Date.now() + this.CACHE_DURATION);
        }
      });
      callback(networks);
    });
  }

  /**
   * Update or create network RPC configuration
   */
  async updateNetworkRPC(networkRPC: Partial<NetworkRPC>): Promise<boolean> {
    try {
      if (!networkRPC.chainId) {
        throw new Error('Chain ID is required');
      }

      const docRef = doc(db, 'networkRPCs', networkRPC.chainId.toString());
      const docSnap = await getDoc(docRef);

      const data: NetworkRPC = {
        id: networkRPC.chainId.toString(),
        chainId: networkRPC.chainId,
        chainName: networkRPC.chainName || '',
        rpcUrl: networkRPC.rpcUrl || '',
        backupRpcUrls: networkRPC.backupRpcUrls || [],
        blockExplorer: networkRPC.blockExplorer || '',
        nativeCurrency: networkRPC.nativeCurrency || {
          name: 'ETH',
          symbol: 'ETH',
          decimals: 18
        },
        isTestnet: networkRPC.isTestnet || false,
        isActive: networkRPC.isActive !== undefined ? networkRPC.isActive : true,
        priority: networkRPC.priority || 0,
        lastUpdated: Date.now(),
        createdBy: networkRPC.createdBy || 'system'
      };

      await setDoc(docRef, data);
      
      // Update cache
      this.cache.set(networkRPC.chainId, data);
      this.cacheExpiry.set(networkRPC.chainId, Date.now() + this.CACHE_DURATION);

      return true;
    } catch (error) {
      console.error('Error updating RPC config:', error);
      return false;
    }
  }

  /**
   * Get the best available RPC URL for a network
   */
  async getBestRPCUrl(chainId: number): Promise<string | null> {
    const networkRPC = await this.getNetworkRPC(chainId);
    if (!networkRPC) return null;

    // Try primary RPC first
    if (await this.testRPCUrl(networkRPC.rpcUrl)) {
      return networkRPC.rpcUrl;
    }

    // Try backup RPCs
    for (const backupUrl of networkRPC.backupRpcUrls) {
      if (await this.testRPCUrl(backupUrl)) {
        return backupUrl;
      }
    }

    return networkRPC.rpcUrl; // Return primary even if not tested
  }

  /**
   * Test if an RPC URL is working
   */
  private async testRPCUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_blockNumber',
          params: [],
          id: 1
        }),
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Initialize default network RPCs
   */
  async initializeDefaultRPCs(): Promise<void> {
    const defaultNetworks: Partial<NetworkRPC>[] = [
      // Ethereum Networks
      {
        chainId: 1,
        chainName: 'Ethereum',
        rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/',
        backupRpcUrls: [
          'https://mainnet.infura.io/v3/',
          'https://ethereum.publicnode.com'
        ],
        blockExplorer: 'https://etherscan.io',
        nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
        isTestnet: false,
        priority: 1
      },
      {
        chainId: 11155111,
        chainName: 'Ethereum Sepolia',
        rpcUrl: 'https://eth-sepolia.g.alchemy.com/v2/',
        backupRpcUrls: [
          'https://sepolia.infura.io/v3/',
          'https://rpc.sepolia.org'
        ],
        blockExplorer: 'https://sepolia.etherscan.io',
        nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
        isTestnet: true,
        priority: 2
      },
      // Base Networks
      {
        chainId: 8453,
        chainName: 'Base',
        rpcUrl: 'https://mainnet.base.org',
        backupRpcUrls: [
          'https://base-mainnet.g.alchemy.com/v2/',
          'https://base.publicnode.com'
        ],
        blockExplorer: 'https://basescan.org',
        nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
        isTestnet: false,
        priority: 3
      },
      {
        chainId: 84532,
        chainName: 'Base Sepolia',
        rpcUrl: 'https://sepolia.base.org',
        backupRpcUrls: [
          'https://base-sepolia.g.alchemy.com/v2/'
        ],
        blockExplorer: 'https://sepolia.basescan.org',
        nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
        isTestnet: true,
        priority: 4
      },
      // Arbitrum Networks
      {
        chainId: 42161,
        chainName: 'Arbitrum One',
        rpcUrl: 'https://arb1.arbitrum.io/rpc',
        backupRpcUrls: [
          'https://arbitrum-mainnet.g.alchemy.com/v2/',
          'https://arbitrum.publicnode.com'
        ],
        blockExplorer: 'https://arbiscan.io',
        nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
        isTestnet: false,
        priority: 5
      },
      {
        chainId: 421614,
        chainName: 'Arbitrum Sepolia',
        rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
        backupRpcUrls: [
          'https://arbitrum-sepolia.g.alchemy.com/v2/'
        ],
        blockExplorer: 'https://sepolia.arbiscan.io',
        nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
        isTestnet: true,
        priority: 6
      },
      // BSC Networks
      {
        chainId: 56,
        chainName: 'BNB Smart Chain',
        rpcUrl: 'https://bsc-dataseed1.binance.org',
        backupRpcUrls: [
          'https://bsc-dataseed2.binance.org',
          'https://bsc-dataseed3.binance.org'
        ],
        blockExplorer: 'https://bscscan.com',
        nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
        isTestnet: false,
        priority: 7
      },
      {
        chainId: 97,
        chainName: 'BNB Smart Chain Testnet',
        rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
        backupRpcUrls: [
          'https://data-seed-prebsc-2-s1.binance.org:8545'
        ],
        blockExplorer: 'https://testnet.bscscan.com',
        nativeCurrency: { name: 'tBNB', symbol: 'tBNB', decimals: 18 },
        isTestnet: true,
        priority: 8
      },
      // Avalanche Networks
      {
        chainId: 43114,
        chainName: 'Avalanche C-Chain',
        rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
        backupRpcUrls: [
          'https://avalanche-mainnet.g.alchemy.com/v2/',
          'https://avalanche.publicnode.com'
        ],
        blockExplorer: 'https://snowtrace.io',
        nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
        isTestnet: false,
        priority: 9
      },
      {
        chainId: 43113,
        chainName: 'Avalanche Fuji',
        rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
        backupRpcUrls: [
          'https://avalanche-fuji.g.alchemy.com/v2/'
        ],
        blockExplorer: 'https://testnet.snowtrace.io',
        nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
        isTestnet: true,
        priority: 10
      },
      // Polygon Networks
      {
        chainId: 80001,
        chainName: 'Polygon Mumbai',
        rpcUrl: 'https://polygon-mumbai.g.alchemy.com/v2/',
        backupRpcUrls: [
          'https://rpc-mumbai.maticvigil.com',
          'https://polygon-mumbai.infura.io/v3/'
        ],
        blockExplorer: 'https://mumbai.polygonscan.com',
        nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
        isTestnet: true,
        priority: 11
      },
      // Filecoin Networks
      {
        chainId: 314,
        chainName: 'Filecoin Mainnet',
        rpcUrl: 'https://api.node.glif.io/rpc/v1',
        backupRpcUrls: [
          'https://api.node.glif.io/rpc/v0'
        ],
        blockExplorer: 'https://filscan.io',
        nativeCurrency: { name: 'FIL', symbol: 'FIL', decimals: 18 },
        isTestnet: false,
        priority: 12
      },
      {
        chainId: 314159,
        chainName: 'Filecoin Calibration',
        rpcUrl: 'https://api.calibration.node.glif.io/rpc/v1',
        backupRpcUrls: [
          'https://api.calibration.node.glif.io/rpc/v0'
        ],
        blockExplorer: 'https://calibration.filscan.io',
        nativeCurrency: { name: 'tFIL', symbol: 'tFIL', decimals: 18 },
        isTestnet: true,
        priority: 13
      },
      // Worldchain
      {
        chainId: 480,
        chainName: 'Worldchain Testnet',
        rpcUrl: 'https://worldchain-testnet.g.alchemy.com/v2/',
        backupRpcUrls: [
          'https://worldchain-testnet.blockscout.com'
        ],
        blockExplorer: 'https://worldchain-testnet.blockscout.com',
        nativeCurrency: { name: 'WLD', symbol: 'WLD', decimals: 18 },
        isTestnet: true,
        priority: 14
      },
      // Yellow Network
      {
        chainId: 23011913,
        chainName: 'Yellow Network',
        rpcUrl: 'https://rpc.yellow.org',
        backupRpcUrls: [],
        blockExplorer: 'https://explorer.yellow.org',
        nativeCurrency: { name: 'YELLOW', symbol: 'YELLOW', decimals: 18 },
        isTestnet: false,
        priority: 15
      },
      // 0G Network
      {
        chainId: 2043,
        chainName: '0G Network',
        rpcUrl: 'https://rpc.0g.ai',
        backupRpcUrls: [],
        blockExplorer: 'https://explorer.0g.ai',
        nativeCurrency: { name: '0G', symbol: '0G', decimals: 18 },
        isTestnet: false,
        priority: 16
      }
    ];

    for (const network of defaultNetworks) {
      await this.updateNetworkRPC(network);
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }
}

export const rpcService = new RPCService();
