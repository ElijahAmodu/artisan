import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatCurrency, timeAgo, getStatusMeta } from "@/lib/utils";
import { Briefcase, MessageSquare } from "lucide-react";

export default async function ClientJobsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: jobs } = await supabase
    .from("jobs")
    .select("*, artisan:profiles!jobs_artisan_id_fkey(full_name)")
    .eq("client_id", user!.id)
    .order("created_at", { ascending: false });

  const allJobs = jobs ?? [];

  return (
    <div className="max-w-7xl mx-auto space-y-5 fade-up">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-stone-900">My Jobs</h1>
        <span className="text-sm text-stone-400">{allJobs.length} total</span>
      </div>

      {allJobs.length === 0 && (
        <div className="bg-white rounded-2xl border border-stone-100 p-12 text-center">
          <Briefcase size={32} className="mx-auto text-stone-200 mb-3" />
          <p className="text-stone-400 text-sm">No jobs yet.</p>
          <Link
            href="/client/search"
            className="mt-3 inline-block text-sm text-stone-700 font-medium hover:underline"
          >
            Find a Pro →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {allJobs.map((job) => {
          const { label, color } = getStatusMeta(job.status);
          const artisan = job.artisan as Record<string, string>;
          const isActive = ["accepted", "in_progress"].includes(job.status);

          return (
            <div
              key={job.id}
              className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <p className="font-semibold text-stone-900 truncate">
                    {job.title}
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {artisan?.full_name ?? "Unassigned"} &middot;{" "}
                    {timeAgo(job.created_at)}
                  </p>
                </div>
                <span
                  className={`shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}
                >
                  {label}
                </span>
              </div>

              <p className="text-sm text-stone-500 mb-3 line-clamp-2">
                {job.description}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-stone-900">
                  {formatCurrency(job.budget)}
                </span>
                {isActive && (
                  <Link
                    href={`/client/jobs/${job.id}/chat`}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 text-white text-xs rounded-lg hover:bg-stone-800 transition-colors"
                  >
                    <MessageSquare size={12} /> Chat
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
