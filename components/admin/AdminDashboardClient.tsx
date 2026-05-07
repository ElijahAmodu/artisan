// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import {
//   Users,
//   Briefcase,
//   DollarSign,
//   Clock,
//   ShieldAlert,
//   CheckCircle,
//   XCircle,
//   AlertTriangle,
// } from "lucide-react";
// import { createClient } from "@/lib/supabase/client";
// import { formatCurrency, timeAgo } from "@/lib/utils";

// interface Stats {
//   totalJobs: number;
//   totalArtisans: number;
//   totalClients: number;
//   totalRevenue: number;
//   pendingApprovals: number;
//   activeDisputes: number;
// }

// interface Props {
//   stats: Stats;
//   pendingArtisans: Record<string, unknown>[];
//   disputedJobs: Record<string, unknown>[];
// }

// export default function AdminDashboardClient({
//   stats,
//   pendingArtisans,
//   disputedJobs,
// }: Props) {
//   const router = useRouter();
//   const supabase = createClient();

//   const [actionId, setActionId] = useState<string | null>(null);
//   const [toast, setToast] = useState<{
//     msg: string;
//     type: "ok" | "err";
//   } | null>(null);

//   function showToast(msg: string, type: "ok" | "err") {
//     setToast({ msg, type });
//     setTimeout(() => setToast(null), 3500);
//   }

//   // Approves or rejects an artisan profile.
//   async function reviewArtisan(artisanId: string, approve: boolean) {
//     setActionId(artisanId);
//     const { error } = await supabase
//       .from("artisan_profiles")
//       .update({ is_approved: approve })
//       .eq("id", artisanId);

//     if (error) {
//       showToast("Action failed: " + error.message, "err");
//     } else {
//       showToast(
//         approve ? "Artisan approved and live." : "Artisan rejected.",
//         approve ? "ok" : "err",
//       );
//       router.refresh();
//     }
//     setActionId(null);
//   }

//   // Resolves a dispute by refunding the client — updates job and payment status.
//   async function resolveDispute(jobId: string) {
//     setActionId(jobId);
//     const { error } = await supabase
//       .from("jobs")
//       .update({ status: "completed", payment_status: "refunded" })
//       .eq("id", jobId);

//     if (error) {
//       showToast("Resolution failed: " + error.message, "err");
//     } else {
//       showToast("Dispute resolved. Funds refunded.", "ok");
//       router.refresh();
//     }
//     setActionId(null);
//   }

//   const statCards = [
//     {
//       icon: Briefcase,
//       label: "Total Jobs",
//       value: stats.totalJobs.toLocaleString(),
//       color: "text-sky-600 bg-sky-50",
//     },
//     {
//       icon: DollarSign,
//       label: "Total Revenue",
//       value: formatCurrency(stats.totalRevenue),
//       color: "text-emerald-600 bg-emerald-50",
//     },
//     {
//       icon: Users,
//       label: "Artisans",
//       value: stats.totalArtisans.toLocaleString(),
//       color: "text-amber-600 bg-amber-50",
//     },
//     {
//       icon: Users,
//       label: "Clients",
//       value: stats.totalClients.toLocaleString(),
//       color: "text-stone-600 bg-stone-100",
//     },
//     {
//       icon: Clock,
//       label: "Pending Approvals",
//       value: stats.pendingApprovals.toLocaleString(),
//       color: "text-orange-600 bg-orange-50",
//     },
//     {
//       icon: ShieldAlert,
//       label: "Active Disputes",
//       value: stats.activeDisputes.toLocaleString(),
//       color: "text-rose-600 bg-rose-50",
//     },
//   ];

//   return (
//     <div className="max-w-4xl mx-auto space-y-8 fade-up">
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

//       <div>
//         <h1 className="text-xl font-bold text-stone-900">Admin Dashboard</h1>
//         <p className="text-sm text-stone-400 mt-1">
//           Platform overview and moderation tools.
//         </p>
//       </div>

