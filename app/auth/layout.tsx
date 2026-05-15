import { Hammer } from "lucide-react";
import Link from "next/link";

// Shared layout for login and register pages.
// Keeps auth pages clean and centered with branding.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <header className="border-b border-stone-100 bg-white">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <Hammer size={18} className="text-amber-500" />
            <span className="font-bold text-stone-900 tracking-tight">
              DollyArtisan
            </span>
          </Link>
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center p-4">
        {children}
      </div>
    </div>
  );
}
