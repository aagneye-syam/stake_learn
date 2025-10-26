"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { 
  connectWallet, 
  getCurrentWalletAddress, 
  disconnectWallet,
  onAccountsChanged,
  removeWalletListeners
} from "@/services/wallet-auth.service";
import { getUserByWallet, updateLastLogin, UserData } from "@/services/user.service";

interface WalletAuthContextType {
  walletAddress: string | null;
  user: UserData | null;
  isConnected: boolean;
  isLoading: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshUser: () => Promise<void>;
}

const WalletAuthContext = createContext<WalletAuthContextType | undefined>(undefined);

export function WalletAuthProvider({ children }: { children: ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = async (address: string) => {
    try {
      const userData = await getUserByWallet(address);
      setUser(userData);
      if (userData) {
        await updateLastLogin(address);
      }
    } catch (error) {
      console.error("Failed to load user:", error);
      setUser(null);
    }
  };

  const connect = async () => {
    try {
      const address = await connectWallet();
      setWalletAddress(address);
      await loadUser(address);
      localStorage.setItem("walletConnected", "true");
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      throw error;
    }
  };

  const disconnect = () => {
    disconnectWallet();
    setWalletAddress(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (walletAddress) {
      await loadUser(walletAddress);
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      const wasConnected = localStorage.getItem("walletConnected");
      
      if (wasConnected) {
        const address = await getCurrentWalletAddress();
        if (address) {
          setWalletAddress(address);
          await loadUser(address);
        } else {
          localStorage.removeItem("walletConnected");
        }
      }
      
      setIsLoading(false);
    };

    init();

    // Listen for account changes
    onAccountsChanged((accounts) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        const newAddress = accounts[0].toLowerCase();
        setWalletAddress(newAddress);
        loadUser(newAddress);
      }
    });

    return () => {
      removeWalletListeners();
    };
  }, []);

  return (
    <WalletAuthContext.Provider
      value={{
        walletAddress,
        user,
        isConnected: !!walletAddress && !!user,
        isLoading,
        connect,
        disconnect,
        refreshUser,
      }}
    >
      {children}
    </WalletAuthContext.Provider>
  );
}

export function useWalletAuth() {
  const context = useContext(WalletAuthContext);
  if (context === undefined) {
    throw new Error("useWalletAuth must be used within a WalletAuthProvider");
  }
  return context;
}
