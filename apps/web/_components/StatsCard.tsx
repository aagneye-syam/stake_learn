"use client";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  gradientFrom: string;
  gradientTo: string;
}

export default function StatsCard({
  title,
  value,
  icon,
  trend,
  gradientFrom,
  gradientTo,
}: StatsCardProps) {
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl"
           style={{
             background: `linear-gradient(to bottom right, ${gradientFrom}, ${gradientTo})`
           }}></div>
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br shadow-lg"
               style={{
                 background: `linear-gradient(to bottom right, ${gradientFrom}, ${gradientTo})`
               }}>
            {icon}
          </div>
          {trend && (
            <div
              className={`flex items-center gap-1 text-sm font-medium ${
                trend.isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              <svg
                className={`w-4 h-4 ${trend.isPositive ? "" : "rotate-180"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
              {trend.value}
            </div>
          )}
        </div>
        <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
          {title}
        </h3>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  );
}
