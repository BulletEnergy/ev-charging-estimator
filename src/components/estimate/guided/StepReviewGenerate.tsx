'use client';

import { useEstimate } from '@/contexts/EstimateContext';

interface StepReviewGenerateProps {
  onGenerate: () => void;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-gray-900">{title}</h3>
      <dl className="grid gap-2 sm:grid-cols-2">{children}</dl>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | number | null | undefined | boolean }) {
  const display =
    value === null || value === undefined || value === ''
      ? '\u2014'
      : typeof value === 'boolean'
        ? value
          ? 'Yes'
          : 'No'
        : String(value);

  return (
    <div>
      <dt className="text-[0.6875rem] text-gray-400">{label}</dt>
      <dd className="text-sm text-gray-900">{display}</dd>
    </div>
  );
}

export function StepReviewGenerate({ onGenerate }: StepReviewGenerateProps) {
  const { input } = useEstimate();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Review &amp; Generate</h2>
        <p className="mt-1 text-sm text-gray-500">
          Review your entries below, then generate the estimate.
        </p>
      </div>

      <div className="space-y-4">
        <Section title="Rep & Project">
          <Field label="Rep Name" value={input.project.salesRep} />
          <Field label="Project Name" value={input.project.name} />
          <Field label="Company Name" value={input.customer.companyName} />
          <Field label="Project Type" value={input.project.projectType} />
        </Section>

        <Section title="Contact & Site">
          <Field label="Contact Name" value={input.customer.contactName} />
          <Field label="Phone" value={input.customer.contactPhone} />
          <Field label="Email" value={input.customer.contactEmail} />
          <Field label="Job Site Address" value={input.site.address} />
        </Section>

        <Section title="Equipment">
          <Field label="Purchasing Responsibility" value={input.purchasingChargers.responsibility} />
          <Field label="Charger Count" value={input.charger.count} />
          <Field label="Pedestal Count" value={input.charger.pedestalCount} />
          <Field label="Mount Type" value={input.charger.mountType} />
        </Section>

        <Section title="Electrical">
          <Field label="Conduit Distance (ft)" value={input.mapWorkspace?.conduitDistance_ft} />
          <Field label="Trenching Distance (ft)" value={input.mapWorkspace?.trenchingDistance_ft} />
          <Field label="PVC Conduit (ft)" value={input.mapWorkspace?.pvcConduitDistance_ft} />
          <Field label="Concrete Cutting (ft)" value={input.mapWorkspace?.concreteCuttingDistance_ft} />
        </Section>

        <Section title="Accessories">
          <Field label="Bollards" value={input.accessories.bollardQty} />
          <Field label="Signs / Stencils" value={input.accessories.signQty} />
          <Field label="Concrete Pads Required" value={input.accessories.padRequired} />
          <Field label="Concrete Pad Count" value={input.mapWorkspace?.concretePadCount} />
        </Section>
      </div>

      <div className="pt-4">
        <button
          type="button"
          onClick={onGenerate}
          className="w-full rounded-lg bg-[#13b3cf] py-3 px-8 text-base font-semibold text-white shadow-sm transition-colors hover:bg-[#0fa0ba] focus:outline-none focus:ring-2 focus:ring-[#13b3cf]/50 focus:ring-offset-2"
        >
          Generate Estimate
        </button>
      </div>
    </div>
  );
}
