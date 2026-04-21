// ============================================================
// Monday.com Mirror Supabase Client
// ============================================================
// Reads from the NERBLO 5000 mirror (separate Supabase project from
// the estimator's own DB). Read-only — do NOT write.

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  BulletevDealRow,
  BulletevLeadRow,
  BulletevSowRow,
  ClientListEntry,
  ClientSource,
} from './mirror-schema';
import { matchSowByName } from './match-sow';

const url = process.env.NEXT_PUBLIC_MONDAY_MIRROR_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_MONDAY_MIRROR_SUPABASE_ANON_KEY;

export const mondayMirror: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;

export function isMondayMirrorAvailable(): boolean {
  return mondayMirror !== null;
}

const RESULT_CAP = 50;

function escapeIlikeTerm(input: string): string {
  // Escape commas (Supabase .or() delimiter), percent signs, and underscores.
  return input.replace(/[,%_]/g, '\\$&');
}

function dealRowToEntry(row: BulletevDealRow): ClientListEntry {
  return {
    id: row.id,
    name: row.name ?? '(unnamed)',
    source: 'deal',
    siteAddress: row.site_address,
    estimateDate: row.estimate_date,
    status: row.status,
  };
}

function leadRowToEntry(row: BulletevLeadRow): ClientListEntry {
  return {
    id: row.id,
    name: row.name ?? '(unnamed)',
    source: 'lead',
    siteAddress: row.site_address,
    estimateDate: null,
    status: row.status,
  };
}

/**
 * Search across deals + leads. Dedupes by lowercase name (deal wins).
 * Caps at RESULT_CAP entries.
 */
export async function listClients(query?: string): Promise<ClientListEntry[]> {
  if (!mondayMirror) return [];

  const q = query?.trim() ?? '';
  const pattern = q ? `%${escapeIlikeTerm(q)}%` : null;

  const dealQuery = mondayMirror
    .from('bulletev_deals')
    .select(
      'id, name, site_address, estimate_date, status',
    )
    .order('synced_at', { ascending: false })
    .limit(RESULT_CAP);
  if (pattern) dealQuery.ilike('name', pattern);

  const leadQuery = mondayMirror
    .from('bulletev_leads')
    .select('id, name, site_address, status')
    .order('synced_at', { ascending: false })
    .limit(RESULT_CAP);
  if (pattern) leadQuery.ilike('name', pattern);

  const [dealResult, leadResult] = await Promise.all([dealQuery, leadQuery]);

  if (dealResult.error) {
    console.error('[mondayMirror] deals query failed:', dealResult.error.message);
  }
  if (leadResult.error) {
    console.error('[mondayMirror] leads query failed:', leadResult.error.message);
  }

  const dealRows = (dealResult.data ?? []) as BulletevDealRow[];
  const leadRows = (leadResult.data ?? []) as BulletevLeadRow[];

  const seen = new Set<string>();
  const out: ClientListEntry[] = [];

  for (const row of dealRows) {
    const key = (row.name ?? '').toLowerCase().trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(dealRowToEntry(row));
    if (out.length >= RESULT_CAP) return out;
  }
  for (const row of leadRows) {
    const key = (row.name ?? '').toLowerCase().trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(leadRowToEntry(row));
    if (out.length >= RESULT_CAP) return out;
  }

  return out;
}

export async function getClient(
  id: string,
  source: ClientSource,
): Promise<BulletevDealRow | BulletevLeadRow | null> {
  if (!mondayMirror) return null;

  const table = source === 'deal' ? 'bulletev_deals' : 'bulletev_leads';
  const { data, error } = await mondayMirror
    .from(table)
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error(`[mondayMirror] getClient(${source}/${id}) failed:`, error.message);
    return null;
  }
  return (data as BulletevDealRow | BulletevLeadRow | null) ?? null;
}

const SOW_POOL_LIMIT = 200;

/**
 * Best-effort fuzzy SOW match by client name.
 * Pulls the most-recent SOW_POOL_LIMIT rows and runs the matcher.
 */
export async function findSowForClientName(
  name: string,
): Promise<BulletevSowRow | null> {
  if (!mondayMirror) return null;
  if (!name || !name.trim()) return null;

  const { data, error } = await mondayMirror
    .from('bulletev_sow')
    .select('*')
    .order('synced_at', { ascending: false })
    .limit(SOW_POOL_LIMIT);

  if (error) {
    console.error('[mondayMirror] sow pool fetch failed:', error.message);
    return null;
  }

  const pool = (data ?? []) as BulletevSowRow[];
  return matchSowByName(name, pool);
}
