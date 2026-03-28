'use client';

import { useState, useMemo } from 'react';
import type { MapWorkspaceState, RunSegment, EquipmentPlacement } from '@/lib/map/types';
import type { EstimateInput } from '@/lib/estimate/types';
import { EQUIPMENT_TYPE_CONFIG, RUN_TYPE_CONFIG } from '@/lib/map/constants';

// ── Per-unit cost values for running total ──

const UNIT_COSTS: Record<string, number> = {
  conduit: 32,
  pvc_conduit: 20,
  feeder: 22,
  trench: 45,
  bore: 85,
  concrete_cut: 45,
  cable_tray: 25,
  charger_l2: 750,
  charger_l3: 15000,
  transformer: 25000,
  switchgear: 8000,
  bollard: 550,
  ev_sign: 400,
  wheel_stop: 275,
  concrete_pad: 600,
  lighting: 2200,
};

// ── Checklist step definition ──

interface ChecklistStep {
  readonly id: string;
  readonly label: string;
  readonly check: (state: MapWorkspaceState, input: EstimateInput) => boolean;
  /** How many are placed / how many needed (optional) */
  readonly progress?: (state: MapWorkspaceState, input: EstimateInput) => string | null;
}

function buildChecklist(projectType: EstimateInput['project']['projectType']): readonly ChecklistStep[] {
  if (projectType === 'commission_only') {
    return [
      {
        id: 'address',
        label: 'Set site address',
        check: (s) => Boolean(s.siteAddress),
      },
      {
        id: 'chargers',
        label: 'Place chargers to commission',
        check: (s) =>
          s.equipment.some(
            (e) => e.equipmentType === 'charger_l2' || e.equipmentType === 'charger_l3',
          ),
      },
    ];
  }

  // Default: full_turnkey and similar
  return [
    {
      id: 'address',
      label: 'Set site address',
      check: (s) => Boolean(s.siteAddress),
    },
    {
      id: 'panel',
      label: 'Place electrical panel (power source)',
      check: (s) =>
        s.equipment.some((e) => e.equipmentType === 'panel') ||
        s.powerSourceLocation !== null,
    },
    {
      id: 'chargers',
      label: 'Place chargers in parking area',
      check: (s) =>
        s.equipment.filter(
          (e) => e.equipmentType === 'charger_l2' || e.equipmentType === 'charger_l3',
        ).length > 0,
      progress: (s, input) => {
        const placed = s.equipment.filter(
          (e) => e.equipmentType === 'charger_l2' || e.equipmentType === 'charger_l3',
        ).length;
        const target = input.charger?.count ?? 4;
        return `${placed}/${target}`;
      },
    },
    {
      id: 'conduit',
      label: 'Draw conduit from panel to chargers',
      check: (s) => s.runs.some((r) => r.runType === 'conduit' || r.runType === 'pvc_conduit'),
    },
    {
      id: 'bollards',
      label: 'Add bollards to protect chargers',
      check: (s) => s.equipment.some((e) => e.equipmentType === 'bollard'),
      progress: (s, input) => {
        const placed = s.equipment.filter((e) => e.equipmentType === 'bollard').length;
        const target = input.charger?.count ?? 4;
        return `${placed}/${target}`;
      },
    },
    {
      id: 'signs',
      label: 'Add EV signage',
      check: (s) => s.equipment.some((e) => e.equipmentType === 'ev_sign'),
      progress: (s, input) => {
        const placed = s.equipment.filter((e) => e.equipmentType === 'ev_sign').length;
        const target = input.charger?.count ?? 4;
        return `${placed}/${target}`;
      },
    },
  ];
}

// ── Smart suggestions based on recent actions ──

interface Suggestion {
  readonly message: string;
  readonly shortcut?: string;
}

function getSuggestion(state: MapWorkspaceState): Suggestion | null {
  const hasL3 = state.equipment.some((e) => e.equipmentType === 'charger_l3');
  const hasTransformer = state.equipment.some((e) => e.equipmentType === 'transformer');
  const hasConduit = state.runs.some((r) => r.runType === 'conduit' || r.runType === 'pvc_conduit');
  const hasFeeder = state.runs.some((r) => r.runType === 'feeder');
  const hasCharger = state.equipment.some(
    (e) => e.equipmentType === 'charger_l2' || e.equipmentType === 'charger_l3',
  );
  const hasBollard = state.equipment.some((e) => e.equipmentType === 'bollard');

  if (hasL3 && !hasTransformer) {
    return {
      message: 'L3 DCFC chargers need a transformer. Place one near the utility entrance.',
      shortcut: 'R',
    };
  }

  if (hasTransformer && !hasFeeder) {
    return {
      message: 'Draw a feeder cable from utility to the transformer.',
      shortcut: 'F',
    };
  }

  if (hasConduit) {
    const hasJunction = state.equipment.some((e) => e.equipmentType === 'junction_box');
    if (!hasJunction) {
      return {
        message: 'Add junction boxes at major turns (every 90\u00b0 bend).',
        shortcut: 'J',
      };
    }
  }

  if (hasCharger && !hasBollard) {
    return {
      message: 'Protect each charger with a bollard ($550/ea).',
      shortcut: 'O',
    };
  }

  return null;
}

// ── Cost calculation ──

