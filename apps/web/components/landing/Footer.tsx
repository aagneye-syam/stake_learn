"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full py-12 bg-muted/50 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="font-bold text-xl">Stake to Learn</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Web3 learning platform powered by blockchain, AI, and commitment.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/courses" className="hover:text-foreground">Courses</Link></li>
              <li><Link href="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
              <li><Link href="/profile" className="hover:text-foreground">Profile</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Learn More</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">Documentation</a></li>
              <li><a href="#" className="hover:text-foreground">How it Works</a></li>
              <li><a href="#" className="hover:text-foreground">Smart Contracts</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Community</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">Twitter</a></li>
              <li><a href="#" className="hover:text-foreground">Discord</a></li>
              <li><a href="#" className="hover:text-foreground">GitHub</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© 2025 Stake to Learn. All rights reserved. Built on Ethereum.</p>
        </div>
      </div>
    </footer>
  );
}
