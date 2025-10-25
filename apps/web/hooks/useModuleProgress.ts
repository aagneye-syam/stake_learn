import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useDataCoinBalance } from './useDataCoin';

// Helper function to get course name
function getCourseName(courseId: number): string {
  const courseNames: { [key: number]: string } = {
    1: 'Introduction to HTML',
    2: 'CSS Fundamentals',
    3: 'Responsive Design',
    4: 'Advanced CSS',
    5: 'JavaScript Basics',
    6: 'React Fundamentals'
  };
  return courseNames[courseId] || `Course ${courseId}`;
}

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
  const [initialized, setInitialized] = useState(false);
  
  // Get DataCoin balance refetch function
  const { refetch: refetchDataCoinBalance } = useDataCoinBalance(address);

  // Initialize course progress - only run once when component mounts
  useEffect(() => {
    if (!courseId || !totalModules || !address || initialized) return;

    const loadProgress = async () => {
      try {
        // Try to load existing progress from API
        const response = await fetch(`/api/progress?userAddress=${address}&courseId=${courseId}&totalModules=${totalModules}`);
        const data = await response.json();
        
        console.log('API Response:', { 
          success: data.success, 
          hasProgress: !!data.progress, 
          modulesCount: data.progress?.modules?.length,
          data 
        });

        if (data.success && data.progress) {
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
        setInitialized(true);
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
        setInitialized(true);
      }
    };

    loadProgress();
  }, [courseId, totalModules, address, initialized]);

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
        
        // Check if all modules are now completed
        const allModulesCompleted = completedModules + 1 === totalModules;
        
        if (allModulesCompleted) {
          // Store certificate on Lighthouse when all modules are completed
          try {
            const certificateResponse = await fetch('/api/complete-course', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                studentAddress: address,
                courseId: courseId,
                courseName: getCourseName(courseId), // Get proper course name
                modules: updatedModules.filter(m => m.completed),
                stakeAmount: "0.0001"
              }),
            });
            
            const certificateData = await certificateResponse.json();
            
            if (certificateData.success) {
              console.log('Certificate stored on Lighthouse:', certificateData.cid);
              
              // Show certificate success notification
              if (typeof window !== 'undefined') {
                const toast = document.createElement('div');
                toast.className = 'fixed top-4 right-4 bg-purple-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
                toast.innerHTML = `
                  <div class="flex items-center gap-2">
                    <span class="text-xl">🏆</span>
                    <div>
                      <p class="font-semibold">Certificate Generated!</p>
                      <p class="text-sm opacity-90">Stored on Lighthouse IPFS</p>
                    </div>
                  </div>
                `;
                document.body.appendChild(toast);
                
                // Animate in
                setTimeout(() => {
                  toast.classList.remove('translate-x-full');
                }, 100);
                
                // Remove after 4 seconds
                setTimeout(() => {
                  toast.classList.add('translate-x-full');
                  setTimeout(() => {
                    document.body.removeChild(toast);
                  }, 300);
                }, 4000);
              }
            }
          } catch (error) {
            console.error('Failed to store certificate:', error);
          }
        }
        
        // Show success notification
        if (typeof window !== 'undefined') {
          // Create a simple toast notification
          const toast = document.createElement('div');
          toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
          toast.innerHTML = `
            <div class="flex items-center gap-2">
              <span class="text-xl">🪙</span>
              <div>
                <p class="font-semibold">+3 DataCoins Earned!</p>
                <p class="text-sm opacity-90">Module ${moduleId} completed</p>
              </div>
            </div>
          `;
          document.body.appendChild(toast);
          
          // Animate in
          setTimeout(() => {
            toast.classList.remove('translate-x-full');
          }, 100);
          
          // Remove after 3 seconds
          setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => {
              document.body.removeChild(toast);
            }, 300);
          }, 3000);
        }
        
        // Refresh DataCoin balance with a small delay to ensure the API has processed
        setTimeout(() => {
          refetchDataCoinBalance();
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
      const response = await fetch(`/api/progress?userAddress=${address}&courseId=${courseId}&totalModules=${totalModules}`);
      const data = await response.json();
      if (data.success && data.progress) {
        console.log('Manually refreshed progress:', data.progress);
        setCourseProgress(data.progress);
        // Also refresh DataCoin balance
        refetchDataCoinBalance();
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
