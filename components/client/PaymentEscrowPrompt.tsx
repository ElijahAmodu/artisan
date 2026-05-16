"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Upload,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";

interface Props {
  job: Record<string, unknown>;
  clientId: string;
}

export default function PaymentEscrowPrompt({ job, clientId }: Props) {
  const supabase = createClient();
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{
    msg: string;
    type: "ok" | "err";
  } | null>(null);

  function flash(msg: string, type: "ok" | "err") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function submitProof() {
    if (!file) {
      setError("Please select a file");
      return;
    }

    const maxMb = 5;
    if (file.size > maxMb * 1024 * 1024) {
      setError(`File must be under ${maxMb}MB`);
      return;
    }

    setUploading(true);
    setError("");

    // Upload to Supabase Storage — bucket: "payment-proofs"
    const ext = file.name.split(".").pop();
    const path = `${clientId}/${job.id as string}-${Date.now()}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from("payment-proofs")
      .upload(path, file, { upsert: true });

    if (uploadErr) {
      flash("Upload failed. Please try again.", "err");
      setUploading(false);
      return;
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from("payment-proofs")
      .getPublicUrl(path);

    // Update the job row
    const { error: jErr } = await supabase
      .from("jobs")
      .update({
        status: "in_progress",
        payment_proof_url: urlData.publicUrl,
        payment_submitted_at: new Date().toISOString(),
      })
      .eq("id", job.id as string)
      .eq("client_id", clientId); // RLS guard

    if (jErr) {
      flash("Failed to update job status.", "err");
      setUploading(false);
      return;
    }

    flash("Payment confirmed! Work can now begin.", "ok");
    setUploading(false);
    router.refresh();
  }

  const artisan = job.artisan as Record<string, string> | null;
  const budget = job.budget as number;

  // Your escrow account details — replace with real values
  const ESCROW_ACCOUNT = "0123456789";
  const ESCROW_BANK = "First Bank";
  const ESCROW_NAME = "Handywork Escrow Ltd";

  return (
    <>
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl text-sm text-white shadow-lg flex items-center gap-2 ${toast.type === "ok" ? "bg-emerald-600" : "bg-rose-600"}`}
        >
          {toast.type === "ok" ? (
            <CheckCircle size={15} />
          ) : (
            <AlertTriangle size={15} />
          )}
          {toast.msg}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <ShieldCheck size={14} className="text-orange-500" />
              <span className="text-xs font-semibold text-orange-600 uppercase tracking-wide">
                Payment Required
              </span>
            </div>
            <p className="font-semibold text-stone-900">
              {job.title as string}
            </p>
            <p className="text-xs text-stone-400 mt-0.5">
              {artisan?.full_name} has accepted your job
            </p>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200 whitespace-nowrap">
            Awaiting Payment
          </span>
        </div>

        {/* Escrow instructions */}
        <div className="bg-orange-50 rounded-xl px-4 py-3 space-y-3">
          <p className="text-xs font-semibold text-orange-800 uppercase tracking-wide">
            Transfer to escrow account
          </p>
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-stone-500">Amount</span>
              <span className="font-bold text-stone-900">
                {formatCurrency(budget)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-500">Account name</span>
              <span className="font-medium text-stone-700">{ESCROW_NAME}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-500">Account number</span>
              <span className="font-mono font-semibold text-stone-900">
                {ESCROW_ACCOUNT}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-500">Bank</span>
              <span className="font-medium text-stone-700">{ESCROW_BANK}</span>
            </div>
          </div>
          <p className="text-xs text-orange-700 pt-1 border-t border-orange-200">
            Funds are held securely and only released to the artisan after you
            confirm the work is complete.
          </p>
        </div>

        {/* Proof of payment upload */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
            Upload proof of payment
          </p>
          <label
            className={`flex flex-col items-center justify-center gap-2 w-full h-24 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${file ? "border-emerald-300 bg-emerald-50" : "border-stone-200 hover:border-stone-300 bg-stone-50"}`}
          >
            <input
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null);
                setError("");
              }}
            />
            {file ? (
              <>
                <CheckCircle size={20} className="text-emerald-500" />
                <span className="text-xs text-emerald-700 font-medium truncate max-w-[200px]">
                  {file.name}
                </span>
              </>
            ) : (
              <>
                <Upload size={20} className="text-stone-400" />
                <span className="text-xs text-stone-400">
                  Click to upload screenshot or PDF
                </span>
              </>
            )}
          </label>
          {error && <p className="text-xs text-rose-500">{error}</p>}
        </div>

        <button
          disabled={uploading || !file}
          onClick={submitProof}
          className="w-full h-10 rounded-xl bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {uploading ? (
            "Submitting…"
          ) : (
            <>
              <ShieldCheck size={15} />
              Confirm Payment & Start Job
            </>
          )}
        </button>
      </div>
    </>
  );
}
