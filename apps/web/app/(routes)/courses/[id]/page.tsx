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
import { ModuleCard } from "@/components/ModuleCard";
import { ProgressBar } from "@/components/ProgressBar";
import { useUserLearningProgress } from "@/hooks/useUserLearningProgress";
import { DebugProgress } from "@/components/DebugProgress";
import { AssignmentList } from "@/_components/AssignmentList";
import { getCourseById, CourseData } from "@/services/course.service";
import { getCourseById as getCourseMeta } from "@/lib/courseService";
import { Course } from "@/types/course";

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

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const courseId = params.id as string;
  const [mounted, setMounted] = useState(false);
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [courseMeta, setCourseMeta] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    const loadCourse = async () => {
      try {
        setLoading(true);
        const numericId = parseInt(courseId);
        
        // Fetch from Firebase course service (detailed data)
        const data = await getCourseById(numericId);
        setCourseData(data);
        
        // Fetch from course meta (for additional display info)
        const meta = await getCourseMeta(courseId);
        setCourseMeta(meta);
      } catch (error) {
        console.error("Failed to load course:", error);
      } finally {
        setLoading(false);
      }
    };
    loadCourse();
  }, [courseId]);
  
  // Use staking hooks for display data only
  const numericCourseId = parseInt(courseId);
  const { stakeAmount: contractStakeAmount } = useStaking(numericCourseId);
  const { hasStaked, hasCompleted } = useUserStake(address, numericCourseId);
  
  // New Firebase-based progress tracking
  const {
    progress: userProgress,
    loading: progressLoading,
    error: progressError,
    completeModule: handleCompleteModule,
    refetch: refetchProgress,
    completedModulesCount,
    totalModules,
    currentModuleId,
    isCourseCompleted,
  } = useUserLearningProgress(address, numericCourseId);

  // Check if all modules are completed
  const allModulesCompleted = userProgress?.isCourseCompleted || false;

  // Helper function to check if module is completed
  const isModuleCompleted = (moduleId: number) => {
    return userProgress?.modules.find(m => m.moduleId === moduleId)?.isCompleted || false;
  };

  // Helper function to check if module is unlocked
  const isModuleUnlocked = (moduleId: number) => {
    return userProgress?.modules.find(m => m.moduleId === moduleId)?.isUnlocked || false;
  };

  // Helper function to get module progress
  const getModuleProgressData = (moduleId: number) => {
    const module = userProgress?.modules.find(m => m.moduleId === moduleId);
    if (!module) return undefined;
    return {
      completedAt: module.completedAt?.seconds,
      rewardEarned: "3", // DataCoins per module
      transactionHash: undefined,
    };
  };

  // Wrapper for module completion to match ModuleCard interface
  const onModuleComplete = async (moduleId: number): Promise<boolean> => {
    try {
      await handleCompleteModule(moduleId);
      return true;
    } catch (err) {
      console.error("Failed to complete module:", err);
      return false;
    }
  };

  // Course progress for display
  const courseProgress = userProgress ? {
    totalModules: userProgress.modules.length,
    completedModules: completedModulesCount,
    progressPercentage: userProgress.modules.length > 0 
      ? Math.round((completedModulesCount / userProgress.modules.length) * 100)
      : 0,
  } : null;

  // Format stake amount for display with fallback
  const fallbackAmount = "0.000100"; // from Firebase or contract
  const displayStakeAmount = courseData?.stakeAmount || contractStakeAmount 
    ? courseData?.stakeAmount || (Number(contractStakeAmount) / 1e18).toFixed(6) 
    : fallbackAmount;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-50 text-green-600 border border-green-200";
      case "Intermediate":
        return "bg-yellow-50 text-yellow-600 border border-yellow-200";
      case "Advanced":
        return "bg-red-50 text-red-600 border border-red-200";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600 font-medium">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Course Not Found</h1>
          <p className="text-gray-600 mb-6">The course you're looking for doesn't exist or hasn't been published yet.</p>
          <button
            onClick={() => router.push("/courses")}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">

      {/* Hero Section */}
      <div className="relative overflow-visible rounded-3xl p-8 md:p-12 text-white shadow-2xl" style={{ background: courseMeta?.level === "Advanced" ? "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" : courseMeta?.level === "Intermediate" ? "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
        
        <div className="relative z-10">
          <button
            onClick={() => router.push("/courses")}
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
                  <span className="text-2xl">{courseMeta?.icon || "📚"}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(courseMeta?.level || "Beginner")}`}>
                  {courseMeta?.level || "Beginner"}
                </span>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                  {courseMeta?.category || "Course"}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{courseData.title}</h1>
              <p className="text-white/90 text-lg mb-6">{courseData.description}</p>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{courseMeta?.duration || "4-6 weeks"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span>{courseData.modules.reduce((acc, m) => acc + (m.lessons || 0), 0)} lessons</span>
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
              {courseData.description}
            </p>
          </div>

          {/* What You'll Learn - Only show if modules have descriptions */}
          {courseData.modules.some(m => m.description) && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">What You&apos;ll Learn</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courseData.modules.map((module, index) => module.description && (
                  <div key={index} className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">{module.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Course Progress - Only show for staked courses */}
          {hasStaked && courseProgress && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Course Progress</h2>
              <div className="flex items-center justify-between mb-4">
                <ProgressBar 
                  progress={courseProgress.progressPercentage}
                  total={courseProgress.totalModules}
                  completed={courseProgress.completedModules}
                  size="lg"
                  animated={true}
                />
                <button
                  onClick={refetchProgress}
                  className="ml-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  🔄 Refresh
                </button>
              </div>
              
              {/* Debug Progress - Remove in production 
              <DebugProgress 
                courseId={numericCourseId} 
                totalModules={course?.modules.length || 0} 
                onRefresh={refreshProgress}
              />*/}
            </div>
          )}

          {/* Course Completion Celebration */}
          {hasStaked && allModulesCompleted && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-8 shadow-lg border-2 border-green-200 dark:border-green-800">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-green-800 dark:text-green-200 mb-4">
                  🎉 Congratulations! Course Completed!
                </h2>
                <p className="text-green-700 dark:text-green-300 text-lg mb-6">
                  You've successfully completed all modules in <strong>{courseData.title}</strong>!
                </p>
                <div className="bg-white/50 dark:bg-green-900/30 rounded-xl p-6 mb-6">
                  <h3 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-4">🎯 What You've Achieved</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📚</span>
                      <div>
                        <p className="font-semibold text-green-800 dark:text-green-200">All Modules Completed</p>
                        <p className="text-sm text-green-600 dark:text-green-400">{courseProgress.completedModules}/{courseProgress.totalModules} modules</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🪙</span>
                      <div>
                        <p className="font-semibold text-green-800 dark:text-green-200">DataCoins Earned</p>
                        <p className="text-sm text-green-600 dark:text-green-400">{courseProgress.completedModules * 3} DataCoins</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🏆</span>
                      <div>
                        <p className="font-semibold text-green-800 dark:text-green-200">Certificate Ready</p>
                        <p className="text-sm text-green-600 dark:text-green-400">Soulbound certificate available</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💎</span>
                      <div>
                        <p className="font-semibold text-green-800 dark:text-green-200">Stake Returned</p>
                        <p className="text-sm text-green-600 dark:text-green-400">Your ETH stake will be returned</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => router.push(`/certificate?course=${courseId}`)}
                    className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    🏆 View Certificate
                  </button>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="px-8 py-4 bg-white/20 backdrop-blur-sm border-2 border-green-300 text-green-800 dark:text-green-200 rounded-xl font-semibold hover:bg-white/30 transition-all"
                  >
                    📊 Back to Dashboard
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Course Modules */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Course Modules</h2>
            
            {!hasStaked ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Stake to Unlock Course Modules
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Stake ETH to access all course modules and start earning DataCoins for your progress.
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    💡 <strong>How it works:</strong> Stake ETH to unlock course access, complete modules to earn DataCoins, and get your stake back when you finish the course!
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {courseData.modules.map((module) => (
                  <ModuleCard
                    key={module.id}
                    module={{
                      ...module,
                      lessons: module.lessons || 0,
                      duration: module.duration || "TBD"
                    }}
                    courseId={numericCourseId}
                    isCompleted={isModuleCompleted(module.id)}
                    onComplete={onModuleComplete}
                    loading={progressLoading}
                    moduleProgress={getModuleProgressData(module.id)}
                    hasStaked={hasStaked}
                    hasCompleted={hasCompleted}
                    error={progressError || undefined}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Course Assignments */}
          {courseData.assignments && courseData.assignments.length > 0 && (
            <div className="mt-8">
              <AssignmentList 
                assignments={courseData.assignments}
                courseId={numericCourseId}
              />
            </div>
          )}
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

              {/* Contract Test - Temporary Debug
              <div className="mb-4">
                <NoSSR>
                  <ContractTest />
                </NoSSR>
              </div> */}

              {/* Action Buttons */}
              <div className="space-y-3 mb-6">
                <NoSSR>
                  {!isConnected ? (
                    <DynamicWalletButton fullWidth />
                  ) : (
                    <StakingButton 
                      courseId={numericCourseId}
                      totalModules={courseData.totalModules}
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
                    courseProgress={courseProgress?.progressPercentage || 0}
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
                    courseName={courseData.title}
                    courseDifficulty={courseMeta?.level || "Beginner"}
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
