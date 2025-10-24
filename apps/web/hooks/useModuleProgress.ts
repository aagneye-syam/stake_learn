import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

export interface ModuleProgress {
  courseId: number;
  moduleId: number;
  completed: boolean;
  completedAt?: number;
  rewardEarned?: string;
  transactionHash?: string;
}

export interface CourseProgress {
  courseId: number;
  totalModules: number;
  completedModules: number;
  progressPercentage: number;
  modules: ModuleProgress[];
}

/**
 * Hook for tracking module completion and progress
 */
export function useModuleProgress(courseId: number, totalModules: number) {
  const { address, isConnected } = useAccount();
  const [courseProgress, setCourseProgress] = useState<CourseProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize course progress
  useEffect(() => {
    if (!courseId || !totalModules) return;

    const initializeProgress = () => {
      const modules: ModuleProgress[] = [];
      for (let i = 1; i <= totalModules; i++) {
        modules.push({
          courseId,
          moduleId: i,
          completed: false,
        });
      }

      setCourseProgress({
        courseId,
        totalModules,
        completedModules: 0,
        progressPercentage: 0,
        modules,
      });
    };

    initializeProgress();
  }, [courseId, totalModules]);

  // Complete a module
  const completeModule = async (moduleId: number): Promise<boolean> => {
    if (!address || !isConnected) {
      setError('Please connect your wallet to complete modules');
      return false;
    }

    if (!courseProgress) {
      setError('Course progress not initialized');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // Call API to complete module and mint DataCoins
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentAddress: address,
          rewardType: 'course_progress',
          courseId,
          progressPercentage: Math.floor(((courseProgress.completedModules + 1) / totalModules) * 100),
          milestone: `module_${moduleId}_completed`,
        })
      });

      const data = await response.json();

      if (data.success) {
        // Update local progress
        const updatedModules = courseProgress.modules.map(module => 
          module.moduleId === moduleId 
            ? { 
                ...module, 
                completed: true, 
                completedAt: Math.floor(Date.now() / 1000),
                rewardEarned: data.reward.amount,
                transactionHash: data.reward.transactionHash
              }
            : module
        );

        const completedModules = updatedModules.filter(m => m.completed).length;
        const progressPercentage = Math.floor((completedModules / totalModules) * 100);

        setCourseProgress({
          ...courseProgress,
          modules: updatedModules,
          completedModules,
          progressPercentage,
        });

        return true;
      } else {
        setError(data.error || 'Failed to complete module');
        return false;
      }
    } catch (err) {
      setError('Failed to complete module');
      console.error('Module completion error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Check if module is completed
  const isModuleCompleted = (moduleId: number): boolean => {
    if (!courseProgress) return false;
    const module = courseProgress.modules.find(m => m.moduleId === moduleId);
    return module?.completed || false;
  };

  // Get module progress
  const getModuleProgress = (moduleId: number): ModuleProgress | null => {
    if (!courseProgress) return null;
    return courseProgress.modules.find(m => m.moduleId === moduleId) || null;
  };

  // Reset course progress (for testing)
  const resetProgress = () => {
    if (!courseId || !totalModules) return;

    const modules: ModuleProgress[] = [];
    for (let i = 1; i <= totalModules; i++) {
      modules.push({
        courseId,
        moduleId: i,
        completed: false,
      });
    }

    setCourseProgress({
      courseId,
      totalModules,
      completedModules: 0,
      progressPercentage: 0,
      modules,
    });
  };

  return {
    courseProgress,
    loading,
    error,
    completeModule,
    isModuleCompleted,
    getModuleProgress,
    resetProgress,
  };
}
