import { ArrowLeft } from 'lucide-react';
import MockExamReportContent from '../components/MockExamReportContent';

interface Props { score: number; totalQuestions: number; timeSpent: number; targetScore?: number; onReviewTopic: (topicId: string) => void; onReturnToDashboard: () => void; onRetakeExam?: () => void; }

export default function PostExamReportScreen({ score, totalQuestions, timeSpent, onReturnToDashboard, onRetakeExam }: Props) {
  const partialCorrect = Math.min(2, Math.max(0, totalQuestions - score));
  const wrong = Math.max(0, totalQuestions - score - partialCorrect);
  return <div className="h-full min-h-0 flex flex-col bg-[#F6F6F6] text-[#333]">
    <header className="shrink-0 border-b border-[#EBEBEB] bg-white px-8 py-4"><div className="mx-auto flex max-w-[900px] items-center gap-3"><button onClick={onReturnToDashboard} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[#F3F4F6]"><ArrowLeft className="h-5 w-5" /></button><div><h1 className="text-[18px] font-bold">模考报告</h1><p className="text-[11px] text-[#999]">刑法 · 标准模考 · 本次生成</p></div></div></header>
    <main className="min-h-0 flex-1 overflow-y-auto"><div className="mx-auto max-w-[900px] px-8 py-6"><MockExamReportContent snapshot={{ accuracy: Math.round(score / totalQuestions * 100), fullCorrect: score, partialCorrect, wrong, unanswered: 0, totalQuestions, durationMinutes: Math.round(timeSpent / 60), estimatedMinutes: 25, coverageCount: 12, scopeLabel: '全部学习计划', scaleLabel: '标准模考' }} onViewQuestions={() => document.querySelector('main')?.scrollTo({ top: 9999, behavior: 'smooth' })} /><div className="mt-5 flex gap-3">{onRetakeExam && <button onClick={onRetakeExam} className="flex-1 rounded-lg border border-[#DDD] bg-white py-3 text-[13px] font-semibold">重新设置模考</button>}<button onClick={onReturnToDashboard} className="flex-1 rounded-lg border border-[#DDD] bg-white py-3 text-[13px] font-semibold">返回总览</button></div></div></main>
  </div>;
}
