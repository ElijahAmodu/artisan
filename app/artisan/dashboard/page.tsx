import { createClient } from "@/lib/supabase/server";
import ArtisanDashboardClient from "@/components/artisan/ArtisanDashboardClient";

// Server component: fetches artisan profile + pending jobs, passes to client shell.
export default async function ArtisanDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch extended artisan profile for availability status.
  const { data: artisanProfile } = await supabase
    .from("artisan_profiles")
    .select("*")
    .eq("user_id", user!.id)
    .single();

  // Fetch the user's public profile for display name.
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user!.id)
    .single();

  // Fetch all pending job requests assigned to this artisan.
  const { data: pendingAndNegotiatingJobs } = await supabase
    .from("jobs")
    .select("*, client:profiles!jobs_client_id_fkey(full_name, email, phone)")
    .eq("artisan_id", user!.id)
    .in("status", ["pending", "negotiating"])
    .order("created_at", { ascending: false });

  // Fetch recently accepted/in-progress jobs for the active job card.
  const { data: activeJobs } = await supabase
    .from("jobs")
    .select("*, client:profiles!jobs_client_id_fkey(full_name, email, phone)")
    .eq("artisan_id", user!.id)
    .in("status", ["accepted", "awaiting_payment", "in_progress"])
    .order("updated_at", { ascending: false });

  const negotiatingIds = (pendingAndNegotiatingJobs ?? [])
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

  const offersByJob = (latestOffers ?? []).reduce<
    Record<string, (typeof latestOffers)[number]>
  >((acc, offer) => {
    if (!acc[offer.job_id]) acc[offer.job_id] = offer;
    return acc;
  }, {});

  return (
    <ArtisanDashboardClient
      artisanProfile={artisanProfile}
      profile={profile}
      pendingJobs={(pendingAndNegotiatingJobs ?? []).filter(
        (j) => j.status === "pending",
      )}
      negotiatingJobs={(pendingAndNegotiatingJobs ?? []).filter(
        (j) => j.status === "negotiating",
      )}
      offersByJob={offersByJob}
      activeJobs={activeJobs ?? []}
      userId={user!.id}
    />
  );
}
