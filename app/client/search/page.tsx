import { createClient } from "@/lib/supabase/server";
import SearchClient from "@/components/client/SearchClient";

// Server component: loads the full artisan list, passes to the interactive search UI.
export default async function SearchPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch all approved artisans with their public profile data.
  const { data: artisans } = await supabase
    .from("artisan_profiles")
    .select("*, profiles(*)")
    .eq("is_approved", true)
    .order("rating", { ascending: false });

  return <SearchClient artisans={artisans ?? []} clientId={user!.id} />;
}
