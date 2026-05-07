// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import {
//   ToggleLeft,
//   ToggleRight,
//   AlertTriangle,
//   CheckCircle,
//   MessageSquare,
//   Flag,
// } from "lucide-react";
// import { createClient } from "@/lib/supabase/client";
// import { formatCurrency, timeAgo } from "@/lib/utils";

// interface Props {
//   artisanProfile: Record<string, unknown> | null;
//   profile: { full_name: string; email: string } | null;
//   pendingJobs: Record<string, unknown>[];
//   activeJobs: Record<string, unknown>[];
//   userId: string;
// }

// export default function ArtisanDashboardClient({
//   artisanProfile,
//   profile,
//   pendingJobs,
//   activeJobs,
//   userId,
// }: Props) {
//   const router = useRouter();
//   const supabase = createClient();

//   const [available, setAvailable] = useState<boolean>(
//     (artisanProfile?.is_available as boolean) ?? true,
//   );
//   const [toggling, setToggling] = useState(false);
//   const [actionId, setActionId] = useState<string | null>(null);
//   const [toast, setToast] = useState<{
//     msg: string;
//     type: "ok" | "err";
//   } | null>(null);

//   // Shows a temporary toast notification then clears it after 3 s.
//   function showToast(msg: string, type: "ok" | "err") {
//     setToast({ msg, type });
//     setTimeout(() => setToast(null), 3000);
//   }

//   // Toggles the artisan's availability flag in artisan_profiles.
//   async function toggleAvailability() {
//     setToggling(true);
//     const next = !available;
//     const { error } = await supabase
//       .from("artisan_profiles")
//       .update({ is_available: next })
//       .eq("user_id", userId);

//     if (!error) {
//       setAvailable(next);
//       showToast(`Status set to ${next ? "Available" : "Busy"}`, "ok");
//     } else {
//       showToast("Failed to update status", "err");
//     }
//     setToggling(false);
//   }

//   // Accepts or declines a job request and updates the job row status.
//   async function respondToJob(jobId: string, accept: boolean) {
//     setActionId(jobId);
//     const newStatus = accept ? "accepted" : "declined";

//     const { error } = await supabase
//       .from("jobs")
//       .update({ status: newStatus })
//       .eq("id", jobId)
//       .eq("artisan_id", userId); // extra guard: can only update own jobs

//     if (error) {
//       showToast("Action failed. Please try again.", "err");
//     } else {
//       showToast(
//         accept ? "Job accepted!" : "Job declined.",
//         accept ? "ok" : "err",
//       );
//       router.refresh(); // re-fetch server data to update the list
//     }
//     setActionId(null);
//   }

//   const isApproved = artisanProfile?.is_approved as boolean;

//   return (
//     <div className="max-w-2xl mx-auto space-y-5 fade-up">
//       {/* Approval pending banner */}
//       {!isApproved && (
//         <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
//           <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-500" />
//           <span>
//             Your profile is pending admin approval. You can receive jobs once
//             approved.
//           </span>
//         </div>
//       )}

//       {/* Toast */}
//       {toast && (
//         <div
//           className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl text-sm text-white shadow-lg fade-up flex items-center gap-2 ${toast.type === "ok" ? "bg-emerald-600" : "bg-rose-600"}`}
//         >
//           {toast.type === "ok" ? (
//             <CheckCircle size={15} />
//           ) : (
//             <AlertTriangle size={15} />
//           )}
//           {toast.msg}
//         </div>
//       )}

//       {/* Profile header card */}
//       <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
//         <div className="flex items-center justify-between flex-wrap gap-3">
//           <div>
//             <h1 className="text-lg font-bold text-stone-900">
//               {profile?.full_name}
//             </h1>
//             <span
//               className={`inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
//                 available
//                   ? "bg-emerald-50 text-emerald-700 border-emerald-200"
//                   : "bg-rose-50 text-rose-700 border-rose-200"
//               }`}
//             >
//               <span
//                 className={`w-1.5 h-1.5 rounded-full ${available ? "bg-emerald-500 pulse" : "bg-rose-400"}`}
//               />
//               {available ? "AVAILABLE" : "BUSY"}
//             </span>
//           </div>

