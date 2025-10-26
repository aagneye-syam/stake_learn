import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useTransactionsContext } from '@/_context/TransactionsContext';

export interface SBTStats {
  totalSBTs: number;
  recentSBTs: Array<{
    hash: string;
    timestamp: number;
    reason: string;
    status: string;
  }>;
  lastMinted?: {
    hash: string;
    timestamp: number;
    reason: string;
  };
}

export function useSBT() {
  const { address } = useAccount();
  const { transactions, loading } = useTransactionsContext();
  const [sbtStats, setSbtStats] = useState<SBTStats>({
    totalSBTs: 0,
    recentSBTs: [],
  });

  const calculateSBTStats = useCallback(() => {
    if (!transactions || transactions.length === 0) {
      setSbtStats(prev => {
        if (prev.totalSBTs === 0 && prev.recentSBTs.length === 0) {
          return prev; // No change needed
        }
        return {
          totalSBTs: 0,
          recentSBTs: [],
        };
      });
      return;
    }

    // Filter for SBT-related transactions
    // SBTs are typically minted when verifying contributions
    const sbtTransactions = transactions.filter(tx => 
      tx.type === 'mint' || 
      (tx.type === 'complete' && tx.certificateCID) ||
      tx.reason?.includes('SBT') ||
      tx.reason?.includes('Soulbound')
    );

    // Sort by timestamp (newest first)
    const sortedSBTs = sbtTransactions.sort((a, b) => b.timestamp - a.timestamp);

    const newStats = {
      totalSBTs: sbtTransactions.length,
      recentSBTs: sortedSBTs.slice(0, 5).map(tx => ({
        hash: tx.hash,
        timestamp: tx.timestamp,
        reason: tx.reason || 'SBT Minted',
        status: tx.status,
      })),
      lastMinted: sortedSBTs.length > 0 ? {
        hash: sortedSBTs[0].hash,
        timestamp: sortedSBTs[0].timestamp,
        reason: sortedSBTs[0].reason || 'SBT Minted',
      } : undefined,
    };

    setSbtStats(prev => {
      // Only update if data actually changed
      if (prev.totalSBTs === newStats.totalSBTs && 
          prev.recentSBTs.length === newStats.recentSBTs.length &&
          prev.recentSBTs[0]?.hash === newStats.recentSBTs[0]?.hash) {
        return prev;
      }
      return newStats;
    });
  }, [transactions]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      calculateSBTStats();
    }, 100); // Debounce by 100ms

    return () => clearTimeout(timeoutId);
  }, [calculateSBTStats]);

  return {
    ...sbtStats,
    loading,
    refetch: calculateSBTStats,
  };
}
