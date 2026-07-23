import { TrendingUp, Play, BookOpen } from 'lucide-react';

interface PivotPopupProps {
  masteryPercentage: number;
  onEnterMockExam: () => void;
  onKeepPracticing: () => void;
  onClose: () => void;
}

export function PivotPopup({ masteryPercentage, onEnterMockExam, onKeepPracticing, onClose }: PivotPopupProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-[480px] overflow-hidden animate-slideUp">
        {/* Top Zone - Celebratory */}
        <div className="bg-[#FDEA3B] px-8 py-8 text-center">
          <div className="w-16 h-16 bg-white/90 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <TrendingUp className="w-8 h-8 text-black" />
          </div>
          <h2 className="text-2xl font-bold text-black mb-2">Great progress!</h2>
          <p className="text-[15px] font-medium text-black/90 leading-relaxed max-w-[320px] mx-auto">
            You’ve built a strong understanding and reached {masteryPercentage}% mastery.
          </p>
          <p className="text-[13px] text-black/70 mt-3 max-w-[300px] mx-auto">
            This means you’re ready to test yourself or continue refining your skills.
          </p>
        </div>
        
        {/* Bottom Zone - Neutral Decision */}
        <div className="p-8 bg-white">
          <div className="space-y-3">
            <button
              onClick={onEnterMockExam}
              className="w-full py-4 px-6 bg-[#2D8CFF] hover:bg-[#1D7CEF] text-white rounded-xl font-bold text-[15px] shadow-blue-500/20 shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              Try a Mock Exam
            </button>
            
            <button
              onClick={onKeepPracticing}
              className="w-full py-4 px-6 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 rounded-xl font-bold text-[15px] transition-all flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Keep Practicing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PivotPopup;