"use client";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import ActivityCard from "@/components/ActivityCard";
import LearningTaskCard from "@/components/LearningTaskCard";
import { DynamicWalletButton } from "@/components/DynamicWalletButton";
import { useDataCoinBalance } from "@/hooks/useDataCoin";
import { useLocalDataCoin } from "@/hooks/useLocalDataCoin";
import { useProgress } from "@/hooks/useProgress";
import { useModuleProgress } from "@/hooks/useModuleProgress";
import { useCertificates } from "@/hooks/useCertificates";
import { useConsumerData } from "@/hooks/useConsumerData";
import { useSBT } from "@/hooks/useSBT";
import { useReputation } from "@/hooks/useReputation";
import { useRecentActivity } from "@/hooks/useRecentActivity";
import { useRepositories } from "@/hooks/useRepositories";
import { NetworkSwitcher } from "@/components/NetworkSwitcher";
import { NoSSR } from "@/components/NoSSR";
import { useStaking, useUserStake } from "@/hooks/useStaking";
import { useRouter } from "next/navigation";
import { DailyStreak } from "@/components/DailyStreak";
import { ProgressBar } from "@/components/ProgressBar";
import { StatsBentoGrid } from "@/_components/StatsBentoGrid";
import { RepositorySubmissionCard } from "@/_components/RepositorySubmissionCard";
import { ConsumerDataModal } from "@/components/ConsumerDataModal";
import { CompactProgressRewards } from "@/_components/CompactProgressRewards";
import { useWalletAuth } from "@/_context/WalletAuthContext";

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
  const fallbackAmount = "0.00001";
  const displayStakeAmount = stakeAmount 
    ? (Number(stakeAmount) / 1e18).toFixed(6) 
    : fallbackAmount;

  const getStatusInfo = () => {
    // Check if all modules are completed locally
    const allModulesCompleted = courseProgress && courseProgress.completedModules === courseProgress.totalModules;
    
    if (allModulesCompleted) {
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
    <div className="relative overflow-hidden rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 group h-full flex flex-col">
      {/* Background Gradient */}
      <div 
        className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity"
        style={{ background: task.gradient }}
      />
      
      <div className="relative p-6 bg-white flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg">
              {task.icon}
            </div>
            <div>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                task.difficulty === "Beginner" ? "bg-green-100 text-green-700" :
                task.difficulty === "Intermediate" ? "bg-yellow-100 text-yellow-700" :
                "bg-red-100 text-red-700"
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

        {/* Course Info - Fixed height section */}
        <div className="mb-4 flex-shrink-0">
          <h3 className="text-xl font-bold text-black mb-2 line-clamp-2">
          {task.title}
        </h3>
          <p className="text-gray-600 text-sm line-clamp-3 min-h-[3.75rem]">
          {task.description}
        </p>
        </div>

        {/* Stake Amount */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg flex-shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Required Stake</span>
            <span className="text-sm font-semibold text-black">
              {displayStakeAmount} ETH
            </span>
          </div>
        </div>

        {/* Status */}
        <div className={`mb-4 p-3 rounded-lg border ${statusInfo.color} flex-shrink-0`}>
          <div className="flex items-center gap-2">
            <span className="text-lg">{statusInfo.icon}</span>
            <span className="text-sm font-medium">{statusInfo.text}</span>
          </div>
        </div>

        {/* Progress Bar for Staked Courses - Fixed height */}
        <div className="mb-4 flex-shrink-0 min-h-[2.5rem]">
          {hasStaked && courseProgress ? (
            <div>
            <ProgressBar 
              progress={courseProgress.progressPercentage}
              total={courseProgress.totalModules}
              completed={courseProgress.completedModules}
              size="sm"
              animated={true}
            />
          </div>
          ) : (
            <div className="h-10"></div> // Placeholder to maintain consistent height
        )}
        </div>

        {/* Spacer to push button to bottom */}
        <div className="flex-grow"></div>

        {/* Action Button - Always at bottom */}
        <button
          onClick={statusInfo.action}
          className={`w-full py-3 px-4 rounded-xl text-white font-semibold transition-all ${statusInfo.buttonColor} shadow-lg hover:shadow-xl transform hover:scale-105 flex-shrink-0`}
        >
          {statusInfo.buttonText}
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const { isConnected: isWalletAuthConnected, isLoading: isAuthLoading, user } = useWalletAuth();
  const router = useRouter();
  
  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  const [mounted, setMounted] = useState(false);
  const [dataCoinBalance, setDataCoinBalance] = useState("0");

  // DataCoin balance hook (local tracking)
  const { balance: localDataCoinBalance, refetch: refetchLocalDataCoinBalance } = useLocalDataCoin();
  
  // Contract DataCoin balance hook (for reference)
  const { balance: contractDataCoinBalance, refetch: refetchContractDataCoinBalance } = useDataCoinBalance(address);
  
  // Certificates hook
  const { certificates, getTotalDataCoinsEarned } = useCertificates();
  
  // Consumer data hook
  const { stats: consumerDataStats, hasConnectedSource, getDataCoinsBySource } = useConsumerData();
  
  // SBT hook
  const { totalSBTs, recentSBTs, lastMinted, loading: sbtLoading } = useSBT();
  
  // Reputation hook
  const { totalReputation, reputationBreakdown, recentGains, lastGain, loading: reputationLoading } = useReputation();
  
  // Recent activity hook
  const { activities, loading: activityLoading } = useRecentActivity();
  
  // Repository hook (user's submitted repositories)
  const { repositories, loading: repositoriesLoading } = useRepositories(false); // User view
  
  // Consumer data modal state
  const [isConsumerDataModalOpen, setIsConsumerDataModalOpen] = useState(false);

  // RPC status and optimization info
  const [rpcStatus, setRpcStatus] = useState({
    provider: 'Unknown',
    status: 'checking',
    optimizations: 0
  });

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

  // Update DataCoin balance when local balance changes
  useEffect(() => {
    if (localDataCoinBalance !== undefined) {
      setDataCoinBalance(localDataCoinBalance.toString());
    }
  }, [localDataCoinBalance]);

  // Refresh DataCoin balance when user returns to dashboard
  useEffect(() => {
    if (isConnected && address) {
      refetchLocalDataCoinBalance();
    }
  }, [isConnected, address]); // Remove refetchLocalDataCoinBalance from dependencies

  useEffect(() => {
    // Check RPC status
    const checkRPCStatus = async () => {
      try {
        const response = await fetch('/api/transactions?userAddress=' + address);
        if (response.ok) {
          setRpcStatus({
            provider: 'Connected',
            status: 'healthy',
            optimizations: 3 // Caching, batching, fallback
          });
        } else {
          setRpcStatus({
            provider: 'Limited',
            status: 'rate_limited',
            optimizations: 2 // Caching, batching
          });
        }
      } catch (error) {
        setRpcStatus({
          provider: 'Error',
          status: 'failed',
          optimizations: 1 // Local storage only
        });
      }
    };

    if (address) {
      checkRPCStatus();
    }
  }, [address]);

  // Wallet authentication useEffects
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
      await refetchLocalDataCoinBalance();
      // Also refresh certificates
      if (certificates && typeof certificates === 'object' && 'fetchCertificates' in certificates) {
        await (certificates as any).fetchCertificates();
      }
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
            <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
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
            <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
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
            <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
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
              <h2 className="text-2xl font-bold text-black mb-2">
                🎓 Learning Paths
              </h2>
              <p className="text-gray-600">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
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
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-8 border border-purple-100">
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-black mb-4">
              Ready to track your progress?
            </h3>
            <p className="text-gray-600 mb-6">
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
      {/* RPC Status Banner */}
      <div className={`border-l-4 p-6 rounded-lg ${
        rpcStatus.status === 'healthy' ? 'bg-green-50 border-green-400' :
        rpcStatus.status === 'rate_limited' ? 'bg-yellow-50 border-yellow-400' :
        'bg-red-50 border-red-400'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {rpcStatus.status === 'healthy' ? (
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : rpcStatus.status === 'rate_limited' ? (
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${
                rpcStatus.status === 'healthy' ? 'text-green-800' :
                rpcStatus.status === 'rate_limited' ? 'text-yellow-800' :
                'text-red-800'
              }`}>
                RPC Status: {rpcStatus.provider} ({rpcStatus.optimizations} optimizations active)
              </h3>
              <div className={`mt-2 text-sm ${
                rpcStatus.status === 'healthy' ? 'text-green-700' :
                rpcStatus.status === 'rate_limited' ? 'text-yellow-700' :
                'text-red-700'
              }`}>
                {rpcStatus.status === 'healthy' ? (
                  <p>✅ All systems optimized! Using caching, batching, and multi-provider fallback.</p>
                ) : rpcStatus.status === 'rate_limited' ? (
                  <p>⚠️ Rate limited but working! Using caching and batching to reduce RPC calls.</p>
                ) : (
                  <p>❌ RPC issues detected. Using local storage and cached data.</p>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRefreshData}
              className="px-3 py-2 bg-white hover:bg-gray-50 text-gray-800 rounded-lg text-sm font-medium transition-colors border"
            >
              🔄 Refresh
            </button>
            <button
              onClick={() => {
                // Clear cache and refresh
                fetch('/api/transactions?clearCache=true');
                handleRefreshData();
              }}
              className="px-3 py-2 bg-white hover:bg-gray-50 text-gray-800 rounded-lg text-sm font-medium transition-colors border"
            >
              🗑️ Clear Cache
            </button>
          </div>
        </div>
      </div>

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
      <StatsBentoGrid
        sbts={sbtLoading ? "..." : totalSBTs.toString()}
        reputation={reputationLoading ? "..." : totalReputation.toString()}
        dataCoins={dataCoinBalance}
        certificates={certificates.length.toString()}
        onRefreshDataCoins={refetchLocalDataCoinBalance}
      />

      {/* Debug Information - Remove in production 
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-100 p-4 rounded-lg text-sm">
          <h3 className="font-semibold mb-2">Debug Info:</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><strong>SBTs:</strong> {totalSBTs} (Loading: {sbtLoading ? 'Yes' : 'No'})</p>
              <p><strong>Reputation:</strong> {totalReputation} (Loading: {reputationLoading ? 'Yes' : 'No'})</p>
              <p><strong>Activities:</strong> {activities.length} (Loading: {activityLoading ? 'Yes' : 'No'})</p>
            </div>
            <div>
              <p><strong>Recent SBTs:</strong> {recentSBTs.length}</p>
              <p><strong>Recent Gains:</strong> {recentGains.length}</p>
              <p><strong>Certificates:</strong> {certificates.length}</p>
            </div>
          </div>
        </div>
      )}*/}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Repository Submission Card */}
        <div className="lg:col-span-2" data-repo-submission>
          <RepositorySubmissionCard
            onRepositoryAdded={() => {
              // Refresh DataCoin balance when repository is added
              refetchLocalDataCoinBalance();
            }}
          />
        </div>

        {/* Activity Card */}
        <div className="lg:col-span-1">
          <ActivityCard 
            activities={activities} 
            onViewAll={() => router.push('/transactions')}
          />
        </div>
      </div>

      {/* Compact Progress Rewards */}
      <CompactProgressRewards />

      {/* Repository Status Section */}
      {repositoriesLoading ? (
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your repository submissions...</p>
            </div>
          </div>
        </div>
      ) : repositories && repositories.length > 0 ? (
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-black mb-2">📁 My Repository Submissions</h2>
              <p className="text-gray-600">
                Track the status and progress of your submitted repositories
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all shadow-sm"
              >
                🔄 Refresh
              </button>
              <button
                onClick={() => router.push('/admin')}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
              >
                View All
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {repositories.map((repo) => (
              <div
                key={repo.id}
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{repo.repoName}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {repo.repoOwner} • {repo.language || 'Unknown'}
                    </p>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        repo.status === 'approved' ? 'bg-green-100 text-green-800' :
                        repo.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {repo.status === 'approved' ? '✅ Approved' :
                         repo.status === 'rejected' ? '❌ Rejected' :
                         '⏳ Pending'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {repo.verifiedCommits}/{repo.totalCommits} commits
                      </span>
                    </div>
                  </div>
                  <a
                    href={repo.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Verification Progress</span>
                    <span>
                      {repo.totalCommits > 0 
                        ? `${Math.round((repo.verifiedCommits / repo.totalCommits) * 100)}%`
                        : '0%'
                      }
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${repo.totalCommits > 0 ? (repo.verifiedCommits / repo.totalCommits) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-purple-600">{repo.dataCoinsEarned}</div>
                    <div className="text-xs text-gray-500">DataCoins</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-600">{repo.stars || 0}</div>
                    <div className="text-xs text-gray-500">Stars</div>
                  </div>
                </div>

                {/* Submission Date */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Submitted: {new Date(repo.submittedAt.seconds * 1000).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Stats */}
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {repositories.length}
                </div>
                <div className="text-sm text-gray-600">Total Repos</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {repositories.filter(r => r.status === 'approved').length}
                </div>
                <div className="text-sm text-gray-600">Approved</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {repositories.filter(r => r.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {repositories.reduce((sum, r) => sum + r.dataCoinsEarned, 0)}
                </div>
                <div className="text-sm text-gray-600">Total DataCoins</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Repository Submissions Yet</h3>
            <p className="text-gray-600 mb-6">
              Submit your first repository to start earning DataCoins and building your reputation
            </p>
            <button
              onClick={() => {
                // Scroll to repository submission card
                const element = document.querySelector('[data-repo-submission]');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
            >
              Submit Repository
            </button>
          </div>
        </div>
      )}

      {/* Consumer Data Section */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-black mb-2">🔗 Consumer Data</h2>
            <p className="text-gray-600">
              Connect your real-world data sources to earn additional DataCoins
            </p>
          </div>
          <button
            onClick={() => setIsConsumerDataModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
          >
            Connect Data Sources
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* GitHub */}
          <div className={`p-6 rounded-xl border-2 transition-all ${
            hasConnectedSource('github')
              ? 'border-green-200 bg-green-50'
              : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-gradient-to-r from-gray-800 to-gray-600 text-white">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">GitHub</h3>
                <p className="text-sm text-gray-600">Code contributions</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status</span>
                <span className={`font-medium ${
                  hasConnectedSource('github') ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {hasConnectedSource('github') ? 'Connected' : 'Not connected'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">DataCoins</span>
                <span className="font-semibold text-purple-600">
                  {getDataCoinsBySource('github')} earned
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Reward</span>
                <span className="text-gray-500">10 per batch</span>
              </div>
            </div>
          </div>

          {/* Uber */}
          <div className={`p-6 rounded-xl border-2 transition-all ${
            hasConnectedSource('uber')
              ? 'border-green-200 bg-green-50'
              : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-gradient-to-r from-black to-gray-800 text-white">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M0 24h24V0H0v24z" fill="none"/>
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Uber</h3>
                <p className="text-sm text-gray-600">Ride history</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status</span>
                <span className={`font-medium ${
                  hasConnectedSource('uber') ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {hasConnectedSource('uber') ? 'Connected' : 'Not connected'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">DataCoins</span>
                <span className="font-semibold text-purple-600">
                  {getDataCoinsBySource('uber')} earned
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Reward</span>
                <span className="text-gray-500">5 per month</span>
              </div>
            </div>
          </div>

          {/* Amazon */}
          <div className={`p-6 rounded-xl border-2 transition-all ${
            hasConnectedSource('amazon')
              ? 'border-green-200 bg-green-50'
              : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7.77 6.76L6.23 8.3c-.45.45-.45 1.18 0 1.63l1.54 1.54c.45.45 1.18.45 1.63 0l1.54-1.54c.45-.45.45-1.18 0-1.63L9.4 6.76c-.45-.45-1.18-.45-1.63 0zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Amazon</h3>
                <p className="text-sm text-gray-600">Purchase history</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status</span>
                <span className={`font-medium ${
                  hasConnectedSource('amazon') ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {hasConnectedSource('amazon') ? 'Connected' : 'Not connected'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">DataCoins</span>
                <span className="font-semibold text-purple-600">
                  {getDataCoinsBySource('amazon')} earned
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Reward</span>
                <span className="text-gray-500">5 per month</span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-900">Total Consumer DataCoins</h4>
              <p className="text-sm text-gray-600">
                {consumerDataStats.totalContributions} connected sources
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-purple-600">
                {consumerDataStats.totalDataCoins}
              </p>
              <p className="text-sm text-gray-600">DataCoins earned</p>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Tasks Section */}
      <div className="space-y-6">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#4B2995' }}>
              🎓 Learning Paths
            </h2>
            <p className="text-gray-600">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {learningTasks.map((task) => (
            <DynamicLearningTaskCard
              key={task.id}
              task={task}
              userAddress={address}
            />
          ))}
        </div>
      </div>

      {/* Certificates Section */}
      {certificates.length > 0 && (
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold text-black mb-6">🏆 Your Certificates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200 hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-black">
                      {cert.courseName} Certificate
                    </h3>
                    <p className="text-sm text-gray-600">
                      Completed {cert.completionDate}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Modules</span>
                    <span className="font-semibold text-black">
                      {cert.modules?.length || 0} completed
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">DataCoins</span>
                    <span className="font-semibold text-purple-600">
                      +{(cert.modules?.length || 0) * 3} earned
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Lighthouse CID</span>
                    <span className="font-mono text-xs text-gray-500">
                      {cert.cid.slice(0, 8)}...
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/certificate?cid=${cert.cid}`)}
                    className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg text-sm font-medium hover:from-purple-700 hover:to-blue-700 transition-all"
                  >
                    View Certificate
                  </button>
                  <a
                    href={cert.lighthouseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    IPFS
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Consumer Data Modal */}
      <ConsumerDataModal
        isOpen={isConsumerDataModalOpen}
        onClose={() => setIsConsumerDataModalOpen(false)}
      />
    </div>
  );
}

