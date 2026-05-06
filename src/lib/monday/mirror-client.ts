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
const DASHBOARD_PAGE_SIZE = 1000;
const DASHBOARD_MAX_ROWS = 10000;

type LeadDashboardDeal = Pick<
  BulletevDealRow,
  | 'id'
  | 'name'
  | 'owner'
  | 'value'
  | 'status'
  | 'group_title'
  | 'lead_source'
  | 'site_company'
  | 'lead_date'
  | 'estimate_date'
  | 'proposal_date'
  | 'stage_entry_date'
  | 'synced_at'
>;

type LeadDashboardLead = Pick<
  BulletevLeadRow,
  | 'id'
  | 'name'
  | 'assigned_to'
  | 'status'
  | 'lead_source'
  | 'site_company'
  | 'lead_date'
  | 'stage_entry_date'
  | 'synced_at'
>;

export interface LeadDashboardMetrics {
  leadsReceived: number;
  opportunities: number;
  estimates: number;
  proposals: number;
  signedJobs: number;
  totalLeadValue: number;
  estimateValue: number;
  proposalValue: number;
  signedValue: number;
  unbidOpportunityValue: number;
  averageOpportunityValue: number;
  conversionRate: number;
  estimateRate: number;
  proposalRate: number;
  signedRate: number;
}

export interface LeadDashboardSourceBreakdown {
  source: string;
  leads: number;
  opportunities: number;
  estimates: number;
  proposals: number;
  signedJobs: number;
  value: number;
  estimateValue: number;
  proposalValue: number;
  signedValue: number;
}

export type LeadDashboardStage =
  | 'leads'
  | 'opportunities'
  | 'estimates'
  | 'proposals'
  | 'signed';

export interface LeadDashboardRecentItem {
  id: string;
  source: ClientSource;
  name: string;
  owner: string | null;
  status: string | null;
  group: string | null;
  leadSource: string | null;
  value: number | null;
  leadDate: string | null;
  estimateDate: string | null;
  proposalDate: string | null;
  activityDate: string | null;
  stage: LeadDashboardStage;
}

export interface LeadDashboardData {
  metrics: LeadDashboardMetrics;
  sourceBreakdown: LeadDashboardSourceBreakdown[];
  recentItems: LeadDashboardRecentItem[];
  sampledRows: {
    leads: number;
    deals: number;
    capped: boolean;
  };
}

export interface LeadDashboardDateRange {
  from?: string;
  to?: string;
}

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

function toNumber(value: number | null | undefined): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function normalizeDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    const dateOnly = value.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
    return dateOnly ?? null;
  }
  return date.toISOString().slice(0, 10);
}

function isInDateRange(value: string | null | undefined, range?: LeadDashboardDateRange): boolean {
  const normalized = normalizeDate(value);
  if (!normalized) return false;
  if (range?.from && normalized < range.from) return false;
  if (range?.to && normalized > range.to) return false;
  return true;
}

function hasDateRange(range?: LeadDashboardDateRange): boolean {
  return Boolean(range?.from || range?.to);
}

function leadActivityDate(lead: LeadDashboardLead): string | null {
  return lead.lead_date ?? lead.stage_entry_date ?? lead.synced_at;
}

function opportunityDate(deal: LeadDashboardDeal): string | null {
  return deal.lead_date ?? deal.stage_entry_date ?? deal.synced_at;
}

function estimateActivityDate(deal: LeadDashboardDeal): string | null {
  return deal.estimate_date ?? deal.proposal_date ?? deal.stage_entry_date ?? deal.lead_date ?? deal.synced_at;
}

function proposalActivityDate(deal: LeadDashboardDeal): string | null {
  return deal.proposal_date ?? deal.stage_entry_date ?? deal.estimate_date ?? deal.lead_date ?? deal.synced_at;
}

function signedActivityDate(deal: LeadDashboardDeal): string | null {
  return deal.stage_entry_date ?? deal.proposal_date ?? deal.estimate_date ?? deal.lead_date ?? deal.synced_at;
}

function hasTerm(value: string | null | undefined, terms: string[]): boolean {
  const normalized = value?.toLowerCase() ?? '';
  return terms.some((term) => normalized.includes(term));
}

function dealText(deal: LeadDashboardDeal): string {
  return `${deal.status ?? ''} ${deal.group_title ?? ''}`;
}

function hasEstimate(deal: LeadDashboardDeal): boolean {
  if (deal.estimate_date || deal.proposal_date) return true;
  const text = dealText(deal);
  return ['estimate', 'bid', 'quote', 'proposal', 'sent', 'won', 'signed', 'closed'].some((term) =>
    text.toLowerCase().includes(term),
  );
}

