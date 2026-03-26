// ============================================================
// Auto-Route Engine — Panel-to-charger routing with cost estimation
// ============================================================

import turfDistance from '@turf/distance';
import { point, lineString } from '@turf/helpers';
import type { RunSegment } from './types';

// ── Interfaces ──

export interface AutoRouteResult {
  readonly runs: RunSegment[];
  readonly totalConduitFt: number;
  readonly civilType: 'trench' | 'bore' | 'concrete_cut';
  readonly junctionBoxCount: number;
  readonly estimatedCost: number;
}

// ── Pricebook constants (from pricebook-v2.json) ──

const CONDUIT_PRICE_PER_FT = 32; // EMT conduit up to 2" w/ #4 conductors
const TRENCH_PRICE_PER_FT = 45; // Trenching up to 36" W, 4' D
const BORE_PRICE_PER_FT = 60; // Boring per foot
const CONCRETE_CUT_PRICE_PER_FT = 55; // Concrete cutting (estimated from restoration + removal)
const JUNCTION_BOX_PRICE = 350; // Junction/pull box installed

const METERS_TO_FEET = 3.281;
const ROUTING_FACTOR = 1.3;

// ── Helpers ──

function nextId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function computeCentroid(coords: [number, number][]): [number, number] {
  const lng = coords.reduce((sum, c) => sum + c[0], 0) / coords.length;
  const lat = coords.reduce((sum, c) => sum + c[1], 0) / coords.length;
  return [lng, lat];
}

function selectCivilType(surfaceType?: string): 'trench' | 'bore' | 'concrete_cut' {
  if (surfaceType === 'concrete') return 'concrete_cut';
  if (surfaceType === 'gravel') return 'trench';
  // asphalt and default → trench
  return 'trench';
}

function getCivilPricePerFt(civilType: 'trench' | 'bore' | 'concrete_cut'): number {
  switch (civilType) {
    case 'trench':
      return TRENCH_PRICE_PER_FT;
    case 'bore':
      return BORE_PRICE_PER_FT;
    case 'concrete_cut':
      return CONCRETE_CUT_PRICE_PER_FT;
  }
}

// ── Main export ──

export function autoRouteFromPanelToChargers(
  panelCoord: [number, number],
  chargerCoords: [number, number][],
  surfaceType?: string,
  chargingLevel?: string,
): AutoRouteResult {
  if (chargerCoords.length === 0) {
    return {
      runs: [],
      totalConduitFt: 0,
      civilType: 'trench',
      junctionBoxCount: 0,
      estimatedCost: 0,
    };
  }

  // 1. Calculate centroid of all charger positions
  const centroid = computeCentroid(chargerCoords);

  // 2. Distance from panel to centroid (meters → feet)
  const panelPt = point(panelCoord);
  const centroidPt = point(centroid);
  const distMeters = turfDistance(panelPt, centroidPt, { units: 'meters' });
  const rawDistFt = distMeters * METERS_TO_FEET;

  // 3. Apply routing factor
  const totalConduitFt = Math.round(rawDistFt * ROUTING_FACTOR);

  // 4. Select civil type from surface
  const civilType = selectCivilType(surfaceType);

  // 5. Junction boxes: 1 per 100ft + 1 per branch (each charger beyond the first)
  const junctionBoxesForLength = Math.max(1, Math.ceil(totalConduitFt / 100));
  const junctionBoxesForBranches = Math.max(0, chargerCoords.length - 1);
  const junctionBoxCount = junctionBoxesForLength + junctionBoxesForBranches;

  // 6. Generate RunSegment: main conduit from panel → centroid
  const mainRunGeometry = lineString([panelCoord, centroid]);
  const mainRun: RunSegment = {
    id: nextId('auto-run'),
    runType: 'conduit',
    geometry: mainRunGeometry.geometry,
    lengthFt: totalConduitFt,
    label: `Auto conduit ${totalConduitFt}ft`,
    createdAt: new Date().toISOString(),
  };

  // Generate branch runs from centroid to each charger
  const branchRuns: RunSegment[] = chargerCoords.map((chargerCoord, idx) => {
    const branchPt = point(chargerCoord);
    const branchDist = turfDistance(centroidPt, branchPt, { units: 'meters' });
    const branchFt = Math.round(branchDist * METERS_TO_FEET * ROUTING_FACTOR);
    const branchGeometry = lineString([centroid, chargerCoord]);
    return {
      id: nextId('auto-branch'),
      runType: chargingLevel === 'l3_dcfc' ? 'feeder' as const : 'conduit' as const,
      geometry: branchGeometry.geometry,
      lengthFt: branchFt,
      label: `Branch ${idx + 1} ${branchFt}ft`,
      createdAt: new Date().toISOString(),
    };
  });

  const allRuns = [mainRun, ...branchRuns];

  // 7. Estimate cost: conduit + civil + junction boxes
  const totalLinearFt = allRuns.reduce((sum, r) => sum + r.lengthFt, 0);
  const conduitCost = totalLinearFt * CONDUIT_PRICE_PER_FT;
  const civilCost = totalConduitFt * getCivilPricePerFt(civilType);
  const junctionCost = junctionBoxCount * JUNCTION_BOX_PRICE;
  const estimatedCost = conduitCost + civilCost + junctionCost;

  return {
    runs: allRuns,
    totalConduitFt,
    civilType,
    junctionBoxCount,
    estimatedCost: Math.round(estimatedCost),
  };
}
