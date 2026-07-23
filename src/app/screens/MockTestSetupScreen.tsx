import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Search, X, Info } from 'lucide-react';

/**
 * 模考设置页（组卷设置） — Prompt 1
 * 皮肤：亮色（配置态，与 Today/Overview 连贯）
 * 题库主题：法考·刑法（与 Today/Overview/星图同一份 system_taxonomy）
 */

// ── 统一配置类型（答题页 / 设置弹窗 共用，避免结构不一致导致运行时崩溃） ──
export type ScopeType = 'all' | 'chapters' | 'modules' | 'topicGroups' | 'knowledgePoints';
export type QuestionType = 'single' | 'truefalse' | 'fill' | 'multiple' | 'shortanswer';
export type DifficultyMode = 'auto' | 'basic' | 'advanced';

export interface TestConfig {
  scope: {
    type: ScopeType;
    /** 选中的分类树节点 id（章节/模块/主题组/知识点通用） */
    selectedIds: string[];
  };
  numberOfQuestions: number;
  questionTypes: QuestionType[];
  difficulty: DifficultyMode;
  /** 优先抽取从未在模考出现过的题（覆盖了旧「更多新题」意图） */
  preferNewQuestions: boolean;
  /** 预计时长（分钟），由题量/题型/难度估算，非固定 1.25min/题 */
  estimatedMinutes: number;
}

interface MockTestSetupScreenProps {
  onStartTest: (config: TestConfig) => void;
  onCancel?: () => void;
  onViewHistory?: () => void;
  /** 是否存在一场未完成模考（同一时刻只能存在一场） */
  hasUnfinishedExam?: boolean;
  onResumeExam?: () => void;
  onAbandonExam?: () => void;
}

// ── system_taxonomy 分类树（与知识地图同一棵） ──
interface ModuleNode {
  id: string;
  name: string;
}
interface ChapterNode {
  id: string;
  name: string;
  modules: ModuleNode[];
}

const TAXONOMY: ChapterNode[] = [
  {
    id: 'ch1',
    name: '刑法分论 · 贿赂渎职',
    modules: [
      { id: 'ch1s1', name: '司法解释与变相受贿' },
      { id: 'ch1s2', name: '中间人与罪数模型' },
      { id: 'ch1s3', name: '斡旋受贿与利用影响力受贿罪' },
      { id: 'ch1s4', name: '渎职罪名与其与受贿罪的关系' },
      { id: 'ch1s5', name: '受贿与其他犯罪' },
      { id: 'ch1s6', name: '行贿罪构成与罪数' },
      { id: 'ch1s7', name: '受贿罪构成与既遂' },
    ],
  },
  {
    id: 'ch2',
    name: '刑法总论 · 原理构成',
    modules: [
      { id: 'ch2s1', name: '犯罪客体与刑法机能' },
      { id: 'ch2s2', name: '犯罪主体与单位犯罪' },
      { id: 'ch2s3', name: '因果关系与结果加重' },
      { id: 'ch2s4', name: '主观要件与认识错误' },
      { id: 'ch2s5', name: '刑法解释方法与技巧' },
      { id: 'ch2s6', name: '犯罪构成与定罪方法' },
      { id: 'ch2s7', name: '刑法基本原则与技巧' },
    ],
  },
];

// 主题组（跨模块的复习主题聚合）
const TOPIC_GROUPS: { id: string; name: string }[] = [
  { id: 'tg1', name: '受贿罪主体与身份认定' },
  { id: 'tg2', name: '罪数与数罪并罚' },
  { id: 'tg3', name: '既遂标准与犯罪形态' },
  { id: 'tg4', name: '因果关系与客观归责' },
  { id: 'tg5', name: '主观故意与认识错误' },
];

