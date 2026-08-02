import React from 'react';
import { AppProvider, useApp, useHasResourceUpdates } from './contexts/AppContext';

/**
 * 让固定尺寸的设备框自适应视口：横竖屏共用同一缩放基准（按设备长边 1024 对窗口宽/高取最紧的一边），
 * 这样短边 640 在两个朝向渲染出的物理尺寸完全相等，切换朝向即「同一台设备旋转 90°」，不会一大一小。
 * 同时保证竖屏 1024 高、横屏 1024 宽都能完整显示（含底部悬浮 Tab）。
 */
function useViewportScale(frameW: number, frameH: number) {
  const [scale, setScale] = React.useState(1);
  const longEdge = Math.max(frameW, frameH); // 恒为 1024，横竖屏一致
  React.useEffect(() => {
    const compute = () => {
      const margin = 24; // 四周留白
      const s = Math.min(1, (window.innerWidth - margin) / longEdge, (window.innerHeight - margin) / longEdge);
      setScale(s);
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, [longEdge]);
  return scale;
}


import TopTabBar from './components/TopTabBar';
import ReviewModeBottomTabBar from './components/ReviewModeBottomTabBar';
import AppSidebar from './components/AppSidebar';
import AllNotesView from './components/AllNotesView';
import PivotPopup from './components/PivotPopup';
import MasteryCompletionPopup from './components/MasteryCompletionPopup';
import MicroTriageModal from './components/MicroTriageModal';
import MockExamSetupPopup from './components/MockExamSetupPopup';

import FavoritesScreen from './screens/FavoritesScreen';
import SpaceSelectorView from './screens/SpaceSelectorView';
import TodayScreen from './screens/TodayScreen';
import OverviewScreen from './screens/OverviewScreen';
import KnowledgeMapScreen from './screens/KnowledgeMapScreen';
import PracticeScreen from './screens/PracticeScreen';
import CourseProgressScreen from './screens/CourseProgressScreen';
import MockExamScreen from './screens/MockExamScreen';
import MockTestSetupScreen from './screens/MockTestSetupScreen';
import PostExamReportScreen from './screens/PostExamReportScreen';
import ResourcesScreen from './screens/ResourcesScreen';
import ResourceCollectionScreen from './screens/ResourceCollectionScreen';
import SetupScreen from './screens/SetupScreen';
import PriorityTriageScreen from './screens/PriorityTriageScreen';
import PlanGenerationLoadingScreen from './screens/PlanGenerationLoadingScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import PlanFrameworkScreen from './screens/PlanFrameworkScreen';

/**
 * 定义哪些屏幕需要隐藏顶部Tab和侧边栏（全屏模式）
 */
const FULLSCREEN_SCREENS = ['practice', 'mock-exam', 'setup', 'resource-collection', 'priority-triage', 'plan-loading', 'plan-framework', 'course-progress', 'knowledge-map', 'favorites'];

/**
 * 定义哪些屏幕需要隐藏侧边栏
 */
const HIDE_SIDEBAR_SCREENS = [...FULLSCREEN_SCREENS, 'exam-report'];

/**
 * 主应用内容组件
 */
function AppContent() {
  const {
    // 状态
    currentScreen,
    topTab,
    reviewModeTab,
    isSidebarCollapsed,
    orientation,
    todayDemoScenario,
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
    toggleSidebar,
    toggleOrientation,
    setTodayDemoScenario,
    setSelectedSpaceId,
    setPracticeStartingPoint,
    setShowPivotPopup,
    setShowMasteryCompletion,
    setShowMicroTriage,
    setShowExamSetup,
    updateResource,
    removeResource,
    acknowledgeResourceUpdate,
    setNewResourcesForTriage,
    setExamConfig,
    startPractice,
    exitPractice,
    submitExam,
  } = useApp();

  const hasResourceUpdates = useHasResourceUpdates();

  // 计划概览页的进入语境：'created' = 创建完成后首次落地（语境A，显示"开始练习/回到首页"）；
  // 'view' = 日后从 Hero 再进入查看计划（语境B）
  const [courseProgressContext, setCourseProgressContext] = React.useState<'created' | 'view'>('view');
  const [showGeneratedPlanReady, setShowGeneratedPlanReady] = React.useState(false);
  const [openOnboardingAtPlan, setOpenOnboardingAtPlan] = React.useState(false);
  const generationTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    if (currentScreen === 'onboarding') setTopTab('review-mode');
  }, [currentScreen, setTopTab]);

  React.useEffect(() => () => {
    if (generationTimerRef.current) clearTimeout(generationTimerRef.current);
  }, []);

  // 判断是否显示顶部Tab和侧边栏
  const isFullscreen = FULLSCREEN_SCREENS.includes(currentScreen);
  const showSidebar = !HIDE_SIDEBAR_SCREENS.includes(currentScreen) && !isSidebarCollapsed;
  const showTopTab = !isFullscreen;
  const showReviewModeBottomTab = topTab === 'review-mode' && !isFullscreen && currentScreen !== 'space-selector' && currentScreen !== 'onboarding';

  // 全局横竖屏：练习页强制横屏（左题右助教依赖横向宽度），其余页面跟随全局朝向
  const forceLandscape = currentScreen === 'practice';
  const effectiveOrientation = forceLandscape ? 'landscape' : orientation;
  const isPortrait = effectiveOrientation === 'portrait';
  const frameW = isPortrait ? 640 : 1024;
  const frameH = isPortrait ? 1024 : 640;
  // 竖屏空间窄：侧栏单列回落（隐藏），内容占满整幅宽度
  const showSidebarEffective = showSidebar && !isPortrait;

  // 设备框自适应视口缩放：竖屏 1024 高会超出视口，缩放后底部悬浮 Tab 才可见
  const viewportScale = useViewportScale(frameW, frameH);

  // 处理顶部Tab切换
  const handleTopTabChange = (tab: typeof topTab) => {
    setTopTab(tab);
    if (tab === 'all-notes') {
      navigateTo('all-notes');
    } else if (tab === 'review-mode') {
      if (reviewModeTab === 'dashboard') {
        navigateTo('dashboard');
      } else if (reviewModeTab === 'overview') {
        navigateTo('overview' as any);
      } else if (reviewModeTab === 'mock-exam') {
        navigateTo('mock-exam-setup');
      }
    } else if (tab === 'resource-center') {
      navigateTo('resources');
    }
  };

  // 处理Review Mode底部Tab切换
  const handleReviewModeTabChange = (tab: typeof reviewModeTab) => {
    setReviewModeTab(tab);
    if (tab === 'dashboard') {
      navigateTo('dashboard');
    } else if (tab === 'overview') {
      navigateTo('overview' as any);
    } else if (tab === 'mock-exam') {
      navigateTo('mock-exam-setup');
    }
  };

  const handleReviewTopic = (topicId: string) => {
    startPractice(topicId);
  };

  const renderScreen = () => {
    const commonProps = {
      hasResourceUpdates,
      onStartPractice: () => startPractice(),
      onViewResources: () => {
        navigateTo('resources');
      },
      onStartMockExam: () => {
        setTopTab('review-mode');
        setReviewModeTab('mock-exam');
        navigateTo('mock-exam-setup');
      },
      onNavigateToDashboard: () => navigateTo('dashboard'),
      onNavigateToAllNotes: () => {
        setTopTab('all-notes');
        navigateTo('all-notes');
      },
    };

    switch (currentScreen) {
      case 'space-selector':
        return (
          <SpaceSelectorView
            onSelectSpace={(spaceId) => {
              setSelectedSpaceId(spaceId);
              navigateTo('dashboard');
            }}
            onCreateNew={() => navigateTo('onboarding' as any)}
          />
        );

      case 'setup':
        return (
          <SetupScreen
              onNext={() => navigateTo('resource-collection')}
              onBack={() => navigateTo('space-selector')}
              onNavigateHome={() => navigateTo('dashboard')}
            />
        );

      case 'resource-collection':
        return (
          <ResourceCollectionScreen
              onNext={() => navigateTo('priority-triage')}
              onBack={() => navigateTo('setup')}
              onNavigateHome={() => navigateTo('dashboard')}
            />
        );

      case 'priority-triage':
        return (
          <PriorityTriageScreen
              onNext={() => navigateTo('plan-loading')}
              onBack={() => navigateTo('resource-collection')}
              onNavigateHome={() => navigateTo('dashboard')}
            />
        );

      case 'dashboard':
        return (
          <TodayScreen
            onStartPractice={() => startPractice()}
            onViewResources={commonProps.onViewResources}
            onStartMockExam={commonProps.onStartMockExam}
            onViewKnowledgeMap={() => navigateTo('knowledge-map' as any)}
            onViewPlan={() => { setCourseProgressContext('view'); navigateTo('course-progress'); }}
            onViewAllSpaces={() => navigateTo('space-selector')}
          />
        );

      case 'overview' as any:
        return (
          <OverviewScreen
            onViewResources={commonProps.onViewResources}
            onStartMockExam={commonProps.onStartMockExam}
            onStartPractice={() => startPractice()}
            onViewKnowledgeMap={() => navigateTo('knowledge-map' as any)}
            onNavigateToFavorites={() => navigateTo('favorites')}
          />
        );

      case 'favorites':
        return (
          <FavoritesScreen
            onBack={() => navigateTo('overview' as any)}
            onStartPractice={() => startPractice()}
          />
        );

      case 'knowledge-map' as any:
        return (
          <KnowledgeMapScreen
            onBack={() => navigateTo('overview' as any)}
          />
        );

      case 'practice':
        return (
          <PracticeScreen
              onBack={exitPractice}
              startingPointId={practiceStartingPoint}
              dailyHours={dailyStudyHours}
              masteryPercentage={overallMastery}
            />
        );

      case 'resources':
        return (
          <ResourcesScreen
              onBack={() => navigateTo('dashboard')}
              onNavigateToCollection={() => navigateTo('resource-collection')}
              onNavigateToDashboard={commonProps.onNavigateToDashboard}
              onStartMockExam={commonProps.onStartMockExam}
              resources={resources}
              onAcknowledgeUpdate={acknowledgeResourceUpdate}
              onUpdatePriority={(id, priority) => updateResource(id, { priority })}
              onRemoveResource={removeResource}
              hasResourceUpdates={hasResourceUpdates}
            />
        );

      case 'mock-exam':
        return (
          <MockExamScreen
              onSubmit={submitExam}
              onExit={() => {
                setTopTab('review-mode');
                setReviewModeTab('dashboard');
                navigateTo('dashboard');
              }}
              config={examConfig || undefined}
            />
        );

      case 'exam-report':
        return (
          <PostExamReportScreen
              score={examResults?.answers ? Array.from(examResults.answers.values()).filter((a: any) => a !== null).length : 14}
              totalQuestions={20}
              timeSpent={examResults?.timeSpent || 3600}
              targetScore={90}
              onReviewTopic={handleReviewTopic}
              onReturnToDashboard={() => {
                setTopTab('review-mode');
                setReviewModeTab('dashboard');
                navigateTo('dashboard');
              }}
              onRetakeExam={() => {
                setTopTab('review-mode');
                setReviewModeTab('mock-exam');
                navigateTo('mock-exam-setup');
              }}
            />
        );

      case 'course-progress':
        return (
          <CourseProgressScreen
            onBack={() => navigateTo('dashboard')}
            onStartPractice={() => startPractice()}
            context={courseProgressContext}
          />
        );

      case 'mock-exam-setup':
        return (
          <MockTestSetupScreen
              onStartTest={(config) => {
                setExamConfig(config);
                navigateTo('mock-exam');
              }}
              onCancel={() => {
                setTopTab('review-mode');
                setReviewModeTab('dashboard');
                navigateTo('dashboard');
              }}
            />
        );

      case 'all-notes':
        return (
          <AllNotesView />
        );

      case 'plan-loading':
        return (
          <PlanGenerationLoadingScreen onComplete={() => navigateTo('plan-framework')} />
        );

      case 'plan-framework':
        return (
          <PlanFrameworkScreen
            onConfirm={() => { setCourseProgressContext('created'); navigateTo('course-progress'); }}
            onSkip={() => startPractice()}
          />
        );

      case 'onboarding' as any:
        return (
          <OnboardingScreen
            initialStep={openOnboardingAtPlan ? 'A6' : undefined}
            onComplete={() => { setOpenOnboardingAtPlan(false); navigateTo('dashboard'); }}
            onSkip={() => navigateTo('space-selector')}
            onEnterSample={() => {
              setTopTab('review-mode');
              setReviewModeTab('dashboard');
              navigateTo('dashboard');
              if (generationTimerRef.current) clearTimeout(generationTimerRef.current);
              generationTimerRef.current = setTimeout(() => setShowGeneratedPlanReady(true), 3500);
            }}
          />
        );

      default:
        return (
          <TodayScreen
            onStartPractice={() => startPractice()}
            onViewResources={commonProps.onViewResources}
            onStartMockExam={commonProps.onStartMockExam}
            onViewKnowledgeMap={() => navigateTo('knowledge-map' as any)}
            onViewPlan={() => { setCourseProgressContext('view'); navigateTo('course-progress'); }}
          />
        );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {/* 外层：占据「缩放后」的真实尺寸，保证居中不溢出、不被裁 */}
      <div style={{ width: frameW * viewportScale, height: frameH * viewportScale }}>
        <div
          className="overflow-hidden bg-white relative flex"
          style={{ width: frameW, height: frameH, transform: `scale(${viewportScale})`, transformOrigin: 'top left', transition: 'width .3s ease, height .3s ease' }}
        >
        {/* 全局横竖屏切换按钮（练习页强制横屏时隐藏） */}
        {!forceLandscape && (
          <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 300, display: 'flex', gap: 4 }}>
            {currentScreen === 'dashboard' && (
              <select
                value={todayDemoScenario}
                onChange={e => setTodayDemoScenario(e.target.value as any)}
                style={{
                  padding: '5px 6px', borderRadius: 8, cursor: 'pointer',
                  border: '1px solid rgba(0,0,0,0.12)', background: 'rgba(255,255,255,0.92)',
                  fontSize: 11, fontWeight: 600, color: '#555',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
                }}
              >
                <option value="normal">常规</option>
                <option value="exam-soon">距考≤7天</option>
                <option value="no-record">冷启动</option>
              </select>
            )}
            <button
              onClick={toggleOrientation}
              title={isPortrait ? '切换到横屏' : '切换到竖屏'}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '5px 9px', borderRadius: 8, cursor: 'pointer',
                border: '1px solid rgba(0,0,0,0.12)', background: 'rgba(255,255,255,0.92)',
                fontSize: 11, fontWeight: 600, color: '#555',
                boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
              }}
            >
              {isPortrait ? '🖥 横屏' : '📱 竖屏'}
            </button>
          </div>
        )}

        {/* 左侧边栏 */}
        {showSidebarEffective && (
          <AppSidebar
              isCollapsed={isSidebarCollapsed}
              onNavClick={(navId) => console.log('Nav clicked:', navId)}
              onFolderClick={(folderId) => console.log('Folder clicked:', folderId)}
            />
        )}

        {/* 主内容区 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 顶部Tab栏 */}
          {showTopTab && (
            <TopTabBar
                activeTab={topTab}
                onTabChange={handleTopTabChange}
                onToggleSidebar={toggleSidebar}
                showSidebarToggle={!HIDE_SIDEBAR_SCREENS.includes(currentScreen)}
              />
          )}

          {/* 屏幕内容 */}
          <div className="flex-1 overflow-hidden relative">
            {renderScreen()}
          </div>

          {/* Review Mode 底部Tab栏 */}
          {showReviewModeBottomTab && (
            <ReviewModeBottomTabBar
                activeTab={reviewModeTab}
                onTabChange={handleReviewModeTabChange}
              />
          )}
        </div>

        {/* Modals and Popups */}
        {showMicroTriage && (
          <MicroTriageModal
              resources={newResourcesForTriage}
              onComplete={(resourcesWithPriority) => {
                console.log('Resources with priorities:', resourcesWithPriority);
                setShowMicroTriage(false);
                setNewResourcesForTriage([]);
              }}
              onCancel={() => {
                setShowMicroTriage(false);
                setNewResourcesForTriage([]);
              }}
            />
        )}

        {showPivotPopup && (
          <PivotPopup
              masteryPercentage={overallMastery}
              onEnterMockExam={() => {
                setShowPivotPopup(false);
                setTopTab('review-mode');
                setReviewModeTab('mock-exam');
                navigateTo('mock-exam');
              }}
              onKeepPracticing={() => {
                setShowPivotPopup(false);
                setTopTab('review-mode');
                setReviewModeTab('dashboard');
                navigateTo('dashboard');
              }}
              onClose={() => setShowPivotPopup(false)}
            />
        )}

        {showMasteryCompletion && (
          <MasteryCompletionPopup
              onMoveToNextSegment={() => {
                setShowMasteryCompletion(false);
                const nextTopicId = (practiceStartingPoint || '0') + 1;
                setPracticeStartingPoint(nextTopicId);
                navigateTo('practice');
              }}
              onReturnToHub={() => {
                setShowMasteryCompletion(false);
                setTopTab('review-mode');
                setReviewModeTab('dashboard');
                navigateTo('dashboard');
              }}
            />
        )}

        {showExamSetup && (
          <MockExamSetupPopup
              onStart={(config) => {
                setExamConfig(config);
                setShowExamSetup(false);
                navigateTo('mock-exam');
              }}
              onCancel={() => {
                setShowExamSetup(false);
              }}
            />
        )}

        {showGeneratedPlanReady && (
          <div className="absolute inset-0 z-[500] flex items-center justify-center p-6" style={{ background:'rgba(20,24,32,.42)' }}>
            <div className="w-full max-w-[430px] rounded-3xl p-6 bg-white" style={{ boxShadow:'0 22px 70px rgba(0,0,0,.24)' }}>
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-[22px] mb-3" style={{ background:'#EAF9EF' }}>✓</div>
              <h2 className="text-[19px] font-bold text-gray-900">你的学习计划已生成</h2>
              <p className="text-[13px] leading-relaxed text-gray-500 mt-2">新学习空间已经准备好。你可以立即确认计划并开始学习，也可以继续留在 sample 空间体验。</p>
              <button
                onClick={() => {
                  setShowGeneratedPlanReady(false);
                  setOpenOnboardingAtPlan(true);
                  setTopTab('review-mode');
                  navigateTo('onboarding' as any);
                }}
                className="w-full py-3.5 rounded-full text-[14px] font-bold mt-5"
                style={{ background:'#FFE562', color:'#7A6400' }}
              >
                立即确认学习计划
              </button>
              <button onClick={() => setShowGeneratedPlanReady(false)} className="w-full py-3 text-[13px] text-gray-500">
                继续体验 sample 空间
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

/**
 * App根组件
 */
export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
