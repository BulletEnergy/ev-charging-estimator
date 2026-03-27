/**
 * Rank proposals in proposals-v2.json and emit tabular-import test fixtures.
 *
 * Usage: node scripts/extract-proposal-fixtures.mjs
 *
 * Writes tests/fixtures/import-*.json (rawLineItems + expectedLineItems + totals).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const proposalsPath = path.join(root, 'src/lib/estimate/knowledge/proposals-v2.json');
const proposals = JSON.parse(fs.readFileSync(proposalsPath, 'utf8'));

function numericTotal(p) {
  if (typeof p.subtotal === 'number' && p.subtotal > 0) return p.subtotal;
  if (typeof p.total === 'number' && p.total > 0) return p.total;
  return null;
}

function slugify(name) {
  return name
    .replace(/\.xlsx$/i, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .slice(0, 80);
}

function toRawLineItems(lineItems) {
  return lineItems.map((li) => ({
    description: li.description,
    quantity: li.qty,
    unit: 'EA',
    unitPrice: li.unitPrice,
    amount: li.amount,
    category: li.category,
  }));
}

function toExpected(lineItems) {
  return lineItems.map((li) => ({
    category: li.category,
    description: li.description,
    qty: li.qty,
    unitPrice: li.unitPrice,
    amount: li.amount,
  }));
}

function baseEstimateInput(name, rawLineItems) {
  return {
    project: {
      name,
      salesRep: '',
      projectType: 'full_turnkey',
      timeline: '',
      isNewConstruction: false,
    },
    customer: {
      companyName: name,
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      billingAddress: '',
    },
    site: { address: '', siteType: 'office', state: 'TX' },
    parkingEnvironment: {
      type: 'surface_lot',
      hasPTSlab: null,
      slabScanRequired: null,
      coringRequired: null,
      surfaceType: 'concrete',
      trenchingRequired: true,
      boringRequired: false,
      trafficControlRequired: false,
      indoorOutdoor: 'outdoor',
      fireRatedPenetrations: null,
      accessRestrictions: '',
    },
    charger: {
      brand: 'Tesla',
      model: 'Universal Wall Connector Gen 3',
      count: 2,
      pedestalCount: 1,
      portType: 'dual',
      mountType: 'pedestal',
      isCustomerSupplied: false,
      chargingLevel: 'l2',
      ampsPerCharger: null,
      volts: null,
    },
    electrical: {
      serviceType: '208v',
      availableCapacityKnown: false,
      availableAmps: null,
      breakerSpaceAvailable: null,
      panelUpgradeRequired: false,
      transformerRequired: false,
      switchgearRequired: false,
      distanceToPanel_ft: 100,
      utilityCoordinationRequired: false,
      meterRoomRequired: null,
      junctionBoxCount: null,
      disconnectRequired: null,
      electricalRoomDescription: '',
      pvcConduit4in_ft: null,
      pvcConduit3in_ft: null,
      pvcConduit1in_ft: null,
      wire500mcm_ft: null,
    },
    civil: {
      installationLocationDescription: 'Imported tabular proposal fixture',
      trenchDistance_ft: null,
      asphaltRemoval_sf: null,
      asphaltRestore_sf: null,
      encasement_CY: null,
      postFoundation_CY: null,
      cabinetPad_CY: null,
      groundPrepCabinet: null,
    },
    permit: { responsibility: 'bullet', feeAllowance: 0 },
    designEngineering: { responsibility: 'bullet', stampedPlansRequired: false },
    network: { type: 'none', wifiInstallResponsibility: 'na' },
    accessories: {
      bollardQty: 0,
      signQty: 0,
      wheelStopQty: 0,
      stripingRequired: false,
      padRequired: false,
      debrisRemoval: false,
    },
    makeReady: { responsibility: 'bullet' },
    chargerInstall: { responsibility: 'bullet' },
    purchasingChargers: { responsibility: 'bullet' },
    signageBollards: { responsibility: 'signage' },
    estimateControls: {
      pricingTier: 'msrp',
      taxRate: 0,
      contingencyPercent: 0,
      markupPercent: 0,
    },
    notes: '',
    mapWorkspace: {
      conduitDistance_ft: null,
      feederDistance_ft: null,
      trenchingDistance_ft: null,
      boringDistance_ft: null,
      concreteCuttingDistance_ft: null,
      chargerCountFromMap: null,
      siteCoordinates: null,
      pvcConduitDistance_ft: null,
      cableTrayDistance_ft: null,
      concretePadCount: null,
      hasPanelPlaced: null,
      lightingCount: null,
      drawings: null,
    },
    rawLineItems,
  };
}

/** Curated set: diverse scopes from real exports */
const PICKS = [
  'BBLBC Military Parkway.xlsx',
  'Barons Creek Vineyards(1).xlsx',
  '120 9th Street.xlsx',
  '(CO) 120 Ninth St Apartments.xlsx',
  'A & A Italian Kitchen Inc..xlsx',
  'Achieve Investment Group.xlsx',
  'Alpine Creekside - Change Order 1.xlsx',
  'Arise Riverside Apartments.xlsx',
  'Amanda Eifert.xlsx',
  'Ascension Dell Seton Medical Center at UT.xlsx',
];

const outDir = path.join(root, 'tests/fixtures');
for (const fileName of PICKS) {
  const p = proposals.find((x) => x.fileName === fileName);
  if (!p || !Array.isArray(p.lineItems) || p.lineItems.length === 0) {
    console.warn('Skip missing or empty:', fileName);
    continue;
  }
  const total = numericTotal(p);
  if (total == null) {
    console.warn('Skip no numeric total:', fileName);
    continue;
  }
  const name = p.fileName.replace(/\.xlsx$/i, '');
  const slug = slugify(p.fileName);
  const rawLineItems = toRawLineItems(p.lineItems);
  const fixture = {
    proposalName: `${name} (tabular import)`,
    sourceFile: p.fileName,
    totalFromProposal: total,
    estimateInput: baseEstimateInput(name, rawLineItems),
    expectedLineItems: toExpected(p.lineItems),
  };
  const outPath = path.join(outDir, `import-${slug}.json`);
  fs.writeFileSync(outPath, JSON.stringify(fixture, null, 2) + '\n', 'utf8');
  console.log('Wrote', path.relative(root, outPath), 'lines:', p.lineItems.length, 'total:', total);
}

// Rank report (top 25 by line count with valid totals)
console.log('\n--- Top candidates by line item count (valid numeric subtotal/total) ---\n');
const ranked = proposals
  .map((p) => ({
    fileName: p.fileName,
    n: Array.isArray(p.lineItems) ? p.lineItems.length : 0,
    total: numericTotal(p),
  }))
  .filter((x) => x.n >= 5 && x.total != null)
  .sort((a, b) => b.n - a.n)
  .slice(0, 25);
for (const r of ranked) {
  console.log(`${r.n}\t$${r.total}\t${r.fileName}`);
}
