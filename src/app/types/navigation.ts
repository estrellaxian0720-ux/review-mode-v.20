/**
 * Navigation and Routing Types
 * 统一的导航和路由类型定义
 */

/**
 * 应用中所有可能的屏幕路由
 * 统一使用 kebab-case 命名
 */
export type Screen = 
  | 'space-selector'
  | 'resources'
  | 'resource-collection'
  | 'priority-triage'
  | 'plan-loading'
  | 'dashboard'
  | 'practice'
  | 'course-progress'
  | 'mock-exam-setup'
  | 'mock-exam'
  | 'exam-report'
  | 'all-notes'
  | 'favorites'
  | 'plan-framework';

/**
 * 底部Tab栏模式
 * 统一使用 kebab-case 命名
 */
export type TabMode = 
  | 'all-notes' 
  | 'review-mode' 
  | 'resource-center';

/**
 * 导航历史记录项
 */
export interface NavigationHistoryItem {
  screen: Screen;
  timestamp: number;
}
