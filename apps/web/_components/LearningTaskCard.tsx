"use client";

import { useRouter } from "next/navigation";

interface LearningTask {
  id: string;
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  category: string;
  icon: React.ReactNode;
  gradient: string;
  progress?: number;
}

interface LearningTaskCardProps {
  task: LearningTask;
  onStart?: () => void;
}

export default function LearningTaskCard({ task, onStart }: LearningTaskCardProps) {
  const router = useRouter();

  const handleStartLearning = () => {
    if (onStart) {
      onStart();
    }
    // Navigate to course detail page
    router.push(`/courses/${task.id}`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "Intermediate":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "Advanced":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="group relative">
      {/* Gradient glow effect on hover */}
      <div
        className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-300"
        style={{ background: task.gradient }}
      ></div>
      
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 hover:border-transparent transition-all duration-300 h-full flex flex-col">
        {/* Header with icon and category */}
        <div className="flex items-start justify-between mb-4">
          <div
            className="p-3 rounded-xl shadow-lg"
            style={{ background: task.gradient }}
          >
            {task.icon}
          </div>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {task.category}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {task.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex-grow">
          {task.description}
        </p>

        {/* Meta information */}
        <div className="flex items-center gap-4 mb-4">
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${getDifficultyColor(
              task.difficulty
            )}`}
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {task.difficulty}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {task.duration}
          </span>
        </div>

        {/* Progress bar (if progress exists) */}
        {task.progress !== undefined && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Progress</span>
              <span className="text-xs font-bold text-gray-900 dark:text-white">{task.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${task.progress}%`,
                  background: task.gradient,
                }}
              ></div>
            </div>
          </div>
        )}

        {/* Action button */}
        <button
          onClick={handleStartLearning}
          className="w-full py-2.5 px-4 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-xl"
          style={{ background: task.gradient }}
        >
          {task.progress !== undefined && task.progress > 0 ? "Continue Learning" : "Start Learning"}
        </button>
      </div>
    </div>
  );
}
