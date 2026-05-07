import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ChatClient from "@/components/shared/ChatClient";

interface Props {
  params: Promise<{ jobId: string }>;
}

// Loads job + message history then hands off to the real-time chat client.
// Works for both artisan and client since both are participants of the job.
export default async function ArtisanChatPage({ params }: Props) {
  const { jobId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Verify the current user is a participant of this job (enforced by RLS too).
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
    .single();

  if (!job) redirect("/artisan/jobs");

  // Fetch initial message history ordered chronologically.
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
      backHref="/artisan/dashboard"
    />
  );
}
