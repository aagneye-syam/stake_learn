"use client";

import { useRouter } from "next/navigation";

export function CompactProgressRewards() {
  const router = useRouter();

  const rewards = [
    { action: "Daily Login", reward: "+5", color: "text-blue-600" },
    { action: "Course Progress", reward: "+3", color: "text-blue-600" },
    { action: "Course Milestone", reward: "+8", color: "text-blue-600" },
    { action: "7-Day Streak", reward: "+15", color: "text-orange-600" },
    { action: "30-Day Streak", reward: "+50", color: "text-green-600" },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-black">🎯 Progress Rewards</h3>
        <button 
          onClick={() => router.push('/courses')}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all text-sm font-medium"
        >
          Start Learning
        </button>
      </div>
      
      <div className="space-y-2">
        {rewards.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-sm py-1">
            <span className="text-gray-600">{item.action}</span>
            <span className={`font-medium ${item.color}`}>{item.reward}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          Complete courses and maintain streaks to earn DataCoins
        </p>
      </div>
    </div>
  );
}
