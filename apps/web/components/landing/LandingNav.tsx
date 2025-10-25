"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export function LandingNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="font-bold text-xl">Stake to Learn</span>
          </Link>
          
          <div className="flex items-center gap-6">
            <Link href="/courses" className="text-sm font-medium hover:text-purple-600 transition-colors">
              Courses
            </Link>
            <Link href="/dashboard" className="text-sm font-medium hover:text-purple-600 transition-colors">
              Dashboard
            </Link>
            <Link href="/profile" className="text-sm font-medium hover:text-purple-600 transition-colors">
              Profile
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
