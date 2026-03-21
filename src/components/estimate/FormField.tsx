'use client';

import type { ReactNode } from 'react';

const baseCls = 'block w-full rounded-[var(--radius-sm)] border-0 bg-black/[0.03] px-3.5 py-2.5 text-sm text-gray-900 ring-1 ring-inset ring-black/[0.06] placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[var(--system-blue)] transition-shadow';
const requiredCls = `${baseCls} ring-[var(--system-blue)]/30`;
const labelCls = 'block text-[0.8125rem] font-medium text-gray-700 mb-1.5';
const requiredLabelCls = `${labelCls} after:content-["*"] after:ml-0.5 after:text-[var(--system-blue)]`;
const hintCls = 'mt-1.5 text-[0.6875rem] text-gray-400';

interface InputFieldProps {
  label: string;
  value: string | number | null;
  onChange: (value: string) => void;
  type?: 'text' | 'number' | 'email';
  required?: boolean;
  placeholder?: string;
  hint?: string;
  min?: number;
  max?: number;
  step?: number;
  maxLength?: number;
  colSpan?: 2 | 3;
  aiSuggested?: boolean;
}

export function InputField({
  label, value, onChange, type = 'text', required, placeholder, hint, min, max, step, maxLength, colSpan, aiSuggested,
}: InputFieldProps) {
  const spanCls = colSpan === 3 ? 'sm:col-span-2 lg:col-span-3' : colSpan === 2 ? 'sm:col-span-2' : '';
  return (
    <div className={spanCls}>
      <label className={required ? requiredLabelCls : labelCls}>
        {label}
        {aiSuggested && <span className="ml-1 text-[var(--system-purple)]" title="AI suggested">&#10024;</span>}
      </label>
      <input
        className={required ? requiredCls : baseCls}
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        maxLength={maxLength}
      />
      {hint && <p className={hintCls}>{hint}</p>}
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  options: readonly { value: string; label: string }[];
  required?: boolean;
  hint?: string;
  placeholder?: string;
  colSpan?: 2 | 3;
  aiSuggested?: boolean;
}

export function SelectField({
  label, value, onChange, options, required, hint, placeholder, colSpan, aiSuggested,
}: SelectFieldProps) {
  const spanCls = colSpan === 3 ? 'sm:col-span-2 lg:col-span-3' : colSpan === 2 ? 'sm:col-span-2' : '';
  return (
    <div className={spanCls}>
      <label className={required ? requiredLabelCls : labelCls}>
        {label}
        {aiSuggested && <span className="ml-1 text-[var(--system-purple)]" title="AI suggested">&#10024;</span>}
      </label>
      <select
        className={required ? requiredCls : baseCls}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
      >
        <option value="">{placeholder ?? '-- Select --'}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {hint && <p className={hintCls}>{hint}</p>}
    </div>
  );
}

interface BoolFieldProps {
  label: string;
  value: boolean | null;
  onChange: (value: boolean | null) => void;
  aiSuggested?: boolean;
}

export function BoolField({ label, value, onChange, aiSuggested }: BoolFieldProps) {
  return (
    <div>
      <label className={labelCls}>
        {label}
        {aiSuggested && <span className="ml-1 text-[var(--system-purple)]" title="AI suggested">&#10024;</span>}
      </label>
      <select
        className={baseCls}
        value={value === null ? 'null' : String(value)}
        onChange={(e) => onChange(e.target.value === 'null' ? null : e.target.value === 'true')}
      >
        <option value="null">Unknown</option>
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>
    </div>
  );
}

interface TextareaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  rows?: number;
  colSpan?: 2 | 3;
}

export function TextareaField({ label, value, onChange, placeholder, hint, rows = 4, colSpan }: TextareaFieldProps) {
  const spanCls = colSpan === 3 ? 'sm:col-span-2 lg:col-span-3' : colSpan === 2 ? 'sm:col-span-2' : '';
  return (
    <div className={spanCls}>
      <label className={labelCls}>{label}</label>
      <textarea
        className={baseCls}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ minHeight: `${rows * 2}rem` }}
      />
      {hint && <p className={hintCls}>{hint}</p>}
    </div>
  );
}

interface CheckboxFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function CheckboxField({ label, checked, onChange }: CheckboxFieldProps) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-[var(--radius-sm)] bg-black/[0.02] px-3.5 py-3 ring-1 ring-inset ring-black/[0.04] transition hover:bg-black/[0.04]">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-[var(--system-blue)] focus:ring-[var(--system-blue)]" />
      <span className="text-[0.8125rem] font-medium text-gray-700">{label}</span>
    </label>
  );
}

export function FormGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}
