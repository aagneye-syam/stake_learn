import { Timestamp } from "firebase/firestore";

export interface ModuleProgress {
  moduleId: number;
  isCompleted: boolean;
  isUnlocked: boolean;
  completedAt?: Timestamp;
  startedAt?: Timestamp;
}

export interface AssignmentSubmission {
  assignmentId: string;
  submittedAt?: Timestamp;
  isSubmitted: boolean;
  isVerified: boolean;
  verifiedAt?: Timestamp;
  verifiedBy?: string; // admin user ID
  submissionUrl?: string; // GitHub repo URL or other submission link
  feedback?: string; // Admin feedback
}

export interface UserLearningProgress {
  userId: string; // wallet address
  courseId: number;
  stakeAmount: string; // in ETH
  stakedAt: Timestamp;
  isStaked: boolean;
  
  // Module tracking
  modules: ModuleProgress[];
  completedModulesCount: number;
  currentModuleId: number; // The module user is currently on
  
  // Assignment tracking
  assignments: AssignmentSubmission[];
  completedAssignmentsCount: number;
  verifiedAssignmentsCount: number;
  
  // Course completion
  isCourseCompleted: boolean;
  completedAt?: Timestamp;
  certificateMinted?: boolean;
  certificateTokenId?: string;
  
  // Stake return
  isStakeReturned: boolean;
  stakeReturnedAt?: Timestamp;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastActivityAt: Timestamp;
}

export interface CreateUserProgressInput {
  userId: string;
  courseId: number;
  stakeAmount: string;
  totalModules: number;
  assignmentIds?: string[];
}
