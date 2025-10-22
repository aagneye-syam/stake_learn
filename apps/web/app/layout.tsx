import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "../_context/Providers";

export const metadata: Metadata = {
  title: "Proof of Contribution",
  description: "Verify your contributions and mint Soulbound Tokens",
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect fill='%239333ea' width='100' height='100' rx='20'/><path fill='white' d='M50 25 L65 45 L85 45 L70 60 L75 80 L50 65 L25 80 L30 60 L15 45 L35 45 Z'/></svg>",
        type: "image/svg+xml",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
