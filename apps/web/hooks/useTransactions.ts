import { useTransactionsContext } from '@/_context/TransactionsContext';

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

/**
 * Hook to access transactions from the centralized context
 * This prevents multiple API calls by using a shared cache
 */
export function useTransactions() {
  const { transactions, loading, error, refetch, addTransaction } = useTransactionsContext();

  return {
    transactions,
    loading,
    error,
    fetchTransactions: refetch,
    addTransaction,
  };
}