// 知识点（可搜索列表 + 掌握度）
interface KpNode {
  id: string;
  name: string;
  moduleId: string;
  mastery: number;
  masteryLabel: string;
}
const KNOWLEDGE_POINTS: KpNode[] = [
  { id: 'kp1', name: '斡旋受贿罪的行为主体是谁', moduleId: 'ch1s3', mastery: 92, masteryLabel: '已掌握' },
  { id: 'kp2', name: '斡旋受贿罪与普通受贿罪如何区分', moduleId: 'ch1s3', mastery: 61, masteryLabel: '练习中' },
  { id: 'kp3', name: '利用影响力受贿罪的行为主体包括哪些', moduleId: 'ch1s3', mastery: 34, masteryLabel: '薄弱' },
  { id: 'kp4', name: '以交易形式变相受贿时如何计算受贿数额', moduleId: 'ch1s1', mastery: 78, masteryLabel: '练习中' },
  { id: 'kp5', name: '及时退还收受财物对受贿罪成立的影响', moduleId: 'ch1s1', mastery: 88, masteryLabel: '已掌握' },
  { id: 'kp6', name: '中间人模型中受贿罪数额如何划分', moduleId: 'ch1s2', mastery: 45, masteryLabel: '薄弱' },
  { id: 'kp7', name: '受贿罪与渎职罪数罪并罚时如何确定', moduleId: 'ch1s4', mastery: 55, masteryLabel: '练习中' },
  { id: 'kp8', name: '私放在押人员等一般渎职罪名的界定', moduleId: 'ch1s4', mastery: 40, masteryLabel: '薄弱' },
  { id: 'kp9', name: '受贿罪既遂的判断标准是什么', moduleId: 'ch1s7', mastery: 70, masteryLabel: '练习中' },
  { id: 'kp10', name: '行贿罪的构成要件与罪数处理', moduleId: 'ch1s6', mastery: 66, masteryLabel: '练习中' },
  { id: 'kp11', name: '因果关系中断的判断方法', moduleId: 'ch2s3', mastery: 52, masteryLabel: '练习中' },
  { id: 'kp12', name: '认识错误对故意成立的影响', moduleId: 'ch2s4', mastery: 48, masteryLabel: '薄弱' },
  { id: 'kp13', name: '单位犯罪的成立条件', moduleId: 'ch2s2', mastery: 81, masteryLabel: '已掌握' },
  { id: 'kp14', name: '罪刑法定原则的基本内涵', moduleId: 'ch2s7', mastery: 90, masteryLabel: '已掌握' },
];

// 规模快捷选项（预计时长由题量结合平均题型难度估算，见 estimateMinutes）
const SIZE_OPTIONS = [
  { count: 10, label: '快速', tag: '' },
  { count: 20, label: '标准', tag: '推荐' },
  { count: 30, label: '完整', tag: '' },
] as const;

const ALL_QUESTION_TYPES: { id: QuestionType; label: string }[] = [
  { id: 'single', label: '单选' },
  { id: 'truefalse', label: '判断' },
  { id: 'fill', label: '填空' },
  { id: 'multiple', label: '多选' },
  { id: 'shortanswer', label: '简答' },
];

const DIFFICULTY_OPTIONS: { id: DifficultyMode; label: string }[] = [
  { id: 'auto', label: '自动均衡' },
  { id: 'basic', label: '基础为主' },
  { id: 'advanced', label: '进阶为主' },
];

/** 预计时长估算：不固定 1.25min/题，随题型/难度浮动 */
function estimateMinutes(count: number, types: QuestionType[], difficulty: DifficultyMode): number {
  const base: Record<QuestionType, number> = {
    single: 0.9,
    truefalse: 0.6,
    fill: 1.1,
    multiple: 1.4,
    shortanswer: 2.6,
  };
  const active = types.length > 0 ? types : (['single'] as QuestionType[]);
  const avg = active.reduce((s, t) => s + base[t], 0) / active.length;
  const diffFactor = difficulty === 'advanced' ? 1.2 : difficulty === 'basic' ? 0.85 : 1;
  return Math.max(1, Math.round(count * avg * diffFactor));
}

