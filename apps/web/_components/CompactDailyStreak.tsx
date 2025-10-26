"use client";

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useProgress } from '@/hooks/useProgress';
import { motion } from 'framer-motion';

export function CompactDailyStreak() {
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
      
      // Hide reward notification after 3 seconds
      setTimeout(() => setShowStreakReward(false), 3000);
    }
  };

  if (!isConnected || !progress) {
    return null;
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-50 to-red-50 rounded-full border border-orange-200 hover:shadow-md transition-all cursor-pointer"
        onClick={handleDailyStreak}
      >
        <span className="text-lg">🔥</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            {progress.dailyStreak}
          </span>
          <span className="text-xs text-gray-500">days</span>
        </div>
        {streakChecked ? (
          <span className="text-xs text-green-600">✓</span>
        ) : (
          <span className="text-xs text-orange-600">+5</span>
        )}
      </motion.div>

      {/* Streak reward notification */}
      {showStreakReward && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className="fixed top-4 right-4 z-50 bg-gradient-to-r from-orange-500 to-red-600 text-white p-3 rounded-xl shadow-lg max-w-sm"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🔥</span>
            <div>
              <p className="text-sm font-medium">+5 DataCoins earned!</p>
              <p className="text-xs text-orange-100">Keep the streak going!</p>
            </div>
            <button
              onClick={() => setShowStreakReward(false)}
              className="text-white/80 hover:text-white transition-colors ml-2"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </>
  );
}
