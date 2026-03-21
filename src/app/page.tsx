import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  CircleDot,
  FileText,
  Layers3,
  MapPinned,
  Route,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';

const capabilities = [
  {
    title: 'Map-driven scope',
    text: 'Start from a live map. Place chargers, panels, route trenches, and feed spatial intent directly into the estimate.',
    icon: MapPinned,
    tint: 'lg-tint-blue',
    color: 'var(--system-blue)',
  },
  {
    title: 'Construction planning',
    text: 'Add mechanical rooms, pads, bollards, conduit paths, and restricted zones so complexity is visible before quoting.',
    icon: Building2,
    tint: 'lg-tint-purple',
    color: 'var(--system-purple)',
  },
  {
    title: 'Transparent pricing',
    text: 'Every line item shows its rule, data source, confidence, and where mapped scope posted into the quote.',
    icon: FileText,
    tint: 'lg-tint-cyan',
    color: 'var(--system-cyan)',
  },
];

const workflow = [
  {
    step: '01',
    title: 'Choose your entry',
    text: 'Start from map for spatial planning or from the guided form for a structured estimator workflow.',
    icon: Layers3,
  },
  {
    step: '02',
    title: 'Lay out the site',
    text: 'Pin chargers, panel locations, bollards, pads, and route trench and conduit paths directly on the satellite view.',
    icon: Route,
  },
  {
    step: '03',
    title: 'Review the impact',
    text: 'See map-driven quantities applied to the estimate with affected line items highlighted.',
    icon: Sparkles,
  },
];

const scenarios = [
  { name: 'Hampton Inn Surface Lot', desc: '4x Tesla UWC, pedestal mount, surface lot, hotel frontage' },
  { name: 'Downtown Apartment Garage', desc: '4x Tesla UWC, garage wall mount, PT slab routing complexity' },
  { name: 'Mixed Environment Complex', desc: '6x ChargePoint CT4000, garage + surface, heavy civil coordination' },
  { name: 'Tesla Supercharger Station', desc: '4-stall DC fast charging package with transformer and trench work' },
];

const statusItems: Array<{ title: string; text: string; active: boolean }> = [
  { title: 'Offline-ready estimator', text: 'No external dependency needed for estimate generation', active: true },
  { title: 'Interactive site planner', text: 'Live map with 9 EV construction tools and quote posting', active: true },
  { title: 'Catalog-backed pricing', text: 'Tesla SC, L2, ChargePoint, accessories, and installation rules', active: true },
  { title: 'monday.com live mode', text: 'Optional enhancement, connects when env vars are configured', active: false },
];

const stats = [
  { label: 'Map-derived fields', value: 'Auto-apply' },
  { label: 'Construction tools', value: '9 types' },
  { label: 'Test scenarios', value: '4 ready' },
  { label: 'Quote traceability', value: 'Line-by-line' },
];

