import { ArrowLeft, ChevronRight, Clock3, FileText, PlayCircle } from 'lucide-react';

export type MockHistoryStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'ABANDONED';

export interface MockHistoryRecord {
  id: string;
  date: string;
  scope: string;
  scale: string;
  questionCount: number;
  answeredCount: number;
  accuracy?: number;
  durationMinutes?: number;
  coverageCount: number;
  status: MockHistoryStatus;
  retakeIndex?: number;
}

export const MOCK_HISTORY_RECORDS: MockHistoryRecord[] = [
  { id: 'mock-active', date: '2026年8月7日 19:40', scope: '刑法总论 · 原理构成', scale: '标准模考', questionCount: 20, answeredCount: 12, coverageCount: 14, status: 'IN_PROGRESS', durationMinutes: 15 },
  { id: 'mock-0805', date: '2026年8月5日 14:30', scope: '全部学习计划', scale: '标准模考', questionCount: 20, answeredCount: 20, accuracy: 70, durationMinutes: 23, coverageCount: 12, status: 'SUBMITTED' },
  { id: 'mock-0802', date: '2026年8月2日 20:10', scope: '刑法分论等 2 个章节', scale: '完整模考', questionCount: 30, answeredCount: 30, accuracy: 77, durationMinutes: 39, coverageCount: 18, status: 'SUBMITTED' },
  { id: 'mock-0728', date: '2026年7月28日 09:20', scope: '受贿罪构成等 5 个知识点', scale: '快速模考', questionCount: 10, answeredCount: 10, accuracy: 80, durationMinutes: 12, coverageCount: 5, status: 'SUBMITTED', retakeIndex: 2 },
  { id: 'mock-0721', date: '2026年7月21日 21:05', scope: '刑法总论', scale: '标准模考', questionCount: 20, answeredCount: 7, coverageCount: 13, status: 'ABANDONED', durationMinutes: 9 },
];

interface Props {
  onBack: () => void;
  onOpenRecord: (record: MockHistoryRecord) => void;
  onResume: () => void;
}

export default function MockExamHistoryScreen({ onBack, onOpenRecord, onResume }: Props) {
  const active = MOCK_HISTORY_RECORDS.find((item) => item.status === 'IN_PROGRESS');
  const records = MOCK_HISTORY_RECORDS.filter((item) => item.status !== 'IN_PROGRESS');

  return (
    <div className="h-full flex flex-col bg-[#F6F6F6] text-[#333]">
      <header className="bg-white border-b border-[#EBEBEB] px-8 py-4">
        <div className="max-w-[760px] mx-auto flex items-center gap-3">
          <button onClick={onBack} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F3F4F6]" aria-label="返回模考设置">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-[18px] font-bold">历史模考</h1>
            <p className="text-[12px] text-[#999]">按日期倒序 · 共完成 {records.filter((item) => item.status === 'SUBMITTED').length} 场</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[760px] mx-auto px-8 py-7 space-y-5">
          {active && (
            <section className="rounded-xl border-2 border-[#FDEA3B] bg-[#FFFBEA] p-5">
              <div className="flex items-center justify-between gap-5">
                <div>
                  <span className="inline-flex rounded-full bg-[#FDEA3B] px-2.5 py-1 text-[11px] font-bold">进行中</span>
                  <h2 className="mt-2 text-[16px] font-bold">{active.scope}</h2>
                  <p className="mt-1 text-[12px] text-[#666]">{active.answeredCount}/{active.questionCount} 题已答 · 已用时 {active.durationMinutes} 分钟</p>
                </div>
                <button onClick={onResume} className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-[#333] px-5 py-3 text-[13px] font-bold text-white">
                  <PlayCircle className="w-4 h-4" />继续模考
                </button>
              </div>
            </section>
          )}

          <section className="overflow-hidden rounded-xl border border-[#EBEBEB] bg-white">
            {records.map((record) => {
              const abandoned = record.status === 'ABANDONED';
              return (
                <button key={record.id} onClick={() => onOpenRecord(record)} className="w-full border-b border-[#F0F0F0] last:border-b-0 px-5 py-4 text-left hover:bg-[#FAFAFA] transition-colors">
                  <div className="flex items-center gap-5">
                    <div className={`w-[72px] shrink-0 text-center ${abandoned ? 'text-[#AAA]' : 'text-[#333]'}`}>
                      {abandoned ? <FileText className="mx-auto mb-1 h-5 w-5" /> : <><span className="text-[28px] leading-none font-bold">{record.accuracy}</span><span className="text-[14px]">%</span></>}
                      <p className="mt-1 text-[10px]">{abandoned ? '已放弃' : '正确率'}</p>
                    </div>
                    <div className="min-w-0 flex-1 border-l border-[#EFEFEF] pl-5">
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-semibold">{record.date}</p>
                        {record.retakeIndex && <span className="rounded bg-[#F3F4F6] px-2 py-0.5 text-[10px] text-[#777]">重做第 {record.retakeIndex} 次</span>}
                      </div>
                      <p className="mt-1 text-[14px] font-medium truncate">{record.scope} · {record.scale}</p>
                      <p className="mt-1.5 flex items-center gap-2 text-[11px] text-[#999]">
                        <span>{record.questionCount} 题</span><span>·</span><span>覆盖 {record.coverageCount} 个知识点</span>
                        {record.durationMinutes && <><span>·</span><span className="inline-flex items-center gap-1"><Clock3 className="w-3 h-3" />{record.durationMinutes} 分钟</span></>}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-[#BBB]" />
                  </div>
                </button>
              );
            })}
          </section>
        </div>
      </main>
    </div>
  );
}
