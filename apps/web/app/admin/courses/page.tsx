"use client";

import { useEffect, useState } from "react";
import { getCourseData } from "@/services/staking-transaction.service";

interface CourseStats {
  courseId: number;
  courseName: string;
  totalModules: number;
  totalStakes: number;
  activeStakes: number;
  completedStakes: number;
  totalRevenue: number;
  averageProgress: number;
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<CourseStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCoursesData = async () => {
      try {
        // Generate placeholder data for all courses
        const courseIds = [1, 2, 3, 4, 5, 6];
        const coursesData: CourseStats[] = courseIds.map(id => {
          const courseInfo = getCourseData(id);
          if (!courseInfo) return null;

          // Placeholder stats (in a real app, you'd query Firestore)
          return {
            courseId: id,
            courseName: courseInfo.title,
            totalModules: courseInfo.modules,
            totalStakes: Math.floor(Math.random() * 20) + 5,
            activeStakes: Math.floor(Math.random() * 15) + 2,
            completedStakes: Math.floor(Math.random() * 10) + 1,
            totalRevenue: parseFloat((Math.random() * 0.01).toFixed(6)),
            averageProgress: Math.floor(Math.random() * 100) + 1
          };
        }).filter(Boolean) as CourseStats[];

        setCourses(coursesData);
      } catch (error) {
        console.error("Error loading courses data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCoursesData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Courses Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor course performance, stakes, and completion rates
        </p>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {courses.map((course) => (
          <div
            key={course.courseId}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            {/* Course Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {course.courseName}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Course ID: {course.courseId} • {course.totalModules} modules
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs font-medium">
                  Active
                </span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Stakes</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {course.totalStakes}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Active</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {course.activeStakes}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Completed</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {course.completedStakes}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Revenue</p>
                <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                  {course.totalRevenue} ETH
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Average Progress
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {course.averageProgress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${course.averageProgress}%` }}
                ></div>
              </div>
            </div>

            {/* Completion Rate */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Completion Rate
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {course.totalStakes > 0 
                  ? Math.round((course.completedStakes / course.totalStakes) * 100)
                  : 0
                }%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Platform Summary
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {courses.length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Courses</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {courses.reduce((sum, course) => sum + course.totalStakes, 0)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Stakes</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {courses.reduce((sum, course) => sum + course.completedStakes, 0)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {courses.reduce((sum, course) => sum + course.totalRevenue, 0).toFixed(6)} ETH
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
          </div>
        </div>
      </div>
    </div>
  );
}