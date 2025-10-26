"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { mintSBT } from "@/sdk/index";
import { VerifyMintCard } from "@/_components/VerifyMintCard";
import { useWalletAuth } from "@/_context/WalletAuthContext";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const { isConnected: isWalletAuthConnected, isLoading: isAuthLoading } = useWalletAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  const [repo, setRepo] = useState("");
  const [sha, setSha] = useState("");
  const [permit, setPermit] = useState<Record<string, unknown> | null>(null);
  const [signature, setSignature] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // ALL useEffect HOOKS MUST BE CALLED BEFORE CONDITIONAL RETURNS
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect to signup if not authenticated
  useEffect(() => {
    if (mounted && !isAuthLoading && !isWalletAuthConnected) {
      router.push("/signup");
    }
  }, [mounted, isAuthLoading, isWalletAuthConnected, router]);

  // Manual refresh function for testing
  const handleRefreshData = async () => {
    if (isConnected && address) {
      // Refresh any data if needed
      console.log("Refreshing admin data...");
    }
  };

  // Show loading while checking auth
  if (!mounted || isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking wallet connection...</p>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting to signup
  if (!isWalletAuthConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to signup...</p>
        </div>
      </div>
    );
  }

  async function onVerify() {
    setIsLoading(true);
    setStatus("Verifying your contribution...");
    try {
      // Use manual verification instead of AI verification
      const res = await fetch("/api/manual-verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ 
          repo, 
          sha, 
          wallet: address
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPermit({ 
          to: data.to, 
          commitHash: data.commitHash, 
          reputation: data.reputation, 
          expiry: data.expiry, 
          tokenURI: data.tokenURI 
        });
        setSignature(data.signature);
        setStatus("✓ Manually verified successfully! You can now mint your SBT.");
      } else {
        setStatus("✗ " + (data.error || "Verification failed. Please check your inputs."));
      }
    } catch {
      setStatus("✗ Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function onMint() {
    if (!permit || !signature) return;
    setIsLoading(true);
    setStatus("Minting your Soulbound Token...");
    try {
      const res = await fetch("/api/mint", { 
        method: "POST", 
        headers: { "content-type": "application/json" }, 
        body: JSON.stringify({ permit, signature }) 
      });
      const data = await res.json();
      if (!res.ok) { 
        setStatus("✗ " + (data.error || "Mint failed")); 
        setIsLoading(false);
        return; 
      }
      const contract = process.env.NEXT_PUBLIC_SBT_ADDRESS as `0x${string}`;
      const tx = await mintSBT(contract, { ...permit, signature } as any);
      setStatus(`✓ Success! Transaction: ${tx}`);
      // Reset form
      setRepo("");
      setSha("");
      setPermit(null);
      setSignature("");
    } catch {
      setStatus("✗ Minting failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Admin Panel
              </h1>
              <p className="text-gray-600">
                Manage and test SBT verification and minting
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                ← Back to Dashboard
              </button>
              <button
                onClick={handleRefreshData}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Verifications</h3>
                <p className="text-2xl font-bold text-purple-600">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">SBTs Minted</h3>
                <p className="text-2xl font-bold text-blue-600">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7H7v6h6V7z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Active Users</h3>
                <p className="text-2xl font-bold text-green-600">1</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Total DataCoins</h3>
                <p className="text-2xl font-bold text-orange-600">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Verify & Mint SBT Card */}
          <div className="lg:col-span-2">
            <VerifyMintCard
              repo={repo}
              sha={sha}
              isLoading={isLoading}
              permit={permit}
              status={status}
              address={address}
              onRepoChange={setRepo}
              onShaChange={setSha}
              onVerify={onVerify}
              onMint={onMint}
            />
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
            <div className="space-y-4">
              <button
                onClick={() => {
                  setRepo("aagneye-syam/stake_learn");
                  setSha("f63d6603567a18f82b812f8f9ceb105758f28142");
                }}
                className="w-full p-4 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
              >
                <div className="font-medium text-gray-900">Load Test Repository</div>
                <div className="text-sm text-gray-600">aagneye-syam/stake_learn</div>
              </button>
              
              <button
                onClick={() => {
                  setRepo("");
                  setSha("");
                  setPermit(null);
                  setSignature("");
                  setStatus("");
                }}
                className="w-full p-4 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
              >
                <div className="font-medium text-gray-900">Clear Form</div>
                <div className="text-sm text-gray-600">Reset all fields</div>
              </button>

              <button
                onClick={() => router.push('/transactions')}
                className="w-full p-4 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
              >
                <div className="font-medium text-gray-900">View Transactions</div>
                <div className="text-sm text-gray-600">Check transaction history</div>
              </button>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6">System Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Wallet Connection</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Manual Verification API</span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  Active
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">GitHub API</span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  Active
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">SBT Contract</span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  Deployed
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
