import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  Timestamp,
  deleteDoc,
} from "firebase/firestore";
import {
  UserLearningProgress,
  CreateUserProgressInput,
  ModuleProgress,
  AssignmentSubmission,
} from "@/types/userLearningProgress";

const COLLECTION_NAME = "usersLearningProgress";

// Generate document ID from userId and courseId
function getProgressDocId(userId: string, courseId: number): string {
  return `${userId.toLowerCase()}_${courseId}`;
}

/**
 * Create initial user learning progress when they stake
 */
export async function createUserProgress(
  input: CreateUserProgressInput
): Promise<UserLearningProgress> {
  if (!db) {
    throw new Error("Firebase not initialized");
  }

  const docId = getProgressDocId(input.userId, input.courseId);
  const now = Timestamp.now();

  // Initialize modules - only first module is unlocked
  const modules: ModuleProgress[] = [];
  for (let i = 1; i <= input.totalModules; i++) {
    modules.push({
      moduleId: i,
      isCompleted: false,
      isUnlocked: i === 1, // Only first module unlocked
      startedAt: i === 1 ? now : undefined,
    });
  }

  // Initialize assignments if provided
  const assignments: AssignmentSubmission[] = (input.assignmentIds || []).map(
    (assignmentId) => ({
      assignmentId,
      isSubmitted: false,
      isVerified: false,
    })
  );

  const progressData: UserLearningProgress = {
    userId: input.userId.toLowerCase(),
    courseId: input.courseId,
    stakeAmount: input.stakeAmount,
    stakedAt: now,
    isStaked: true,

    modules,
    completedModulesCount: 0,
    currentModuleId: 1,

    assignments,
    completedAssignmentsCount: 0,
    verifiedAssignmentsCount: 0,

    isCourseCompleted: false,
    certificateMinted: false,

    isStakeReturned: false,

    createdAt: now,
    updatedAt: now,
    lastActivityAt: now,
  };

  const docRef = doc(db, COLLECTION_NAME, docId);
  await setDoc(docRef, progressData);

  return progressData;
}

/**
 * Get user learning progress for a specific course
 */
