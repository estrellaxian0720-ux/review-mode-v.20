import { CheckCircle2 } from 'lucide-react';

interface KnowledgePointMasteredPopupProps {
  knowledgePointName: string;
  remainingPoints: number;
  onContinue: () => void;
  onExit: () => void;
}

export function KnowledgePointMasteredPopup({
  knowledgePointName,
  remainingPoints,
  onContinue,
  onExit,
}: KnowledgePointMasteredPopupProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-[20px] shadow-[0px_25px_50px_0px_rgba(0,0,0,0.25)] w-[520px] p-8">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-b from-[#FFF566] to-[#FDEA3B] rounded-[18px] flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-[#333]" strokeWidth={2.5} />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-[24px] font-bold text-[#111827] text-center mb-3 tracking-[-0.9px]">
          Knowledge Point Mastered!
        </h2>

        {/* Knowledge Point Name */}
        <div className="bg-[#f8f9fa] rounded-[12px] px-4 py-3 mb-4">
          <p className="text-[15px] font-semibold text-[#333] text-center tracking-[-0.3px]">
            {knowledgePointName}
          </p>
        </div>

        {/* Description */}
        <p className="text-[14px] text-[#6b7280] text-center mb-2 leading-[22px] tracking-[-0.3px]">
          Great work! You've successfully mastered this knowledge point.
        </p>
        
        {/* Remaining Points Info */}
        {remainingPoints > 0 && (
          <p className="text-[14px] text-[#6b7280] text-center mb-6 leading-[22px] tracking-[-0.3px]">
            You still have <span className="font-semibold text-[#2D8CFF]">{remainingPoints} knowledge point{remainingPoints !== 1 ? 's' : ''}</span> remaining.
          </p>
        )}
        
        {remainingPoints === 0 && (
          <p className="text-[14px] font-semibold text-[#008236] text-center mb-6 leading-[22px] tracking-[-0.3px]">
            You've completed all knowledge points!
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          {/* Exit Button */}
          <button
            onClick={onExit}
            className="flex-1 h-[48px] rounded-[12px] border-2 border-[#d1d5dc] bg-white text-[#333] font-semibold text-[15px] tracking-[-0.3px] hover:bg-gray-50 hover:border-gray-400 transition-all"
          >
            Exit Practice
          </button>

          {/* Continue Button */}
          {remainingPoints > 0 && (
            <button
              onClick={onContinue}
              className="flex-1 h-[48px] rounded-[12px] bg-[#2D8CFF] text-white font-semibold text-[15px] tracking-[-0.3px] hover:bg-[#2680ef] transition-colors shadow-[0px_4px_6px_0px_rgba(43,127,255,0.2)]"
            >
              Continue Learning
            </button>
          )}
          
          {remainingPoints === 0 && (
            <button
              onClick={onExit}
              className="flex-1 h-[48px] rounded-[12px] bg-[#FDEA3B] text-[#333] font-semibold text-[15px] tracking-[-0.3px] hover:bg-[#fde82b] transition-colors"
            >
              Back to Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}