import { useState } from 'react';
import { ChevronDown, ChevronRight, Clock, ArrowLeft } from 'lucide-react';

/**
 * 模考成绩报告页 — Prompt 3
 * 皮肤：亮色（阅读态）。定位=诊断而非评判：不制造焦虑、不虚构精度。
 * 禁止「83.5 分」类虚假精度：只给正确率整数 + 覆盖数。
 * 题库主题：法考·刑法。
 */

interface PostExamReportScreenProps {
  score: number;
  totalQuestions: number;
  timeSpent: number;
  targetScore?: number;
  onReviewTopic: (topicId: string) => void;
  onReturnToDashboard: () => void;
  onRetakeExam?: () => void;
}

// 能力分布（按分类树 · 章节/模块）
interface AbilityRow {
  name: string;
  accuracy: number; // 本次正确率
  firstTry: number; // 首次正确率
  avgSeconds: number;
  weak?: boolean;
}
const ABILITY_ROWS: AbilityRow[] = [
  { name: '刑法分论 · 贿赂渎职', accuracy: 75, firstTry: 68, avgSeconds: 62 },
  { name: '渎职罪名与受贿罪关系', accuracy: 40, firstTry: 35, avgSeconds: 88, weak: true },
  { name: '刑法总论 · 原理构成', accuracy: 82, firstTry: 74, avgSeconds: 55 },
  { name: '因果关系与结果加重', accuracy: 50, firstTry: 42, avgSeconds: 79, weak: true },
];

// 知识点诊断（四组：稳定掌握/疑似掌握/薄弱/证据不足）
type DiagCategory = 'stable' | 'likely' | 'weak' | 'insufficient';
interface DiagKp {
  id: string;
  name: string;
  category: DiagCategory;
}
const DIAG_KPS: DiagKp[] = [
  { id: 'kp1', name: '斡旋受贿罪的行为主体是谁', category: 'stable' },
  { id: 'kp5', name: '及时退还收受财物对受贿罪成立的影响', category: 'stable' },
  { id: 'kp13', name: '单位犯罪的成立条件', category: 'stable' },
  { id: 'kp2', name: '斡旋受贿罪与普通受贿罪如何区分', category: 'likely' },
  { id: 'kp9', name: '受贿罪既遂的判断标准是什么', category: 'likely' },
  { id: 'kp3', name: '利用影响力受贿罪的行为主体包括哪些', category: 'weak' },
  { id: 'kp8', name: '私放在押人员等一般渎职罪名的界定', category: 'weak' },
  { id: 'kp11', name: '因果关系中断的判断方法', category: 'weak' },
  { id: 'kp14', name: '罪刑法定原则的基本内涵', category: 'insufficient' },
  { id: 'kp12', name: '认识错误对故意成立的影响', category: 'insufficient' },
];

const DIAG_META: Record<
  DiagCategory,
  { title: string; color: string; bg: string; desc: string; action: string }
> = {
  stable: { title: '稳定掌握', color: '#00A63E', bg: '#F6FEF9', desc: '本次对 + 历史留存好', action: '去复习' },
  likely: { title: '疑似掌握', color: '#2D8CFF', bg: '#EAF3FF', desc: '本次对但样本少 / 首次曾错', action: '去复习' },
  weak: { title: '薄弱', color: '#FF6252', bg: '#FFEDEB', desc: '本次错 / 连错达阈', action: '去强化' },
  insufficient: {
    title: '证据不足',
    color: '#8E99B0',
    bg: '#F3F4F9',
    desc: '样本太少，不下结论',
    action: '去复习',
  },
};

