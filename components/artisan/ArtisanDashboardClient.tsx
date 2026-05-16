"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  Flag,
  ShieldCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, timeAgo } from "@/lib/utils";
import NegotiateModal from "./Negotiation";

interface Props {
  artisanProfile: Record<string, unknown> | null;
  profile: { full_name: string; email: string } | null;
  pendingJobs: Record<string, unknown>[];
  negotiatingJobs: Record<string, unknown>[];
  offersByJob: Record<string, unknown>;
  activeJobs: Record<string, unknown>[];
  userId: string;
}

export default function ArtisanDashboardClient({
  artisanProfile,
  profile,
  pendingJobs,
  negotiatingJobs,
  offersByJob,
  activeJobs,
  userId,
}: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [available, setAvailable] = useState<boolean>(
    (artisanProfile?.is_available as boolean) ?? true,
  );
  const [toggling, setToggling] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    msg: string;
    type: "ok" | "err";
  } | null>(null);

  const [negotiatingJob, setNegotiatingJob] = useState<Record<
    string,
    unknown
  > | null>(null);

  function openNegotiateModal(job: Record<string, unknown>) {
    setNegotiatingJob(job);
  }

  // Shows a temporary toast notification then clears it after 3 s.
  function showToast(msg: string, type: "ok" | "err") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  // Toggles the artisan's availability flag in artisan_profiles.
  async function toggleAvailability() {
    setToggling(true);
    const next = !available;
    const { error } = await supabase
      .from("artisan_profiles")
      .update({ is_available: next })
      .eq("user_id", userId);

    if (!error) {
      setAvailable(next);
      showToast(`Status set to ${next ? "Available" : "Busy"}`, "ok");
    } else {
      showToast("Failed to update status", "err");
    }
    setToggling(false);
  }

  // Accepts or declines a job request and updates the job row status.
  // async function respondToJob(jobId: string, accept: boolean) {
  //   setActionId(jobId);
  //   const newStatus = accept ? "accepted" : "declined";

  //   const { error } = await supabase
  //     .from("jobs")
  //     .update({ status: newStatus })
  //     .eq("id", jobId)
  //     .eq("artisan_id", userId); // extra guard: can only update own jobs

  //   if (error) {
  //     showToast("Action failed. Please try again.", "err");
  //   } else {
  //     showToast(
  //       accept ? "Job accepted!" : "Job declined.",
  //       accept ? "ok" : "err",
  //     );
  //     router.refresh(); // re-fetch server data to update the list
  //   }
  //   setActionId(null);
  // }

  async function respondToJob(jobId: string, accept: boolean) {
    setActionId(jobId);
    const newStatus = accept ? "accepted" : "declined";

    // If accepting a negotiating job, use the negotiated amount
    const negotiatingJob = negotiatingJobs.find((j) => j.id === jobId);
    const offer = negotiatingJob
      ? (offersByJob[jobId] as { id: string; amount: number } | undefined)
      : undefined;

    // const updatePayload: Record<string, unknown> = { status: newStatus };
    const updatePayload: Record<string, unknown> = {
      status: accept ? "awaiting_payment" : "declined",
    };
    if (accept && offer) {
      updatePayload.budget = offer.amount;
      // Mark the negotiation as accepted
      await supabase
        .from("negotiations")
        .update({ status: "accepted" })
        .eq("id", offer.id);
    }

    const { error } = await supabase
      .from("jobs")
      .update(updatePayload)
      .eq("id", jobId)
      .eq("artisan_id", userId);

    if (error) {
      showToast("Action failed. Please try again.", "err");
    } else {
      showToast(
        accept ? "Job accepted!" : "Job declined.",
        accept ? "ok" : "err",
      );
      router.refresh();
    }
    setActionId(null);
  }

  const isApproved = artisanProfile?.is_approved as boolean;

  return (
    <>
      <div className="max-w-7xl mx-auto space-y-5 fade-up">
        {/* Approval pending banner */}
        {!isApproved && (
          <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
            <AlertTriangle
              size={16}
              className="mt-0.5 shrink-0 text-amber-500"
            />
            <span>
              Your profile is pending admin approval. You can receive jobs once
              approved.
            </span>
          </div>
        )}

        {/* Toast */}
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

        {/* Profile header card */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-lg font-bold text-stone-900">
                {profile?.full_name}
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  available
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-rose-50 text-rose-700 border-rose-200"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${available ? "bg-emerald-500 pulse" : "bg-rose-400"}`}
                />
                {available ? "AVAILABLE" : "BUSY"}
              </span>
            </div>

            {/* Availability toggle */}
            <button
              onClick={toggleAvailability}
              disabled={toggling}
              className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-xl text-sm font-medium text-stone-700 transition-colors disabled:opacity-50"
            >
              {available ? (
                <ToggleRight size={18} className="text-emerald-500" />
              ) : (
                <ToggleLeft size={18} className="text-stone-400" />
              )}
              Toggle Status
            </button>
          </div>

          {/* If artisan toggled to busy, show status bar */}
          {!available && (
            <div className="mt-3 px-3 py-2 bg-stone-900 text-white text-xs font-medium rounded-lg text-center">
              Status: Busy
            </div>
          )}
        </div>

        {/* Active jobs */}
        {activeJobs.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wide px-1">
              Active Jobs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {activeJobs.map((job) => {
                const client = job.client as Record<string, string>;
                const isAwaitingPayment = job.status === "awaiting_payment";

                return (
                  <div
                    key={job.id as string}
                    className={`bg-white rounded-2xl shadow-sm p-5 border ${
                      isAwaitingPayment ? "border-orange-100" : "border-sky-100"
                    }`}
                  >
                    {/* Awaiting payment banner */}
                    {isAwaitingPayment && (
                      <div className="mb-3 px-3 py-2 bg-orange-50 border border-orange-200 rounded-xl text-xs text-orange-700 flex items-center gap-2">
                        <ShieldCheck size={13} className="shrink-0" />
                        Waiting for client to complete escrow payment before
                        work begins.
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="font-semibold text-stone-900">
                          {job.title as string}
                        </p>
                        <p className="text-xs text-stone-500 mt-0.5">
                          Client: {client?.full_name}
                        </p>
                      </div>
                      {/* ✅ Badge reflects actual status */}
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap border ${
                          isAwaitingPayment
                            ? "bg-orange-50 text-orange-700 border-orange-200"
                            : "bg-sky-50 text-sky-700 border-sky-200"
                        }`}
                      >
                        {isAwaitingPayment ? "Awaiting Payment" : "In Progress"}
                      </span>
                    </div>

                    <p className="text-sm text-stone-500 mb-4">
                      {job.description as string}
                    </p>

                    {/* ✅ Actions only shown when work has actually started */}
                    {!isAwaitingPayment && (
                      <div className="flex gap-2 flex-wrap">
                        <a
                          href={`/artisan/jobs/${job.id as string}/chat`}
                          className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white text-sm rounded-xl hover:bg-stone-800 transition-colors"
                        >
                          <MessageSquare size={14} /> Open Chat
                        </a>
                        <a
                          href={`/artisan/jobs/${job.id as string}/complete`}
                          className="flex items-center gap-1.5 px-4 py-2 border border-stone-200 text-stone-700 text-sm rounded-xl hover:bg-stone-50 transition-colors"
                        >
                          <Flag size={14} /> Mark Complete
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Negotiating jobs */}
        {negotiatingJobs.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wide px-1">
              Awaiting Response
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {negotiatingJobs.map((job) => {
                const offer = offersByJob[job.id as string] as
                  | {
                      id: string;
                      amount: number;
                      note: string | null;
                      proposed_by: string;
                    }
                  | undefined;

                const isMyOffer = offer?.proposed_by === userId;

                return (
                  <div
                    key={job.id as string}
                    className="bg-white rounded-2xl border border-violet-100 shadow-sm p-5 space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-violet-600 uppercase tracking-wide">
                        Negotiating
                      </span>
                      <span className="ml-auto text-xs text-stone-400">
                        {timeAgo(job.created_at as string)}
                      </span>
                    </div>

                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium text-stone-700">
                          Issue:
                        </span>{" "}
                        {job.title as string}
                      </p>
                      <p>
                        <span className="font-medium text-stone-700">
                          Original budget:
                        </span>{" "}
                        {formatCurrency(job.budget as number)}
                      </p>
                      {offer && (
                        <p>
                          <span className="font-medium text-stone-700">
                            {isMyOffer ? "Your offer:" : "Client's counter:"}
                          </span>{" "}
                          <span
                            className={
                              isMyOffer
                                ? "text-stone-600"
                                : "text-violet-700 font-semibold"
                            }
                          >
                            {formatCurrency(offer.amount)}
                          </span>
                        </p>
                      )}
                      {offer?.note && (
                        <p className="text-xs text-stone-400 italic">
                          "{offer.note}"
                        </p>
                      )}
                    </div>

                    {isMyOffer ? (
                      // Artisan sent the last offer — waiting on client
                      <p className="text-xs text-stone-400 text-center py-2 bg-stone-50 rounded-xl">
                        Waiting for client to respond…
                      </p>
                    ) : (
                      // Client sent a counter — artisan needs to act
                      <div className="flex gap-2">
                        <button
                          onClick={() => respondToJob(job.id as string, false)}
                          className="h-9 px-3 rounded-xl bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 transition-colors"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => openNegotiateModal(job)}
                          className="flex-1 h-9 rounded-xl border border-violet-200 text-violet-700 bg-violet-50 text-sm font-medium hover:bg-violet-100 transition-colors"
                        >
                          Counter
                        </button>
                        {/* <button
                          onClick={() => respondToJob(job.id as string, true)}
                          className="flex-1 h-9 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors"
                        >
                          Accept{" "}
                          <span className="text-xs">
                            {offer ? formatCurrency(offer.amount) : ""}
                          </span>
                        </button> */}
                        <button
                          onClick={() => respondToJob(job.id as string, true)}
                          className="group flex flex-1 items-center justify-center gap-1 h-9 px-3 rounded-xl bg-emerald-500 text-white text-sm font-medium border border-emerald-600 hover:bg-emerald-600 transition-colors overflow-hidden"
                        >
                          <span className="shrink-0">Accept</span>

                          {offer && (
                            <span className="max-w-[90px] overflow-hidden rounded-md border border-emerald-400 bg-emerald-600/70 px-1.5 py-0.5">
                              <span className="block text-xs font-semibold whitespace-nowrap overflow-hidden text-ellipsis group-hover:overflow-visible group-hover:animate-marquee">
                                {formatCurrency(offer.amount)}
                              </span>
                            </span>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pending job requests */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wide px-1">
            New Requests {pendingJobs.length > 0 && `(${pendingJobs.length})`}
          </h2>

          {pendingJobs.length === 0 && (
            <div className="bg-white rounded-2xl border border-stone-100 p-8 text-center text-stone-400 text-sm">
              No pending job requests right now.
            </div>
          )}

          <div
            className={
              pendingJobs.length === 0
                ? "hidden"
                : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
            }
          >
            {pendingJobs.map((job) => {
              const client = job.client as Record<string, string>;
              const isActing = actionId === (job.id as string);
              return (
                <div
                  key={job.id as string}
                  className="bg-white rounded-2xl border border-amber-100 shadow-sm p-5 fade-up"
                >
                  {/* Request header */}
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle size={15} className="text-amber-500" />
                    <span className="text-sm font-semibold text-stone-900">
                      New Request
                    </span>
                    <span className="ml-auto text-xs text-stone-400">
                      {timeAgo(job.created_at as string)}
                    </span>
                  </div>
                  <div className="space-y-1 mb-4 text-sm">
                    <p>
                      <span className="font-medium text-stone-700">
                        Client:
                      </span>{" "}
                      <span className="text-stone-600">
                        {client?.full_name}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium text-stone-700">Issue:</span>{" "}
                      <span className="text-stone-600">
                        {job.title as string}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium text-stone-700">
                        Budget:
                      </span>{" "}
                      <span className="text-stone-600">
                        {formatCurrency(job.budget as number)}
                      </span>
                    </p>
                    {typeof job.description === "string" && job.description && (
                      <p className="text-stone-500 text-xs mt-1 leading-relaxed">
                        {job.description}
                      </p>
                    )}
                  </div>
                  {/* Accept / Decline actions */}
                  {/* <div className="flex gap-2">
                  <button
                    disabled={isActing}
                    onClick={() => respondToJob(job.id as string, false)}
                    className="flex-1 h-9 rounded-xl bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    {isActing ? "…" : "Decline"}
                  </button>
                  <button
                    disabled={isActing}
                    onClick={() => respondToJob(job.id as string, true)}
                    className="flex-1 h-9 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    {isActing ? "…" : "Accept Job"}
                  </button>
                </div> */}
                  {/* // In the pending job card, replace the current button row: */}
                  <div className="flex gap-2">
                    <button
                      disabled={isActing}
                      onClick={() => respondToJob(job.id as string, false)}
                      className="h-9 px-3 rounded-xl bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 disabled:opacity-50 transition-colors"
                    >
                      Decline
                    </button>
                    <button
                      disabled={isActing}
                      onClick={() => openNegotiateModal(job)}
                      className="flex-1 h-9 rounded-xl border border-stone-200 text-stone-700 text-sm font-medium hover:bg-stone-50 transition-colors"
                    >
                      Negotiate Price
                    </button>
                    <button
                      disabled={isActing}
                      onClick={() => respondToJob(job.id as string, true)}
                      className="flex-1 h-9 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                    >
                      Accept
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {negotiatingJob && (
        <NegotiateModal
          job={negotiatingJob}
          currentUserId={userId}
          onClose={() => setNegotiatingJob(null)}
          onSubmitted={() => {
            setNegotiatingJob(null);
            showToast("Counter offer sent!", "ok");
            router.refresh();
          }}
        />
      )}
    </>
  );
}
