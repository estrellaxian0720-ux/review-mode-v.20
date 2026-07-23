import React, { createContext, useContext, useState, ReactNode, useTransition } from 'react';
import type { Screen } from '../types/navigation';
import type { Resource, ResourceForTriage } from '../types/resource';
import type { ExamConfig, ExamResults } from '../types/exam';

/**
 * 顶部Tab类型（全局）
 */
export type TopTabMode = 'all-notes' | 'review-mode' | 'resource-center';

/**
 * Review Mode底部Tab类型（仅在review-mode下）
 */
export type ReviewModeTab = 'dashboard' | 'overview' | 'mock-exam';

/**
 * 应用全局状态接口
 */
interface AppState {
  // 导航状态
  currentScreen: Screen;
  topTab: TopTabMode;
  reviewModeTab: ReviewModeTab;
  previousScreen: Screen | null;
  
  // 侧边栏状态
  isSidebarCollapsed: boolean;
  
  // 学习计划状态
  selectedSpaceId: string | null;
  practiceStartingPoint: string | undefined;
  dailyStudyHours: number;
  
  // 进度追踪
  overallMastery: number;
  
  // 弹窗控制
  showPivotPopup: boolean;
  showMasteryCompletion: boolean;
  showMicroTriage: boolean;
  showExamSetup: boolean;
  
  // 资源管理
  resources: Resource[];
  newResourcesForTriage: ResourceForTriage[];
  
  // 考试相关
  examConfig: ExamConfig | null;
  examResults: ExamResults | null;
}

/**
 * 应用操作方法接口
 */
interface AppActions {
  // 导航操作
  navigateTo: (screen: Screen) => void;
  setTopTab: (tab: TopTabMode) => void;
  setReviewModeTab: (tab: ReviewModeTab) => void;
  
  // 侧边栏操作
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  // 学习计划操作
  setSelectedSpaceId: (id: string | null) => void;
  setPracticeStartingPoint: (id: string | undefined) => void;
  setDailyStudyHours: (hours: number) => void;
  
  // 进度操作
  updateMastery: (mastery: number) => void;
  
  // 弹窗控制
  setShowPivotPopup: (show: boolean) => void;
  setShowMasteryCompletion: (show: boolean) => void;
  setShowMicroTriage: (show: boolean) => void;
  setShowExamSetup: (show: boolean) => void;
  
  // 资源操作
  addResources: (resources: Resource[]) => void;
  updateResource: (id: string, updates: Partial<Resource>) => void;
  removeResource: (id: string) => void;
  acknowledgeResourceUpdate: (id: string) => void;
  setNewResourcesForTriage: (resources: ResourceForTriage[]) => void;
  
  // 考试操作
  setExamConfig: (config: ExamConfig | null) => void;
  setExamResults: (results: ExamResults | null) => void;
  
  // 复合操作
  startPractice: (startingPointId?: string) => void;
  exitPractice: (forcedMastery?: number) => void;
  startMockExam: (config: ExamConfig) => void;
  submitExam: (results: ExamResults) => void;
}

type AppContextType = AppState & AppActions;

const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * 初始资源数据
 */
const initialResources: Resource[] = [
  {
    id: '1',
    title: 'Linear Algebra Lecture Notes - Week 1-5',
    type: 'notes',
    source: 'internal',
    priority: 'exam-leak',
    lastUpdated: '2026-01-04T00:00:00Z',
    hasUpdate: true,
  },
  {
    id: '2',
    title: 'Chapter 5: Eigenvalues and Eigenvectors',
    type: 'pdf',
    source: 'external',
    priority: 'exam-leak',
    lastUpdated: '2026-01-03T00:00:00Z',
    size: '2.4 MB',
    hasUpdate: false,
  },
  {
    id: '3',
    title: 'Matrix Transformations Presentation',
    type: 'ppt',
    source: 'external',
    priority: 'high-yield',
    lastUpdated: '2026-01-02T00:00:00Z',
    size: '5.1 MB',
    hasUpdate: true,
  },
  {
    id: '4',
    title: 'Professor Johnson - SVD Lecture Recording',
    type: 'audio',
    source: 'external',
    priority: 'high-yield',
    lastUpdated: '2025-12-28T00:00:00Z',
    size: '45 MB',
    hasUpdate: false,
  },
  {
    id: '5',
    title: 'MIT OpenCourseWare - Linear Algebra',
    type: 'link',
    source: 'external',
    priority: 'past-papers',
    lastUpdated: '2025-12-20T00:00:00Z',
    hasUpdate: false,
  },
  {
    id: '6',
    title: 'Study Group Notes - Orthogonal Matrices',
    type: 'notes',
    source: 'internal',
    priority: 'high-yield',
    lastUpdated: '2026-01-05T00:00:00Z',
    hasUpdate: false,
  },
  {
    id: '7',
    title: 'Chapter 3: Vector Spaces',
    type: 'pdf',
    source: 'external',
    priority: 'routine',
    lastUpdated: '2025-12-15T00:00:00Z',
    size: '1.8 MB',
    hasUpdate: false,
  },
  {
    id: '8',
    title: 'Practice Problems Set 4',
    type: 'pdf',
    source: 'external',
    priority: 'past-papers',
    lastUpdated: '2026-01-01T00:00:00Z',
    size: '890 KB',
    hasUpdate: false,
  },
];

