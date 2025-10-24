"use client";

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useCourseCompletion } from '@/hooks/useCourseCompletion';
import { motion } from 'framer-motion';

interface CourseCompletionProps {
  courseId: number;
  courseName: string;
  courseDifficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  onCompletion?: (result: any) => void;
}

export function CourseCompletion({ courseId, courseName, courseDifficulty, onCompletion }: CourseCompletionProps) {
  const { address, isConnected } = useAccount();
  const { completeCourse, loading, error } = useCourseCompletion();
  const [showSuccess, setShowSuccess] = useState(false);
  const [completionResult, setCompletionResult] = useState<any>(null);

  const handleCompleteCourse = async () => {
    if (!isConnected || !address) {
      alert('Please connect your wallet to complete the course');
      return;
    }

    const result = await completeCourse(courseId, courseName, courseDifficulty);
    
    if (result) {
      setCompletionResult(result);
      setShowSuccess(true);
      onCompletion?.(result);
      
      // Hide success notification after 10 seconds
      setTimeout(() => setShowSuccess(false), 10000);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 text-center">
        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Connect Wallet Required
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Please connect your wallet to complete the course and earn rewards.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Course Completion Card */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Complete Course
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {courseName} ({courseDifficulty})
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">What you'll get:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-green-600 dark:text-green-400">✓</span>
                <span className="text-gray-700 dark:text-gray-300">Encrypted certificate stored on Lighthouse</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600 dark:text-green-400">✓</span>
                <span className="text-gray-700 dark:text-gray-300">
                  {courseDifficulty === 'Beginner' ? '10' : courseDifficulty === 'Intermediate' ? '25' : '50'} DataCoins reward
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600 dark:text-green-400">✓</span>
                <span className="text-gray-700 dark:text-gray-300">Certificate accessible only by you</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleCompleteCourse}
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Completing Course...
              </div>
            ) : (
              '🎓 Complete Course & Earn Rewards'
            )}
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {showSuccess && completionResult && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className="fixed top-4 right-4 z-50 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-xl shadow-lg max-w-md"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">🎉</span>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-lg mb-2">Course Completed!</h4>
              <div className="space-y-2 text-sm">
                <p className="text-green-100">
                  ✅ Certificate stored on Lighthouse
                </p>
                <p className="text-green-100">
                  🪙 +{completionResult.reward.amount} DataCoins earned
                </p>
                <p className="text-green-100">
                  🔗 Tx: {completionResult.reward.transactionHash?.slice(0, 10)}...
                </p>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => window.open(completionResult.certificate.lighthouseUrl, '_blank')}
                  className="px-3 py-1 bg-white/20 text-white text-xs rounded-lg hover:bg-white/30 transition-colors"
                >
                  View Certificate
                </button>
                <button
                  onClick={() => setShowSuccess(false)}
                  className="px-3 py-1 bg-white/20 text-white text-xs rounded-lg hover:bg-white/30 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
