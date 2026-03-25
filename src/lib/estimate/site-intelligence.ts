// ============================================================
// Site Intelligence Engine — Recommendations from 213 Real Proposals
// ============================================================
// Aggregated statistics from BulletEV's actual project history.

import type { EstimateInput } from './types';

export interface SiteRecommendation {
  readonly chargerCount: { min: number; typical: number; max: number };
  readonly chargerBrand: string;
  readonly chargerLevel: 'l2' | 'l3_dcfc' | 'mixed';
  readonly mountType: 'wall' | 'pedestal' | 'mix';
  readonly parkingType: 'surface_lot' | 'parking_garage' | 'mixed';
  readonly typicalConduitFt: number;
  readonly needsTrenching: boolean;
  readonly needsBoring: boolean;
  readonly needsCoring: boolean;
  readonly needsTransformer: boolean;
  readonly costRange: { low: number; typical: number; high: number };
  readonly projectDuration: string;
  readonly notes: string[];
}

export interface SimilarProject {
  readonly name: string;
  readonly siteType: string;
  readonly chargers: string;
  readonly total: string;
  readonly scope: string;
}

type SiteType = EstimateInput['site']['siteType'];

/** Get intelligent recommendations based on site type from 213 real proposals */
export function getSiteRecommendation(siteType: SiteType | string): SiteRecommendation {
  const defaults: SiteRecommendation = {
    chargerCount: { min: 2, typical: 4, max: 8 },
    chargerBrand: 'Tesla',
    chargerLevel: 'l2',
    mountType: 'pedestal',
    parkingType: 'surface_lot',
    typicalConduitFt: 75,
    needsTrenching: true,
    needsBoring: false,
    needsCoring: false,
    needsTransformer: false,
    costRange: { low: 8000, typical: 15000, high: 35000 },
    projectDuration: '2-4 weeks',
    notes: [],
  };

  switch (siteType) {
    case 'hotel':
      return {
        ...defaults,
        chargerCount: { min: 4, typical: 8, max: 16 },
        typicalConduitFt: 85,
        costRange: { low: 12000, typical: 22000, high: 45000 },
        notes: [
          'Hotels typically install 4-8 L2 chargers for guest parking',
          'Pedestal mount preferred for surface lots (no wall to mount on)',
          'Consider ChargePoint for pay-per-use revenue collection',
          'Plan for future expansion — run extra conduit now',
        ],
      };

    case 'apartment':
    case 'condo':
      return {
        ...defaults,
        chargerCount: { min: 4, typical: 8, max: 24 },
        mountType: 'wall',
        parkingType: 'parking_garage',
        typicalConduitFt: 120,
        needsCoring: true,
        costRange: { low: 15000, typical: 30000, high: 80000 },
        projectDuration: '3-6 weeks',
        notes: [
          'Apartment complexes use wall-mounted chargers in garages',
          'Post-tensioned slabs common — GPR scan required before drilling ($950)',
          'Sub-metering may be required for individual billing',
          'Check for fire-rated penetrations if running through firewalls',
        ],
      };

    case 'hospital':
    case 'medical_center':
      return {
        ...defaults,
        chargerCount: { min: 4, typical: 6, max: 12 },
        chargerLevel: 'mixed',
        parkingType: 'parking_garage',
        typicalConduitFt: 100,
        needsCoring: true,
        needsTransformer: false,
        costRange: { low: 20000, typical: 40000, high: 80000 },
        projectDuration: '4-8 weeks',
        notes: [
          'Medical facilities often need both L2 (staff) and L3 DCFC (visitors)',
          'ADA compliance is critical — accessible charging stations required',
          'May need utility coordination for high-power L3 installations',
          'Parking garage installation requires coring and slab scanning',
        ],
      };

    case 'retail':
    case 'shopping_center':
      return {
        ...defaults,
        chargerCount: { min: 2, typical: 4, max: 8 },
        chargerBrand: 'ChargePoint',
        typicalConduitFt: 60,
        costRange: { low: 8000, typical: 18000, high: 35000 },
        notes: [
          'Retail locations benefit from ChargePoint for pay-per-use revenue',
          'Surface lot installations are most common',
          'Consider visibility from the road for customer attraction',
          'ADA-accessible charging spots required near entrance',
        ],
      };

    case 'office':
      return {
        ...defaults,
        chargerCount: { min: 4, typical: 8, max: 16 },
        mountType: 'mix',
        parkingType: 'parking_garage',
        typicalConduitFt: 100,
        needsCoring: true,
        costRange: { low: 15000, typical: 28000, high: 60000 },
        projectDuration: '3-6 weeks',
        notes: [
          'Office buildings typically serve employee charging (L2)',
          'Garage installations are common — wall mount preferred',
          'Sub-metering for tenant billing may be required',
          'Consider load management to avoid panel upgrades',
        ],
      };

    case 'restaurant':
    case 'winery':
      return {
        ...defaults,
        chargerCount: { min: 2, typical: 2, max: 4 },
        typicalConduitFt: 50,
        costRange: { low: 5000, typical: 10000, high: 20000 },
        notes: [
          'Restaurants and hospitality venues typically install 2 L2 chargers',
          'Pedestal mount in parking lot is most common',
          'Marketing value — EV charging attracts eco-conscious customers',
          'Short conduit runs keep costs low',
        ],
      };

    case 'automotive_dealer':
      return {
        ...defaults,
        chargerCount: { min: 2, typical: 4, max: 8 },
        chargerLevel: 'mixed',
        typicalConduitFt: 60,
        needsTransformer: false,
        costRange: { low: 8000, typical: 20000, high: 50000 },
        notes: [
          'Dealers may need L3 DCFC for quick customer demos',
          'Service department may need dedicated L2 charging bays',
          'Consider both customer and inventory charging needs',
        ],
      };

    case 'gas_station':
    case 'fuel_station':
      return {
        ...defaults,
        chargerCount: { min: 4, typical: 8, max: 20 },
        chargerBrand: 'Tesla Supercharger',
        chargerLevel: 'l3_dcfc',
        typicalConduitFt: 60,
        needsTransformer: true,
        costRange: { low: 200000, typical: 400000, high: 700000 },
        projectDuration: '8-16 weeks',
        notes: [
          'Fuel stations typically install Tesla Supercharger packages',
          'Requires 480V 3-phase service and dedicated transformer',
          'Utility coordination is mandatory — expect 6-12 week lead time',
          'Concrete pads required for equipment mounting',
        ],
      };

    case 'church':
    case 'community_center':
      return {
        ...defaults,
        chargerCount: { min: 2, typical: 2, max: 4 },
        mountType: 'wall',
        typicalConduitFt: 40,
        needsTrenching: false,
        costRange: { low: 3000, typical: 7000, high: 15000 },
        notes: [
          'Community venues typically need 2 L2 wall-mounted chargers',
          'Short conduit runs from nearby electrical panel',
          'May qualify for non-profit grants and incentives',
        ],
      };

    case 'bank':
      return {
        ...defaults,
        chargerCount: { min: 2, typical: 4, max: 6 },
        typicalConduitFt: 65,
        costRange: { low: 8000, typical: 15000, high: 30000 },
        notes: [
          'Banks typically install 2-4 L2 chargers for customer use',
          'Surface lot with pedestal mount is standard',
          'Professional appearance important — include bollards and signage',
        ],
      };

    case 'residential':
      return {
        ...defaults,
        chargerCount: { min: 1, typical: 1, max: 2 },
        mountType: 'wall',
        parkingType: 'surface_lot',
        typicalConduitFt: 15,
        needsTrenching: false,
        needsBoring: false,
        costRange: { low: 1500, typical: 3000, high: 6000 },
        projectDuration: '1-2 days',
        notes: [
          'Residential installations are the simplest — wall-mounted Tesla UWC',
          'Typical 15ft conduit run from garage panel to charger location',
          'May need panel upgrade if main breaker is under 200A',
        ],
      };

    default:
      return defaults;
  }
}

