'use client';

import { STEP_LABELS, type GuidedStep } from '@/lib/estimate/guided-flow-config';

interface GuidedProgressBarProps {
  currentStep: GuidedStep;
  completedSteps: Set<GuidedStep>;
  onStepClick: (step: GuidedStep) => void;
}

const STEPS: GuidedStep[] = [1, 2, 3, 4, 5, 6];

export function GuidedProgressBar({ currentStep, completedSteps, onStepClick }: GuidedProgressBarProps) {
  return (
    <div className="w-full py-4 px-2">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {STEPS.map((step, i) => {
          const isCompleted = completedSteps.has(step);
          const isCurrent = step === currentStep;
          const isClickable = step <= currentStep || completedSteps.has((step - 1) as GuidedStep);

          return (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              {/* Step circle */}
              <button
                type="button"
                onClick={() => isClickable && onStepClick(step)}
                disabled={!isClickable}
                className={`
                  flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold shrink-0 transition-all
                  ${isCompleted
                    ? 'bg-emerald-500 text-white'
                    : isCurrent
                      ? 'bg-[#13b3cf] text-white ring-4 ring-[#13b3cf]/20'
                      : isClickable
                        ? 'bg-gray-200 text-gray-600 hover:bg-gray-300 cursor-pointer'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }
                `}
                title={STEP_LABELS[step]}
              >
                {isCompleted ? '\u2713' : step}
              </button>

              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1.5 rounded ${
                  completedSteps.has(step) ? 'bg-emerald-400' : 'bg-gray-200'
                }`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Current step label */}
      <p className="text-center text-xs text-gray-500 mt-2">
        Step {currentStep}: {STEP_LABELS[currentStep]}
      </p>
    </div>
  );
}
