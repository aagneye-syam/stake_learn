"use client";

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import { ModuleContentViewer } from './ModuleContentViewer';
import { CourseModuleResource } from '@/services/course.service';

interface Module {
  id: number;
  title: string;
  lessons: number;
  duration: string;
  resources?: CourseModuleResource[];
}

interface ModuleCardProps {
  module: Module;
  courseId: number;
  isCompleted: boolean;
  onComplete: (moduleId: number) => Promise<boolean>;
  loading: boolean;
  moduleProgress?: {
    completedAt?: number;
    rewardEarned?: string;
    transactionHash?: string;
  };
  hasStaked: boolean;
  hasCompleted: boolean;
  error?: string | null;
}

export function ModuleCard({ 
  module, 
  courseId, 
  isCompleted, 
  onComplete, 
  loading,
  moduleProgress,
  hasStaked,
  hasCompleted,
  error
}: ModuleCardProps) {
  const { isConnected } = useAccount();
  const [showReward, setShowReward] = useState(false);

  const handleComplete = async () => {
    if (!isConnected) {
      alert('Please connect your wallet to complete modules');
      return;
    }

    const success = await onComplete(module.id);
    if (success) {
      setShowReward(true);
      // Hide reward notification after 5 seconds
      setTimeout(() => setShowReward(false), 5000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border rounded-xl p-6 transition-all duration-200 ${
        isCompleted 
          ? 'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700' 
          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
              isCompleted 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}>
              {isCompleted ? '✓' : module.id}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {module.title}
            </h3>
            {isCompleted && (
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full font-medium">
                Completed
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400 mb-4">
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

          {/* Module completion info */}
          {isCompleted && moduleProgress && (
            <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                  Completed on {new Date((moduleProgress.completedAt || 0) * 1000).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-700 dark:text-green-300">
                  🪙 +{moduleProgress.rewardEarned} DataCoins earned
                </span>
                {moduleProgress.transactionHash && (
                  <span className="text-green-600 dark:text-green-400 font-mono text-xs">
                    Tx: {moduleProgress.transactionHash.slice(0, 8)}...
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Module Learning Resources */}
          {module.resources && module.resources.length > 0 && hasStaked && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Learning Resources
              </h4>
              <ModuleContentViewer 
                moduleName={module.title}
                resources={module.resources}
              />
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          {isCompleted ? (
            <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Module completed
            </span>
          ) : !hasStaked ? (
            <span className="flex items-center gap-1 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Stake to unlock
            </span>
          ) : hasCompleted ? (
            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Course completed
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Ready to complete
            </span>
          )}
        </div>

        {/* Show complete button only for in-progress courses (staked but not completed) */}
        {!isCompleted && hasStaked && !hasCompleted && (
          <button
            onClick={handleComplete}
            disabled={loading || !isConnected}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              loading || !isConnected
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
            }`}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Completing...
              </div>
            ) : (
              'Complete Module'
            )}
          </button>
        )}
      </div>

      {/* Reward Notification */}
      {showReward && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className="fixed top-4 right-4 z-50 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-xl shadow-lg max-w-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-lg">🎉</span>
            </div>
            <div>
              <h4 className="font-semibold">Module Completed!</h4>
              <p className="text-sm text-green-100">
                +3 DataCoins earned for progress
              </p>
              <p className="text-xs text-green-200">
                Keep learning! 📚
              </p>
            </div>
            <button
              onClick={() => setShowReward(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
