/**
 * ValueSection — ported from portfolio/ValueSection.
 *
 * Headline grid of 6 metrics that translate the proposal into marketable
 * outcomes: payback period, rebate potential, CO2 offset, property-value lift,
 * warranty, and install time. Values come from `vm.investmentMetrics` (rebates,
 * payback, CO2 are derived in the adapter); the other three are steady
 * marketing copy that applies to every BulletEV deployment.
 */

import type { ProposalViewModel } from '@/lib/proposal/adapter';

interface ValueSectionProps {
  vm: ProposalViewModel;
}

function extractTimelineWeeks(timelineHint: string): string {
  if (!timelineHint) return '6–8';
  // Strip "wk" / "week(s)" suffix and surrounding whitespace.
  const cleaned = timelineHint
    .replace(/\s*weeks?\b/gi, '')
    .replace(/\s*wk\b/gi, '')
    .trim();
  return cleaned || '6–8';
}

export function ValueSection({ vm }: ValueSectionProps) {
  const { investmentMetrics } = vm;
  const rebateK = Math.round(investmentMetrics.estimatedRebatesUsd / 1000);

  const metrics: Array<{ value: string; unit: string; label: string }> = [
    {
      value: `${investmentMetrics.estimatedPaybackYears || '—'}`,
      unit: 'yr',
      label: 'Est. Payback Period',
    },
    {
      value: `$${rebateK}`,
      unit: 'K',
      label: 'Rebate Potential',
    },
    {
      value: `${investmentMetrics.co2OffsetTonsPerYear}`,
      unit: 'tons',
      label: 'CO₂ Offset / Year',
    },
    {
      value: '12–18',
      unit: '%',
      label: 'Property Value Lift',
    },
    {
      value: '5',
      unit: 'Year',
      label: 'Full Warranty',
    },
    {
      value: extractTimelineWeeks(vm.timeline[0]?.detail ?? '6–8 weeks'),
      unit: 'wk',
      label: 'Install Time',
    },
  ];

  return (
    <section className="py-24 md:py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="reveal text-center mb-14">
          <p className="pp-eyebrow mb-3">Value</p>
          <h2 className="pp-section-title text-3xl md:text-5xl lg:text-6xl font-bold pp-text-foreground">
            Why now is the perfect time
          </h2>
          <p className="pp-text-muted mt-4 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Federal and state incentives, climbing EV adoption, and customer
            demand make 2026 the strongest year yet to deploy on-site charging.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-12 gap-x-8 stagger">
          {metrics.map((m) => (
            <div key={m.label} className="reveal text-center">
              <p className="text-5xl md:text-7xl font-bold tracking-tight tabular-nums pp-text-foreground leading-[1.05]">
                {m.value}
                <span className="pp-text-muted text-2xl md:text-3xl ml-1 font-semibold">
                  {m.unit}
                </span>
              </p>
              <p className="pp-text-muted text-xs md:text-sm mt-3 tracking-[0.14em] uppercase font-medium">
                {m.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ValueSection;
