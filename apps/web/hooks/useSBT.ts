import { useState, useEffect, useMemo } from 'react';
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

  const sbtStats = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return {
        totalSBTs: 0,
        recentSBTs: [],
      };
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

    return {
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
  }, [transactions]);

  return {
    ...sbtStats,
    loading: loading && transactions.length === 0, // Only show loading if no transactions yet
    refetch: () => {}, // No-op since we're using useMemo
  };
}