export default function HomePage() {
  return (
    <main className="relative min-h-screen">
      <div className="ambient-mesh" />

      <div className="page-section mx-auto max-w-[1200px] px-5 pb-24 pt-5 sm:px-6">

        {/* ─── Floating Nav Pill ─────────────────────────────── */}
        <nav className="mb-6 flex items-center justify-between">
          <div className="lg-pill lg-ring">
            <Zap className="h-4 w-4" style={{ color: 'var(--system-blue)' }} />
            <span className="font-semibold">BulletEV</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/debug" className="lg-pill text-xs text-gray-500 hover:text-gray-900">
              Debug
            </Link>
          </div>
        </nav>

        {/* ─── Hero ─────────────────────────────────────────── */}
        <header className="hero-canvas lg-ring rounded-[var(--radius-2xl)] px-6 py-10 text-white sm:px-10 sm:py-14">
          <div className="relative z-10 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="lg-eyebrow text-white/60">
                <CircleDot className="h-3.5 w-3.5" />
                Smart Estimate Studio
              </p>
              <h1 className="lg-headline mt-4 text-[clamp(2rem,5.5vw,3.5rem)]">
                <span className="lg-gradient-text">Map-first EV estimates</span>
                <br />
                <span className="text-white/80">with transparent quoting</span>
              </h1>
              <p className="mt-5 max-w-lg text-[0.9375rem] leading-7 text-white/65">
                Combine live map planning, construction-aware project features,
                and rules-based line-item pricing in one guided experience.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/estimate?start=map"
                  className="lg-pill lg-pill-active px-5 py-3 text-sm font-semibold"
                >
                  <MapPinned className="h-4 w-4" />
                  Start From Map
                </Link>
                <Link
                  href="/estimate?start=form"
                  className="lg-pill border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white"
                >
                  Guided Form
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="grid w-full max-w-sm gap-3 sm:grid-cols-2">
              {stats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[var(--radius-md)] border border-white/10 bg-white/8 px-4 py-4 backdrop-blur-xl"
                >
                  <p className="text-[0.6875rem] uppercase tracking-[0.05em] text-white/45">
                    {item.label}
                  </p>
                  <p className="mt-2.5 text-xl font-semibold text-white">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </header>

        {/* ─── Capabilities ─────────────────────────────────── */}
        <section className="page-section mt-6 grid gap-4 lg:grid-cols-3">
          {capabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <div
                key={cap.title}
                className={`lg-panel lg-ring ${cap.tint} rounded-[var(--radius-lg)] p-6`}
              >
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-sm)]"
                  style={{ backgroundColor: `color-mix(in srgb, ${cap.color} 12%, transparent)`, color: cap.color }}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-[1.0625rem] font-semibold text-gray-900">
                  {cap.title}
                </h3>
                <p className="mt-2 text-[0.8125rem] leading-6 text-gray-500">
                  {cap.text}
                </p>
              </div>
            );
          })}
        </section>

        {/* ─── How It Flows + System Status ──────────────────── */}
        <section className="page-section mt-6 grid gap-4 lg:grid-cols-[1fr_0.85fr]">

          {/* Workflow */}
          <div className="lg-panel-heavy rounded-[var(--radius-xl)] p-6 sm:p-7">
            <p className="lg-eyebrow">
              <Route className="h-3.5 w-3.5" />
              How It Flows
            </p>
            <h2 className="lg-headline mt-3 text-2xl text-gray-900">
              From site layout to quote output
            </h2>

            <div className="mt-6 space-y-3">
              {workflow.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.step} className="lg-card rounded-[var(--radius-md)] p-5">
                    <div className="flex items-start gap-4">
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-sm)]"
                        style={{ background: 'var(--system-blue)', color: '#fff' }}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-gray-400">
                          Step {item.step}
                        </p>
                        <h3 className="mt-1 text-[0.9375rem] font-semibold text-gray-900">
                          {item.title}
                        </h3>
                        <p className="mt-1.5 text-[0.8125rem] leading-6 text-gray-500">
                          {item.text}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* System Status */}
          <div className="lg-panel rounded-[var(--radius-xl)] p-6 sm:p-7">
            <p className="lg-eyebrow">
              <ShieldCheck className="h-3.5 w-3.5" />
              System Status
            </p>
            <h2 className="lg-headline mt-3 text-2xl text-gray-900">
              Ready to explore
            </h2>

            <div className="mt-6 space-y-3">
              {statusItems.map(({ title, text, active }) => (
                <div key={title} className="lg-card rounded-[var(--radius-md)] p-4">
                  <div className="flex items-start gap-3">
                    <span
                      className="lg-dot mt-1.5"
                      style={{ background: active ? 'var(--system-green)' : 'var(--system-orange)' }}
                    />
                    <div>
                      <p className="text-[0.8125rem] font-semibold text-gray-900">{title}</p>
                      <p className="mt-1 text-[0.8125rem] leading-6 text-gray-500">{text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Scenarios ────────────────────────────────────── */}
        <section className="page-section mt-6">
          <div className="lg-panel-heavy rounded-[var(--radius-xl)] p-6 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="lg-eyebrow">
                  <Layers3 className="h-3.5 w-3.5" />
                  Built-In Scenarios
                </p>
                <h2 className="lg-headline mt-3 text-2xl text-gray-900">
                  Realistic EV project examples
                </h2>
              </div>
              <Link
                href="/estimate?start=map"
                className="lg-pill text-sm font-medium text-gray-700"
              >
                Open Estimator
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {scenarios.map((scenario, index) => (
                <Link
                  key={scenario.name}
                  href={`/estimate?scenario=${['hampton-inn', 'downtown-apartment', 'mixed-complex', 'supercharger-station'][index]}`}
                  className="lg-card rounded-[var(--radius-md)] p-5 no-underline"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] text-[0.75rem] font-bold text-white"
                      style={{ background: 'var(--system-blue)' }}
                    >
                      0{index + 1}
                    </span>
                    <p className="text-[0.875rem] font-semibold text-gray-900">
                      {scenario.name}
                    </p>
                  </div>
                  <p className="mt-3 text-[0.8125rem] leading-6 text-gray-500">
                    {scenario.desc}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Bottom CTA ───────────────────────────────────── */}
        <section className="page-section mt-6">
          <div className="hero-canvas lg-ring rounded-[var(--radius-2xl)] px-6 py-10 text-white sm:px-10">
            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <p className="lg-eyebrow text-white/50">
                  <Zap className="h-3.5 w-3.5" />
                  Ready To Estimate
                </p>
                <h2 className="lg-headline mt-3 text-[clamp(1.5rem,3.5vw,2.25rem)] text-white">
                  Enter through the map or use the guided form
                </h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/estimate?start=map"
                  className="lg-pill lg-pill-active px-5 py-3 text-sm font-semibold"
                >
                  <MapPinned className="h-4 w-4" />
                  Launch Map
                </Link>
                <Link
                  href="/estimate?start=form"
                  className="lg-pill border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white"
                >
                  Launch Form
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
