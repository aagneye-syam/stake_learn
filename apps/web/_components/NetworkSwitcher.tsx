"use client";

import { useAccount, useSwitchChain, useChainId } from "wagmi";
import { sepolia } from "wagmi/chains";
import { useState, useEffect } from "react";

export function NetworkSwitcher() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  // If not connected, don't show anything
  if (!isConnected) {
    return null;
  }

  // If already on Sepolia, show success
  if (chainId === sepolia.id) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-sm font-medium text-green-800">Sepolia Testnet</span>
      </div>
    );
  }

  // If on wrong network, show switch button
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        <span className="text-sm font-medium text-red-800">Wrong Network</span>
      </div>
      
      <button
        onClick={() => switchChain({ chainId: sepolia.id })}
        disabled={isPending}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? "Switching..." : "Switch to Sepolia Testnet"}
      </button>
      
      <div className="text-xs text-gray-600 text-center">
        <p>You need to be on Sepolia testnet to use this app.</p>
        <p>Get test ETH from: <a href="https://sepoliafaucet.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">sepoliafaucet.com</a></p>
      </div>
    </div>
  );
}
