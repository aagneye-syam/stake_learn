"use client";

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface DebugProgressProps {
  courseId: number;
  totalModules: number;
  onRefresh?: () => void;
}

export function DebugProgress({ courseId, totalModules, onRefresh }: DebugProgressProps) {
  const { address } = useAccount();
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadProgress = async () => {
    if (!address) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/progress?userAddress=${address}&courseId=${courseId}`);
      const data = await response.json();
      setProgress(data.progress);
    } catch (error) {
      console.error('Failed to load progress:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgress();
  }, [address, courseId]);

  if (!address) return null;

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
      <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
        🐛 Debug Progress (Course {courseId})
      </h4>
      
      {loading ? (
        <p className="text-sm text-yellow-700 dark:text-yellow-300">Loading...</p>
      ) : progress ? (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-yellow-700 dark:text-yellow-300">Completed Modules:</span>
            <span className="font-medium text-yellow-800 dark:text-yellow-200">
              {progress.completedModules} / {progress.totalModules}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-yellow-700 dark:text-yellow-300">Progress:</span>
            <span className="font-medium text-yellow-800 dark:text-yellow-200">
              {progress.progressPercentage}%
            </span>
          </div>
          <div className="text-yellow-700 dark:text-yellow-300">
            <span className="font-medium">Modules:</span>
            <div className="ml-2 mt-1">
              {progress.modules?.map((module: any, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${module.completed ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                  <span className="text-xs">
                    Module {module.moduleId}: {module.completed ? '✅ Completed' : '⏳ Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={loadProgress}
              className="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 transition-colors"
            >
              Refresh Progress
            </button>
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
              >
                Force Refresh
              </button>
            )}
          </div>
        </div>
      ) : (
        <p className="text-sm text-yellow-700 dark:text-yellow-300">No progress data found</p>
      )}
    </div>
  );
}
