"use client";

import { useAccount, useSwitchChain, useChainId } from "wagmi";
import { 
  sepolia, 
  base, 
  baseSepolia, 
  arbitrumSepolia,
  arbitrum,
  bsc,
  bscTestnet,
  avalanche,
  avalancheFuji,
  polygonMumbai
} from "wagmi/chains";
import { NETWORKS } from "../config/contracts";
import { useState, useEffect } from "react";

// Define supported chains for wagmi
const supportedChains = [
  sepolia, 
  base, 
  baseSepolia, 
  arbitrumSepolia,
  arbitrum,
  bsc,
  bscTestnet,
  avalanche,
  avalancheFuji,
  polygonMumbai
];

export function NetworkSwitcher() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();
  const [mounted, setMounted] = useState(false);
  const [showNetworkSelector, setShowNetworkSelector] = useState(false);

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

  // Check if current chain is supported
  const isSupportedChain = Object.values(NETWORKS).some(network => network.chainId === chainId);
  const currentNetwork = Object.values(NETWORKS).find(network => network.chainId === chainId);

  // If on supported network, show success with network selector
  if (isSupportedChain && currentNetwork) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-green-800">{currentNetwork.chainName}</span>
          <button
            onClick={() => setShowNetworkSelector(!showNetworkSelector)}
            className="ml-2 text-xs text-blue-600 hover:underline"
          >
            {showNetworkSelector ? "Hide Networks" : "Switch Network"}
          </button>
        </div>
        
        {showNetworkSelector && (
          <div className="space-y-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm font-medium text-gray-700">Choose a network:</p>
            
            {/* Testnet Networks */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500 uppercase">Testnets</p>
              <div className="grid grid-cols-1 gap-1">
                {Object.entries(NETWORKS)
                  .filter(([_, network]) => network.isTestnet)
                  .map(([key, network]) => (
                    <button
                      key={key}
                      onClick={() => {
                        switchChain({ chainId: network.chainId });
                        setShowNetworkSelector(false);
                      }}
                      disabled={isPending || network.chainId === chainId}
                      className={`w-full px-3 py-2 text-left text-sm rounded-lg transition-colors disabled:opacity-50 ${
                        network.chainId === chainId
                          ? "bg-green-100 border border-green-300 text-green-800"
                          : "bg-white hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      <div className="font-medium">{network.chainName}</div>
                      <div className="text-xs text-gray-500">
                        {network.nativeCurrency.symbol} • Chain ID: {network.chainId}
                      </div>
                    </button>
                  ))}
              </div>
            </div>

            {/* Mainnet Networks */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500 uppercase">Mainnets</p>
              <div className="grid grid-cols-1 gap-1">
                {Object.entries(NETWORKS)
                  .filter(([_, network]) => !network.isTestnet)
                  .map(([key, network]) => (
                    <button
                      key={key}
                      onClick={() => {
                        switchChain({ chainId: network.chainId });
                        setShowNetworkSelector(false);
                      }}
                      disabled={isPending || network.chainId === chainId}
                      className={`w-full px-3 py-2 text-left text-sm rounded-lg transition-colors disabled:opacity-50 ${
                        network.chainId === chainId
                          ? "bg-green-100 border border-green-300 text-green-800"
                          : "bg-white hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      <div className="font-medium">{network.chainName}</div>
                      <div className="text-xs text-gray-500">
                        {network.nativeCurrency.symbol} • Chain ID: {network.chainId}
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // If on unsupported network, show switch options
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        <span className="text-sm font-medium text-red-800">Unsupported Network</span>
      </div>
      
      <div className="space-y-2">
        <p className="text-sm text-gray-600">Switch to a supported network:</p>
        
        {/* Testnet Networks */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500 uppercase">Testnets</p>
          {Object.entries(NETWORKS)
            .filter(([_, network]) => network.isTestnet)
            .map(([key, network]) => (
              <button
                key={key}
                onClick={() => switchChain({ chainId: network.chainId })}
                disabled={isPending}
                className="w-full px-3 py-2 text-left text-sm bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors disabled:opacity-50"
              >
                <div className="font-medium">{network.chainName}</div>
                <div className="text-xs text-gray-500">Chain ID: {network.chainId}</div>
              </button>
            ))}
        </div>

        {/* Mainnet Networks */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500 uppercase">Mainnets</p>
          {Object.entries(NETWORKS)
            .filter(([_, network]) => !network.isTestnet)
            .map(([key, network]) => (
              <button
                key={key}
                onClick={() => switchChain({ chainId: network.chainId })}
                disabled={isPending}
                className="w-full px-3 py-2 text-left text-sm bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors disabled:opacity-50"
              >
                <div className="font-medium">{network.chainName}</div>
                <div className="text-xs text-gray-500">Chain ID: {network.chainId}</div>
              </button>
            ))}
        </div>
      </div>
      
      <div className="text-xs text-gray-600 text-center">
        <p>Get test tokens from faucets:</p>
        <div className="flex flex-wrap gap-2 justify-center mt-1">
          <a href="https://sepoliafaucet.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Sepolia ETH</a>
          <a href="https://faucet.quicknode.com/base/sepolia" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Base Sepolia ETH</a>
          <a href="https://faucet.arbitrum.io/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Arbitrum Sepolia ETH</a>
          <a href="https://testnet.binance.org/faucet-smart" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">BSC Testnet tBNB</a>
          <a href="https://faucet.avax.network/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Avalanche Fuji AVAX</a>
          <a href="https://faucet.polygon.technology/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Polygon Mumbai MATIC</a>
          <a href="https://faucet.calibration.fildev.network/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Filecoin Calibration tFIL</a>
          <a href="https://worldchain-testnet.blockscout.com/faucet" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Worldchain WLD</a>
        </div>
      </div>
    </div>
  );
}
