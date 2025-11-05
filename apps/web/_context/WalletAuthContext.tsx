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
      console.log("🔵 Loading user for address:", address);
      
      // Ensure Firebase is initialized
      if (!db) {
        console.error("🔴 Firebase DB not initialized!");
        setUser(null);
        return;
      }
      
      const userData = await getUserByWallet(address);
      console.log("🔵 User data from Firestore:", userData);
      setUser(userData);
      if (userData) {
        await updateLastLogin(address);
        console.log("🟢 User found and last login updated");
      } else {
        console.log("🟡 No user found in Firestore for this address");
      }
    } catch (error) {
      console.error("🔴 Failed to load user:", error);
      setUser(null);
    }
  };

  const connect = async () => {
    try {
      setIsLoading(true);
      const address = await connectWallet();
      setWalletAddress(address);
      await loadUser(address);
      localStorage.setItem("walletConnected", "true");
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      throw error;
    } finally {
      setIsLoading(false);
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
      console.log("🔵 WalletAuthContext: Initializing...");
      setIsLoading(true);
      
      // Check if wallet was previously connected
      const wasConnected = localStorage.getItem("walletConnected");
      console.log("🔵 Was previously connected:", wasConnected);
      
      if (wasConnected) {
        const address = await getCurrentWalletAddress();
        console.log("🔵 Current wallet address:", address);
        
        if (address) {
          setWalletAddress(address);
          await loadUser(address);
          console.log("🟢 User loaded successfully");
        } else {
          console.log("🟡 No address found, removing walletConnected flag");
          localStorage.removeItem("walletConnected");
        }
      }
      
      setIsLoading(false);
      console.log("🟢 WalletAuthContext: Initialization complete");
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
