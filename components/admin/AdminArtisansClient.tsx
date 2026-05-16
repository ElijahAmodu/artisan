"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, CheckCircle, XCircle, Star, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { timeAgo } from "@/lib/utils";

interface Props {
  artisans: Record<string, unknown>[];
}

// Full artisan management table with search, filter by status, and approve/reject.
export default function AdminArtisansClient({ artisans }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
  const [actionId, setActionId] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function reviewArtisan(artisanId: string, approve: boolean) {
    setActionId(artisanId);
    const { error } = await supabase
      .from("artisan_profiles")
      .update({ is_approved: approve })
      .eq("id", artisanId);

    if (!error) {
      showToast(approve ? "Artisan approved." : "Artisan rejected.");
      router.refresh();
    }
    setActionId(null);
  }

  // Apply text search and status filter to the artisan list.
  const filtered = artisans.filter((ap) => {
    const profile = ap.profiles as Record<string, string>;
    const matchQ =
      !query.trim() ||
      profile?.full_name?.toLowerCase().includes(query.toLowerCase()) ||
      (ap.skills as string[])?.some((s) =>
        s.toLowerCase().includes(query.toLowerCase()),
      );
    const matchF =
      filter === "all"
        ? true
        : filter === "approved"
          ? ap.is_approved
          : !ap.is_approved;
    return matchQ && matchF;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-5 fade-up">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm shadow-lg fade-up">
          {toast}
        </div>
      )}

      <h1 className="text-xl font-bold text-stone-900">Artisan Management</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or skill…"
            className="w-full h-9 pl-8 pr-3 rounded-xl border border-stone-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-900 transition"
          />
        </div>
        <div className="flex gap-1 bg-white border border-stone-200 rounded-xl p-1">
          {(["all", "pending", "approved"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${filter === f ? "bg-stone-900 text-white" : "text-stone-500 hover:text-stone-900"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Artisan cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((ap) => {
          const profile = ap.profiles as Record<string, string>;
          const skills = ap.skills as string[];
          const isActing = actionId === (ap.id as string);

          return (
            <div
              key={ap.id as string}
              className={`bg-white rounded-2xl border shadow-sm p-5 ${ap.is_approved ? "border-stone-100" : "border-amber-100"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-sm font-bold text-amber-700 shrink-0">
                    {profile?.full_name?.[0] ?? "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-stone-900 truncate">
                      {profile?.full_name}
                    </p>
                    <p className="text-xs text-stone-400 truncate">
                      {profile?.email}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Star
                        size={11}
                        className="text-amber-400 fill-amber-400"
                      />
                      <span className="text-xs text-stone-600">
                        {(ap.rating as number) > 0
                          ? (ap.rating as number).toFixed(1)
                          : "No reviews"}
                      </span>
                      {typeof ap.location === "string" && ap.location && (
                        <>
                          <span className="text-stone-200">·</span>
                          <MapPin size={11} className="text-stone-400" />
                          <span className="text-xs text-stone-400">
                            {ap.location}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                      ap.is_approved
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {ap.is_approved ? "Approved" : "Pending"}
                  </span>
                  <span className="text-xs text-stone-400">
                    {timeAgo(ap.created_at as string)}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-3 mb-3">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-0.5 bg-stone-100 text-stone-600 text-xs rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {!ap.is_approved && (
                <div className="flex gap-2 mt-3">
                  <button
                    disabled={isActing}
                    onClick={() => reviewArtisan(ap.id as string, false)}
                    className="flex items-center gap-1.5 flex-1 justify-center h-8 rounded-xl border border-rose-200 text-rose-600 text-xs font-medium hover:bg-rose-50 disabled:opacity-50 transition-colors"
                  >
                    <XCircle size={13} /> Reject
                  </button>
                  <button
                    disabled={isActing}
                    onClick={() => reviewArtisan(ap.id as string, true)}
                    className="flex items-center gap-1.5 flex-1 justify-center h-8 rounded-xl bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                  >
                    {isActing ? (
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <CheckCircle size={13} />
                    )}
                    Approve
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-stone-100 p-10 text-center text-stone-400 text-sm">
          No artisans match this filter.
        </div>
      )}
    </div>
  );
}
