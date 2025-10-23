"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useStaking, useUserStake } from "@/hooks/useStaking";

interface StakingButtonProps {
  courseId: number;
  onStakeSuccess?: () => void;
}

export function StakingButton({ courseId, onStakeSuccess }: StakingButtonProps) {
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

  const { hasStaked, hasCompleted, refetch } = useUserStake(address, courseId);

  // Effect to handle transaction confirmation
  useEffect(() => {
    if (isConfirming) {
      setStakeStatus("⏳ Confirming transaction...");
    }
    if (isSuccess) {
      setStakeStatus("✅ Successfully staked! You can now start the course.");
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
      setStakeStatus(`❌ Staking failed: ${stakingError.message}`);
      setTimeout(() => setStakeStatus(""), 5000);
    }
  }, [isConfirming, isSuccess, stakingError, refetch, onStakeSuccess]);

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

    setStakeStatus("🔄 Preparing stake transaction...");

    try {
      setStakeStatus("💫 Please confirm the transaction in your wallet...");
      await stakeForCourse();
    } catch (error: any) {
      console.error("Staking error:", error);
      setStakeStatus(`❌ Staking failed: ${error.message || "Unknown error"}`);
      setTimeout(() => setStakeStatus(""), 5000);
    }
  };

  if (!isConnected) {
    return null; // Let parent handle wallet connection
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handleStake}
        disabled={isPending || isConfirming || hasStaked || hasCompleted}
        className="w-full py-4 px-6 rounded-2xl text-white font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
        style={{ background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)' }}
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
            Continue Learning
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
