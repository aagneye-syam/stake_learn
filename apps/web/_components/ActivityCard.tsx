"use client";

interface ActivityItem {
  id: string;
  type: "mint" | "verify" | "reputation";
  description: string;
  timestamp: string;
  status: "success" | "pending" | "failed";
  hash?: string;
  amount?: string;
  courseId?: string;
}

interface ActivityCardProps {
  activities: ActivityItem[];
  onViewAll?: () => void;
}

export default function ActivityCard({ activities, onViewAll }: ActivityCardProps) {
  // Filter and prioritize activities - show only the most important ones
  const getFilteredActivities = (activities: ActivityItem[]) => {
    // Group similar activities and show only unique/important ones
    const filtered = activities.filter((activity, index, arr) => {
      // Remove duplicate "Earned X DataCoins" entries within the same time period
      if (activity.description.includes('Earned') && activity.description.includes('DataCoins')) {
        const isDuplicate = arr.slice(0, index).some(prev => 
          prev.description.includes('Earned') && 
          prev.description.includes('DataCoins') &&
          prev.timestamp === activity.timestamp // Same timestamp
        );
        return !isDuplicate;
      }
      return true;
    });

    // Prioritize different types of activities
    const prioritized = filtered.sort((a, b) => {
      const priority = { 'mint': 3, 'verify': 2, 'reputation': 1 };
      return (priority[b.type] || 0) - (priority[a.type] || 0);
    });

    // Show only top 5 most important activities
    return prioritized.slice(0, 5);
  };

  const getStatusColor = (status: ActivityItem["status"]) => {
    switch (status) {
      case "success":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "failed":
        return "bg-red-500";
    }
  };

  const getTypeIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "mint":
        return (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case "verify":
        return (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case "reputation":
        return (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
        );
    }
  };

  const getActivitySummary = (activity: ActivityItem) => {
    // Create more concise, user-friendly descriptions
    if (activity.description.includes('Earned') && activity.description.includes('DataCoins')) {
      const amount = activity.amount || '0';
      return `Earned ${amount} DataCoins`;
    }
    if (activity.description.includes('Completed course')) {
      return `Completed Course ${activity.courseId}`;
    }
    if (activity.description.includes('refund')) {
      return `Refund received`;
    }
    return activity.description;
  };

  const filteredActivities = getFilteredActivities(activities);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-black">
          Recent Activity
        </h3>
        <button 
          onClick={onViewAll}
          className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
        >
          View All
        </button>
      </div>

      <div className="space-y-3">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">No recent activity</p>
            <p className="text-xs text-gray-400 mt-1">Complete courses to see activity</p>
          </div>
        ) : (
          filteredActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
            >
              <div className="flex-shrink-0">
                {getTypeIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-purple-700 transition-colors">
                  {getActivitySummary(activity)}
                </p>
                <p className="text-xs text-gray-500">
                  {activity.timestamp}
                </p>
              </div>
              <div className="flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${getStatusColor(
                      activity.status
                    )}`}
                  ></span>
                  <span className="text-xs text-gray-400 capitalize">
                    {activity.status}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {filteredActivities.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Showing {filteredActivities.length} of {activities.length} activities</span>
            <span className="text-purple-600 font-medium">Last updated just now</span>
          </div>
        </div>
      )}
    </div>
  );
}
