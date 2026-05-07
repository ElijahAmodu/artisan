"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, CheckCircle, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";

interface Props {
  job: Record<string, unknown>;
  userId: string;
}

// Lets the artisan upload a photo proof and mark the job as completed.
// On success, payment_status moves to 'released' and status to 'completed'.
export default function MarkCompleteClient({ job, userId }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Build a local preview URL when a file is selected.
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    if (selected) {
      setPreview(URL.createObjectURL(selected));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    let proofUrl: string | null = null;

    // Upload the proof photo to the Supabase Storage 'job-proofs' bucket.
    if (file) {
      const ext = file.name.split(".").pop();
      const path = `${userId}/${job.id as string}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("job-proofs")
        .upload(path, file, { upsert: true });

      if (uploadError) {
        setError("Photo upload failed: " + uploadError.message);
        setLoading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("job-proofs")
        .getPublicUrl(path);
      proofUrl = urlData.publicUrl;
    }

    // Mark the job as completed and release the escrow payment.
    const { error: jobError } = await supabase
      .from("jobs")
      .update({
        status: "completed",
        payment_status: "released",
        completion_proof: proofUrl,
        completed_at: new Date().toISOString(),
      })
      .eq("id", job.id as string)
      .eq("artisan_id", userId);

    if (jobError) {
      setError(jobError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/artisan/dashboard"), 2500);
  }

  const client = job.client as Record<string, string>;

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center fade-up">
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-emerald-500" />
        </div>
        <h2 className="text-xl font-bold text-stone-900 mb-2">Job Complete!</h2>
        <p className="text-stone-500 text-sm mb-3">
          Payment of <strong>{formatCurrency(job.budget as number)}</strong> has
          been released.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-semibold text-emerald-700">
          Payment Received: {formatCurrency(job.budget as number)}
        </div>
        <p className="text-xs text-stone-400 mt-4">Redirecting to dashboard…</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-5 fade-up">
      <div>
        <h1 className="text-xl font-bold text-stone-900">Job Complete</h1>
        <p className="text-sm text-stone-400 mt-1">
          Submit photo proof to confirm completion and release payment.
        </p>
      </div>

      {/* Job summary */}
      <div className="bg-white rounded-2xl border border-stone-100 p-5 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-stone-500">Job</span>
          <span className="font-medium text-stone-900">
            {job.title as string}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-500">Client</span>
          <span className="font-medium text-stone-900">
            {client?.full_name}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-500">Payment</span>
          <span className="font-semibold text-emerald-600">
            {formatCurrency(job.budget as number)}
          </span>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-600">
          <AlertTriangle size={15} className="shrink-0" />
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-stone-100 p-5 space-y-5"
      >
        {/* Photo upload area */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Upload Photo Proof
          </label>
          <div
            onClick={() => inputRef.current?.click()}
            className={`cursor-pointer border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
              preview
                ? "border-emerald-200 bg-emerald-50"
                : "border-stone-200 hover:border-stone-300 bg-stone-50"
            }`}
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt="Proof preview"
                className="max-h-40 mx-auto rounded-lg object-cover"
              />
            ) : (
              <>
                <Upload size={24} className="mx-auto text-stone-300 mb-2" />
                <p className="text-sm text-stone-400">
                  Click to choose a photo
                </p>
                <p className="text-xs text-stone-300 mt-1">
                  JPG, PNG up to 5 MB
                </p>
              </>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          {file && (
            <p className="text-xs text-stone-400 mt-1 truncate">{file.name}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {loading && (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {loading ? "Submitting…" : "Submit & Get Paid"}
        </button>
      </form>
    </div>
  );
}
