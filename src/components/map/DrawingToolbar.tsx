'use client';

import { useCallback, useEffect, useState } from 'react';
import type { RunType, EquipmentType, PointToolType } from '@/lib/map/types';
import { RUN_TYPE_CONFIG, EQUIPMENT_TYPE_CONFIG } from '@/lib/map/constants';
import { EquipmentIcon } from './EquipmentIcons';

type ToolType = RunType | EquipmentType | PointToolType | null;

interface DrawingToolbarProps {
  selectedTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  onClearAll: () => void;
  onUndo: () => void;
}

// ── Per-unit cost labels (hardcoded from catalog) ──

const TOOL_COSTS: Record<string, string> = {
  // Runs (per foot)
  conduit: '$32/ft',
  pvc_conduit: '$20/ft',
  feeder: '$22/ft',
  trench: '$45/ft',
  bore: '$85/ft',
  concrete_cut: '$45/ft',
  cable_tray: '~$25/ft',
  // Equipment (per unit)
  charger_l2: '$750/ea',
  charger_l3: 'varies',
  transformer: '~$25K',
  switchgear: 'varies',
  panel: '\u2014',
  disconnect: '\u2014',
  utility_meter: '\u2014',
  junction_box: '\u2014',
  bollard: '$550/ea',
  ev_sign: '$400/ea',
  wheel_stop: '$275/ea',
  concrete_pad: '$600/ea',
  lighting: '$2,200/ea',
  meter_room: '\u2014',
};

// ── Section definitions ──

const PATH_TOOLS: RunType[] = [
  'conduit',
  'pvc_conduit',
  'feeder',
  'trench',
  'bore',
  'concrete_cut',
  'cable_tray',
];

const ELECTRICAL_TOOLS: EquipmentType[] = [
  'charger_l2',
  'charger_l3',
  'transformer',
  'switchgear',
  'panel',
  'disconnect',
  'utility_meter',
  'junction_box',
];

const SITE_TOOLS: EquipmentType[] = [
  'bollard',
  'ev_sign',
  'wheel_stop',
  'concrete_pad',
  'lighting',
  'meter_room',
];

type SectionKey = 'paths' | 'electrical' | 'site';