// 错题回顾（按知识点聚合，只读；不做错误类型归因）
interface WrongItem {
  id: string;
  kpName: string;
  question: string;
  yourAnswer: string;
  correctAnswer: string;
  explanation: string;
}
const WRONG_ITEMS: WrongItem[] = [
  {
    id: 'w1',
    kpName: '利用影响力受贿罪',
    question: '下列哪一项不属于利用影响力受贿罪的行为主体？',
    yourAnswer: 'A. 国家工作人员的近亲属',
    correctAnswer: 'D. 在职国家工作人员本人',
    explanation:
      '在职国家工作人员本人利用职权收受财物应认定为受贿罪；利用影响力受贿罪的主体是近亲属、关系密切人及离职的国家工作人员等。',
  },
  {
    id: 'w2',
    kpName: '渎职罪名与受贿罪关系',
    question: '受贿罪与徇私枉法罪竞合时应择一重罪处罚。',
    yourAnswer: '正确',
    correctAnswer: '错误',
    explanation:
      '国家工作人员受贿又渎职的，原则上数罪并罚；刑法或司法解释另有规定的从其规定，并非一律择一重罪。',
  },
  {
    id: 'w3',
    kpName: '因果关系中断',
    question: '介入因素异常且独立导致结果发生时，先前行为与结果之间的因果关系__________。',
    yourAnswer: '不受影响',
    correctAnswer: '中断（阻断）',
    explanation: '异常且独立的介入因素独立导致结果时，先前行为与结果的因果关系被阻断。',
  },
];

// 下一步行动：待新增的复习模块（默认不写入计划）
interface PlanModule {
  id: string;
  name: string;
  minutes: number;
}
const PLAN_MODULES: PlanModule[] = [
  { id: 'ch1s4', name: '渎职罪名与其与受贿罪的关系', minutes: 35 },
  { id: 'ch1s3', name: '利用影响力受贿罪主体认定', minutes: 30 },
  { id: 'ch2s3', name: '因果关系与客观归责', minutes: 30 },
];

