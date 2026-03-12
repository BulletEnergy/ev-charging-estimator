'use client';

import Link from 'next/link';
import { LogoutButton } from '@/components/LogoutButton';
import { ViewModeToggle } from '@/components/ViewModeToggle';
import { useViewMode } from '@/lib/viewMode';

const AI_FEATURES = [
  {
    name: 'SOW Parser',
    desc: 'Paste a project description and AI extracts all structured fields automatically',
    icon: 'NLP',
    color: 'purple',
  },
  {
    name: 'Chat Builder',
    desc: 'Conversational interface that asks smart follow-up questions to build the estimate',
    icon: 'Chat',
    color: 'green',
  },
  {
    name: 'AI Reviewer',
    desc: 'Senior estimator AI reviews the generated estimate for issues and missing items',
    icon: 'QA',
    color: 'amber',
  },
  {
    name: 'Photo Analysis',
    desc: 'Upload a site photo and AI identifies parking type, surface, mount options',
    icon: 'Cam',
    color: 'blue',
  },
];

export default function HomePage() {
  const { isAdvanced } = useViewMode();

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-[#0B1220] text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8">
          <div>
            <h1 className="text-3xl font-bold">BulletEV Estimate Generator</h1>
            <p className="mt-1 text-sm text-blue-300">Test Prototype v0.1.0</p>
          </div>
          <div className="flex items-center gap-4">
            <ViewModeToggle />
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Status Bar */}
        <div className="mb-10 flex flex-wrap gap-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-1.5 text-sm font-medium text-green-800">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Offline Mode
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-1.5 text-sm font-medium text-green-800">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Catalog Loaded (9 SC Packages + L2 + ChargePoint)
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-yellow-100 px-4 py-1.5 text-sm font-medium text-yellow-800">
            <span className="h-2 w-2 rounded-full bg-yellow-500" />
            monday.com: Not Connected
          </span>
          {isAdvanced && (
            <span className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-1.5 text-sm font-medium text-purple-800">
              <span className="h-2 w-2 rounded-full bg-purple-500" />
              Advanced Mode
            </span>
          )}
        </div>

        {/* Description */}
        <div className="mb-10 rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-gray-900">What is this?</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            This is a prototype estimate generator for Bullet Energy / BulletEV
            commercial EV charging installations. It demonstrates a standardized
            SOW-to-estimate pipeline that converts project inputs into detailed
            line-item estimates with pricing sources, confidence levels, and
            manual review triggers.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded border border-gray-100 bg-gray-50 p-4">
              <h3 className="font-medium text-gray-900">Four Pricing Buckets</h3>
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                <li>1. Hardware package pricing (Tesla SC, UWC, ChargePoint)</li>
                <li>2. Installation (site-specific line items)</li>
                <li>3. Tesla recurring services ($0.10/kWh public, etc.)</li>
                <li>4. Host-set driver pricing</li>
              </ul>
            </div>
            <div className="rounded border border-gray-100 bg-gray-50 p-4">
              <h3 className="font-medium text-gray-900">Transparency Features</h3>
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                <li>Pricing source badges on every line item</li>
                <li>Confidence levels (high/medium/low)</li>
                <li>Manual review triggers with severity</li>
                <li>&quot;Why this line?&quot; logic trace per item</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid gap-6 sm:grid-cols-2">
          <Link
            href="/estimate"
            className="group rounded-lg border-2 border-[#2563EB] bg-white p-6 transition hover:bg-blue-50 hover:shadow-md"
          >
            <h2 className="text-xl font-semibold text-[#2563EB] group-hover:underline">
              Estimate Generator
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {isAdvanced
                ? 'AI-enhanced estimator: paste a SOW, chat with AI, upload photos, and generate detailed estimates.'
                : 'Configure project inputs with a tabbed form, load sample scenarios, and generate detailed line-item estimates with rule traces.'}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                12 input sections
              </span>
              <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                4 sample scenarios
              </span>
              {isAdvanced && (
                <>
                  <span className="rounded bg-purple-100 px-2 py-0.5 text-xs text-purple-700">
                    AI SOW Parser
                  </span>
                  <span className="rounded bg-purple-100 px-2 py-0.5 text-xs text-purple-700">
                    Chat Builder
                  </span>
                </>
              )}
            </div>
          </Link>

          <Link
            href="/debug"
            className="group rounded-lg border-2 border-gray-300 bg-white p-6 transition hover:border-gray-400 hover:bg-gray-50 hover:shadow-md"
          >
            <h2 className="text-xl font-semibold text-gray-800 group-hover:underline">
              Debug View
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Inspect raw JSON payloads, generated line items, manual review
              triggers, and the complete hardware catalog.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                Raw JSON
              </span>
              <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                Catalog viewer
              </span>
              <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                Field map
              </span>
            </div>
          </Link>
        </div>

        {/* Advanced View: AI Features Grid */}
        {isAdvanced && (
          <div className="mt-10 rounded-lg border-2 border-purple-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-purple-900">
              AI-Enhanced Features
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              These features are available in the Estimate Generator when Advanced mode is enabled.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {AI_FEATURES.map((f) => (
                <div
                  key={f.name}
                  className="rounded border border-purple-100 bg-purple-50/50 px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-purple-200 px-2 py-0.5 text-xs font-bold text-purple-800">
                      {f.icon}
                    </span>
                    <p className="font-medium text-gray-900">{f.name}</p>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sample Scenarios Preview */}
        <div className="mt-10 rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Built-in Scenarios</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              { name: 'Hampton Inn Surface Lot', desc: '4x Tesla UWC, pedestal, surface lot, hotel' },
              { name: 'Downtown Apartment Garage', desc: '4x Tesla UWC, wall mount, P6 garage, PT slab unknown' },
              { name: 'Mixed Environment Complex', desc: '6x ChargePoint CT4000, mixed parking, triggers review' },
              { name: 'Tesla Supercharger Station', desc: '4-Stall SC package, fuel station, 480V 3-phase' },
            ].map((s) => (
              <div key={s.name} className="rounded border border-gray-100 bg-gray-50 px-4 py-3">
                <p className="font-medium text-gray-900">{s.name}</p>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
