import { CheckCircle, ArrowRight, LayoutDashboard, Calendar } from 'lucide-react';

interface MasteryCompletionPopupProps {
  onMoveToNextSegment: () => void;
  onReturnToHub: () => void;
}

export function MasteryCompletionPopup({ onMoveToNextSegment, onReturnToHub }: MasteryCompletionPopupProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-[480px] overflow-hidden animate-slideUp">
        <div className="bg-green-50 px-8 py-8 text-center border-b border-green-100">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-green-100">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">You’ve completed this study segment</h2>
          <p className="text-[15px] font-medium text-gray-600">
            Your consistent practice has paid off.
          </p>
        </div>
        
        <div className="p-8">
          <div className="space-y-3">
            <button
              onClick={onMoveToNextSegment}
              className="w-full py-4 px-6 bg-[#FDEA3B] hover:bg-[#FDD835] text-black rounded-xl font-bold text-[15px] shadow-lg shadow-yellow-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4 text-black" />
              Move to Tomorrow’s Plan
              <ArrowRight className="w-4 h-4 text-black" />
            </button>
            
            <button
              onClick={onReturnToHub}
              className="w-full py-4 px-6 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 rounded-xl font-bold text-[15px] transition-all flex items-center justify-center gap-2"
            >
              <LayoutDashboard className="w-4 h-4" />
              Return to Review Mode Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MasteryCompletionPopup;