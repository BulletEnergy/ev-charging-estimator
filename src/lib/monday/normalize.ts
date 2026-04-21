import { EstimateInput } from '../estimate/types';
import { BOARD_CONFIG } from './config';
import type {
  BulletevDealRow,
  BulletevLeadRow,
  BulletevSowRow,
} from './mirror-schema';

// ============================================================
// monday.com Item Normalizer
// ============================================================
// Converts raw monday.com column_values into EstimateInput.

interface MondayColumnValue {
  id: string;
  value: string | null;
  text: string | null;
}

interface MondayItem {
  id: string;
  name: string;
  column_values: MondayColumnValue[];
}

function getCol(
  item: MondayItem,
  colId: string,
): MondayColumnValue | undefined {
  return item.column_values.find((cv) => cv.id === colId);
}

function getText(item: MondayItem, colId: string): string {
  return getCol(item, colId)?.text ?? '';
}

function getNumber(item: MondayItem, colId: string): number | null {
  const txt = getText(item, colId);
  if (!txt) return null;
  const n = parseFloat(txt);
  return isNaN(n) ? null : n;
}

function getBool(item: MondayItem, colId: string): boolean | null {
  const val = getCol(item, colId)?.value;
  if (val === null || val === undefined) return null;
  try {
    const parsed = JSON.parse(val);
    return parsed?.checked === 'true' || parsed?.checked === true;
  } catch {
    return null;
  }
}

function mapLabel(
  item: MondayItem,
  colId: string,
  labelMap: Record<string, string>,
  fallback: string | null = null,
): string | null {
  const text = getText(item, colId);
  if (!text) return fallback;
  const mapped = labelMap[text];
  return mapped ?? fallback;
}

// ── Main Normalizer ──────────────────────────────────────────

