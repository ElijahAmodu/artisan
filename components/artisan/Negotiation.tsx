"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
interface NegotiateModalProps {
  job: Record<string, unknown>;
  currentUserId: string;
  onClose: () => void;
  onSubmitted: () => void;
}

export default function NegotiateModal({
  job,
  currentUserId,
  onClose,
  onSubmitted,
}: NegotiateModalProps) {
  const supabase = createClient();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submitCounter() {
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) {
      setError("Enter a valid amount");
      return;
    }

    setSubmitting(true);

    // 1. Insert the negotiation offer
    const { error: nErr } = await supabase.from("negotiations").insert({
      job_id: job.id,
      proposed_by: currentUserId,
      amount: parsed,
      note: note.trim() || null,
      status: "pending",
    });

    if (nErr) {
      setError("Failed to send offer");
      setSubmitting(false);
      return;
    }

    // 2. ✅ This is what was missing — move the job to negotiating
    const { error: jErr } = await supabase
      .from("jobs")
      .update({ status: "negotiating" })
      .eq("id", job.id);

    if (jErr) {
      setError("Failed to update job status");
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    onSubmitted();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
        <div>
          <h2 className="font-bold text-stone-900 text-base">
            Propose a Price
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            Client's budget: {formatCurrency(job.budget as number)}
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-stone-600 block mb-1">
              Your counter offer
            </label>
            <input
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full h-10 px-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 transition"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-stone-600 block mb-1">
              Note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Explain why, e.g. materials cost more..."
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 transition resize-none"
            />
          </div>
          {error && <p className="text-xs text-rose-500">{error}</p>}
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 h-9 rounded-xl border border-stone-200 text-stone-600 text-sm hover:bg-stone-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={submitCounter}
            disabled={submitting}
            className="flex-1 h-9 rounded-xl bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 disabled:opacity-50 transition-colors"
          >
            {submitting ? "Sending…" : "Send Offer"}
          </button>
        </div>
      </div>
    </div>
  );
}
