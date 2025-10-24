"use client";

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useProgress } from '@/hooks/useProgress';
import { motion } from 'framer-motion';

export function DailyStreak() {
  const { address, isConnected } = useAccount();
  const { progress, awardDailyStreak, loading } = useProgress();
  const [streakChecked, setStreakChecked] = useState(false);
  const [showStreakReward, setShowStreakReward] = useState(false);

  // Check if user has already claimed today's streak
  useEffect(() => {
    if (!isConnected || !address || !progress) return;

    const today = new Date().toDateString();
    const lastActivity = new Date(progress.lastActivity).toDateString();
    
    // If last activity was today, they've already claimed
    if (today === lastActivity) {
      setStreakChecked(true);
    }
  }, [isConnected, address, progress]);

  const handleDailyStreak = async () => {
    if (!progress || streakChecked) return;

    const reward = await awardDailyStreak(progress.dailyStreak + 1);
    if (reward) {
      setStreakChecked(true);
      setShowStreakReward(true);
      
      // Hide reward notification after 5 seconds
      setTimeout(() => setShowStreakReward(false), 5000);
    }
  };

  if (!isConnected || !progress) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Daily Streak Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            🔥 Daily Streak
          </h3>
          <div className="text-right">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {progress.dailyStreak}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">days</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Today's Reward</span>
            <span className="font-medium text-gray-900 dark:text-white">
              +5 DataCoins
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Weekly Streak</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {progress.weeklyStreak} days
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Monthly Streak</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {progress.monthlyStreak} days
            </span>
          </div>
        </div>

        {/* Streak milestones */}
        <div className="mt-3 pt-3 border-t border-orange-200 dark:border-orange-700">
          <div className="space-y-1">
            {[
              { days: 7, reward: '15', label: 'Weekly' },
              { days: 30, reward: '50', label: 'Monthly' }
            ].map((milestone) => (
              <div key={milestone.days} className="flex items-center justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">
                  {milestone.label} milestone ({milestone.days} days)
                </span>
                <div className="flex items-center gap-2">
                  {progress.dailyStreak >= milestone.days ? (
                    <span className="text-green-600 dark:text-green-400">✅</span>
                  ) : (
                    <span className="text-gray-400">
                      {milestone.days - progress.dailyStreak} to go
                    </span>
                  )}
                  <span className="text-orange-600 dark:text-orange-400">
                    +{milestone.reward}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Claim button */}
        <button
          onClick={handleDailyStreak}
          disabled={streakChecked || loading}
          className={`w-full mt-3 py-2 px-4 rounded-lg font-medium transition-all ${
            streakChecked
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              : 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Claiming...
            </div>
          ) : streakChecked ? (
            '✅ Claimed Today'
          ) : (
            '🔥 Claim Daily Reward'
          )}
        </button>
      </motion.div>

      {/* Streak reward notification */}
      {showStreakReward && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className="fixed top-4 right-4 z-50 bg-gradient-to-r from-orange-500 to-red-600 text-white p-4 rounded-xl shadow-lg max-w-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-lg">🔥</span>
            </div>
            <div>
              <h4 className="font-semibold">Streak Reward!</h4>
              <p className="text-sm text-orange-100">
                +5 DataCoins for daily streak
              </p>
              <p className="text-xs text-orange-200">
                Keep it up! 🔥
              </p>
            </div>
            <button
              onClick={() => setShowStreakReward(false)}
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
