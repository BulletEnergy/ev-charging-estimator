'use client';

import { useViewMode, ViewMode } from '@/lib/viewMode';

export function ViewModeToggle() {
  const { mode, setMode } = useViewMode();

  const options: { value: ViewMode; label: string }[] = [
    { value: 'classic', label: 'Classic' },
    { value: 'advanced', label: 'Advanced' },
  ];

  return (
    <div className="flex rounded-lg border border-gray-600 overflow-hidden">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setMode(opt.value)}
          className={`px-3 py-1.5 text-xs font-medium transition ${
            mode === opt.value
              ? 'bg-[#2563EB] text-white'
              : 'bg-transparent text-gray-400 hover:text-white'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
