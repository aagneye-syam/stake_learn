import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

export interface DataCoinTransaction {
  id: string;
  amount: number;
  reason: string;
  timestamp: number;
  courseId?: string;
}

export function useLocalDataCoin() {
  const { address } = useAccount();
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<DataCoinTransaction[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDataCoinBalance = async () => {
    if (!address) return;

    setLoading(true);
    try {
      // Fetch transactions from our API
      const response = await fetch(`/api/transactions?userAddress=${address}`);
      const data = await response.json();

      if (response.ok && data.transactions) {
        // Filter DataCoin transactions
        const dataCoinTransactions = data.transactions.filter(
          (tx: any) => tx.type === 'datacoin'
        );

        // Calculate total balance
        const totalBalance = dataCoinTransactions.reduce(
          (sum: number, tx: any) => sum + parseFloat(tx.amount || '0'),
          0
        );

        setBalance(totalBalance);
        setTransactions(dataCoinTransactions);
      }
    } catch (error) {
      console.error('Error fetching DataCoin balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const addDataCoinTransaction = async (amount: number, reason: string, courseId?: string) => {
    if (!address) return;

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: address,
          type: 'datacoin',
          amount: amount.toString(),
          courseId: courseId || '0',
          hash: `0x${Math.random().toString(16).substring(2, 66)}`,
          timestamp: Math.floor(Date.now() / 1000),
          status: 'success',
          reason: reason
        }),
      });

      if (response.ok) {
        // Refresh balance
        await fetchDataCoinBalance();
      }
    } catch (error) {
      console.error('Error adding DataCoin transaction:', error);
    }
  };

  useEffect(() => {
    if (address) {
      fetchDataCoinBalance();
    }
  }, [address]);

  return {
    balance,
    transactions,
    loading,
    refetch: fetchDataCoinBalance,
    addTransaction: addDataCoinTransaction,
  };
}
