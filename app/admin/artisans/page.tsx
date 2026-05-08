import { createClient } from "@/lib/supabase/server";
import AdminArtisansClient from "@/components/admin/AdminArtisansClient";

export default async function AdminArtisansPage() {
  const supabase = await createClient();

  const { data: artisans, error } = await supabase
    .from("artisan_profiles")
    .select("*, profiles(*)")
    .order("created_at", { ascending: false });

  console.log("ERROR:", error);
  console.log("Fetched artisans:", artisans);

  return <AdminArtisansClient artisans={artisans ?? []} />;
}
