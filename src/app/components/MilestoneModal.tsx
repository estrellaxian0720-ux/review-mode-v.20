import React from 'react';
import { Sparkles, Trophy, Flame, Star, Rocket } from 'lucide-react';

export type MilestoneType = 'first_mastered' | 'progress_20' | 'progress_40' | 'progress_60' | 'progress_80';

interface MilestoneModalProps {
  type: MilestoneType;
  onContinue: () => void;
}

interface MilestoneConfig {
  icon: React.ReactNode;
  title: string;
  message: string;
  bgGradient: string;
  iconBg: string;
}

const milestoneConfigs: Record<MilestoneType, MilestoneConfig> = {
  first_mastered: {
    icon: <Sparkles className="w-12 h-12 text-yellow-500" />,
    title: "First Point Mastered! 🎉",
    message: "Amazing start! You've mastered your first knowledge point. Keep this momentum going!",
    bgGradient: "from-yellow-50 to-amber-50",
    iconBg: "bg-yellow-100"
  },
  progress_20: {
    icon: <Flame className="w-12 h-12 text-orange-500" />,
    title: "20% Complete! 🔥",
    message: "You're on fire! One fifth of the way there. Every point brings you closer to mastery.",
    bgGradient: "from-orange-50 to-red-50",
    iconBg: "bg-orange-100"
  },
  progress_40: {
    icon: <Star className="w-12 h-12 text-blue-500 fill-blue-500" />,
    title: "40% Complete! ⭐",
    message: "Incredible progress! You're nearly halfway. Your hard work is paying off!",
    bgGradient: "from-blue-50 to-indigo-50",
    iconBg: "bg-blue-100"
  },
  progress_60: {
    icon: <Rocket className="w-12 h-12 text-purple-500" />,
    title: "60% Complete! 🚀",
    message: "You're soaring! More than halfway done. The finish line is in sight!",
    bgGradient: "from-purple-50 to-violet-50",
    iconBg: "bg-purple-100"
  },
  progress_80: {
    icon: <Trophy className="w-12 h-12 text-emerald-500" />,
    title: "80% Complete! 🏆",
    message: "Outstanding work! You're in the home stretch. Just a little more to go!",
    bgGradient: "from-emerald-50 to-green-50",
    iconBg: "bg-emerald-100"
  }
};

export function MilestoneModal({ type, onContinue }: MilestoneModalProps) {
  const config = milestoneConfigs[type];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Gradient Header */}
        <div className={`bg-gradient-to-br ${config.bgGradient} px-8 pt-12 pb-8 text-center`}>
          {/* Icon */}
          <div className={`${config.iconBg} w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg`}>
            {config.icon}
          </div>
          
          {/* Title */}
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            {config.title}
          </h2>
          
          {/* Message */}
          <p className="text-base text-gray-700 leading-relaxed">
            {config.message}
          </p>
        </div>

        {/* Confetti decoration */}
        <div className="relative h-3 bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400"></div>

        {/* Action Button */}
        <div className="p-8 bg-white">
          <button
            onClick={onContinue}
            className="w-full py-4 bg-[#2D8CFF] hover:bg-[#1e7ae8] text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Continue Learning
          </button>
        </div>
      </div>
    </div>
  );
}

export default MilestoneModal;