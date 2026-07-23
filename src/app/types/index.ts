/**
 * Type Definitions Index
 * 统一导出所有类型定义
 */

// Navigation
export type { Screen, TabMode, NavigationHistoryItem } from './navigation';

// Resources
export type { 
  ResourceType, 
  ResourceSource, 
  ResourcePriority,
  Resource,
  ResourceForTriage
} from './resource';

// Study & Learning
export type {
  KnowledgePointStatus,
  KnowledgePoint,
  PracticeMode,
  StudyPlanConfig,
  MilestoneType,
  StudyStats
} from './study';

// Exam & Testing
export type {
  QuestionType,
  QuestionDifficulty,
  ExamQuestion,
  ExamConfig,
  ExamAnswer,
  ExamResults,
  ExamReportFilter
} from './exam';

// Notes
export type {
  NoteType,
  Note,
  Folder,
  NoteDisplayMethod,
  NoteSortMethod,
  EditorTool,
  EditorConfig
} from './note';