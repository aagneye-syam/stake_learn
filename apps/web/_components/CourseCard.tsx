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
  Beginner: "bg-green-50 text-green-600 border border-green-200",
  Intermediate: "bg-yellow-50 text-yellow-600 border border-yellow-200",
  Advanced: "bg-red-50 text-red-600 border border-red-200",
};

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

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">
      <div className="p-6">
        {/* Icon and Meta Info Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
            <span className="text-2xl">{icon}</span>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 mb-1">{duration}</div>
            <div className="text-sm text-gray-400">{category}</div>
          </div>
        </div>

        {/* Level Badge */}
        <div className="mb-4">
          <span className={`inline-block px-3 py-1 rounded-md text-xs font-semibold ${levelColors[level]}`}>
            {level}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold mb-3 text-gray-900">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-6 line-clamp-2 leading-relaxed">
          {description}
        </p>

        {/* Required Stake */}
        <div className="mb-4 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Required Stake</span>
            <span className="font-semibold text-gray-900">{requiredStake}</span>
          </div>
        </div>

        {/* Status */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-base">📚</span>
            <span className="text-sm font-medium text-gray-700">
              {status}
            </span>
          </div>
        </div>

        {/* Start Learning Button */}
        <button
          onClick={() => router.push(`/courses/${id}`)}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-sm"
        >
          Start Learning
        </button>
      </div>
    </div>
  );
}
