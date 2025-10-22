"use client";

export default function CoursesPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
          Courses
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Explore our learning paths and courses
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Course cards will be added here */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-pink-600 flex items-center justify-center mb-4">
              <span className="text-2xl">📚</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">HTML & CSS Basics</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Learn the fundamentals of web development
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-purple-600 font-medium">Beginner</span>
              <span className="text-xs text-gray-500">4 weeks</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
