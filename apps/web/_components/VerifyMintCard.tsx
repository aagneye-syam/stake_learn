"use client";

import { ShimmerButton } from "../components/ui/shimmer-button";
import { Button as MovingBorderButton } from "../components/ui/moving-border";

interface VerifyMintCardProps {
  repo: string;
  sha: string;
  isLoading: boolean;
  permit: any;
  status: string;
  address: `0x${string}` | undefined;
  onRepoChange: (value: string) => void;
  onShaChange: (value: string) => void;
  onVerify: () => void;
  onMint: () => void;
}

export function VerifyMintCard({
  repo,
  sha,
  isLoading,
  permit,
  status,
  address,
  onRepoChange,
  onShaChange,
  onVerify,
  onMint,
}: VerifyMintCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Verify & Mint SBT
        </h2>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Repository
          </label>
          <input
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900 transition-all outline-none"
            placeholder="e.g., owner/repo-name"
            value={repo}
            onChange={(e) => onRepoChange(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Commit SHA
          </label>
          <input
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900 transition-all outline-none"
            placeholder="e.g., abc123def456..."
            value={sha}
            onChange={(e) => onShaChange(e.target.value)}
          />
        </div>

        <div className="flex gap-4 items-center justify-center">
          <ShimmerButton
            onClick={onVerify}
            disabled={!address || isLoading || !repo || !sha}
            className="w-full"
            background="linear-gradient(135deg, rgb(147, 51, 234) 0%, rgb(59, 130, 246) 100%)"
          >
            {isLoading && !permit ? (
              <span className="flex items-center justify-center gap-2 text-white">
                <svg
                  className="animate-spin h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Verifying...
              </span>
            ) : (
              <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white lg:text-lg">
                Verify Contribution
              </span>
            )}
          </ShimmerButton>

          <MovingBorderButton
            onClick={onMint}
            disabled={!permit || isLoading}
            borderRadius="1.75rem"
            className="bg-white dark:bg-slate-900 text-black dark:text-white border-neutral-200 dark:border-slate-800 w-full"
            containerClassName="w-full"
          >
            {isLoading && permit ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Minting...
              </span>
            ) : (
              "Mint SBT"
            )}
          </MovingBorderButton>
        </div>

        {status && (
          <div
            className={`p-4 rounded-xl ${
              status.startsWith("✓")
                ? "bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800"
                : status.startsWith("✗")
                  ? "bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800"
                  : "bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800"
            }`}
          >
            <p
              className={`text-sm font-medium ${
                status.startsWith("✓")
                  ? "text-green-800 dark:text-green-200"
                  : status.startsWith("✗")
                    ? "text-red-800 dark:text-red-200"
                    : "text-blue-800 dark:text-blue-200"
              }`}
            >
              {status}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
