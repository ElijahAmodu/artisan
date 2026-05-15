"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  LogOut,
  Hammer,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/types";

interface Props {
  profile: Profile;
}

const NAV = [
  { href: "/artisan/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/artisan/jobs", icon: Briefcase, label: "My Jobs" },
];

export default function ArtisanSidebar({ profile }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function signOut() {
    const sb = createClient();
    await sb.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const NavLinks = () => (
    <>
      {NAV.map(({ href, icon: Icon, label }) => (
        <Link
          key={href}
          href={href}
          onClick={() => setOpen(false)}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
            pathname === href
              ? "bg-stone-900 text-white"
              : "text-stone-600 hover:bg-stone-100 hover:text-stone-900",
          )}
        >
          <Icon size={17} />
          {label}
        </Link>
      ))}
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-40 bg-white border-b border-stone-100 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Hammer size={18} className="text-amber-500" />
          <span className="font-bold text-stone-900 text-sm">
            ArtisanQuarters
          </span>
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="p-2 text-stone-500 hover:bg-stone-100 rounded-lg"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/30"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute left-0 top-14 bottom-0 w-64 bg-white p-4 space-y-1 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <NavLinks />
            <button
              onClick={signOut}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 w-full mt-4"
            >
              <LogOut size={17} /> Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 lg:w-60 shrink-0 bg-white border-r border-stone-100 min-h-screen sticky top-0 h-screen p-4">
        <div className="flex items-center gap-2 px-2 mb-8 mt-2">
          <Hammer size={18} className="text-amber-500" />
          <span className="font-bold text-stone-900 text-sm tracking-tight">
            ArtisanQuarters
          </span>
        </div>

        <nav className="space-y-1 flex-1">
          <NavLinks />
        </nav>

        {/* Profile footer */}
        <div className="border-t border-stone-100 pt-4 mt-4">
          <div className="flex items-center gap-2 px-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700">
              {profile.full_name[0]}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-stone-900 truncate">
                {profile.full_name}
              </p>
              <p className="text-xs text-stone-400">Artisan</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-500 hover:bg-rose-50 w-full transition-colors"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
