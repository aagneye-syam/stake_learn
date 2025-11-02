import { db } from "./firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Course } from "../types/course";

export async function fetchCourses(): Promise<Course[]> {
  try {
    if (!db) {
      console.warn("Firebase not initialized");
      return [];
    }

    const coursesRef = collection(db, "courses");
    const q = query(coursesRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    const courses: Course[] = [];
    querySnapshot.forEach((doc) => {
      courses.push({
        id: doc.id,
        ...doc.data(),
      } as Course);
    });

    return courses;
  } catch (error) {
    console.error("Error fetching courses:", error);
    return [];
  }
}

export async function getCourseById(courseId: string): Promise<Course | null> {
  try {
    if (!db) {
      console.warn("Firebase not initialized");
      return null;
    }

    const coursesRef = collection(db, "courses");
    const querySnapshot = await getDocs(coursesRef);
    
    let course: Course | null = null;
    querySnapshot.forEach((doc) => {
      if (doc.id === courseId) {
        course = {
          id: doc.id,
          ...doc.data(),
        } as Course;
      }
    });

    return course;
  } catch (error) {
    console.error("Error fetching course:", error);
    return null;
  }
}