export async function getUserProgress(
  userId: string,
  courseId: number
): Promise<UserLearningProgress | null> {
  if (!db) {
    console.warn("Firebase not initialized");
    return null;
  }

  const docId = getProgressDocId(userId, courseId);
  const docRef = doc(db, COLLECTION_NAME, docId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return docSnap.data() as UserLearningProgress;
}

/**
 * Get all courses a user has staked/enrolled in
 */
export async function getUserCourses(
  userId: string
): Promise<UserLearningProgress[]> {
  if (!db) {
    console.warn("Firebase not initialized");
    return [];
  }

  const q = query(
    collection(db, COLLECTION_NAME),
    where("userId", "==", userId.toLowerCase())
  );
  const querySnapshot = await getDocs(q);

  const courses: UserLearningProgress[] = [];
  querySnapshot.forEach((doc) => {
    courses.push(doc.data() as UserLearningProgress);
  });

  return courses;
}

/**
 * Check if user has staked a course
 */
export async function hasUserStakedCourse(
  userId: string,
  courseId: number
): Promise<boolean> {
  const progress = await getUserProgress(userId, courseId);
  return progress !== null && progress.isStaked;
}

/**
 * Update last activity timestamp
 */
async function updateLastActivity(
  userId: string,
  courseId: number
): Promise<void> {
  if (!db) return;

  const docId = getProgressDocId(userId, courseId);
  const docRef = doc(db, COLLECTION_NAME, docId);

  await updateDoc(docRef, {
    lastActivityAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
}

/**
 * Complete a module (sequential unlocking)
 */
export async function completeModule(
  userId: string,
  courseId: number,
  moduleId: number
): Promise<UserLearningProgress | null> {
  if (!db) {
    throw new Error("Firebase not initialized");
  }

  const progress = await getUserProgress(userId, courseId);
  if (!progress) {
    throw new Error("User progress not found");
  }

  // Check if module exists and is unlocked
  const moduleIndex = progress.modules.findIndex((m) => m.moduleId === moduleId);
  if (moduleIndex === -1) {
    throw new Error("Module not found");
  }

  if (!progress.modules[moduleIndex].isUnlocked) {
    throw new Error("Module is not unlocked yet");
  }

  if (progress.modules[moduleIndex].isCompleted) {
    throw new Error("Module already completed");
  }

  const now = Timestamp.now();
  const updatedModules = [...progress.modules];

  // Mark current module as completed
  updatedModules[moduleIndex] = {
    ...updatedModules[moduleIndex],
    isCompleted: true,
    completedAt: now,
  };

  // Unlock next module if it exists
  if (moduleIndex + 1 < updatedModules.length) {
    updatedModules[moduleIndex + 1] = {
      ...updatedModules[moduleIndex + 1],
      isUnlocked: true,
      startedAt: now,
    };
  }

  const completedCount = updatedModules.filter((m) => m.isCompleted).length;
  const nextModuleId =
    moduleIndex + 1 < updatedModules.length
      ? updatedModules[moduleIndex + 1].moduleId
      : moduleId;

  const docId = getProgressDocId(userId, courseId);
  const docRef = doc(db, COLLECTION_NAME, docId);

  await updateDoc(docRef, {
    modules: updatedModules,
    completedModulesCount: completedCount,
    currentModuleId: nextModuleId,
    updatedAt: now,
    lastActivityAt: now,
  });

  return await getUserProgress(userId, courseId);
}

/**
 * Check if a module is unlocked for the user
 */
export async function isModuleUnlocked(
  userId: string,
  courseId: number,
  moduleId: number
): Promise<boolean> {
  const progress = await getUserProgress(userId, courseId);
  if (!progress) return false;

  const module = progress.modules.find((m) => m.moduleId === moduleId);
  return module?.isUnlocked || false;
}

/**
 * Submit an assignment
 */
export async function submitAssignment(
  userId: string,
  courseId: number,
  assignmentId: string,
  submissionUrl: string
): Promise<UserLearningProgress | null> {
  if (!db) {
    throw new Error("Firebase not initialized");
  }

  const progress = await getUserProgress(userId, courseId);
  if (!progress) {
    throw new Error("User progress not found");
  }

  const assignmentIndex = progress.assignments.findIndex(
    (a) => a.assignmentId === assignmentId
  );
  if (assignmentIndex === -1) {
    throw new Error("Assignment not found");
  }

  const now = Timestamp.now();
  const updatedAssignments = [...progress.assignments];

  updatedAssignments[assignmentIndex] = {
    ...updatedAssignments[assignmentIndex],
    isSubmitted: true,
    submittedAt: now,
    submissionUrl,
  };

  const submittedCount = updatedAssignments.filter((a) => a.isSubmitted).length;

  const docId = getProgressDocId(userId, courseId);
  const docRef = doc(db, COLLECTION_NAME, docId);

  await updateDoc(docRef, {
    assignments: updatedAssignments,
    completedAssignmentsCount: submittedCount,
    updatedAt: now,
    lastActivityAt: now,
  });

  return await getUserProgress(userId, courseId);
}

/**
 * Check if assignment is submitted
 */
export async function isAssignmentSubmitted(
  userId: string,
  courseId: number,
  assignmentId: string
): Promise<boolean> {
  const progress = await getUserProgress(userId, courseId);
  if (!progress) return false;

  const assignment = progress.assignments.find(
    (a) => a.assignmentId === assignmentId
  );
  return assignment?.isSubmitted || false;
}

/**
 * Admin: Verify an assignment submission
 */
export async function verifyAssignment(
  userId: string,
  courseId: number,
  assignmentId: string,
  adminUserId: string,
  feedback?: string
): Promise<UserLearningProgress | null> {
  if (!db) {
    throw new Error("Firebase not initialized");
  }

  const progress = await getUserProgress(userId, courseId);
  if (!progress) {
    throw new Error("User progress not found");
  }

  const assignmentIndex = progress.assignments.findIndex(
    (a) => a.assignmentId === assignmentId
  );
  if (assignmentIndex === -1) {
    throw new Error("Assignment not found");
  }

  if (!progress.assignments[assignmentIndex].isSubmitted) {
    throw new Error("Assignment not submitted yet");
  }

  const now = Timestamp.now();
  const updatedAssignments = [...progress.assignments];

  updatedAssignments[assignmentIndex] = {
    ...updatedAssignments[assignmentIndex],
    isVerified: true,
    verifiedAt: now,
    verifiedBy: adminUserId,
    feedback: feedback || "",
  };

  const verifiedCount = updatedAssignments.filter((a) => a.isVerified).length;

  const docId = getProgressDocId(userId, courseId);
  const docRef = doc(db, COLLECTION_NAME, docId);

  await updateDoc(docRef, {
    assignments: updatedAssignments,
    verifiedAssignmentsCount: verifiedCount,
    updatedAt: now,
  });

  return await getUserProgress(userId, courseId);
}

/**
 * Mark course as completed
 */
export async function completeCourse(
  userId: string,
  courseId: number
): Promise<UserLearningProgress | null> {
  if (!db) {
    throw new Error("Firebase not initialized");
  }

  const progress = await getUserProgress(userId, courseId);
  if (!progress) {
    throw new Error("User progress not found");
  }

  // Check if all modules are completed
  const allModulesCompleted = progress.modules.every((m) => m.isCompleted);
  if (!allModulesCompleted) {
    throw new Error("Not all modules are completed");
  }

  const now = Timestamp.now();
  const docId = getProgressDocId(userId, courseId);
  const docRef = doc(db, COLLECTION_NAME, docId);

  await updateDoc(docRef, {
    isCourseCompleted: true,
    completedAt: now,
    updatedAt: now,
    lastActivityAt: now,
  });

  return await getUserProgress(userId, courseId);
}

/**
 * Mark certificate as minted
 */
export async function markCertificateMinted(
  userId: string,
  courseId: number,
  tokenId: string
): Promise<UserLearningProgress | null> {
  if (!db) {
    throw new Error("Firebase not initialized");
  }

  const docId = getProgressDocId(userId, courseId);
  const docRef = doc(db, COLLECTION_NAME, docId);

  await updateDoc(docRef, {
    certificateMinted: true,
    certificateTokenId: tokenId,
    updatedAt: Timestamp.now(),
  });

  return await getUserProgress(userId, courseId);
}

/**
 * Mark stake as returned
 */
export async function markStakeReturned(
  userId: string,
  courseId: number
): Promise<UserLearningProgress | null> {
  if (!db) {
    throw new Error("Firebase not initialized");
  }

  const now = Timestamp.now();
  const docId = getProgressDocId(userId, courseId);
  const docRef = doc(db, COLLECTION_NAME, docId);

  await updateDoc(docRef, {
    isStakeReturned: true,
    stakeReturnedAt: now,
    updatedAt: now,
  });

  return await getUserProgress(userId, courseId);
}

/**
 * Get course completion percentage
 */
export async function getCourseCompletionPercentage(
  userId: string,
  courseId: number
): Promise<number> {
  const progress = await getUserProgress(userId, courseId);
  if (!progress) return 0;

  const totalModules = progress.modules.length;
  if (totalModules === 0) return 0;

  return Math.round((progress.completedModulesCount / totalModules) * 100);
}

/**
 * Admin: Reject an assignment submission
 */
export async function rejectAssignment(
  userId: string,
  courseId: number,
  assignmentId: string,
  adminUserId: string,
  feedback: string
): Promise<UserLearningProgress | null> {
  if (!db) {
    throw new Error("Firebase not initialized");
  }

  const progress = await getUserProgress(userId, courseId);
  if (!progress) {
    throw new Error("User progress not found");
  }

  const assignmentIndex = progress.assignments.findIndex(
    (a) => a.assignmentId === assignmentId
  );
  if (assignmentIndex === -1) {
    throw new Error("Assignment not found");
  }

  const now = Timestamp.now();
  const updatedAssignments = [...progress.assignments];

  // Reset submission so user can resubmit
  updatedAssignments[assignmentIndex] = {
    ...updatedAssignments[assignmentIndex],
    isSubmitted: false,
    isVerified: false,
    submittedAt: undefined,
    verifiedAt: undefined,
    verifiedBy: adminUserId,
    feedback,
  };

  const docId = getProgressDocId(userId, courseId);
  const docRef = doc(db, COLLECTION_NAME, docId);

  await updateDoc(docRef, {
    assignments: updatedAssignments,
    updatedAt: now,
  });

  return await getUserProgress(userId, courseId);
}

/**
 * Get assignment submission details
 */
export async function getAssignmentSubmission(
  userId: string,
  courseId: number,
  assignmentId: string
): Promise<AssignmentSubmission | null> {
  const progress = await getUserProgress(userId, courseId);
  if (!progress) return null;

  return (
    progress.assignments.find((a) => a.assignmentId === assignmentId) || null
  );
}

/**
 * Get module progress details
 */
export async function getModuleProgress(
  userId: string,
  courseId: number,
  moduleId: number
): Promise<ModuleProgress | null> {
  const progress = await getUserProgress(userId, courseId);
  if (!progress) return null;

  return progress.modules.find((m) => m.moduleId === moduleId) || null;
}

/**
 * Delete user progress (for testing/admin purposes)
 */
export async function deleteUserProgress(
  userId: string,
  courseId: number
): Promise<void> {
  if (!db) return;

  const docId = getProgressDocId(userId, courseId);
  const docRef = doc(db, COLLECTION_NAME, docId);
  await deleteDoc(docRef);
}

export { getProgressDocId };
