import { createClient } from "@/lib/supabase/server";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";

// Fetches all platform-wide data the admin needs and passes to the client shell.
export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Aggregate stats across the whole platform.
  const [
    { count: totalJobs },
    { count: totalArtisans },
    { count: totalClients },
    { count: pendingApprovals },
    { count: activeDisputes },
  ] = await Promise.all([
    supabase.from("jobs").select("*", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "artisan"),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "client"),
    supabase
      .from("artisan_profiles")
      .select("*", { count: "exact", head: true })
      .eq("is_approved", false),
    supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("status", "disputed"),
  ]);

  // Revenue estimate: sum of budgets for all released (completed) payments.
  const { data: revenueData } = await supabase
    .from("jobs")
    .select("budget")
    .eq("payment_status", "released");

  const totalRevenue = (revenueData ?? []).reduce(
    (sum, j) => sum + (j.budget ?? 0),
    0,
  );

  // Artisans awaiting approval.
  const { data: pendingArtisans } = await supabase
    .from("artisan_profiles")
    .select("*, profiles(*)")
    .eq("is_approved", false)
    .order("created_at", { ascending: true })
    .limit(10);

  // Active disputes with full job info.
  const { data: disputedJobs } = await supabase
    .from("jobs")
    .select(
      "*, client:profiles!jobs_client_id_fkey(full_name), artisan:profiles!jobs_artisan_id_fkey(full_name)",
    )
    .eq("status", "disputed")
    .order("updated_at", { ascending: false });

  return (
    <AdminDashboardClient
      stats={{
        totalJobs: totalJobs ?? 0,
        totalArtisans: totalArtisans ?? 0,
        totalClients: totalClients ?? 0,
        totalRevenue,
        pendingApprovals: pendingApprovals ?? 0,
        activeDisputes: activeDisputes ?? 0,
      }}
      pendingArtisans={pendingArtisans ?? []}
      disputedJobs={disputedJobs ?? []}
    />
  );
}
