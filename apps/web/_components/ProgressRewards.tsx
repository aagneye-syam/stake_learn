"use client";

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useProgress } from '@/hooks/useProgress';
import { motion } from 'framer-motion';

interface ProgressRewardsProps {
  courseId: number;
  courseProgress: number;
  onRewardEarned?: (reward: any) => void;
}

export function ProgressRewards({ courseId, courseProgress, onRewardEarned }: ProgressRewardsProps) {
  const { address, isConnected } = useAccount();
  const { progress, awardCourseProgress, awardMilestone, loading } = useProgress();
  const [lastProgressReward, setLastProgressReward] = useState<number>(0);
  const [showReward, setShowReward] = useState(false);
  const [currentReward, setCurrentReward] = useState<any>(null);

  // Check for progress milestones
  useEffect(() => {
    if (!isConnected || !address || loading) return;

    const checkProgressMilestones = async () => {
      // Award progress rewards at 25%, 50%, 75%
      const milestones = [25, 50, 75];
      
      for (const milestone of milestones) {
        if (courseProgress >= milestone && lastProgressReward < milestone) {
          const reward = await awardCourseProgress(courseId, courseProgress);
          if (reward) {
            setCurrentReward(reward);
            setShowReward(true);
            setLastProgressReward(milestone);
            onRewardEarned?.(reward);
            
            // Hide reward notification after 5 seconds
            setTimeout(() => setShowReward(false), 5000);
          }
          break; // Only award one milestone at a time
        }
      }
    };

    checkProgressMilestones();
  }, [courseProgress, courseId, isConnected, address, loading, lastProgressReward, awardCourseProgress, onRewardEarned]);

  // Award milestone rewards
  const handleMilestoneReward = async (milestone: string) => {
    const reward = await awardMilestone(courseId, milestone);
    if (reward) {
      setCurrentReward(reward);
      setShowReward(true);
      onRewardEarned?.(reward);
      
      // Hide reward notification after 5 seconds
      setTimeout(() => setShowReward(false), 5000);
    }
  };

  if (!isConnected) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Progress-based rewards */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          🎯 Progress Rewards
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Course Progress</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {courseProgress}%
            </span>
          </div>
          
          {/* Progress milestones */}
          <div className="space-y-1">
            {[25, 50, 75].map((milestone) => (
              <div key={milestone} className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {milestone}% milestone
                </span>
                <div className="flex items-center gap-2">
                  {courseProgress >= milestone ? (
                    <span className="text-xs text-green-600 dark:text-green-400">✅ Earned</span>
                  ) : (
                    <span className="text-xs text-gray-400">⏳ Pending</span>
                  )}
                  <span className="text-xs text-blue-600 dark:text-blue-400">
                    +3 DataCoins
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Milestone rewards */}
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Special Milestones</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleMilestoneReward('first_lesson')}
                className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
              >
                First Lesson +8 DataCoins
              </button>
              <button
                onClick={() => handleMilestoneReward('halfway')}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              >
                Halfway +8 DataCoins
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reward notification */}
      {showReward && currentReward && (
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
              <h4 className="font-semibold">Reward Earned!</h4>
              <p className="text-sm text-green-100">
                +{currentReward.amount} DataCoins for {currentReward.rewardType}
              </p>
              <p className="text-xs text-green-200">
                Tx: {currentReward.transactionHash?.slice(0, 10)}...
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
    </div>
  );
}
