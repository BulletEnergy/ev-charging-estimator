import { describe, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { generateEstimate } from '@/lib/estimate/engine';
import { matchDescription } from '@/lib/estimate/description-normalizer';
import type { EstimateInput } from '@/lib/estimate/types';

describe('Hampton Inn drift diagnostic', () => {
  it('compares engine output line-by-line to proposal fixture', () => {
    const fixturePath = path.resolve(
      __dirname,
      '..',
      'fixtures',
      'proposal-hampton-inn.json',
    );
    const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8')) as {
      proposalName: string;
      totalFromProposal: number;
      estimateInput: EstimateInput;
      expectedLineItems: Array<{
        category: string;
        description: string;
        qty: number;
        unitPrice: number;
        amount: number;
      }>;
    };

    const output = generateEstimate(fixture.estimateInput);

    // ---- All engine lines, grouped by category, sorted by extendedPrice desc
    const byCategory = new Map<string, typeof output.lineItems>();
    for (const li of output.lineItems) {
      const arr = byCategory.get(li.category) ?? [];
      arr.push(li);
      byCategory.set(li.category, arr);
    }

    console.log('\n================ ENGINE OUTPUT (grouped) ================');
    const catTotals: Array<{ cat: string; total: number; count: number }> = [];
    for (const [cat, items] of byCategory) {
      const sorted = [...items].sort((a, b) => b.extendedPrice - a.extendedPrice);
      const catTotal = sorted.reduce((s, x) => s + x.extendedPrice, 0);
      catTotals.push({ cat, total: catTotal, count: sorted.length });
      console.log(`\n  [${cat}] total $${catTotal.toFixed(2)} (${sorted.length} items)`);
      for (const li of sorted) {
        console.log(
          `    - ${li.description.slice(0, 72).padEnd(72)} qty=${String(li.quantity).padStart(4)} @ $${String(li.unitPrice).padStart(7)} = $${li.extendedPrice.toFixed(2).padStart(9)}`,
        );
      }
    }

    console.log('\n================ CATEGORY TOTALS ================');
    catTotals
      .sort((a, b) => b.total - a.total)
      .forEach((c) =>
        console.log(`  ${c.cat.padEnd(24)} $${c.total.toFixed(2).padStart(10)}  (${c.count} lines)`),
      );

    console.log('\n================ PER-LINE COMPARISON ================');
    const matchedIndices = new Set<number>();
    let deltaSum = 0;

    for (const e of fixture.expectedLineItems) {
      const idx = output.lineItems.findIndex((li) => matchDescription(li.description, e.description));
      if (idx === -1) {
        console.log(
          `  MISSING (proposal only): [${e.category}] ${e.description} -- expected $${e.amount}`,
        );
        deltaSum -= e.amount;
        continue;
      }
      matchedIndices.add(idx);
      const m = output.lineItems[idx];
      const engineAmt = m.extendedPrice;
      const diff = engineAmt - e.amount;
      const status =
        Math.abs(diff) < 0.01 ? 'MATCHED' : diff > 0 ? 'MATCHED (engine HIGHER)' : 'MATCHED (engine LOWER)';
      console.log(
        `  ${status.padEnd(24)} [${e.category}] ${e.description.slice(0, 60).padEnd(60)}  qty ${e.qty}->${m.quantity}  unit $${e.unitPrice}->$${m.unitPrice}  amt $${e.amount}->$${engineAmt.toFixed(2)}  Δ $${diff.toFixed(2)}`,
      );
      deltaSum += diff;
    }

    console.log('\n================ EXTRA ENGINE LINES (not in fixture) ================');
    let extraSum = 0;
    output.lineItems.forEach((li, idx) => {
      if (!matchedIndices.has(idx)) {
        console.log(
          `  EXTRA (engine only): [${li.category}] ${li.description.slice(0, 60)}  qty=${li.quantity} unit=$${li.unitPrice} = $${li.extendedPrice.toFixed(2)}`,
        );
        extraSum += li.extendedPrice;
      }
    });

    console.log('\n================ SUMMARY ================');
    console.log(`  Proposal total       : $${fixture.totalFromProposal}`);
    console.log(`  Engine total         : $${output.summary.total}`);
    console.log(`  Raw delta            : $${(output.summary.total - fixture.totalFromProposal).toFixed(2)}`);
    console.log(`  Sum of matched deltas: $${deltaSum.toFixed(2)}`);
    console.log(`  Sum of extra lines   : $${extraSum.toFixed(2)}`);
    console.log(`  subtotal / total / grandTotal (engine): ${JSON.stringify(output.summary)}`);
  });
});
