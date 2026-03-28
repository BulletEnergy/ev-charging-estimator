import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateEstimate } from '@/lib/estimate/engine';
import { matchDescription } from '@/lib/estimate/description-normalizer';
import type { EstimateInput } from '@/lib/estimate/types';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.join(__dirname, 'fixtures');

interface ProposalFixture {
  proposalName: string;
  sourceFile: string;
  totalFromProposal: number;
  estimateInput: Record<string, unknown>;
  expectedLineItems: Array<{
    category: string;
    description: string;
    qty: number;
    unitPrice: number;
    amount: number;
  }>;
}

function loadAllFixtures(): ProposalFixture[] {
  const names = fs.readdirSync(fixturesDir).filter((f) => f.endsWith('.json'));
  const out: ProposalFixture[] = [];
  for (const f of names) {
    if (f.startsWith('.')) continue;
    const raw = fs.readFileSync(path.join(fixturesDir, f), 'utf8');
    try {
      const data = JSON.parse(raw) as ProposalFixture;
      if (
        data.proposalName &&
        typeof data.totalFromProposal === 'number' &&
        Array.isArray(data.expectedLineItems) &&
        data.estimateInput
      ) {
        out.push(data);
      }
    } catch {
      /* skip malformed */
    }
  }
  return out;
}

interface Row {
  name: string;
  coverage: string;
  delta: string;
  missing: number;
  subtotal: number;
  expectedTotal: number;
}

function measureRow(fixture: ProposalFixture): Row {
  const output = generateEstimate(fixture.estimateInput as unknown as EstimateInput);
  const nonZero = fixture.expectedLineItems.filter((li) => li.amount > 0 || li.unitPrice > 0);
  let matched = 0;
  let missing = 0;
  for (const expected of nonZero) {
    const hit = output.lineItems.some((li) => matchDescription(li.description, expected.description));
    if (hit) matched++;
    else missing++;
  }
  const coveragePct = nonZero.length ? Math.round((matched / nonZero.length) * 100) : 0;
  const deltaPct =
    fixture.totalFromProposal > 0
      ? Math.round(
          ((output.summary.subtotal - fixture.totalFromProposal) / fixture.totalFromProposal) * 100,
        )
      : 0;
  return {
    name: fixture.proposalName.slice(0, 56),
    coverage: `${coveragePct}%`,
    delta: `${deltaPct > 0 ? '+' : ''}${deltaPct}%`,
    missing,
    subtotal: output.summary.subtotal,
    expectedTotal: fixture.totalFromProposal,
  };
}

describe('Bulk accuracy — all fixtures', () => {
  const fixtures = loadAllFixtures();

  it('summary table (logged)', () => {
    const rows = fixtures.map(measureRow);
    const header = '| Proposal | Coverage | Δ Total | Missing | Engine $ | Expected $ |';
    const sep = '|---|---:|---:|---:|---:|---:|';
    const lines = rows.map(
      (r) =>
        `| ${r.name} | ${r.coverage} | ${r.delta} | ${r.missing} | ${r.subtotal} | ${r.expectedTotal} |`,
    );
    const md = '\n' + [header, sep, ...lines].join('\n') + '\n';
    console.log(md);
    if (process.env.WRITE_ACCURACY_REPORT === '1') {
      const out = path.join(__dirname, '..', 'accuracy-report.md');
      fs.writeFileSync(out, `# Estimate accuracy report\n\n${md}\n`, 'utf8');
    }
    expect(rows.length).toBeGreaterThanOrEqual(14);
  });

  it.each(fixtures.map((f) => [f.proposalName, f] as const))(
    '%s: coverage ≥80%, |total delta| ≤25%',
    (_title, fixture) => {
      const output = generateEstimate(fixture.estimateInput as unknown as EstimateInput);
      const nonZero = fixture.expectedLineItems.filter((li) => li.amount > 0 || li.unitPrice > 0);
      let matched = 0;
      for (const expected of nonZero) {
        if (output.lineItems.some((li) => matchDescription(li.description, expected.description))) {
          matched++;
        }
      }
      const deltaPct =
        fixture.totalFromProposal > 0
          ? Math.abs(
              ((output.summary.subtotal - fixture.totalFromProposal) / fixture.totalFromProposal) *
                100,
            )
          : 0;

      // Tabular fixtures with no expectedLineItems (e.g. Crazy Cajun): assert total only
      if (nonZero.length === 0) {
        expect(deltaPct).toBeLessThanOrEqual(1);
        return;
      }

      const coveragePct = (matched / nonZero.length) * 100;
      expect(coveragePct).toBeGreaterThanOrEqual(80);
      expect(deltaPct).toBeLessThanOrEqual(25);
    },
  );
});
