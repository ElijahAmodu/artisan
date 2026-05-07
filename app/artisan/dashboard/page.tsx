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
  const { data: pendingJobs } = await supabase
    .from("jobs")
    .select("*, client:profiles!jobs_client_id_fkey(full_name, email, phone)")
    .eq("artisan_id", user!.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  // Fetch recently accepted/in-progress jobs for the active job card.
  const { data: activeJobs } = await supabase
    .from("jobs")
    .select("*, client:profiles!jobs_client_id_fkey(full_name, email, phone)")
    .eq("artisan_id", user!.id)
    .in("status", ["accepted", "in_progress"])
    .order("updated_at", { ascending: false });

  return (
    <ArtisanDashboardClient
      artisanProfile={artisanProfile}
      profile={profile}
      pendingJobs={pendingJobs ?? []}
      activeJobs={activeJobs ?? []}
      userId={user!.id}
    />
  );
}
