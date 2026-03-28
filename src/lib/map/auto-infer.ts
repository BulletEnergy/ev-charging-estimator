// ============================================================
// Smart Field Auto-Inference (Deterministic Rules)
// ============================================================

import type { EstimateInput } from '@/lib/estimate/types';
import type { EstimatePatch, MapWorkspaceState } from './types';
import { deepGet } from './sync';

interface InferenceRule {
  readonly id: string;
  readonly description: string;
  readonly confidence: 'high' | 'medium';
  readonly check: (input: EstimateInput, mapState: MapWorkspaceState) => InferredPatch | null;
}

interface InferredPatch {
  readonly fieldPath: string;
  readonly proposedValue: unknown;
  readonly reason: string;
}

const INFERENCE_RULES: readonly InferenceRule[] = [
  {
    id: 'l3-requires-480v',
    description: 'L3 DCFC chargers require 480V 3-phase service',
    confidence: 'high',
    check: (input) => {
      if (
        input.charger.chargingLevel === 'l3_dcfc' &&
        input.electrical.serviceType !== '480v_3phase'
      ) {
        return {
          fieldPath: 'electrical.serviceType',
          proposedValue: '480v_3phase',
          reason: 'L3 DCFC chargers require 480V 3-phase service',
        };
      }
      return null;
    },
  },
  {
    id: 'l3-requires-transformer',
    description: 'L3 DCFC typically requires transformer',
    confidence: 'high',
    check: (input) => {
      if (
        input.charger.chargingLevel === 'l3_dcfc' &&
        input.electrical.transformerRequired !== true
      ) {
        return {
          fieldPath: 'electrical.transformerRequired',
          proposedValue: true,
          reason: 'L3 DCFC chargers typically require a step-down transformer',
        };
      }
      return null;
    },
  },
  {
    id: 'garage-requires-coring',
    description: 'Parking garages require coring and slab scan',
    confidence: 'high',
    check: (input) => {
      if (
        input.parkingEnvironment.type === 'parking_garage' &&
        input.parkingEnvironment.coringRequired !== true
      ) {
        return {
          fieldPath: 'parkingEnvironment.coringRequired',
          proposedValue: true,
          reason: 'Parking garage installations require coring for conduit routing',
        };
      }
      return null;
    },
  },
  {
    id: 'garage-requires-slab-scan',
    description: 'Parking garages require slab scan',
    confidence: 'high',
    check: (input) => {
      if (
        input.parkingEnvironment.type === 'parking_garage' &&
        input.parkingEnvironment.slabScanRequired !== true
      ) {
        return {
          fieldPath: 'parkingEnvironment.slabScanRequired',
          proposedValue: true,
          reason: 'Slab scan mandatory before coring in parking garages',
        };
      }
      return null;
    },
  },
  {
    id: 'many-chargers-panel-upgrade',
    description: '4+ chargers likely need panel upgrade',
    confidence: 'medium',
    check: (input) => {
      if (
        input.charger.count >= 4 &&
        input.electrical.panelUpgradeRequired !== true
      ) {
        return {
          fieldPath: 'electrical.panelUpgradeRequired',
          proposedValue: true,
          reason: `${input.charger.count} chargers typically require a sub-panel or panel upgrade`,
        };
      }
      return null;
    },
  },
  {
    id: 'full-turnkey-responsibility',
    description: 'Full turnkey sets all responsibility to Bullet',
    confidence: 'high',
    check: (input) => {
      if (
        input.project.projectType === 'full_turnkey' &&
        input.makeReady.responsibility !== 'bullet'
      ) {
        return {
          fieldPath: 'makeReady.responsibility',
          proposedValue: 'bullet',
          reason: 'Full turnkey project — all make-ready is Bullet responsibility',
        };
      }
      return null;
    },
  },
  {
    id: 'install-commission-client-supplies',
    description: 'Install & commission means client supplies chargers',
    confidence: 'high',
    check: (input) => {
      if (
        input.project.projectType === 'install_commission' &&
        input.purchasingChargers.responsibility !== 'client'
      ) {
        return {
          fieldPath: 'purchasingChargers.responsibility',
          proposedValue: 'client',
          reason: 'Install & commission project — client supplies charger equipment',
        };
      }
      return null;
    },
  },
  {
    id: 'concrete-surface-boring',
    description: 'Concrete surface likely needs boring',
    confidence: 'medium',
    check: (input) => {
      if (
        input.parkingEnvironment.surfaceType === 'concrete' &&
        input.parkingEnvironment.boringRequired !== true &&
        input.parkingEnvironment.type === 'surface_lot'
      ) {
        return {
          fieldPath: 'parkingEnvironment.boringRequired',
          proposedValue: true,
          reason: 'Concrete surface lot — boring likely required for conduit installation',
        };
      }
      return null;
    },
  },
  {
    id: 'new-construction-stamped-plans',
    description: 'New construction requires stamped plans',
    confidence: 'high',
    check: (input) => {
      if (
        input.project.isNewConstruction === true &&
        input.designEngineering.stampedPlansRequired !== true
      ) {
        return {
          fieldPath: 'designEngineering.stampedPlansRequired',
          proposedValue: true,
          reason: 'New construction projects require stamped engineered plans',
        };
      }
      return null;
    },
  },
];

/**
 * Run all inference rules and return patches for values that would change.
 */
export function generateInferencePatches(
  input: EstimateInput,
  mapState: MapWorkspaceState,
): EstimatePatch[] {
  const patches: EstimatePatch[] = [];
  let patchId = 0;

  for (const rule of INFERENCE_RULES) {
    const result = rule.check(input, mapState);
    if (!result) continue;

    // Get current value for comparison
    const current = deepGet(input, result.fieldPath);

    // Skip if already set to proposed value
    if (current === result.proposedValue) continue;

    patchId += 1;
    patches.push({
      id: `infer-${String(patchId).padStart(4, '0')}`,
      fieldPath: result.fieldPath,
      previousValue: current ?? null,
      proposedValue: result.proposedValue,
      source: 'auto_infer',
      reason: result.reason,
      status: 'pending',
    });
  }

  return patches;
}
