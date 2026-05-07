import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ArtisanSidebar from "@/components/artisan/ArtisanSidebar";

// Shared layout for all /artisan/* pages.
// Guards the route — only authenticated artisans can enter.
export default async function ArtisanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?role=artisan");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "artisan") redirect("/");

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col md:flex-row">
      <ArtisanSidebar profile={profile} />
      <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8">{children}</main>
    </div>
  );
}
