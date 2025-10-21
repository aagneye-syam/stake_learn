"use client";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { mintSBT } from "@/sdk/index";
import StatsCard from "@/components/StatsCard";
import ActivityCard from "@/components/ActivityCard";

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const [repo, setRepo] = useState("");
  const [sha, setSha] = useState("");
  const [permit, setPermit] = useState<any>(null);
  const [signature, setSignature] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Mock activities - replace with real data
  const [activities] = useState([
    {
      id: "1",
      type: "mint" as const,
      description: "Minted SBT for commit abc123",
      timestamp: "2 hours ago",
      status: "success" as const,
    },
    {
      id: "2",
      type: "verify" as const,
      description: "Verified contribution in repo/example",
      timestamp: "5 hours ago",
      status: "success" as const,
    },
    {
      id: "3",
      type: "reputation" as const,
      description: "Earned 50 reputation points",
      timestamp: "1 day ago",
      status: "success" as const,
    },
  ]);

  async function onVerify() {
    setIsLoading(true);
    setStatus("Verifying your contribution...");
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ 
          repo, 
          sha, 
          wallet: address, 
          expiry: Math.floor(Date.now()/1000)+3600 
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
        setStatus("✓ Verified successfully! You can now mint your SBT.");
      } else {
        setStatus("✗ " + (data.error || "Verification failed. Please check your inputs."));
      }
    } catch (error) {
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
      const tx = await mintSBT(contract as any, { ...permit, signature } as any, process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL);
      setStatus(`✓ Success! Transaction: ${tx}`);
      // Reset form
      setRepo("");
      setSha("");
      setPermit(null);
      setSignature("");
    } catch (error) {
      setStatus("✗ Minting failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Connect Your Wallet
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please connect your wallet to access the dashboard
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Welcome back! 👋</h1>
          <p className="text-purple-100">
            Verify your contributions and mint your Soulbound Tokens
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total SBTs"
          value="12"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          trend={{ value: "+3 this week", isPositive: true }}
          gradientFrom="#9333ea"
          gradientTo="#7c3aed"
        />
        
        <StatsCard
          title="Reputation Score"
          value="850"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          }
          trend={{ value: "+120 points", isPositive: true }}
          gradientFrom="#2563eb"
          gradientTo="#3b82f6"
        />
        
        <StatsCard
          title="Verified Commits"
          value="47"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          trend={{ value: "+8 this month", isPositive: true }}
          gradientFrom="#059669"
          gradientTo="#10b981"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Verify & Mint Card */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Verify & Mint SBT
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Repository
                </label>
                <input
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900 transition-all outline-none"
                  placeholder="e.g., owner/repo-name"
                  value={repo}
                  onChange={(e) => setRepo(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Commit SHA
                </label>
                <input
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900 transition-all outline-none"
                  placeholder="e.g., abc123def456..."
                  value={sha}
                  onChange={(e) => setSha(e.target.value)}
                />
              </div>

              <div className="flex gap-4">
                <button
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                  onClick={onVerify}
                  disabled={!address || isLoading || !repo || !sha}
                >
                  {isLoading && !permit ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </span>
                  ) : (
                    "Verify Contribution"
                  )}
                </button>
                <button
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                  onClick={onMint}
                  disabled={!permit || isLoading}
                >
                  {isLoading && permit ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Minting...
                    </span>
                  ) : (
                    "Mint SBT"
                  )}
                </button>
              </div>

              {status && (
                <div className={`p-4 rounded-xl ${
                  status.startsWith("✓") 
                    ? "bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800" 
                    : status.startsWith("✗")
                    ? "bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800"
                    : "bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800"
                }`}>
                  <p className={`text-sm font-medium ${
                    status.startsWith("✓") 
                      ? "text-green-800 dark:text-green-200" 
                      : status.startsWith("✗")
                      ? "text-red-800 dark:text-red-200"
                      : "text-blue-800 dark:text-blue-200"
                  }`}>
                    {status}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Activity Card */}
        <div className="lg:col-span-1">
          <ActivityCard activities={activities} />
        </div>
      </div>
    </div>
  );
}

