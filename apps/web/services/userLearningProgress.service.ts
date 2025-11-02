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
