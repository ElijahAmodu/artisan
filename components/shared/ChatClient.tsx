"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { cn, timeAgo } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  sender?: { id: string; full_name: string } | null;
}

interface Props {
  job: Record<string, unknown>;
  initialMessages: Message[];
  currentUserId: string;
  backHref: string;
}

// Real-time chat room for a specific job.
// Subscribes to Supabase Realtime so both participants see messages instantly.
export default function ChatClient({
  job,
  initialMessages,
  currentUserId,
  backHref,
}: Props) {
  const supabase = createClient();
  const bottomRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const artisan = job.artisan as { id: string; full_name: string } | null;
  const client = job.client as { id: string; full_name: string } | null;
  const other = currentUserId === artisan?.id ? client : artisan;

  // Scroll to the latest message whenever the list changes.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Subscribe to new messages via Supabase Realtime channels.
  useEffect(() => {
    const setupChannel = async () => {
      // Get the current session token
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const channel = supabase
        .channel(`chat:${job.id as string}`, {
          config: {
            broadcast: { self: false },
            presence: { key: currentUserId },
            // Pass the access token so RLS is evaluated on the realtime connection
            // params: {
            //   apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            // },
          },
        })
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `job_id=eq.${job.id as string}`,
          },
          async (payload) => {
            const { data: full } = await supabase
              .from("messages")
              .select(
                "*, sender:profiles!messages_sender_id_fkey(id, full_name)",
              )
              .eq("id", payload.new.id)
              .single();

            if (full) {
              setMessages((prev) => [...prev, full as Message]);
            }
          },
        )
        .subscribe();

      return channel;
    };

    let channelRef: ReturnType<typeof supabase.channel> | null = null;

    setupChannel().then((ch) => {
      channelRef = ch;
    });

    return () => {
      if (channelRef) supabase.removeChannel(channelRef);
    };
  }, [job.id]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setText("");

    // Insert the message; RLS ensures only job participants can write.
    await supabase.from("messages").insert({
      job_id: job.id as string,
      sender_id: currentUserId,
      content: trimmed,
    });

    setSending(false);
  }

  return (
    <div className="max-w-lg mx-auto flex flex-col h-[calc(100vh-7rem)] md:h-[calc(100vh-4rem)] fade-up">
      {/* Header */}
      <div className="bg-white border border-stone-100 rounded-t-2xl px-4 py-3 flex items-center gap-3 shrink-0 shadow-sm">
        <Link
          href={backHref}
          className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>
        <div className="min-w-0">
          <p className="font-semibold text-stone-900 text-sm truncate">
            Chat with {other?.full_name ?? "Unknown"}
          </p>
          <p className="text-xs text-stone-400 truncate">
            {job.title as string}
          </p>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto bg-stone-50 px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-xs text-stone-300 mt-8">
            No messages yet. Say hello!
          </p>
        )}

        {messages.map((msg) => {
          const isOwn = msg.sender_id === currentUserId;
          return (
            <div
              key={msg.id}
              className={cn(
                "flex flex-col max-w-[78%]",
                isOwn ? "ml-auto items-end" : "items-start",
              )}
            >
              {/* Sender label for the other party */}
              {!isOwn && (
                <span className="text-xs text-stone-400 mb-0.5 px-1">
                  {msg.sender?.full_name}
                </span>
              )}
              <div
                className={cn(
                  "px-3.5 py-2 rounded-2xl text-sm leading-relaxed relative",
                  isOwn
                    ? "bg-stone-900 text-white rounded-br-sm"
                    : "bg-white text-stone-900 border border-stone-100 rounded-bl-sm shadow-sm",
                )}
              >
                {msg.content}
              </div>
              <span className="text-xs text-stone-300 mt-0.5 px-1">
                {timeAgo(msg.created_at)}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Message input */}
      <form
        onSubmit={sendMessage}
        className="bg-white border border-stone-100 rounded-b-2xl px-3 py-3 flex gap-2 items-center shrink-0 shadow-sm"
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type message…"
          className="flex-1 h-9 px-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 transition"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="h-9 w-9 rounded-xl bg-stone-900 text-white flex items-center justify-center hover:bg-stone-800 disabled:opacity-40 transition-colors shrink-0"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
