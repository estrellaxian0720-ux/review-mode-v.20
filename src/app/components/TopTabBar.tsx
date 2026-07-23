import React from 'react';
import { Menu } from 'lucide-react';

/**
 * 全局顶部Tab栏组件
 * 显示三个主要模式：All Notes / Review Mode / Resource Center
 * 包含左侧的侧边栏切换按钮
 */

export type TopTabMode = 'all-notes' | 'review-mode' | 'resource-center';

interface TopTabBarProps {
  /** 当前激活的Tab */
  activeTab: TopTabMode;
  /** Tab切换回调 */
  onTabChange: (tab: TopTabMode) => void;
  /** 侧边栏切换回调 */
  onToggleSidebar?: () => void;
  /** 是否显示侧边栏按钮 */
  showSidebarToggle?: boolean;
}

export function TopTabBar({
  activeTab,
  onTabChange,
  onToggleSidebar,
  showSidebarToggle = true
}: TopTabBarProps) {
  const tabs: { id: TopTabMode; label: string }[] = [
    { id: 'all-notes', label: 'All Notes' },
    { id: 'review-mode', label: 'Review Mode' },
    { id: 'resource-center', label: 'Resource Center' },
  ];

  return (
    <div className="border-b border-gray-200 px-8 bg-white">
      <div className="flex items-center h-[60px]">
        {/* Left: Sidebar Toggle */}
        <div className="flex-shrink-0">
          {showSidebarToggle && (
            <button
              onClick={onToggleSidebar}
              className="p-2 text-[#666] hover:text-[#333] transition-colors"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Center: Pill-Style Tab Switch */}
        <div className="flex-1 flex justify-center">
          <div className="inline-flex items-center gap-1 bg-gray-100 rounded-full p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-6 py-2 text-[14px] font-semibold transition-colors rounded-full ${
                  activeTab === tab.id
                    ? 'text-[#333] bg-[#FDEA3B] shadow-sm'
                    : 'text-[#666] hover:text-[#333]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Empty (for visual balance) */}
        <div className="flex-shrink-0 w-[40px]"></div>
      </div>
    </div>
  );
}

export default TopTabBar;