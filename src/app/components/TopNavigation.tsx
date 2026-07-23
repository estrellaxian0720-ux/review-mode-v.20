import React from 'react';
import { Home, BookOpen, Dumbbell } from 'lucide-react';

interface TopNavigationProps {
  activeTab?: 'home' | 'review' | 'practice';
  activeMode?: 'review-mode' | 'practice-mode';
  onHomeClick?: () => void;
  onReviewClick?: () => void;
  onPracticeClick?: () => void;
}

export function TopNavigation({
  activeTab = 'review',
  activeMode,
  onHomeClick,
  onReviewClick,
  onPracticeClick,
}: TopNavigationProps) {
  // Determine which tab should be active based on either activeTab or activeMode
  const currentTab = activeMode === 'practice-mode' ? 'practice' : activeMode === 'review-mode' ? 'review' : activeTab;

  return (
    <div className="flex items-center justify-center px-6 py-4 bg-white border-b border-gray-200">
      <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1">
        {/* Home Button */}
        <button
          onClick={onHomeClick}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium transition-all ${
            currentTab === 'home'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </button>

        {/* Review Mode Button */}
        <button
          onClick={onReviewClick}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium transition-all ${
            currentTab === 'review'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Review Mode</span>
        </button>

        {/* Practice Mode Button */}
        <button
          onClick={onPracticeClick}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium transition-all ${
            currentTab === 'practice'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Dumbbell className="w-4 h-4" />
          <span>Practice Mode</span>
        </button>
      </div>
    </div>
  );
}

export default TopNavigation;