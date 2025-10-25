import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useDataCoinBalance } from './useDataCoin';

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
  
  // Get DataCoin balance refetch function
  const { refetch: refetchDataCoinBalance } = useDataCoinBalance(address);

  // Initialize course progress
  useEffect(() => {
    if (!courseId || !totalModules || !address) return;

    const loadProgress = async () => {
      try {
        // Try to load existing progress from API
        const response = await fetch(`/api/progress?userAddress=${address}&courseId=${courseId}`);
        const data = await response.json();

        if (data.success && data.progress && data.progress.modules && data.progress.modules.length > 0) {
          console.log('Loaded existing progress:', data.progress);
          setCourseProgress(data.progress);
        } else {
          // Initialize empty progress if none exists
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
        }
      } catch (error) {
        console.error('Failed to load progress:', error);
        // Fallback to empty progress
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
      }
    };

    loadProgress();
  }, [courseId, totalModules, address]);

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

    // Check if module is already completed
    if (isModuleCompleted(moduleId)) {
      setError('Module already completed');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Completing module:', moduleId, 'for course:', courseId);
      
      // Call API to complete module and mint DataCoins
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
          studentAddress: address,
          rewardType: 'course_progress',
          courseId,
          progressPercentage: Math.floor(((courseProgress.completedModules + 1) / totalModules) * 100),
          milestone: `module_${moduleId}_completed`,
          moduleId,
          totalModules
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API response:', data);

      if (data.success) {
        // Update local progress
        const updatedModules = courseProgress.modules.map(module => 
          module.moduleId === moduleId 
            ? { 
                ...module, 
                completed: true, 
                completedAt: Math.floor(Date.now() / 1000),
                rewardEarned: data.reward?.amount || '3',
                transactionHash: data.reward?.transactionHash
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

        console.log('Module completed successfully:', moduleId);
        
        // Reload progress from server to ensure consistency
        setTimeout(async () => {
          try {
            const response = await fetch(`/api/progress?userAddress=${address}&courseId=${courseId}`);
            const data = await response.json();
            if (data.success && data.progress) {
              console.log('Reloaded progress after completion:', data.progress);
              setCourseProgress(data.progress);
            }
            
            // Refresh DataCoin balance
            refetchDataCoinBalance();
          } catch (error) {
            console.error('Failed to reload progress:', error);
          }
        }, 1000);
        
        return true;
      } else {
        const errorMsg = data.error || 'Failed to complete module';
        setError(errorMsg);
        console.error('API error:', errorMsg);
        return false;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to complete module';
      setError(errorMsg);
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

  // Manual refresh function
  const refreshProgress = async () => {
    if (!address || !courseId) return;
    
    try {
      const response = await fetch(`/api/progress?userAddress=${address}&courseId=${courseId}`);
      const data = await response.json();
      if (data.success && data.progress) {
        console.log('Manually refreshed progress:', data.progress);
        setCourseProgress(data.progress);
      }
    } catch (error) {
      console.error('Failed to refresh progress:', error);
    }
  };

  return {
    courseProgress,
    loading,
    error,
    completeModule,
    isModuleCompleted,
    getModuleProgress,
    resetProgress,
    refreshProgress,
  };
}
