"use client";
import { useState, useEffect } from "react";
import { useWalletAuth } from "@/_context/WalletAuthContext";
import { useRouter } from "next/navigation";

interface WalletButtonProps {
  fullWidth?: boolean;
}

export function WalletButton({ fullWidth = false }: WalletButtonProps) {
  const { walletAddress, user, isConnected, isLoading, connect, disconnect } = useWalletAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted || isLoading) {
    return (
      <div className={`${fullWidth ? 'w-full py-4 px-6' : 'px-6 py-3'} bg-gray-300 rounded-xl animate-pulse`}>
        <div className="h-6 bg-gray-400 rounded"></div>
      </div>
    );
  }

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connect();
    } catch (error) {
      console.error("Connection failed:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  if (isConnected && walletAddress && user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end">
          <span className="text-xs font-medium text-gray-500">
            {user.name}
          </span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </span>
        </div>
        <button
          onClick={disconnect}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting}
      className={`${fullWidth ? 'w-full py-4 px-6' : 'px-6 py-3'} bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}

