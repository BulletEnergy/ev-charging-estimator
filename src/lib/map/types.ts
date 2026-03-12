// ============================================================
// Map Workspace Types
// ============================================================

import type { LineString, Point } from 'geojson';

export type RunType = 'conduit' | 'feeder' | 'trench' | 'bore' | 'concrete_cut';

export type EquipmentType =
  | 'charger_l2'
  | 'charger_l3'
  | 'transformer'
  | 'switchgear'
  | 'utility_meter';

export interface RunSegment {
  readonly id: string;
  readonly runType: RunType;
  readonly geometry: LineString;
  readonly lengthFt: number;
  readonly label: string;
  readonly createdAt: string;
}

export interface EquipmentPlacement {
  readonly id: string;
  readonly equipmentType: EquipmentType;
  readonly geometry: Point;
  readonly label: string;
  readonly properties: Record<string, unknown>;
}

export interface MapWorkspaceState {
  readonly siteAddress: string;
  readonly siteCoordinates: [number, number] | null;
  readonly runs: readonly RunSegment[];
  readonly equipment: readonly EquipmentPlacement[];
  readonly selectedTool: RunType | EquipmentType | null;
  readonly selectedFeatureId: string | null;
}

export type PatchStatus = 'pending' | 'accepted' | 'rejected';

export interface EstimatePatch {
  readonly id: string;
  readonly fieldPath: string;
  readonly previousValue: unknown;
  readonly proposedValue: unknown;
  readonly source: 'map_measurement' | 'map_equipment' | 'auto_infer';
  readonly reason: string;
  readonly status: PatchStatus;
}

export interface PatchBatch {
  readonly batchId: string;
  readonly trigger: string;
  readonly patches: readonly EstimatePatch[];
  readonly createdAt: string;
}

// ── Reducer actions ──

export type MapAction =
  | { type: 'SET_ADDRESS'; address: string; coordinates: [number, number] }
  | { type: 'SELECT_TOOL'; tool: RunType | EquipmentType | null }
  | { type: 'SELECT_FEATURE'; featureId: string | null }
  | { type: 'ADD_RUN'; run: RunSegment }
  | { type: 'UPDATE_RUN'; id: string; geometry: LineString; lengthFt: number }
  | { type: 'DELETE_RUN'; id: string }
  | { type: 'ADD_EQUIPMENT'; equipment: EquipmentPlacement }
  | { type: 'UPDATE_EQUIPMENT'; id: string; geometry: Point }
  | { type: 'DELETE_EQUIPMENT'; id: string }
  | { type: 'RESET' };

// ── Aggregation types ──

export type AggregationType = 'SUM' | 'COUNT' | 'BOOLEAN';

export interface FieldMapping {
  readonly runType?: RunType;
  readonly equipmentType?: EquipmentType;
  readonly fieldPath: string;
  readonly aggregation: AggregationType;
  readonly cap?: number;
  readonly capWarning?: string;
}