//           {/* Availability toggle */}
//           <button
//             onClick={toggleAvailability}
//             disabled={toggling}
//             className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-xl text-sm font-medium text-stone-700 transition-colors disabled:opacity-50"
//           >
//             {available ? (
//               <ToggleRight size={18} className="text-emerald-500" />
//             ) : (
//               <ToggleLeft size={18} className="text-stone-400" />
//             )}
//             Toggle Status
//           </button>
//         </div>

//         {/* If artisan toggled to busy, show status bar */}
//         {!available && (
//           <div className="mt-3 px-3 py-2 bg-stone-900 text-white text-xs font-medium rounded-lg text-center">
//             Status: Busy
//           </div>
//         )}
//       </div>

//       {/* Active jobs */}
//       {activeJobs.length > 0 && (
//         <div className="space-y-3">
//           <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wide px-1">
//             Active Jobs
//           </h2>
//           {activeJobs.map((job) => {
//             const client = job.client as Record<string, string>;
//             return (
//               <div
//                 key={job.id as string}
//                 className="bg-white rounded-2xl border border-sky-100 shadow-sm p-5"
//               >
//                 <div className="flex items-start justify-between gap-3 mb-3">
//                   <div>
//                     <p className="font-semibold text-stone-900">
//                       {job.title as string}
//                     </p>
//                     <p className="text-xs text-stone-500 mt-0.5">
//                       Client: {client?.full_name}
//                     </p>
//                   </div>
//                   <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 whitespace-nowrap">
//                     In Progress
//                   </span>
//                 </div>
//                 <p className="text-sm text-stone-500 mb-4">
//                   {job.description as string}
//                 </p>
//                 <div className="flex gap-2 flex-wrap">
//                   <a
//                     href={`/artisan/jobs/${job.id as string}/chat`}
//                     className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white text-sm rounded-xl hover:bg-stone-800 transition-colors"
//                   >
//                     <MessageSquare size={14} /> Open Chat
//                   </a>
//                   <a
//                     href={`/artisan/jobs/${job.id as string}/complete`}
//                     className="flex items-center gap-1.5 px-4 py-2 border border-stone-200 text-stone-700 text-sm rounded-xl hover:bg-stone-50 transition-colors"
//                   >
//                     <Flag size={14} /> Mark Complete
//                   </a>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}

//       {/* Pending job requests */}
//       <div className="space-y-3">
//         <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wide px-1">
//           New Requests {pendingJobs.length > 0 && `(${pendingJobs.length})`}
//         </h2>

//         {pendingJobs.length === 0 && (
//           <div className="bg-white rounded-2xl border border-stone-100 p-8 text-center text-stone-400 text-sm">
//             No pending job requests right now.
//           </div>
//         )}

//         {pendingJobs.map((job) => {
//           const client = job.client as Record<string, string>;
//           const isActing = actionId === (job.id as string);
//           return (
//             <div
//               key={job.id as string}
//               className="bg-white rounded-2xl border border-amber-100 shadow-sm p-5 fade-up"
//             >
//               {/* Request header */}
//               <div className="flex items-center gap-2 mb-3">
//                 <AlertTriangle size={15} className="text-amber-500" />
//                 <span className="text-sm font-semibold text-stone-900">
//                   New Request
//                 </span>
//                 <span className="ml-auto text-xs text-stone-400">
//                   {timeAgo(job.created_at as string)}
//                 </span>
//               </div>

