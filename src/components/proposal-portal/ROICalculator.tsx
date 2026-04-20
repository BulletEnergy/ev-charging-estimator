/**
 * ROICalculator — ported from portfolio/ROICalculator.
 *
 * Client-side sliders let the customer model their revenue picture. Initial
 * values come from `vm.investmentMetrics` (derived in the adapter); payback is
 * computed live against `vm.investmentMetrics.netTotalUsd`, which is the gross
 * investment minus the estimated rebates shown in the ValueSection.
 *
 * No external deps — native `<input type="range">` styled via the `.pp-range`
 * class defined in globals.css.
 */
'use client';

import { useMemo, useState } from 'react';
import type { ProposalViewModel } from '@/lib/proposal/adapter';

interface ROICalculatorProps {
  vm: ProposalViewModel;
}

function formatDollars(value: number): string {
  if (!Number.isFinite(value)) return '$0';
  const sign = value < 0 ? '-' : '';
  return `${sign}$${Math.round(Math.abs(value)).toLocaleString('en-US')}`;
}

export function ROICalculator({ vm }: ROICalculatorProps) {
  const { investmentMetrics } = vm;

  const [sessionsPerDay, setSessionsPerDay] = useState(
    investmentMetrics.assumedSessionsPerDay
  );
  const [pricePerKwh, setPricePerKwh] = useState(
    investmentMetrics.assumedPricePerKwh
  );
  const [costPerKwh, setCostPerKwh] = useState(
    investmentMetrics.assumedCostPerKwh
  );
  const [avgKwhPerSession, setAvgKwhPerSession] = useState(
    investmentMetrics.assumedKwhPerSession
  );

  const roi = useMemo(() => {
    const dailyKwh = sessionsPerDay * avgKwhPerSession;
    const dailyRevenue = dailyKwh * pricePerKwh;
    const dailyCost = dailyKwh * costPerKwh;
    const dailyProfit = dailyRevenue - dailyCost;
    const annualRevenue = dailyRevenue * 365;
    const annualProfit = dailyProfit * 365;
    const netInvestment = investmentMetrics.netTotalUsd;
    const paybackMonths =
      dailyProfit > 0 && netInvestment > 0
        ? Math.ceil(netInvestment / (dailyProfit * 30))
        : 0;
    const fiveYearReturn = annualProfit * 5 - netInvestment;
    return { annualRevenue, annualProfit, paybackMonths, fiveYearReturn, netInvestment };
  }, [
    sessionsPerDay,
    pricePerKwh,
    costPerKwh,
    avgKwhPerSession,
    investmentMetrics.netTotalUsd,
  ]);

  const sliders: Array<{
    label: string;
    value: number;
    set: (v: number) => void;
    min: number;
    max: number;
    step: number;
    display: string;
  }> = [
    {
      label: 'Sessions per day',
      value: sessionsPerDay,
      set: setSessionsPerDay,
      min: 1,
      max: 120,
      step: 1,
      display: `${sessionsPerDay}`,
    },
    {
      label: 'Price per kWh',
      value: pricePerKwh,
      set: setPricePerKwh,
      min: 0.1,
      max: 1.0,
      step: 0.01,
      display: `$${pricePerKwh.toFixed(2)}`,
    },
    {
      label: 'Cost per kWh',
      value: costPerKwh,
      set: setCostPerKwh,
      min: 0.05,
      max: 0.5,
      step: 0.01,
      display: `$${costPerKwh.toFixed(2)}`,
    },
    {
      label: 'Avg kWh / session',
      value: avgKwhPerSession,
      set: setAvgKwhPerSession,
      min: 5,
      max: 100,
      step: 1,
      display: `${avgKwhPerSession} kWh`,
    },
  ];

  const results: Array<{ label: string; value: string; highlight: boolean }> = [
    {
      label: 'Annual Revenue',
      value: formatDollars(roi.annualRevenue),
      highlight: false,
    },
    {
      label: 'Annual Profit',
      value: formatDollars(roi.annualProfit),
      highlight: false,
    },
    {
      label: 'Payback Period',
      value: roi.paybackMonths > 0 ? `${roi.paybackMonths} months` : '—',
      highlight: true,
    },
    {
      label: '5-Year Net Return',
      value: formatDollars(roi.fiveYearReturn),
      highlight: false,
    },
  ];

  return (
    <section
      className="py-20 md:py-28 px-6"
      style={{ background: 'hsl(var(--pp-secondary) / 0.5)' }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="reveal text-center mb-14">
          <p className="pp-eyebrow mb-3">Model your return</p>
          <h2 className="pp-section-title text-3xl md:text-5xl lg:text-6xl font-bold pp-text-foreground">
            Calculate your return
          </h2>
          <p className="pp-text-muted mt-4 text-base md:text-lg max-w-lg mx-auto">
            Adjust the sliders to model your revenue potential.
          </p>
        </div>

        <div className="reveal grid md:grid-cols-2 gap-10 md:gap-12 items-start">
          {/* Sliders */}
          <div className="space-y-4">
            {sliders.map((s) => (
              <label
                key={s.label}
                htmlFor={`pp-slider-${s.label}`}
                className="pp-slider-row block"
              >
                <div className="flex justify-between items-baseline text-sm mb-3">
                  <span className="pp-text-muted font-medium">{s.label}</span>
                  <span className="font-semibold tabular-nums pp-text-foreground text-base">
                    {s.display}
                  </span>
                </div>
                <input
                  id={`pp-slider-${s.label}`}
                  type="range"
                  min={s.min}
                  max={s.max}
                  step={s.step}
                  value={s.value}
                  onChange={(e) => s.set(Number(e.target.value))}
                  className="pp-range"
                  aria-label={s.label}
                />
              </label>
            ))}
          </div>

          {/* Results */}
          <div className="space-y-1">
            {results.map((r) => (
              <div
                key={r.label}
                className={`flex justify-between items-baseline py-4 ${
                  r.highlight ? 'border-y' : ''
                }`}
                style={
                  r.highlight ? { borderColor: 'hsl(var(--pp-border))' } : undefined
                }
              >
                <span className="text-sm pp-text-muted font-medium">
                  {r.label}
                </span>
                <span
                  className={`pp-result-value text-2xl md:text-3xl font-bold ${
                    r.highlight ? 'pp-text-primary' : 'pp-text-foreground'
                  }`}
                >
                  {r.value}
                </span>
              </div>
            ))}

            <div className="pt-4 flex justify-between items-baseline">
              <span className="text-xs pp-text-muted">Net investment</span>
              <span className="text-sm font-medium tabular-nums pp-text-foreground">
                {formatDollars(roi.netInvestment)}
              </span>
            </div>
            <p className="text-xs pp-text-muted pt-3 leading-relaxed">
              Estimates only. Actual utilization, utility rates, and demand
              charges will affect real-world ROI.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ROICalculator;
