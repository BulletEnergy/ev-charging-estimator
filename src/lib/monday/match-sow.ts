// ============================================================
// Fuzzy SOW name matcher
// ============================================================
// Used when correlating a Monday deal/lead to a SOW row in the
// mirror. First tries exact-normalized equality, then falls back
// to Levenshtein distance <= 3 on the normalized forms.

const COMPANY_SUFFIXES = [
  'incorporated',
  'inc',
  'llc',
  'l.l.c',
  'corp',
  'corporation',
  'co',
  'company',
  'ltd',
  'limited',
  'lp',
  'llp',
  'plc',
];

/**
 * Normalize a company/deal name for fuzzy comparison.
 * - lowercases
 * - strips punctuation
 * - removes common entity suffixes (Inc, LLC, Corp, Co, Ltd, …)
 * - collapses whitespace
 */
export function normalizeName(s: string): string {
  if (!s) return '';

  const lower = s.toLowerCase();
  const stripped = lower.replace(/[^a-z0-9\s]+/g, ' ');
  const tokens = stripped.split(/\s+/).filter(Boolean);

  while (tokens.length > 1) {
    const last = tokens[tokens.length - 1];
    if (COMPANY_SUFFIXES.includes(last)) {
      tokens.pop();
      continue;
    }
    break;
  }
  return tokens.join(' ').trim();
}

/**
 * Classic Levenshtein edit distance (iterative DP, O(m*n)).
 */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a) return b.length;
  if (!b) return a.length;

  const m = a.length;
  const n = b.length;
  let prev = new Array<number>(n + 1);
  let curr = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      curr[j] = Math.min(
        curr[j - 1] + 1,      // insertion
        prev[j] + 1,          // deletion
        prev[j - 1] + cost,   // substitution
      );
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

const MAX_DISTANCE = 3;

/**
 * Best fuzzy match. Returns null when nothing is close enough.
 * Match rules:
 *   1. Exact normalized equality wins immediately.
 *   2. Otherwise the row with the smallest normalized-Levenshtein
 *      distance, if that distance is <= MAX_DISTANCE AND the
 *      normalized names share the same first token (cheap guard
 *      against "Acme" matching "Apex").
 */
export function matchSowByName<T extends { name: string | null }>(
  dealName: string,
  sowRows: T[],
): T | null {
  const target = normalizeName(dealName);
  if (!target) return null;

  let best: { row: T; distance: number } | null = null;

  for (const row of sowRows) {
    const candidate = normalizeName(row.name ?? '');
    if (!candidate) continue;

    if (candidate === target) return row;

    const targetFirst = target.split(' ')[0];
    const candFirst = candidate.split(' ')[0];
    if (targetFirst !== candFirst) continue;

    const d = levenshtein(candidate, target);
    if (d <= MAX_DISTANCE && (best === null || d < best.distance)) {
      best = { row, distance: d };
    }
  }

  return best?.row ?? null;
}
