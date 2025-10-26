import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useTransactionsContext } from '@/_context/TransactionsContext';

export interface ReputationStats {
  totalReputation: number;
  reputationBreakdown: {
    courseCompletion: number;
    dataCoins: number;
    certificates: number;
    contributions: number;
  };
  recentGains: Array<{
    amount: number;
    source: string;
    timestamp: number;
    description: string;
  }>;
  lastGain?: {
    amount: number;
    source: string;
    timestamp: number;
    description: string;
  };
}

export function useReputation() {
  const { address } = useAccount();
  const { transactions, loading } = useTransactionsContext();
  const [reputationStats, setReputationStats] = useState<ReputationStats>({
    totalReputation: 0,
    reputationBreakdown: {
      courseCompletion: 0,
      dataCoins: 0,
      certificates: 0,
      contributions: 0,
    },
    recentGains: [],
  });

  const calculateReputationStats = useCallback(() => {
    if (!transactions || transactions.length === 0) {
      setReputationStats(prev => {
        if (prev.totalReputation === 0 && prev.recentGains.length === 0) {
          return prev; // No change needed
        }
        return {
          totalReputation: 0,
          reputationBreakdown: {
            courseCompletion: 0,
            dataCoins: 0,
            certificates: 0,
            contributions: 0,
          },
          recentGains: [],
        };
      });
      return;
    }

    let totalReputation = 0;
    const breakdown = {
      courseCompletion: 0,
      dataCoins: 0,
      certificates: 0,
      contributions: 0,
    };
    const recentGains: Array<{
      amount: number;
      source: string;
      timestamp: number;
      description: string;
    }> = [];

    transactions.forEach(tx => {
      let reputationGain = 0;
      let source = '';
      let description = '';

      switch (tx.type) {
        case 'complete':
          // Course completion gives reputation
          reputationGain = 50; // Base reputation for course completion
          source = 'courseCompletion';
          description = `Completed course ${tx.courseId}`;
          breakdown.courseCompletion += reputationGain;
          break;
        
        case 'datacoin':
          // DataCoin earning gives reputation
          const dataCoinAmount = parseFloat(tx.amount) || 0;
          reputationGain = Math.floor(dataCoinAmount * 2); // 2 reputation per DataCoin
          source = 'dataCoins';
          description = `Earned ${tx.amount} DataCoins`;
          breakdown.dataCoins += reputationGain;
          break;
        
        case 'mint':
          // SBT minting gives reputation
          reputationGain = 25; // Base reputation for SBT minting
          source = 'contributions';
          description = 'Minted SBT for contribution';
          breakdown.contributions += reputationGain;
          break;
        
        case 'stake':
          // Staking shows commitment, gives small reputation
          reputationGain = 5;
          source = 'contributions';
          description = `Staked for course ${tx.courseId}`;
          breakdown.contributions += reputationGain;
          break;
      }

      if (reputationGain > 0) {
        totalReputation += reputationGain;
        recentGains.push({
          amount: reputationGain,
          source,
          timestamp: tx.timestamp,
          description,
        });
      }
    });

    // Sort by timestamp (newest first)
    const sortedGains = recentGains.sort((a, b) => b.timestamp - a.timestamp);

    const newStats = {
      totalReputation,
      reputationBreakdown: breakdown,
      recentGains: sortedGains.slice(0, 10), // Last 10 gains
      lastGain: sortedGains.length > 0 ? sortedGains[0] : undefined,
    };

    setReputationStats(prev => {
      // Only update if data actually changed
      if (prev.totalReputation === newStats.totalReputation && 
          prev.recentGains.length === newStats.recentGains.length &&
          prev.recentGains[0]?.timestamp === newStats.recentGains[0]?.timestamp) {
        return prev;
      }
      return newStats;
    });
  }, [transactions]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      calculateReputationStats();
    }, 100); // Debounce by 100ms

    return () => clearTimeout(timeoutId);
  }, [calculateReputationStats]);

  return {
    ...reputationStats,
    loading,
    refetch: calculateReputationStats,
  };
}
