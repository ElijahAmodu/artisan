import Link from "next/link";
import Image from "next/image";

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
            <Link href="/" className="">
              <Image
                src="/logo.svg"
                alt="Logo"
                width={48}
                height={48}
                className="w-8 h-8 md:w-12 md:h-12"
              />
            </Link>
            <span className="font-bold text-stone-900 tracking-tight">
              ArtisanQuarters
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
