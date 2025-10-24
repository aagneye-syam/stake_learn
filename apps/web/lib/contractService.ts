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

export interface ContractAddresses {
  id: string;
  chainId: number;
  chainName: string;
  stakingManager: string;
  soulbound: string;
  reputation: string;
  dataCoin?: string;
  isActive: boolean;
  lastUpdated: number;
  createdBy: string;
}

class ContractService {
  private cache: Map<number, ContractAddresses> = new Map();
  private cacheExpiry: Map<number, number> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private useFirebase: boolean;

  constructor() {
    this.useFirebase = process.env.NEXT_PUBLIC_USE_FIREBASE_RPC === 'true';
  }

  /**
   * Get contract addresses for a specific network
   */
  async getContractAddresses(chainId: number): Promise<ContractAddresses | null> {
    // Check cache first
    if (this.cache.has(chainId)) {
      const expiry = this.cacheExpiry.get(chainId) || 0;
      if (Date.now() < expiry) {
        return this.cache.get(chainId) || null;
      }
    }

    if (this.useFirebase) {
      return this.getContractAddressesFromFirebase(chainId);
    } else {
      return this.getContractAddressesFromEnv(chainId);
    }
  }

  /**
   * Get contract addresses from Firebase
   */
  private async getContractAddressesFromFirebase(chainId: number): Promise<ContractAddresses | null> {
    try {
      const docRef = doc(db, 'contractAddresses', chainId.toString());
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as ContractAddresses;
        this.cache.set(chainId, data);
        this.cacheExpiry.set(chainId, Date.now() + this.CACHE_DURATION);
        return data;
      }
    } catch (error) {
      console.error('Error fetching contract addresses from Firebase:', error);
    }

