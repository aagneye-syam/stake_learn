"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getUserProgress,
  completeModule,
  isModuleUnlocked,
  getModuleProgress,
  submitAssignment,
  isAssignmentSubmitted,
  getCourseCompletionPercentage,
} from "@/services/userLearningProgress.service";
import {
  UserLearningProgress,
  ModuleProgress as ModuleProgressType,
} from "@/types/userLearningProgress";

export function useUserLearningProgress(
  userId: string | undefined,
  courseId: number
) {
  const [progress, setProgress] = useState<UserLearningProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!userId) {
      setProgress(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getUserProgress(userId, courseId);
      setProgress(data);
    } catch (err) {
      console.error("Error fetching user progress:", err);
      setError(err instanceof Error ? err.message : "Failed to load progress");
    } finally {
      setLoading(false);
    }
  }, [userId, courseId]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const handleCompleteModule = useCallback(
    async (moduleId: number) => {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      try {
        const updatedProgress = await completeModule(userId, courseId, moduleId);
        setProgress(updatedProgress);
        return updatedProgress;
      } catch (err) {
        console.error("Error completing module:", err);
        throw err;
      }
    },
    [userId, courseId]
  );

  const handleSubmitAssignment = useCallback(
    async (assignmentId: string, submissionUrl: string) => {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      try {
        const updatedProgress = await submitAssignment(
          userId,
          courseId,
          assignmentId,
          submissionUrl
        );
        setProgress(updatedProgress);
        return updatedProgress;
      } catch (err) {
        console.error("Error submitting assignment:", err);
        throw err;
      }
    },
    [userId, courseId]
  );

  const checkModuleUnlocked = useCallback(
    async (moduleId: number) => {
      if (!userId) return false;
      return await isModuleUnlocked(userId, courseId, moduleId);
    },
    [userId, courseId]
  );

  const checkAssignmentSubmitted = useCallback(
    async (assignmentId: string) => {
      if (!userId) return false;
      return await isAssignmentSubmitted(userId, courseId, assignmentId);
    },
    [userId, courseId]
  );

  const getCompletionPercentage = useCallback(async () => {
    if (!userId) return 0;
    return await getCourseCompletionPercentage(userId, courseId);
  }, [userId, courseId]);

  return {
    progress,
    loading,
    error,
    refetch: fetchProgress,
    completeModule: handleCompleteModule,
    submitAssignment: handleSubmitAssignment,
    checkModuleUnlocked,
    checkAssignmentSubmitted,
    getCompletionPercentage,
    hasStaked: progress?.isStaked || false,
    isCourseCompleted: progress?.isCourseCompleted || false,
    completedModulesCount: progress?.completedModulesCount || 0,
    totalModules: progress?.modules.length || 0,
    currentModuleId: progress?.currentModuleId || 1,
  };
}
