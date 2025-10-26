// Reclaim Protocol SDK wrapper for consumer data verification
export class ReclaimService {
  private reclaim: any;
  private appId: string;
  private appSecret: string;

  constructor() {
    this.appId = process.env.RECLAIM_APP_ID || '';
    this.appSecret = process.env.RECLAIM_APP_SECRET || '';
    
    if (!this.appId || !this.appSecret) {
      console.warn('Reclaim credentials not found. Consumer data verification will be mocked.');
      this.reclaim = null;
      return;
    }

    // Initialize Reclaim SDK with dynamic import (non-blocking)
    this.initializeReclaim().catch(error => {
      console.warn('Reclaim SDK initialization failed, using mock mode:', error);
    });
  }

  private async initializeReclaim() {
    try {
      // Dynamic import to handle ES modules properly
      const ReclaimSDK = await import('@reclaimprotocol/js-sdk');
      
      // The SDK exports functions directly, not a class
      this.reclaim = ReclaimSDK;
      console.log('Reclaim SDK initialized successfully');
    } catch (error) {
      console.warn('Failed to initialize Reclaim SDK, using mock mode:', error);
      this.reclaim = null;
    }
  }

  // Initialize Reclaim SDK for frontend
  async initialize() {
    // Ensure Reclaim SDK is initialized
    if (!this.reclaim) {
      await this.initializeReclaim();
    }
    
    if (!this.reclaim) {
      console.warn('Reclaim SDK not available, using mock mode');
      return true; // Return true for mock mode
    }
    
    try {
      await this.reclaim.init();
      return true;
    } catch (error) {
      console.error('Failed to initialize Reclaim SDK:', error);
      return true; // Return true for mock mode
    }
  }

