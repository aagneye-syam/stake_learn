"use client";

import { useRouter } from "next/navigation";

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  category: string;
  requiredStake: string;
  status: "Not Started" | "In Progress" | "Completed";
  icon: string;
}

const levelColors = {
  Beginner: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Intermediate: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  Advanced: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const levelLabels = {
  Beginner: "Beginner",
  Intermediate: "Intermediate",
  Advanced: "Advanced",
};

const iconGradients = [
  "from-purple-400 to-pink-600",
  "from-blue-400 to-cyan-600",
  "from-orange-400 to-pink-600",
  "from-green-400 to-teal-600",
  "from-red-400 to-orange-600",
  "from-indigo-400 to-purple-600",
];

export default function CourseCard({
  id,
  title,
  description,
  level,
  duration,
  category,
  requiredStake,
  status,
  icon,
}: CourseCardProps) {
  const router = useRouter();
  
  // Get a consistent gradient based on the course id
  const gradientIndex = parseInt(id, 36) % iconGradients.length;
  const gradient = iconGradients[gradientIndex];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="p-6">
        {/* Icon */}
        <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4`}>
          <span className="text-3xl">{icon}</span>
        </div>

        {/* Header with Level Badge */}
        <div className="flex items-start justify-between mb-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${levelColors[level]}`}>
            {levelLabels[level]}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {description}
        </p>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-sm mb-4">
          <span className="text-gray-500 dark:text-gray-400">{duration}</span>
          <span className="text-gray-500 dark:text-gray-400">{category}</span>
        </div>

        {/* Required Stake */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Required Stake</span>
            <span className="font-semibold text-gray-900 dark:text-white">{requiredStake}</span>
          </div>
        </div>

        {/* Status */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">📚</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {status}
            </span>
          </div>
        </div>

        {/* Start Learning Button */}
        <button
          onClick={() => router.push(`/courses/${id}`)}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200"
        >
          Start Learning
        </button>
      </div>
    </div>
  );
}
