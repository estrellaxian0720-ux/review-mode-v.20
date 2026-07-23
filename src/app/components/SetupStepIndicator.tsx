const STEPS = [
  { number: 1, label: 'Set Goal' },
  { number: 2, label: 'Add Materials' },
  { number: 3, label: 'Prioritize' },
];

interface SetupStepIndicatorProps {
  currentStep: 1 | 2 | 3;
}

export function SetupStepIndicator({ currentStep }: SetupStepIndicatorProps) {
  return (
    <div className="flex items-start gap-0">
      {STEPS.map((step, idx) => {
        const isActive = step.number === currentStep;
        const isDone = step.number < currentStep;

        return (
          <div key={step.number} className="flex items-start">
            {/* Circle + label */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold border-2 transition-all ${
                  isActive
                    ? 'bg-[#FDEA3B] border-[#FDEA3B] text-[#111827]'
                    : isDone
                    ? 'bg-[#111827] border-[#111827] text-white'
                    : 'bg-white border-[#D1D5DC] text-[#9CA3AF]'
                }`}
              >
                {isDone ? (
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                    <path d="M2.5 7L5.5 10L11.5 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  step.number
                )}
              </div>
              <span
                className={`text-[11px] font-medium whitespace-nowrap font-['Inter'] ${
                  isActive ? 'text-[#111827] font-semibold' : isDone ? 'text-[#6B7280]' : 'text-[#9CA3AF]'
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line between circles */}
            {idx < STEPS.length - 1 && (
              <div className="mt-4 mx-1.5 flex-shrink-0">
                <div className={`w-12 h-px ${step.number < currentStep ? 'bg-[#111827]' : 'bg-[#D1D5DC]'}`} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default SetupStepIndicator;
