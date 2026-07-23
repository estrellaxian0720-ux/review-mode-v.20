import React from 'react';
import { LayoutDashboard, BarChart2, ClipboardList } from 'lucide-react';

/**
 * Review Mode 底部Tab栏组件
 * 仅在 Review Mode 激活时显示
 * 包含三个子Tab：Dashboard / 概览 / Mock Exam
 */

export type ReviewModeTab = 'dashboard' | 'overview' | 'mock-exam';

interface ReviewModeBottomTabBarProps {
  /** 当前激活的Tab */
  activeTab: ReviewModeTab;
  /** Tab切换回调 */
  onTabChange: (tab: ReviewModeTab) => void;
}

export function ReviewModeBottomTabBar({ activeTab, onTabChange }: ReviewModeBottomTabBarProps) {
  const tabs = [
    {
      id: 'dashboard' as ReviewModeTab,
      label: 'Today',
      icon: LayoutDashboard,
    },
    {
      id: 'overview' as ReviewModeTab,
      label: '概览',
      icon: BarChart2,
    },
    {
      id: 'mock-exam' as ReviewModeTab,
      label: 'Mock Exam',
      icon: ClipboardList,
    },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex items-center justify-around px-8 z-20">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center gap-1 py-2 px-6 rounded-lg transition-all ${
              isActive
                ? 'bg-[#FDEA3B] text-gray-900'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-gray-900' : 'text-gray-500'}`} strokeWidth={2} />
            <span className={`text-xs font-medium ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default ReviewModeBottomTabBar;
