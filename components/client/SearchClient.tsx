"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Star,
  MapPin,
  DollarSign,
  X,
  Lock,
  AlertTriangle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";

interface Artisan {
  id: string;
  user_id: string;
  skills: string[];
  bio: string | null;
  hourly_rate: number | null;
  location: string | null;
  is_available: boolean;
  rating: number;
  total_reviews: number;
  profiles: { full_name: string; email: string } | null;
}

interface Props {
  artisans: Artisan[];
  clientId: string;
}

// Interactive search UI: filter by skill keyword, then open a hire modal
// that collects job details and submits a job request.
export default function SearchClient({ artisans, clientId }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Artisan | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Filter artisans by matching the search query against skills, name, or location.
  const filtered = artisans.filter((a) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      a.skills.some((s) => s.toLowerCase().includes(q)) ||
      a.profiles?.full_name.toLowerCase().includes(q) ||
      a.location?.toLowerCase().includes(q)
    );
  });

  // Submits a job request from the client to the chosen artisan.
  async function postJob(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setLoading(true);
    setError("");

    const { error: err } = await supabase.from("jobs").insert({
      client_id: clientId,
      artisan_id: selected.user_id,
      title,
      description,
      budget: parseFloat(budget),
      status: "pending",
      payment_status: "escrowed", // funds held in escrow on job creation
    });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    setSelected(null);
    router.push("/client/dashboard");
    router.refresh();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5 fade-up">
      <div>
        <h1 className="text-xl font-bold text-stone-900">Find a Pro</h1>
        <p className="text-sm text-stone-400 mt-1">
          Search by skill, name, or location.
        </p>
      </div>

      {/* Search input */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search skills (e.g. Plumber)…"
          className="w-full h-11 pl-9 pr-4 rounded-xl border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 transition"
        />
      </div>

      {/* Artisan cards */}
      {filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-stone-100 p-10 text-center">
          <p className="text-stone-400 text-sm">
            No artisans found for &ldquo;{query}&rdquo;
          </p>
        </div>
      )}

      {filtered.map((artisan) => (
        <div
          key={artisan.id}
          className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              {/* Avatar initials */}
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-sm font-bold text-amber-700 shrink-0">
                {artisan.profiles?.full_name[0] ?? "?"}
              </div>
              <div>
                <p className="font-semibold text-stone-900">
                  {artisan.profiles?.full_name}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star size={12} className="text-amber-400 fill-amber-400" />
                  <span className="text-xs text-stone-600 font-medium">
                    {artisan.rating > 0 ? artisan.rating.toFixed(1) : "New"}
                  </span>
                  {artisan.total_reviews > 0 && (
                    <span className="text-xs text-stone-400">
                      ({artisan.total_reviews})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Availability badge */}
            <span
              className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                artisan.is_available
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-stone-50 text-stone-500 border-stone-200"
              }`}
            >
              {artisan.is_available ? "Available" : "Busy"}
            </span>
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {artisan.skills.map((skill) => (
              <span
                key={skill}
                className="px-2 py-0.5 bg-stone-100 text-stone-600 text-xs rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>

          {artisan.bio && (
            <p className="text-sm text-stone-500 mb-3 line-clamp-2">
              {artisan.bio}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-stone-400">
              {artisan.location && (
                <span className="flex items-center gap-1">
                  <MapPin size={11} /> {artisan.location}
                </span>
              )}
              {artisan.hourly_rate && (
                <span className="flex items-center gap-1">
                  <DollarSign size={11} /> {formatCurrency(artisan.hourly_rate)}
                  /hr
                </span>
              )}
            </div>

            <button
              onClick={() => {
                setSelected(artisan);
                setTitle("");
                setDescription("");
                setBudget("");
                setError("");
              }}
              disabled={!artisan.is_available}
              className="px-4 py-1.5 bg-stone-900 text-white text-xs font-medium rounded-lg hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Hire
            </button>
          </div>
        </div>
      ))}

      {/* Hire modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl fade-up max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-stone-900">
                Hire {selected.profiles?.full_name}
              </h3>
              <button
                onClick={() => setSelected(null)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={postJob} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">
                  Job Title
                </label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Fix kitchen sink leak"
                  className="w-full h-10 px-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">
                  Job Description
                </label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe the work in detail…"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-stone-900 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">
                  Budget ($)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="150"
                  className="w-full h-10 px-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 transition"
                />
              </div>

              {/* Escrow notice */}
              <div className="flex items-start gap-2 px-3 py-3 bg-stone-50 rounded-xl border border-stone-200">
                <Lock size={14} className="text-stone-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-stone-700">
                    Secure Payment
                  </p>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Funds are held in escrow until job is done.
                  </p>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 px-3 py-2 rounded-xl border border-rose-200">
                  <AlertTriangle size={13} /> {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-stone-900 text-white font-semibold hover:bg-stone-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {loading && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {loading ? "Posting job…" : "Pay & Post Job"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
