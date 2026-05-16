"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, CheckCircle, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, timeAgo } from "@/lib/utils";

interface Offer {
  id: string;
  job_id: string;
  proposed_by: string;
  proposed_by_profile: { full_name: string } | null;
  amount: number;
  note: string | null;
  created_at: string;
}

interface Props {
  job: Record<string, unknown>;
  offer: Offer | null;
  clientId: string;
}

export default function NegotiatingJobCard({ job, offer, clientId }: Props) {
  const supabase = createClient();
  const router = useRouter();

  const [acting, setActing] = useState(false);
  const [showCounter, setShowCounter] = useState(false);
  const [counterAmount, setCounterAmount] = useState("");
  const [counterNote, setCounterNote] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{
    msg: string;
    type: "ok" | "err";
  } | null>(null);

  function flash(msg: string, type: "ok" | "err") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  const isMyOffer = offer?.proposed_by === clientId;
  const offererName = isMyOffer
    ? "Your offer"
    : `${offer?.proposed_by_profile?.full_name ?? "Artisan"}'s offer`;

  async function acceptOffer() {
    if (!offer) return;
    setActing(true);

    const { error: nErr } = await supabase
      .from("negotiations")
      .update({ status: "accepted" })
      .eq("id", offer.id);

    if (nErr) {
      flash("Failed to accept offer", "err");
      setActing(false);
      return;
    }

    const { error: jErr } = await supabase
      .from("jobs")
      .update({ status: "awaiting_payment", budget: offer.amount })
      .eq("id", job.id as string);

    if (jErr) {
      flash("Failed to update job", "err");
      setActing(false);
      return;
    }

    flash("Offer accepted! Job is now active.", "ok");
    setActing(false);
    router.refresh();
  }

  async function declineOffer() {
    setActing(true);

    await supabase
      .from("negotiations")
      .update({ status: "rejected" })
      .eq("id", offer?.id ?? "");

    const { error: jErr } = await supabase
      .from("jobs")
      .update({ status: "declined" })
      .eq("id", job.id as string);

    if (jErr) {
      flash("Failed to decline", "err");
      setActing(false);
      return;
    }

    flash("Job declined.", "err");
    setActing(false);
    router.refresh();
  }

  async function submitCounter() {
    const parsed = parseFloat(counterAmount);
    if (!parsed || parsed <= 0) {
      setError("Enter a valid amount");
      return;
    }

    setActing(true);
    setError("");

    if (offer) {
      await supabase
        .from("negotiations")
        .update({ status: "countered" })
        .eq("id", offer.id);
    }

    const { error: nErr } = await supabase.from("negotiations").insert({
      job_id: job.id as string,
      proposed_by: clientId,
      amount: parsed,
      note: counterNote.trim() || null,
      status: "pending",
    });

    if (nErr) {
      flash("Failed to send counter", "err");
      setActing(false);
      return;
    }

    flash("Counter-offer sent!", "ok");
    setShowCounter(false);
    setCounterAmount("");
    setCounterNote("");
    setActing(false);
    router.refresh();
  }

  const artisan = job.artisan as Record<string, string> | null;

  return (
    <>
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl text-sm text-white shadow-lg flex items-center gap-2 ${
            toast.type === "ok" ? "bg-emerald-600" : "bg-rose-600"
          }`}
        >
          {toast.type === "ok" ? (
            <CheckCircle size={15} />
          ) : (
            <AlertTriangle size={15} />
          )}
          {toast.msg}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <ArrowLeftRight size={14} className="text-violet-500" />
              <span className="text-xs font-semibold text-violet-600 uppercase tracking-wide">
                Price Negotiation
              </span>
            </div>
            <p className="font-semibold text-stone-900">
              {job.title as string}
            </p>
            <p className="text-xs text-stone-400 mt-0.5">
              {artisan?.full_name} · {timeAgo(job.created_at as string)}
            </p>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200 whitespace-nowrap">
            {isMyOffer ? "Awaiting Artisan" : "Awaiting You"}
          </span>
        </div>

        {/* Offer details */}
        {offer ? (
          <div className="bg-stone-50 rounded-xl px-4 py-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-400">Original budget</span>
              <span className="text-sm text-stone-500 line-through">
                {formatCurrency(job.budget as number)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-stone-600">
                {offererName}
              </span>
              <span className="text-base font-bold text-stone-900">
                {formatCurrency(offer.amount)}
              </span>
            </div>
            {offer.note && (
              <p className="text-xs text-stone-500 pt-1 border-t border-stone-100 mt-1">
                "{offer.note}"
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-stone-400 italic">
            No offer details available.
          </p>
        )}

        {/* Actions */}
        {!showCounter ? (
          <div className="flex gap-2">
            <button
              disabled={acting}
              onClick={declineOffer}
              className="h-9 px-4 rounded-xl border border-stone-200 text-stone-600 text-sm hover:bg-stone-50 disabled:opacity-50 transition-colors"
            >
              Decline
            </button>

            {isMyOffer ? (
              // Client sent the last offer — waiting on artisan
              <p className="flex-1 text-xs text-stone-400 text-center py-2 bg-stone-50 rounded-xl self-center">
                Waiting for artisan to respond…
              </p>
            ) : (
              // Artisan sent the last offer — client can counter or accept
              <>
                <button
                  disabled={acting}
                  onClick={() => setShowCounter(true)}
                  className="flex-1 h-9 rounded-xl border border-violet-200 text-violet-700 bg-violet-50 text-sm font-medium hover:bg-violet-100 disabled:opacity-50 transition-colors"
                >
                  Counter Offer
                </button>
                <button
                  disabled={acting || !offer}
                  onClick={acceptOffer}
                  className="flex-1 h-9 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                >
                  {acting
                    ? "…"
                    : `Accept ${offer ? formatCurrency(offer.amount) : ""}`}
                </button>
              </>
            )}
          </div>
        ) : (
          /* Inline counter-offer form */
          <div className="space-y-3 pt-1 border-t border-stone-100">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
              Your counter offer
            </p>
            <input
              type="number"
              min="0"
              value={counterAmount}
              onChange={(e) => setCounterAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full h-10 px-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 transition"
            />
            <textarea
              value={counterNote}
              onChange={(e) => setCounterNote(e.target.value)}
              rows={2}
              placeholder="Add a note (optional)"
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 transition resize-none"
            />
            {error && <p className="text-xs text-rose-500">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowCounter(false);
                  setError("");
                }}
                className="flex-1 h-9 rounded-xl border border-stone-200 text-stone-600 text-sm hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={acting}
                onClick={submitCounter}
                className="flex-1 h-9 rounded-xl bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 disabled:opacity-50 transition-colors"
              >
                {acting ? "Sending…" : "Send Counter"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
