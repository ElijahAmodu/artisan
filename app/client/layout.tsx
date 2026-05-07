import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ClientSidebar from "@/components/client/ClientSidebar";

// Guards /client/* routes — only authenticated clients can access.
export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?role=client");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "client") redirect("/");

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col md:flex-row">
      <ClientSidebar profile={profile} />
      <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8">{children}</main>
    </div>
  );
}
