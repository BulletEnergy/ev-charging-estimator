'use client';

import { useEstimate } from '@/contexts/EstimateContext';
import { InputField } from '@/components/estimate/FormField';

export function StepRepInfo() {
  const { input, updateField } = useEstimate();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Rep &amp; Project Info</h2>
        <p className="mt-1 text-sm text-gray-500">
          Identify who is creating this estimate and the project details.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Rep Name"
          value={input.project.salesRep}
          onChange={(v) => updateField('project.salesRep', v)}
          required
          placeholder="e.g. John Smith"
        />
        <InputField
          label="Project Name"
          value={input.project.name}
          onChange={(v) => updateField('project.name', v)}
          required
          placeholder="e.g. Hilton Downtown EV Install"
        />
        <InputField
          label="Company Name"
          value={input.customer.companyName}
          onChange={(v) => updateField('customer.companyName', v)}
          placeholder="e.g. Hilton Hotels"
        />
      </div>
    </div>
  );
}