//       {/* Stats grid */}
//       <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
//         {statCards.map(({ icon: Icon, label, value, color }) => (
//           <div
//             key={label}
//             className="bg-white rounded-2xl border border-stone-100 p-4 shadow-sm"
//           >
//             <div
//               className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${color}`}
//             >
//               <Icon size={16} />
//             </div>
//             <p className="text-2xl font-bold text-stone-900">{value}</p>
//             <p className="text-xs text-stone-400 mt-0.5">{label}</p>
//           </div>
//         ))}
//       </div>

//       {/* Dispute resolution section */}
//       <section className="space-y-3">
//         <h2 className="font-semibold text-stone-900">Dispute Resolution</h2>

//         {disputedJobs.length === 0 && (
//           <div className="bg-white rounded-2xl border border-stone-100 p-6 text-center">
//             <p className="text-sm text-stone-400">No active disputes.</p>
//           </div>
//         )}

//         {disputedJobs.map((job) => {
//           const client = job.client as Record<string, string>;
//           const artisan = job.artisan as Record<string, string>;

//           return (
//             <div
//               key={job.id as string}
//               className="bg-white rounded-2xl border border-rose-100 shadow-sm p-5"
//             >
//               <div className="flex items-start justify-between gap-3 mb-3">
//                 <div>
//                   <p className="font-semibold text-stone-900">
//                     {job.title as string}
//                   </p>
//                   <p className="text-xs text-stone-400 mt-0.5">
//                     Client: {client?.full_name} &middot; Artisan:{" "}
//                     {artisan?.full_name}
//                   </p>
//                   <p className="text-xs text-stone-400">
//                     {timeAgo(job.updated_at as string)}
//                   </p>
//                 </div>
//                 <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-medium rounded-full whitespace-nowrap">
//                   Disputed
//                 </span>
//               </div>
//               <div className="flex items-center justify-between">
//                 <span className="text-sm font-semibold text-stone-900">
//                   {formatCurrency(job.budget as number)}
//                 </span>
//                 <button
//                   disabled={actionId === (job.id as string)}
//                   onClick={() => resolveDispute(job.id as string)}
//                   className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 text-white text-sm font-medium rounded-xl hover:bg-rose-700 disabled:opacity-50 transition-colors"
//                 >
//                   {actionId === (job.id as string) ? (
//                     <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                   ) : (
//                     <XCircle size={14} />
//                   )}
//                   Resolve Dispute (Refund Client)
//                 </button>
//               </div>
//             </div>
//           );
//         })}
//       </section>

//       {/* Pending artisan approvals */}
//       <section className="space-y-3">
//         <h2 className="font-semibold text-stone-900">
//           Pending Artisan Approvals
//           {pendingArtisans.length > 0 && (
//             <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
//               {pendingArtisans.length}
//             </span>
//           )}
//         </h2>

//         {pendingArtisans.length === 0 && (
//           <div className="bg-white rounded-2xl border border-stone-100 p-6 text-center">
//             <p className="text-sm text-stone-400">
//               All artisans have been reviewed.
//             </p>
//           </div>
//         )}

//         {pendingArtisans.map((ap) => {
//           const profile = ap.profiles as Record<string, string>;
//           const skills = (ap.skills as string[] | null) ?? [];

//           return (
//             <div
//               key={ap.id as string}
//               className="bg-white rounded-2xl border border-amber-100 shadow-sm p-5"
//             >
//               <div className="flex items-start justify-between gap-3 mb-3">
//                 <div className="flex items-center gap-3">
//                   <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-sm font-bold text-amber-700">
//                     {profile?.full_name?.[0] ?? "?"}
//                   </div>
//                   <div>
//                     <p className="font-semibold text-stone-900">
//                       {profile?.full_name}
//                     </p>
//                     <p className="text-xs text-stone-400">{profile?.email}</p>
//                   </div>
//                 </div>
//                 <span className="text-xs text-stone-400">
//                   {timeAgo(ap.created_at as string)}
//                 </span>
//               </div>

