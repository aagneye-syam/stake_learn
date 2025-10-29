"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isAdminAuthenticated, adminLogout } from "@/services/admin-auth.service";
import type { AdminUser } from "@/services/admin-auth.service";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = () => {
      const user = isAdminAuthenticated();
      setAdminUser(user);
      setIsLoading(false);
      
      // If not authenticated and not on login page, redirect to login
      if (!user && pathname !== "/admin") {
        router.push("/admin");
      }
      
      // If authenticated and on login page, redirect to dashboard
      if (user && pathname === "/admin") {
        router.push("/admin/dashboard");
      }
    };

    checkAuth();
  }, [pathname, router]);

  const handleLogout = () => {
    adminLogout();
    setAdminUser(null);
    router.push("/admin");
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // If not authenticated and on login page, show children (login form)
  if (!adminUser && pathname === "/admin") {
    return <>{children}</>;
  }

  // If not authenticated and not on login page, will redirect (handled in useEffect)
  if (!adminUser) {
    return null;
  }

  // If authenticated, show admin layout
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Admin Navbar */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                {adminUser.email}
              </span>
            </div>
            
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar will be added in next commit */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}