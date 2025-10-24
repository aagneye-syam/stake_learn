"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="max-w-3xl w-full mx-auto text-center p-8 rounded-3xl shadow-2xl bg-white/80 backdrop-blur-lg border border-gray-200"
      >
        <div className="mb-8">
          <span className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-sm shadow-lg mb-4">
            Stake to Learn
          </span>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4">
            Unlock Knowledge. <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">Stake ETH</span>.
          </h1>
          <p className="text-lg text-gray-700 mb-6">
            The premium Web3 learning platform where your commitment is rewarded. Stake ETH to enroll, complete courses, and get your funds back. Powered by blockchain, AI, and soulbound NFTs.
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-4 justify-center mb-8">
          <Link href="/dashboard">
            <button className="w-full md:w-auto px-8 py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-purple-600 to-pink-500 shadow-lg hover:from-purple-700 hover:to-pink-600 transition-all text-lg">
              Get Started
            </button>
          </Link>
          <Link href="/courses">
            <button className="w-full md:w-auto px-8 py-4 rounded-2xl font-bold text-purple-700 bg-white border border-purple-300 shadow-lg hover:bg-purple-50 transition-all text-lg">
              Browse Courses
            </button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center">
            <svg className="w-10 h-10 text-purple-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <h3 className="font-bold text-lg mb-2">Stake to Enroll</h3>
            <p className="text-gray-600 text-sm">Stake a small amount of ETH to unlock premium courses. Your funds are held securely in a smart contract.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center">
            <svg className="w-10 h-10 text-pink-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="font-bold text-lg mb-2">Complete & Earn</h3>
            <p className="text-gray-600 text-sm">Finish assignments and complete the course. Your stake is automatically refunded upon success.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center">
            <svg className="w-10 h-10 text-blue-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="font-bold text-lg mb-2">Soulbound Proof</h3>
            <p className="text-gray-600 text-sm">Earn non-transferable NFTs as proof of your achievements. Build your on-chain reputation.</p>
          </div>
        </div>
        <div className="mt-12 text-center text-gray-500 text-sm">
          <span className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 font-semibold">
            Powered by Ethereum, AI, and Next.js
          </span>
        </div>
      </motion.div>
    </main>
  );
}
