import { createClient } from "@/lib/supabase/server";
import AdminDisputesClient from "@/components/admin/AdminDisputesClient";

export default async function AdminDisputesPage() {
  const supabase = await createClient();

  const { data: disputedJobs } = await supabase
    .from("jobs")
    .select(
      `
      *,
      client:profiles!jobs_client_id_fkey(full_name, email),
      artisan:profiles!jobs_artisan_id_fkey(full_name, email)
    `,
    )
    .eq("status", "disputed")
    .order("updated_at", { ascending: false });

  return <AdminDisputesClient disputedJobs={disputedJobs ?? []} />;
}
