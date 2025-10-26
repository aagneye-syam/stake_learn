import { useState, useEffect, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { useTransactionsContext } from '@/_context/TransactionsContext';

export interface Activity {
  id: string;
  type: 'mint' | 'verify' | 'reputation';
  description: string;
  timestamp: string;
  status: 'success' | 'pending' | 'failed';
  hash?: string;
  amount?: string;
  courseId?: string;
}

// Map transaction types to ActivityCard supported types
const mapToActivityCardType = (txType: string): 'mint' | 'verify' | 'reputation' => {
  switch (txType) {
    case 'mint':
    case 'complete':
      return 'mint';
    case 'stake':
    case 'verify':
      return 'verify';
    case 'datacoin':
    case 'refund':
    case 'reputation':
    default:
      return 'reputation';
  }
};

export function useRecentActivity() {
  const { address } = useAccount();
  const { transactions, loading } = useTransactionsContext();

  const formatTimestamp = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - (timestamp * 1000); // Convert to milliseconds
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const generateActivityDescription = (tx: any): string => {
    switch (tx.type) {
      case 'mint':
        return `SBT Minted`;
      case 'verify':
        return `Contribution Verified`;
      case 'reputation':
        return `Reputation Gained`;
      case 'stake':
        return `Staked for Course ${tx.courseId}`;
      case 'complete':
        return `Completed Course ${tx.courseId}`;
      case 'refund':
        return `Refund Received`;
      case 'datacoin':
        return `Earned ${tx.amount} DataCoins`;
      default:
        return `Activity Completed`;
    }
  };

  const activities = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return [];
    }

    // Sort transactions by timestamp (newest first)
    const sortedTransactions = [...transactions].sort((a, b) => b.timestamp - a.timestamp);

    // Convert transactions to activities
    return sortedTransactions.slice(0, 10).map((tx, index) => ({
      id: tx.hash || `activity-${index}`,
      type: mapToActivityCardType(tx.type),
      description: generateActivityDescription(tx),
      timestamp: formatTimestamp(tx.timestamp),
      status: tx.status as Activity['status'],
      hash: tx.hash,
      amount: tx.amount,
      courseId: tx.courseId,
    }));
  }, [transactions]);

  return {
    activities,
    loading,
    refetch: () => {}, // No-op since we're using useMemo
  };
}
