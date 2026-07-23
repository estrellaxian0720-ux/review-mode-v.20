import { Calendar } from 'lucide-react';

interface DaySwitchConfirmationProps {
  targetDayId: number;
  targetDayLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DaySwitchConfirmation({ 
  targetDayId,
  targetDayLabel,
  onConfirm, 
  onCancel 
}: DaySwitchConfirmationProps) {
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] animate-fadeIn">
      <div className="bg-white rounded-[24px] shadow-2xl w-[440px] p-8 animate-slideUp">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-[#EFF6FF] rounded-full flex items-center justify-center">
            <Calendar className="w-8 h-8 text-[#2D8CFF]" strokeWidth={2} />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-[22px] font-bold text-[#111827] text-center mb-3">
          Switch learning day?
        </h2>
        
        {/* Body */}
        <p className="text-[15px] text-[#6B7280] text-center mb-2 leading-relaxed">
          Your learning focus will move to <span className="font-semibold text-[#374151]">{targetDayLabel}</span>.
        </p>
        <p className="text-[15px] text-[#6B7280] text-center mb-8 leading-relaxed">
          You can switch back anytime.
        </p>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={onConfirm}
            className="w-full h-[52px] bg-[#2D8CFF] hover:bg-[#1D7CEF] text-white rounded-full font-bold text-[16px] transition-all shadow-sm hover:shadow-md"
          >
            Switch day
          </button>
          <button
            onClick={onCancel}
            className="w-full h-[52px] bg-white hover:bg-[#F9FAFB] text-[#6B7280] border-2 border-[#E5E7EB] rounded-full font-medium text-[15px] transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}