/**
 * AppProvider 组件
 */
export function AppProvider({ children }: { children: ReactNode }) {
  // 导航状态
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [topTab, setTopTab] = useState<TopTabMode>('review-mode');
  const [reviewModeTab, setReviewModeTab] = useState<ReviewModeTab>('dashboard');
  const [previousScreen, setPreviousScreen] = useState<Screen | null>(null);
  
  // 侧边栏状态
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // 学习计划状态
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
  const [practiceStartingPoint, setPracticeStartingPoint] = useState<string | undefined>(undefined);
  const [dailyStudyHours, setDailyStudyHours] = useState(2);
  
  // 进度追踪
  const [overallMastery, setOverallMastery] = useState(68);
  
  // 弹窗控制
  const [showPivotPopup, setShowPivotPopup] = useState(false);
  const [showMasteryCompletion, setShowMasteryCompletion] = useState(false);
  const [showMicroTriage, setShowMicroTriage] = useState(false);
  const [showExamSetup, setShowExamSetup] = useState(false);
  
  // 资源管理
  const [resources, setResources] = useState<Resource[]>(initialResources);
  const [newResourcesForTriage, setNewResourcesForTriage] = useState<ResourceForTriage[]>([]);
  
  // 考试相关
  const [examConfig, setExamConfig] = useState<ExamConfig | null>(null);
  const [examResults, setExamResults] = useState<ExamResults | null>(null);

  // 使用 useTransition 处理导航过渡
  const [isPending, startTransition] = useTransition();

  // 导航操作 - 使用 startTransition 包裹以避免 Suspense 错误
  const navigateTo = (screen: Screen) => {
    startTransition(() => {
      setPreviousScreen(currentScreen);
      setCurrentScreen(screen);
    });
  };

  // 进度操作
  const updateMastery = (mastery: number) => {
    setOverallMastery(mastery);
  };

  // 资源操作
  const addResources = (newResources: Resource[]) => {
    setResources(prev => [...prev, ...newResources]);
  };

  const updateResource = (id: string, updates: Partial<Resource>) => {
    setResources(prev => prev.map(r => 
      r.id === id ? { ...r, ...updates } : r
    ));
  };

  const removeResource = (id: string) => {
    setResources(prev => prev.filter(r => r.id !== id));
  };

  const acknowledgeResourceUpdate = (id: string) => {
    updateResource(id, { hasUpdate: false });
  };

  // 复合操作
  const startPractice = (startingPointId?: string) => {
    setPracticeStartingPoint(startingPointId);
    navigateTo('practice');
  };

  const exitPractice = (forcedMastery?: number) => {
    const newMastery = forcedMastery !== undefined 
      ? forcedMastery 
      : Math.min(overallMastery + 5, 100);
      
    setOverallMastery(newMastery);
    
    if (newMastery >= 80 && newMastery < 100) {
      setShowPivotPopup(true);
    }
    
    if (newMastery >= 100) {
      setShowMasteryCompletion(true);
    } else {
      navigateTo('dashboard');
    }
  };

  const startMockExam = (config: ExamConfig) => {
    setExamConfig(config);
    navigateTo('mock-exam');
  };

  const submitExam = (results: ExamResults) => {
    setExamResults(results);
    navigateTo('exam-report');
  };

  const value: AppContextType = {
    // 状态
    currentScreen,
    topTab,
    reviewModeTab,
    previousScreen,
    isSidebarCollapsed,
    selectedSpaceId,
    practiceStartingPoint,
    dailyStudyHours,
    overallMastery,
    showPivotPopup,
    showMasteryCompletion,
    showMicroTriage,
    showExamSetup,
    resources,
    newResourcesForTriage,
    examConfig,
    examResults,
    
    // 操作
    navigateTo,
    setTopTab,
    setReviewModeTab,
    toggleSidebar: () => setIsSidebarCollapsed(prev => !prev),
    setSidebarCollapsed: setIsSidebarCollapsed,
    setSelectedSpaceId,
    setPracticeStartingPoint,
    setDailyStudyHours,
    updateMastery,
    setShowPivotPopup,
    setShowMasteryCompletion,
    setShowMicroTriage,
    setShowExamSetup,
    addResources,
    updateResource,
    removeResource,
    acknowledgeResourceUpdate,
    setNewResourcesForTriage,
    setExamConfig,
    setExamResults,
    startPractice,
    exitPractice,
    startMockExam,
    submitExam,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/**
 * useApp Hook - 访问全局应用状态
 */
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

/**
 * 计算属性 Hooks
 */
export function useHasResourceUpdates() {
  const { resources } = useApp();
  return resources.some(r => r.hasUpdate);
}