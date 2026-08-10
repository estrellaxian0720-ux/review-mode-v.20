import { useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronRight, RotateCcw, X } from 'lucide-react';
import type { MockHistoryRecord } from './MockExamHistoryScreen';
import MockExamReportContent from '../components/MockExamReportContent';

type Result = 'correct' | 'partial' | 'wrong' | 'unanswered';
type Filter = 'all' | Result | 'flagged';

const QUESTIONS: Array<{ id: number; type: string; kp: string; stem: string; result: Result; flagged?: boolean; yours: string; answer: string; explanation: string }> = [
  { id: 1, type: '单选题', kp: '受贿罪构成', stem: '关于受贿罪既遂标准，下列说法正确的是？', result: 'correct', yours: 'B. 实际取得财物时既遂', answer: 'B. 实际取得财物时既遂', explanation: '受贿罪以行为人实际取得或控制财物作为既遂判断的重要标准。' },
  { id: 2, type: '多选题', kp: '利用影响力受贿罪', stem: '利用影响力受贿罪的主体可以包括哪些人员？', result: 'partial', flagged: true, yours: 'A、C', answer: 'A、B、C', explanation: '该罪主体包括国家工作人员的近亲属、关系密切人以及离职国家工作人员等。' },
  { id: 3, type: '判断题', kp: '渎职罪与受贿罪', stem: '受贿罪与徇私枉法罪竞合时一律择一重罪处罚。', result: 'wrong', yours: '正确', answer: '错误', explanation: '原则上应数罪并罚；法律或司法解释另有特别规定的除外。' },
  { id: 4, type: '填空题', kp: '因果关系', stem: '介入因素异常且独立导致结果发生时，先前行为与结果之间的因果关系____。', result: 'wrong', yours: '不受影响', answer: '中断（阻断）', explanation: '异常且独立的介入因素独立导致结果时，可以阻断先前行为与结果之间的归责关系。' },
  { id: 5, type: '简答题', kp: '单位犯罪', stem: '简述单位犯罪的基本成立条件。', result: 'unanswered', flagged: true, yours: '未作答', answer: '以单位名义、体现单位意志，并为单位谋取利益等。', explanation: '判断时应综合行为名义、决策主体、利益归属及法律是否规定单位可构成本罪。' },
];

const resultMeta: Record<Result, { label: string; color: string; bg: string }> = {
  correct: { label: '正确', color: '#00A63E', bg: '#F6FEF9' },
  partial: { label: '部分正确', color: '#D97706', bg: '#FFF7E8' },
  wrong: { label: '错误', color: '#E5483D', bg: '#FFEDEB' },
  unanswered: { label: '未答', color: '#8E99B0', bg: '#F3F4F9' },
};

interface Props { record: MockHistoryRecord; onBack: () => void; onRetake: () => void; }

