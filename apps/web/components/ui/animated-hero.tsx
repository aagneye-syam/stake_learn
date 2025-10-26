"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import SignInModal from "@/_components/SignInModal";
import { useRouter } from "next/navigation";
import { signInWithEmail } from "@/services/auth.service";

function AnimatedHero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const titles = useMemo(
    () => ["revolutionary", "secure", "transparent", "rewarding", "innovative"],
    []
  );

  const handleSignIn = async (email: string, password: string) => {
    setError("");
    setIsLoading(true);

    try {
      await signInWithEmail(email, password);
      setIsSignInModalOpen(false);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please check your credentials.");
    } finally {
      setIsLoading(false);
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
          <div className="flex flex-row gap-3">
            <Link href="/signup">
              <Button size="lg" className="gap-4" variant="outline">
                Sign Up <Rocket className="w-4 h-4" />
              </Button>
            </Link>
            <Button size="lg" className="gap-4" onClick={() => setIsSignInModalOpen(true)}>
              Go to Dashboard <MoveRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => {
          setIsSignInModalOpen(false);
          setError("");
        }}
        onSignIn={handleSignIn}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}

export { AnimatedHero };
