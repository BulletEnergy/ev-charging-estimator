'use client';

// RunLayer is integrated directly into SiteMap.tsx via GeoJSON sources.
// This module exports helper functions for run styling and interaction.

import type { RunSegment } from '@/lib/map/types';
import { RUN_TYPE_CONFIG } from '@/lib/map/constants';

/**
 * Build a GeoJSON FeatureCollection from RunSegments for the map source.
 */
export function runsToGeoJSON(runs: readonly RunSegment[]) {
  return {
    type: 'FeatureCollection' as const,
    features: runs.map((run) => ({
      type: 'Feature' as const,
      id: run.id,
      properties: {
        id: run.id,
        runType: run.runType,
        lengthFt: Math.round(run.lengthFt),
        label: `${Math.round(run.lengthFt)} ft`,
        color: RUN_TYPE_CONFIG[run.runType].color,
      },
      geometry: run.geometry,
    })),
  };
}

/**
 * Build midpoint label features for run measurement display.
 */
export function runLabelsToGeoJSON(runs: readonly RunSegment[]) {
  return {
    type: 'FeatureCollection' as const,
    features: runs.map((run) => {
      const coords = run.geometry.coordinates;
      const midIdx = Math.floor(coords.length / 2);
      const midPoint = coords[midIdx] ?? coords[0];
      return {
        type: 'Feature' as const,
        properties: {
          label: `${Math.round(run.lengthFt)} ft`,
          runType: run.runType,
        },
        geometry: {
          type: 'Point' as const,
          coordinates: midPoint,
        },
      };
    }),
  };
}
