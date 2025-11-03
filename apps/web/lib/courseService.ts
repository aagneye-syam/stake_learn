import { db } from "./firebase";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { Course } from "../types/course";
import { listCourses, CourseData } from "@/services/course.service";

export async function fetchCourses(): Promise<Course[]> {
  try {
    if (!db) {
      console.warn("Firebase not initialized");
      return [];
    }

    // Fetch from the courses collection using the service
    const coursesData = await listCourses(true); // Only active courses

    // Transform CourseData to Course type for the UI
    const courses: Course[] = coursesData.map((courseData: CourseData) => ({
      id: courseData.id.toString(),
      title: courseData.title,
      description: courseData.description,
      level: "Beginner" as const, // Default, should be added to CourseData
      duration: "4-6 weeks", // Default, should be added to CourseData
      category: "Course", // Default, should be added to CourseData
      requiredStake: `${courseData.stakeAmount} ETH`,
      status: "Not Started" as const,
      icon: "📚", // Default, should be added to CourseData
    }));

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
