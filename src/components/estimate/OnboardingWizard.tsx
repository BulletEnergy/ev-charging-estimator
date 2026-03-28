'use client';

import { useState, useCallback } from 'react';
import { useEstimate } from '@/contexts/EstimateContext';
import { SCENARIOS } from '@/lib/estimate/scenarios';

type EntryPoint = 'sow' | 'chat' | 'map' | 'form';

const PROJECT_TYPES = [
  { id: 'full_turnkey', label: 'Full Turnkey', desc: 'We handle everything end-to-end' },
  { id: 'full_turnkey_connectivity', label: 'Turnkey + Network', desc: 'Full install plus connectivity setup' },
  { id: 'equipment_install_commission', label: 'Equip + Install', desc: 'Client purchases, we install' },
  { id: 'install_commission', label: 'Install Only', desc: 'Client supplies chargers, we install' },
  { id: 'remove_replace', label: 'Remove & Replace', desc: 'Swap existing chargers for new' },
  { id: 'supercharger', label: 'Supercharger', desc: 'Tesla Supercharger package' },
  { id: 'equipment_purchase', label: 'Equipment Only', desc: 'Hardware procurement only' },
  { id: 'commission_only', label: 'Commission Only', desc: 'Activation and configuration' },
  { id: 'service_work', label: 'Service Work', desc: 'Maintenance and repairs' },
] as const;

const ENTRY_OPTIONS: Array<{ id: EntryPoint; icon: string; title: string; desc: string }> = [
  { id: 'sow', icon: '\u{1F4C4}', title: 'Paste a project description', desc: 'AI extracts structured fields from SOW or project notes' },
  { id: 'chat', icon: '\u{1F4AC}', title: 'Tell me about the project', desc: 'Answer questions conversationally \u2014 AI builds the estimate' },
  { id: 'map', icon: '\u{1F30E}', title: 'Enter an address', desc: 'Map workspace with AI site assessment from satellite + street view' },
  { id: 'form', icon: '\u{1F4DD}', title: 'Fill out the form', desc: 'Standard 12-section form \u2014 full control over every field' },
];

interface OnboardingWizardProps {
  readonly onEntrySelect: (entry: EntryPoint) => void;
}

export function OnboardingWizard({ onEntrySelect }: OnboardingWizardProps) {
  const { updateField, setInput } = useEstimate();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const handleProjectType = useCallback((typeId: string) => {
    updateField('project.projectType', typeId);
    setStep(3);
  }, [updateField]);

  const handleScenario = useCallback((scenarioId: string) => {
    const found = SCENARIOS.find((s) => s.id === scenarioId);
    if (found) {
      setInput(found.input);
      onEntrySelect('form');
    }
  }, [setInput, onEntrySelect]);

  if (step === 1) {
    return (
      <div className="mx-auto max-w-3xl px-2 py-8 sm:py-14">
        <div className="mb-8 text-center">
          <p className="flex items-center justify-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-gray-400">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            Get Started
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-[-0.022em] text-gray-900 sm:text-3xl">How would you like to start?</h2>
          <p className="mt-2 text-[0.875rem] text-gray-500">Choose the best entry point for your project</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {ENTRY_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => opt.id === 'form' ? setStep(2) : onEntrySelect(opt.id)}
              className="lg-card flex items-start gap-4 p-5 text-left"
              style={{ borderRadius: 'var(--radius-md)' }}
            >
              <span className="text-2xl">{opt.icon}</span>
              <div>
                <p className="text-[0.875rem] font-semibold text-gray-900">{opt.title}</p>
                <p className="mt-1 text-[0.8125rem] leading-6 text-gray-500">{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="mx-auto max-w-3xl px-2 py-8 sm:py-14">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold tracking-[-0.022em] text-gray-900">What type of project?</h2>
          <p className="mt-2 text-[0.875rem] text-gray-500">This pre-fills relevant settings and determines included line items</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {PROJECT_TYPES.map((pt) => (
            <button
              key={pt.id}
              onClick={() => handleProjectType(pt.id)}
              className="lg-card p-4 text-left"
              style={{ borderRadius: 'var(--radius-md)' }}
            >
              <p className="text-[0.8125rem] font-semibold text-gray-900">{pt.label}</p>
              <p className="mt-1 text-[0.75rem] leading-5 text-gray-500">{pt.desc}</p>
            </button>
          ))}
        </div>
        <button onClick={() => setStep(1)} className="mt-6 text-sm text-gray-400 hover:text-gray-600">
          &larr; Back
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl py-8 sm:py-14">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold tracking-[-0.022em] text-gray-900">Load a sample scenario?</h2>
        <p className="mt-2 text-[0.875rem] text-gray-500">Start from a realistic example, or skip to the blank form</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            onClick={() => handleScenario(s.id)}
            className="lg-card p-5 text-left"
            style={{ borderRadius: 'var(--radius-md)' }}
          >
            <p className="text-[0.875rem] font-semibold text-gray-900">{s.name}</p>
            <p className="mt-1 text-[0.8125rem] leading-6 text-gray-500">{s.description}</p>
          </button>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between">
        <button onClick={() => setStep(2)} className="text-sm text-gray-400 hover:text-gray-600">
          &larr; Back
        </button>
        <button
          onClick={() => onEntrySelect('form')}
          className="lg-pill lg-pill-active px-6 py-2.5 text-sm font-semibold"
        >
          Start with blank form
        </button>
      </div>
    </div>
  );
}
