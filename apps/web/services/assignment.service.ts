"use client";

import {
  submitAssignment as submitAssignmentToProgress,
  isAssignmentSubmitted,
  getUserProgress,
} from "./userLearningProgress.service";
import { AssignmentSubmissionData, AssignmentSubmissionStatus } from "@/types/assignment";

/**
 * Submit an assignment with URL
 */
export async function submitAssignment(
  userId: string,
  courseId: number,
  data: AssignmentSubmissionData
): Promise<boolean> {
  try {
    const result = await submitAssignmentToProgress(
      userId,
      courseId,
      data.assignmentId,
      data.submissionUrl
    );
    return result !== null;
  } catch (error) {
    console.error("Error submitting assignment:", error);
    throw error;
  }
}

/**
 * Get assignment submission status
 */
export async function getAssignmentStatus(
  userId: string,
  courseId: number,
  assignmentId: string
): Promise<AssignmentSubmissionStatus | null> {
  try {
    const progress = await getUserProgress(userId, courseId);
    if (!progress) return null;

    const assignment = progress.assignments.find(
      (a) => a.assignmentId === assignmentId
    );
    if (!assignment) return null;

    return {
      isSubmitted: assignment.isSubmitted,
      submittedAt: assignment.submittedAt?.seconds,
      submissionUrl: assignment.submissionUrl,
      isVerified: assignment.isVerified,
      verifiedAt: assignment.verifiedAt?.seconds,
      feedback: assignment.feedback,
    };
  } catch (error) {
    console.error("Error getting assignment status:", error);
    return null;
  }
}

/**
 * Check if assignment is submitted
 */
export async function checkAssignmentSubmitted(
  userId: string,
  courseId: number,
  assignmentId: string
): Promise<boolean> {
  try {
    return await isAssignmentSubmitted(userId, courseId, assignmentId);
  } catch (error) {
    console.error("Error checking assignment submission:", error);
    return false;
  }
}
