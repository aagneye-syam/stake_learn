import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDoc, getDocs, query, where, updateDoc, Timestamp } from 'firebase/firestore';
import { UserLearningProgress, CreateUserProgressInput, UpdateModuleProgressInput, SubmitAssignmentInput, VerifyAssignmentInput } from '@/types/userProgress';

function progressDocId(userId: string, courseId: number) {
  return `${userId.toLowerCase()}_${courseId}`;
}

export async function createUserProgress(input: CreateUserProgressInput): Promise<UserLearningProgress | null> {
  const now = Timestamp.now();
  const docId = progressDocId(input.userId, input.courseId);
  const modules = Array.from({ length: input.totalModules }).map((_, idx) => ({
    moduleId: idx + 1,
    completed: false,
    isLocked: idx !== 0, // lock all except first
  }));

  const data: UserLearningProgress = {
    id: docId,
    userId: input.userId.toLowerCase(),
    courseId: input.courseId,
    stakeAmount: input.stakeAmount,
    stakedAt: now,
    enrolledAt: now,
    modules,
    assignments: [],
    courseCompleted: false,
    completedAt: undefined,
    lastActivityAt: now,
    totalModules: input.totalModules,
    completedModules: 0,
    totalAssignments: input.totalAssignments || 0,
    verifiedAssignments: 0,
  } as any;

  const ref = doc(db, 'usersLearningProgress', docId);
  await setDoc(ref, data, { merge: true });
  return data;
}

export async function getUserProgress(userId: string, courseId: number): Promise<UserLearningProgress | null> {
  const docId = progressDocId(userId, courseId);
  const ref = doc(db, 'usersLearningProgress', docId);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as UserLearningProgress) : null;
}

export async function findUserProgressByUser(userId: string): Promise<UserLearningProgress[]> {
  const col = collection(db, 'usersLearningProgress');
  const q = query(col, where('userId', '==', userId.toLowerCase()));
  const snap = await getDocs(q);
  const out: UserLearningProgress[] = [];
  snap.forEach(d => out.push(d.data() as UserLearningProgress));
  return out;
}

export async function updateModuleProgress(input: UpdateModuleProgressInput): Promise<UserLearningProgress | null> {
  const docId = progressDocId(input.userId, input.courseId);
  const ref = doc(db, 'usersLearningProgress', docId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;

  const data = snap.data() as UserLearningProgress;
  const modules = (data.modules || []).map(m => ({ ...m }));
  const target = modules.find(m => m.moduleId === input.moduleId);
  if (!target) return data;

  // Only allow completing the module if it's not locked (serial enforcement)
  if (target.isLocked && input.completed) {
    throw new Error('module_locked');
  }

  target.completed = input.completed;
  target.completedAt = input.completed ? Timestamp.now() : undefined;
  target.isLocked = false;

  // unlock next module when completed
  if (input.completed) {
    const next = modules.find(m => m.moduleId === input.moduleId + 1);
    if (next) next.isLocked = false;
  }

  const completedModules = modules.filter(m => m.completed).length;

  await updateDoc(ref, {
    modules,
    completedModules,
    lastActivityAt: Timestamp.now(),
  });

  const updatedSnap = await getDoc(ref);
  return updatedSnap.exists() ? (updatedSnap.data() as UserLearningProgress) : null;
}

export async function submitAssignment(input: SubmitAssignmentInput): Promise<UserLearningProgress | null> {
  const docId = progressDocId(input.userId, input.courseId);
  const ref = doc(db, 'usersLearningProgress', docId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;

  const data = snap.data() as UserLearningProgress;
  const submission = {
    assignmentId: input.assignmentId,
    submittedAt: Timestamp.now(),
    submissionData: input.submissionData,
    isVerified: false,
  } as any;

  const assignments = [...(data.assignments || []).filter(a => a.assignmentId !== input.assignmentId), submission];
  const totalAssignments = assignments.length;

  await updateDoc(ref, {
    assignments,
    totalAssignments,
    lastActivityAt: Timestamp.now(),
  });

  const updatedSnap = await getDoc(ref);
  return updatedSnap.exists() ? (updatedSnap.data() as UserLearningProgress) : null;
}

export async function verifyAssignment(input: VerifyAssignmentInput): Promise<UserLearningProgress | null> {
  const docId = progressDocId(input.userId, input.courseId);
  const ref = doc(db, 'usersLearningProgress', docId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;

  const data = snap.data() as UserLearningProgress;
  const assignments = (data.assignments || []).map(a => ({ ...a }));
  const target = assignments.find(a => a.assignmentId === input.assignmentId);
  if (!target) return data;

  target.isVerified = true;
  target.verifiedAt = Timestamp.now();
  target.verifiedBy = input.verifiedBy;
  target.feedback = input.feedback || '';

  const verifiedAssignments = assignments.filter(a => a.isVerified).length;

  await updateDoc(ref, {
    assignments,
    verifiedAssignments,
    lastActivityAt: Timestamp.now(),
  });

  const updatedSnap = await getDoc(ref);
  return updatedSnap.exists() ? (updatedSnap.data() as UserLearningProgress) : null;
}

export async function markCourseCompleted(userId: string, courseId: number): Promise<UserLearningProgress | null> {
  const docId = progressDocId(userId, courseId);
  const ref = doc(db, 'usersLearningProgress', docId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;

  await updateDoc(ref, {
    courseCompleted: true,
    completedAt: Timestamp.now(),
    lastActivityAt: Timestamp.now(),
  });

  const updatedSnap = await getDoc(ref);
  return updatedSnap.exists() ? (updatedSnap.data() as UserLearningProgress) : null;
}