export function DrawingToolbar({ selectedTool, onSelectTool, onClearAll, onUndo }: DrawingToolbarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<SectionKey, boolean>>({
    paths: true,
    electrical: true,
    site: true,
  });

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toUpperCase();

      for (const [runType, config] of Object.entries(RUN_TYPE_CONFIG)) {
        if (config.shortcut === key) {
          onSelectTool(selectedTool === runType ? null : (runType as RunType));
          return;
        }
      }

      for (const [eqType, config] of Object.entries(EQUIPMENT_TYPE_CONFIG)) {
        if (config.shortcut === key) {
          onSelectTool(selectedTool === eqType ? null : (eqType as EquipmentType));
          return;
        }
      }

      if ((e.ctrlKey || e.metaKey) && key === 'Z') {
        onUndo();
        return;
      }

      if (e.key === 'Escape') {
        onSelectTool(null);
      }
    },
    [selectedTool, onSelectTool, onUndo],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Auto-expand the section containing the selected tool
  useEffect(() => {
    if (!selectedTool) return;
    if (PATH_TOOLS.includes(selectedTool as RunType)) {
      setExpandedSections((prev) => ({ ...prev, paths: true }));
      setCollapsed(false);
    } else if (ELECTRICAL_TOOLS.includes(selectedTool as EquipmentType)) {
      setExpandedSections((prev) => ({ ...prev, electrical: true }));
      setCollapsed(false);
    } else if (SITE_TOOLS.includes(selectedTool as EquipmentType)) {
      setExpandedSections((prev) => ({ ...prev, site: true }));
      setCollapsed(false);
    }
  }, [selectedTool]);

  const toggleSection = (section: SectionKey) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-md ring-1 ring-black/5 hover:bg-gray-50 transition"
        title="Show drawing tools"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
          <path d="M12 19l7-7 3 3-7 7-3-3z" />
          <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
          <path d="M2 2l7.586 7.586" />
          <circle cx="11" cy="11" r="2" />
        </svg>
      </button>
    );
  }

  return (
    <div
      className="flex flex-col rounded-lg bg-white/95 shadow-md ring-1 ring-black/5 backdrop-blur-sm overflow-y-auto"
      style={{ maxWidth: '220px', maxHeight: 'calc(100vh - 120px)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-2.5 py-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Tools</span>
        <button
          onClick={() => setCollapsed(true)}
          className="flex h-5 w-5 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
          title="Collapse toolbar"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 2 L8 8 M8 2 L2 8" />
          </svg>
        </button>
      </div>

      {/* PATHS Section */}
      <div>
        <button
          onClick={() => toggleSection('paths')}
          className="flex w-full items-center gap-1.5 px-2.5 py-1.5 text-left hover:bg-gray-50 transition"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round">
            <path d="M1 8 L5 4 L8 6 L11 2" />
          </svg>
          <span className="flex-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500">Paths</span>
          <svg
            width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#9CA3AF" strokeWidth="1.5"
            className={`transition-transform ${expandedSections.paths ? 'rotate-180' : ''}`}
          >
            <path d="M2 4 L5 7 L8 4" />
          </svg>
        </button>

        {expandedSections.paths && (
          <div className="grid grid-cols-1 gap-0.5 border-t border-gray-50 px-1 pb-1">
            {PATH_TOOLS.map((type) => {
              const config = RUN_TYPE_CONFIG[type];
              const cost = TOOL_COSTS[type];
              return (
                <button
                  key={type}
                  onClick={() => onSelectTool(selectedTool === type ? null : type)}
                  className={`flex w-full items-center gap-1.5 rounded px-2 py-1 text-left transition-colors ${
                    selectedTool === type
                      ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  title={`${config.description} (${config.shortcut})`}
                >
                  <span
                    className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
                    style={{ backgroundColor: config.color }}
                  />
                  <span className="flex-1 min-w-0">
                    <span className="block truncate text-[11px] leading-tight">
                      {config.label}{' '}
                      <kbd className="rounded bg-gray-100 px-0.5 py-px text-[8px] text-gray-400">{config.shortcut}</kbd>
                    </span>
                    {cost && (
                      <span className="block text-[9px] leading-tight text-gray-400">{cost}</span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ELECTRICAL Section */}
      <div className="border-t border-gray-100">
        <button
          onClick={() => toggleSection('electrical')}
          className="flex w-full items-center gap-1.5 px-2.5 py-1.5 text-left hover:bg-gray-50 transition"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round">
            <rect x="2" y="2" width="8" height="8" rx="1" />
            <path d="M6 4 L5 6 L7 6 L6 8" />
          </svg>
          <span className="flex-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500">Electrical</span>
          <svg
            width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#9CA3AF" strokeWidth="1.5"
            className={`transition-transform ${expandedSections.electrical ? 'rotate-180' : ''}`}
          >
            <path d="M2 4 L5 7 L8 4" />
          </svg>
        </button>

        {expandedSections.electrical && (
          <div className="grid grid-cols-1 gap-0.5 border-t border-gray-50 px-1 pb-1">
            {ELECTRICAL_TOOLS.map((type) => {
              const config = EQUIPMENT_TYPE_CONFIG[type];
              const cost = TOOL_COSTS[type];
              return (
                <button
                  key={type}
                  onClick={() => onSelectTool(selectedTool === type ? null : type)}
                  className={`flex w-full items-center gap-1.5 rounded px-2 py-1 text-left transition-colors ${
                    selectedTool === type
                      ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  title={`Place ${config.label} (${config.shortcut})`}
                >
                  <span className="shrink-0">
                    <EquipmentIcon type={type} size={18} />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block truncate text-[11px] leading-tight">
                      {config.label}{' '}
                      <kbd className="rounded bg-gray-100 px-0.5 py-px text-[8px] text-gray-400">{config.shortcut}</kbd>
                    </span>
                    {cost && (
                      <span className="block text-[9px] leading-tight text-gray-400">{cost}</span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* SITE Section */}
      <div className="border-t border-gray-100">
        <button
          onClick={() => toggleSection('site')}
          className="flex w-full items-center gap-1.5 px-2.5 py-1.5 text-left hover:bg-gray-50 transition"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round">
            <path d="M1 11 L6 1 L11 11 Z" />
          </svg>
          <span className="flex-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500">Site</span>
          <svg
            width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#9CA3AF" strokeWidth="1.5"
            className={`transition-transform ${expandedSections.site ? 'rotate-180' : ''}`}
          >
            <path d="M2 4 L5 7 L8 4" />
          </svg>
        </button>

        {expandedSections.site && (
          <div className="grid grid-cols-1 gap-0.5 border-t border-gray-50 px-1 pb-1">
            {SITE_TOOLS.map((type) => {
              const config = EQUIPMENT_TYPE_CONFIG[type];
              const cost = TOOL_COSTS[type];
              return (
                <button
                  key={type}
                  onClick={() => onSelectTool(selectedTool === type ? null : type)}
                  className={`flex w-full items-center gap-1.5 rounded px-2 py-1 text-left transition-colors ${
                    selectedTool === type
                      ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  title={`Place ${config.label} (${config.shortcut})`}
                >
                  <span className="shrink-0">
                    <EquipmentIcon type={type} size={18} />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block truncate text-[11px] leading-tight">
                      {config.label}{' '}
                      <kbd className="rounded bg-gray-100 px-0.5 py-px text-[8px] text-gray-400">{config.shortcut}</kbd>
                    </span>
                    {cost && (
                      <span className="block text-[9px] leading-tight text-gray-400">{cost}</span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Active tool cancel */}
      {selectedTool && (
        <div className="border-t border-gray-100 px-1.5 py-1">
          <button
            onClick={() => onSelectTool(null)}
            className="w-full rounded bg-gray-100 px-2 py-1 text-[10px] text-gray-500 hover:bg-gray-200 transition"
          >
            Cancel (Esc)
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-1 border-t border-gray-100 px-1.5 py-1">
        <button
          onClick={onUndo}
          className="flex-1 rounded bg-gray-50 px-1.5 py-1 text-[10px] text-gray-500 hover:bg-gray-100 transition"
          title="Undo (Ctrl+Z)"
        >
          Undo
        </button>
        <button
          onClick={() => {
            if (window.confirm('Clear all drawings, equipment, and runs from the map?')) {
              onClearAll();
            }
          }}
          className="flex-1 rounded bg-red-50 px-1.5 py-1 text-[10px] text-red-500 hover:bg-red-100 transition"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
