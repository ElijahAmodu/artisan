"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  job: Record<string, unknown>;
  clientId: string;
}

// Floating modal that lets a client leave a star rating and comment
// for a completed job. Saves to the reviews table.
export default function ReviewModal({ job, clientId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submitReview() {
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    setLoading(true);
    setError("");

    const supabase = createClient();

    // Insert review; RLS policy enforces the client must own the completed job.
    const { error: err } = await supabase.from("reviews").insert({
      job_id: job.id as string,
      client_id: clientId,
      artisan_id: job.artisan_id as string,
      rating,
      comment: comment.trim() || null,
    });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 border border-amber-200 bg-amber-50 text-amber-700 text-xs font-medium rounded-lg hover:bg-amber-100 transition-colors"
      >
        <Star size={12} /> Leave Review
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50  flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-stone-900">Leave a Review</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-sm text-stone-500 mb-4">
              How was the work done by this artisan?
            </p>

            {/* Star rating selector */}
            <div
              className="flex items-center gap-1 mb-4"
              onMouseLeave={() => setHovered(0)}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={28}
                    className={
                      star <= (hovered || rating)
                        ? "text-amber-400 fill-amber-400"
                        : "text-stone-200"
                    }
                  />
                </button>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Share your experience (optional)…"
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-stone-900 transition mb-3"
            />

            {error && <p className="text-xs text-rose-500 mb-3">{error}</p>}

            <button
              onClick={submitReview}
              disabled={loading}
              className="w-full h-10 rounded-xl bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {loading && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {loading ? "Submitting…" : "Submit Review"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
