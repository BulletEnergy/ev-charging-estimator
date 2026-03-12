'use client';

import type { MapWorkspaceState } from '@/lib/map/types';
import { AddressSearch } from './AddressSearch';
import { MeasurementOverlay } from './MeasurementOverlay';

interface SiteInfoPanelProps {
  mapState: MapWorkspaceState;
  onAddressSelect: (address: string, coordinates: [number, number]) => void;
}

export function SiteInfoPanel({ mapState, onAddressSelect }: SiteInfoPanelProps) {
  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-4">
      <div className="text-sm font-semibold text-gray-800">Site Info</div>

      <AddressSearch
        onAddressSelect={onAddressSelect}
        initialAddress={mapState.siteAddress}
      />

      {mapState.siteCoordinates && (
        <div className="rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-500">
          {mapState.siteCoordinates[1].toFixed(6)}, {mapState.siteCoordinates[0].toFixed(6)}
        </div>
      )}

      <MeasurementOverlay runs={mapState.runs} equipment={mapState.equipment} />

      {/* Summary stats */}
      <div className="mt-auto border-t border-gray-100 pt-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded bg-gray-50 p-2 text-center">
            <div className="text-lg font-bold text-gray-900">
              {mapState.runs.length}
            </div>
            <div className="text-xs text-gray-500">Runs</div>
          </div>
          <div className="rounded bg-gray-50 p-2 text-center">
            <div className="text-lg font-bold text-gray-900">
              {mapState.equipment.length}
            </div>
            <div className="text-xs text-gray-500">Equipment</div>
          </div>
        </div>
      </div>
    </div>
  );
}
