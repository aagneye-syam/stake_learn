"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAccount } from 'wagmi';

export interface Transaction {
  hash: string;
  type: 'stake' | 'complete' | 'refund' | 'datacoin';
  amount: string;
  courseId: string;
  timestamp: number;
  status: string;
  blockNumber: number;
  certificateCID?: string;
  reason?: string;
}

interface TransactionsContextType {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'hash' | 'timestamp' | 'blockNumber'>) => Promise<any>;
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

export function TransactionsProvider({ children }: { children: React.ReactNode }) {
  const { address } = useAccount();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Cache management
  const cacheRef = useRef<{
    data: Transaction[];
    timestamp: number;
    address: string | null;
  }>({
    data: [],
    timestamp: 0,
    address: null
  });
  
  const CACHE_DURATION = 5000; // 5 seconds cache
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchTransactions = useCallback(async (forceRefresh = false) => {
    if (!address) {
      setTransactions([]);
      return;
    }

    // Check cache
    const now = Date.now();
    const isCacheValid = 
      !forceRefresh &&
      cacheRef.current.address === address &&
      cacheRef.current.timestamp > now - CACHE_DURATION;

    if (isCacheValid) {
      setTransactions(cacheRef.current.data);
      return;
    }

    // Clear any pending fetch timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/transactions?userAddress=${address}`);
      const data = await response.json();

      if (response.ok) {
        const fetchedTransactions = data.transactions || [];
        setTransactions(fetchedTransactions);
        
        // Update cache
        cacheRef.current = {
          data: fetchedTransactions,
          timestamp: now,
          address: address
        };
      } else {
        setError(data.error || 'Failed to fetch transactions');
      }
    } catch (err) {
      setError('Network error');
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  }, [address]);

  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'hash' | 'timestamp' | 'blockNumber'>) => {
    if (!address) return;

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: address,
          ...transaction,
          timestamp: Math.floor(Date.now() / 1000),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Force refresh after adding transaction
        await fetchTransactions(true);
        return data.transaction;
      } else {
        throw new Error(data.error || 'Failed to add transaction');
      }
    } catch (err) {
      console.error('Error adding transaction:', err);
      throw err;
    }
  }, [address, fetchTransactions]);

  // Debounced fetch on address change
  useEffect(() => {
    if (address) {
      // Clear any existing timeout
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }

      // Debounce the fetch by 300ms
      fetchTimeoutRef.current = setTimeout(() => {
        fetchTransactions();
      }, 300);
    } else {
      setTransactions([]);
      cacheRef.current = { data: [], timestamp: 0, address: null };
    }

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [address, fetchTransactions]);

  const value: TransactionsContextType = {
    transactions,
    loading,
    error,
    refetch: () => fetchTransactions(true),
    addTransaction,
  };

  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  );
}

export function useTransactionsContext() {
  const context = useContext(TransactionsContext);
  if (context === undefined) {
    throw new Error('useTransactionsContext must be used within a TransactionsProvider');
  }
  return context;
}