function computeRunningCost(state: MapWorkspaceState): { total: number; breakdown: string } {
  let total = 0;
  const parts: string[] = [];

  // Equipment costs
  const eqCounts: Record<string, number> = {};
  for (const eq of state.equipment) {
    eqCounts[eq.equipmentType] = (eqCounts[eq.equipmentType] ?? 0) + 1;
  }
  for (const [type, count] of Object.entries(eqCounts)) {
    const unitCost = UNIT_COSTS[type];
    if (unitCost) {
      total += unitCost * count;
      const label = EQUIPMENT_TYPE_CONFIG[type as keyof typeof EQUIPMENT_TYPE_CONFIG]?.label ?? type;
      parts.push(`${count} ${label.toLowerCase()}${count > 1 ? 's' : ''}`);
    }
  }

  // Run costs
  for (const run of state.runs) {
    const unitCost = UNIT_COSTS[run.runType];
    if (unitCost) {
      total += unitCost * run.lengthFt;
    }
  }

  // Summarize run footage
  const runFt: Record<string, number> = {};
  for (const run of state.runs) {
    runFt[run.runType] = (runFt[run.runType] ?? 0) + run.lengthFt;
  }
  for (const [type, ft] of Object.entries(runFt)) {
    const label = RUN_TYPE_CONFIG[type as keyof typeof RUN_TYPE_CONFIG]?.label ?? type;
    parts.push(`${Math.round(ft)}ft ${label.toLowerCase()}`);
  }

  return { total, breakdown: parts.join(' + ') };
}

// ── Component ──

interface MapGuidancePanelProps {
  mapState: MapWorkspaceState;
  input: EstimateInput;
  onNavigateToEstimate?: () => void;
}

export function MapGuidancePanel({ mapState, input, onNavigateToEstimate }: MapGuidancePanelProps) {
  const [collapsed, setCollapsed] = useState(false);

  const projectType = input.project.projectType;
  const checklist = useMemo(() => buildChecklist(projectType), [projectType]);

  const completedCount = checklist.filter((step) => step.check(mapState, input)).length;
  const allComplete = completedCount === checklist.length;

  const suggestion = getSuggestion(mapState);
  const { total, breakdown } = useMemo(() => computeRunningCost(mapState), [mapState]);

  const hasContent = mapState.equipment.length > 0 || mapState.runs.length > 0;

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-xs text-gray-600 shadow-md backdrop-blur-sm ring-1 ring-black/5 hover:bg-white transition"
      >
        <span className="font-medium">Guide</span>
        <span className="rounded-full bg-blue-100 px-1.5 py-px text-[10px] font-semibold text-blue-700">
          {completedCount}/{checklist.length}
        </span>
      </button>
    );
  }

  return (
    <div
      className="flex flex-col rounded-lg bg-white/95 shadow-md ring-1 ring-black/5 backdrop-blur-sm"
      style={{ maxWidth: '220px' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-2.5 py-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          Site Plan Guide
        </span>
        <button
          onClick={() => setCollapsed(true)}
          className="flex h-5 w-5 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
          title="Collapse guide"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 5 L8 5" />
          </svg>
        </button>
      </div>

      {/* Checklist */}
      <div className="px-2.5 py-2 space-y-1">
        {checklist.map((step) => {
          const done = step.check(mapState, input);
          const progress = step.progress?.(mapState, input);
          return (
            <div key={step.id} className="flex items-start gap-1.5">
              <span className={`mt-0.5 text-[11px] ${done ? 'text-green-600' : 'text-gray-300'}`}>
                {done ? '\u2713' : '\u25A1'}
              </span>
              <span
                className={`text-[11px] leading-tight ${
                  done ? 'text-gray-400 line-through' : 'text-gray-700'
                }`}
              >
                {step.label}
                {progress && !done && (
                  <span className="ml-1 text-[10px] text-gray-400">({progress})</span>
                )}
              </span>
            </div>
          );
        })}

        {allComplete && (
          <div className="mt-1 flex items-center gap-1 rounded bg-green-50 px-2 py-1">
            <span className="text-[11px] text-green-700 font-medium">
              Site plan looks complete!
            </span>
          </div>
        )}
      </div>

      {/* Smart suggestion */}
      {suggestion && (
        <div className="border-t border-gray-100 px-2.5 py-2">
          <div className="rounded bg-amber-50 px-2 py-1.5">
            <p className="text-[10px] leading-snug text-amber-800">
              <span className="font-semibold">Tip:</span> {suggestion.message}
            </p>
            {suggestion.shortcut && (
              <p className="mt-0.5 text-[9px] text-amber-600">
                Press <kbd className="rounded bg-amber-100 px-0.5 font-mono">{suggestion.shortcut}</kbd> to select tool
              </p>
            )}
          </div>
        </div>
      )}

      {/* Running cost estimate */}
      {hasContent && (
        <div className="border-t border-gray-100 px-2.5 py-2">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
            Map Items Total
          </div>
          <div className="text-sm font-bold text-gray-900">
            ${total.toLocaleString()}
          </div>
          {breakdown && (
            <div className="text-[9px] leading-snug text-gray-400 mt-0.5">
              {breakdown}
            </div>
          )}
        </div>
      )}

      {/* Complete button */}
      {allComplete && onNavigateToEstimate && (
        <div className="border-t border-gray-100 px-2.5 py-2">
          <button
            onClick={onNavigateToEstimate}
            className="w-full rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-blue-700 transition"
          >
            Complete &rarr; View Estimate
          </button>
        </div>
      )}
    </div>
  );
}
