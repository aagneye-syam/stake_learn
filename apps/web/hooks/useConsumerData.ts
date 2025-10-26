import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { getReclaimService } from '@/utils/reclaim';

export interface ConsumerDataStats {
  totalContributions: number;
  totalDataCoins: number;
  bySource: {
    github: number;
    uber: number;
    amazon: number;
  };
  lastContribution: number | null;
}

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
  isFirstVerification: boolean;
}

export function useConsumerData() {
  const { address, isConnected } = useAccount();
  const [contributions, setContributions] = useState<ConsumerDataContribution[]>([]);
  const [stats, setStats] = useState<ConsumerDataStats>({
    totalContributions: 0,
    totalDataCoins: 0,
    bySource: { github: 0, uber: 0, amazon: 0 },
    lastContribution: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch consumer data contributions
  const fetchContributions = useCallback(async () => {
    if (!address || !isConnected) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/consumer-data?userAddress=${address}`);
      if (!response.ok) {
        throw new Error('Failed to fetch consumer data');
      }

      const data = await response.json();
      setContributions(data.contributions || []);
      setStats(data.stats || {
        totalContributions: 0,
        totalDataCoins: 0,
        bySource: { github: 0, uber: 0, amazon: 0 },
        lastContribution: null
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching consumer data:', err);
    } finally {
      setLoading(false);
    }
  }, [address, isConnected]);

  // Initialize Reclaim service
  const initializeReclaim = useCallback(async () => {
    try {
      const reclaimService = getReclaimService();
      await reclaimService.initialize();
    } catch (err) {
      console.warn('Failed to initialize Reclaim service:', err);
    }
  }, []);

  // Request proof for specific data source
  const requestProof = useCallback(async (dataSource: 'github' | 'uber' | 'amazon') => {
    if (!address) return { success: false, error: 'No wallet connected' };

    try {
      const reclaimService = getReclaimService();
      
      let proofRequest;
      switch (dataSource) {
        case 'github':
          proofRequest = await reclaimService.requestGitHubProof(address);
          break;
        case 'uber':
          proofRequest = await reclaimService.requestUberProof(address);
          break;
        case 'amazon':
          proofRequest = await reclaimService.requestAmazonProof(address);
          break;
        default:
          return { success: false, error: 'Invalid data source' };
      }

      return proofRequest;
    } catch (err) {
      console.error('Error requesting proof:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      };
    }
  }, [address]);

  // Submit proof and verify data
  const submitProof = useCallback(async (
    dataSource: 'github' | 'uber' | 'amazon',
    proofData: string,
    zkProof: string
  ) => {
    if (!address) return { success: false, error: 'No wallet connected' };

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/consumer-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: address,
          dataSource,
          proofData,
          zkProof
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit proof');
      }

      // Refresh contributions after successful submission
      await fetchContributions();

      return {
        success: true,
        contribution: data.contribution,
        dataCoinsEarned: data.dataCoinsEarned,
        transactionHash: data.transactionHash
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [address, fetchContributions]);

  // Check if user has connected a specific data source
  const hasConnectedSource = useCallback((source: 'github' | 'uber' | 'amazon') => {
    return contributions.some(c => c.dataSource === source && c.verified);
  }, [contributions]);

  // Get DataCoins earned from specific source
  const getDataCoinsBySource = useCallback((source: 'github' | 'uber' | 'amazon') => {
    return contributions
      .filter(c => c.dataSource === source && c.verified)
      .reduce((sum, c) => sum + c.dataCoinsEarned, 0);
  }, [contributions]);

  // Load contributions on mount and when address changes
  useEffect(() => {
    if (address && isConnected) {
      fetchContributions();
      initializeReclaim();
    }
  }, [address, isConnected, fetchContributions, initializeReclaim]);

  return {
    contributions,
    stats,
    loading,
    error,
    fetchContributions,
    requestProof,
    submitProof,
    hasConnectedSource,
    getDataCoinsBySource,
    initializeReclaim
  };
}