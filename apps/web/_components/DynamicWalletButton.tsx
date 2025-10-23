"use client";

import dynamic from "next/dynamic";
import { WalletButton } from "./WalletButton";

// Dynamically import WalletButton to prevent hydration issues
const DynamicWalletButton = dynamic(() => Promise.resolve(WalletButton), {
  ssr: false,
  loading: () => (
    <div className="w-full py-4 px-6 rounded-2xl bg-gray-100 animate-pulse">
      <div className="h-6 bg-gray-200 rounded"></div>
    </div>
  ),
});

export { DynamicWalletButton };