  // Request GitHub contribution proof
  async requestGitHubProof(userAddress: string) {
    // Ensure Reclaim SDK is initialized
    if (!this.reclaim) {
      await this.initializeReclaim();
    }
    
    if (!this.reclaim) {
      return {
        success: false,
        error: 'Reclaim SDK not available. Please set up Reclaim credentials.',
      };
    }

    try {
      const proofRequest = await this.reclaim.requestProof({
        provider: 'github',
        data: {
          // Request GitHub contribution data
          commits: true,
          pullRequests: true,
          issues: true,
          repositories: true,
        },
        userAddress: userAddress,
      });

      return {
        success: true,
        requestId: proofRequest.requestId,
        url: proofRequest.url,
      };
    } catch (error) {
      console.error('Failed to request GitHub proof:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Request Uber ride data proof
  async requestUberProof(userAddress: string) {
    // Ensure Reclaim SDK is initialized
    if (!this.reclaim) {
      await this.initializeReclaim();
    }
    
    if (!this.reclaim) {
      return {
        success: false,
        error: 'Reclaim SDK not available. Please set up Reclaim credentials.',
      };
    }

    try {
      const proofRequest = await this.reclaim.requestProof({
        provider: 'uber',
        data: {
          // Request Uber ride data
          rides: true,
          totalDistance: true,
          totalSpent: true,
        },
        userAddress: userAddress,
      });

      return {
        success: true,
        requestId: proofRequest.requestId,
        url: proofRequest.url,
      };
    } catch (error) {
      console.error('Failed to request Uber proof:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Request Amazon purchase data proof
  async requestAmazonProof(userAddress: string) {
    // Ensure Reclaim SDK is initialized
    if (!this.reclaim) {
      await this.initializeReclaim();
    }
    
    if (!this.reclaim) {
      return {
        success: false,
        error: 'Reclaim SDK not available. Please set up Reclaim credentials.',
      };
    }

    try {
      const proofRequest = await this.reclaim.requestProof({
        provider: 'amazon',
        data: {
          // Request Amazon purchase data
          orders: true,
          categories: true,
          totalSpent: true,
        },
        userAddress: userAddress,
      });

      return {
        success: true,
        requestId: proofRequest.requestId,
        url: proofRequest.url,
      };
    } catch (error) {
      console.error('Failed to request Amazon proof:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Verify submitted proof
  async verifyProof(proofData: string, dataSource: 'github' | 'uber' | 'amazon') {
    // Ensure Reclaim SDK is initialized
    if (!this.reclaim) {
      await this.initializeReclaim();
    }
    
    if (!this.reclaim) {
      return {
        success: false,
        error: 'Reclaim SDK not available. Please set up Reclaim credentials.',
      };
    }

    try {
      const verification = await this.reclaim.verifyProof(proofData);
      
      if (!verification.isValid) {
        return {
          success: false,
          error: 'Invalid proof',
        };
      }

      // Parse the verified data based on source
      const parsedData = this.parseVerifiedData(verification.data, dataSource);
      
      return {
        success: true,
        data: parsedData,
        proofHash: verification.proofHash,
      };
    } catch (error) {
      console.error('Failed to verify proof:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Verification failed',
      };
    }
  }

  // Parse verified data based on source
  private parseVerifiedData(data: any, dataSource: string) {
    switch (dataSource) {
      case 'github':
        return {
          commits: data.commits || 0,
          pullRequests: data.pullRequests || 0,
          issues: data.issues || 0,
          repositories: data.repositories || 0,
          contributionStreak: data.contributionStreak || 0,
          totalContributions: (data.commits || 0) + (data.pullRequests || 0) + (data.issues || 0),
        };
      
      case 'uber':
        return {
          rides: data.rides || 0,
          totalDistance: data.totalDistance || 0,
          totalSpent: data.totalSpent || 0,
          averageRideCost: data.totalSpent && data.rides ? data.totalSpent / data.rides : 0,
        };
      
      case 'amazon':
        return {
          orders: data.orders || 0,
          categories: data.categories || [],
          totalSpent: data.totalSpent || 0,
          averageOrderValue: data.totalSpent && data.orders ? data.totalSpent / data.orders : 0,
        };
      
      default:
        return data;
    }
  }

  // Calculate DataCoins based on verified data
  calculateDataCoins(data: any, dataSource: string): number {
    switch (dataSource) {
      case 'github':
        // 10 DataCoins per contribution batch (commits + PRs + issues)
        return Math.min(data.totalContributions * 10, 100); // Cap at 100 DataCoins
      
      case 'uber':
        // 5 DataCoins per month of data, based on ride frequency
        const monthsOfData = Math.min(data.rides / 10, 12); // Assume 10 rides per month
        return Math.floor(monthsOfData * 5);
      
      case 'amazon':
        // 5 DataCoins per month of data, based on order frequency
        const monthsOfOrders = Math.min(data.orders / 5, 12); // Assume 5 orders per month
        return Math.floor(monthsOfOrders * 5);
      
      default:
        return 0;
    }
  }

  // Mock verification for development/testing
  async mockVerifyProof(dataSource: 'github' | 'uber' | 'amazon') {
    const mockData = {
      github: {
        commits: 25,
        pullRequests: 8,
        issues: 12,
        repositories: 5,
        contributionStreak: 30,
        totalContributions: 45,
      },
      uber: {
        rides: 45,
        totalDistance: 120.5,
        totalSpent: 180.75,
        averageRideCost: 4.02,
      },
      amazon: {
        orders: 18,
        categories: ['Electronics', 'Books', 'Clothing'],
        totalSpent: 450.30,
        averageOrderValue: 25.02,
      },
    };

    return {
      success: true,
      data: mockData[dataSource],
      proofHash: `mock_proof_${dataSource}_${Date.now()}`,
    };
  }
}

// Export singleton instance
export const reclaimService = new ReclaimService();

// Export types
export interface ConsumerDataContribution {
  userAddress: string;
  dataSource: 'github' | 'uber' | 'amazon';
  proofCid: string;
  zkProof: string;
  dataHash: string;
  timestamp: number;
  dataCoinsEarned: number;
  verified: boolean;
  data: any;
}

export interface ProofRequest {
  success: boolean;
  requestId?: string;
  url?: string;
  error?: string;
}

export interface ProofVerification {
  success: boolean;
  data?: any;
  proofHash?: string;
  error?: string;
}