export function normalizeMondayItem(item: MondayItem): EstimateInput {
  const cols = BOARD_CONFIG.columnMappings;
  const labels = BOARD_CONFIG.labelMaps;

  return {
    project: {
      name: item.name || getText(item, cols.projectName),
      salesRep: getText(item, cols.salesRep),
      projectType:
        (mapLabel(item, cols.projectType, labels.projectType) as EstimateInput['project']['projectType']) ??
        'full_turnkey',
      timeline: getText(item, cols.timeline),
      isNewConstruction: getBool(item, cols.isNewConstruction),
    },
    customer: {
      companyName: getText(item, cols.companyName),
      contactName: getText(item, cols.contactName),
      contactEmail: getText(item, cols.contactEmail),
      contactPhone: getText(item, cols.contactPhone),
      billingAddress: getText(item, cols.billingAddress),
    },
    site: {
      address: getText(item, cols.siteAddress),
      siteType: mapLabel(item, cols.siteType, labels.siteType) as EstimateInput['site']['siteType'],
      state: getText(item, cols.state),
    },
    parkingEnvironment: {
      type: mapLabel(item, cols.parkingType, labels.parkingType) as EstimateInput['parkingEnvironment']['type'],
      hasPTSlab: getBool(item, cols.hasPTSlab),
      slabScanRequired: null, // No monday.com column mapped yet — requires board customization
      coringRequired: null, // No monday.com column mapped yet — requires board customization
      surfaceType: mapLabel(
        item,
        cols.surfaceType,
        labels.surfaceType,
      ) as EstimateInput['parkingEnvironment']['surfaceType'],
      trenchingRequired: getBool(item, cols.trenchingRequired),
      boringRequired: getBool(item, cols.boringRequired),
      trafficControlRequired: null, // No monday.com column mapped yet — requires board customization
      indoorOutdoor: mapLabel(
        item,
        cols.indoorOutdoor,
        { Indoor: 'indoor', Outdoor: 'outdoor', Both: 'both' },
      ) as EstimateInput['parkingEnvironment']['indoorOutdoor'],
      fireRatedPenetrations: null, // No monday.com column mapped yet — requires board customization
      accessRestrictions: '', // No monday.com column mapped yet — requires board customization
    },
    charger: {
      brand: getText(item, cols.chargerBrand),
      model: getText(item, cols.chargerModel),
      count: getNumber(item, cols.chargerCount) ?? 0,
      pedestalCount: getNumber(item, cols.pedestalCount) ?? 0,
      portType: mapLabel(
        item,
        cols.portType,
        { Single: 'single', Dual: 'dual', Mix: 'mix' },
      ) as EstimateInput['charger']['portType'],
      mountType: mapLabel(
        item,
        cols.mountType,
        { Pedestal: 'pedestal', Wall: 'wall', Mix: 'mix', Other: 'other' },
      ) as EstimateInput['charger']['mountType'],
      isCustomerSupplied: getBool(item, cols.customerSupplied) ?? false,
      chargingLevel: mapLabel(
        item,
        cols.chargingLevel,
        { 'Level 2': 'l2', 'L2': 'l2', 'Level 3 / DCFC': 'l3_dcfc', 'L3': 'l3_dcfc' },
      ) as EstimateInput['charger']['chargingLevel'],
      ampsPerCharger: getNumber(item, cols.ampsPerCharger),
      volts: getNumber(item, cols.volts),
    },
    electrical: {
      serviceType: mapLabel(
        item,
        cols.serviceType,
        labels.serviceType,
      ) as EstimateInput['electrical']['serviceType'],
      availableCapacityKnown: false, // No monday.com column mapped yet — requires board customization
      availableAmps: null, // No monday.com column mapped yet — requires board customization
      breakerSpaceAvailable: null, // No monday.com column mapped yet — requires board customization
      panelUpgradeRequired: getBool(item, cols.panelUpgrade),
      transformerRequired: getBool(item, cols.transformerRequired),
      switchgearRequired: null, // No monday.com column mapped yet — requires board customization
      distanceToPanel_ft: getNumber(item, cols.distanceToPanel),
      utilityCoordinationRequired: null, // No monday.com column mapped yet — requires board customization
      meterRoomRequired: null,
      junctionBoxCount: null,
      disconnectRequired: null, electricalRoomDescription: '', // No monday.com column mapped yet — requires board customization
    },
    civil: {
      installationLocationDescription: '', // No monday.com column mapped yet — requires board customization
    },
    permit: {
      responsibility: mapLabel(
        item,
        cols.permitResponsibility,
        labels.responsibility,
      ) as EstimateInput['permit']['responsibility'],
      feeAllowance: null, // No monday.com column mapped yet — requires board customization
    },
    designEngineering: {
      responsibility: mapLabel(
        item,
        cols.designResponsibility,
        labels.responsibility,
      ) as EstimateInput['designEngineering']['responsibility'],
      stampedPlansRequired: null, // No monday.com column mapped yet — requires board customization
    },
    network: {
      type: mapLabel(item, cols.networkType, labels.networkType) as EstimateInput['network']['type'],
      wifiInstallResponsibility: null, // No monday.com column mapped yet — requires board customization
    },
    accessories: {
      bollardQty: 0, // No monday.com column mapped yet — requires board customization
      signQty: 0, // No monday.com column mapped yet — requires board customization
      wheelStopQty: 0, // No monday.com column mapped yet — requires board customization
      stripingRequired: false, // No monday.com column mapped yet — requires board customization
      padRequired: false, // No monday.com column mapped yet — requires board customization
      debrisRemoval: false, // No monday.com column mapped yet — requires board customization
    },
    makeReady: {
      responsibility: mapLabel(
        item,
        cols.makeReadyResponsibility,
        labels.responsibility,
      ) as EstimateInput['makeReady']['responsibility'],
    },
    chargerInstall: {
      responsibility: mapLabel(
        item,
        cols.installResponsibility,
        labels.responsibility,
      ) as EstimateInput['chargerInstall']['responsibility'],
    },
    purchasingChargers: {
      responsibility: mapLabel(
        item,
        cols.purchasingResponsibility,
        labels.responsibility,
      ) as EstimateInput['purchasingChargers']['responsibility'],
    },
    signageBollards: {
      responsibility: null, // No monday.com column mapped yet — requires board customization
    },
    estimateControls: {
      pricingTier: 'msrp',
      taxRate: 7.0,
      contingencyPercent: 10,
      markupPercent: 20,
    },
    notes: getText(item, cols.notes),
  };
}

