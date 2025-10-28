"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useStaking, useUserStake } from "@/hooks/useStaking";
import { createCourseStake } from "@/services/course-stake.service";

interface StakingButtonProps {
  courseId: number;
  totalModules?: number;
  onStakeSuccess?: () => void;
}

export function StakingButton({ courseId, totalModules = 4, onStakeSuccess }: StakingButtonProps) {
  const { address, isConnected } = useAccount();
  const [stakeStatus, setStakeStatus] = useState<string>("");

  const {
    stakeAmount,
    stakeForCourse,
    isPending,
    isConfirming,
    isSuccess,
    hash,
    error: stakingError,
  } = useStaking(courseId);

  // Fallback stake amount if contract doesn't have it set
  const fallbackStakeAmount = "0.00001"; // 0.00001 ETH for testing
  const effectiveStakeAmount = stakeAmount || BigInt(Math.floor(parseFloat(fallbackStakeAmount) * 1e18));

  const { hasStaked, hasCompleted, refetch } = useUserStake(address, courseId);

  // Helper function to get clean error message
  const getCleanErrorMessage = (error: any): string => {
    const errorMessage = error?.message || error?.toString() || "";
    
    // User rejected the transaction
    if (errorMessage.includes("User denied") || errorMessage.includes("User rejected")) {
      return "Transaction cancelled. Please try again when ready.";
    }
    
    // Insufficient funds
    if (errorMessage.includes("insufficient funds")) {
      return "Insufficient funds. Please add more ETH to your wallet.";
    }
    
    // Network/connection issues
    if (errorMessage.includes("network") || errorMessage.includes("connection")) {
      return "Network error. Please check your connection and try again.";
    }
    
    // Gas estimation failed
    if (errorMessage.includes("gas")) {
      return "Transaction failed. Please try again.";
    }
    
    // Default message for any other error
    return "Transaction failed. Please try again.";
  };

  // Effect to handle transaction confirmation and Firestore record creation
  useEffect(() => {
    if (isConfirming) {
      setStakeStatus("⏳ Confirming transaction...");
    }
    if (isSuccess && address) {
      setStakeStatus("✅ Successfully staked! Creating course record...");
      
      // Create Firestore record after successful stake
      const createStakeRecord = async () => {
        try {
          const stakeAmountInEth = (Number(effectiveStakeAmount) / 1e18).toString();
          await createCourseStake(address, courseId, stakeAmountInEth, totalModules);
          setStakeStatus("✅ Course unlocked! You can now start learning.");
        } catch (error: any) {
          console.error("Error creating stake record:", error);
          setStakeStatus("⚠️ Staked successfully but failed to create course record. Please contact support.");
        }
      };
      
      createStakeRecord();
      
      // Refetch stake info after a short delay to ensure blockchain state is updated
      setTimeout(() => {
        refetch();
        onStakeSuccess?.();
      }, 2000);
      setTimeout(() => {
        setStakeStatus("");
      }, 5000);
    }
    if (stakingError) {
      // Log full error for debugging but show clean message to user
      console.error("Staking error details:", stakingError);
      const cleanMessage = getCleanErrorMessage(stakingError);
      setStakeStatus(`❌ ${cleanMessage}`);
      setTimeout(() => setStakeStatus(""), 5000);
    }
  }, [isConfirming, isSuccess, stakingError, refetch, onStakeSuccess, address, courseId, effectiveStakeAmount, totalModules]);

  // Force refetch when component mounts to get latest state
  useEffect(() => {
    if (isConnected && address) {
      refetch();
    }
  }, [isConnected, address, refetch]);

  const handleStake = async () => {
    if (!isConnected) {
      setStakeStatus("❌ Please connect your wallet first");
      setTimeout(() => setStakeStatus(""), 3000);
      return;
    }

    if (!address) {
      setStakeStatus("❌ No wallet address found");
      return;
    }

    if (hasStaked) {
      setStakeStatus("❌ You have already staked for this course");
      setTimeout(() => setStakeStatus(""), 3000);
      return;
    }

    // We'll use the fallback amount if contract amount is not available
    console.log('StakingButton - stake amount check:', {
      stakeAmount,
      effectiveStakeAmount,
      hasStakeAmount: !!stakeAmount
    });

    setStakeStatus("🔄 Preparing stake transaction...");

    try {
      setStakeStatus("💫 Please confirm the transaction in your wallet...");
      await stakeForCourse();
    } catch (error: any) {
      // Log full error for debugging
      console.error("Staking error details:", error);
      
      // Show clean message to user
      const cleanMessage = getCleanErrorMessage(error);
      setStakeStatus(`❌ ${cleanMessage}`);
      setTimeout(() => setStakeStatus(""), 5000);
    }
  };

  if (!isConnected) {
    return null; // Let parent handle wallet connection
  }

  return (
    <div className="space-y-4">
      {/* Success State Indicator */}
      {hasStaked && !hasCompleted && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-green-800">Successfully staked! You can now access the course content.</span>
          </div>
        </div>
      )}

      <button
        onClick={handleStake}
        disabled={isPending || isConfirming || hasStaked || hasCompleted}
        className={`w-full py-4 px-6 rounded-2xl text-white font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 ${
          hasStaked 
            ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
            : 'bg-gradient-to-r from-pink-500 to-rose-600'
        }`}
      >
        {hasCompleted ? (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Course Completed
          </>
        ) : hasStaked ? (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            🎓 Course Started - Continue Learning
          </>
        ) : isPending || isConfirming ? (
          <>
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {isPending ? "Awaiting Approval..." : "Confirming..."}
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Stake & Start Learning
          </>
        )}
      </button>

      {/* Status Message */}
      {stakeStatus && (
        <div className={`p-4 rounded-2xl border ${
          stakeStatus.includes("✅") 
            ? "bg-green-50 border-green-200" 
            : stakeStatus.includes("❌")
            ? "bg-red-50 border-red-200"
            : "bg-blue-50 border-blue-200"
        }`}>
          <p className={`text-sm text-center font-medium ${
            stakeStatus.includes("✅") 
              ? "text-green-800" 
              : stakeStatus.includes("❌")
              ? "text-red-800"
              : "text-blue-800"
          }`}>
            {stakeStatus}
          </p>
          {hash && (
            <a
              href={`https://sepolia.etherscan.io/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800 text-center block mt-2 underline"
            >
              View transaction on Etherscan
            </a>
          )}
        </div>
      )}
    </div>
  );
}
