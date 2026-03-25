// ============================================================
// Pricing Override System — Adjustments from Real Proposals
// ============================================================
// Based on patterns observed in 141 analyzed BulletEV proposals.
// Overrides are applied when site conditions warrant higher pricing.

export interface PriceOverride {
  readonly catalogId: string;
  readonly basePrice: number;
  readonly overridePrice: number;
  readonly reason: string;
  readonly trigger: string; // condition that activates the override
}

/** Known override patterns from real proposal data */
export const PRICE_OVERRIDES: readonly PriceOverride[] = [
  {
    catalogId: 'eleclbrmat-conduit-wire',
    basePrice: 32,
    overridePrice: 36,
    reason: 'Complex routing (multiple bends, fire-rated walls, or > 100ft)',
    trigger: 'conduitDistance > 100 || fireRatedPenetrations',
  },
  {
    catalogId: 'civil-coring',
    basePrice: 312,
    overridePrice: 950,
    reason: 'Difficult access conditions (post-tensioned slab, reinforced concrete)',
    trigger: 'hasPTSlab || parkingType === "parking_garage"',
  },
  {
    catalogId: 'deseng-stamped',
    basePrice: 3500,
    overridePrice: 4250,
    reason: 'Complex permit jurisdiction (multiple reviews, ADA, fire marshal)',
    trigger: 'chargerCount >= 8 || needsTransformer',
  },
  {
    catalogId: 'deseng-load-calcs',
    basePrice: 900,
    overridePrice: 1050,
    reason: 'Complex electrical (transformer, switchgear, multiple panels)',
    trigger: 'needsTransformer || chargerCount >= 6',
  },
  {
    catalogId: 'civil-concrete-pads',
    basePrice: 600,
    overridePrice: 725,
    reason: 'Large or reinforced pads (for transformer or multi-charger clusters)',
    trigger: 'needsTransformer',
  },
  {
    catalogId: 'site-bollard',
    basePrice: 550,
    overridePrice: 650,
    reason: 'Heavy-duty bollards for high-traffic areas',
    trigger: 'siteType === "gas_station" || trafficControlRequired',
  },
];

/**
 * Check if an override should apply based on the current estimate input.
 * Returns the override price if applicable, or null to use base price.
 */
export function checkOverride(
  catalogId: string,
  input: {
    conduitDistance?: number;
    fireRatedPenetrations?: boolean;
    hasPTSlab?: boolean;
    parkingType?: string;
    chargerCount?: number;
    needsTransformer?: boolean;
    siteType?: string;
    trafficControlRequired?: boolean;
  },
): number | null {
  for (const override of PRICE_OVERRIDES) {
    if (override.catalogId !== catalogId) continue;

    switch (catalogId) {
      case 'eleclbrmat-conduit-wire':
        if ((input.conduitDistance ?? 0) > 100 || input.fireRatedPenetrations) {
          return override.overridePrice;
        }
        break;
      case 'civil-coring':
        if (input.hasPTSlab || input.parkingType === 'parking_garage') {
          return override.overridePrice;
        }
        break;
      case 'deseng-stamped':
        if ((input.chargerCount ?? 0) >= 8 || input.needsTransformer) {
          return override.overridePrice;
        }
        break;
      case 'deseng-load-calcs':
        if (input.needsTransformer || (input.chargerCount ?? 0) >= 6) {
          return override.overridePrice;
        }
        break;
      case 'civil-concrete-pads':
        if (input.needsTransformer) {
          return override.overridePrice;
        }
        break;
      case 'site-bollard':
        if (input.siteType === 'gas_station' || input.trafficControlRequired) {
          return override.overridePrice;
        }
        break;
    }
  }
  return null;
}
