import React from 'react';
import { AppProvider, useApp, useHasResourceUpdates } from './contexts/AppContext';


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
const FULLSCREEN_SCREENS = ['practice', 'mock-exam', 'setup', 'resource-collection', 'priority-triage', 'plan-loading', 'plan-framework', 'course-progress', 'knowledge-map', 'favorites', 'onboarding'];

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

  // 判断是否显示顶部Tab和侧边栏
  const isFullscreen = FULLSCREEN_SCREENS.includes(currentScreen);
  const showSidebar = !HIDE_SIDEBAR_SCREENS.includes(currentScreen) && !isSidebarCollapsed;
  const showTopTab = !isFullscreen;
  const showReviewModeBottomTab = topTab === 'review-mode' && !isFullscreen && currentScreen !== 'space-selector';

  // 全局横竖屏：练习页强制横屏（左题右助教依赖横向宽度），其余页面跟随全局朝向
  const forceLandscape = currentScreen === 'practice';
  const effectiveOrientation = forceLandscape ? 'landscape' : orientation;
  const isPortrait = effectiveOrientation === 'portrait';
  const frameW = isPortrait ? 640 : 1024;
  const frameH = isPortrait ? 1024 : 640;
  // 竖屏空间窄：侧栏单列回落（隐藏），内容占满整幅宽度
  const showSidebarEffective = showSidebar && !isPortrait;

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
            onComplete={() => navigateTo('dashboard')}
            onSkip={() => navigateTo('space-selector')}
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
      <div
        className="overflow-hidden bg-white relative flex"
        style={{ width: frameW, height: frameH, transition: 'width .3s ease, height .3s ease' }}
      >
        {/* 全局横竖屏切换按钮（练习页强制横屏时隐藏） */}
        {!forceLandscape && (
          <button
            onClick={toggleOrientation}
            title={isPortrait ? '切换到横屏' : '切换到竖屏'}
            style={{
              position: 'absolute', top: 8, right: 8, zIndex: 300,
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '5px 9px', borderRadius: 8, cursor: 'pointer',
              border: '1px solid rgba(0,0,0,0.12)', background: 'rgba(255,255,255,0.92)',
              fontSize: 11, fontWeight: 600, color: '#555',
              boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
            }}
          >
            {isPortrait ? '🖥 横屏' : '📱 竖屏'}
          </button>
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
