"use client";

import { useEffect, useState } from "react";
import { fetchCourses } from "../../../lib/courseService";
import { Course } from "../../../types/course";
import CourseCard from "../../../_components/CourseCard";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        const fetchedCourses = await fetchCourses();
        setCourses(fetchedCourses);
      } catch (error) {
        console.error("Error loading courses:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              🎓 Learning Paths
            </h1>
            <button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200">
              View All Courses
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Master new skills and earn reputation while learning
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse"
              >
                <div className="w-16 h-16 rounded-xl bg-gray-300 dark:bg-gray-700 mb-4"></div>
                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        )}

        {/* Courses Grid */}
        {!loading && courses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                description={course.description}
                level={course.level}
                duration={course.duration}
                category={course.category}
                requiredStake={course.requiredStake}
                status={course.status || "Not Started"}
                icon={course.icon}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && courses.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              No Courses Available
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Courses will appear here once they are added to the database.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
