"use client";

import { motion } from "framer-motion";
import { Lock, TrendingUp, Award, Shield, Zap, BookOpen } from "lucide-react";

const features = [
  {
    icon: Lock,
    title: "Stake to Enroll",
    description: "Stake a small amount of ETH to unlock premium courses. Your funds are held securely in a smart contract.",
    gradient: "from-purple-500 to-purple-600"
  },
  {
    icon: TrendingUp,
    title: "Complete & Earn",
    description: "Finish assignments and complete the course. Your stake is automatically refunded upon successful completion.",
    gradient: "from-pink-500 to-pink-600"
  },
  {
    icon: Award,
    title: "Soulbound NFTs",
    description: "Earn non-transferable NFTs as proof of your achievements. Build your permanent on-chain reputation.",
    gradient: "from-blue-500 to-blue-600"
  },
  {
    icon: Shield,
    title: "Secure & Transparent",
    description: "All transactions verified on Ethereum. Smart contracts ensure your stake is safe and refunds are automatic.",
    gradient: "from-green-500 to-green-600"
  },
  {
    icon: Zap,
    title: "AI-Powered Verification",
    description: "GitHub commits verified by AI. Automated assessment ensures fair evaluation of your work.",
    gradient: "from-yellow-500 to-orange-600"
  },
  {
    icon: BookOpen,
    title: "Premium Content",
    description: "Access curated courses in Web3, Blockchain, AI, and more. Learn from industry experts.",
    gradient: "from-indigo-500 to-indigo-600"
  }
];

export function Features() {
  return (
    <section className="w-full py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            How It Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            A revolutionary learning platform that combines blockchain technology with education
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card rounded-2xl p-6 shadow-lg border border-border hover:shadow-xl transition-shadow"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
