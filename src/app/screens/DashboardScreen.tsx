import React, { useState } from 'react';
import { 
  Menu, Crown, ArrowRight, ChevronDown, 
  CheckCircle2, RefreshCw, Hourglass, LayoutDashboard, FileText, GraduationCap,
  Play, Star, TrendingUp, Clock, Zap, Trophy, Flame, Share2, Check, RotateCcw, ChevronLeft
} from 'lucide-react';

interface DashboardScreenProps {
  onStartPractice?: () => void;
  onViewAllKnowledgePoints?: () => void;
  onViewResources?: () => void;
  onStartMockExam?: () => void;
  onBackToSpaceSelector?: () => void;
  onViewCourseProgress?: () => void;
  onNavigateToAllNotes?: () => void;
  hasResourceUpdates?: boolean;
}

export function DashboardScreen({ 
  onStartPractice,
  onViewAllKnowledgePoints,
  onViewResources,
  onStartMockExam,
  onBackToSpaceSelector,
  onViewCourseProgress,
  onNavigateToAllNotes,
  hasResourceUpdates
}: DashboardScreenProps) {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'points-list'>('dashboard');
  const [progress, setProgress] = useState(60); // 0 to 100
  const [demoStatus, setDemoStatus] = useState<'in-progress' | 'just-started' | 'day-completed' | 'course-completed'>('in-progress');

  const cycleProgress = () => {
    setProgress(p => {
      if (p === 0) return 60;
      if (p === 60) return 90;
      if (p === 90) return 100;
      return 0;
    });
  };

  const handleDemoChange = (status: 'in-progress' | 'just-started' | 'day-completed' | 'course-completed') => {
    setDemoStatus(status);
    if (status === 'just-started') {
      setProgress(0);
    } else if (status === 'day-completed' || status === 'course-completed') {
      setProgress(100);
    } else {
      setProgress(60);
    }
  };

  const getDashboardContent = () => {
    if (progress <= 20) {
      return {
        state: 'start',
        dayText: 'Day 1 of 10',
        subtitle: 'Let’s get started',
        details: '10 points to go',
        streak: 'Start your streak',
        mastery: '0%',
        ctaText: 'Start Learning',
        ctaTime: '',
        encouragement: '',
        badge: ''
      };
    } else if (progress < 80) {
      return {
        state: 'progress',
        dayText: 'Day 3 of 10',
        subtitle: '6 of 10 points completed',
        details: 'Only 4 left',
        streak: '3-day streak',
        mastery: '45%',
        ctaText: 'Continue Practice',
        ctaTime: '(11 min)',
        encouragement: '',
        badge: ''
      };
    } else if (progress < 100) {
      return {
        state: 'almost',
        dayText: 'Day 3 of 10',
        subtitle: '9 of 10 points completed',
        details: 'Only 1 left',
        streak: '3-day streak',
        mastery: '85%',
        ctaText: 'Finish Today',
        ctaTime: '',
        encouragement: '',
        badge: ''
      };
    } else {
      return {
        state: 'done',
        dayText: demoStatus === 'course-completed' ? 'Course Completed' : 'Day 3 of 10',
        subtitle: demoStatus === 'course-completed' ? 'All 10 days completed' : 'Day 3 Mastered!',
        details: '',
        streak: demoStatus === 'course-completed' ? '10-day streak' : '3-day streak',
        mastery: '100%',
        ctaText: demoStatus === 'course-completed' ? 'Review All Materials' : 'Preview Day 4',
        ctaTime: '',
        encouragement: '',
        badge: demoStatus === 'course-completed' ? 'Course Complete! 🎉' : ''
      };
    }
  };

  const content = getDashboardContent();

  const pointsData = {
    mastered: progress === 0 ? 0 : progress === 100 ? 10 : 2,
    practicing: progress === 0 ? 0 : progress === 100 ? 0 : 4,
    left: progress === 0 ? 10 : progress === 100 ? 0 : 4
  };
  const totalPoints = pointsData.mastered + pointsData.practicing + pointsData.left;

  if (currentPage === 'points-list') {
    return <PointsList onBack={() => setCurrentPage('dashboard')} onBackToSpaceSelector={onBackToSpaceSelector} totalPoints={totalPoints} onStartPractice={onStartPractice} />;
  }

  return (
    <div className="h-full bg-slate-50/50 pb-24 font-sans text-slate-900 overflow-y-auto">
      {/* Back to All Study Spaces - 如果需要的话 */}
      {onBackToSpaceSelector && (
        <div className="bg-slate-50/50 px-4 md:px-8 py-4 border-b border-slate-100">
          <button 
            onClick={onBackToSpaceSelector}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-sm font-medium">Back to All Study Spaces</span>
          </button>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">
        {/* Unified Dashboard Card or Course Completed Card */}
        {demoStatus === 'course-completed' ? (
          <div className="bg-[#1a2838] rounded-3xl shadow-lg border border-slate-700 p-10 relative overflow-hidden flex flex-row gap-8 items-center">
            {/* Background decorations */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-yellow-400/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>

            {/* Left: Trophy Icon */}
            <div className="relative z-10 flex-shrink-0">
              <div className="w-32 h-32 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full flex items-center justify-center shadow-xl">
                <Trophy className="w-16 h-16 text-white" />
              </div>
            </div>
            
            {/* Center Content */}
            <div className="flex flex-col flex-1 relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-black text-white">Course Mastered!</h2>
                <span className="bg-yellow-500/20 text-yellow-400 text-xs font-bold px-3 py-1 rounded-md border border-yellow-500/30">
                  100% Complete
                </span>
              </div>
              <p className="text-slate-300 text-sm font-medium mb-4">
                You've successfully completed all 10 days. Incredible dedication!
              </p>

              {/* Inline Status Row */}
              <div className="flex items-center gap-5 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="font-semibold">10-day streak</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="font-semibold">24h 15m studied</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold">142 points</span>
                </div>
              </div>
            </div>

            {/* Right: Primary Action */}
            <div className="relative z-10 flex-shrink-0">
              <button 
                onClick={onStartMockExam}
                className="px-8 py-4 bg-[#2D8CFF] hover:bg-[#1e7ae8] text-white rounded-2xl font-bold text-lg shadow-lg transition-all"
              >
                Enter Mock Exam
              </button>
            </div>
          </div>
        ) : progress === 100 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-10 relative overflow-hidden flex flex-row gap-8 items-center">
            {/* Left: Progress Circle */}
            <div className="relative w-32 h-32 flex-shrink-0">
              <svg className="w-32 h-32 -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#2D8CFF"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset="0"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-black text-slate-900">100%</span>
              </div>
            </div>
            
            {/* Center Content */}
            <div className="flex flex-col flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-3xl">🏆</div>
                <h2 className="text-3xl font-black text-slate-900">Day 3 Mastered!</h2>
              </div>
              <p className="text-slate-600 text-sm font-medium mb-4">
                Congratulations, you made it!
              </p>

              {/* Inline Status Row */}
              <div className="flex items-center gap-5 text-sm text-slate-700">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="font-semibold">3-day streak</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold">100% mastery</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="font-medium text-slate-500">2h 15m studied</span>
                </div>
              </div>
            </div>

            {/* Right: Primary Action */}
            <div className="flex-shrink-0">
              <button 
                onClick={onStartPractice}
                className="px-8 py-4 bg-[#2c3e50] hover:bg-[#34495e] text-white rounded-2xl font-bold text-lg shadow-md transition-all flex items-center gap-2"
              >
                Preview Day 4
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-10 relative overflow-hidden flex flex-row gap-8 items-center">
            {/* Left: Progress Circle */}
            <div 
              className="relative w-32 h-32 flex-shrink-0 cursor-pointer transition-transform hover:scale-105"
              onClick={cycleProgress}
              title="Click to cycle states"
            >
              <svg className="w-32 h-32 -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#2D8CFF"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-black text-slate-900">{progress}%</span>
              </div>
            </div>
            
            {/* Center Content */}
            <div className="flex flex-col flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 
                  onClick={onViewCourseProgress}
                  className="text-3xl font-black text-slate-900 cursor-pointer hover:text-blue-600 transition-colors"
                >
                  Keep Going!
                </h2>
                <span className="bg-[#FDEA3B] text-slate-900 text-xs font-bold px-3 py-1 rounded-md">
                  Almost there!
                </span>
              </div>
              <p className="text-slate-500 text-sm font-medium mb-4">
                Day 3 of 10 · 6 of 7 points completed
              </p>

              {/* Inline Status Row */}
              <div className="flex items-center gap-5 text-sm text-slate-700">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="font-semibold">3-day streak</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold">2 mastery</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="font-medium text-slate-500">2h 15m studied</span>
                </div>
              </div>
            </div>

            {/* Right: CTA Section */}
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <button 
                onClick={onStartPractice}
                className="px-8 py-4 bg-[#2D8CFF] hover:bg-[#1e7ae8] text-white rounded-2xl font-bold text-lg shadow-lg transition-all flex items-center gap-2"
              >
                <Play className="w-5 h-5 fill-white" />
                Continue Day - 45m
              </button>
              <button className="text-xs text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1 mt-1">
                Practice mode: Multiple Choice
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Today's Points Section */}
        <div className="mt-10 md:mt-12">
          <div className="flex flex-row items-end justify-between mb-6 gap-4">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-slate-900">Today's Points</h3>
              <p className="text-slate-500 mt-1.5 text-sm font-medium flex items-center gap-1.5 flex-wrap">
                <span className="text-emerald-600">{pointsData.mastered} mastered</span>
                <span>&middot;</span>
                <span className="text-amber-600">{pointsData.practicing} practicing</span>
                <span>&middot;</span>
                <span>{pointsData.left} left</span>
              </p>
              <p className="text-slate-400 text-xs mt-1 italic">tap any card to flip and start practice</p>
            </div>
            <button 
              onClick={onViewAllKnowledgePoints}
              className="text-blue-600 font-semibold hover:text-blue-700 text-sm flex items-center gap-1 transition-colors shrink-0 pb-1"
            >
              View all {totalPoints} points <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            <PointCard
              title="Photosynthesis Process"
              status="Mastered"
              hint="What are the main inputs and outputs?"
              explanation="Plants convert light energy into chemical energy, using CO2 and water to produce glucose and oxygen."
              importance={3}
              onStartPractice={onStartPractice}
            />
            <PointCard
              title="Cellular Respiration"
              status="Practicing"
              hint="Where does it occur in the cell?"
              explanation="Occurs in the mitochondria, breaking down glucose to produce ATP energy for the cell."
              importance={3}
              onStartPractice={onStartPractice}
            />
            <PointCard
              title="Mitosis vs Meiosis"
              status="Not started"
              hint="Which one produces gametes?"
              explanation="Mitosis produces two identical somatic cells, while meiosis produces four genetically distinct gametes."
              importance={2}
              onStartPractice={onStartPractice}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardScreen;

function PointCard({ 
  title, 
  status,
  hint,
  explanation,
  importance,
  onStartPractice
}: { 
  title: string, 
  status: 'Mastered' | 'Practicing' | 'Not started',
  hint?: string,
  explanation?: string,
  importance?: number,
  onStartPractice?: () => void
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const isMastered = status === 'Mastered';
  const isPracticing = status === 'Practicing';
  
  return (
    <div 
      onClick={() => setIsFlipped(!isFlipped)}
      className="relative w-full h-48 cursor-pointer"
      style={{ perspective: '1000px' }}
    >
      <div 
        className={`relative w-full h-full transition-transform duration-500 ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front of Card */}
        <div 
          className="absolute inset-0 bg-white rounded-2xl border-2 border-slate-200 shadow-sm p-6 flex flex-col justify-between"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
                isMastered ? 'bg-emerald-100 text-emerald-700' : 
                isPracticing ? 'bg-amber-100 text-amber-700' : 
                'bg-slate-100 text-slate-600'
              }`}>
                {status}
              </div>
            </div>
            <h4 className="text-lg font-bold text-slate-800 leading-snug">{title}</h4>
          </div>
          <p className="text-sm text-slate-500 italic">Tap to view hint</p>
        </div>

        {/* Back of Card */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-200 shadow-sm p-6 flex flex-col justify-between"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div>
            <p className="text-sm text-slate-600 mb-4 italic">{hint || 'No hint available'}</p>
            <p className="text-sm text-slate-500 italic">{explanation || 'No explanation available'}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStartPractice?.();
            }}
            className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors"
          >
            Start Practice
          </button>
        </div>
      </div>
    </div>
  );
}

function PointsList({ onBack, onBackToSpaceSelector, totalPoints, onStartPractice }: { onBack: () => void, onBackToSpaceSelector?: () => void, totalPoints: number, onStartPractice?: () => void }) {
  return (
    <div className="min-h-screen bg-slate-50/50 pb-24 font-sans text-slate-900">
      {/* Top Navigation */}
      <header className="flex items-center justify-between px-4 md:px-8 py-4 bg-white border-b border-slate-100 sticky top-0 z-20">
        <button onClick={onBack} className="p-2 mr-4 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors">
          <ArrowRight className="w-5 h-5 rotate-180" />
        </button>
        <h1 className="text-xl font-bold">All {totalPoints} Points</h1>
      </header>
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          <PointCard
            title="Photosynthesis Process"
            status="Mastered"
            hint="What are the main inputs and outputs?"
            explanation="Plants convert light energy into chemical energy, using CO2 and water to produce glucose and oxygen."
            importance={3}
            onStartPractice={onStartPractice}
          />
          <PointCard
            title="Cellular Respiration"
            status="Practicing"
            hint="Where does it occur in the cell?"
            explanation="Occurs in the mitochondria, breaking down glucose to produce ATP energy for the cell."
            importance={3}
            onStartPractice={onStartPractice}
          />
          <PointCard
            title="Mitosis vs Meiosis"
            status="Not started"
            hint="Which one produces gametes?"
            explanation="Mitosis produces two identical somatic cells, while meiosis produces four genetically distinct gametes."
            importance={2}
            onStartPractice={onStartPractice}
          />
          <PointCard
            title="DNA Replication"
            status="Mastered"
            hint="What enzyme unzips the DNA?"
            explanation="Helicase unzips the double helix, and DNA polymerase builds the new complementary strands."
            importance={3}
            onStartPractice={onStartPractice}
          />
          <PointCard
            title="Protein Synthesis"
            status="Practicing"
            hint="Transcription vs Translation?"
            explanation="Transcription copies DNA to mRNA in the nucleus. Translation reads mRNA to build proteins at the ribosome."
            importance={3}
            onStartPractice={onStartPractice}
          />
          <PointCard
            title="Mendelian Genetics"
            status="Practicing"
            hint="What is a Punnett square used for?"
            explanation="Used to predict the probability of offspring inheriting particular genotypes and phenotypes."
            importance={2}
            onStartPractice={onStartPractice}
          />
          <PointCard
            title="Evolution by Natural Selection"
            status="Not started"
            hint="What drives survival of the fittest?"
            explanation="Organisms with traits better suited to their environment are more likely to survive and reproduce."
            importance={2}
            onStartPractice={onStartPractice}
          />
          <PointCard
            title="Ecosystem Energy Flow"
            status="Not started"
            hint="How much energy transfers between trophic levels?"
            explanation="Only about 10% of energy is transferred to the next level; the rest is lost as heat."
            importance={1}
            onStartPractice={onStartPractice}
          />
          <PointCard
            title="Human Immune System"
            status="Practicing"
            hint="Innate vs Adaptive immunity?"
            explanation="Innate is the first line of general defense. Adaptive is specific and creates memory cells (B and T cells)."
            importance={2}
            onStartPractice={onStartPractice}
          />
          <PointCard
            title="Plant Anatomy"
            status="Not started"
            hint="Xylem vs Phloem function?"
            explanation="Xylem transports water and minerals up from roots. Phloem transports sugars down from leaves."
            importance={1}
            onStartPractice={onStartPractice}
          />
        </div>
      </main>
    </div>
  );
}