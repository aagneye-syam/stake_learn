"use client";

import { useAccount, useChainId } from "wagmi";
import { NETWORKS } from "../config/contracts";
import { useState, useEffect } from "react";

interface NetworkStatusProps {
  className?: string;
  showDetails?: boolean;
}

export function NetworkStatus({ 
  className = "", 
  showDetails = false 
}: NetworkStatusProps) {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isConnected) {
    return null;
  }

  const isSupportedChain = Object.values(NETWORKS).some(network => network.chainId === chainId);
  const currentNetwork = Object.values(NETWORKS).find(network => network.chainId === chainId);

  if (!isSupportedChain) {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        <span className="text-sm font-medium text-red-800">Unsupported Network</span>
        {showDetails && (
          <span className="text-xs text-red-600">(Chain ID: {chainId})</span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg ${className}`}>
      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      <span className="text-sm font-medium text-green-800">{currentNetwork?.chainName}</span>
      {showDetails && (
        <span className="text-xs text-green-600">
          ({currentNetwork?.nativeCurrency.symbol} • ID: {chainId})
        </span>
      )}
    </div>
  );
}
