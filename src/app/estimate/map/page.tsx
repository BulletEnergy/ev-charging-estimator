'use client';

import { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { EstimateInput, EstimateOutput } from '@/lib/estimate/types';
import { generateEstimate } from '@/lib/estimate/engine';
import { emptyInput } from '@/lib/estimate/emptyInput';
import { MAP_WORKSPACE_ENABLED } from '@/lib/map/feature-flags';

// Dynamic import — Mapbox GL requires DOM
const MapWorkspace = dynamic(
  () => import('@/components/map/MapWorkspace').then((m) => m.MapWorkspace),
  { ssr: false, loading: () => <MapLoadingPlaceholder /> },
);

function MapLoadingPlaceholder() {
  return (
    <div className="flex h-full items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="mb-2 text-lg font-medium text-gray-600">Loading Map Workspace...</div>
        <div className="text-sm text-gray-400">Initializing satellite imagery</div>
      </div>
    </div>
  );
}

export default function MapEstimatePage() {
  const [input, setInput] = useState<EstimateInput>(emptyInput);

  // Load input from sessionStorage (handoff from form page)
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('estimateInput');
      if (saved) {
        const parsed = JSON.parse(saved) as EstimateInput;
        setInput(parsed);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Save input to sessionStorage on change
  useEffect(() => {
    try {
      sessionStorage.setItem('estimateInput', JSON.stringify(input));
    } catch {
      // ignore storage errors
    }
  }, [input]);

  const estimate = useMemo<EstimateOutput | null>(() => {
    if (!input.charger.count || input.charger.count <= 0) return null;
    return generateEstimate(input);
  }, [input]);

  if (!MAP_WORKSPACE_ENABLED) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-2 text-xl font-bold text-gray-800">Map Workspace</h1>
          <p className="mb-4 text-gray-500">
            Map workspace is not enabled. Set NEXT_PUBLIC_MAP_WORKSPACE=true to enable.
          </p>
          <Link href="/estimate" className="text-blue-600 hover:underline">
            Back to Estimate Form
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2">
        <div className="flex items-center gap-3">
          <Link
            href="/estimate"
            className="rounded px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
          >
            &larr; Back to Form
          </Link>
          <h1 className="text-sm font-semibold text-gray-800">
            Map Workspace
          </h1>
          {input.project.name && (
            <span className="text-sm text-gray-500">
              &mdash; {input.project.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>Click to draw runs</span>
          <span>&bull;</span>
          <span>Double-click to finish</span>
          <span>&bull;</span>
          <span>Right-click to cancel/delete</span>
        </div>
      </header>

      {/* Main workspace */}
      <main className="flex-1 overflow-hidden">
        <MapWorkspace
          input={input}
          estimate={estimate}
          onInputChange={setInput}
        />
      </main>
    </div>
  );
}
