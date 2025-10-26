import { useState, useEffect, useCallback } from 'react';
import { rpcService, NetworkRPC } from '../lib/rpcService';

export function useNetworkRPC(chainId?: number) {
  const [networkRPC, setNetworkRPC] = useState<NetworkRPC | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNetworkRPC = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const rpc = await rpcService.getNetworkRPC(id);
      setNetworkRPC(rpc);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch network RPC');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (chainId) {
      fetchNetworkRPC(chainId);
    }
  }, [chainId]); // Remove fetchNetworkRPC from dependencies

  return {
    networkRPC,
    loading,
    error,
    refetch: () => chainId && fetchNetworkRPC(chainId)
  };
}

export function useAllNetworkRPCs() {
  const [networkRPCs, setNetworkRPCs] = useState<NetworkRPC[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllNetworkRPCs = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const rpcs = await rpcService.getAllNetworkRPCs();
      setNetworkRPCs(rpcs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch network RPCs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllNetworkRPCs();
  }, [fetchAllNetworkRPCs]);

  return {
    networkRPCs,
    loading,
    error,
    refetch: fetchAllNetworkRPCs
  };
}

export function useNetworkRPCSubscription() {
  const [networkRPCs, setNetworkRPCs] = useState<NetworkRPC[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = rpcService.subscribeToNetworkRPCs((networks) => {
      setNetworkRPCs(networks);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    networkRPCs,
    loading,
    error
  };
}

export function useBestRPCUrl(chainId: number) {
  const [rpcUrl, setRpcUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBestRPCUrl = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const url = await rpcService.getBestRPCUrl(id);
      setRpcUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get best RPC URL');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (chainId) {
      fetchBestRPCUrl(chainId);
    }
  }, [chainId, fetchBestRPCUrl]);

  return {
    rpcUrl,
    loading,
    error,
    refetch: () => chainId && fetchBestRPCUrl(chainId)
  };
}
