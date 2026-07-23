/**
 * Exam and Testing Types
 * 考试相关类型定义
 */

/**
 * 题目类型
 */
export type QuestionType = 
  | 'multiple-choice'  // 多选题
  | 'true-false'       // 判断题
  | 'short-answer'     // 简答题
  | 'essay';           // 论述题

/**
 * 题目难度
 */
export type QuestionDifficulty = 
  | 'easy'
  | 'medium'
  | 'hard';

/**
 * 考试题目
 */
export interface ExamQuestion {
  /** 题目ID */
  id: number;
  
  /** 题目类型 */
  type: QuestionType;
  
  /** 题目内容 */
  question: string;
  
  /** 选项（多选题） */
  options?: string[];
  
  /** 正确答案 */
  correctAnswer: number | string | boolean;
  
  /** 难度 */
  difficulty: QuestionDifficulty;
  
  /** 所属知识点ID */
  knowledgePointId?: string;
  
  /** 分数 */
  points: number;
}

/**
 * 考试配置
 */
export interface ExamConfig {
  /** 考试时长（秒） */
  duration: number;
  
  /** 题目数量 */
  questionCount: number;
  
  /** 题目类型分布 */
  questionTypes?: {
    'multiple-choice'?: number;
    'true-false'?: number;
    'short-answer'?: number;
  };
  
  /** 难度分布 */
  difficultyDistribution?: {
    easy?: number;
    medium?: number;
    hard?: number;
  };
  
  /** 是否允许返回修改 */
  allowReview?: boolean;
  
  /** 是否显示题目分数 */
  showPoints?: boolean;
}

/**
 * 考试答案记录
 */
export interface ExamAnswer {
  /** 题目ID */
  questionId: number;
  
  /** 用户答案 */
  userAnswer: number | string | boolean | null;
  
  /** 是否正确 */
  isCorrect?: boolean;
  
  /** 答题时间（秒） */
  timeSpent?: number;
}

/**
 * 考试结果
 */
export interface ExamResults {
  /** 考试ID */
  examId: string;
  
  /** 答案记录 */
  answers: Map<number, number | string>;
  
  /** 标记的题目 */
  flaggedQuestions: Set<number>;
  
  /** 总分 */
  score: number;
  
  /** 总题数 */
  totalQuestions: number;
  
  /** 用时（秒） */
  timeSpent: number;
  
  /** 正确率 (0-100) */
  accuracy: number;
  
  /** 按知识点分类的表现 */
  performanceByTopic?: {
    topicId: string;
    topicName: string;
    correct: number;
    total: number;
    accuracy: number;
  }[];
  
  /** 按难度分类的表现 */
  performanceByDifficulty?: {
    difficulty: QuestionDifficulty;
    correct: number;
    total: number;
    accuracy: number;
  }[];
  
  /** 完成时间 */
  completedAt: string;
}

/**
 * 考试统计过滤器
 */
export type ExamReportFilter = 
  | 'all'
  | 'correct'
  | 'incorrect'
  | 'flagged';