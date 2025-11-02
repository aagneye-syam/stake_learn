import { Timestamp } from "firebase/firestore";

export interface ModuleProgress {
  moduleId: number;
  completed: boolean;
  completedAt?: Timestamp;
  isLocked: boolean;
}

export interface AssignmentSubmission {
  assignmentId: string;
  submittedAt: Timestamp;
  submissionData?: any; // Could be repo URL, file URL, etc.
  isVerified: boolean;
  verifiedAt?: Timestamp;
  verifiedBy?: string; // Admin user ID
  feedback?: string;
}

export interface UserLearningProgress {
  id?: string; // Document ID (userId_courseId)
  userId: string; // Wallet address
  courseId: number;
  stakeAmount: string; // Amount in ETH
  stakedAt: Timestamp;
  enrolledAt: Timestamp;
  modules: ModuleProgress[];
  assignments: AssignmentSubmission[];
  courseCompleted: boolean;
  completedAt?: Timestamp;
  lastActivityAt: Timestamp;
  totalModules: number;
  completedModules: number;
  totalAssignments: number;
  verifiedAssignments: number;
}

export interface CreateUserProgressInput {
  userId: string;
  courseId: number;
  stakeAmount: string;
  totalModules: number;
  totalAssignments: number;
}

export interface UpdateModuleProgressInput {
  userId: string;
  courseId: number;
  moduleId: number;
  completed: boolean;
}

export interface SubmitAssignmentInput {
  userId: string;
  courseId: number;
  assignmentId: string;
  submissionData: any;
}

export interface VerifyAssignmentInput {
  userId: string;
  courseId: number;
  assignmentId: string;
  verifiedBy: string;
  feedback?: string;
}