//               {/* Skills */}
//               <div className="flex flex-wrap gap-1.5 mb-3">
//                 {skills.map((skill) => (
//                   <span
//                     key={skill}
//                     className="px-2 py-0.5 bg-stone-100 text-stone-600 text-xs rounded-full"
//                   >
//                     {skill}
//                   </span>
//                 ))}
//               </div>

//               {typeof ap.bio === "string" && ap.bio && (
//                 <p className="text-sm text-stone-500 mb-3 line-clamp-2">
//                   {ap.bio}
//                 </p>
//               )}

//               {typeof ap.location === "string" && ap.location && (
//                 <p className="text-xs text-stone-400 mb-3">{ap.location}</p>
//               )}

//               <div className="flex gap-2">
//                 <button
//                   disabled={actionId === (ap.id as string)}
//                   onClick={() => reviewArtisan(ap.id as string, false)}
//                   className="flex-1 h-9 rounded-xl border border-rose-200 text-rose-600 text-sm font-medium hover:bg-rose-50 disabled:opacity-50 transition-colors"
//                 >
//                   Reject
//                 </button>
//                 <button
//                   disabled={actionId === (ap.id as string)}
//                   onClick={() => reviewArtisan(ap.id as string, true)}
//                   className="flex-1 h-9 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
//                 >
//                   {actionId === (ap.id as string) ? (
//                     <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                   ) : (
//                     <CheckCircle size={14} />
//                   )}
//                   Approve
//                 </button>
//               </div>
//             </div>
//           );
//         })}
//       </section>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Briefcase,
  DollarSign,
  Clock,
  ShieldAlert,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, timeAgo } from "@/lib/utils";

interface Stats {
  totalJobs: number;
  totalArtisans: number;
  totalClients: number;
  totalRevenue: number;
  pendingApprovals: number;
  activeDisputes: number;
}

interface Props {
  stats: Stats;
  pendingArtisans: Record<string, unknown>[];
  disputedJobs: Record<string, unknown>[];
}

