'use client';

// EquipmentLayer is integrated into SiteMap.tsx via Mapbox GL Markers.
// This module exports helper functions for equipment data transforms.

import type { EquipmentPlacement, EquipmentType } from '@/lib/map/types';
import { EQUIPMENT_TYPE_CONFIG } from '@/lib/map/constants';

/**
 * Build a GeoJSON FeatureCollection from EquipmentPlacements.
 */
export function equipmentToGeoJSON(equipment: readonly EquipmentPlacement[]) {
  return {
    type: 'FeatureCollection' as const,
    features: equipment.map((eq) => ({
      type: 'Feature' as const,
      id: eq.id,
      properties: {
        id: eq.id,
        equipmentType: eq.equipmentType,
        label: eq.label,
        icon: EQUIPMENT_TYPE_CONFIG[eq.equipmentType].icon,
      },
      geometry: eq.geometry,
    })),
  };
}

/**
 * Generate a label for a newly placed equipment item.
 */
export function generateEquipmentLabel(
  type: EquipmentType,
  existingCount: number,
): string {
  const config = EQUIPMENT_TYPE_CONFIG[type];
  return `${config.label} ${existingCount + 1}`;
}
