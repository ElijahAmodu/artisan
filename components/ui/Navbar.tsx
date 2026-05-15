"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";
import { cn } from "@/lib/utils";

interface NavbarProps {
  user: Profile | null;
}

// Top navigation bar shared across all authenticated layouts.
export default function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const dashboardHref =
    user?.role === "artisan"
      ? "/artisan/dashboard"
      : user?.role === "admin"
        ? "/admin/dashboard"
        : "/client/dashboard";

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-stone-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link
          href={user ? dashboardHref : "/"}
          className="flex items-center gap-2"
        >
          <span className="text-amber-500 text-xl">&#9874;</span>
          <span className="font-bold text-stone-900 tracking-tight">
            DollyArtisan
          </span>
        </Link>

        {/* Desktop nav */}
        {user && (
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href={dashboardHref}
              className="px-3 py-1.5 text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
            >
              Dashboard
            </Link>

            {/* Role-specific nav links */}
            {user.role === "artisan" && (
              <Link
                href="/artisan/jobs"
                className="px-3 py-1.5 text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
              >
                My Jobs
              </Link>
            )}
            {user.role === "client" && (
              <Link
                href="/client/search"
                className="px-3 py-1.5 text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
              >
                Find a Pro
              </Link>
            )}
          </nav>
        )}

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <button
                className="relative p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                aria-label="Notifications"
              >
                <Bell size={18} />
              </button>

              <div className="hidden md:flex items-center gap-2 pl-2 border-l border-stone-100">
                <div className="text-right">
                  <p className="text-xs font-medium text-stone-900 leading-none">
                    {user.full_name}
                  </p>
                  <p className="text-xs text-stone-400 capitalize">
                    {user.role}
                  </p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  aria-label="Sign out"
                >
                  <LogOut size={16} />
                </button>
              </div>

              {/* Mobile menu toggle */}
              <button
                className="md:hidden p-2 text-stone-500 hover:bg-stone-100 rounded-lg"
                onClick={() => setMenuOpen((o) => !o)}
                aria-label="Toggle menu"
              >
                {menuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </>
          ) : (
            <Link
              href="/auth/login"
              className="px-4 py-2 text-sm font-medium bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && user && (
        <div className="md:hidden border-t border-stone-100 bg-white px-4 py-3 space-y-1">
          <Link
            href={dashboardHref}
            className="block px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 rounded-lg"
            onClick={() => setMenuOpen(false)}
          >
            Dashboard
          </Link>
          {user.role === "artisan" && (
            <Link
              href="/artisan/jobs"
              className="block px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 rounded-lg"
              onClick={() => setMenuOpen(false)}
            >
              My Jobs
            </Link>
          )}
          {user.role === "client" && (
            <Link
              href="/client/search"
              className="block px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 rounded-lg"
              onClick={() => setMenuOpen(false)}
            >
              Find a Pro
            </Link>
          )}
          <button
            onClick={handleSignOut}
            className="w-full text-left px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg"
          >
            Sign Out
          </button>
        </div>
      )}
    </header>
  );
}
