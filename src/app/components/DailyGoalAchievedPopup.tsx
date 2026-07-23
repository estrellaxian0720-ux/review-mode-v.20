import { Award, TrendingUp } from 'lucide-react';

interface DailyGoalAchievedPopupProps {
  dailyHours: number;
  masteryPercentage: number;
  remainingKnowledgePoints?: number;
  onContinue: () => void;
  onReturnToDashboard: () => void;
}

export function DailyGoalAchievedPopup({ 
  dailyHours, 
  masteryPercentage, 
  remainingKnowledgePoints = 3,
  onContinue, 
  onReturnToDashboard 
}: DailyGoalAchievedPopupProps) {
  
  // Check if all knowledge points are completed
  const allPointsCompleted = remainingKnowledgePoints === 0;
  
  // Generate body text based on state
  const getBodyText = () => {
    if (allPointsCompleted) {
      return "You've completed all knowledge points for today! Your consistency and focus have paid off.";
    }
    
    if (masteryPercentage < 50) {
      return "Start with the remaining high-impact points to strengthen weak areas and boost mastery.";
    }
    
    return "Almost there. Next, finish the remaining knowledge points to complete today's plan.";
  };

  // Primary CTA text
  const getPrimaryCTA = () => {
    if (allPointsCompleted) {
      return "Move to Tomorrow's Plan";
    }
    
    return "Continue Learning";
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-[32px] shadow-2xl w-[520px] px-12 py-10 animate-slideUp">
        {/* Icon - Yellow Circle with Award Badge */}
        <div className="flex justify-center mb-8">
          <div className="w-[120px] h-[120px] bg-[#FDEA3B] rounded-full flex items-center justify-center">
            <Award className="w-[60px] h-[60px] text-[#1a1a1a] fill-[#1a1a1a]" strokeWidth={2} />
          </div>
        </div>

        {/* Title with emoji */}
        <h2 className="text-[28px] font-bold text-[#1a1a1a] text-center mb-3">
          🎉 You've hit your time goal.
        </h2>
        
        {/* Body */}
        <p className="text-[16px] text-[#666] text-center mb-8 leading-relaxed">
          {getBodyText()}
        </p>

        {/* Mastery Progress Card */}
        <div className="bg-[#F5F5F5] rounded-[20px] px-6 py-5 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#2D8CFF]" strokeWidth={2.5} />
              <span className="text-[16px] font-semibold text-[#333]">Today's Knowledge Mastery</span>
            </div>
            <span className="text-[32px] font-bold text-[#1a1a1a]">{masteryPercentage}%</span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full h-[8px] bg-[#D9D9D9] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#2D8CFF] rounded-full transition-all duration-500"
              style={{ width: `${masteryPercentage}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={onContinue}
            className="w-full h-[56px] bg-[#FDEA3B] hover:bg-[#FDE721] text-[#1a1a1a] rounded-full font-bold text-[17px] transition-all shadow-sm hover:shadow-md"
          >
            {getPrimaryCTA()}
          </button>
          <button
            onClick={onReturnToDashboard}
            className="w-full h-[56px] bg-white hover:bg-[#F9FAFB] text-[#666] border-2 border-[#E5E7EB] rounded-full font-semibold text-[16px] transition-all"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}