"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Hammer } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Inner component that uses useSearchParams — must be wrapped in Suspense.
function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const role = params.get("role") ?? "client";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();

    // Authenticate the user with email and password via Supabase Auth.
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !data.user) {
      setError(authError?.message ?? "Invalid credentials. Please try again.");
      setLoading(false);
      return;
    }

    // Fetch profile to determine role-based redirect destination.
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    const destination =
      profile?.role === "admin"
        ? "/admin/dashboard"
        : profile?.role === "artisan"
          ? "/artisan/dashboard"
          : "/client/dashboard";

    router.push(destination);
    router.refresh();
  }

  const roleLabels: Record<string, string> = {
    artisan: "Artisan Login",
    client: "Client Login",
    admin: "Admin Login",
  };

  const roleAccent: Record<string, string> = {
    artisan: "bg-amber-500",
    client: "bg-sky-500",
    admin: "bg-stone-700",
  };

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8 fade-up">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className={`w-8 h-8 rounded-lg ${roleAccent[role] ?? "bg-stone-700"} flex items-center justify-center`}
          >
            <Hammer size={16} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-stone-900">
              {roleLabels[role] ?? "Sign In"}
            </h1>
            <p className="text-xs text-stone-400 capitalize">{role} portal</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 px-3 py-2 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-600">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              className="block text-xs font-medium text-stone-500 mb-1"
              htmlFor="email"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={
                role === "artisan" ? "mike@plumber.com" : "john@client.com"
              }
              className="w-full h-10 px-3 rounded-lg border border-stone-200 text-sm text-stone-900 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition"
            />
          </div>

          <div>
            <label
              className="block text-xs font-medium text-stone-500 mb-1"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPass ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-10 px-3 pr-10 rounded-lg border border-stone-200 text-sm text-stone-900 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                aria-label="Toggle password visibility"
              >
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 rounded-lg bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            {loading && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {loading ? "Signing in…" : "Login"}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-stone-400">
          Don&apos;t have an account?{" "}
          <Link
            href={`/auth/register?role=${role}`}
            className="text-stone-700 font-medium hover:underline"
          >
            Register
          </Link>
        </p>
        <p className="mt-2 text-center text-xs text-stone-400">
          <Link href="/" className="hover:underline">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}

// Wrap in Suspense because useSearchParams requires it in Next.js App Router.
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-stone-400 text-sm">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
