"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, XCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, timeAgo } from "@/lib/utils";

interface Props {
  disputedJobs: Record<string, unknown>[];
}

// Admin dispute resolution: refund client or release payment to artisan.
export default function AdminDisputesClient({ disputedJobs }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [actionId, setActionId] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    msg: string;
    type: "ok" | "err";
  } | null>(null);

  function showToast(msg: string, type: "ok" | "err") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  // Refunds the client: marks job as disputed-resolved with refund payment status.
  async function refundClient(jobId: string) {
    setActionId(jobId);
    const { error } = await supabase
      .from("jobs")
      .update({ status: "completed", payment_status: "refunded" })
      .eq("id", jobId);

    if (error) showToast("Failed: " + error.message, "err");
    else {
      showToast("Dispute resolved. Funds refunded to client.", "ok");
      router.refresh();
    }
    setActionId(null);
  }

  // Releases payment to the artisan despite the dispute.
  async function releaseToArtisan(jobId: string) {
    setActionId(jobId);
    const { error } = await supabase
      .from("jobs")
      .update({ status: "completed", payment_status: "released" })
      .eq("id", jobId);

    if (error) showToast("Failed: " + error.message, "err");
    else {
      showToast("Payment released to artisan.", "ok");
      router.refresh();
    }
    setActionId(null);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5 fade-up">
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl text-sm text-white shadow-lg fade-up flex items-center gap-2 ${toast.type === "ok" ? "bg-emerald-600" : "bg-rose-600"}`}
        >
          {toast.type === "ok" ? (
            <CheckCircle size={15} />
          ) : (
            <AlertTriangle size={15} />
          )}
          {toast.msg}
        </div>
      )}

      <div className="flex items-center gap-3">
        <ShieldAlert size={20} className="text-rose-500" />
        <h1 className="text-xl font-bold text-stone-900">Disputes</h1>
        {disputedJobs.length > 0 && (
          <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-xs font-semibold rounded-full">
            {disputedJobs.length} active
          </span>
        )}
      </div>

      {disputedJobs.length === 0 && (
        <div className="bg-white rounded-2xl border border-stone-100 p-12 text-center">
          <CheckCircle size={32} className="mx-auto text-emerald-300 mb-3" />
          <p className="text-stone-400 text-sm">
            No active disputes. Platform is running smoothly.
          </p>
        </div>
      )}

      {disputedJobs.map((job) => {
        const client = job.client as Record<string, string>;
        const artisan = job.artisan as Record<string, string>;
        const isActing = actionId === (job.id as string);

        return (
          <div
            key={job.id as string}
            className="bg-white rounded-2xl border border-rose-100 shadow-sm p-6"
          >
            {/* Dispute header */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <p className="font-bold text-stone-900">
                  {job.title as string}
                </p>
                <p className="text-xs text-stone-400 mt-0.5">
                  {timeAgo(job.updated_at as string)}
                </p>
              </div>
              <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold rounded-full">
                Disputed
              </span>
            </div>

            {/* Parties */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-stone-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-stone-500 mb-1">
                  Client
                </p>
                <p className="text-sm font-medium text-stone-900">
                  {client?.full_name}
                </p>
                <p className="text-xs text-stone-400">{client?.email}</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-stone-500 mb-1">
                  Artisan
                </p>
                <p className="text-sm font-medium text-stone-900">
                  {artisan?.full_name}
                </p>
                <p className="text-xs text-stone-400">{artisan?.email}</p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-stone-400">Amount in escrow</p>
                <p className="text-xl font-bold text-stone-900">
                  {formatCurrency(job.budget as number)}
                </p>
              </div>
            </div>

            {/* Resolution actions */}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                disabled={isActing}
                onClick={() => refundClient(job.id as string)}
                className="flex items-center justify-center gap-1.5 flex-1 h-10 rounded-xl bg-rose-600 text-white text-sm font-medium hover:bg-rose-700 disabled:opacity-50 transition-colors"
              >
                {isActing ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <XCircle size={15} />
                )}
                Resolve — Refund Client
              </button>
              <button
                disabled={isActing}
                onClick={() => releaseToArtisan(job.id as string)}
                className="flex items-center justify-center gap-1.5 flex-1 h-10 rounded-xl border border-stone-200 text-stone-700 text-sm font-medium hover:bg-stone-50 disabled:opacity-50 transition-colors"
              >
                {isActing ? (
                  <span className="w-4 h-4 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckCircle size={15} />
                )}
                Release to Artisan
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
