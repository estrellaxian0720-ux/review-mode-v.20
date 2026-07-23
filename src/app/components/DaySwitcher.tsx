import { Check } from 'lucide-react';

interface Day {
  id: number;
  label: string;
  isCurrent: boolean;
}

interface DaySwitcherProps {
  days: Day[];
  currentDayId: number;
  totalDays: number;
  onSelectDay: (dayId: number) => void;
  onClose: () => void;
  isGenerating?: boolean;
}

export function DaySwitcher({ 
  days, 
  currentDayId, 
  totalDays,
  onSelectDay, 
  onClose,
  isGenerating = false
}: DaySwitcherProps) {
  
  return (
    <div 
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-[24px] shadow-xl w-[420px] overflow-hidden animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100">
          <h3 className="text-[18px] font-bold text-[#111827]">Select Learning Day</h3>
          <p className="text-[13px] text-[#6B7280] mt-1">
            {isGenerating 
              ? "Full plan is still being prepared" 
              : "Choose which day to focus on"}
          </p>
        </div>

        {/* Day List */}
        <div className="max-h-[400px] overflow-y-auto py-2">
          {days.map((day) => {
            const isCurrent = day.id === currentDayId;
            
            return (
              <button
                key={day.id}
                disabled={isGenerating}
                onClick={() => {
                  if (!isCurrent && !isGenerating) {
                    onSelectDay(day.id);
                  } else if (isCurrent) {
                    onClose();
                  }
                }}
                className={`
                  w-full px-6 py-4 flex items-center justify-between
                  transition-colors
                  ${isGenerating 
                    ? 'opacity-50 cursor-not-allowed' 
                    : isCurrent 
                      ? 'bg-[#F0F9FF] cursor-default' 
                      : 'hover:bg-[#F9FAFB] cursor-pointer'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-bold text-[15px]
                    ${isCurrent 
                      ? 'bg-[#2D8CFF] text-white' 
                      : 'bg-[#F3F4F6] text-[#6B7280]'
                    }
                  `}>
                    {day.id}
                  </div>
                  <span className={`
                    text-[15px] font-medium
                    ${isCurrent ? 'text-[#2D8CFF]' : 'text-[#374151]'}
                  `}>
                    {day.label}
                  </span>
                </div>

                {isCurrent ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-[#2D8CFF] bg-[#DBEAFE] px-3 py-1 rounded-full">
                      Current
                    </span>
                    <Check className="w-5 h-5 text-[#2D8CFF]" strokeWidth={2.5} />
                  </div>
                ) : (
                  !isGenerating && (
                    <span className="text-[13px] font-medium text-[#2D8CFF] hover:underline">
                      Switch
                    </span>
                  )
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-[#F9FAFB]">
          <button
            onClick={onClose}
            className="w-full h-[44px] bg-white border border-[#E5E7EB] rounded-full text-[#374151] font-medium text-[14px] hover:bg-[#F9FAFB] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}