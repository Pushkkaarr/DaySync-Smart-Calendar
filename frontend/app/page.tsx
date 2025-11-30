import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-900 via-slate-900 to-gray-900 text-slate-100">
      {/* Subtle decorative layers */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none overflow-hidden"
      >
        {/* soft radial glow */}
        <div className="absolute -top-20 -right-32 w-[560px] h-[560px] bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.12)_0,transparent_40%)] blur-3xl opacity-80" />
        {/* faint grid/texture using SVG for performance */}
        <svg
          className="absolute inset-0 w-full h-full opacity-5"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="p" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M40 0H0v40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#p)" />
        </svg>
      </div>

      <main className="relative z-10 flex items-center justify-center px-6 py-28 sm:py-36 lg:py-44">
        <section className="w-full max-w-4xl mx-auto text-center">
          <div className="mx-auto max-w-3xl">
            <p className="inline-block px-3 py-1 mb-6 rounded-full bg-white/6 text-sm font-medium tracking-wide text-white/90">
              New — AI-assisted scheduling
            </p>

            <h1 className="font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight tracking-tight text-white">
              Calendar that actually understands your day.
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-200/90">
              Smart time suggestions, privacy-first sync, and a beautiful interface
              that keeps your focus where it belongs — on doing great work.
            </p>

            <div className="mt-10 flex justify-center">
              <a
                href="/home"
                className="inline-flex items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition-transform text-black font-semibold px-8 py-3 text-base shadow-lg shadow-emerald-700/30"
                aria-label="Get Started with DaySync"
              >
                Get Started
              </a>
            </div>

            
          </div>
        </section>
      </main>

      <footer className="relative z-10 py-12 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} DaySync — Built with Next.js & Tailwind CSS
      </footer>
    </div>
  );
}
