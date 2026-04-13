// ============================================================
// Feature Flags
// ============================================================

export const MAP_WORKSPACE_ENABLED =
  process.env.NEXT_PUBLIC_MAP_WORKSPACE === 'true';

/** When true, the estimate page renders the new 6-step guided flow instead of the 12-tab form */
export const GUIDED_FLOW_ENABLED =
  process.env.NEXT_PUBLIC_GUIDED_FLOW !== 'false'; // Enabled by default
