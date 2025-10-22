import { Navbar1 } from "@/components/ui/navbar-1";

export default function RoutesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-purple-50/20 to-blue-50/20">
      <Navbar1 />
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">{children}</main>
    </div>
  );
}

