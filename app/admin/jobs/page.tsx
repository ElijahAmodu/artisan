import { createClient } from "@/lib/supabase/server";
import { formatCurrency, timeAgo, getStatusMeta } from "@/lib/utils";

// Read-only overview of every job on the platform for admin monitoring.
export default async function AdminJobsPage() {
  const supabase = await createClient();

  const { data: jobs } = await supabase
    .from("jobs")
    .select(
      `
      *,
      client:profiles!jobs_client_id_fkey(full_name),
      artisan:profiles!jobs_artisan_id_fkey(full_name)
    `,
    )
    .order("created_at", { ascending: false })
    .limit(100);

  const allJobs = jobs ?? [];

  return (
    <div className="max-w-4xl mx-auto space-y-5 fade-up">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-stone-900">All Jobs</h1>
        <span className="text-sm text-stone-400">{allJobs.length} shown</span>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="hidden md:grid grid-cols-[1fr_1fr_1fr_100px_80px] gap-4 px-5 py-3 border-b border-stone-100 text-xs font-semibold text-stone-400 uppercase tracking-wide">
          <span>Job</span>
          <span>Client</span>
          <span>Artisan</span>
          <span>Budget</span>
          <span>Status</span>
        </div>

        {allJobs.length === 0 && (
          <p className="p-8 text-center text-stone-400 text-sm">
            No jobs found.
          </p>
        )}

        {allJobs.map((job, i) => {
          const { label, color } = getStatusMeta(job.status);
          const client = job.client as Record<string, string>;
          const artisan = job.artisan as Record<string, string>;

          return (
            <div
              key={job.id}
              className={`px-5 py-4 ${i < allJobs.length - 1 ? "border-b border-stone-50" : ""}`}
            >
              {/* Mobile layout */}
              <div className="md:hidden space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-stone-900 text-sm truncate pr-3">
                    {job.title}
                  </p>
                  <span
                    className={`shrink-0 text-xs px-2 py-0.5 rounded-full border ${color}`}
                  >
                    {label}
                  </span>
                </div>
                <p className="text-xs text-stone-400">
                  {client?.full_name} → {artisan?.full_name} &middot;{" "}
                  {formatCurrency(job.budget)} &middot;{" "}
                  {timeAgo(job.created_at)}
                </p>
              </div>

              {/* Desktop table row */}
              <div className="hidden md:grid grid-cols-[1fr_1fr_1fr_100px_80px] gap-4 items-center">
                <div className="min-w-0">
                  <p className="font-medium text-stone-900 text-sm truncate">
                    {job.title}
                  </p>
                  <p className="text-xs text-stone-400">
                    {timeAgo(job.created_at)}
                  </p>
                </div>
                <p className="text-sm text-stone-600 truncate">
                  {client?.full_name}
                </p>
                <p className="text-sm text-stone-600 truncate">
                  {artisan?.full_name}
                </p>
                <p className="text-sm font-semibold text-stone-900">
                  {formatCurrency(job.budget)}
                </p>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full border inline-flex items-center justify-center ${color}`}
                >
                  {label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
