'use client';

import { useReducer, useEffect, useCallback, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useEstimate } from '@/contexts/EstimateContext';
import { mapReducer, initialMapState } from '@/lib/map/workspace-reducer';
import { measurePointDistance, deriveRunLengths } from '@/lib/map/measurements';
import type { EquipmentType, PointToolType, RunType } from '@/lib/map/types';
import type { Point } from 'geojson';

const SiteMap = dynamic(() => import('@/components/map/SiteMap').then((m) => m.SiteMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-[400px] items-center justify-center rounded-lg bg-gray-100">
      <p className="text-sm text-gray-400">Loading satellite map...</p>
    </div>
  ),
});

type SimpleTool = 'charger' | 'panel' | 'transformer' | null;

let eqIdCounter = 0;

export function InlineMapPrompt() {
  const { input, updateField } = useEstimate();
  const siteCoordinates = input.mapWorkspace?.siteCoordinates ?? null;

  const [mapState, dispatch] = useReducer(mapReducer, undefined, initialMapState);
  const [activeTool, setActiveTool] = useState<SimpleTool>(null);

  // Sync siteCoordinates from estimate context into local map state
  useEffect(() => {
    if (siteCoordinates) {
      dispatch({
        type: 'SET_ADDRESS',
        address: input.site.address,
        coordinates: siteCoordinates,
      });
    }
  }, [siteCoordinates, input.site.address]);

  // Count chargers and panel from equipment placements
  const chargerPlacements = useMemo(
    () => mapState.equipment.filter((e) => e.equipmentType === 'charger_l2' || e.equipmentType === 'charger_l3'),
    [mapState.equipment],
  );
  const panelPlacement = useMemo(
    () => mapState.equipment.find((e) => e.equipmentType === 'panel'),
    [mapState.equipment],
  );
  const transformerPlacement = useMemo(
    () => mapState.equipment.find((e) => e.equipmentType === 'transformer'),
    [mapState.equipment],
  );

  const isDcfc = input.charger.chargingLevel === 'l3_dcfc';

  // Auto-calculate distances whenever placements change
  useEffect(() => {
    // Update charger count
    const chargerCount = chargerPlacements.length;
    if (chargerCount > 0) {
      updateField('mapWorkspace.chargerCountFromMap', chargerCount);
    }

    // Update panel placed flag
    updateField('mapWorkspace.hasPanelPlaced', !!panelPlacement);

    // Transformer placement → sync to map workspace + flip electrical.transformerRequired.
    // Distance uses a 15% routing buffer for MV-feeder conduit run, matching the
    // trunk-and-branch convention used for panel→charger conduit above.
    updateField('mapWorkspace.hasTransformerPlaced', !!transformerPlacement);
    if (transformerPlacement) {
      updateField('electrical.transformerRequired', true);
      if (panelPlacement) {
        const raw = measurePointDistance(transformerPlacement.geometry, panelPlacement.geometry);
        updateField('mapWorkspace.transformerToPanelDistance_ft', Math.round(raw * 1.15));
      } else {
        updateField('mapWorkspace.transformerToPanelDistance_ft', null);
      }
    } else {
      updateField('mapWorkspace.transformerToPanelDistance_ft', null);
    }

    // Calculate conduit/trench run length using trunk-and-branch topology.
    //
    // Prior implementation SUMMED distance from panel to every charger, which is
    // only correct for independent home-runs. Commercial parking-lot installs
    // use a single trunk from panel to the furthest drop, with branches along
    // the run — summing overstated conduit by ~3× on multi-charger jobs.
    //
    // Formula:
    //   trunk   = max( distance(panel, charger_i) )
    //   wire_ft = sum( distance(panel, charger_i) )   // wire IS per-drop
    //   conduit = (trunk + 15ft * (n-1)) * 1.15       // shared conduit trench
    if (panelPlacement && chargerPlacements.length > 0) {
      const distances = chargerPlacements.map((c) =>
        measurePointDistance(panelPlacement.geometry, c.geometry),
      );
      const { conduitFt, wireFt, trunkFt } = deriveRunLengths(distances);

      updateField('mapWorkspace.conduitDistance_ft', conduitFt);
      updateField('mapWorkspace.trenchingDistance_ft', conduitFt);
      updateField('mapWorkspace.pvcConduitDistance_ft', conduitFt);
      updateField('electrical.wire500mcm_ft', wireFt);
      updateField('mapWorkspace.concreteCuttingDistance_ft', 0);
      updateField('electrical.distanceToPanel_ft', trunkFt);
    }

    // Concrete pads = charger count
    if (chargerCount > 0) {
      updateField('mapWorkspace.concretePadCount', chargerCount);
      updateField('accessories.padRequired', true);
    }
  }, [chargerPlacements, panelPlacement, transformerPlacement, updateField]);

  // Map the simple tool to actual SiteMap tool types
  const selectedMapTool: RunType | EquipmentType | PointToolType | null = useMemo(() => {
    if (activeTool === 'charger') return isDcfc ? 'charger_l3' : 'charger_l2';
    if (activeTool === 'panel') return 'panel';
    if (activeTool === 'transformer') return 'transformer';
    return null;
  }, [activeTool, isDcfc]);

  const handleEquipmentPlace = useCallback(
    (equipmentType: EquipmentType, geometry: Point) => {
      // Replace existing singleton markers (panel / transformer are 1-per-job).
      if (equipmentType === 'panel' && panelPlacement) {
        dispatch({ type: 'DELETE_EQUIPMENT', id: panelPlacement.id });
      }
      if (equipmentType === 'transformer' && transformerPlacement) {
        dispatch({ type: 'DELETE_EQUIPMENT', id: transformerPlacement.id });
      }

      eqIdCounter += 1;
      const label =
        equipmentType === 'panel'
          ? 'Electrical Panel'
          : equipmentType === 'transformer'
            ? 'Utility Transformer'
            : `Charger ${chargerPlacements.length + 1}`;
      const equipment = {
        id: `eq-${eqIdCounter}`,
        equipmentType,
        geometry,
        label,
        properties: {},
      };
      dispatch({ type: 'ADD_EQUIPMENT', equipment });

      // Auto-deselect singleton tools after one placement.
      if (equipmentType === 'panel' || equipmentType === 'transformer') {
        setActiveTool(null);
      }
    },
    [panelPlacement, transformerPlacement, chargerPlacements.length],
  );

  const handleEquipmentUpdate = useCallback(
    (id: string, geometry: Point) => {
      dispatch({ type: 'UPDATE_EQUIPMENT', id, geometry });
    },
    [],
  );

  const handleEquipmentDelete = useCallback(
    (id: string) => {
      dispatch({ type: 'DELETE_EQUIPMENT', id });
    },
    [],
  );

  const handleFeatureSelect = useCallback(
    (id: string | null) => {
      dispatch({ type: 'SELECT_FEATURE', featureId: id });
    },
    [],
  );

  // Mutable arrays for SiteMap props
  const runs = useMemo(() => [...mapState.runs], [mapState.runs]);
  const equipment = useMemo(() => [...mapState.equipment], [mapState.equipment]);
  const chargerZones = useMemo(() => [...mapState.chargerZones], [mapState.chargerZones]);

  if (!siteCoordinates) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
        <p className="text-sm text-gray-500">
          Enter a job site address above to enable the satellite map.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Simple instruction */}
      <div className="rounded-lg bg-[#13b3cf]/10 px-4 py-3">
        <p className="text-sm font-medium text-[#0e9ab3]">
          {chargerPlacements.length === 0
            ? '1. Click "Place Charger" then tap on the map where chargers will go'
            : !panelPlacement
              ? '2. Now click "Place Panel" and tap where the electrical panel is'
              : isDcfc && !transformerPlacement
                ? '3. Supercharger: click "Place Transformer" and tap where the utility transformer sits'
                : `Done! ${chargerPlacements.length} charger${chargerPlacements.length !== 1 ? 's' : ''} placed. Distances auto-calculated. Drag icons to adjust.`}
        </p>
      </div>

      {/* Two simple tool buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setActiveTool(activeTool === 'charger' ? null : 'charger')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
            activeTool === 'charger'
              ? 'bg-[#2563EB] text-white shadow-md ring-2 ring-[#2563EB]/30'
              : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50'
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="12" height="14" rx="2"/><circle cx="12" cy="12" r="1.5"/><rect x="5" y="3" width="14" height="1.5" rx="0.5"/></svg>
          Place Charger {chargerPlacements.length > 0 && <span className="rounded-full bg-white/20 px-1.5 text-xs">{chargerPlacements.length}</span>}
        </button>

        <button
          type="button"
          onClick={() => setActiveTool(activeTool === 'panel' ? null : 'panel')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
            activeTool === 'panel'
              ? 'bg-[#2563EB] text-white shadow-md ring-2 ring-[#2563EB]/30'
              : panelPlacement
                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50'
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="1.5"/><rect x="7" y="5" width="4" height="1.5" rx="0.3"/><rect x="7" y="8" width="4" height="1.5" rx="0.3"/><rect x="13" y="5" width="4" height="1.5" rx="0.3"/></svg>
          {panelPlacement ? 'Panel Placed' : 'Place Panel'}
        </button>

        {isDcfc && (
          <button
            type="button"
            onClick={() => setActiveTool(activeTool === 'transformer' ? null : 'transformer')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
              activeTool === 'transformer'
                ? 'bg-[#2563EB] text-white shadow-md ring-2 ring-[#2563EB]/30'
                : transformerPlacement
                  ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                  : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50'
            }`}
            title="Utility transformer (DC fast charge jobs)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="6" width="16" height="12" rx="1"/><rect x="2" y="8" width="2" height="8" rx="0.5"/><rect x="20" y="8" width="2" height="8" rx="0.5"/><path d="M8 12h8"/></svg>
            {transformerPlacement ? 'Transformer Placed' : 'Place Transformer'}
          </button>
        )}

        {(chargerPlacements.length > 0 || panelPlacement || transformerPlacement) && (
          <button
            type="button"
            onClick={() => {
              dispatch({ type: 'RESET' });
              if (siteCoordinates) {
                dispatch({ type: 'SET_ADDRESS', address: input.site.address, coordinates: siteCoordinates });
              }
              setActiveTool(null);
            }}
            className="ml-auto rounded-lg px-3 py-2.5 text-xs font-medium text-gray-500 ring-1 ring-gray-200 hover:bg-gray-50"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Map */}
      <div className="relative h-[400px] rounded-lg overflow-hidden border border-gray-200 shadow-sm">
        <SiteMap
          siteCoordinates={siteCoordinates}
          runs={runs}
          equipment={equipment}
          selectedTool={selectedMapTool}
          selectedFeatureId={mapState.selectedFeatureId}
          powerSourceLocation={mapState.powerSourceLocation}
          chargerZones={chargerZones}
          onRunCreate={() => {}}
          onRunUpdate={() => {}}
          onRunDelete={() => {}}
          onEquipmentPlace={handleEquipmentPlace}
          onEquipmentUpdate={handleEquipmentUpdate}
          onEquipmentDelete={handleEquipmentDelete}
          onFeatureSelect={handleFeatureSelect}
          onPointToolPlace={() => {}}
        />
      </div>

      {/* Auto-calculated measurements */}
      {panelPlacement && chargerPlacements.length > 0 && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Auto-Calculated from Map
          </h4>
          <div className={`grid gap-2 ${transformerPlacement ? 'sm:grid-cols-4' : 'sm:grid-cols-3'}`}>
            <div className="rounded-md bg-white px-3 py-2">
              <span className="text-[0.6875rem] text-gray-500">Chargers</span>
              <p className="text-sm font-bold text-gray-900">{chargerPlacements.length}</p>
            </div>
            <div className="rounded-md bg-white px-3 py-2">
              <span className="text-[0.6875rem] text-gray-500">Est. Distance</span>
              <p className="text-sm font-bold text-gray-900">
                {input.mapWorkspace?.conduitDistance_ft
                  ? `${input.mapWorkspace.conduitDistance_ft} ft`
                  : '\u2014'}
              </p>
            </div>
            <div className="rounded-md bg-white px-3 py-2">
              <span className="text-[0.6875rem] text-gray-500">Panel to Nearest</span>
              <p className="text-sm font-bold text-gray-900">
                {input.electrical?.distanceToPanel_ft
                  ? `${input.electrical.distanceToPanel_ft} ft`
                  : '\u2014'}
              </p>
            </div>
            {transformerPlacement && (
              <div className="rounded-md bg-white px-3 py-2">
                <span className="text-[0.6875rem] text-gray-500">Transformer to Panel</span>
                <p className="text-sm font-bold text-gray-900">
                  {input.mapWorkspace?.transformerToPanelDistance_ft
                    ? `${input.mapWorkspace.transformerToPanelDistance_ft} ft`
                    : '\u2014'}
                </p>
              </div>
            )}
          </div>
          <p className="mt-2 text-[0.6875rem] text-emerald-600">
            Distances include 15% routing buffer. Right-click icons to remove. Drag to reposition.
          </p>
        </div>
      )}
    </div>
  );
}
