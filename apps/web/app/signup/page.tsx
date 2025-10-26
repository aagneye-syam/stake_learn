"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import WalletConnectButton from "@/_components/WalletConnectButton";
import UserOnboardingModal from "@/_components/UserOnboardingModal";
import { connectWallet } from "@/services/wallet-auth.service";
import { getUserByWallet, createWalletUser } from "@/services/user.service";
import { useWalletAuth } from "@/_context/WalletAuthContext";

export default function SignUpPage() {
  const router = useRouter();
  const { refreshUser } = useWalletAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleWalletConnect = async () => {
    console.log("🔵 handleWalletConnect called");
    setIsLoading(true);
    setError("");

    try {
      // Connect wallet
      console.log("🔵 Calling connectWallet...");
      const address = await connectWallet();
      console.log("🟢 Wallet connected:", address);
      setWalletAddress(address);

      // Check if user already exists
      console.log("🔵 Checking if user exists...");
      const existingUser = await getUserByWallet(address);
      console.log("🟢 User lookup result:", existingUser);

      if (existingUser) {
        // User exists, redirect to dashboard immediately
        console.log("🟢 Existing user found, redirecting to dashboard");
        router.push("/dashboard");
      } else {
        // New user, show onboarding modal immediately
        console.log("🟡 New user, showing onboarding modal");
        setShowOnboarding(true);
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error("🔴 Error in handleWalletConnect:", err);
      setError(err.message || "Failed to connect wallet. Please try again.");
      setIsLoading(false);
    }
  };

  const handleOnboardingSubmit = async (name: string, email: string) => {
    try {
      await createWalletUser(walletAddress, name, email);
      setShowOnboarding(false);
      await refreshUser(); // Refresh wallet context
      router.push("/dashboard");
    } catch (err: any) {
      throw new Error(err.message || "Failed to create account");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-black mb-2">Connect Your Wallet</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Connect your wallet to get started with Web3 learning
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200">
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-blue-900">Why wallet authentication?</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Your wallet serves as your secure identity. No passwords needed!
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-50 border-2 border-red-200 flex items-start gap-3" role="alert">
                <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            )}

            <WalletConnectButton
              onConnect={handleWalletConnect}
              fullWidth
            />

            <div className="text-center text-xs text-gray-500 space-y-1">
              <p>By connecting, you agree to our Terms of Service</p>
              <p>We support MetaMask and WalletConnect</p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to Home
          </Link>
        </div>
      </div>

      <UserOnboardingModal
        isOpen={showOnboarding}
        walletAddress={walletAddress}
        onSubmit={handleOnboardingSubmit}
      />
    </div>
  );
}

