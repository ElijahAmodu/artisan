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
  "Bricklayer",
  "Millwright",
  "Boilermaker",
  "Mechanic including Automotive",
  "Mechanic",
  "Diesel Mechanic",
  "Carpenter and Joiner",
  "Rigger",
  "Fitter and Turner",
  "Mechanical Fitter",
  "Pipe Fitter",
  "Meson",
  "Farmers",
  "Cleaners",
];

const NIGERIA_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT - Abuja",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
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
  const [skillsOpen, setSkillsOpen] = useState(false);
  // const [otherSkill, setOtherSkill] = useState("");
  const [otherSkills, setOtherSkills] = useState<string[]>([]);
  const [otherSkillInput, setOtherSkillInput] = useState("");
  const [bio, setBio] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [location, setLocation] = useState("");

  function toggleSkill(skill: string) {
    if (skill === "Other") {
      // "Other" in the skills array just acts as a flag — don't toggle it off from here
      if (!skills.includes("Other")) {
        setSkills((prev) => [...prev, "Other"]);
      }
      return;
    }
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    );
  }

  function addOtherSkill() {
    const trimmed = otherSkillInput.trim();
    if (!trimmed || otherSkills.includes(trimmed)) return;
    setOtherSkills((prev) => [...prev, trimmed]);
    setOtherSkillInput("");
  }

  function removeOtherSkill(skill: string) {
    const updated = otherSkills.filter((s) => s !== skill);
    setOtherSkills(updated);
    // If no custom skills left, remove the "Other" flag from skills too
    if (updated.length === 0) {
      setSkills((prev) => prev.filter((s) => s !== "Other"));
    }
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
          skills: [...skills.filter((s) => s !== "Other"), ...otherSkills],
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

  const accentClass =
    role === "artisan"
      ? "bg-amber-500"
      : role === "client"
        ? "bg-sky-500"
        : "bg-[#000]";

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
                  placeholder="+234 900 000 0000"
                  className="w-full h-10 px-3 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 transition"
                />
              </div>
              <div className="relative">
                <label className="block text-xs font-medium text-stone-500 mb-1">
                  Password
                </label>
                <input
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
            </>
          )}

          {step === 2 && role === "artisan" && (
            <>
              <div>
                {/* Skill selector — multi-select dropdown */}
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-2">
                    Your Skills (select all that apply)
                  </label>

                  {/* Dropdown trigger */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setSkillsOpen((v) => !v)}
                      className="w-full h-10 px-3 rounded-lg border border-stone-200 text-sm text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-stone-900 transition bg-white"
                    >
                      <span
                        className={
                          skills.length === 0
                            ? "text-stone-400"
                            : "text-stone-700"
                        }
                      >
                        {skills.length === 0 && otherSkills.length === 0
                          ? "Select skills…"
                          : [
                              ...skills.filter((s) => s !== "Other"),
                              ...otherSkills,
                            ].join(", ")}
                      </span>
                      <svg
                        className={`w-4 h-4 text-stone-400 transition-transform ${skillsOpen ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {/* Dropdown list */}
                    {skillsOpen && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-stone-200 rounded-lg shadow-md max-h-56 overflow-y-auto">
                        {[...ARTISAN_SKILLS, "Other"].map((skill) => (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => toggleSkill(skill)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                          >
                            <span
                              className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                                skills.includes(skill)
                                  ? "bg-stone-900 border-stone-900"
                                  : "border-stone-300"
                              }`}
                            >
                              {skills.includes(skill) && (
                                <svg
                                  className="w-2.5 h-2.5 text-white"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={3}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </span>
                            {skill}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Selected skill pills */}
                  {(skills.length > 0 || otherSkills.length > 0) && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {skills
                        .filter((s) => s !== "Other")
                        .map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-700"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => toggleSkill(skill)}
                              className="text-stone-400 hover:text-stone-700 leading-none"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      {otherSkills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeOtherSkill(skill)}
                            className="text-amber-400 hover:text-amber-700 leading-none"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* "Other" custom input */}

                  {skills.includes("Other") && (
                    <div className="mt-2 flex gap-2">
                      <input
                        value={otherSkillInput}
                        onChange={(e) => setOtherSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addOtherSkill();
                          }
                        }}
                        placeholder="Type a skill and press Add…"
                        className="flex-1 h-10 px-3 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 transition"
                      />
                      <button
                        type="button"
                        onClick={addOtherSkill}
                        className="h-10 px-3 rounded-lg border border-stone-200 text-sm text-stone-600 hover:bg-stone-50 transition whitespace-nowrap"
                      >
                        Add
                      </button>
                    </div>
                  )}
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
                    Hourly Rate (NGN)
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
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 transition bg-white text-stone-700 appearance-none"
                  >
                    <option value="" disabled>
                      Select a state…
                    </option>
                    {NIGERIA_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full h-10 rounded-lg text-white text-sm font-medium disabled:opacity-60 transition flex items-center justify-center gap-2 ${accentClass} hover:opacity-90 cursor-pointer`}
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
              className="w-full text-center text-xs text-stone-400 hover:text-stone-600 mt-1 cursor-pointer"
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
