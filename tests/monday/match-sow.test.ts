import { describe, it, expect } from 'vitest';
import { normalizeName, levenshtein, matchSowByName } from '@/lib/monday/match-sow';

describe('normalizeName', () => {
  it('lowercases, strips punctuation, trims suffixes', () => {
    expect(normalizeName('Acme, Inc.')).toBe('acme');
    expect(normalizeName('Hampton Hospitality, LLC')).toBe('hampton hospitality');
    expect(normalizeName('Bullet EV Corp.')).toBe('bullet ev');
    expect(normalizeName('RIVER MOUNTAIN COMPANY')).toBe('river mountain');
  });

  it('keeps single-word names even if the word matches a suffix', () => {
    expect(normalizeName('Inc')).toBe('inc');
  });

  it('returns empty for blank input', () => {
    expect(normalizeName('')).toBe('');
    expect(normalizeName('   ')).toBe('');
  });
});

describe('levenshtein', () => {
  it('returns 0 for identical strings', () => {
    expect(levenshtein('abc', 'abc')).toBe(0);
  });

  it('returns the edit distance', () => {
    expect(levenshtein('kitten', 'sitting')).toBe(3);
    expect(levenshtein('abc', 'abd')).toBe(1);
    expect(levenshtein('', 'abc')).toBe(3);
    expect(levenshtein('abc', '')).toBe(3);
  });
});

describe('matchSowByName', () => {
  const rows = [
    { id: 's1', name: 'Acme, LLC' },
    { id: 's2', name: 'Hampton Inn' },
    { id: 's3', name: 'Hampton Inn Suites' },
    { id: 's4', name: 'River Mountain Hospitality, Inc.' },
    { id: 's5', name: 'River Mtn Hospitality' },
    { id: 's6', name: 'Zeta Corp' },
  ];

  it('exact-normalized match wins', () => {
    // Punctuation differences normalize to "acme" both sides.
    const m = matchSowByName('Acme Inc.', rows);
    expect(m?.id).toBe('s1');
  });

  it('normalizes Inc vs LLC to the same entity', () => {
    const m = matchSowByName('Acme LLC', [{ id: 'x', name: 'Acme Inc' }]);
    expect(m?.id).toBe('x');
  });

  it('rejects Hampton Inn vs Hampton Inn Suites (too far)', () => {
    const m = matchSowByName('Hampton Inn Downtown Luxury Resort', rows);
    // Normalizes to "hampton inn downtown luxury resort" — too far from any row.
    expect(m).toBeNull();
  });

  it('returns exact match when present rather than a close neighbor', () => {
    const m = matchSowByName('Hampton Inn', rows);
    expect(m?.id).toBe('s2');
  });

  it('returns null when no row is within distance 3', () => {
    const m = matchSowByName('Completely Unrelated Name', rows);
    expect(m).toBeNull();
  });

  it('matches when edit distance is small (<=3)', () => {
    // "hampton in" vs "hampton inn" normalized = distance 1, same first token.
    const m = matchSowByName('Hampton In', rows);
    expect(m?.id).toBe('s2');
  });

  it('returns null on empty input', () => {
    expect(matchSowByName('', rows)).toBeNull();
    expect(matchSowByName('Something', [])).toBeNull();
  });
});
