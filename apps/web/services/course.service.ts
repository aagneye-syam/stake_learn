import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, query, setDoc, Timestamp, updateDoc, where, deleteDoc, orderBy } from 'firebase/firestore';

export interface CourseModule {
  id: number;
  title: string;
  description?: string;
  lessons?: number;
  duration?: string;
}

export interface CourseData {
  id: number;
  title: string;
  description: string;
  stakeAmount: string; // in ETH string
  totalModules: number;
  modules: CourseModule[];
  allowRepoSubmission: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  active?: boolean;
}

function courseDocId(id: number): string {
  return id.toString();
}

export async function getCourseById(id: number): Promise<CourseData | null> {
  const ref = doc(db, 'courses', courseDocId(id));
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as CourseData) : null;
}

export async function listCourses(onlyActive: boolean = true): Promise<CourseData[]> {
  const col = collection(db, 'courses');
  const q = onlyActive ? query(col, where('active', '==', true), orderBy('id', 'asc')) : query(col, orderBy('id', 'asc')) as any;
  const snap = await getDocs(q);
  const out: CourseData[] = [];
  snap.forEach(d => out.push(d.data() as CourseData));
  return out;
}

export interface UpsertCourseInput {
  id: number;
  title: string;
  description: string;
  stakeAmount: string;
  allowRepoSubmission: boolean;
  modules: CourseModule[];
  active?: boolean;
}

export async function upsertCourse(input: UpsertCourseInput): Promise<void> {
  const now = Timestamp.now();
  const data: CourseData = {
    id: input.id,
    title: input.title,
    description: input.description,
    stakeAmount: input.stakeAmount,
    totalModules: input.modules.length,
    modules: input.modules,
    allowRepoSubmission: input.allowRepoSubmission,
    createdAt: now,
    updatedAt: now,
    active: input.active ?? true,
  };
  const ref = doc(db, 'courses', courseDocId(input.id));
  await setDoc(ref, data, { merge: true });
  await updateDoc(ref, { updatedAt: Timestamp.now(), totalModules: input.modules.length });
}

export async function deleteCourse(id: number): Promise<void> {
  const ref = doc(db, 'courses', courseDocId(id));
  await deleteDoc(ref);
}

export async function toggleCourseRepoSubmission(id: number, enabled: boolean): Promise<void> {
  const ref = doc(db, 'courses', courseDocId(id));
  await updateDoc(ref, { allowRepoSubmission: enabled, updatedAt: Timestamp.now() });
}

export async function updateCourseStakeAmount(id: number, stakeAmount: string): Promise<void> {
  const ref = doc(db, 'courses', courseDocId(id));
  await updateDoc(ref, { stakeAmount, updatedAt: Timestamp.now() });
}