export default function MockExamHistoryDetailScreen({ record, onBack, onRetake }: Props) {
  const [tab, setTab] = useState<'report' | 'questions'>('report');
  const [filter, setFilter] = useState<Filter>('all');
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [confirmRetake, setConfirmRetake] = useState(false);
  const fullCorrect = Math.round(record.questionCount * (record.accuracy ?? 0) / 100);
  const partialCorrect = record.status === 'SUBMITTED' ? Math.min(2, record.questionCount - fullCorrect) : 0;
  const wrongCount = Math.max(0, record.answeredCount - fullCorrect - partialCorrect);
  const unansweredCount = Math.max(0, record.questionCount - record.answeredCount);
  const filtered = QUESTIONS.filter((q) => filter === 'all' || (filter === 'flagged' ? q.flagged : q.result === filter));
  const filters: Array<{ id: Filter; label: string }> = [
    { id: 'all', label: `全部 ${record.questionCount}` }, { id: 'wrong', label: '错题 4' }, { id: 'partial', label: '部分正确 2' }, { id: 'unanswered', label: '未答 0' }, { id: 'flagged', label: '已标记 3' },
  ];

  return (
    <div className="h-full flex flex-col bg-[#F6F6F6] text-[#333] relative">
      <header className="bg-white border-b border-[#EBEBEB] px-8 pt-4">
        <div className="max-w-[820px] mx-auto">
          <div className="flex items-center gap-3 pb-3">
            <button onClick={onBack} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F3F4F6]" aria-label="返回历史模考"><ArrowLeft className="w-5 h-5" /></button>
            <div className="flex-1">
              <div className="flex items-center gap-2"><h1 className="text-[18px] font-bold">历史模考详情</h1>{record.retakeIndex && <span className="rounded bg-[#F3F4F6] px-2 py-0.5 text-[10px]">重做第 {record.retakeIndex} 次</span>}</div>
              <p className="text-[11px] text-[#999]">{record.date} · {record.scope}</p>
            </div>
            {record.status === 'SUBMITTED' && <button onClick={() => setConfirmRetake(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-[#DDD] px-3.5 py-2 text-[12px] font-semibold hover:border-[#AAA]"><RotateCcw className="w-4 h-4" />重做本卷</button>}
          </div>
          <div className="flex gap-6 pl-11">
            {(['report', 'questions'] as const).map((id) => <button key={id} onClick={() => setTab(id)} className={`pb-2.5 text-[13px] font-semibold border-b-2 ${tab === id ? 'border-[#333] text-[#333]' : 'border-transparent text-[#999]'}`}>{id === 'report' ? '报告' : '题目回顾'}</button>)}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[820px] mx-auto px-8 py-6 space-y-5">
          {tab === 'report' ? <MockExamReportContent snapshot={{ accuracy: record.accuracy ?? 0, fullCorrect, partialCorrect, wrong: wrongCount, unanswered: unansweredCount, totalQuestions: record.questionCount, durationMinutes: record.durationMinutes ?? 0, estimatedMinutes: record.scale === '完整模考' ? 40 : record.scale === '快速模考' ? 13 : 25, coverageCount: record.coverageCount, scopeLabel: record.scope, scaleLabel: record.scale }} onViewQuestions={() => { setFilter('wrong'); setTab('questions'); }} /> : <>
            <div className="flex flex-wrap gap-2">{filters.map((item) => <button key={item.id} onClick={() => setFilter(item.id)} className={`rounded-full px-3.5 py-2 text-[11px] font-semibold ${filter === item.id ? 'bg-[#333] text-white' : 'bg-white border border-[#E5E5E5] text-[#666]'}`}>{item.label}</button>)}</div>
            <section className="space-y-3">{filtered.map((q) => { const open = expanded.has(q.id); const meta = resultMeta[q.result]; return <article key={q.id} className="overflow-hidden rounded-xl border border-[#EBEBEB] bg-white"><button onClick={() => setExpanded((prev) => { const next = new Set(prev); next.has(q.id) ? next.delete(q.id) : next.add(q.id); return next; })} className="w-full p-4 text-left flex gap-3"><span className="text-[12px] font-bold text-[#999]">{String(q.id).padStart(2,'0')}</span><span className="min-w-0 flex-1"><span className="text-[10px] text-[#999]">{q.type} · {q.kp}{q.flagged ? ' · ⚑ 已标记' : ''}</span><p className="mt-1 truncate text-[13px]">{q.stem}</p><p className="mt-1.5 text-[11px] text-[#777]">你的答案：{q.yours}</p></span><span className="rounded-full px-2.5 py-1 text-[10px] font-bold h-fit" style={{ color: meta.color, background: meta.bg }}>{meta.label}</span>{open ? <ChevronDown className="w-4 h-4 text-[#AAA]" /> : <ChevronRight className="w-4 h-4 text-[#AAA]" />}</button>{open && <div className="border-t border-[#F0F0F0] px-10 py-4 space-y-3 text-[12px]"><p className="leading-relaxed">{q.stem}</p><div className="rounded-lg bg-[#F6FEF9] p-3"><span className="text-[10px] text-[#999]">正确答案</span><p className="mt-1 text-[#087A32]">{q.answer}</p></div><div className="rounded-lg bg-[#F3F4F6] p-3"><span className="text-[10px] text-[#999]">标准解析</span><p className="mt-1 leading-relaxed text-[#666]">{q.explanation}</p></div></div>}</article>; })}</section>
          </>}
        </div>
      </main>

      {confirmRetake && <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/35 p-6"><div className="w-[420px] rounded-2xl bg-white p-6 shadow-xl"><div className="flex justify-between"><h2 className="text-[17px] font-bold">重做本卷</h2><button onClick={() => setConfirmRetake(false)}><X className="w-5 h-5 text-[#999]" /></button></div><p className="mt-3 text-[13px] leading-relaxed text-[#666]">将使用与本次相同的 {record.questionCount} 道题重新开始。原记录不会被覆盖，新成绩将单独保存。</p><p className="mt-3 rounded-lg bg-[#F6F6F6] p-3 text-[11px] leading-relaxed text-[#777]">重做受记忆影响，不计入首次作答趋势，也不会改写原诊断。</p><div className="mt-5 flex justify-end gap-3"><button onClick={() => setConfirmRetake(false)} className="rounded-lg border border-[#DDD] px-4 py-2.5 text-[12px]">取消</button><button onClick={onRetake} className="rounded-lg bg-[#FDEA3B] px-5 py-2.5 text-[12px] font-bold">开始重做</button></div></div></div>}
    </div>
  );
}
