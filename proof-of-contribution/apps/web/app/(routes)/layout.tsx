import "../globals.css";
import { Providers } from "../../_context/Providers";

export default function RoutesLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <header className="border-b bg-white">
              <div className="max-w-5xl mx-auto p-4 flex items-center justify-between">
                <h1 className="font-semibold">Proof of Contribution</h1>
                <div className="flex items-center gap-3">
                  <a className="text-sm" href="/profile">Profile</a>
                  <a className="text-sm" href="/dashboard">Dashboard</a>
                  <div id="wallet-button" />
                </div>
              </div>
            </header>
            <main className="flex-1 max-w-5xl mx-auto p-4">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}

