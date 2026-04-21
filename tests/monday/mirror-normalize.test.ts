import { describe, it, expect } from 'vitest';
import { normalizeMirrorRow } from '@/lib/monday/normalize';
import type {
  BulletevDealRow,
  BulletevLeadRow,
  BulletevSowRow,
} from '@/lib/monday/mirror-schema';

function emptyDeal(overrides: Partial<BulletevDealRow> = {}): BulletevDealRow {
  return {
    id: 'd1',
    monday_board_id: null,
    name: null,
    owner: null,
    value: null,
    status: null,
    group_title: null,
    site_type: null,
    lead_source: null,
    site_contact: null,
    site_contact_email: null,
    site_contact_phone: null,
    site_company: null,
    site_address: null,
    site_city: null,
    site_state: null,
    site_zip: null,
    job_number: null,
    lead_date: null,
    estimate_date: null,
    proposal_date: null,
    stage_entry_date: null,
    raw_column_values: null,
    synced_at: null,
    ...overrides,
  };
}

function emptyLead(overrides: Partial<BulletevLeadRow> = {}): BulletevLeadRow {
  return {
    id: 'l1',
    monday_board_id: null,
    name: null,
    assigned_to: null,
    status: null,
    lead_source: null,
    site_type: null,
    site_contact: null,
    site_contact_email: null,
    site_contact_phone: null,
    site_company: null,
    site_address: null,
    site_city: null,
    site_state: null,
    site_zip: null,
    lead_score: null,
    lead_tier: null,
    lead_age_days: null,
    lead_date: null,
    stage_entry_date: null,
    raw_column_values: null,
    synced_at: null,
    ...overrides,
  };
}

describe('normalizeMirrorRow', () => {
  it('maps a deal without SOW into customer + site fields', () => {
    const deal = emptyDeal({
      name: 'Acme Hotel Project',
      site_company: 'Acme Hotels Inc.',
      site_contact: 'Jane Doe',
      site_contact_email: 'jane@acme.com',
      site_contact_phone: '555-555-5555',
      site_address: '123 Main St',
      site_city: 'Austin',
      site_state: 'TX',
      site_zip: '78701',
      site_type: 'Hotel',
    });

    const result = normalizeMirrorRow(deal, null);

    expect(result.customer?.companyName).toBe('Acme Hotels Inc.');
    expect(result.customer?.contactName).toBe('Jane Doe');
    expect(result.customer?.contactEmail).toBe('jane@acme.com');
    expect(result.customer?.billingAddress).toContain('123 Main St');
    expect(result.customer?.billingAddress).toContain('Austin');
    expect(result.customer?.billingAddress).toContain('TX');
    expect(result.site?.address).toBe('123 Main St');
    expect(result.site?.state).toBe('TX');
    expect(result.site?.siteType).toBe('hotel');
    expect(result.project?.name).toBe('Acme Hotel Project');
    expect(result.project?.projectType).toBe('full_turnkey');
  });

  it('merges SOW data into project + charger + electrical', () => {
    const deal = emptyDeal({
      name: 'Hilton Garage',
      site_address: '500 Park Ave',
      site_state: 'NY',
      site_type: 'Hotel',
    });

    const sow: BulletevSowRow = {
      id: 's1',
      monday_board_id: null,
      name: 'Hilton Garage',
      sales_rep: 'Alex',
      project_type: 'Full Turnkey',
      site_type: 'Hotel',
      install_location: 'Basement garage level 2',
      new_construction: true,
      charger_brand: 'ChargePoint',
      charger_count: 8,
      pedestal_count: 4,
      mount_type: 'Pedestal',
      port_type: 'Dual',
      charging_level: 'Level 2',
      amps_per_charger: 40,
      volts: 208,
      customer_supplied: false,
      service_type: '208V',
      distance_to_panel: 120,
      panel_upgrade: true,
      transformer_required: false,
      permit_responsibility: 'Bullet',
      design_responsibility: 'Bullet',
      make_ready_responsibility: 'Client',
      install_responsibility: 'Bullet',
      purchasing_responsibility: 'Bullet',
      network_type: 'Cellular Router',
      notes: 'Staging area behind entrance',
    };

    const result = normalizeMirrorRow(deal, sow);

    expect(result.project?.salesRep).toBe('Alex');
    expect(result.project?.projectType).toBe('full_turnkey');
    expect(result.project?.isNewConstruction).toBe(true);
    expect(result.charger?.brand).toBe('ChargePoint');
    expect(result.charger?.count).toBe(8);
    expect(result.charger?.pedestalCount).toBe(4);
    expect(result.charger?.mountType).toBe('pedestal');
    expect(result.charger?.portType).toBe('dual');
    expect(result.charger?.chargingLevel).toBe('l2');
    expect(result.charger?.ampsPerCharger).toBe(40);
    expect(result.electrical?.serviceType).toBe('208v');
    expect(result.electrical?.distanceToPanel_ft).toBe(120);
    expect(result.electrical?.panelUpgradeRequired).toBe(true);
    expect(result.electrical?.transformerRequired).toBe(false);
    expect(result.civil?.installationLocationDescription).toBe(
      'Basement garage level 2',
    );
    expect(result.permit?.responsibility).toBe('bullet');
    expect(result.designEngineering?.responsibility).toBe('bullet');
    expect(result.makeReady?.responsibility).toBe('client');
    expect(result.chargerInstall?.responsibility).toBe('bullet');
    expect(result.purchasingChargers?.responsibility).toBe('bullet');
    expect(result.network?.type).toBe('cellular_router');
    expect(result.notes).toBe('Staging area behind entrance');
  });

  it('normalizes a lead row (no SOW)', () => {
    const lead = emptyLead({
      name: 'Prospect Co',
      site_contact: 'Bob',
      site_contact_email: 'bob@prospect.com',
      site_type: 'Office',
      site_state: 'CA',
    });
    const result = normalizeMirrorRow(lead, null);
    expect(result.customer?.contactName).toBe('Bob');
    expect(result.site?.siteType).toBe('office');
    expect(result.site?.state).toBe('CA');
    expect(result.project?.name).toBe('Prospect Co');
  });

  it('handles null/empty fields without crashing', () => {
    const deal = emptyDeal();
    const result = normalizeMirrorRow(deal, null);
    expect(result.customer?.contactEmail).toBe('');
    expect(result.site?.address).toBe('');
    expect(result.site?.siteType).toBeNull();
    expect(result.project?.name).toBe('');
  });

  it('ignores unknown enum labels gracefully', () => {
    const deal = emptyDeal({
      name: 'Weird Co',
      site_type: 'SomethingWeNeverSaw',
    });
    const sow: BulletevSowRow = {
      id: 's2',
      monday_board_id: null,
      name: 'Weird Co',
      sales_rep: 'Sam',
      project_type: 'Unknown Type',
      site_type: null,
      install_location: null,
      new_construction: null,
      charger_brand: null,
    };
    const result = normalizeMirrorRow(deal, sow);
    // Unknown site_type → null, unknown project_type → retains default 'full_turnkey'.
    expect(result.site?.siteType).toBeNull();
    expect(result.project?.projectType).toBe('full_turnkey');
    expect(result.project?.salesRep).toBe('Sam');
  });
});
