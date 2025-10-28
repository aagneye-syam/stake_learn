import { useState, useEffect } from 'react';
import { 
  getUserCourseTransaction, 
  hasUserStakedCourse 
} from '@/services/staking-transaction.service';
import type { StakingTransaction } from '@/services/staking-transaction.service';

/**
 * Hook to check if user has staked a course and get transaction details
 */
export function useStakingStatus(userId: string | undefined, courseId: number) {
  const [transaction, setTransaction] = useState<StakingTransaction | null>(null);
  const [hasStaked, setHasStaked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStakingStatus = async () => {
      if (!userId) {
        setHasStaked(false);
        setTransaction(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Check if user has staked
        const staked = await hasUserStakedCourse(userId, courseId);
        setHasStaked(staked);

        // Get transaction details if staked
        if (staked) {
          const txn = await getUserCourseTransaction(userId, courseId);
          setTransaction(txn);
        } else {
          setTransaction(null);
        }
      } catch (error) {
        console.error('Error checking staking status:', error);
        setHasStaked(false);
        setTransaction(null);
      } finally {
        setLoading(false);
      }
    };

    checkStakingStatus();
  }, [userId, courseId]);

  return {
    hasStaked,
    transaction,
    loading,
    completedModules: transaction?.completedModules || 0,
    totalModules: transaction?.totalModules || 0,
    isCompleted: transaction?.isCompleted || false,
    progressPercentage: transaction 
      ? Math.round((transaction.completedModules / transaction.totalModules) * 100)
      : 0
  };
}
