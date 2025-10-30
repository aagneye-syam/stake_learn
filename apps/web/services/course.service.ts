import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, query, setDoc, Timestamp, updateDoc, where, deleteDoc, orderBy } from 'firebase/firestore';

export interface CourseModule {
  id: number;
  title: string;
  description?: string;
  lessons?: number;
  duration?: string;
  resources?: CourseModuleResource[];
}

export type CourseModuleResourceType = 'text' | 'video';

export interface CourseModuleResource {
  id: string; // uuid
  type: CourseModuleResourceType;
  title: string;
  content?: string; // for text
  url?: string; // for video
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
  published?: boolean;
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
  const existing = await getCourseById(input.id);
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
    published: existing?.published ?? false,
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

export async function setCoursePublished(id: number, published: boolean): Promise<void> {
  const ref = doc(db, 'courses', courseDocId(id));
  await updateDoc(ref, { published, updatedAt: Timestamp.now() });
}

export async function updateCourseFlags(
  id: number,
  flags: Partial<Pick<CourseData, 'active' | 'published'>>
): Promise<void> {
  const ref = doc(db, 'courses', courseDocId(id));
  await updateDoc(ref, { ...flags, updatedAt: Timestamp.now() });
}

export async function addModuleResource(
  courseId: number,
  moduleId: number,
  resource: CourseModuleResource
): Promise<void> {
  const ref = doc(db, 'courses', courseDocId(courseId));
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const course = snap.data() as CourseData;
  const modules = (course.modules || []).map((m) => {
    if (m.id === moduleId) {
      const nextResources = [ ...(m.resources || []), resource ];
      return { ...m, resources: nextResources };
    }
    return m;
  });
  await updateDoc(ref, { modules, updatedAt: Timestamp.now() });
}

export async function deleteModuleResource(
  courseId: number,
  moduleId: number,
  resourceId: string
): Promise<void> {
  const ref = doc(db, 'courses', courseDocId(courseId));
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const course = snap.data() as CourseData;
  const modules = (course.modules || []).map((m) => {
    if (m.id === moduleId) {
      const nextResources = (m.resources || []).filter((r) => r.id !== resourceId);
      return { ...m, resources: nextResources };
    }
    return m;
  });
  await updateDoc(ref, { modules, updatedAt: Timestamp.now() });
}


