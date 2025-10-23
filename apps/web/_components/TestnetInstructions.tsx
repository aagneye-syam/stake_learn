"use client";

import { useState, useEffect } from "react";

export function TestnetInstructions() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium text-blue-800">Need Sepolia Test ETH?</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-blue-600 hover:text-blue-800 transition-colors"
        >
          <svg className={`w-4 h-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      
      {isOpen && (
        <div className="mt-3 space-y-2">
          <p className="text-sm text-blue-700">
            Get free test ETH for Sepolia testnet:
          </p>
          <div className="space-y-1">
            <a 
              href="https://sepoliafaucet.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block text-sm text-blue-600 hover:text-blue-800 underline"
            >
              • Sepolia Faucet (sepoliafaucet.com)
            </a>
            <a 
              href="https://faucet.quicknode.com/ethereum/sepolia" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block text-sm text-blue-600 hover:text-blue-800 underline"
            >
              • QuickNode Sepolia Faucet
            </a>
            <a 
              href="https://www.alchemy.com/faucets/ethereum-sepolia" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block text-sm text-blue-600 hover:text-blue-800 underline"
            >
              • Alchemy Sepolia Faucet
            </a>
          </div>
          <p className="text-xs text-blue-600 mt-2">
            💡 You need test ETH to stake and use the platform
          </p>
        </div>
      )}
    </div>
  );
}
