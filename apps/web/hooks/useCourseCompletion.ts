import { useState } from 'react';
import { useAccount } from 'wagmi';

export interface CourseCompletionResult {
  certificate: {
    cid: string;
    lighthouseUrl: string;
    studentAddress: string;
    courseId: number;
    courseName: string;
    completionDate: string;
  };
  reward: {
    amount: string;
    tokenAddress: string;
    transactionHash: string;
    timestamp: number;
  };
  message: string;
}

/**
 * Hook for completing courses with certificate storage and DataCoin rewards
 */
export function useCourseCompletion() {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completeCourse = async (
    courseId: number,
    courseName: string,
    courseDifficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  ): Promise<CourseCompletionResult | null> => {
    if (!address || !isConnected) {
      setError('Please connect your wallet to complete the course');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/complete-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentAddress: address,
          courseId,
          courseName,
          courseDifficulty,
          accessToken: address // Using wallet address as access token for Lighthouse
        })
      });

      const data = await response.json();

      if (data.success) {
        return data;
      } else {
        setError(data.error || 'Failed to complete course');
        return null;
      }
    } catch (err) {
      setError('Failed to complete course');
      console.error('Course completion error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getCertificate = async (cid: string): Promise<any | null> => {
    if (!address || !isConnected) {
      setError('Please connect your wallet to view certificate');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/complete-course?cid=${cid}&accessToken=${address}`);
      const data = await response.json();

      if (data.success) {
        return data.certificate;
      } else {
        setError(data.error || 'Failed to retrieve certificate');
        return null;
      }
    } catch (err) {
      setError('Failed to retrieve certificate');
      console.error('Certificate retrieval error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    completeCourse,
    getCertificate,
    loading,
    error,
  };
}
