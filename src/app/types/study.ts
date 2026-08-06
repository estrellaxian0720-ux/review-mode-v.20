/**
 * Study and Learning Types
 * 学习相关类型定义
 */

/**
 * 知识点状态
 */
export type KnowledgePointStatus = 
  | 'not-started'   // 未开始
  | 'in-progress'   // 进行中
  | 'mastered';     // 已掌握

/**
 * 知识点数据模型
 */
export interface KnowledgePoint {
  /** 知识点唯一标识 */
  id: string;
  
  /** 知识点标题 */
  title: string;
  
  /** 掌握度 (0-1) */
  mastery: number;
  
  /** 状态 */
  status: KnowledgePointStatus;
  
  /** 所属日期（Day ID） */
  dayId?: number;
  
  /** 练习次数 */
  practiceCount?: number;
  
  /** 最后练习时间 */
  lastPracticed?: string;
}

/**
 * 练习模式
 */
export type PracticeMode = 
  | 'mcq'        // 多选题
  | 'flashcard'  // 闪卡
  | 'true-false';// 判断题

/**
 * 计划方式：仅决定进入既有的自动拆分或全冲刺分支。
 */
export type PlanMethod = 'SYSTEM_PLANNED' | 'SPRINT_ONLY';

export interface PlanPhaseAllocation {
  learnDays: number;
  sprintDays: number;
  sprintTrigger: 'USER_SELECTED' | 'DEADLINE_FORCED' | 'STAGE_SCHEDULED';
}

/** 将设置项映射到既有阶段算法；工作量、容量与出题逻辑保持不变。 */
export function resolvePlanPhaseAllocation(
  planMethod: PlanMethod,
  effectiveStudyDays: number,
  fullSprintThreshold = 7,
): PlanPhaseAllocation {
  const days = Math.max(0, Math.floor(effectiveStudyDays));
  if (planMethod === 'SPRINT_ONLY') {
    return { learnDays: 0, sprintDays: days, sprintTrigger: 'USER_SELECTED' };
  }
  if (days < fullSprintThreshold) {
    return { learnDays: 0, sprintDays: days, sprintTrigger: 'DEADLINE_FORCED' };
  }
  const sprintDays = Math.ceil(days * 0.2);
  return { learnDays: days - sprintDays, sprintDays, sprintTrigger: 'STAGE_SCHEDULED' };
}

/**
 * 学习计划配置
 */
export interface StudyPlanConfig {
  /** 学习空间ID */
  spaceId: string;

  /** 计划方式；默认由系统按剩余时间安排。 */
  planMethod: PlanMethod;
  
  /** 目标分数 */
  targetScore: number;
  
  /** 每日学习小时数 */
  dailyStudyHours: number;
  
  /** 考试日期 */
  examDate?: string;
  
  /** 总天数 */
  totalDays: number;
  
  /** 当前天数 */
  currentDay: number;
}

/**
 * 里程碑类型
 */
export type MilestoneType = 
  | 'first-point'   // 第一个知识点
  | 'progress-20'   // 20% 进度
  | 'progress-40'   // 40% 进度
  | 'progress-60'   // 60% 进度
  | 'progress-80'   // 80% 进度
  | 'progress-100'; // 100% 进度

/**
 * 学习统计数据
 */
export interface StudyStats {
  /** 总学习时长（秒） */
  totalStudyTime: number;
  
  /** 今日学习时长（秒） */
  todayStudyTime: number;
  
  /** 完成的知识点数量 */
  completedPoints: number;
  
  /** 总知识点数量 */
  totalPoints: number;
  
  /** 整体掌握度 (0-100) */
  overallMastery: number;
  
  /** 连续学习天数 */
  streakDays: number;
}
