// ============================================================
// Monday → EstimateInput shallow-deep merge
// ============================================================
// Used to apply the Partial<EstimateInput> produced by
// normalizeMirrorRow() onto a full emptyInput() base. Only one level
// deep — matches the top-level section structure of EstimateInput
// (project, customer, site, parkingEnvironment, charger, ...).

import type { EstimateInput } from '@/lib/estimate/types';

export function mergeEstimateInput(
  base: EstimateInput,
  patch: Partial<EstimateInput>,
): EstimateInput {
  const merged = { ...base } as EstimateInput & Record<string, unknown>;
  const patchRecord = patch as Record<string, unknown>;
  for (const key of Object.keys(patchRecord)) {
    const v = patchRecord[key];
    const existing = (merged as Record<string, unknown>)[key];
    if (
      v &&
      typeof v === 'object' &&
      !Array.isArray(v) &&
      existing &&
      typeof existing === 'object' &&
      !Array.isArray(existing)
    ) {
      (merged as Record<string, unknown>)[key] = {
        ...(existing as Record<string, unknown>),
        ...(v as Record<string, unknown>),
      };
    } else if (v !== undefined) {
      (merged as Record<string, unknown>)[key] = v;
    }
  }
  return merged;
}
