"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff } from "lucide-react";

const ARTISAN_SKILLS = [
  "Plumber",
  "Electrician",
  "Carpenter",
  "Painter",
  "Mason",
  "Tiler",
  "Welder",
  "HVAC Technician",
  "Roofer",
  "Landscaper",
];

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const role = (params.get("role") ?? "client") as "artisan" | "client";

  const [step, setStep] = useState(1); // step 1: account, step 2: artisan profile
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1 fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  // Step 2 artisan fields
  const [skills, setSkills] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [location, setLocation] = useState("");

  function toggleSkill(skill: string) {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Artisans have a second step for their profile info.
    if (role === "artisan" && step === 1) {
      setStep(2);
      return;
    }

    setLoading(true);
    setError("");

    const supabase = createClient();

    // Create the Supabase Auth user account.
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } },
    });

    if (signUpError || !authData.user) {
      setError(
        signUpError?.message ?? "Registration failed. Please try again.",
      );
      setLoading(false);
      return;
    }

    const userId = authData.user.id;

    // Insert the public profile row — triggers RLS insert policy check.
    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      role,
      full_name: fullName,
      email,
      phone: phone || null,
    });

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    // For artisans, also insert the extended artisan_profiles row.
    if (role === "artisan") {
      const { error: artisanError } = await supabase
        .from("artisan_profiles")
        .insert({
          user_id: userId,
          skills,
          bio: bio || null,
          hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
          location: location || null,
          is_available: true,
          is_approved: false, // admin must approve before profile goes live
        });

      if (artisanError) {
        setError(artisanError.message);
        setLoading(false);
        return;
      }
    }

    router.push(
      role === "artisan" ? "/artisan/dashboard" : "/client/dashboard",
    );
    router.refresh();
  }

  const accentClass = role === "artisan" ? "bg-amber-500" : "bg-sky-500";

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8 fade-up">
        {/* Header */}
        <div className="mb-6">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium text-white ${accentClass} mb-3`}
          >
            {role === "artisan"
              ? "Artisan Registration"
              : role === "client"
                ? "Client Registration"
                : "Admin Registration"}
            {role === "artisan" && (
              <span className="opacity-70">— Step {step} of 2</span>
            )}
          </div>
          <h1 className="text-xl font-bold text-stone-900">
            {step === 1 ? "Create your account" : "Set up your artisan profile"}
          </h1>
          <p className="text-sm text-stone-400 mt-1">
            {step === 1
              ? "Fill in your basic information to get started."
              : "Help clients find you with a detailed profile."}
          </p>
        </div>

        {error && (
          <div className="mb-4 px-3 py-2 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 && (
            <>
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">
                  Full Name
                </label>
                <input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Mike The Plumber"
                  className="w-full h-10 px-3 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full h-10 px-3 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">
                  Phone (optional)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 555 000 0000"
                  className="w-full h-10 px-3 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 transition"
                />
              </div>
              <div className="relative">
                <label className="block text-xs font-medium text-stone-500 mb-1">
                  Password
                </label>
                <input
                  //   type="password"
                  type={showPass ? "text" : "password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full h-10 px-3 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/12 text-stone-400 hover:text-stone-600"
                  aria-label="Toggle password visibility"
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              {/* <div className="relative">
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
              </div> */}
            </>
          )}

          {step === 2 && role === "artisan" && (
            <>
              {/* Skill selector — multi-select pill grid */}
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-2">
                  Your Skills (select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {ARTISAN_SKILLS.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        skills.includes(skill)
                          ? "bg-stone-900 text-white border-stone-900"
                          : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="Tell clients about your experience and expertise…"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-stone-900 transition"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">
                    Hourly Rate ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    placeholder="50"
                    className="w-full h-10 px-3 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">
                    Location
                  </label>
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Lagos, Nigeria"
                    className="w-full h-10 px-3 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 transition"
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full h-10 rounded-lg text-white text-sm font-medium disabled:opacity-60 transition flex items-center justify-center gap-2 ${accentClass} hover:opacity-90`}
          >
            {loading && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {loading
              ? "Creating account…"
              : step === 1 && role === "artisan"
                ? "Continue"
                : "Create Account"}
          </button>

          {step === 2 && (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-center text-xs text-stone-400 hover:text-stone-600 mt-1"
            >
              Back to step 1
            </button>
          )}
        </form>

        <p className="mt-5 text-center text-xs text-stone-400">
          Already have an account?{" "}
          <Link
            href={`/auth/login?role=${role}`}
            className="text-stone-700 font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="text-stone-400 text-sm">Loading…</div>}>
      <RegisterForm />
    </Suspense>
  );
}
