"use client";

import { useAccount, useSwitchChain, useChainId } from "wagmi";
import { NETWORKS } from "../config/contracts";
import { useState, useEffect } from "react";
import { ChevronDownIcon, CheckIcon } from "@heroicons/react/24/outline";

interface AdvancedNetworkSelectorProps {
  className?: string;
  showFaucets?: boolean;
}

export function AdvancedNetworkSelector({ 
  className = "", 
  showFaucets = true 
}: AdvancedNetworkSelectorProps) {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isConnected) {
    return null;
  }

  const isSupportedChain = Object.values(NETWORKS).some(network => network.chainId === chainId);
  const currentNetwork = Object.values(NETWORKS).find(network => network.chainId === chainId);

  const testnetNetworks = Object.entries(NETWORKS).filter(([_, network]) => network.isTestnet);
  const mainnetNetworks = Object.entries(NETWORKS).filter(([_, network]) => !network.isTestnet);

  return (
    <div className={`relative ${className}`}>
      {/* Current Network Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-colors ${
          isSupportedChain
            ? "bg-green-50 border-green-200 text-green-800"
            : "bg-red-50 border-red-200 text-red-800"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${
            isSupportedChain ? "bg-green-500" : "bg-red-500"
          }`} />
          <div className="text-left">
            <div className="font-medium">
              {currentNetwork?.chainName || "Unsupported Network"}
            </div>
            <div className="text-xs opacity-75">
              Chain ID: {chainId}
            </div>
          </div>
        </div>
        <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Network Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Testnet Networks */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Testnets</h3>
              <div className="space-y-1">
                {testnetNetworks.map(([key, network]) => (
                  <button
                    key={key}
                    onClick={() => {
                      switchChain({ chainId: network.chainId });
                      setIsOpen(false);
                    }}
                    disabled={isPending || network.chainId === chainId}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                      network.chainId === chainId
                        ? "bg-green-100 text-green-800"
                        : "hover:bg-gray-50"
                    } disabled:opacity-50`}
                  >
                    <div>
                      <div className="font-medium text-sm">{network.chainName}</div>
                      <div className="text-xs text-gray-500">
                        {network.nativeCurrency.symbol} • ID: {network.chainId}
                      </div>
                    </div>
                    {network.chainId === chainId && (
                      <CheckIcon className="w-4 h-4 text-green-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Mainnet Networks */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Mainnets</h3>
              <div className="space-y-1">
                {mainnetNetworks.map(([key, network]) => (
                  <button
                    key={key}
                    onClick={() => {
                      switchChain({ chainId: network.chainId });
                      setIsOpen(false);
                    }}
                    disabled={isPending || network.chainId === chainId}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                      network.chainId === chainId
                        ? "bg-green-100 text-green-800"
                        : "hover:bg-gray-50"
                    } disabled:opacity-50`}
                  >
                    <div>
                      <div className="font-medium text-sm">{network.chainName}</div>
                      <div className="text-xs text-gray-500">
                        {network.nativeCurrency.symbol} • ID: {network.chainId}
                      </div>
                    </div>
                    {network.chainId === chainId && (
                      <CheckIcon className="w-4 h-4 text-green-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Faucet Links */}
            {showFaucets && (
              <div className="pt-3 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Testnet Faucets</h3>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="https://sepoliafaucet.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline p-2 bg-blue-50 rounded"
                  >
                    Sepolia ETH
                  </a>
                  <a
                    href="https://faucet.quicknode.com/base/sepolia"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline p-2 bg-blue-50 rounded"
                  >
                    Base Sepolia ETH
                  </a>
                  <a
                    href="https://faucet.arbitrum.io/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline p-2 bg-blue-50 rounded"
                  >
                    Arbitrum Sepolia ETH
                  </a>
                  <a
                    href="https://testnet.binance.org/faucet-smart"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline p-2 bg-blue-50 rounded"
                  >
                    BSC Testnet tBNB
                  </a>
                  <a
                    href="https://faucet.avax.network/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline p-2 bg-blue-50 rounded"
                  >
                    Avalanche Fuji AVAX
                  </a>
                  <a
                    href="https://faucet.polygon.technology/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline p-2 bg-blue-50 rounded"
                  >
                    Polygon Mumbai MATIC
                  </a>
                  <a
                    href="https://faucet.calibration.fildev.network/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline p-2 bg-blue-50 rounded"
                  >
                    Filecoin Calibration tFIL
                  </a>
                  <a
                    href="https://worldchain-testnet.blockscout.com/faucet"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline p-2 bg-blue-50 rounded"
                  >
                    Worldchain WLD
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