export default function AdminDashboardClient({
  stats,
  pendingArtisans,
  disputedJobs,
}: Props) {
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

  // Approves or rejects an artisan profile.
  async function reviewArtisan(artisanId: string, approve: boolean) {
    setActionId(artisanId);
    const { error } = await supabase
      .from("artisan_profiles")
      .update({ is_approved: approve })
      .eq("id", artisanId);

    if (error) {
      showToast("Action failed: " + error.message, "err");
    } else {
      showToast(
        approve ? "Artisan approved and live." : "Artisan rejected.",
        approve ? "ok" : "err",
      );
      router.refresh();
    }
    setActionId(null);
  }

  // Resolves a dispute by refunding the client — updates job and payment status.
  async function resolveDispute(jobId: string) {
    setActionId(jobId);
    const { error } = await supabase
      .from("jobs")
      .update({ status: "completed", payment_status: "refunded" })
      .eq("id", jobId);

    if (error) {
      showToast("Resolution failed: " + error.message, "err");
    } else {
      showToast("Dispute resolved. Funds refunded.", "ok");
      router.refresh();
    }
    setActionId(null);
  }

  const statCards = [
    {
      icon: Briefcase,
      label: "Total Jobs",
      value: stats.totalJobs.toLocaleString(),
      color: "text-sky-600 bg-sky-50",
    },
    {
      icon: DollarSign,
      label: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      icon: Users,
      label: "Artisans",
      value: stats.totalArtisans.toLocaleString(),
      color: "text-amber-600 bg-amber-50",
    },
    {
      icon: Users,
      label: "Clients",
      value: stats.totalClients.toLocaleString(),
      color: "text-stone-600 bg-stone-100",
    },
    {
      icon: Clock,
      label: "Pending Approvals",
      value: stats.pendingApprovals.toLocaleString(),
      color: "text-orange-600 bg-orange-50",
    },
    {
      icon: ShieldAlert,
      label: "Active Disputes",
      value: stats.activeDisputes.toLocaleString(),
      color: "text-rose-600 bg-rose-50",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 fade-up">
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

      <div>
        <h1 className="text-xl font-bold text-stone-900">Admin Dashboard</h1>
        <p className="text-sm text-stone-400 mt-1">
          Platform overview and moderation tools.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {statCards.map(({ icon: Icon, label, value, color }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-stone-100 p-4 shadow-sm"
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${color}`}
            >
              <Icon size={16} />
            </div>
            <p className="text-2xl font-bold text-stone-900">{value}</p>
            <p className="text-xs text-stone-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Dispute resolution section */}
      <section className="space-y-3">
        <h2 className="font-semibold text-stone-900">Dispute Resolution</h2>

        {disputedJobs.length === 0 && (
          <div className="bg-white rounded-2xl border border-stone-100 p-6 text-center">
            <p className="text-sm text-stone-400">No active disputes.</p>
          </div>
        )}

        {disputedJobs.map((job) => {
          const client = job.client as Record<string, string>;
          const artisan = job.artisan as Record<string, string>;

          return (
            <div
              key={job.id as string}
              className="bg-white rounded-2xl border border-rose-100 shadow-sm p-5"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-semibold text-stone-900">
                    {job.title as string}
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Client: {client?.full_name} &middot; Artisan:{" "}
                    {artisan?.full_name}
                  </p>
                  <p className="text-xs text-stone-400">
                    {timeAgo(job.updated_at as string)}
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-medium rounded-full whitespace-nowrap">
                  Disputed
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-stone-900">
                  {formatCurrency(job.budget as number)}
                </span>
                <button
                  disabled={actionId === (job.id as string)}
                  onClick={() => resolveDispute(job.id as string)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 text-white text-sm font-medium rounded-xl hover:bg-rose-700 disabled:opacity-50 transition-colors"
                >
                  {actionId === (job.id as string) ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <XCircle size={14} />
                  )}
                  Resolve Dispute (Refund Client)
                </button>
              </div>
            </div>
          );
        })}
      </section>

      {/* Pending artisan approvals */}
      <section className="space-y-3">
        <h2 className="font-semibold text-stone-900">
          Pending Artisan Approvals
          {pendingArtisans.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
              {pendingArtisans.length}
            </span>
          )}
        </h2>

        {pendingArtisans.length === 0 && (
          <div className="bg-white rounded-2xl border border-stone-100 p-6 text-center">
            <p className="text-sm text-stone-400">
              All artisans have been reviewed.
            </p>
          </div>
        )}

        {pendingArtisans.map((ap) => {
          const profile = ap.profiles as Record<string, string>;
          const skills = (ap.skills as string[] | null) ?? [];

          return (
            <div
              key={ap.id as string}
              className="bg-white rounded-2xl border border-amber-100 shadow-sm p-5"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-sm font-bold text-amber-700">
                    {profile?.full_name?.[0] ?? "?"}
                  </div>
                  <div>
                    <p className="font-semibold text-stone-900">
                      {profile?.full_name}
                    </p>
                    <p className="text-xs text-stone-400">{profile?.email}</p>
                  </div>
                </div>
                <span className="text-xs text-stone-400">
                  {timeAgo(ap.created_at as string)}
                </span>
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-0.5 bg-stone-100 text-stone-600 text-xs rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {typeof ap.bio === "string" && ap.bio && (
                <p className="text-sm text-stone-500 mb-3 line-clamp-2">
                  {ap.bio}
                </p>
              )}

              {typeof ap.location === "string" && ap.location && (
                <p className="text-xs text-stone-400 mb-3">{ap.location}</p>
              )}

              <div className="flex gap-2">
                <button
                  disabled={actionId === (ap.id as string)}
                  onClick={() => reviewArtisan(ap.id as string, false)}
                  className="flex-1 h-9 rounded-xl border border-rose-200 text-rose-600 text-sm font-medium hover:bg-rose-50 disabled:opacity-50 transition-colors"
                >
                  Reject
                </button>
                <button
                  disabled={actionId === (ap.id as string)}
                  onClick={() => reviewArtisan(ap.id as string, true)}
                  className="flex-1 h-9 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  {actionId === (ap.id as string) ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CheckCircle size={14} />
                  )}
                  Approve
                </button>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
