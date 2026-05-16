import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatCurrency, timeAgo, getStatusMeta } from "@/lib/utils";
import { Search, MessageSquare, Star } from "lucide-react";
import ReviewModal from "@/components/client/ReviewModal";
import NegotiatingJobCard from "@/components/client/NegotiatingJob";
import PaymentEscrowPrompt from "@/components/client/PaymentEscrowPrompt";

// Client dashboard: shows active jobs and job history with contextual actions.
export default async function ClientDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user!.id)
    .single();

  // Fetch all jobs created by this client, newest first.
  const { data: jobs } = await supabase
    .from("jobs")
    .select("*, artisan:profiles!jobs_artisan_id_fkey(full_name, email)")
    .eq("client_id", user!.id)
    .order("created_at", { ascending: false });

  const allJobs = jobs ?? [];

  // Fetch the latest pending negotiation offer for each negotiating job
  const negotiatingIds = allJobs
    .filter((j) => j.status === "negotiating")
    .map((j) => j.id);

  const { data: latestOffers } = await supabase
    .from("negotiations")
    .select(
      "*, proposed_by_profile:profiles!negotiations_proposed_by_fkey(full_name)",
    )
    .in("job_id", negotiatingIds.length ? negotiatingIds : ["none"])
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  // Build a map of job_id → latest offer (first one per job after sort)
  const offersByJob = (latestOffers ?? []).reduce<
    Record<string, (typeof latestOffers)[number]>
  >((acc, offer) => {
    if (!acc[offer.job_id]) acc[offer.job_id] = offer;
    return acc;
  }, {});

  const activeJobs = allJobs.filter((j) =>
    ["pending", "accepted", "in_progress"].includes(j.status),
  );
  const negotiatingJobs = allJobs.filter((j) => j.status === "negotiating");

  const pastJobs = allJobs.filter((j) =>
    ["completed", "declined", "disputed"].includes(j.status),
  );

  const awaitingPaymentJobs = allJobs.filter(
    (j) => j.status === "awaiting_payment",
  );

  // Check which completed jobs already have a review.
  const completedIds = pastJobs
    .filter((j) => j.status === "completed")
    .map((j) => j.id);
  const { data: existingReviews } = await supabase
    .from("reviews")
    .select("job_id")
    .in("job_id", completedIds.length ? completedIds : ["none"]);

  const reviewedJobIds = new Set((existingReviews ?? []).map((r) => r.job_id));

  return (
    <div className="max-w-2xl mx-auto space-y-6 fade-up">
      {/* Welcome header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-stone-900">
            Welcome back, {profile?.full_name?.split(" ")[0]}
          </h1>
          <p className="text-sm text-stone-400 mt-0.5">
            Track your jobs and hire professionals.
          </p>
        </div>
        <Link
          href="/client/search"
          className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white text-sm font-medium rounded-xl hover:bg-stone-800 transition-colors"
        >
          <Search size={14} /> Find a Pro
        </Link>
      </div>

      {negotiatingJobs.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wide">
            Awaiting Your Response
          </h2>
          {negotiatingJobs.map((job) => (
            <NegotiatingJobCard
              key={job.id}
              job={job}
              offer={offersByJob[job.id] ?? null}
              clientId={user!.id}
            />
          ))}
        </section>
      )}

      {awaitingPaymentJobs.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wide">
            Action Required
          </h2>
          {awaitingPaymentJobs.map((job) => (
            <PaymentEscrowPrompt key={job.id} job={job} clientId={user!.id} />
          ))}
        </section>
      )}

      {/* Active jobs section */}
      {activeJobs.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wide">
            Active Jobs
          </h2>
          {activeJobs.map((job) => {
            const artisan = job.artisan as Record<string, string>;
            const { label, color } = getStatusMeta(job.status);
            const isInProgress =
              job.status === "accepted" || job.status === "in_progress";

            return (
              <div
                key={job.id}
                className="bg-white rounded-2xl border border-sky-100 shadow-sm p-5"
              >
                {/* Artisan accepted banner */}
                {isInProgress && (
                  <div className="mb-3 px-3 py-1.5 bg-stone-900 text-white text-xs font-medium rounded-lg text-center">
                    Artisan Accepted!
                  </div>
                )}

                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="font-bold text-stone-900">
                      {isInProgress ? "Job In Progress" : job.title}
                    </p>
                    {isInProgress && (
                      <p className="text-sm text-stone-500 mt-0.5">
                        {artisan?.full_name} is working on your job.
                      </p>
                    )}
                    {!isInProgress && (
                      <p className="text-xs text-stone-400 mt-0.5">
                        Waiting for artisan response
                      </p>
                    )}
                  </div>
                  <span
                    className={`shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}
                  >
                    {label}
                  </span>
                </div>

                <div className="text-sm text-stone-500 mb-4">
                  <span className="font-medium text-stone-700">Budget:</span>{" "}
                  {formatCurrency(job.budget)}
                  <span className="mx-2 text-stone-200">·</span>
                  <span>{timeAgo(job.created_at)}</span>
                </div>

                {isInProgress && (
                  <Link
                    href={`/client/jobs/${job.id}/chat`}
                    className="flex items-center gap-1.5 px-4 py-2 border border-stone-200 text-stone-700 text-sm rounded-xl hover:bg-stone-50 transition-colors w-fit"
                  >
                    <MessageSquare size={14} /> Chat with Artisan
                  </Link>
                )}
              </div>
            );
          })}
        </section>
      )}

      {/* Past jobs */}
      {pastJobs.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wide">
            Past Jobs
          </h2>
          {pastJobs.map((job) => {
            const artisan = job.artisan as Record<string, string>;
            const { label, color } = getStatusMeta(job.status);
            const canReview =
              job.status === "completed" && !reviewedJobIds.has(job.id);

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
                      {artisan?.full_name} &middot; {timeAgo(job.created_at)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}
                  >
                    {label}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm font-semibold text-stone-900">
                    {formatCurrency(job.budget)}
                  </span>
                  {canReview && <ReviewModal job={job} clientId={user!.id} />}
                  {reviewedJobIds.has(job.id) && (
                    <span className="flex items-center gap-1 text-xs text-amber-600">
                      <Star size={12} fill="currentColor" /> Reviewed
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      )}

      {allJobs.length === 0 && (
        <div className="bg-white rounded-2xl border border-stone-100 p-12 text-center">
          <Search size={32} className="mx-auto text-stone-200 mb-3" />
          <p className="text-stone-400 text-sm mb-4">
            No jobs yet. Find a professional to get started.
          </p>
          <Link
            href="/client/search"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white text-sm font-medium rounded-xl hover:bg-stone-800 transition-colors"
          >
            <Search size={14} /> Find a Pro
          </Link>
        </div>
      )}
    </div>
  );
}
