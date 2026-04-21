// ============================================================
// Monday.com Mirror Supabase Schema
// ============================================================
// Row shapes for the three mirror tables in NERBLO 5000:
//   bulletev_deals, bulletev_leads, bulletev_sow.
// The dashboard (/mnt/c/Users/pmend/bulletev-dashboard) writes
// these rows via Monday webhook + sync cron — we read only.

export interface BulletevDealRow {
  id: string;
  monday_board_id: string | null;
  name: string | null;
  owner: string | null;
  value: number | null;
  status: string | null;
  group_title: string | null;
  site_type: string | null;
  lead_source: string | null;
  site_contact: string | null;
  site_contact_email: string | null;
  site_contact_phone: string | null;
  site_company: string | null;
  site_address: string | null;
  site_city: string | null;
  site_state: string | null;
  site_zip: string | null;
  job_number: string | null;
  lead_date: string | null;
  estimate_date: string | null;
  proposal_date: string | null;
  stage_entry_date: string | null;
  raw_column_values: Record<string, unknown> | null;
  synced_at: string | null;
}

export interface BulletevLeadRow {
  id: string;
  monday_board_id: string | null;
  name: string | null;
  assigned_to: string | null;
  status: string | null;
  lead_source: string | null;
  site_type: string | null;
  site_contact: string | null;
  site_contact_email: string | null;
  site_contact_phone: string | null;
  site_company: string | null;
  site_address: string | null;
  site_city: string | null;
  site_state: string | null;
  site_zip: string | null;
  lead_score: number | null;
  lead_tier: string | null;
  lead_age_days: number | null;
  lead_date: string | null;
  stage_entry_date: string | null;
  raw_column_values: Record<string, unknown> | null;
  synced_at: string | null;
}

/**
 * SOW table schema — we use `select *` at runtime because the full column
 * list is long and sparsely populated. This interface documents the fields
 * the estimator cares about; unknown fields pass through in rawColumnValues.
 */
export interface BulletevSowRow {
  id: string;
  monday_board_id: string | null;
  name: string | null;
  sales_rep: string | null;
  project_type: string | null;
  site_type: string | null;
  install_location: string | null;
  new_construction: boolean | null;
  charger_brand: string | null;
  charger_model?: string | null;
  charger_count?: number | null;
  pedestal_count?: number | null;
  port_type?: string | null;
  mount_type?: string | null;
  customer_supplied?: boolean | null;
  charging_level?: string | null;
  amps_per_charger?: number | null;
  volts?: number | null;
  service_type?: string | null;
  distance_to_panel?: number | null;
  panel_upgrade?: boolean | null;
  transformer_required?: boolean | null;
  permit_responsibility?: string | null;
  design_responsibility?: string | null;
  make_ready_responsibility?: string | null;
  install_responsibility?: string | null;
  purchasing_responsibility?: string | null;
  network_type?: string | null;
  notes?: string | null;
  raw_column_values?: Record<string, unknown> | null;
  synced_at?: string | null;
  // Index signature to allow any extra mirrored columns to pass through.
  [key: string]: unknown;
}

export type ClientSource = 'deal' | 'lead';

export interface ClientListEntry {
  id: string;
  name: string;
  source: ClientSource;
  siteAddress: string | null;
  estimateDate: string | null;
  status: string | null;
}