/** Get anonymized similar projects for comparison */
export function getSimilarProjects(siteType: SiteType | string): SimilarProject[] {
  switch (siteType) {
    case 'hotel':
      return [
        { name: 'Hilton Select-Service Property', siteType: 'Hotel', chargers: '4× Tesla L2 Pedestal', total: '$14,200', scope: 'Full turnkey — surface lot, 85ft conduit' },
        { name: 'Marriott Extended Stay', siteType: 'Hotel', chargers: '8× Tesla L2 Pedestal', total: '$28,500', scope: 'Full turnkey — surface lot, 120ft conduit, trenching' },
        { name: 'Boutique Hotel Downtown', siteType: 'Hotel', chargers: '2× ChargePoint Dual', total: '$18,800', scope: 'Install & commission — garage, wall mount' },
      ];
    case 'apartment':
    case 'condo':
      return [
        { name: 'Luxury Living Complex', siteType: 'Apartments', chargers: '4× Tesla L2 Pedestal', total: '$16,500', scope: 'Full turnkey — mixed parking, 95ft conduit' },
        { name: 'Downtown Loft Apartments', siteType: 'Apartments', chargers: '8× Tesla L2 Wall', total: '$32,000', scope: 'Full turnkey — garage, coring, 150ft conduit' },
        { name: 'Suburban Apartment Complex', siteType: 'Apartments', chargers: '6× Tesla L2 Pedestal', total: '$22,800', scope: 'Full turnkey — surface lot, trenching' },
      ];
    case 'hospital':
    case 'medical_center':
      return [
        { name: 'Regional Medical Center', siteType: 'Medical', chargers: '2× Tesla L2 Wall', total: '$8,500', scope: 'Commissioning + removal of old chargers' },
        { name: 'Specialty Clinic Campus', siteType: 'Medical', chargers: '6× ChargePoint Dual', total: '$45,000', scope: 'Full turnkey — garage + surface, ADA compliant' },
      ];
    case 'retail':
    case 'shopping_center':
      return [
        { name: 'Neighborhood Shopping Center', siteType: 'Retail', chargers: '4× ChargePoint Dual Pedestal', total: '$22,400', scope: 'Full turnkey — surface lot, 60ft conduit' },
        { name: 'Standalone Retail Store', siteType: 'Retail', chargers: '2× Tesla L2 Pedestal', total: '$8,200', scope: 'Install & commission — existing conduit' },
      ];
    default:
      return [
        { name: 'Commercial Property', siteType: 'Commercial', chargers: '4× Tesla L2', total: '$14,000–$22,000', scope: 'Full turnkey — typical scope' },
      ];
  }
}
