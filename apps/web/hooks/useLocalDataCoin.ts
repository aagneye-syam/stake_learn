import { useState, useEffect, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { useTransactionsContext } from '@/_context/TransactionsContext';

export interface DataCoinTransaction {
  id: string;
  amount: number;
  reason: string;
  timestamp: number;
  courseId?: string;
}

export function useLocalDataCoin() {
  const { address } = useAccount();
  const { transactions, loading, refetch, addTransaction } = useTransactionsContext();

  // Calculate balance from cached transactions
  const balance = useMemo(() => {
    const dataCoinTransactions = transactions.filter(
      (tx: any) => tx.type === 'datacoin'
    );
    return dataCoinTransactions.reduce(
      (sum: number, tx: any) => sum + parseFloat(tx.amount || '0'),
      0
    );
  }, [transactions]);

  // Filter DataCoin transactions
  const dataCoinTransactions = useMemo(() => {
    return transactions.filter((tx: any) => tx.type === 'datacoin');
  }, [transactions]);

  const addDataCoinTransaction = async (amount: number, reason: string, courseId?: string) => {
    if (!address) return;

    try {
      await addTransaction({
        type: 'datacoin',
        amount: amount.toString(),
        courseId: courseId || '0',
        status: 'success',
        reason: reason
      });
    } catch (error) {
      console.error('Error adding DataCoin transaction:', error);
    }
  };

  return {
    balance,
    transactions: dataCoinTransactions,
    loading,
    refetch,
    addTransaction: addDataCoinTransaction,
  };
}
