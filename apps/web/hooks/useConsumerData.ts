import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { reclaimService, ConsumerDataContribution, ProofRequest, ProofVerification } from '@/_utils/reclaim';

export interface ConsumerDataStats {
  totalContributions: number;
  totalDataCoins: number;
  bySource: Record<string, ConsumerDataContribution[]>;
  lastContribution?: ConsumerDataContribution;
}

export function useConsumerData() {
  const { address, isConnected } = useAccount();
  const [contributions, setContributions] = useState<ConsumerDataContribution[]>([]);
  const [stats, setStats] = useState<ConsumerDataStats>({
    totalContributions: 0,
    totalDataCoins: 0,
    bySource: {},
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize Reclaim SDK
  const initializeReclaim = useCallback(async () => {
    if (isInitialized) return true;
    
    setLoading(true);
    try {
      const success = await reclaimService.initialize();
      setIsInitialized(success);
      return success;
    } catch (err) {
      console.error('Failed to initialize Reclaim SDK:', err);
      setError('Failed to initialize Reclaim Protocol');
      return false;
    } finally {
      setLoading(false);
    }
  }, [isInitialized]);

  // Fetch user's consumer data contributions
  const fetchContributions = useCallback(async () => {
    if (!address || !isConnected) {
      setContributions([]);
      setStats({
        totalContributions: 0,
        totalDataCoins: 0,
        bySource: {},
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/consumer-data?userAddress=${address}`);
      const data = await response.json();

      if (data.success) {
        setContributions(data.contributions);
        setStats({
          totalContributions: data.count,
          totalDataCoins: data.totalDataCoins,
          bySource: data.bySource,
          lastContribution: data.contributions[data.contributions.length - 1],
        });
      } else {
        setError(data.error || 'Failed to fetch contributions');
      }
    } catch (err) {
      console.error('Error fetching consumer data:', err);
      setError('Network error or server unreachable');
    } finally {
      setLoading(false);
    }
  }, [address, isConnected]);

  // Request proof for a specific data source
  const requestProof = useCallback(async (dataSource: 'github' | 'uber' | 'amazon'): Promise<ProofRequest> => {
    if (!address) {
      return { success: false, error: 'Wallet not connected' };
    }

    if (!isInitialized) {
      const initialized = await initializeReclaim();
      if (!initialized) {
        return { success: false, error: 'Failed to initialize Reclaim SDK' };
      }
    }

    setLoading(true);
    setError(null);

    try {
      let result: ProofRequest;
      
      switch (dataSource) {
        case 'github':
          result = await reclaimService.requestGitHubProof(address);
          break;
        case 'uber':
          result = await reclaimService.requestUberProof(address);
          break;
        case 'amazon':
          result = await reclaimService.requestAmazonProof(address);
          break;
        default:
          result = { success: false, error: 'Unsupported data source' };
      }

      if (result.success) {
        // Store the request ID for later verification
        localStorage.setItem(`reclaim_request_${dataSource}`, result.requestId || '');
      }

      return result;
    } catch (err) {
      console.error('Error requesting proof:', err);
      return { success: false, error: 'Failed to request proof' };
    } finally {
      setLoading(false);
    }
  }, [address, isInitialized, initializeReclaim]);

  // Submit proof for verification
  const submitProof = useCallback(async (
    dataSource: 'github' | 'uber' | 'amazon',
    proofData: string
  ): Promise<{ success: boolean; dataCoinsEarned?: number; error?: string }> => {
    if (!address) {
      return { success: false, error: 'Wallet not connected' };
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/consumer-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: address,
          dataSource,
          proofData,
          requestId: localStorage.getItem(`reclaim_request_${dataSource}`),
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh contributions after successful submission
        await fetchContributions();
        
        // Clear the stored request ID
        localStorage.removeItem(`reclaim_request_${dataSource}`);
        
        return {
          success: true,
          dataCoinsEarned: data.dataCoinsEarned,
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to submit proof',
        };
      }
    } catch (err) {
      console.error('Error submitting proof:', err);
      return {
        success: false,
        error: 'Network error or server unreachable',
      };
    } finally {
      setLoading(false);
    }
  }, [address, fetchContributions]);

  // Mock verification for development/testing
  const mockVerify = useCallback(async (dataSource: 'github' | 'uber' | 'amazon') => {
    if (!address) {
      return { success: false, error: 'Wallet not connected' };
    }

    setLoading(true);
    setError(null);

    try {
      const verification = await reclaimService.mockVerifyProof(dataSource);
      
      if (verification.success) {
        // Submit the mock proof
        const result = await submitProof(dataSource, JSON.stringify(verification.data));
        return result;
      } else {
        return { success: false, error: 'Mock verification failed' };
      }
    } catch (err) {
      console.error('Error with mock verification:', err);
      return { success: false, error: 'Mock verification failed' };
    } finally {
      setLoading(false);
    }
  }, [address, submitProof]);

  // Get contributions by source
  const getContributionsBySource = useCallback((source: 'github' | 'uber' | 'amazon') => {
    return contributions.filter(contrib => contrib.dataSource === source);
  }, [contributions]);

  // Get total DataCoins from a specific source
  const getDataCoinsBySource = useCallback((source: 'github' | 'uber' | 'amazon') => {
    return contributions
      .filter(contrib => contrib.dataSource === source)
      .reduce((sum, contrib) => sum + contrib.dataCoinsEarned, 0);
  }, [contributions]);

  // Check if user has connected a specific data source
  const hasConnectedSource = useCallback((source: 'github' | 'uber' | 'amazon') => {
    return contributions.some(contrib => contrib.dataSource === source);
  }, [contributions]);

  // Initialize on mount
  useEffect(() => {
    if (isConnected && address) {
      initializeReclaim();
      fetchContributions();
    }
  }, [isConnected, address, initializeReclaim, fetchContributions]);

  return {
    // State
    contributions,
    stats,
    loading,
    error,
    isInitialized,
    
    // Actions
    requestProof,
    submitProof,
    mockVerify,
    fetchContributions,
    initializeReclaim,
    
    // Utilities
    getContributionsBySource,
    getDataCoinsBySource,
    hasConnectedSource,
  };
}