function hasProposal(deal: LeadDashboardDeal): boolean {
  if (deal.proposal_date) return true;
  const text = dealText(deal);
  return ['proposal', 'proposed', 'quote', 'quoted', 'sent', 'won', 'signed', 'closed'].some((term) =>
    text.toLowerCase().includes(term),
  );
}

function isSignedJob(deal: LeadDashboardDeal): boolean {
  return hasTerm(dealText(deal), [
    'signed',
    'won',
    'closed won',
    'accepted',
    'approved',
    'contract',
    'sold',
    'job',
  ]);
}

function stageForDeal(deal: LeadDashboardDeal): LeadDashboardStage {
  if (isSignedJob(deal)) return 'signed';
  if (hasProposal(deal)) return 'proposals';
  if (hasEstimate(deal)) return 'estimates';
  return 'opportunities';
}

async function fetchDashboardRows<T>(
  table: 'bulletev_deals' | 'bulletev_leads',
  select: string,
): Promise<{ rows: T[]; capped: boolean }> {
  if (!mondayMirror) return { rows: [], capped: false };

  const rows: T[] = [];
  for (let from = 0; from < DASHBOARD_MAX_ROWS; from += DASHBOARD_PAGE_SIZE) {
    const to = from + DASHBOARD_PAGE_SIZE - 1;
    const { data, error } = await mondayMirror
      .from(table)
      .select(select)
      .order('synced_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error(`[mondayMirror] ${table} dashboard query failed:`, error.message);
      break;
    }

    const page = (data ?? []) as T[];
    rows.push(...page);
    if (page.length < DASHBOARD_PAGE_SIZE) {
      return { rows, capped: false };
    }
  }

  return { rows, capped: true };
}

function sourceLabel(source: string | null): string {
  const clean = source?.trim();
  return clean && clean.length > 0 ? clean : 'Unknown';
}

