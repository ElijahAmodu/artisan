import Link from "next/link";
import { Hammer, User, ShieldCheck, Star, Lock } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-100 bg-white">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hammer size={20} className="text-amber-500" />
            <span className="font-bold text-stone-900 tracking-tight text-lg">
              ArtisanQuarters
            </span>
          </div>
          {/* <Link
            href="/auth/login"
            className="text-sm text-stone-600 hover:text-stone-900 transition-colors"
          >
            Sign In
          </Link> */}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12 md:py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-medium text-amber-700 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 pulse" />
            Trusted by 10,000+ clients nationwide
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-stone-900 leading-tight mb-4">
            Hire Skilled Artisans,
            <br />
            <span className="text-amber-500">Done Right.</span>
          </h1>
          <p className="text-stone-500 text-lg max-w-xl mx-auto">
            Connect with vetted plumbers, electricians, carpenters and more.
            Secure escrow payments. Real-time job tracking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 hover:shadow-md transition-all group">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
              <Hammer size={20} className="text-amber-600" />
            </div>
            <h2 className="font-bold text-stone-900 text-lg mb-1">
              Artisan Flow
            </h2>
            <p className="text-stone-500 text-sm mb-6">
              Find work, manage jobs, and grow your professional reputation.
            </p>
            <div className="space-y-2 mb-6">
              {[
                "Set your availability",
                "Receive job requests",
                "Chat with clients",
                "Get paid securely",
              ].map((f) => (
                <div
                  key={f}
                  className="flex items-center gap-2 text-sm text-stone-600"
                >
                  <span className="w-1 h-1 rounded-full bg-amber-400" />
                  {f}
                </div>
              ))}
            </div>
            <Link
              href="/auth/register?role=artisan"
              className="block w-full text-center py-2.5 rounded-xl bg-stone-900 text-white text-sm font-medium hover:bg-amber-500 transition-colors"
            >
              Register as Artisan
            </Link>
            <Link
              href="/auth/login?role=artisan"
              className="block w-full text-center py-2 text-sm text-stone-500 hover:text-stone-700 mt-2"
            >
              Already registered? Sign in
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 hover:shadow-md transition-all group">
            <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center mb-4">
              <User size={20} className="text-sky-600" />
            </div>
            <h2 className="font-bold text-stone-900 text-lg mb-1">
              Client Flow
            </h2>
            <p className="text-stone-500 text-sm mb-6">
              Hire verified professionals securely for any home or office task.
            </p>
            <div className="space-y-2 mb-6">
              {[
                "Search by skill & location",
                "View ratings & reviews",
                "Escrow payment protection",
                "Track job progress",
              ].map((f) => (
                <div
                  key={f}
                  className="flex items-center gap-2 text-sm text-stone-600"
                >
                  <span className="w-1 h-1 rounded-full bg-sky-400" />
                  {f}
                </div>
              ))}
            </div>
            <Link
              href="/auth/register?role=client"
              className="block w-full text-center py-2.5 rounded-xl bg-stone-900 text-white text-sm font-medium hover:bg-sky-500 transition-colors"
            >
              Register as Client
            </Link>
            <Link
              href="/auth/login?role=client"
              className="block w-full text-center py-2 text-sm text-stone-500 hover:text-stone-700 mt-2"
            >
              Already registered? Sign in
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center mb-4">
              <ShieldCheck size={20} className="text-stone-600" />
            </div>
            <h2 className="font-bold text-stone-900 text-lg mb-1">
              Admin Flow
            </h2>
            <p className="text-stone-500 text-sm mb-6">
              Oversee platform operations, approve artisans, and resolve
              disputes.
            </p>
            <div className="space-y-2 mb-6">
              {[
                "Vet & approve artisans",
                "Monitor all jobs",
                "Resolve disputes",
                "Platform analytics",
              ].map((f) => (
                <div
                  key={f}
                  className="flex items-center gap-2 text-sm text-stone-600"
                >
                  <span className="w-1 h-1 rounded-full bg-stone-400" />
                  {f}
                </div>
              ))}
            </div>
            <Link
              href="/auth/login?role=admin"
              className="block w-full text-center py-2.5 rounded-xl border border-stone-200 text-stone-700 text-sm font-medium hover:bg-stone-50 transition-colors"
            >
              Admin Panel
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-stone-100 pt-12">
          {[
            {
              icon: ShieldCheck,
              label: "Vetted Professionals",
              desc: "Every artisan is background-checked and skill-verified before going live.",
            },
            {
              icon: Lock,
              label: "Escrow Payments",
              desc: "Funds are held securely until you confirm the job is complete.",
            },
            {
              icon: Star,
              label: "Verified Reviews",
              desc: "All ratings come from real completed jobs only.",
            },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
                <Icon size={15} className="text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-stone-900 text-sm mb-0.5">
                  {label}
                </p>
                <p className="text-stone-500 text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-stone-100 mt-16 py-8 text-center text-sm text-stone-400">
        &copy; {new Date().getFullYear()} ArtisanQuarters. All rights reserved.
      </footer>
    </div>
  );
}