    return null;
  }

  /**
   * Get contract addresses from environment variables
   */
  private getContractAddressesFromEnv(chainId: number): ContractAddresses | null {
    const envVars = this.getEnvVarsForChain(chainId);
    if (!envVars) return null;

    const contractAddresses: ContractAddresses = {
      id: chainId.toString(),
      chainId,
      chainName: envVars.chainName,
      stakingManager: envVars.stakingManager,
      soulbound: envVars.soulbound,
      reputation: envVars.reputation,
      dataCoin: envVars.dataCoin,
      isActive: true,
      lastUpdated: Date.now(),
      createdBy: 'env'
    };

    this.cache.set(chainId, contractAddresses);
    this.cacheExpiry.set(chainId, Date.now() + this.CACHE_DURATION);
    return contractAddresses;
  }

  /**
   * Get all contract addresses
   */
  async getAllContractAddresses(): Promise<ContractAddresses[]> {
    if (this.useFirebase) {
      return this.getAllContractAddressesFromFirebase();
    } else {
      return this.getAllContractAddressesFromEnv();
    }
  }

  /**
   * Get all contract addresses from Firebase
   */
  private async getAllContractAddressesFromFirebase(): Promise<ContractAddresses[]> {
    try {
      const q = query(
        collection(db, 'contractAddresses'),
        orderBy('chainId', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      const contracts: ContractAddresses[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as ContractAddresses;
        if (data.isActive) {
          contracts.push(data);
          this.cache.set(data.chainId, data);
          this.cacheExpiry.set(data.chainId, Date.now() + this.CACHE_DURATION);
        }
      });

      return contracts;
    } catch (error) {
      console.error('Error fetching all contract addresses from Firebase:', error);
      return [];
    }
  }

  /**
   * Get all contract addresses from environment variables
   */
  private getAllContractAddressesFromEnv(): ContractAddresses[] {
    const contracts: ContractAddresses[] = [];
    
    // Define all supported chain IDs
    const supportedChainIds = [1, 11155111, 8453, 84532, 42161, 421614, 56, 97, 43114, 43113, 80001, 314, 314159, 480, 4801, 23011913, 2043];
    
    for (const chainId of supportedChainIds) {
      const contractConfig = this.getContractAddressesFromEnv(chainId);
      if (contractConfig && contractConfig.isActive) {
        contracts.push(contractConfig);
      }
    }

    return contracts.sort((a, b) => a.chainId - b.chainId);
  }

  /**
   * Get environment variables for a specific chain
   */
  private getEnvVarsForChain(chainId: number): any {
    const chainConfigs: { [key: number]: any } = {
      // Ethereum Mainnet
      1: {
        chainName: 'Ethereum',
        stakingManager: process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_ETHEREUM || '',
        soulbound: process.env.NEXT_PUBLIC_SOULBOUND_CONTRACT_ADDRESS_ETHEREUM || '',
        reputation: process.env.NEXT_PUBLIC_REPUTATION_CONTRACT_ADDRESS_ETHEREUM || '',
        dataCoin: process.env.NEXT_PUBLIC_DATACOIN_CONTRACT_ADDRESS_ETHEREUM || ''
      },
      // Ethereum Sepolia
      11155111: {
        chainName: 'Ethereum Sepolia',
        stakingManager: process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_SEPOLIA || '',
        soulbound: process.env.NEXT_PUBLIC_SOULBOUND_CONTRACT_ADDRESS_SEPOLIA || '',
        reputation: process.env.NEXT_PUBLIC_REPUTATION_CONTRACT_ADDRESS_SEPOLIA || '',
        dataCoin: process.env.NEXT_PUBLIC_DATACOIN_CONTRACT_ADDRESS_SEPOLIA || ''
      },
      // Base Mainnet
      8453: {
        chainName: 'Base',
        stakingManager: process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_BASE || '',
        soulbound: process.env.NEXT_PUBLIC_SOULBOUND_CONTRACT_ADDRESS_BASE || '',
        reputation: process.env.NEXT_PUBLIC_REPUTATION_CONTRACT_ADDRESS_BASE || '',
        dataCoin: process.env.NEXT_PUBLIC_DATACOIN_CONTRACT_ADDRESS_BASE || ''
      },
      // Base Sepolia
      84532: {
        chainName: 'Base Sepolia',
        stakingManager: process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_BASE_SEPOLIA || '',
        soulbound: process.env.NEXT_PUBLIC_SOULBOUND_CONTRACT_ADDRESS_BASE_SEPOLIA || '',
        reputation: process.env.NEXT_PUBLIC_REPUTATION_CONTRACT_ADDRESS_BASE_SEPOLIA || '',
        dataCoin: process.env.NEXT_PUBLIC_DATACOIN_CONTRACT_ADDRESS_BASE_SEPOLIA || ''
      },
      // Arbitrum One
      42161: {
        chainName: 'Arbitrum One',
        stakingManager: process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_ARBITRUM || '',
        soulbound: process.env.NEXT_PUBLIC_SOULBOUND_CONTRACT_ADDRESS_ARBITRUM || '',
        reputation: process.env.NEXT_PUBLIC_REPUTATION_CONTRACT_ADDRESS_ARBITRUM || '',
        dataCoin: process.env.NEXT_PUBLIC_DATACOIN_CONTRACT_ADDRESS_ARBITRUM || ''
      },
      // Arbitrum Sepolia
      421614: {
        chainName: 'Arbitrum Sepolia',
        stakingManager: process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_ARBITRUM_SEPOLIA || '',
        soulbound: process.env.NEXT_PUBLIC_SOULBOUND_CONTRACT_ADDRESS_ARBITRUM_SEPOLIA || '',
        reputation: process.env.NEXT_PUBLIC_REPUTATION_CONTRACT_ADDRESS_ARBITRUM_SEPOLIA || '',
        dataCoin: process.env.NEXT_PUBLIC_DATACOIN_CONTRACT_ADDRESS_ARBITRUM_SEPOLIA || ''
      },
      // BSC Mainnet
      56: {
        chainName: 'BNB Smart Chain',
        stakingManager: process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_BSC || '',
        soulbound: process.env.NEXT_PUBLIC_SOULBOUND_CONTRACT_ADDRESS_BSC || '',
        reputation: process.env.NEXT_PUBLIC_REPUTATION_CONTRACT_ADDRESS_BSC || '',
        dataCoin: process.env.NEXT_PUBLIC_DATACOIN_CONTRACT_ADDRESS_BSC || ''
      },
      // BSC Testnet
      97: {
        chainName: 'BNB Smart Chain Testnet',
        stakingManager: process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_BSC_TESTNET || '',
        soulbound: process.env.NEXT_PUBLIC_SOULBOUND_CONTRACT_ADDRESS_BSC_TESTNET || '',
        reputation: process.env.NEXT_PUBLIC_REPUTATION_CONTRACT_ADDRESS_BSC_TESTNET || '',
        dataCoin: process.env.NEXT_PUBLIC_DATACOIN_CONTRACT_ADDRESS_BSC_TESTNET || ''
      },
      // Avalanche C-Chain
      43114: {
        chainName: 'Avalanche C-Chain',
        stakingManager: process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_AVALANCHE || '',
        soulbound: process.env.NEXT_PUBLIC_SOULBOUND_CONTRACT_ADDRESS_AVALANCHE || '',
        reputation: process.env.NEXT_PUBLIC_REPUTATION_CONTRACT_ADDRESS_AVALANCHE || '',
        dataCoin: process.env.NEXT_PUBLIC_DATACOIN_CONTRACT_ADDRESS_AVALANCHE || ''
      },
      // Avalanche Fuji
      43113: {
        chainName: 'Avalanche Fuji',
        stakingManager: process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_AVALANCHE_FUJI || '',
        soulbound: process.env.NEXT_PUBLIC_SOULBOUND_CONTRACT_ADDRESS_AVALANCHE_FUJI || '',
        reputation: process.env.NEXT_PUBLIC_REPUTATION_CONTRACT_ADDRESS_AVALANCHE_FUJI || '',
        dataCoin: process.env.NEXT_PUBLIC_DATACOIN_CONTRACT_ADDRESS_AVALANCHE_FUJI || ''
      },
      // Polygon Mumbai
      80001: {
        chainName: 'Polygon Mumbai',
        stakingManager: process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_POLYGON_MUMBAI || '',
        soulbound: process.env.NEXT_PUBLIC_SOULBOUND_CONTRACT_ADDRESS_POLYGON_MUMBAI || '',
        reputation: process.env.NEXT_PUBLIC_REPUTATION_CONTRACT_ADDRESS_POLYGON_MUMBAI || '',
        dataCoin: process.env.NEXT_PUBLIC_DATACOIN_CONTRACT_ADDRESS_POLYGON_MUMBAI || ''
      },
      // Filecoin Mainnet
      314: {
        chainName: 'Filecoin Mainnet',
        stakingManager: process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_FILECOIN || '',
        soulbound: process.env.NEXT_PUBLIC_SOULBOUND_CONTRACT_ADDRESS_FILECOIN || '',
        reputation: process.env.NEXT_PUBLIC_REPUTATION_CONTRACT_ADDRESS_FILECOIN || '',
        dataCoin: process.env.NEXT_PUBLIC_DATACOIN_CONTRACT_ADDRESS_FILECOIN || ''
      },
      // Filecoin Calibration
      314159: {
        chainName: 'Filecoin Calibration',
        stakingManager: process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_FILECOIN_CALIBRATION || '',
        soulbound: process.env.NEXT_PUBLIC_SOULBOUND_CONTRACT_ADDRESS_FILECOIN_CALIBRATION || '',
        reputation: process.env.NEXT_PUBLIC_REPUTATION_CONTRACT_ADDRESS_FILECOIN_CALIBRATION || '',
        dataCoin: process.env.NEXT_PUBLIC_DATACOIN_CONTRACT_ADDRESS_FILECOIN_CALIBRATION || ''
      },
      // Worldchain Testnet
      480: {
        chainName: 'Worldchain Testnet',
        stakingManager: process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_WORLDCHAIN || '',
        soulbound: process.env.NEXT_PUBLIC_SOULBOUND_CONTRACT_ADDRESS_WORLDCHAIN || '',
        reputation: process.env.NEXT_PUBLIC_REPUTATION_CONTRACT_ADDRESS_WORLDCHAIN || '',
        dataCoin: process.env.NEXT_PUBLIC_DATACOIN_CONTRACT_ADDRESS_WORLDCHAIN || ''
      },
      // Worldchain Mainnet
      4801: {
        chainName: 'Worldchain Mainnet',
        stakingManager: process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_WORLDCHAIN_MAINNET || '',
        soulbound: process.env.NEXT_PUBLIC_SOULBOUND_CONTRACT_ADDRESS_WORLDCHAIN_MAINNET || '',
        reputation: process.env.NEXT_PUBLIC_REPUTATION_CONTRACT_ADDRESS_WORLDCHAIN_MAINNET || '',
        dataCoin: process.env.NEXT_PUBLIC_DATACOIN_CONTRACT_ADDRESS_WORLDCHAIN_MAINNET || ''
      },
      // Yellow Network
      23011913: {
        chainName: 'Yellow Network',
        stakingManager: process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_YELLOW || '',
        soulbound: process.env.NEXT_PUBLIC_SOULBOUND_CONTRACT_ADDRESS_YELLOW || '',
        reputation: process.env.NEXT_PUBLIC_REPUTATION_CONTRACT_ADDRESS_YELLOW || '',
        dataCoin: process.env.NEXT_PUBLIC_DATACOIN_CONTRACT_ADDRESS_YELLOW || ''
      },
      // 0G Network
      2043: {
        chainName: '0G Network',
        stakingManager: process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_0G || '',
        soulbound: process.env.NEXT_PUBLIC_SOULBOUND_CONTRACT_ADDRESS_0G || '',
        reputation: process.env.NEXT_PUBLIC_REPUTATION_CONTRACT_ADDRESS_0G || '',
        dataCoin: process.env.NEXT_PUBLIC_DATACOIN_CONTRACT_ADDRESS_0G || ''
      }
    };

    const config = chainConfigs[chainId];
    if (!config || !config.stakingManager) return null;

    return config;
  }

  /**
   * Update or create contract addresses
   */
  async updateContractAddresses(contractAddresses: Partial<ContractAddresses>): Promise<boolean> {
    if (!this.useFirebase) {
      console.warn('Cannot update contract addresses in environment mode. Use environment variables instead.');
      return false;
    }

    try {
      if (!contractAddresses.chainId) {
        throw new Error('Chain ID is required');
      }

      const docRef = doc(db, 'contractAddresses', contractAddresses.chainId.toString());

      const data: ContractAddresses = {
        id: contractAddresses.chainId.toString(),
        chainId: contractAddresses.chainId,
        chainName: contractAddresses.chainName || '',
        stakingManager: contractAddresses.stakingManager || '',
        soulbound: contractAddresses.soulbound || '',
        reputation: contractAddresses.reputation || '',
        dataCoin: contractAddresses.dataCoin || '',
        isActive: contractAddresses.isActive !== undefined ? contractAddresses.isActive : true,
        lastUpdated: Date.now(),
        createdBy: contractAddresses.createdBy || 'system'
      };

      await setDoc(docRef, data);
      
      // Update cache
      this.cache.set(contractAddresses.chainId, data);
      this.cacheExpiry.set(contractAddresses.chainId, Date.now() + this.CACHE_DURATION);

      return true;
    } catch (error) {
      console.error('Error updating contract addresses:', error);
      return false;
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

export const contractService = new ContractService();