export function MockTestSetupScreen({
  onStartTest,
  onCancel,
  onViewHistory,
  hasUnfinishedExam = false,
  onResumeExam,
  onAbandonExam,
}: MockTestSetupScreenProps) {
  const [scopeType, setScopeType] = useState<ScopeType>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [numberOfQuestions, setNumberOfQuestions] = useState(20);
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>(
    ALL_QUESTION_TYPES.map((t) => t.id),
  );
  const [difficulty, setDifficulty] = useState<DifficultyMode>('auto');
  const [preferNewQuestions, setPreferNewQuestions] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [customCount, setCustomCount] = useState('');
  const [kpSearch, setKpSearch] = useState('');

  // 未完成模考态（可由 prop 控制；提供本地预览开关，便于演示三态）
  const [unfinished, setUnfinished] = useState(hasUnfinishedExam);
  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false);

  const effectiveCount = customCount ? Math.max(1, parseInt(customCount) || 0) : numberOfQuestions;
  const estimated = useMemo(
    () => estimateMinutes(effectiveCount, questionTypes, difficulty),
    [effectiveCount, questionTypes, difficulty],
  );

  const filteredKps = KNOWLEDGE_POINTS.filter((kp) => kp.name.includes(kpSearch));

  // ── 树多选 ──
  const toggleId = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const chapterCheckState = (chapter: ChapterNode): 'none' | 'half' | 'all' => {
    const childIds = chapter.modules.map((m) => m.id);
    const selectedChildren = childIds.filter((id) => selectedIds.includes(id));
    if (selectedChildren.length === 0) return 'none';
    if (selectedChildren.length === childIds.length) return 'all';
    return 'half';
  };

  const toggleAllModulesInChapter = (chapter: ChapterNode) => {
    const childIds = chapter.modules.map((m) => m.id);
    const state = chapterCheckState(chapter);
    setSelectedIds((prev) => {
      if (state === 'all') return prev.filter((id) => !childIds.includes(id));
      return Array.from(new Set([...prev, ...childIds]));
    });
  };

  const handleReset = () => {
    setScopeType('all');
    setSelectedIds([]);
    setNumberOfQuestions(20);
    setQuestionTypes(ALL_QUESTION_TYPES.map((t) => t.id));
    setDifficulty('auto');
    setPreferNewQuestions(true);
    setShowAdvanced(false);
    setCustomCount('');
    setKpSearch('');
  };

  const handleStart = () => {
    onStartTest({
      scope: { type: scopeType, selectedIds },
      numberOfQuestions: effectiveCount,
      questionTypes,
      difficulty,
      preferNewQuestions,
      estimatedMinutes: estimated,
    });
  };

  const toggleQuestionType = (t: QuestionType) => {
    setQuestionTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  const scopeTabs: { id: ScopeType; label: string }[] = [
    { id: 'all', label: '全部计划' },
    { id: 'chapters', label: '按章节' },
    { id: 'modules', label: '按模块' },
    { id: 'topicGroups', label: '按主题组' },
    { id: 'knowledgePoints', label: '按知识点' },
  ];

  return (
    <div className="h-full flex flex-col bg-[#F6F6F6] text-[#333333]">
      {/* 页头（居中轻量） */}
      <div className="px-12 pt-8 pb-4">
        <div className="max-w-[640px] mx-auto relative text-center">
          <div className="flex items-center justify-center gap-1">
            <h1 className="text-[24px] font-bold text-[#333333]">设置你的模考</h1>
            <button className="text-[#666666] hover:text-[#333333]" title="切换科目">
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
          <p className="text-[13px] text-[#666666] mt-1">按你的选择，生成一份接近真实的模考卷</p>
          {/* 历史模考入口 */}
          <button
            onClick={onViewHistory}
            className="absolute right-0 top-1 text-[13px] text-[#2D8CFF] hover:underline"
          >
            历史模考 ›
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[640px] mx-auto px-12 pb-10">
          {/* 单张容器：三段之间用细分隔线，而非独立卡片堆叠 */}
          <div className="bg-white rounded-xl border border-[#EBEBEB] px-7 py-6 divide-y divide-[#EFEFEF]">
            {/* ① 测试范围 */}
            <section className="pb-6">
              <h2 className="text-[15px] font-bold text-[#333333] mb-3">① 测试范围</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {scopeTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setScopeType(tab.id);
                      setSelectedIds([]);
                    }}
                    className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all ${
                      scopeType === tab.id
                        ? 'bg-[#FDEA3B] text-[#333333]'
                        : 'bg-[#F3F4F6] text-[#666666] hover:bg-[#EBEBEB]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* 按章节 */}
              {scopeType === 'chapters' && (
                <div className="bg-[#F3F4F6] rounded-lg p-3 space-y-2 mb-3">
                  {TAXONOMY.map((ch) => {
                    const checked = selectedIds.includes(ch.id);
                    return (
                      <button
                        key={ch.id}
                        onClick={() => toggleId(ch.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-[14px] font-medium transition-all ${
                          checked ? 'bg-[#FDEA3B] text-[#333333]' : 'bg-white text-[#333333] hover:bg-[#FAFAFA]'
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded border flex items-center justify-center text-[11px] ${
                            checked ? 'bg-[#333333] border-[#333333] text-white' : 'border-[#CCCCCC]'
                          }`}
                        >
                          {checked ? '✓' : ''}
                        </span>
                        {ch.name}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 按模块（章 → 模块 树，父节点半选） */}
              {scopeType === 'modules' && (
                <div className="bg-[#F3F4F6] rounded-lg p-3 space-y-3 mb-3">
                  {TAXONOMY.map((ch) => {
                    const state = chapterCheckState(ch);
                    return (
                      <div key={ch.id}>
                        <button
                          onClick={() => toggleAllModulesInChapter(ch)}
                          className="w-full flex items-center gap-3 px-2 py-2 text-left text-[13px] font-semibold text-[#333333]"
                        >
                          <span
                            className={`w-4 h-4 rounded border flex items-center justify-center text-[11px] ${
                              state === 'none'
                                ? 'border-[#CCCCCC]'
                                : 'bg-[#333333] border-[#333333] text-white'
                            }`}
                          >
                            {state === 'all' ? '✓' : state === 'half' ? '–' : ''}
                          </span>
                          {ch.name}
                        </button>
                        <div className="grid grid-cols-2 gap-2 pl-7">
                          {ch.modules.map((m) => {
                            const checked = selectedIds.includes(m.id);
                            return (
                              <button
                                key={m.id}
                                onClick={() => toggleId(m.id)}
                                className={`px-3 py-2 rounded-lg text-left text-[12px] font-medium transition-all ${
                                  checked
                                    ? 'bg-[#FDEA3B] text-[#333333]'
                                    : 'bg-white text-[#666666] hover:bg-[#FAFAFA]'
                                }`}
                              >
                                {m.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 按主题组 */}
              {scopeType === 'topicGroups' && (
                <div className="bg-[#F3F4F6] rounded-lg p-3 flex flex-wrap gap-2 mb-3">
                  {TOPIC_GROUPS.map((tg) => {
                    const checked = selectedIds.includes(tg.id);
                    return (
                      <button
                        key={tg.id}
                        onClick={() => toggleId(tg.id)}
                        className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${
                          checked ? 'bg-[#FDEA3B] text-[#333333]' : 'bg-white text-[#666666] hover:bg-[#FAFAFA]'
                        }`}
                      >
                        {tg.name}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 按知识点（可搜索 + 掌握度%） */}
              {scopeType === 'knowledgePoints' && (
                <div className="bg-[#F3F4F6] rounded-lg p-3 mb-3">
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
                    <input
                      value={kpSearch}
                      onChange={(e) => setKpSearch(e.target.value)}
                      placeholder="搜索知识点…"
                      className="w-full pl-10 pr-9 py-2 bg-white border border-[#EBEBEB] rounded-lg text-[13px] text-[#333333] placeholder-[#999999] focus:outline-none focus:border-[#2D8CFF]"
                    />
                    {kpSearch && (
                      <button
                        onClick={() => setKpSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999999]"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-1.5 max-h-[220px] overflow-y-auto">
                    {filteredKps.map((kp) => {
                      const checked = selectedIds.includes(kp.id);
                      const dotColor =
                        kp.masteryLabel === '已掌握'
                          ? '#00A63E'
                          : kp.masteryLabel === '薄弱'
                          ? '#FF6252'
                          : '#2D8CFF';
                      return (
                        <button
                          key={kp.id}
                          onClick={() => toggleId(kp.id)}
                          className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg text-left text-[13px] transition-all ${
                            checked ? 'bg-[#FDEA3B] text-[#333333]' : 'bg-white text-[#333333] hover:bg-[#FAFAFA]'
                          }`}
                        >
                          <span className="truncate">{kp.name}</span>
                          <span className="flex items-center gap-1.5 shrink-0 text-[11px] text-[#666666]">
                            <span className="w-2 h-2 rounded-full" style={{ background: dotColor }} />
                            {kp.mastery}% · {kp.masteryLabel}
                          </span>
                        </button>
                      );
                    })}
                    {filteredKps.length === 0 && (
                      <p className="text-[12px] text-[#999999] px-2 py-4 text-center">没有匹配的知识点</p>
                    )}
                  </div>
                </div>
              )}

              <p className="text-[11px] text-[#999999]">题目将按你的范围复用已有题或按需生成</p>
            </section>

            {/* ② 模考规模 */}
            <section className="py-6">
              <h2 className="text-[15px] font-bold text-[#333333] mb-3">② 模考规模</h2>
              <div className="grid grid-cols-3 gap-3">
                {SIZE_OPTIONS.map((opt) => {
                  const active = numberOfQuestions === opt.count && !customCount;
                  const mins = estimateMinutes(opt.count, questionTypes, difficulty);
                  return (
                    <button
                      key={opt.count}
                      onClick={() => {
                        setNumberOfQuestions(opt.count);
                        setCustomCount('');
                      }}
                      className={`relative rounded-xl border-2 px-4 py-4 text-center transition-all ${
                        active
                          ? 'border-[#FDEA3B] bg-[#FFFBEA]'
                          : 'border-[#EBEBEB] bg-white hover:border-[#CCCCCC]'
                      }`}
                    >
                      {opt.tag && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-[#FDEA3B] text-[#333333] text-[10px] font-bold">
                          {opt.tag}
                        </span>
                      )}
                      <div className="text-[13px] text-[#666666]">{opt.label}</div>
                      <div className="text-[22px] font-bold text-[#333333] leading-tight">
                        {opt.count}
                        <span className="text-[13px] font-medium text-[#666666] ml-0.5">题</span>
                      </div>
                      <div className="text-[11px] text-[#999999] mt-1">预计 {mins} 分钟</div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* ③ 更多设置（默认收起） */}
            <section className="py-6">
              <button
                onClick={() => setShowAdvanced((v) => !v)}
                className="w-full flex items-center justify-between text-left"
              >
                <span className="text-[14px] font-medium text-[#333333]">
                  更多设置{' '}
                  {!showAdvanced && <span className="text-[12px] text-[#999999]">· 已使用推荐配置</span>}
                </span>
                {showAdvanced ? (
                  <ChevronDown className="w-4 h-4 text-[#999999]" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-[#999999]" />
                )}
              </button>

              {showAdvanced && (
                <div className="mt-4 space-y-5">
                  {/* 题型 */}
                  <div>
                    <p className="text-[12px] font-medium text-[#666666] mb-2">题型（多选）</p>
                    <div className="flex flex-wrap gap-2">
                      {ALL_QUESTION_TYPES.map((t) => {
                        const active = questionTypes.includes(t.id);
                        return (
                          <button
                            key={t.id}
                            onClick={() => toggleQuestionType(t.id)}
                            className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all ${
                              active
                                ? 'bg-[#FDEA3B] text-[#333333]'
                                : 'bg-[#F3F4F6] text-[#666666] hover:bg-[#EBEBEB]'
                            }`}
                          >
                            {t.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 难度 */}
                  <div>
                    <p className="text-[12px] font-medium text-[#666666] mb-2">难度</p>
                    <div className="flex gap-2">
                      {DIFFICULTY_OPTIONS.map((d) => {
                        const active = difficulty === d.id;
                        return (
                          <button
                            key={d.id}
                            onClick={() => setDifficulty(d.id)}
                            className={`flex-1 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                              active
                                ? 'bg-[#FDEA3B] text-[#333333]'
                                : 'bg-[#F3F4F6] text-[#666666] hover:bg-[#EBEBEB]'
                            }`}
                          >
                            {d.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 优先抽新题 开关 */}
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-[#333333]">优先抽取从未在模考出现过的题</span>
                    <button
                      onClick={() => setPreferNewQuestions((v) => !v)}
                      className={`w-11 h-6 rounded-full transition-colors relative ${
                        preferNewQuestions ? 'bg-[#2D8CFF]' : 'bg-[#CCCCCC]'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${
                          preferNewQuestions ? 'left-[22px]' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  {/* 自定义题量 */}
                  <div>
                    <p className="text-[12px] font-medium text-[#666666] mb-2">自定义题量</p>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={customCount}
                      onChange={(e) => setCustomCount(e.target.value)}
                      placeholder="例如 25"
                      className="w-40 px-4 py-2.5 bg-white border border-[#EBEBEB] rounded-lg text-[13px] text-[#333333] placeholder-[#999999] focus:outline-none focus:border-[#2D8CFF]"
                    />
                  </div>
                </div>
              )}
            </section>

            {/* ④ 考试规则摘要 */}
            <section className="pt-6">
              <button
                onClick={() => setShowRules((v) => !v)}
                className="w-full flex items-center justify-between text-left"
              >
                <span className="text-[13px] text-[#666666]">
                  {effectiveCount} 题 · 预计 {estimated} 分钟 · 到时自动交卷 · 作答中不显示答案
                </span>
                {showRules ? (
                  <ChevronDown className="w-4 h-4 text-[#999999]" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-[#999999]" />
                )}
              </button>
              {showRules && (
                <div className="mt-3 bg-[#F3F4F6] rounded-lg p-4 flex gap-3">
                  <Info className="w-4 h-4 text-[#8E99B0] shrink-0 mt-0.5" />
                  <ul className="text-[12px] text-[#666666] leading-relaxed list-disc pl-4 space-y-1">
                    <li>模考不支持题内重做；</li>
                    <li>交卷前可返回修改；</li>
                    <li>答案自动保存，退出后可以继续；</li>
                    <li>同一时刻只能存在一场未完成模考。</li>
                  </ul>
                </div>
              )}
            </section>
          </div>

          {/* ⑤ 底部动作 */}
          {unfinished ? (
            <div className="mt-6 bg-[#FFFBEA] border border-[#FDEA3B] rounded-xl p-5">
              <p className="text-[14px] font-medium text-[#333333] mb-1">你有一场未完成的模考</p>
              <p className="text-[12px] text-[#666666] mb-4">继续上次进度，或彻底放弃后重新开始。</p>
              <div className="flex gap-3">
                <button
                  onClick={() => (onResumeExam ? onResumeExam() : handleStart())}
                  className="flex-1 px-6 py-3 bg-[#FDEA3B] text-[#333333] rounded-lg text-[14px] font-bold hover:brightness-95 transition-all"
                >
                  继续模考
                </button>
                <button
                  onClick={() => setShowAbandonConfirm(true)}
                  className="px-6 py-3 text-[#FF6252] rounded-lg text-[14px] font-medium hover:bg-[#FFEDEB] transition-colors"
                >
                  彻底放弃
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              <button
                onClick={handleStart}
                className="w-full px-6 py-4 bg-[#FDEA3B] text-[#333333] rounded-lg text-[15px] font-bold hover:brightness-95 transition-all"
              >
                开始模考（约 {estimated} 分钟）
              </button>
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={handleReset}
                  className="text-[13px] text-[#666666] hover:text-[#333333]"
                >
                  重置
                </button>
                {onCancel && (
                  <button
                    onClick={onCancel}
                    className="text-[13px] text-[#666666] hover:text-[#333333]"
                  >
                    取消
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 演示：三态切换（未完成模考态预览） */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setUnfinished((v) => !v)}
              className="text-[11px] text-[#CCCCCC] hover:text-[#999999]"
            >
              {unfinished ? '（演示：切回可开始态）' : '（演示：预览未完成模考态）'}
            </button>
          </div>
        </div>
      </div>

      {/* 彻底放弃 二次确认 */}
      {showAbandonConfirm && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-7 w-[420px] mx-4 border border-[#EBEBEB]">
            <h3 className="text-[18px] font-bold text-[#333333] mb-2">彻底放弃这场模考？</h3>
            <p className="text-[13px] text-[#666666] mb-6">
              放弃后本场作答记录将被清空，且无法恢复。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAbandonConfirm(false)}
                className="flex-1 px-4 py-3 rounded-lg bg-[#F3F4F6] text-[#333333] font-medium hover:bg-[#EBEBEB]"
              >
                再想想
              </button>
              <button
                onClick={() => {
                  setShowAbandonConfirm(false);
                  setUnfinished(false);
                  onAbandonExam?.();
                }}
                className="flex-1 px-4 py-3 rounded-lg bg-[#FF6252] text-white font-bold hover:brightness-95"
              >
                确认放弃
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MockTestSetupScreen;
