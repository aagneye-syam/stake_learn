"use client";

import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number;
  total: number;
  completed: number;
  showStats?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export function ProgressBar({ 
  progress, 
  total, 
  completed, 
  showStats = true, 
  size = 'md',
  animated = true 
}: ProgressBarProps) {
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className="space-y-2">
      {showStats && (
        <div className="flex items-center justify-between">
          <span className={`font-medium text-gray-700 dark:text-gray-300 ${textSizeClasses[size]}`}>
            Progress
          </span>
          <span className={`text-gray-500 dark:text-gray-400 ${textSizeClasses[size]}`}>
            {completed} of {total} modules
          </span>
        </div>
      )}
      
      <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <motion.div
          className={`h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500 ${
            animated ? 'animate-pulse' : ''
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      
      {showStats && (
        <div className="flex items-center justify-between">
          <span className={`text-gray-500 dark:text-gray-400 ${textSizeClasses[size]}`}>
            {progress.toFixed(1)}% complete
          </span>
          {progress === 100 && (
            <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Course Complete!
            </span>
          )}
        </div>
      )}
    </div>
  );
}