//               <div className="space-y-1 mb-4 text-sm">
//                 <p>
//                   <span className="font-medium text-stone-700">Client:</span>{" "}
//                   <span className="text-stone-600">{client?.full_name}</span>
//                 </p>
//                 <p>
//                   <span className="font-medium text-stone-700">Issue:</span>{" "}
//                   <span className="text-stone-600">{job.title as string}</span>
//                 </p>
//                 <p>
//                   <span className="font-medium text-stone-700">Budget:</span>{" "}
//                   <span className="text-stone-600">
//                     {formatCurrency(job.budget as number)}
//                   </span>
//                 </p>
//                 {typeof job.description === "string" && job.description && (
//                   <p className="text-stone-500 text-xs mt-1 leading-relaxed">
//                     {job.description}
//                   </p>
//                 )}
//               </div>

//               {/* Accept / Decline actions */}
//               <div className="flex gap-2">
//                 <button
//                   disabled={isActing}
//                   onClick={() => respondToJob(job.id as string, false)}
//                   className="flex-1 h-9 rounded-xl bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 disabled:opacity-50 transition-colors"
//                 >
//                   {isActing ? "…" : "Decline"}
//                 </button>
//                 <button
//                   disabled={isActing}
//                   onClick={() => respondToJob(job.id as string, true)}
//                   className="flex-1 h-9 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 disabled:opacity-50 transition-colors"
//                 >
//                   {isActing ? "…" : "Accept Job"}
//                 </button>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

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
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, timeAgo } from "@/lib/utils";

interface Props {
  artisanProfile: Record<string, unknown> | null;
  profile: { full_name: string; email: string } | null;
  pendingJobs: Record<string, unknown>[];
  activeJobs: Record<string, unknown>[];
  userId: string;
}

export default function ArtisanDashboardClient({
  artisanProfile,
  profile,
  pendingJobs,
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
  async function respondToJob(jobId: string, accept: boolean) {
    setActionId(jobId);
    const newStatus = accept ? "accepted" : "declined";

    const { error } = await supabase
      .from("jobs")
      .update({ status: newStatus })
      .eq("id", jobId)
      .eq("artisan_id", userId); // extra guard: can only update own jobs

    if (error) {
      showToast("Action failed. Please try again.", "err");
    } else {
      showToast(
        accept ? "Job accepted!" : "Job declined.",
        accept ? "ok" : "err",
      );
      router.refresh(); // re-fetch server data to update the list
    }
    setActionId(null);
  }

  const isApproved = artisanProfile?.is_approved as boolean;

  return (
    <div className="max-w-2xl mx-auto space-y-5 fade-up">
      {/* Approval pending banner */}
      {!isApproved && (
        <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-500" />
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
          {activeJobs.map((job) => {
            const client = job.client as Record<string, string>;
            return (
              <div
                key={job.id as string}
                className="bg-white rounded-2xl border border-sky-100 shadow-sm p-5"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-semibold text-stone-900">
                      {job.title as string}
                    </p>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Client: {client?.full_name}
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 whitespace-nowrap">
                    In Progress
                  </span>
                </div>
                <p className="text-sm text-stone-500 mb-4">
                  {job.description as string}
                </p>
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
              </div>
            );
          })}
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
                  <span className="font-medium text-stone-700">Client:</span>{" "}
                  <span className="text-stone-600">{client?.full_name}</span>
                </p>
                <p>
                  <span className="font-medium text-stone-700">Issue:</span>{" "}
                  <span className="text-stone-600">{job.title as string}</span>
                </p>
                <p>
                  <span className="font-medium text-stone-700">Budget:</span>{" "}
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
              <div className="flex gap-2">
                <button
                  disabled={isActing}
                  onClick={() => respondToJob(job.id as string, false)}
                  className="flex-1 h-9 rounded-xl bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 disabled:opacity-50 transition-colors"
                >
                  {isActing ? "…" : "Decline"}
                </button>
                <button
                  disabled={isActing}
                  onClick={() => respondToJob(job.id as string, true)}
                  className="flex-1 h-9 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                >
                  {isActing ? "…" : "Accept Job"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
