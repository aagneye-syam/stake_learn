"use client";

import { AnimatedHero } from "@/components/ui/animated-hero";
import { ThemeToggle } from "@/components/theme-toggle";

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-background">
      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Animated Hero Section */}
      <AnimatedHero />
    </main>
  );
}
