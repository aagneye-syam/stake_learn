import { useState, useEffect, useCallback } from 'react';
import { contractService, ContractAddresses } from '../lib/contractService';

export function useContractAddresses(chainId?: number) {
  const [contractAddresses, setContractAddresses] = useState<ContractAddresses | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContractAddresses = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const addresses = await contractService.getContractAddresses(id);
      setContractAddresses(addresses);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch contract addresses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (chainId) {
      fetchContractAddresses(chainId);
    }
  }, [chainId]); // Remove fetchContractAddresses from dependencies

  return {
    contractAddresses,
    loading,
    error,
    refetch: () => chainId && fetchContractAddresses(chainId)
  };
}

export function useAllContractAddresses() {
  const [contractAddresses, setContractAddresses] = useState<ContractAddresses[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllContractAddresses = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const addresses = await contractService.getAllContractAddresses();
      setContractAddresses(addresses);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch contract addresses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllContractAddresses();
  }, []); // Remove fetchAllContractAddresses from dependencies

  return {
    contractAddresses,
    loading,
    error,
    refetch: fetchAllContractAddresses
  };
}

/**
 * Hook to get contract addresses for the current chain
 * Returns the contract addresses for the specified chain ID
 */
export function useCurrentContractAddresses(chainId: number) {
  const { contractAddresses, loading, error } = useContractAddresses(chainId);

  return {
    stakingManager: contractAddresses?.stakingManager,
    soulbound: contractAddresses?.soulbound,
    reputation: contractAddresses?.reputation,
    dataCoin: contractAddresses?.dataCoin,
    isActive: contractAddresses?.isActive,
    loading,
    error
  };
}