export async function getLeadDashboardData(range?: LeadDashboardDateRange): Promise<LeadDashboardData> {
  if (!mondayMirror) {
    return {
      metrics: {
        leadsReceived: 0,
        opportunities: 0,
        estimates: 0,
        proposals: 0,
        signedJobs: 0,
        totalLeadValue: 0,
        estimateValue: 0,
        proposalValue: 0,
        signedValue: 0,
        unbidOpportunityValue: 0,
        averageOpportunityValue: 0,
        conversionRate: 0,
        estimateRate: 0,
        proposalRate: 0,
        signedRate: 0,
      },
      sourceBreakdown: [],
      recentItems: [],
      sampledRows: { leads: 0, deals: 0, capped: false },
    };
  }

  const [leadResult, dealResult] = await Promise.all([
    fetchDashboardRows<LeadDashboardLead>(
      'bulletev_leads',
      'id, name, assigned_to, status, lead_source, site_company, lead_date, stage_entry_date, synced_at',
    ),
    fetchDashboardRows<LeadDashboardDeal>(
      'bulletev_deals',
      'id, name, owner, value, status, group_title, lead_source, site_company, lead_date, estimate_date, proposal_date, stage_entry_date, synced_at',
    ),
  ]);

  const dateFiltered = hasDateRange(range);
  const leads = dateFiltered
    ? leadResult.rows.filter((lead) => isInDateRange(leadActivityDate(lead), range))
    : leadResult.rows;
  const opportunityDeals = dateFiltered
    ? dealResult.rows.filter((deal) => isInDateRange(opportunityDate(deal), range))
    : dealResult.rows;
  const estimateDeals = dealResult.rows.filter(
    (deal) => hasEstimate(deal) && (!dateFiltered || isInDateRange(estimateActivityDate(deal), range)),
  );
  const proposalDeals = dealResult.rows.filter(
    (deal) => hasProposal(deal) && (!dateFiltered || isInDateRange(proposalActivityDate(deal), range)),
  );
  const signedDeals = dealResult.rows.filter(
    (deal) => isSignedJob(deal) && (!dateFiltered || isInDateRange(signedActivityDate(deal), range)),
  );
  const totalLeadValue = opportunityDeals.reduce((sum, deal) => sum + toNumber(deal.value), 0);
  const bidDealIds = new Set(estimateDeals.map((deal) => deal.id));
  const estimateValue = estimateDeals.reduce((sum, deal) => sum + toNumber(deal.value), 0);
  const proposalValue = proposalDeals.reduce((sum, deal) => sum + toNumber(deal.value), 0);
  const signedValue = signedDeals.reduce((sum, deal) => sum + toNumber(deal.value), 0);
  const unbidOpportunityValue = opportunityDeals.reduce(
    (sum, deal) => sum + (bidDealIds.has(deal.id) ? 0 : toNumber(deal.value)),
    0,
  );

  const bySource = new Map<string, LeadDashboardSourceBreakdown>();
  const ensureSource = (source: string | null): LeadDashboardSourceBreakdown => {
    const label = sourceLabel(source);
    const existing = bySource.get(label);
    if (existing) return existing;
    const next = {
      source: label,
      leads: 0,
      opportunities: 0,
      estimates: 0,
      proposals: 0,
      signedJobs: 0,
      value: 0,
      estimateValue: 0,
      proposalValue: 0,
      signedValue: 0,
    };
    bySource.set(label, next);
    return next;
  };

  for (const lead of leads) {
    ensureSource(lead.lead_source).leads += 1;
  }

  for (const deal of opportunityDeals) {
    const bucket = ensureSource(deal.lead_source);
    const dealValue = toNumber(deal.value);
    bucket.opportunities += 1;
    bucket.value += dealValue;
  }

  for (const deal of estimateDeals) {
    const bucket = ensureSource(deal.lead_source);
    bucket.estimates += 1;
    bucket.estimateValue += toNumber(deal.value);
  }

  for (const deal of proposalDeals) {
    const bucket = ensureSource(deal.lead_source);
    bucket.proposals += 1;
    bucket.proposalValue += toNumber(deal.value);
  }

  for (const deal of signedDeals) {
    const bucket = ensureSource(deal.lead_source);
    bucket.signedJobs += 1;
    bucket.signedValue += toNumber(deal.value);
  }

  const recentLeadItems: LeadDashboardRecentItem[] = leads.map((lead) => ({
    id: lead.id,
    source: 'lead',
    name: lead.site_company ?? lead.name ?? '(unnamed lead)',
    owner: lead.assigned_to,
    status: lead.status,
    group: null,
    leadSource: lead.lead_source,
    value: null,
    leadDate: lead.lead_date ?? lead.stage_entry_date,
    estimateDate: null,
    proposalDate: null,
    activityDate: leadActivityDate(lead),
    stage: 'leads',
  }));

  const stageDeals = new Map<string, LeadDashboardRecentItem>();
  const addDealItem = (deal: LeadDashboardDeal, stage: LeadDashboardStage, activityDate: string | null) => {
    stageDeals.set(`${stage}-${deal.id}`, {
      id: deal.id,
      source: 'deal',
      name: deal.site_company ?? deal.name ?? '(unnamed opportunity)',
      owner: deal.owner,
      status: deal.status,
      group: deal.group_title,
      leadSource: deal.lead_source,
      value: deal.value,
      leadDate: deal.lead_date,
      estimateDate: deal.estimate_date,
      proposalDate: deal.proposal_date,
      activityDate,
      stage,
    });
  };

  for (const deal of opportunityDeals) {
    addDealItem(deal, stageForDeal(deal), opportunityDate(deal));
  }
  for (const deal of estimateDeals) {
    addDealItem(deal, 'estimates', estimateActivityDate(deal));
  }
  for (const deal of proposalDeals) {
    addDealItem(deal, 'proposals', proposalActivityDate(deal));
  }
  for (const deal of signedDeals) {
    addDealItem(deal, 'signed', signedActivityDate(deal));
  }

  const recentDealItems: LeadDashboardRecentItem[] = [...stageDeals.values()];

  const recentItems = [...recentLeadItems, ...recentDealItems]
    .sort((a, b) =>
      (normalizeDate(b.activityDate) ?? '').localeCompare(normalizeDate(a.activityDate) ?? ''),
    )
    .slice(0, 200);

  const metrics: LeadDashboardMetrics = {
    leadsReceived: leads.length,
    opportunities: opportunityDeals.length,
    estimates: estimateDeals.length,
    proposals: proposalDeals.length,
    signedJobs: signedDeals.length,
    totalLeadValue,
    estimateValue,
    proposalValue,
    signedValue,
    unbidOpportunityValue,
    averageOpportunityValue: opportunityDeals.length > 0 ? totalLeadValue / opportunityDeals.length : 0,
    conversionRate: leads.length > 0 ? opportunityDeals.length / leads.length : 0,
    estimateRate: opportunityDeals.length > 0 ? estimateDeals.length / opportunityDeals.length : 0,
    proposalRate: opportunityDeals.length > 0 ? proposalDeals.length / opportunityDeals.length : 0,
    signedRate: opportunityDeals.length > 0 ? signedDeals.length / opportunityDeals.length : 0,
  };

  return {
    metrics,
    sourceBreakdown: [...bySource.values()].sort((a, b) => b.value - a.value),
    recentItems,
    sampledRows: {
      leads: leads.length,
      deals: opportunityDeals.length,
      capped: leadResult.capped || dealResult.capped,
    },
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
