import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MarkCompleteClient from "@/components/artisan/MarkCompleteClient";

interface Props {
  params: Promise<{ jobId: string }>;
}

// Server component: validates the job belongs to this artisan before rendering.
export default async function MarkCompletePage({ params }: Props) {
  const { jobId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: job } = await supabase
    .from("jobs")
    .select("*, client:profiles!jobs_client_id_fkey(full_name)")
    .eq("id", jobId)
    .eq("artisan_id", user!.id)
    .single();

  // Redirect if job not found or not in an acceptable state for completion.
  if (!job || !["accepted", "in_progress"].includes(job.status)) {
    redirect("/artisan/jobs");
  }

  return <MarkCompleteClient job={job} userId={user!.id} />;
}
