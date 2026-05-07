import { createClient } from "@/lib/supabase/server";
import AdminArtisansClient from "@/components/admin/AdminArtisansClient";

export default async function AdminArtisansPage() {
  const supabase = await createClient();

  const { data: artisans } = await supabase
    .from("artisan_profiles")
    .select("*, profiles(*)")
    .order("created_at", { ascending: false });

  return <AdminArtisansClient artisans={artisans ?? []} />;
}
