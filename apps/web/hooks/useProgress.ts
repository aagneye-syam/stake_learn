import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

export interface ProgressReward {
  amount: string;
  tokenAddress: string;
  timestamp: number;
  transactionHash: string;
  rewardType: string;
  courseId?: number;
  progressPercentage?: number;
  streakDays?: number;
  milestone?: string;
}

export interface UserProgress {
  dailyStreak: number;
  weeklyStreak: number;
  monthlyStreak: number;
  totalProgressRewards: number;
  lastActivity: string;
  milestones: Array<{
    type: string;
    count: number;
    lastReward: string;
  }>;
}

/**
 * Hook for progress-based DataCoin rewards
 */
export function useProgress() {
  const { address } = useAccount();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user progress
  const fetchProgress = async () => {
    if (!address) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/progress?userAddress=${address}`);
      const data = await response.json();

      if (data.success) {
        setProgress(data.progress);
      } else {
        setError(data.error || 'Failed to fetch progress');
      }
    } catch (err) {
      setError('Failed to fetch progress');
      console.error('Progress fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Award progress-based DataCoin
  const awardProgressReward = async (
    rewardType: 'daily_streak' | 'course_progress' | 'milestone' | 'weekly_streak' | 'monthly_streak',
    courseId?: number,
    progressPercentage?: number,
    streakDays?: number,
    milestone?: string
  ): Promise<ProgressReward | null> => {
    if (!address) {
      setError('No wallet connected');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentAddress: address,
          rewardType,
          courseId,
          progressPercentage,
          streakDays,
          milestone
        })
      });

      const data = await response.json();

      if (data.success) {
        // Refresh progress data
        await fetchProgress();
        return data.reward;
      } else {
        setError(data.error || 'Failed to award progress reward');
        return null;
      }
    } catch (err) {
      setError('Failed to award progress reward');
      console.error('Progress reward error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Award daily streak reward
  const awardDailyStreak = async (streakDays: number) => {
    return awardProgressReward('daily_streak', undefined, undefined, streakDays);
  };

  // Award course progress reward
  const awardCourseProgress = async (courseId: number, progressPercentage: number) => {
    return awardProgressReward('course_progress', courseId, progressPercentage);
  };

  // Award milestone reward
  const awardMilestone = async (courseId: number, milestone: string) => {
    return awardProgressReward('milestone', courseId, undefined, undefined, milestone);
  };

  // Award weekly streak reward
  const awardWeeklyStreak = async (streakDays: number) => {
    return awardProgressReward('weekly_streak', undefined, undefined, streakDays);
  };

  // Award monthly streak reward
  const awardMonthlyStreak = async (streakDays: number) => {
    return awardProgressReward('monthly_streak', undefined, undefined, streakDays);
  };

  // Auto-fetch progress when address changes
  useEffect(() => {
    if (address) {
      fetchProgress();
    }
  }, [address]);

  return {
    progress,
    loading,
    error,
    fetchProgress,
    awardProgressReward,
    awardDailyStreak,
    awardCourseProgress,
    awardMilestone,
    awardWeeklyStreak,
    awardMonthlyStreak,
  };
}
