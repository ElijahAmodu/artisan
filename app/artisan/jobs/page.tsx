import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatCurrency, timeAgo, getStatusMeta } from "@/lib/utils";
import { Briefcase, MessageSquare, Flag } from "lucide-react";

// Displays the full job history for the logged-in artisan, grouped by status.
export default async function ArtisanJobsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: jobs } = await supabase
    .from("jobs")
    .select("*, client:profiles!jobs_client_id_fkey(full_name, email)")
    .eq("artisan_id", user!.id)
    .order("created_at", { ascending: false });

  const allJobs = jobs ?? [];

  return (
    <div className="max-w-7xl  space-y-5 fade-up">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-stone-900">My Jobs</h1>
        <span className="text-sm text-stone-400">{allJobs.length} total</span>
      </div>

      {allJobs.length === 0 && (
        <div className="bg-white rounded-2xl border border-stone-100 p-12 text-center">
          <Briefcase size={32} className="mx-auto text-stone-200 mb-3" />
          <p className="text-stone-400 text-sm">
            No jobs yet. They will appear here once clients hire you.
          </p>
        </div>
      )}

      {allJobs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {allJobs.map((job) => {
            const { label, color } = getStatusMeta(job.status);
            const client = job.client as Record<string, string>;
            const isActive =
              job.status === "accepted" || job.status === "in_progress";

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
                      {client?.full_name} &middot; {timeAgo(job.created_at)}
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

                  {/* Contextual action buttons based on current job status */}
                  <div className="flex gap-2">
                    {isActive && (
                      <>
                        <Link
                          href={`/artisan/jobs/${job.id}/chat`}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 text-white text-xs rounded-lg hover:bg-stone-800 transition-colors"
                        >
                          <MessageSquare size={12} /> Chat
                        </Link>
                        <Link
                          href={`/artisan/jobs/${job.id}/complete`}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-stone-200 text-stone-600 text-xs rounded-lg hover:bg-stone-50 transition-colors"
                        >
                          <Flag size={12} /> Complete
                        </Link>
                      </>
                    )}
                    {job.status === "completed" && (
                      <span className="text-xs text-stone-400">
                        Paid {formatCurrency(job.budget)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