// ============================================================
// Mirror Row Normalizer (Supabase NERBLO 5000)
// ============================================================
// Produces a Partial<EstimateInput> that the estimator can deep-merge
// with its own emptyInput(). Only fills in what the mirror row provides;
// anything unknown is left undefined so callers can distinguish.

function joinAddress(
  street: string | null | undefined,
  city: string | null | undefined,
  state: string | null | undefined,
  zip: string | null | undefined,
): string {
  const parts: string[] = [];
  if (street && street.trim()) parts.push(street.trim());
  const tail: string[] = [];
  if (city && city.trim()) tail.push(city.trim());
  if (state && state.trim()) tail.push(state.trim());
  if (zip && zip.trim()) tail.push(zip.trim());
  if (tail.length) parts.push(tail.join(', ').replace(', ' + (zip ?? ''), ' ' + (zip ?? '')).trim());
  return parts.join(', ').trim();
}

function mapLabelValue(
  raw: string | null | undefined,
  labelMap: Record<string, string>,
): string | null {
  if (!raw) return null;
  const mapped = labelMap[raw];
  return mapped ?? null;
}

function toNullableString(v: unknown): string | null {
  if (typeof v === 'string' && v.trim()) return v;
  return null;
}

function toNullableNumber(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim()) {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/**
 * Best-effort normalization of a deal/lead row (+ optional matched SOW)
 * into EstimateInput fragments. Unknown fields are omitted entirely;
 * callers should deep-merge onto emptyInput().
 */
export function normalizeMirrorRow(
  deal: BulletevDealRow | BulletevLeadRow,
  sow: BulletevSowRow | null,
): Partial<EstimateInput> {
  const labels = BOARD_CONFIG.labelMaps;
  const out: Partial<EstimateInput> = {};

  // ── Customer ─────────────────────────────────────────────
  const companyName = deal.site_company ?? deal.name ?? '';
  const billingAddress = joinAddress(
    deal.site_address,
    deal.site_city,
    deal.site_state,
    deal.site_zip,
  );
  out.customer = {
    companyName: companyName || '',
    contactName: deal.site_contact ?? '',
    contactEmail: deal.site_contact_email ?? '',
    contactPhone: deal.site_contact_phone ?? '',
    billingAddress,
  };

  // ── Site ─────────────────────────────────────────────────
  const siteType = mapLabelValue(deal.site_type, labels.siteType) as EstimateInput['site']['siteType'];
  out.site = {
    address: deal.site_address ?? '',
    siteType,
    state: deal.site_state ?? '',
  };

  // ── Project (may be overridden by SOW below) ─────────────
  out.project = {
    name: deal.name ?? '',
    salesRep: '',
    projectType: 'full_turnkey',
    timeline: '',
    isNewConstruction: null,
  };

  if (sow) {
    const projectType = mapLabelValue(
      sow.project_type ?? null,
      labels.projectType,
    ) as EstimateInput['project']['projectType'] | null;

    out.project = {
      name: sow.name ?? out.project.name,
      salesRep: sow.sales_rep ?? '',
      projectType: projectType ?? out.project.projectType,
      timeline: '',
      isNewConstruction:
        typeof sow.new_construction === 'boolean' ? sow.new_construction : null,
    };

    // Site type may be richer on the SOW row — prefer it when present.
    const sowSiteType = mapLabelValue(
      sow.site_type ?? null,
      labels.siteType,
    ) as EstimateInput['site']['siteType'];
    if (sowSiteType) {
      out.site = { ...out.site, siteType: sowSiteType };
    }

    // ── Charger ────────────────────────────────────────────
    const charger: Partial<EstimateInput['charger']> = {};
    const brand = toNullableString(sow.charger_brand);
    if (brand) charger.brand = brand;
    const model = toNullableString(sow.charger_model);
    if (model) charger.model = model;
    const count = toNullableNumber(sow.charger_count);
    if (count !== null) charger.count = count;
    const pedestalCount = toNullableNumber(sow.pedestal_count);
    if (pedestalCount !== null) charger.pedestalCount = pedestalCount;
    const mountType = mapLabelValue(sow.mount_type ?? null, {
      Pedestal: 'pedestal',
      Wall: 'wall',
      Mix: 'mix',
      Other: 'other',
    }) as EstimateInput['charger']['mountType'];
    if (mountType) charger.mountType = mountType;
    const portType = mapLabelValue(sow.port_type ?? null, {
      Single: 'single',
      Dual: 'dual',
      Mix: 'mix',
    }) as EstimateInput['charger']['portType'];
    if (portType) charger.portType = portType;
    const chargingLevel = mapLabelValue(sow.charging_level ?? null, {
      'Level 2': 'l2',
      L2: 'l2',
      'Level 3 / DCFC': 'l3_dcfc',
      L3: 'l3_dcfc',
    }) as EstimateInput['charger']['chargingLevel'];
    if (chargingLevel) charger.chargingLevel = chargingLevel;
    const amps = toNullableNumber(sow.amps_per_charger);
    if (amps !== null) charger.ampsPerCharger = amps;
    const volts = toNullableNumber(sow.volts);
    if (volts !== null) charger.volts = volts;
    if (typeof sow.customer_supplied === 'boolean') {
      charger.isCustomerSupplied = sow.customer_supplied;
    }
    if (Object.keys(charger).length > 0) {
      out.charger = charger as EstimateInput['charger'];
    }

    // ── Electrical ─────────────────────────────────────────
    const electrical: Partial<EstimateInput['electrical']> = {};
    const serviceType = mapLabelValue(
      sow.service_type ?? null,
      labels.serviceType,
    ) as EstimateInput['electrical']['serviceType'];
    if (serviceType) electrical.serviceType = serviceType;
    const dtp = toNullableNumber(sow.distance_to_panel);
    if (dtp !== null) electrical.distanceToPanel_ft = dtp;
    if (typeof sow.panel_upgrade === 'boolean') {
      electrical.panelUpgradeRequired = sow.panel_upgrade;
    }
    if (typeof sow.transformer_required === 'boolean') {
      electrical.transformerRequired = sow.transformer_required;
    }
    if (Object.keys(electrical).length > 0) {
      out.electrical = electrical as EstimateInput['electrical'];
    }

    // ── Civil / install location notes ─────────────────────
    const installLoc = toNullableString(sow.install_location);
    if (installLoc) {
      out.civil = { installationLocationDescription: installLoc };
    }

    // ── Responsibilities (best effort) ─────────────────────
    const resp = labels.responsibility;
    const permitResp = mapLabelValue(sow.permit_responsibility ?? null, resp) as
      | EstimateInput['permit']['responsibility']
      | null;
    if (permitResp) out.permit = { responsibility: permitResp, feeAllowance: null };
    const designResp = mapLabelValue(sow.design_responsibility ?? null, resp) as
      | EstimateInput['designEngineering']['responsibility']
      | null;
    if (designResp) {
      out.designEngineering = {
        responsibility: designResp,
        stampedPlansRequired: null,
      };
    }
    const makeReadyResp = mapLabelValue(sow.make_ready_responsibility ?? null, resp) as
      | EstimateInput['makeReady']['responsibility']
      | null;
    if (makeReadyResp) out.makeReady = { responsibility: makeReadyResp };
    const installResp = mapLabelValue(sow.install_responsibility ?? null, resp) as
      | EstimateInput['chargerInstall']['responsibility']
      | null;
    if (installResp) out.chargerInstall = { responsibility: installResp };
    const purchasingResp = mapLabelValue(sow.purchasing_responsibility ?? null, resp) as
      | EstimateInput['purchasingChargers']['responsibility']
      | null;
    if (purchasingResp) out.purchasingChargers = { responsibility: purchasingResp };

    // ── Network ────────────────────────────────────────────
    const networkType = mapLabelValue(
      sow.network_type ?? null,
      labels.networkType,
    ) as EstimateInput['network']['type'];
    if (networkType) {
      out.network = { type: networkType, wifiInstallResponsibility: null };
    }

    // ── Notes ──────────────────────────────────────────────
    const notes = toNullableString(sow.notes);
    if (notes) out.notes = notes;
  }

  return out;
}
