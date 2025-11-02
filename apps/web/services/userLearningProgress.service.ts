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
