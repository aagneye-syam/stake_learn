import { BrowserProvider } from "ethers";

// Global lock to prevent multiple simultaneous connection requests
let isConnecting = false;
let connectionPromise: Promise<string> | null = null;

// Check if MetaMask is installed
export const isMetaMaskInstalled = (): boolean => {
  return typeof window !== "undefined" && typeof window.ethereum !== "undefined";
};

// Connect wallet and return address
export const connectWallet = async (): Promise<string> => {
  // If already connecting, return the existing promise
  if (isConnecting && connectionPromise) {
    console.log("🟡 Connection already in progress, waiting for existing request...");
    return connectionPromise;
  }

  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed. Please install MetaMask to continue.");
  }

  isConnecting = true;
  connectionPromise = (async () => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found. Please unlock your wallet.");
      }

      return accounts[0].toLowerCase(); // Normalize to lowercase
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error("Connection request rejected. Please approve the connection to continue.");
      }
      if (error.code === -32002) {
        throw new Error("Connection request already pending. Please check your MetaMask popup.");
      }
      throw new Error(error.message || "Failed to connect wallet");
    } finally {
      isConnecting = false;
      connectionPromise = null;
    }
  })();

  return connectionPromise;
};

// Get current connected wallet address
export const getCurrentWalletAddress = async (): Promise<string | null> => {
  if (!isMetaMaskInstalled()) {
    return null;
  }

  try {
    const provider = new BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_accounts", []);
    return accounts.length > 0 ? accounts[0].toLowerCase() : null;
  } catch (error) {
    console.error("Error getting wallet address:", error);
    return null;
  }
};

// Disconnect wallet (clear local state)
export const disconnectWallet = (): void => {
  // Note: We can't actually disconnect MetaMask programmatically
  // This is just for clearing our app's state
  if (typeof window !== "undefined") {
    localStorage.removeItem("walletAddress");
    localStorage.removeItem("walletConnected");
  }
};

// Listen for account changes
export const onAccountsChanged = (callback: (accounts: string[]) => void): void => {
  if (isMetaMaskInstalled()) {
    window.ethereum.on("accountsChanged", callback);
  }
};

// Listen for chain changes
export const onChainChanged = (callback: (chainId: string) => void): void => {
  if (isMetaMaskInstalled()) {
    window.ethereum.on("chainChanged", callback);
  }
};

// Remove listeners
export const removeWalletListeners = (): void => {
  if (isMetaMaskInstalled()) {
    window.ethereum.removeAllListeners("accountsChanged");
    window.ethereum.removeAllListeners("chainChanged");
  }
};
