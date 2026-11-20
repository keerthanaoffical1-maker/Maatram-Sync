import { BrandMark } from './BrandMark';

// Decorative: a month grid where gold marks the dates most students share.
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const OVERLAP = new Set([9, 10, 16, 17, 23]);
const PARTIAL = new Set([8, 11, 15, 18, 22, 24]);

function CalendarVisual() {
  return (
    <div aria-hidden="true" className="w-full max-w-sm rounded-2xl border border-white/10 bg-charcoal p-6">
      <div className="mb-4 flex items-center justify-between text-sm text-white/70">
        <span>Event week overview</span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-gold" /> Most students free
        </span>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center text-xs text-white/50">
        {DAYS.map((d, i) => (
          <span key={i}>{d}</span>
        ))}
        {Array.from({ length: 28 }, (_, i) => i + 1).map((n) => (
          <span
            key={n}
            className={`flex aspect-square items-center justify-center rounded-md text-sm ${
              OVERLAP.has(n)
                ? 'bg-gold font-semibold text-ink'
                : PARTIAL.has(n)
                  ? 'bg-gold/25 text-white'
                  : 'bg-white/5 text-white/60'
            }`}
          >
            {n}
          </span>
        ))}
      </div>
    </div>
  );
}

export function BrandPanel() {
  return (
    <section className="hidden flex-col justify-between bg-ink p-12 xl:p-16 lg:flex" aria-label="About Maatram Sync">
      <BrandMark />
      <div className="space-y-10">
        <div className="max-w-md space-y-4">
          <h2 className="text-4xl font-semibold leading-tight tracking-tight text-white xl:text-5xl">
            Your Time. Your Opportunities. Better Together.
          </h2>
          <p className="text-lg leading-relaxed text-white/70">
            Students share when they're free. The Maatram team sees where schedules overlap and picks the right date for every event.
          </p>
        </div>
        <CalendarVisual />
      </div>
      <p className="text-sm text-white/50">© {new Date().getFullYear()} Maatram Events</p>
    </section>
  );
}
