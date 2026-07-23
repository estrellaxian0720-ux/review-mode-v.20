// AI Tutoring Session Types

export type TutoringSurface = 'panel' | 'fullscreen' | 'floating';

export type TriggerType = 
  | 'flashcard_deep_learning'
  | 'daily_3_consecutive_wrong'
  | 'daily_20_wrong';

export type QuizKind = 'choice' | 'judgment';
export type DiagramKind = 'compare' | 'tree' | 'flow';
export type ImageSource = 'asset' | 'web' | 'ai_gen';

export interface MarkdownBlock {
  type: 'markdown';
  md: string;
}

export interface QuizOption {
  key: string;
  text: string;
}

export interface QuizBlock {
  type: 'quiz';
  kind: QuizKind;
  conceptId: string;
  stem: string;
  options: QuizOption[];
  answer: string;
  userAnswer?: string;
  explanation: string;
  traceback?: {
    conceptId: string;
    label: string;
  };
}

export interface FlashcardBlock {
  type: 'flashcard';
  conceptId: string;
  front: string;
  back: string;
}

export interface CompareData {
  title: string;
  columns: string[];
  rows: Array<{
    label: string;
    cells: string[];
  }>;
}

export interface TreeNode {
  label: string;
  children?: TreeNode[];
}

export interface TreeData {
  title: string;
  root: string;
  children: TreeNode[];
}

export interface FlowStep {
  id: string;
  text: string;
}

export interface FlowEdge {
  from: string;
  to: string;
}

export interface FlowData {
  title: string;
  steps: FlowStep[];
  edges: FlowEdge[];
}

export interface DiagramBlock {
  type: 'diagram';
  kind: DiagramKind;
  data: CompareData | TreeData | FlowData;
}

export interface ImageBlock {
  type: 'image';
  src: string;
  source: ImageSource;
  caption: string;
  ref?: {
    book?: string;
    page?: number;
    site?: string;
    url?: string;
  };
  disclaimer?: string;
}

export interface VideoBlock {
  type: 'video';
  src: string;
  source: ImageSource;
  caption: string;
  ref?: {
    book?: string;
    page?: number;
    site?: string;
    url?: string;
  };
  disclaimer?: string;
  loading?: boolean;
}

export interface TracebackBlock {
  type: 'traceback';
  conceptId: string;
  label: string;
}

export type ContentBlock = 
  | MarkdownBlock
  | QuizBlock
  | FlashcardBlock
  | DiagramBlock
  | ImageBlock
  | VideoBlock
  | TracebackBlock;

export interface Message {
  role: 'user' | 'assistant';
  blocks: ContentBlock[];
  aiGenerated?: boolean;
}

export interface ForcedEntryAction {
  id: string;
  label: string;
  completionReason: string;
}

export interface EntryFlashcardAction {
  afterFlip: boolean;
  actions: string[];
  deepLearningTrigger: TriggerType;
}

export interface ThreeWrongPrompt {
  trigger: TriggerType;
  text: string;
  actions: string[];
  surface: TutoringSurface;
  blocking: boolean;
}

export interface ExitQuizItem {
  conceptId: string;
  stem: string;
  options: QuizOption[];
  answer: string;
}

export interface ExitQuiz {
  note: string;
  items: ExitQuizItem[];
}

export interface SourceBadge {
  source: ImageSource;
  label: string;
  color: string;
  url?: string;
  disclaimer?: string;
}

export interface FloatingDowngrade {
  note: string;
  summary: string;
  cta: string;
}

export interface TutoringSession {
  surface: TutoringSurface;
  trigger: TriggerType;
  conceptId: string;
  conceptName: string;
  dailyConsecutiveWrongCount: number;
  dailyTotalWrongCount: number;
  forcedEntryActions?: ForcedEntryAction[];
  entryFlashcardActionSample?: EntryFlashcardAction;
  threeWrongPromptSample?: ThreeWrongPrompt;
  messages: Message[];
  exitQuiz?: ExitQuiz;
  sourceBadgeSamples?: SourceBadge[];
  floatingDowngradeSample?: FloatingDowngrade;
}
