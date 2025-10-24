"use client";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { mintSBT } from "@/sdk/index";
import StatsCard from "@/components/StatsCard";
import ActivityCard from "@/components/ActivityCard";
import LearningTaskCard from "@/components/LearningTaskCard";
import { DynamicWalletButton } from "@/components/DynamicWalletButton";
import { useDataCoinBalance } from "@/hooks/useDataCoin";
import { useProgress } from "@/hooks/useProgress";
import { useModuleProgress } from "@/hooks/useModuleProgress";
import { NetworkSwitcher } from "@/components/NetworkSwitcher";
import { NoSSR } from "@/components/NoSSR";
import { useStaking, useUserStake } from "@/hooks/useStaking";
import { useRouter } from "next/navigation";
import { DailyStreak } from "@/components/DailyStreak";
import { ProgressBar } from "@/components/ProgressBar";

// Client-only wrapper to prevent hydration issues
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
}

// Dynamic Learning Task Card with real status
function DynamicLearningTaskCard({ task, userAddress }: { task: any; userAddress: `0x${string}` | undefined }) {
  const router = useRouter();
  const numericCourseId = parseInt(task.id);
  const { stakeAmount } = useStaking(numericCourseId);
  const { hasStaked, hasCompleted } = useUserStake(userAddress, numericCourseId);
  
  // Get course progress for staked courses
  const { courseProgress } = useModuleProgress(numericCourseId, task.modules?.length || 4);

  // Format stake amount for display
  const fallbackAmount = "0.0001";
  const displayStakeAmount = stakeAmount 
    ? (Number(stakeAmount) / 1e18).toFixed(6) 
    : fallbackAmount;

  const getStatusInfo = () => {
    if (hasCompleted) {
      return {
        status: "completed",
        text: "Completed",
        color: "bg-green-100 text-green-800 border-green-200",
        icon: "✅",
        buttonText: "View Certificate",
        buttonColor: "bg-green-600 hover:bg-green-700",
        action: () => router.push(`/certificate?course=${task.id}`)
      };
    } else if (hasStaked) {
      return {
        status: "started",
        text: "In Progress",
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: "🎓",
        buttonText: "Continue Learning",
        buttonColor: "bg-blue-600 hover:bg-blue-700",
        action: () => router.push(`/courses/${task.id}`)
      };
    } else {
      return {
        status: "not-started",
        text: "Not Started",
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: "📚",
        buttonText: "Start Learning",
        buttonColor: "bg-purple-600 hover:bg-purple-700",
        action: () => router.push(`/courses/${task.id}`)
      };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="relative overflow-hidden rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 group">
      {/* Background Gradient */}
      <div 
        className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity"
        style={{ background: task.gradient }}
      />
      
      <div className="relative p-6 bg-white dark:bg-gray-800">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg">
              {task.icon}
            </div>
            <div>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                task.difficulty === "Beginner" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                task.difficulty === "Intermediate" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              }`}>
                {task.difficulty}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">{task.duration}</p>
            <p className="text-xs text-gray-400">{task.category}</p>
          </div>
        </div>

        {/* Course Info */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {task.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {task.description}
        </p>

        {/* Stake Amount */}
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Required Stake</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {displayStakeAmount} ETH
            </span>
          </div>
        </div>

        {/* Status */}
        <div className={`mb-4 p-3 rounded-lg border ${statusInfo.color}`}>
          <div className="flex items-center gap-2">
            <span className="text-lg">{statusInfo.icon}</span>
            <span className="text-sm font-medium">{statusInfo.text}</span>
          </div>
        </div>

        {/* Progress Bar for Staked Courses */}
        {hasStaked && courseProgress && (
          <div className="mb-4">
            <ProgressBar 
              progress={courseProgress.progressPercentage}
              total={courseProgress.totalModules}
              completed={courseProgress.completedModules}
              size="sm"
              animated={true}
            />
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={statusInfo.action}
          className={`w-full py-3 px-4 rounded-xl text-white font-semibold transition-all ${statusInfo.buttonColor} shadow-lg hover:shadow-xl transform hover:scale-105`}
        >
          {statusInfo.buttonText}
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const [repo, setRepo] = useState("");
  const [sha, setSha] = useState("");
  const [permit, setPermit] = useState<Record<string, unknown> | null>(null);
  const [signature, setSignature] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [dataCoinBalance, setDataCoinBalance] = useState("0");
  const [certificates, setCertificates] = useState([]);

  // DataCoin balance hook
  const { balance: dataCoinBalanceFromHook } = useDataCoinBalance(address);

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
    {
      id: "4",
      type: "reputation" as const,
      description: "Earned 25 DataCoins for course completion",
      timestamp: "3 days ago",
      status: "success" as const,
    },
    {
      id: "5",
      type: "mint" as const,
      description: "Received certificate for HTML & CSS course",
      timestamp: "1 week ago",
      status: "success" as const,
    },
  ]);

  // Update DataCoin balance when hook data changes
  useEffect(() => {
    if (dataCoinBalanceFromHook) {
      setDataCoinBalance(dataCoinBalanceFromHook.toString());
    }
  }, [dataCoinBalanceFromHook]);

  // Learning tasks
  const learningTasks = [
    {
      id: "1",
      title: "HTML & CSS Fundamentals",
      description: "Master the basics of web development with HTML5 and CSS3. Build responsive layouts and beautiful interfaces.",
      difficulty: "Beginner" as const,
      duration: "4-6 weeks",
      category: "Web Development",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      progress: 0,
      icon: (
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
        </svg>
      ),
    },
    {
      id: "2",
      title: "Solidity Smart Contracts",
      description: "Learn to write, test, and deploy secure smart contracts on Ethereum. Understand DeFi protocols and NFTs.",
      difficulty: "Intermediate" as const,
      duration: "8-10 weeks",
      category: "Blockchain",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      progress: 35,
      icon: (
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
        </svg>
      ),
    },
    {
      id: "3",
      title: "Rust Programming",
      description: "Dive into systems programming with Rust. Build fast, safe, and concurrent applications with zero-cost abstractions.",
      difficulty: "Advanced" as const,
      duration: "10-12 weeks",
      category: "Systems Programming",
      gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      progress: 0,
      icon: (
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      id: "4",
      title: "React & Next.js",
      description: "Build modern web applications with React and Next.js. Learn hooks, server components, and full-stack development.",
      difficulty: "Intermediate" as const,
      duration: "6-8 weeks",
      category: "Frontend",
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      progress: 60,
      icon: (
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
        </svg>
      ),
    },
    {
      id: "5",
      title: "Web3 & DApp Development",
      description: "Create decentralized applications using ethers.js, wagmi, and IPFS. Connect smart contracts to beautiful UIs.",
      difficulty: "Advanced" as const,
      duration: "8-10 weeks",
      category: "Web3",
      gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      progress: 0,
      icon: (
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 7H7v6h6V7z" />
          <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      id: "6",
      title: "Python for Data Science",
      description: "Analyze data with Python, NumPy, and Pandas. Create visualizations and build machine learning models.",
      difficulty: "Beginner" as const,
      duration: "5-7 weeks",
      category: "Data Science",
      gradient: "linear-gradient(135deg, #fa8bff 0%, #2bd2ff 90%, #2bff88 100%)",
      progress: 20,
      icon: (
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
        </svg>
      ),
    },
  ];

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

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="space-y-8 animate-fadeIn">
        {/* Welcome Section for Non-Connected Users */}
        <div className="relative overflow-visible rounded-3xl bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-8 md:p-12 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24 animate-pulse" style={{ animationDelay: "1s" }}></div>
          
          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to Proof of Contribution! 🚀</h1>
            <p className="text-purple-100 text-lg mb-8">
              Connect your wallet to verify contributions, mint SBTs, and track your reputation
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="transform hover:scale-105 transition-transform">
                <DynamicWalletButton fullWidth />
              </div>
              <a href="#learning" className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/20 transition-all">
                📚 Explore Learning Paths
              </a>
            </div>
          </div>
        </div>

        {/* Preview Stats - Locked State */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 shadow-lg opacity-50">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-xs text-gray-400">🔒 Locked</div>
              </div>
              <h3 className="text-gray-400 text-sm font-medium mb-2">Total SBTs</h3>
              <p className="text-3xl font-bold text-gray-300">--</p>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg opacity-50">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <div className="text-xs text-gray-400">🔒 Locked</div>
              </div>
              <h3 className="text-gray-400 text-sm font-medium mb-2">Reputation Score</h3>
              <p className="text-3xl font-bold text-gray-300">--</p>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-700 shadow-lg opacity-50">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-xs text-gray-400">🔒 Locked</div>
              </div>
              <h3 className="text-gray-400 text-sm font-medium mb-2">Verified Commits</h3>
              <p className="text-3xl font-bold text-gray-300">--</p>
            </div>
          </div>
        </div>

        {/* Learning Tasks Section - Available to All */}
        <div id="learning" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                🎓 Learning Paths
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Start learning today - no wallet connection required!
              </p>
            </div>
            <button 
              onClick={() => router.push('/courses')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
            >
              View All Courses
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {learningTasks.map((task) => (
              <DynamicLearningTaskCard
                key={task.id}
                task={task}
                userAddress={address}
              />
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-8 border border-purple-100 dark:border-purple-800">
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to track your progress?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Connect your wallet to verify contributions, earn reputation, and mint Soulbound Tokens
            </p>
            <div className="transform hover:scale-105 transition-transform">
              <DynamicWalletButton fullWidth />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Section - Enhanced */}
      <div className="relative overflow-visible rounded-3xl bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-8 md:p-12 text-white shadow-2xl">
        {/* Animated background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24 animate-pulse" style={{ animationDelay: "1s" }}></div>
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-white/5 rounded-full animate-pulse" style={{ animationDelay: "2s" }}></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium">Connected</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3">Welcome back! 👋</h1>
            <p className="text-purple-100 text-lg">
              Verify your contributions, complete learning tasks, and earn reputation
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
              Quick Start Guide
            </button>
            <button className="px-6 py-3 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/20 transition-all">
              View Tutorial
            </button>
          </div>
        </div>
        
        {/* Network Status */}
        <div className="mt-4">
          <NoSSR>
            <NetworkSwitcher />
          </NoSSR>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          title="DataCoins Earned"
          value={dataCoinBalance}
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          trend={{ value: "+25 this week", isPositive: true }}
          gradientFrom="#f59e0b"
          gradientTo="#f97316"
        />
        
        <StatsCard
          title="Certificates"
          value="3"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          trend={{ value: "+1 this month", isPositive: true }}
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

      {/* DataCoin Rewards Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Daily Streak */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">🔥 Daily Streak</h3>
          <NoSSR>
            <DailyStreak />
          </NoSSR>
        </div>

        {/* Progress Rewards */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">🎯 Progress Rewards</h3>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Earn DataCoins by Learning</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Daily Login</span>
                  <span className="text-blue-600 dark:text-blue-400 font-medium">+5 DataCoins</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Course Progress (25%)</span>
                  <span className="text-blue-600 dark:text-blue-400 font-medium">+3 DataCoins</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Course Milestone</span>
                  <span className="text-blue-600 dark:text-blue-400 font-medium">+8 DataCoins</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">7-Day Streak</span>
                  <span className="text-orange-600 dark:text-orange-400 font-medium">+15 DataCoins</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">30-Day Streak</span>
                  <span className="text-green-600 dark:text-green-400 font-medium">+50 DataCoins</span>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <button 
                onClick={() => router.push('/courses')}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                Start Learning & Earning
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Tasks Section */}
      <div className="space-y-6">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              🎓 Learning Paths
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Master new skills and earn reputation while learning
            </p>
          </div>
          <button 
            onClick={() => router.push('/courses')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
          >
            View All Courses
          </button>
        </div>

        {/* Learning Tasks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {learningTasks.map((task) => (
            <DynamicLearningTaskCard
              key={task.id}
              task={task}
              userAddress={address}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

