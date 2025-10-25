import { useState, useEffect } from 'react';
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

export function useTransactions() {
  const { address } = useAccount();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    if (!address) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/transactions?userAddress=${address}`);
      const data = await response.json();

      if (response.ok) {
        setTransactions(data.transactions || []);
      } else {
        setError(data.error || 'Failed to fetch transactions');
      }
    } catch (err) {
      setError('Network error');
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'hash' | 'timestamp' | 'blockNumber'>) => {
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
        // Refresh transactions
        await fetchTransactions();
        return data.transaction;
      } else {
        throw new Error(data.error || 'Failed to add transaction');
      }
    } catch (err) {
      console.error('Error adding transaction:', err);
      throw err;
    }
  };

  useEffect(() => {
    if (address) {
      fetchTransactions();
    }
  }, [address]);

  return {
    transactions,
    loading,
    error,
    fetchTransactions,
    addTransaction,
  };
}
