"use client";
import { WagmiProvider, createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useEffect } from "react";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";

const config = createConfig(
  getDefaultConfig({
    appName: "Proof of Contribution",
    chains: [sepolia],
    transports: { [sepolia.id]: http(process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL) },
  })
);

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    const mount = document.getElementById("wallet-button");
    if (mount) {
      // dynamic import to avoid SSR issues
      import("../_components/WalletButton").then((m) => {
        const Button = m.WalletButton;
        const root = (require("react-dom/client") as any).createRoot(mount);
        root.render(
          <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
              <ConnectKitProvider>
                <Button />
              </ConnectKitProvider>
            </QueryClientProvider>
          </WagmiProvider>
        );
      });
    }
  }, []);
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

