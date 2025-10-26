"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import UserOnboardingModal from "@/_components/UserOnboardingModal";
import { connectWallet } from "@/services/wallet-auth.service";
import { getUserByWallet, createWalletUser } from "@/services/user.service";
import { useWalletAuth } from "@/_context/WalletAuthContext";

function AnimatedHero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const { refreshUser } = useWalletAuth();
  const router = useRouter();
  const titles = useMemo(
    () => ["revolutionary", "secure", "transparent", "rewarding", "innovative"],
    []
  );

  const handleGoToDashboard = async () => {
    setError("");
    setIsConnecting(true);

    try {
      // Connect wallet
      const address = await connectWallet();
      setWalletAddress(address);

      // Check if user exists
      const user = await getUserByWallet(address);

      if (user) {
        // User exists, go to dashboard
        router.push("/dashboard");
      } else {
        // New user, show onboarding modal
        setShowOnboarding(true);
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect wallet");
      setTimeout(() => setError(""), 5000);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleOnboardingSubmit = async (name: string, email: string) => {
    try {
      await createWalletUser(walletAddress, name, email);
      setShowOnboarding(false);
      await refreshUser(); // Refresh user in context
      router.push("/dashboard");
    } catch (err: any) {
      throw new Error(err.message || "Failed to create account");
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="w-full min-h-screen flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="flex gap-8 py-20 lg:py-40 items-center justify-center flex-col">
          <div>
            <Link href="/courses">
              <Button variant="secondary" size="sm" className="gap-4">
                Explore our courses <MoveRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="flex gap-4 flex-col">
            <h1 className="text-5xl md:text-7xl max-w-2xl tracking-tighter text-center font-regular">
              <span className="text-foreground">This is something</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-semibold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent"
                    initial={{ opacity: 0, y: "-100" }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? {
                            y: 0,
                            opacity: 1,
                          }
                        : {
                            y: titleNumber > index ? -150 : 150,
                            opacity: 0,
                          }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>

            <p className="text-lg md:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-2xl text-center">
              Learning made accountable. Stake ETH to enroll in premium Web3 courses, 
              complete your journey, and get your stake back. Powered by smart contracts, 
              your commitment is rewarded with knowledge and proof of achievement.
            </p>
          </div>

          {error && (
            <div className="max-w-md mx-auto p-4 rounded-xl bg-red-50 border-2 border-red-200 flex items-start gap-3" role="alert">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          <div className="flex flex-row gap-3">
            <Link href="/signup" className="group">
              <Button
                size="lg"
                className="gap-4 bg-background border-2 border-primary text-primary group-hover:bg-primary group-hover:text-background transition-colors"
                variant="outline"
              >
                Sign Up <Rocket className="w-4 h-4" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              className="gap-4 bg-primary text-background border-2 border-primary hover:bg-background hover:text-primary transition-colors"
              onClick={handleGoToDashboard}
              disabled={isConnecting}
              variant="default"
            >
              {isConnecting ? "Connecting..." : "Go to Dashboard"} <MoveRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <UserOnboardingModal
        isOpen={showOnboarding}
        walletAddress={walletAddress}
        onSubmit={handleOnboardingSubmit}
      />
    </div>
  );
}

export { AnimatedHero };
