"use client";
import { WagmiProvider, createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { injected, walletConnect, coinbaseWallet } from "wagmi/connectors";
import { ThemeProvider } from "next-themes";
import { TransactionsProvider } from "./TransactionsContext";

const config = createConfig({
  chains: [sepolia],
  connectors: [
    injected({
      target: "metaMask",
    }),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "14ea17265d2b49b6a49b699b1669d6ca",
    }),
    coinbaseWallet({
      appName: "Proof of Contribution",
    }),
  ],
  transports: {
    [sepolia.id]: http(process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/30VrqdibFPwdIpposSfYp"),
  },
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <TransactionsProvider>
            {children}
          </TransactionsProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}

