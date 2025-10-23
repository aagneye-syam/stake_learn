"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import { useStaking, useUserStake } from "@/hooks/useStaking";
import { DynamicWalletButton } from "@/components/DynamicWalletButton";
import { NetworkSwitcher } from "@/components/NetworkSwitcher";
import { TestnetInstructions } from "@/components/TestnetInstructions";
import { NoSSR } from "@/components/NoSSR";
import { StakingButton } from "@/components/StakingButton";
import { ContractTest } from "@/components/ContractTest";
import { ProgressRewards } from "@/components/ProgressRewards";
import { DailyStreak } from "@/components/DailyStreak";
import { CourseCompletion } from "@/components/CourseCompletion";

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

// Course data - should match the IDs from dashboard
const coursesData = {
  "1": {
    id: "1",
    title: "HTML & CSS Fundamentals",
    description: "Master the basics of web development with HTML5 and CSS3. Build responsive layouts and beautiful interfaces from scratch.",
    difficulty: "Beginner" as const,
    duration: "4-6 weeks",
    category: "Web Development",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    stakeAmount: "0.002",
    icon: (
      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
      </svg>
    ),
    fullDescription: `
      Learn to build modern, responsive websites from the ground up. This comprehensive course covers 
      everything from basic HTML tags to advanced CSS layouts including Flexbox and Grid. 
      
      You'll create real-world projects and learn industry best practices for web development.
    `,
    whatYouWillLearn: [
      "HTML5 semantic elements and structure",
      "CSS3 styling, animations, and transitions",
      "Responsive design with Flexbox and Grid",
      "CSS custom properties and preprocessors",
      "Modern layout techniques",
      "Accessibility best practices",
      "Browser developer tools",
      "Project: Build a portfolio website"
    ],
    modules: [
      { id: 1, title: "Introduction to HTML", lessons: 8, duration: "2 hours" },
      { id: 2, title: "CSS Fundamentals", lessons: 10, duration: "3 hours" },
      { id: 3, title: "Responsive Design", lessons: 6, duration: "2.5 hours" },
      { id: 4, title: "Advanced CSS", lessons: 12, duration: "4 hours" },
    ]
  },
  "2": {
    id: "2",
    title: "Solidity Smart Contracts",
    description: "Learn to write, test, and deploy secure smart contracts on Ethereum. Understand DeFi protocols and NFTs.",
    difficulty: "Intermediate" as const,
    duration: "8-10 weeks",
    category: "Blockchain",
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    stakeAmount: "0.002",
    icon: (
      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
      </svg>
    ),
    fullDescription: `
      Dive deep into blockchain development with Solidity. Learn to create secure smart contracts, 
      understand gas optimization, and build decentralized applications on Ethereum.
    `,
    whatYouWillLearn: [
      "Solidity programming fundamentals",
      "Smart contract security patterns",
      "ERC-20 and ERC-721 token standards",
      "DeFi protocol development",
      "Hardhat development environment",
      "Contract testing with Chai",
      "Gas optimization techniques",
      "Project: Build your own DeFi protocol"
    ],
    modules: [
      { id: 1, title: "Blockchain Basics", lessons: 6, duration: "2 hours" },
      { id: 2, title: "Solidity Fundamentals", lessons: 15, duration: "5 hours" },
      { id: 3, title: "Smart Contract Security", lessons: 10, duration: "4 hours" },
      { id: 4, title: "DeFi & NFTs", lessons: 12, duration: "5 hours" },
    ]
  },
  "3": {
    id: "3",
    title: "Rust Programming",
    description: "Dive into systems programming with Rust. Build fast, safe, and concurrent applications with zero-cost abstractions.",
    difficulty: "Advanced" as const,
    duration: "10-12 weeks",
    category: "Systems Programming",
    gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    stakeAmount: "0.002",
    icon: (
      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    ),
    fullDescription: `
      Master Rust programming language and build high-performance systems. Learn memory safety, 
      concurrency, and zero-cost abstractions in this comprehensive course.
    `,
    whatYouWillLearn: [
      "Rust syntax and ownership model",
      "Memory safety without garbage collection",
      "Concurrent programming with threads",
      "Error handling patterns",
      "Cargo and the Rust ecosystem",
      "Traits and generics",
      "Async programming",
      "Project: Build a CLI tool and web server"
    ],
    modules: [
      { id: 1, title: "Getting Started with Rust", lessons: 10, duration: "3 hours" },
      { id: 2, title: "Ownership & Borrowing", lessons: 12, duration: "4 hours" },
      { id: 3, title: "Advanced Concepts", lessons: 15, duration: "5 hours" },
      { id: 4, title: "Real-World Projects", lessons: 8, duration: "6 hours" },
    ]
  },
  "4": {
    id: "4",
    title: "React & Next.js",
    description: "Build modern web applications with React and Next.js. Learn hooks, server components, and full-stack development.",
    difficulty: "Intermediate" as const,
    duration: "6-8 weeks",
    category: "Frontend",
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    stakeAmount: "0.002",
    icon: (
      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
      </svg>
    ),
    fullDescription: `
      Master modern React development with Next.js 14. Build server-rendered applications with 
      the latest features including App Router, Server Components, and Server Actions.
    `,
    whatYouWillLearn: [
      "React fundamentals and hooks",
      "Next.js App Router architecture",
      "Server and Client Components",
      "API routes and Server Actions",
      "Data fetching patterns",
      "State management with Context",
      "TypeScript integration",
      "Project: Build a full-stack app"
    ],
    modules: [
      { id: 1, title: "React Fundamentals", lessons: 12, duration: "4 hours" },
      { id: 2, title: "Next.js Essentials", lessons: 10, duration: "3.5 hours" },
      { id: 3, title: "Advanced Patterns", lessons: 8, duration: "3 hours" },
      { id: 4, title: "Full-Stack Project", lessons: 6, duration: "4 hours" },
    ]
  },
  "5": {
    id: "5",
    title: "Web3 & DApp Development",
    description: "Create decentralized applications using ethers.js, wagmi, and IPFS. Connect smart contracts to beautiful UIs.",
    difficulty: "Advanced" as const,
    duration: "8-10 weeks",
    category: "Web3",
    gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    stakeAmount: "0.002",
    icon: (
      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path d="M13 7H7v6h6V7z" />
        <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
      </svg>
    ),
    fullDescription: `
      Learn to build decentralized applications that connect to blockchain networks. Master Web3 
      libraries, wallet connections, and create production-ready DApps.
    `,
    whatYouWillLearn: [
      "Web3 fundamentals and architecture",
      "Wallet integration (MetaMask, WalletConnect)",
      "ethers.js and wagmi libraries",
      "IPFS for decentralized storage",
      "Smart contract interaction",
      "Transaction handling",
      "Real-time blockchain data",
      "Project: Build a complete DApp"
    ],
    modules: [
      { id: 1, title: "Web3 Basics", lessons: 8, duration: "2.5 hours" },
      { id: 2, title: "Wallet Integration", lessons: 10, duration: "3 hours" },
      { id: 3, title: "Contract Interaction", lessons: 12, duration: "4 hours" },
      { id: 4, title: "Building DApps", lessons: 10, duration: "5 hours" },
    ]
  },
  "6": {
    id: "6",
    title: "Python for Data Science",
    description: "Analyze data with Python, NumPy, and Pandas. Create visualizations and build machine learning models.",
    difficulty: "Beginner" as const,
    duration: "5-7 weeks",
    category: "Data Science",
    gradient: "linear-gradient(135deg, #fa8bff 0%, #2bd2ff 90%, #2bff88 100%)",
    stakeAmount: "0.002",
    icon: (
      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
      </svg>
    ),
    fullDescription: `
      Start your data science journey with Python. Learn to analyze data, create visualizations, 
      and build predictive models using industry-standard tools.
    `,
    whatYouWillLearn: [
      "Python programming basics",
      "NumPy for numerical computing",
      "Pandas for data manipulation",
      "Matplotlib and Seaborn visualizations",
      "Statistical analysis",
      "Machine learning introduction",
      "Jupyter Notebooks",
      "Project: Data analysis and ML model"
    ],
    modules: [
      { id: 1, title: "Python Basics", lessons: 10, duration: "3 hours" },
      { id: 2, title: "Data Manipulation", lessons: 12, duration: "4 hours" },
      { id: 3, title: "Data Visualization", lessons: 8, duration: "2.5 hours" },
      { id: 4, title: "Machine Learning Intro", lessons: 10, duration: "4 hours" },
    ]
  },
};

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const courseId = params.id as string;
  const course = coursesData[courseId as keyof typeof coursesData];
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Use staking hooks for display data only
  const numericCourseId = parseInt(courseId);
  const { stakeAmount: contractStakeAmount } = useStaking(numericCourseId);
  const { hasStaked, hasCompleted } = useUserStake(address, numericCourseId);

  // Format stake amount for display with fallback
  const fallbackAmount = "0.00001"; // 0.0001 ETH for testing
  const displayStakeAmount = contractStakeAmount 
    ? (Number(contractStakeAmount) / 1e18).toFixed(6) 
    : fallbackAmount;

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Course Not Found</h1>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }


  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "Intermediate":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "Advanced":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">

      {/* Hero Section */}
      <div className="relative overflow-visible rounded-3xl p-8 md:p-12 text-white shadow-2xl" style={{ background: course.gradient }}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
        
        <div className="relative z-10">
          <button
            onClick={() => router.push("/dashboard")}
            className="mb-6 flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  {course.icon}
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(course.difficulty)}`}>
                  {course.difficulty}
                </span>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                  {course.category}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{course.title}</h1>
              <p className="text-white/90 text-lg mb-6">{course.description}</p>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span>{course.modules.reduce((acc, m) => acc + m.lessons, 0)} lessons</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* About the Course */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About this Course</h2>
            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line leading-relaxed">
              {course.fullDescription}
            </p>
          </div>

          {/* What You'll Learn */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">What You&apos;ll Learn</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {course.whatYouWillLearn.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Course Modules */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Course Modules</h2>
            <div className="space-y-4">
              {course.modules.map((module) => (
                <div key={module.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Module {module.id}: {module.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      {module.lessons} lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {module.duration}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar - Stake Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-4">
            {/* Main Stake Card */}
            <div className="bg-white rounded-3xl p-6 shadow-2xl">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Stake to Learn</h3>
                <p className="text-gray-600 text-sm">
                  Stake ETH to unlock the course
                </p>
              </div>

              {/* Stake Amount Card - Similar to Funding Card */}
              <div className="rounded-2xl p-5 mb-4" style={{ background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/50 backdrop-blur-sm flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <span className="text-gray-800 font-semibold">Required Stake</span>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{displayStakeAmount} ETH</p>
                  </div>
                </div>
              </div>

              {/* Total Balance Display */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-gray-500">
                    <div className="w-5 h-5 rounded-full bg-gray-300"></div>
                    <span className="text-sm">USD Value</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">$5.00</p>
                <p className="text-sm text-orange-500 font-medium">⟠ {displayStakeAmount} ETH</p>
              </div>

              {/* Network Switcher */}
              <div className="mb-4">
                <NoSSR>
                  <NetworkSwitcher />
                </NoSSR>
              </div>

              {/* Contract Test - Temporary Debug */}
              <div className="mb-4">
                <NoSSR>
                  <ContractTest />
                </NoSSR>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 mb-6">
                <NoSSR>
                  {!isConnected ? (
                    <DynamicWalletButton fullWidth />
                  ) : (
                    <StakingButton 
                      courseId={numericCourseId}
                      onStakeSuccess={() => {
                        // Optional: Add any success callback logic here
                        console.log("Staking successful!");
                      }}
                    />
                  )}
                </NoSSR>
                
                <div className="grid grid-cols-3 gap-2">
                  <button className="py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all flex items-center justify-center shadow-sm">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </button>
                  <button className="py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all flex items-center justify-center shadow-sm">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  <button className="py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all flex items-center justify-center shadow-sm">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Account Management Cards */}
              <div className="space-y-3">
                {/* Funding Account Card */}
                <div className="rounded-2xl p-4 cursor-pointer transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/60 backdrop-blur-sm flex items-center justify-center">
                      <svg className="w-6 h-6 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                        <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">Course Access</h4>
                      <p className="text-sm text-gray-600">Manage your enrollment</p>
                    </div>
                  </div>
                </div>

                {/* Unified Trading Account Card */}
                <div className="rounded-2xl p-4 cursor-pointer transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 100%)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/60 backdrop-blur-sm flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">Progress Tracking</h4>
                      <p className="text-sm text-gray-600">View your achievements</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Progress for Staked Users */}
              {hasStaked && !hasCompleted && (
                <div className="mt-4 p-4 bg-blue-50 rounded-2xl border border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="text-sm font-medium text-blue-800">Course Access Granted</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-blue-700">🎓 You can now access all course materials and start learning!</p>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors">
                        Start Learning
                      </button>
                      <button className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-lg hover:bg-blue-200 transition-colors">
                        View Progress
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Certificate Download for Completed Courses */}
              {hasCompleted && (
                <div className="mt-4 p-4 bg-green-50 rounded-2xl border border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium text-green-800">Certificate Available</span>
                    </div>
                    <button
                      onClick={() => router.push(`/certificate?course=${courseId}`)}
                      className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                    >
                      View Certificate
                    </button>
                  </div>
                </div>
              )}

              {/* Testnet Instructions */}
              <div className="mt-4">
                <NoSSR>
                  <TestnetInstructions />
                </NoSSR>
              </div>

              {/* Info */}
              <div className="mt-4 p-4 bg-blue-50 rounded-2xl border border-blue-200">
                <p className="text-xs text-blue-800 text-center">
                  💡 Your stake is locked during the course and returned upon completion
                </p>
              </div>

            </div>

            {/* Progress Rewards Section */}
            {hasStaked && (
              <div className="bg-white rounded-3xl p-6 shadow-2xl">
                <h3 className="text-xl font-bold text-gray-900 mb-4">🎯 Earn DataCoins</h3>
                <NoSSR>
                  <ProgressRewards 
                    courseId={numericCourseId}
                    courseProgress={Math.floor(Math.random() * 100)} // Mock progress for demo
                    onRewardEarned={(reward) => {
                      console.log('Reward earned:', reward);
                    }}
                  />
                </NoSSR>
              </div>
            )}

            {/* Course Completion Section for Staked Users */}
            {hasStaked && !hasCompleted && (
              <div className="bg-white rounded-3xl p-6 shadow-2xl">
                <h3 className="text-xl font-bold text-gray-900 mb-4">🎓 Complete Course</h3>
                <NoSSR>
                  <CourseCompletion 
                    courseId={numericCourseId}
                    courseName={course.title}
                    courseDifficulty={course.difficulty}
                    onCompletion={(result) => {
                      console.log('Course completed:', result);
                      // You could trigger a page refresh or update state here
                    }}
                  />
                </NoSSR>
              </div>
            )}

            {/* Daily Streak Section */}
            <div className="bg-white rounded-3xl p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-gray-900 mb-4">🔥 Daily Streak</h3>
              <NoSSR>
                <DailyStreak />
              </NoSSR>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