export function PostExamReportScreen({
  score,
  totalQuestions,
  timeSpent,
  onReviewTopic,
  onReturnToDashboard,
  onRetakeExam,
}: PostExamReportScreenProps) {
  const [expandedWrong, setExpandedWrong] = useState<Set<string>>(new Set());
  const [openGroups, setOpenGroups] = useState<Set<DiagCategory>>(new Set(['weak']));
  const [showPlan, setShowPlan] = useState(false);
  const [selectedModules, setSelectedModules] = useState<Set<string>>(
    new Set(PLAN_MODULES.map((m) => m.id)),
  );
  const [planAdded, setPlanAdded] = useState(false);

  // 只给正确率整数，不做虚假精度
  const accuracy = Math.round((score / totalQuestions) * 100);
  const coverage = 12; // 覆盖知识点数

  const interpretation =
    accuracy < 60 ? '已建立基线' : accuracy <= 80 ? '找到了清晰的起点' : '核心概念掌握稳固';

  const formatTime = (sec: number) => {
    const m = Math.round(sec / 60);
    return `${m} 分钟`;
  };

  const weakModuleCount = ABILITY_ROWS.filter((r) => r.weak).length + 1;
  const totalPlanMinutes = PLAN_MODULES.filter((m) => selectedModules.has(m.id)).reduce(
    (s, m) => s + m.minutes,
    0,
  );

  const toggleWrong = (id: string) =>
    setExpandedWrong((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleGroup = (c: DiagCategory) =>
    setOpenGroups((prev) => {
      const next = new Set(prev);
      next.has(c) ? next.delete(c) : next.add(c);
      return next;
    });

  const toggleModule = (id: string) =>
    setSelectedModules((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const groupOrder: DiagCategory[] = ['stable', 'likely', 'weak', 'insufficient'];

  return (
    <div className="h-full flex flex-col bg-[#F6F6F6] text-[#333333]">
      {/* 页头 */}
      <div className="border-b border-[#EBEBEB] bg-white px-8 py-4">
        <div className="max-w-[900px] mx-auto flex items-center gap-3">
          <button
            onClick={onReturnToDashboard}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F3F4F6]"
          >
            <ArrowLeft className="w-5 h-5 text-[#666666]" />
          </button>
          <div>
            <h1 className="text-[18px] font-bold text-[#333333]">模考报告</h1>
            <p className="text-[12px] text-[#999999]">
              刑法 · {totalQuestions} 题 · 用时 {formatTime(timeSpent)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[900px] mx-auto px-8 py-8 space-y-6">
          {/* 板块① 总体结果 */}
          <section className="bg-white rounded-xl border border-[#EBEBEB] p-7">
            <div className="flex items-start gap-8">
              <div className="shrink-0">
                <p className="text-[11px] text-[#999999] font-semibold mb-1">正确率</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-[64px] font-bold leading-none text-[#333333]">{accuracy}</span>
                  <span className="text-[28px] text-[#999999]">%</span>
                </div>
                <p className="text-[13px] text-[#666666] mt-2">
                  {score} / {totalQuestions} 题正确
                </p>
              </div>
              <div className="flex-1 pt-3">
                <p className="text-[17px] font-semibold text-[#333333] mb-2">{interpretation}</p>
                <p className="text-[13px] text-[#666666] leading-relaxed">
                  本报告用于定位「哪里稳、哪里薄、下一步补什么」，不制造焦虑。下方按分类树展开你的表现细节与复习建议。
                </p>
                <div className="mt-4 pt-4 border-t border-[#F3F4F6] flex items-center gap-4 text-[12px] text-[#999999]">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> 用时 {formatTime(timeSpent)}
                  </span>
                  <span>·</span>
                  <span>完成度 {totalQuestions}/{totalQuestions}</span>
                  <span>·</span>
                  <span>覆盖 {coverage} 个知识点</span>
                </div>
              </div>
            </div>
          </section>

          {/* 板块② 能力分布（按分类树条形） */}
          <section className="bg-white rounded-xl border border-[#EBEBEB] p-7">
            <h2 className="text-[16px] font-bold text-[#333333] mb-1">能力分布</h2>
            <p className="text-[12px] text-[#999999] mb-5">正确率与「首次正确率」分开展示，首次表现是更真实的证据。</p>
            <div className="space-y-4">
              {ABILITY_ROWS.map((row) => (
                <div key={row.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[13px] text-[#333333]">{row.name}</span>
                    <span className="text-[12px] text-[#666666]">
                      {row.accuracy}% · 首次 {row.firstTry}% · 均 {row.avgSeconds}s
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-[#F3F4F6] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${row.accuracy}%`,
                        background: row.weak ? '#FF6252' : '#2D8CFF',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 板块③ 知识点诊断（四组，含证据不足单列） */}
          <section className="bg-white rounded-xl border border-[#EBEBEB] p-7">
            <h2 className="text-[16px] font-bold text-[#333333] mb-1">知识点诊断</h2>
            <p className="text-[12px] text-[#999999] mb-5">
              「证据不足」单列——样本太少不下结论，不硬判成薄弱或掌握。
            </p>
            <div className="space-y-3">
              {groupOrder.map((cat) => {
                const meta = DIAG_META[cat];
                const items = DIAG_KPS.filter((k) => k.category === cat);
                const open = openGroups.has(cat);
                return (
                  <div key={cat} className="border border-[#EBEBEB] rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleGroup(cat)}
                      className="w-full flex items-center justify-between px-4 py-3"
                      style={{ background: meta.bg }}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: meta.color }} />
                        <span className="text-[14px] font-semibold text-[#333333]">{meta.title}</span>
                        <span className="text-[12px] text-[#999999]">{items.length}</span>
                      </span>
                      {open ? (
                        <ChevronDown className="w-4 h-4 text-[#999999]" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-[#999999]" />
                      )}
                    </button>
                    {open && (
                      <div className="divide-y divide-[#F3F4F6]">
                        {items.length === 0 && (
                          <p className="px-4 py-3 text-[12px] text-[#999999]">本组暂无知识点</p>
                        )}
                        {items.map((k) => (
                          <div key={k.id} className="flex items-center justify-between px-4 py-3">
                            <span className="flex items-center gap-2.5 text-[13px] text-[#333333]">
                              <span className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
                              {k.name}
                            </span>
                            <button
                              onClick={() => onReviewTopic(k.id)}
                              className="text-[12px] text-[#2D8CFF] hover:underline shrink-0"
                            >
                              {meta.action}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* 板块④ 错题回顾（不做错误类型归因） */}
          <section className="bg-white rounded-xl border border-[#EBEBEB] p-7">
            <h2 className="text-[16px] font-bold text-[#333333] mb-5">错题回顾</h2>
            <div className="space-y-3">
              {WRONG_ITEMS.map((w) => {
                const open = expandedWrong.has(w.id);
                return (
                  <div key={w.id} className="border border-[#EBEBEB] rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleWrong(w.id)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#FAFAFA]"
                    >
                      <span>
                        <span className="text-[11px] text-[#999999]">{w.kpName}</span>
                        <p className="text-[13px] text-[#333333] mt-0.5 line-clamp-1">{w.question}</p>
                      </span>
                      {open ? (
                        <ChevronDown className="w-4 h-4 text-[#999999] shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-[#999999] shrink-0" />
                      )}
                    </button>
                    {open && (
                      <div className="px-4 pb-4 pt-1 space-y-3 text-[13px]">
                        <p className="text-[#333333] leading-relaxed">{w.question}</p>
                        <div className="rounded-lg bg-[#FFEDEB] px-3 py-2">
                          <span className="text-[11px] text-[#999999]">你的答案</span>
                          <p className="text-[#FF6252]">{w.yourAnswer}</p>
                        </div>
                        <div className="rounded-lg bg-[#F6FEF9] px-3 py-2">
                          <span className="text-[11px] text-[#999999]">正确答案</span>
                          <p className="text-[#00A63E]">{w.correctAnswer}</p>
                        </div>
                        <div className="rounded-lg bg-[#F3F4F6] px-3 py-2">
                          <span className="text-[11px] text-[#999999]">解析</span>
                          <p className="text-[#666666] leading-relaxed">{w.explanation}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* 板块⑤ 下一步行动（默认不自动改计划） */}
          <section className="rounded-xl border-2 border-[#FDEA3B] bg-[#FFFBEA] p-7">
            <h2 className="text-[16px] font-bold text-[#333333] mb-3">下一步行动</h2>
            <p className="text-[15px] font-semibold text-[#333333]">
              发现 {weakModuleCount} 个重点薄弱模块 · 预计补强约 {totalPlanMinutes} 分钟
            </p>
            <p className="text-[12px] text-[#999999] mt-2 mb-4">
              我们不会自动修改你的原计划；只有点「加入学习计划」后，这些模块才会插入未来计划。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPlan((v) => !v)}
                className="px-5 py-2.5 rounded-lg bg-white border border-[#EBEBEB] text-[13px] font-medium text-[#333333] hover:border-[#CCCCCC]"
              >
                查看复习方案
              </button>
              <button
                onClick={() => setPlanAdded(true)}
                disabled={planAdded || selectedModules.size === 0}
                className="px-5 py-2.5 rounded-lg bg-[#FDEA3B] text-[13px] font-bold text-[#333333] hover:brightness-95 disabled:opacity-60"
              >
                {planAdded ? '已加入学习计划' : '加入学习计划'}
              </button>
            </div>

            {showPlan && (
              <div className="mt-4 bg-white rounded-lg border border-[#EBEBEB] p-4">
                <p className="text-[12px] text-[#999999] mb-3">勾选要加入的复习模块，确认后再写入计划：</p>
                <div className="space-y-2">
                  {PLAN_MODULES.map((m) => {
                    const checked = selectedModules.has(m.id);
                    return (
                      <button
                        key={m.id}
                        onClick={() => toggleModule(m.id)}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-[#FAFAFA] text-left"
                      >
                        <span className="flex items-center gap-3">
                          <span
                            className={`w-4 h-4 rounded border flex items-center justify-center text-[11px] ${
                              checked
                                ? 'bg-[#2D8CFF] border-[#2D8CFF] text-white'
                                : 'border-[#CCCCCC]'
                            }`}
                          >
                            {checked ? '✓' : ''}
                          </span>
                          <span className="text-[13px] text-[#333333]">{m.name}</span>
                        </span>
                        <span className="text-[12px] text-[#999999]">约 {m.minutes} 分钟</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {/* 底部通用动作 */}
          <div className="flex items-center gap-4 pt-2">
            {onRetakeExam && (
              <button
                onClick={onRetakeExam}
                className="flex-1 px-6 py-3.5 bg-white border border-[#EBEBEB] rounded-lg text-[14px] font-semibold text-[#333333] hover:border-[#CCCCCC]"
              >
                重做模考
              </button>
            )}
            <button
              onClick={onReturnToDashboard}
              className="flex-1 px-6 py-3.5 bg-white border border-[#EBEBEB] rounded-lg text-[14px] font-semibold text-[#333333] hover:border-[#CCCCCC]"
            >
              返回总览
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostExamReportScreen;
