import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ChatClient from "@/components/shared/ChatClient";

interface Props {
  params: Promise<{ jobId: string }>;
}

export default async function ClientChatPage({ params }: Props) {
  const { jobId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Verify participant access — RLS handles the data layer too.
  const { data: job } = await supabase
    .from("jobs")
    .select(
      `
      *,
      client:profiles!jobs_client_id_fkey(id, full_name),
      artisan:profiles!jobs_artisan_id_fkey(id, full_name)
    `,
    )
    .eq("id", jobId)
    .eq("client_id", user!.id)
    .single();

  if (!job) redirect("/client/jobs");

  const { data: messages } = await supabase
    .from("messages")
    .select("*, sender:profiles!messages_sender_id_fkey(id, full_name)")
    .eq("job_id", jobId)
    .order("created_at", { ascending: true });

  return (
    <ChatClient
      job={job}
      initialMessages={messages ?? []}
      currentUserId={user!.id}
      backHref="/client/dashboard"
    />
  );
}
