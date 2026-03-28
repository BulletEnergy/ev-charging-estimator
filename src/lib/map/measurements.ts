// ============================================================
// Pure Turf.js Measurement Wrappers
// ============================================================

import turfLength from '@turf/length';
import turfDistance from '@turf/distance';
import { lineString, point } from '@turf/helpers';
import type { LineString, Point } from 'geojson';
import type { RunSegment, EquipmentPlacement, RunType, EquipmentType } from './types';

/**
 * Measure the length of a LineString in feet.
 */
export function measureRunLength(geometry: LineString): number {
  if (geometry.coordinates.length < 2) return 0;
  const feature = lineString(geometry.coordinates);
  const miles = turfLength(feature, { units: 'miles' });
  return Math.round(miles * 5280 * 100) / 100;
}

/**
 * Measure straight-line distance between two Points in feet.
 */
export function measurePointDistance(a: Point, b: Point): number {
  const pa = point(a.coordinates);
  const pb = point(b.coordinates);
  const miles = turfDistance(pa, pb, { units: 'miles' });
  return Math.round(miles * 5280 * 100) / 100;
}

/**
 * Sum lengths of all RunSegments of a given type.
 */
export function sumRunsByType(
  runs: readonly RunSegment[],
  type: RunType,
): number {
  return runs
    .filter((r) => r.runType === type)
    .reduce((sum, r) => sum + r.lengthFt, 0);
}

/**
 * Count equipment placements of given type(s).
 * Accepts a single type or array of types (for aggregating L2+L3 chargers).
 */
export function countEquipmentByType(
  equipment: readonly EquipmentPlacement[],
  type: EquipmentType | readonly EquipmentType[],
): number {
  const types = Array.isArray(type) ? type : [type];
  return equipment.filter((e) => types.includes(e.equipmentType)).length;
}
