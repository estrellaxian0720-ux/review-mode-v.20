import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Check, Star, Upload, FileText, Mic, Link2, Image, GripVertical, X, Search, ChevronDown, Users, Trash2, RotateCcw, BookOpen, PenLine, Eraser, MoreHorizontal } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────

type GoalType = 'college' | 'postgrad' | 'civil' | 'cert' | 'language' | 'other';
// B3–B7, C1, C2 are sub-phases inside A5; not top-level steps
type Step = 'A1' | 'A2' | 'B1' | 'A3' | 'A4' | 'A5' | 'A6';

// B1 (资料变知识点 前置动画) lives between A2 and A3 for preset flows
const STEPS_WITH_SAMPLE: Step[] = ['A1', 'A2', 'B1', 'A3', 'A4', 'A5', 'A6'];
const STEPS_NO_SAMPLE: Step[]   = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6'];

interface OnboardingScreenProps {
  onComplete: () => void;
  onSkip: () => void;
}

// ── Design tokens ──────────────────────────────────────────────────────────────
const BG     = '#F6F6F6';
const CARD   = '#FFFFFF';
const PRIMARY = '#FFE562';
const BLUE   = '#2D8CFF';
const GREEN  = '#00A63E';
const RED    = '#FF6252';
const T1     = '#111111';
const T2     = '#333333';
const T3     = '#666666';
const T4     = '#999999';
const BORDER = '#EBEBEB';

// ── Goal data ──────────────────────────────────────────────────────────────────

const PRIMARY_GOALS: { id: GoalType; label: string; icon: string }[] = [
  { id: 'college',  label: '大学课程',    icon: '📚' },
  { id: 'postgrad', label: '考研',        icon: '🔬' },
  { id: 'civil',    label: '考公',        icon: '🏛️' },
  { id: 'cert',     label: '职业资格考试', icon: '⚖️' },
  { id: 'language', label: '语言考试',    icon: '✈️' },
  { id: 'other',    label: '其他',        icon: '◇' },
];

const SECONDARY_GOALS: Record<GoalType, string[]> = {
  college:  ['理工类', '经管类', '医学类', '其他'],
  postgrad: ['理工类', '经管类', '医学类', '其他'],
  civil:    ['国考', '省考', '事业单位', '其他'],
  cert:     ['CPA·财会类', '法考·法律类', '教师资格证', '执医·医学类', '其他'],
  language: ['四六级', '雅思', '托福', '其他语言考试'],
  other:    ['理工类', '经管类', '医学类', '其他知识类', '语言类'],
};

const SUBJECTS_BY_GOAL: Record<GoalType, string[]> = {
  college:  ['高等数学', '大学物理', '线性代数', '概率论', '有机化学'],
  postgrad: ['数学一', '政治', '英语一', '专业课'],
  civil:    ['行政职业能力测验', '申论', '公共基础知识', '面试'],
  cert:     ['刑法', '民法', '行政法', '理论法', '商法', '诉讼法', '国际法'],
  language: ['词汇', '听力', '阅读', '写作', '口语'],
  other:    ['自定义科目'],
};

// Professional background — now collected in A1, removed from A2
const BACKGROUND_FIELDS: Record<GoalType, string[]> = {
  college:  ['学校', '专业'],
  postgrad: ['本科专业', '报考方向'],
  civil:    ['专业背景'],
  cert:     ['学习或从业方向'],
  language: [],
  other:    ['学习或从业方向'],
};

// Cohort counts by secondary goal — tiered aggregation, omit when below threshold
const COHORT_COUNTS: Record<string, string> = {
  '理工类':    '15,000+',
  '经管类':    '8,200+',
  '医学类':    '5,400+',
  '国考':      '28,000+',
  '省考':      '19,000+',
  '事业单位':  '7,600+',
  'CPA·财会类': '2,100+',
  '法考·法律类': '3,800+',
  '教师资格证':  '12,000+',
  '执医·医学类': '4,600+',
};


const SCORE_DEFAULTS: Record<GoalType, { target: string; total: string }> = {
  college:  { target: '60',  total: '100' },
  postgrad: { target: '90',  total: '150' },
  civil:    { target: '60',  total: '100' },
  cert:     { target: '60',  total: '100' },
  language: { target: '60',  total: '100' },
  other:    { target: '60',  total: '100' },
};

function getDefaultSpaceName(goalType: GoalType, detail: string): string {
  const label = PRIMARY_GOALS.find(g => g.id === goalType)?.label ?? '';
  if (detail && detail !== '其他') return `${label}·${detail}`;
  return `${label}备考`;
}

// ── Shared components ──────────────────────────────────────────────────────────

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex flex-col gap-1.5 items-center">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="rounded-full transition-all" style={{
          width:      i === current ? 6 : 5,
          height:     i === current ? 14 : 6,
          background: i === current ? BLUE : '#D8D8D8',
        }} />
      ))}
    </div>
  );
}

function ScreenWrapper({ children, onBack, totalSteps, currentStep }: {
  children: React.ReactNode; onBack?: () => void; totalSteps: number; currentStep: number;
}) {
  return (
    <div className="w-full h-full flex" style={{ background: BG, position: 'relative' }}>
      <div className="flex flex-col justify-start pt-5 pl-5 pr-2 flex-shrink-0" style={{ width: 44 }}>
        {onBack && (
          <button onClick={onBack} className="p-1.5 rounded-lg" style={{ background: '#F0F0F0' }}>
            <ArrowLeft size={16} color={T2} />
          </button>
        )}
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
      <div className="flex flex-col justify-center pr-5 pl-2 flex-shrink-0">
        <ProgressDots current={currentStep} total={totalSteps} />
      </div>
    </div>
  );
}

function CTAButton({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full py-3.5 rounded-full text-[15px] font-bold transition-all active:scale-[0.99]"
      style={{ background: disabled ? '#CCC' : PRIMARY, color: disabled ? '#888' : '#7A6400' }}
    >
      {children}
    </button>
  );
}

function ScreenTitle({ title, sub, subColor = BLUE }: { title: string; sub: string; subColor?: string }) {
  return (
    <div className="pt-6 pb-4 px-0">
      <h1 className="text-[22px] font-bold leading-tight mb-1.5" style={{ color: T1 }}>{title}</h1>
      <p className="text-[14px] font-medium" style={{ color: subColor }}>{sub}</p>
    </div>
  );
}

function StepBar({ active }: { active: 0 | 1 | 2 }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      {(['Set Goal', 'Add Materials', 'Prioritize'] as const).map((s, i) => (
        <React.Fragment key={s}>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{ background: i === active ? BLUE : '#EBEBEB', color: i === active ? '#fff' : '#AAA' }}>
              {i + 1}
            </div>
            <span className="text-[12px]" style={{ color: i === active ? BLUE : '#AAA' }}>{s}</span>
          </div>
          {i < 2 && <div className="flex-1 h-px" style={{ background: '#EBEBEB' }} />}
        </React.Fragment>
      ))}
    </div>
  );
}

// ── A1: Goal & Direction ───────────────────────────────────────────────────────

function A1Screen({ onNext }: { onNext: (goalType: GoalType, detail: string) => void }) {
  const [primaryGoal, setPrimaryGoal]     = useState<GoalType | null>(null);
  const [detail, setDetail]               = useState('');
  const [bgFields, setBgFields]           = useState(['', '']);
  const [showModal, setShowModal]         = useState(false);
  const [langConfirmed, setLangConfirmed] = useState(false);

  const isLanguage   = primaryGoal === 'language' || (primaryGoal === 'other' && detail === '语言类');
  const canProceed   = !!primaryGoal && !!detail && (!isLanguage || langConfirmed);
  const showFeedback = !!detail && !isLanguage;
  const cohortCount  = detail ? (COHORT_COUNTS[detail] ?? null) : null;
  const bgLabels     = primaryGoal ? BACKGROUND_FIELDS[primaryGoal] : [];

  const handlePrimary = (g: GoalType) => {
    if (g !== primaryGoal) { setDetail(''); setLangConfirmed(false); setBgFields(['', '']); }
    setPrimaryGoal(g);
  };

  const handleDetail = (val: string) => {
    setDetail(val);
    if ((primaryGoal === 'language' || (primaryGoal === 'other' && val === '语言类')) && val) setShowModal(true);
  };

  const inputBase: React.CSSProperties = {
    background: CARD, border: `1px solid ${BORDER}`, color: T2,
  };

  return (
    <div className="flex flex-col h-full px-5 relative">
      <div className="h-14 flex items-center gap-2 flex-shrink-0">
        <h1 className="text-[22px] font-semibold leading-tight" style={{ color: T1 }}>
          最近主要在准备什么？
        </h1>
      </div>
      <p className="text-[12px] -mt-1 mb-2" style={{ color: T3 }}>告诉我们你的方向，我们好为你准备更贴合的学习内容</p>

      {/* ── Two-column body ── */}
      <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>

        {/* Left: primary goal cards (3+2 grid) */}
        <div>
          <p className="text-[10.5px] font-semibold mb-2 uppercase tracking-wide" style={{ color: T4 }}>
            选择备考类型
          </p>
          <div className="grid grid-cols-3 gap-2">
            {PRIMARY_GOALS.map(p => (
              <button key={p.id} onClick={() => handlePrimary(p.id)}
                className="h-[62px] flex items-center justify-center gap-2 px-2 rounded-xl text-center transition-all"
                style={{
                  background: primaryGoal === p.id ? '#FFFBDE' : CARD,
                  border: `2px solid ${primaryGoal === p.id ? PRIMARY : BORDER}`,
                  boxShadow: primaryGoal === p.id ? '0 2px 8px rgba(253,199,0,0.18)' : 'none',
                }}>
                <span style={{ fontSize: 18 }}>{p.icon}</span>
                <span className="text-[12px] font-semibold leading-tight" style={{ color: T2 }}>
                  {p.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2.5 pb-1 pt-2.5" style={{ borderTop: `1px solid ${BORDER}` }}>

          {/* Secondary — native select, gated until primary chosen */}
          <div>
            <p className="text-[10.5px] font-semibold mb-1.5 uppercase tracking-wide" style={{ color: T4 }}>
              具体方向
            </p>
            <div className="flex flex-wrap gap-1.5">
              {primaryGoal && SECONDARY_GOALS[primaryGoal].map(opt => (
                <button key={opt} onClick={() => handleDetail(opt)}
                  className="px-3 py-1.5 rounded-lg text-[11.5px] font-medium"
                  style={{ background: detail === opt ? '#FFFBDE' : CARD, border: `1.5px solid ${detail === opt ? PRIMARY : BORDER}`, color: detail === opt ? '#7A6400' : T3 }}>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {showFeedback && cohortCount && (
            <div className="min-h-10 flex items-center gap-3 px-3 py-2 rounded-xl" style={{ background: '#FFF8D8', border: '1px solid #F6E69C' }}>
              <div className="flex -space-x-1.5">{[0, 1, 2].map(i => <span key={i} className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: ['#FDEA3B','#FFE98A','#FFF3BC'][i], border: '2px solid #FFF8D8' }}><Users size={11} color="#6B5900" /></span>)}</div>
              <span className="text-[11.5px]" style={{ color: '#574900' }}>已有 <strong className="text-[13px]">{cohortCount} 位同学</strong>正在准备「{PRIMARY_GOALS.find(g => g.id === primaryGoal)?.label} · {detail}」</span>
            </div>
          )}

          {/* Professional background — 1 or 2 paired short inputs, optional */}
          {primaryGoal && bgLabels.length > 0 && (
            <div>
              <p className="text-[10.5px] font-semibold mb-1.5 uppercase tracking-wide" style={{ color: T4 }}>
                专业背景
                <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 10 }}>
                  {' '}（选填）
                </span>
              </p>
              <div className={bgLabels.length > 1 ? 'flex gap-2' : ''}>
                {bgLabels.map((label, i) => (
                  <label key={label} className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-2.5" color="#999" />
                  <input
                    value={bgFields[i] ?? ''}
                    onChange={e => {
                      const f = [...bgFields]; f[i] = e.target.value; setBgFields(f);
                    }}
                    placeholder={`搜索或输入${label}`}
                    list={`onboarding-bg-${i}`}
                    className="w-full pl-8 pr-8 py-2 rounded-xl text-[12px] outline-none"
                    style={inputBase} />
                  <ChevronDown size={14} className="absolute right-3 top-2.5" color="#999" />
                  <datalist id={`onboarding-bg-${i}`}>
                    {(i === 0 ? ['北京大学','清华大学','复旦大学','上海交通大学','浙江大学'] : ['计算机科学与技术','软件工程','临床医学','工商管理','法学']).map(v => <option key={v} value={v} />)}
                  </datalist>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Feedback row */}
          {showFeedback && (
            <div className="space-y-1.5">
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl"
                style={{ background: '#F6FEF9', border: `1px solid #B7EFCF` }}>
                <Check size={13} color={GREEN} strokeWidth={2.5} className="flex-shrink-0 mt-0.5" />
                <span className="text-[12px] leading-relaxed" style={{ color: GREEN }}>
                  明白了，我们会据此为你准备更贴合的学习内容与练习。
                </span>
              </div>
            </div>
          )}

          {isLanguage && langConfirmed && (
            <div className="px-3 py-2.5 rounded-xl"
              style={{ background: '#FFFBDE', border: `1px solid #FFE562` }}>
              <span className="text-[12px]" style={{ color: '#7A6400' }}>
                已选择 {detail}，将使用自己的资料继续（暂无示例包）
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="pb-4 pt-2">
        <CTAButton onClick={() => onNext(primaryGoal!, detail)} disabled={!canProceed}>
          下一步：设置复习科目 →
        </CTAButton>
      </div>

      {/* Language warning modal — bottom sheet */}
      {showModal && (
        <div className="absolute inset-0 flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,0.45)', zIndex: 50 }}>
          <div className="w-full rounded-t-3xl px-6 pt-6 pb-8" style={{ background: CARD }}>
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-[17px] font-bold pr-4" style={{ color: T1 }}>
                当前版本暂未针对语言学习优化
              </h3>
              <button onClick={() => { setShowModal(false); setDetail(''); setLangConfirmed(false); }}>
                <X size={18} color={T4} />
              </button>
            </div>
            <p className="text-[13px] leading-relaxed mb-6" style={{ color: T3 }}>
              云记目前更适合需要理解、整理和记忆的知识类科目。四六级、雅思、托福等语言考试涉及词汇、听力、口语等专项训练，当前版本暂不能提供完整支持。
            </p>
            <button
              onClick={() => { setShowModal(false); setDetail(''); setLangConfirmed(false); }}
              className="w-full py-3.5 rounded-full text-[15px] font-bold mb-3"
              style={{ background: PRIMARY, color: '#7A6400' }}>
              返回选择其他类型
            </button>
            <button
              onClick={() => { setShowModal(false); setLangConfirmed(true); }}
              className="w-full py-3 rounded-full text-[14px]"
              style={{ background: '#F3F4F6', color: T3 }}>
              仍然继续
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── A2: Set Goal ──────────────────────────────────────────────────────────────

const FAMILIARITY = [
  { id: 'beginner',     icon: '○', label: '零基础',   sub: '系统从头学',  isDefault: false },
  { id: 'intermediate', icon: '◐', label: '学过一遍', sub: '需要巩固',    isDefault: true  },
  { id: 'advanced',     icon: '◕', label: '冲刺复习', sub: '查漏补缺',    isDefault: false },
  { id: 'custom',       icon: '⚙', label: '自定义',  sub: '掌握程度',    isDefault: false },
];
const CUSTOM_PCTS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[11px] font-semibold mb-1 uppercase tracking-wide" style={{ color: T4 }}>
      {children}
    </label>
  );
}

function A2Screen({ goalType, goalDetail, onNext, onBack }: {
  goalType: GoalType; goalDetail: string; onNext: () => void; onBack: () => void;
}) {
  const defaultScores = SCORE_DEFAULTS[goalType];
  const defaultDate = (() => {
    const d = new Date(); d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  })();
  const [spaceName, setSpaceName]     = useState(() => getDefaultSpaceName(goalType, goalDetail));
  const [subjects, setSubjects]       = useState<Set<string>>(() => new Set([SUBJECTS_BY_GOAL[goalType][0]]));
  const [examDate, setExamDate]       = useState(defaultDate);
  const [targetScore, setTargetScore] = useState(defaultScores.target);
  const [totalScore, setTotalScore]   = useState(defaultScores.total);
  const [familiarity, setFamiliarity] = useState('intermediate');
  const [customPct, setCustomPct]     = useState('50');
  const [lang, setLang]               = useState('简体中文');
  const [scoreError, setScoreError]   = useState('');

  const daysLeft = examDate
    ? Math.max(0, Math.ceil((new Date(examDate).getTime() - Date.now()) / 86400000))
    : null;

  const availSubjects = SUBJECTS_BY_GOAL[goalType];
  const canProceed = spaceName && examDate && targetScore && totalScore && familiarity && !scoreError;

  const toggleSubject = (s: string) => {
    const next = new Set(subjects); next.has(s) ? next.delete(s) : next.add(s); setSubjects(next);
  };
  const validateScore = (target: string, total: string) => {
    const t = parseFloat(target), tot = parseFloat(total);
    setScoreError(tot > 0 && t > 0 && t < tot * 0.6 ? '目标分数需 ≥ 总分的 60%' : '');
  };

  const inputCls = 'w-full px-3 py-2 rounded-xl text-[13px] outline-none';
  const inputStyle = (err?: boolean) => ({
    background: CARD, border: `1px solid ${err ? RED : BORDER}`, color: T2,
  });

  return (
    <div className="flex flex-col h-full px-5">
      <div className="pt-4 pb-1">
        <h1 className="text-[20px] font-bold leading-tight mb-1" style={{ color: T1 }}>设定你的目标</h1>
        <p className="text-[13px] font-medium" style={{ color: BLUE }}>一页填好，系统按考试日期倒排每天学什么</p>
      </div>
      <div className="mb-2"><StepBar active={0} /></div>

      <div className="flex-1 overflow-y-auto pb-2" style={{ scrollbarWidth: 'none' }}>
        <div className="grid grid-cols-2 gap-x-5">

          {/* ── LEFT COLUMN ── */}
          <div className="space-y-3 pr-4" style={{ borderRight: `1px solid ${BORDER}` }}>
            {/* 1. Space name */}
            <div>
              <FieldLabel>学习空间名称</FieldLabel>
              <input value={spaceName} onChange={e => setSpaceName(e.target.value)}
                placeholder="如「法考备考 2026」"
                className={inputCls} style={inputStyle()} />
            </div>

            {/* 2. Subjects */}
            <div>
              <FieldLabel>复习科目</FieldLabel>
              <div className="flex flex-wrap gap-1.5">
                {availSubjects.map(s => (
                  <button key={s} onClick={() => toggleSubject(s)}
                    className="px-2.5 py-1 rounded-full text-[12px] font-medium transition-all"
                    style={{
                      background: subjects.has(s) ? '#EAF3FF' : '#F3F4F6',
                      color:      subjects.has(s) ? BLUE : T3,
                      border:     `1px solid ${subjects.has(s) ? BLUE : 'transparent'}`,
                    }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Familiarity — 2×2 grid */}
            <div>
              <FieldLabel>当前熟悉度</FieldLabel>
              <div className="grid grid-cols-2 gap-1.5">
                {FAMILIARITY.map(f => (
                  <button key={f.id} onClick={() => setFamiliarity(f.id)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all relative"
                    style={{
                      background: familiarity === f.id ? '#FFFBDE' : CARD,
                      border: `1.5px solid ${familiarity === f.id ? PRIMARY : BORDER}`,
                    }}>
                    {f.isDefault && (
                      <span className="absolute top-1 right-1 px-1 rounded text-[8px] font-bold leading-tight"
                        style={{ background: '#F0F0F0', color: '#AAA' }}>默认</span>
                    )}
                    <span className="text-[15px] leading-none flex-shrink-0"
                      style={{ color: familiarity === f.id ? '#7A6400' : T4 }}>{f.icon}</span>
                    <div className="min-w-0">
                      <p className="text-[12px] font-semibold leading-tight truncate" style={{ color: T2 }}>{f.label}</p>
                      <p className="text-[10px] leading-tight" style={{ color: T4 }}>{f.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
              {familiarity === 'custom' && (
                <select value={customPct} onChange={e => setCustomPct(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl text-[13px] outline-none"
                  style={inputStyle()}>
                  {CUSTOM_PCTS.map(p => <option key={p} value={String(p)}>{p}%</option>)}
                </select>
              )}
            </div>

          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="space-y-3">
            {/* 3. Exam date */}
            <div>
              <FieldLabel>考试日期</FieldLabel>
              <input type="date" value={examDate}
                onChange={e => setExamDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={inputCls} style={inputStyle()} />
              {daysLeft !== null && (
                <p className="text-[11px] mt-0.5" style={{ color: BLUE }}>距考试还有 {daysLeft} 天</p>
              )}
            </div>

            {/* 4. Target / Total score — paired */}
            <div>
              <FieldLabel>目标分数 / 总分</FieldLabel>
              <div className="flex items-center gap-2">
                <input type="number" value={targetScore}
                  onChange={e => { setTargetScore(e.target.value); validateScore(e.target.value, totalScore); }}
                  placeholder="目标分" className={`${inputCls} flex-1`} style={inputStyle(!!scoreError)} />
                <span className="text-[13px] flex-shrink-0" style={{ color: T4 }}>/</span>
                <input type="number" value={totalScore}
                  onChange={e => { setTotalScore(e.target.value); validateScore(targetScore, e.target.value); }}
                  placeholder="总分" className={`${inputCls} flex-1`} style={inputStyle()} />
              </div>
              {scoreError && <p className="text-[11px] mt-0.5" style={{ color: RED }}>{scoreError}</p>}
            </div>

            {/* 6. Language */}
            <div>
              <FieldLabel>输出语种</FieldLabel>
              <select value={lang} onChange={e => setLang(e.target.value)}
                className={inputCls} style={inputStyle()}>
                <option>简体中文</option>
                <option>English</option>
                <option>繁體中文</option>
              </select>
              <p className="text-[11px] mt-0.5" style={{ color: '#BBB' }}>用于后续练习题与 AI Tutor 回复</p>
            </div>
          </div>
        </div>
      </div>

      <div className="pb-4 pt-2">
        <CTAButton onClick={onNext} disabled={!canProceed}>下一步：添加资料 →</CTAButton>
      </div>
    </div>
  );
}

/// ── A3: Add Materials ──────────────────────────────────────────────────────────

const A3_FOLDERS = [
  { id: 'root',          name: 'All Notes',   level: 0, parentId: null },
  { id: 'law',           name: '法律类',       level: 1, parentId: 'root' },
  { id: 'criminal',      name: '刑法',         level: 2, parentId: 'law' },
  { id: 'civil',         name: '民法',         level: 2, parentId: 'law' },
  { id: 'admin',         name: '行政法',       level: 2, parentId: 'law' },
  { id: 'uncategorized', name: '未分类',       level: 1, parentId: 'root' },
];

const A3_NOTES: Record<string, { id: string; name: string; type: 'internal' | 'external'; size?: string }[]> = {
  root:          [],
  law:           [],
  criminal:      [
    { id: 'n1', name: '受贿罪构成与既遂', type: 'internal' },
    { id: 'n2', name: '斡旋受贿专题笔记', type: 'internal' },
    { id: 'n3', name: '刑法分论讲义.pdf', type: 'external', size: '2.4 MB' },
  ],
  civil:         [
    { id: 'n4', name: '民法总则笔记',      type: 'internal' },
    { id: 'n5', name: '物权法精讲.pdf',    type: 'external', size: '1.8 MB' },
  ],
  admin:         [
    { id: 'n6', name: '行政诉讼法笔记',    type: 'internal' },
  ],
  uncategorized: [
    { id: 'n7', name: '备考杂记汇总',      type: 'internal' },
  ],
};

function A3Screen({ hasPreset, onNext, onBack }: {
  hasPreset: boolean; onNext: (source: 'REAL_UPLOAD' | 'SAMPLE') => void; onBack: () => void;
}) {
  const [selected, setSelected]         = useState<'REAL_UPLOAD' | 'SAMPLE'>('REAL_UPLOAD');
  const [uploadTab, setUploadTab]        = useState<'internal' | 'external'>('internal');
  const [activeFolder, setActiveFolder]  = useState('criminal');
  const [checked, setChecked]            = useState<Set<string>>(new Set(['n1', 'n2', 'n3']));
  const [expandedFolders, setExpanded]   = useState<Set<string>>(new Set(['root', 'law']));

  const toggleCheck = (id: string) => {
    const next = new Set(checked); next.has(id) ? next.delete(id) : next.add(id); setChecked(next);
  };
  const toggleFolder = (id: string) => {
    const next = new Set(expandedFolders); next.has(id) ? next.delete(id) : next.add(id); setExpanded(next);
  };

  const allCheckedNotes = Object.values(A3_NOTES).flat().filter(n => checked.has(n.id));

  return (
    <div className="flex flex-col h-full px-5">
      <div className="pt-3 pb-1 flex items-start justify-between">
        <div>
          <h1 className="text-[19px] font-bold leading-tight mb-0.5" style={{ color: T1 }}>添加你的学习资料</h1>
          <p className="text-[12px] font-medium" style={{ color: BLUE }}>
            {selected === 'SAMPLE' ? '正在使用与你目标匹配的示例包' : '默认使用你的资料，AI 会提取并组织知识点'}
          </p>
        </div>
        {hasPreset && (
          <button onClick={() => setSelected(selected === 'SAMPLE' ? 'REAL_UPLOAD' : 'SAMPLE')}
            className="px-3 py-1.5 rounded-full text-[11px] font-semibold"
            style={{ background: selected === 'SAMPLE' ? '#F3F4F6' : '#EAF3FF', color: selected === 'SAMPLE' ? T3 : BLUE }}>
            {selected === 'SAMPLE' ? '改回我的资料' : '改用示例快速体验'}
          </button>
        )}
      </div>
      <div className="mb-2"><StepBar active={1} /></div>

      {/* ── Expanded file browser (Card A selected) ── */}
      {selected === 'REAL_UPLOAD' && (
        <div className="flex-1 flex flex-col overflow-hidden rounded-xl border" style={{ borderColor: BORDER }}>
          {/* Tab bar */}
          <div className="flex border-b" style={{ borderColor: BORDER }}>
            {(['internal', 'external'] as const).map(tab => (
              <button key={tab} onClick={() => setUploadTab(tab)}
                className="flex-1 py-2 text-[12px] font-semibold transition-all"
                style={{
                  color: uploadTab === tab ? BLUE : T4,
                  borderBottom: uploadTab === tab ? `2px solid ${BLUE}` : '2px solid transparent',
                  background: 'transparent',
                }}>
                {tab === 'internal' ? '应用内笔记' : '外部上传'}
              </button>
            ))}
          </div>

          {uploadTab === 'internal' ? (
            <div className="flex flex-1 overflow-hidden">
              {/* Folder tree */}
              <div className="overflow-y-auto py-1.5" style={{ width: 148, borderRight: `1px solid ${BORDER}`, scrollbarWidth: 'none' }}>
                {A3_FOLDERS.filter(f => {
                  if (f.level === 0) return true;
                  if (f.level === 1) return expandedFolders.has('root');
                  if (f.level === 2) return expandedFolders.has(f.parentId || '');
                  return false;
                }).map(f => (
                  <button key={f.id} onClick={() => { setActiveFolder(f.id); if (f.id !== 'root') toggleFolder(f.id); }}
                    className="w-full flex items-center gap-1.5 px-3 py-1.5 text-left transition-colors"
                    style={{
                      paddingLeft: 8 + f.level * 14,
                      background: activeFolder === f.id ? '#EAF3FF' : 'transparent',
                      color: activeFolder === f.id ? BLUE : T3,
                    }}>
                    <span className="text-[10px]">
                      {f.id !== 'root' && A3_NOTES[f.id]?.length > 0 ? (expandedFolders.has(f.id) ? '▾' : '▸') : '·'}
                    </span>
                    <span className="text-[12px] font-medium truncate">{f.name}</span>
                    {A3_NOTES[f.id]?.length > 0 && (
                      <span className="ml-auto text-[10px]" style={{ color: '#BBB' }}>{A3_NOTES[f.id].length}</span>
                    )}
                  </button>
                ))}
              </div>

              {/* File list */}
              <div className="flex-1 overflow-y-auto py-1.5 px-2" style={{ scrollbarWidth: 'none' }}>
                {(A3_NOTES[activeFolder] || []).length === 0 ? (
                  <p className="text-[12px] text-center mt-8" style={{ color: T4 }}>此文件夹为空</p>
                ) : (A3_NOTES[activeFolder] || []).map(note => (
                  <label key={note.id} className="flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors"
                    style={{ background: checked.has(note.id) ? '#FFFBDE' : 'transparent' }}>
                    <span onClick={() => toggleCheck(note.id)}
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                      style={{
                        background: checked.has(note.id) ? PRIMARY : '#F3F4F6',
                        border: `1.5px solid ${checked.has(note.id) ? '#CCA800' : BORDER}`,
                      }}>
                      {checked.has(note.id) && <span className="text-[10px] font-bold" style={{ color: '#7A6400' }}>✓</span>}
                    </span>
                    <span className="flex-1 text-[12px] font-medium truncate" style={{ color: T2 }}>{note.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: note.type === 'internal' ? '#EAF3FF' : '#F3F4F6', color: note.type === 'internal' ? BLUE : T4 }}>
                      {note.type === 'internal' ? '笔记' : note.size || '外部'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6">
              <div className="w-full rounded-xl flex flex-col items-center gap-2 py-5"
                style={{ background: '#F8F8F8', border: `2px dashed ${BORDER}` }}>
                <Upload size={20} color="#AAA" />
                <p className="text-[12px] text-center" style={{ color: T4 }}>PDF / Word / 图片 / 录音 / 链接</p>
                <span className="px-4 py-1.5 rounded-full text-[12px] font-medium cursor-pointer"
                  style={{ background: PRIMARY, color: '#7A6400' }}>
                  选择文件
                </span>
              </div>
            </div>
          )}

          {/* Selected resources */}
          {allCheckedNotes.length > 0 && (
            <div className="border-t" style={{ borderColor: BORDER }}>
              <div className="flex items-center gap-1.5 px-3 py-1.5" style={{ background: '#FAFAFA' }}>
                <span className="text-[11px] font-semibold" style={{ color: T4 }}>已选资源</span>
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: BLUE, color: '#fff' }}>{allCheckedNotes.length}</span>
              </div>
              <div className="overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                <div className="flex gap-2 px-3 pb-2" style={{ width: 'max-content' }}>
                  {allCheckedNotes.map(n => (
                    <div key={n.id} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg flex-shrink-0"
                      style={{ background: CARD, border: `1px solid ${BORDER}` }}>
                      <FileText size={12} color={n.type === 'internal' ? BLUE : T4} />
                      <span className="text-[11px] font-medium max-w-[120px] truncate" style={{ color: T2 }}>{n.name}</span>
                      <button onClick={() => toggleCheck(n.id)} className="ml-1 leading-none"
                        style={{ color: '#BBB', fontSize: 14 }}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {selected === 'SAMPLE' && (
        <div className="flex-1 rounded-2xl p-5 flex items-center gap-4" style={{ background: '#FFFBDE', border: `1.5px solid ${PRIMARY}` }}>
          <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: CARD }}><FileText color={BLUE} /></div>
          <div className="flex-1">
            <p className="text-[15px] font-bold" style={{ color: T1 }}>刑法分论 · 贿赂渎职示例包</p>
            <p className="text-[12px] mt-1" style={{ color: T3 }}>3 份资料已准备好，可直接确认优先级并体验完整学习流程。</p>
          </div>
          <Check size={20} color={GREEN} />
        </div>
      )}

      <div className="pb-4 pt-1.5">
        <CTAButton onClick={() => onNext(selected)} disabled={selected === 'REAL_UPLOAD' && checked.size === 0}>
          下一步：确认优先级 →
        </CTAButton>
      </div>
    </div>
  );
}

// ── A4: Prioritize ────────────────────────────────────────────────────────────

type PriorityId = 'exam' | 'high' | 'past' | 'routine';
type PriorityResource = { id: number; name: string; type: string; priority: PriorityId };
const PRIORITIES: { id: PriorityId; name: string; en: string; hint: string; color: string; bg: string }[] = [
  { id: 'exam', name: '冲刺必看', en: 'Exam Leak', hint: '考前最终复习与最新资料', color: '#E5484D', bg: '#FFF5F5' },
  { id: 'high', name: '高频重点', en: 'High Yield', hint: '核心概念与高频考点', color: '#E98B12', bg: '#FFF8EF' },
  { id: 'past', name: '历年真题', en: 'Past Papers', hint: '历年试题与模拟题', color: '#D2A400', bg: '#FFFBE8' },
  { id: 'routine', name: '常规资料', en: 'Routine', hint: '补充阅读与参考资料', color: '#A8ADB4', bg: '#F7F8FA' },
];
const RESOURCES_DATA: PriorityResource[] = [
  { id: 1, name: '刑法分论·贿赂渎职.pdf', type: 'pdf', priority: 'exam' },
  { id: 2, name: '考前重点公式与法条.pdf', type: 'pdf', priority: 'exam' },
  { id: 3, name: '刑法总论讲义.pptx', type: 'pptx', priority: 'high' },
  { id: 4, name: '斡旋受贿专题笔记', type: 'note', priority: 'high' },
  { id: 5, name: '司法考试真题 2024.docx', type: 'docx', priority: 'past' },
  { id: 6, name: '补充案例阅读.pdf', type: 'pdf', priority: 'routine' },
];

function A4Screen({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [resources, setResources] = useState(RESOURCES_DATA);
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [removed, setRemoved] = useState<PriorityResource | null>(null);
  const moveResource = (id: number, priority: PriorityId, beforeId?: number) => {
    setResources(prev => {
      const moving = prev.find(r => r.id === id);
      if (!moving) return prev;
      const rest = prev.filter(r => r.id !== id);
      const next = { ...moving, priority };
      if (!beforeId) return [...rest, next];
      const at = rest.findIndex(r => r.id === beforeId);
      return at < 0 ? [...rest, next] : [...rest.slice(0, at), next, ...rest.slice(at)];
    });
  };
  const removeResource = (resource: PriorityResource) => {
    setResources(prev => prev.filter(r => r.id !== resource.id));
    setRemoved(resource);
  };

  return (
    <div className="flex flex-col h-full px-5">
      <div className="pt-3 pb-1"><h1 className="text-[19px] font-bold" style={{ color: T1 }}>确认资料优先级</h1><p className="text-[12px]" style={{ color: BLUE }}>拖拽可调整级别，也可在级别内重新排序</p></div>
      <StepBar active={2} />
      <div className="rounded-lg px-3 py-2 mb-2 text-[11px]" style={{ background: '#EAF3FF', color: BLUE }}>优先级与多来源命中次数共同决定知识点星级。每份资料已自动归入一个级别。</div>
      <div className="flex-1 overflow-y-auto pb-3 space-y-2" style={{ scrollbarWidth: 'none' }}>
        {PRIORITIES.map(group => {
          const items = resources.filter(r => r.priority === group.id);
          return (
            <div key={group.id} className="rounded-xl overflow-hidden"
              onDragOver={e => e.preventDefault()}
              onDrop={() => { if (draggedId !== null) moveResource(draggedId, group.id); setDraggedId(null); }}
              style={{ border: `1.5px solid ${group.color}55`, background: CARD, minHeight: 66 }}>
              <div className="flex items-center gap-2 px-3 py-2" style={{ background: group.bg }}>
                <span className="w-3 h-3 rounded-full" style={{ background: group.color }} />
                <span className="text-[12px] font-bold" style={{ color: T2 }}>{group.name}</span>
                <span className="text-[10px]" style={{ color: T4 }}>{group.en} · {group.hint}</span>
                <span className="ml-auto text-[10px]" style={{ color: T4 }}>{items.length} 项</span>
              </div>
              {items.map((r, index) => (
                <div key={r.id} draggable onDragStart={() => setDraggedId(r.id)}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.stopPropagation(); if (draggedId !== null) moveResource(draggedId, group.id, r.id); setDraggedId(null); }}
                  className="flex items-center gap-2.5 px-3 py-2 cursor-grab"
                  style={{ borderTop: index >= 0 ? `1px solid ${BORDER}` : undefined, opacity: draggedId === r.id ? .45 : 1 }}>
                  <GripVertical size={15} color="#B6BBC2" /><FileText size={14} color={group.color} />
                  <span className="flex-1 text-[12px]" style={{ color: T2 }}>{r.name}</span>
                  <select value={r.priority} onChange={e => moveResource(r.id, e.target.value as PriorityId)}
                    className="text-[10px] rounded-lg px-1.5 py-1" style={{ border: `1px solid ${BORDER}`, color: T3 }}>
                    {PRIORITIES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <button title="移除资源" onClick={() => removeResource(r)} className="p-1"><Trash2 size={13} color="#BBB" /></button>
                </div>
              ))}
            </div>
          );
        })}
      </div>
      {removed && <div className="flex items-center gap-2 px-3 py-2 mb-2 rounded-lg text-[11px]" style={{ background: '#252525', color: '#fff' }}><span className="flex-1">已从学习空间移除「{removed.name}」</span><button onClick={() => { setResources(prev => [...prev, removed]); setRemoved(null); }} className="flex items-center gap-1" style={{ color: PRIMARY }}><RotateCcw size={12} />撤销</button></div>}
      <div className="pb-4 pt-1">
        <CTAButton onClick={onNext} disabled={resources.length === 0}>Analyze and Create →</CTAButton>
      </div>
    </div>
  );
}

// ── A5: Extraction Loading + Demo Chain (B3→B7→C1→C2) ────────────────────────

type A5SubPhase = 'loading' | 'B2' | 'B3' | 'B4' | 'B5' | 'B5S' | 'B6' | 'B65' | 'B7' | 'C1' | 'C2' | 'done';
const DEMO_PHASES: A5SubPhase[] = ['B2', 'B3', 'B4', 'B5', 'B5S', 'B6', 'B65', 'B7', 'C1', 'C2'];

function A5DemoBar({ phase }: { phase: A5SubPhase }) {
  const idx = DEMO_PHASES.indexOf(phase);
  if (idx < 0) return null;
  return (
    <div className="flex items-center gap-1.5 px-6 pt-3 pb-0 justify-center">
      {DEMO_PHASES.map((_, i) => (
        <div key={i} className="rounded-full transition-all"
          style={{ width: i === idx ? 16 : 6, height: 4, background: i <= idx ? BLUE : '#D0D0D0' }} />
      ))}
    </div>
  );
}

function A5Screen({ hasPreset, isStem, onNext }: { hasPreset: boolean; isStem: boolean; onNext: () => void }) {
  const [subPhase, setSubPhase]   = useState<A5SubPhase>('loading');
  const [progress, setProgress]   = useState(0);
  const [dotCount, setDotCount]   = useState(0);
  const [planChoice, setPlanChoice] = useState<'year' | 'month'>('year');
  const [showNotReadyModal, setShowNotReadyModal] = useState(false);

  // Animated dots
  useEffect(() => {
    const id = setInterval(() => setDotCount(c => (c + 1) % 4), 500);
    return () => clearInterval(id);
  }, []);

  // Loading progress animation
  useEffect(() => {
    if (subPhase !== 'loading') return;
    const steps = [
      { target: 20, delay: 350 }, { target: 38, delay: 600 },
      { target: 55, delay: 500 }, { target: 72, delay: 700 },
      { target: 88, delay: 500 }, { target: 100, delay: 500 },
    ];
    let cur = 0;
    let tid: ReturnType<typeof setTimeout>;
    const run = () => {
      if (cur >= steps.length) {
        // When loading completes: preset → show demo; no-preset → done
        if (hasPreset) {
          setTimeout(() => setSubPhase('B2'), 400);
        } else {
          setTimeout(() => onNext(), 600);
        }
        return;
      }
      const { target, delay } = steps[cur++];
      setProgress(target);
      tid = setTimeout(run, delay);
    };
    tid = setTimeout(run, 500);
    return () => clearTimeout(tid);
  }, [subPhase]);

  const advanceDemo = () => {
    const idx = DEMO_PHASES.indexOf(subPhase);
    if (idx >= 0 && idx < DEMO_PHASES.length - 1) {
      const nextPhase = DEMO_PHASES[idx + 1];
      setSubPhase(nextPhase === 'B5S' && !isStem ? 'B6' : nextPhase);
    } else {
      // After C2 — simulate extraction check: assume done for demo
      onNext();
    }
  };

  const dots = '.'.repeat(dotCount);

  if (subPhase === 'B2') {
    return (
      <div className="flex flex-col h-full">
        <A5DemoBar phase="B2" />
        <div className="flex flex-col flex-1 px-6 overflow-hidden">
          <ScreenTitle title="零散知识点，自动连成体系" sub="章节关系和知识结构，一眼看清" />
          <B2Inner onNext={advanceDemo} />
        </div>
      </div>
    );
  }

  // ── B3: Star Map (dark full-screen overlay) ────────────────────────────────
  if (subPhase === 'B3') {
    return (
      <div style={{ position: 'absolute', inset: 0, zIndex: 50, background: '#1B1B1B', display: 'flex', flexDirection: 'column' }}>
        <A5DemoBar phase="B3" />
        <B3Inner onNext={advanceDemo} />
      </div>
    );
  }

  // ── B4: Flashcard ─────────────────────────────────────────────────────────
  if (subPhase === 'B4') {
    return (
      <div className="flex flex-col h-full">
        <A5DemoBar phase="B4" />
        <div className="flex flex-col flex-1 px-6 overflow-hidden">
          <ScreenTitle title="不是让你背，是先问你会不会" sub="每个知识点，先给你一张闪卡" />
          <B4Inner onNext={advanceDemo} />
        </div>
      </div>
    );
  }

  // ── B5: Question Types ────────────────────────────────────────────────────
  if (subPhase === 'B5') {
    return (
      <div className="flex flex-col h-full">
        <A5DemoBar phase="B5" />
        <div className="flex flex-col flex-1 px-6 overflow-hidden">
          <ScreenTitle title="一个知识点，用不同方式练到会" sub="填空 · 判断 · 多选 · 简答，自动生成真实解析" />
          <B5Inner onNext={advanceDemo} />
        </div>
      </div>
    );
  }

  if (subPhase === 'B5S') {
    return (
      <div className="flex flex-col h-full">
        <A5DemoBar phase="B5S" />
        <div className="flex flex-col flex-1 px-6 overflow-hidden">
          <ScreenTitle title="计算题，也能随手打草稿" sub="草稿本跟着练习走，不遮挡题目" />
          <ScratchpadDemo onNext={advanceDemo} />
        </div>
      </div>
    );
  }

  // ── B6: AI tutoring ───────────────────────────────────────────────────────
  if (subPhase === 'B6') {
    return (
      <div className="flex flex-col h-full">
        <A5DemoBar phase="B6" />
        <div className="flex flex-col flex-1 px-6 overflow-hidden">
          <ScreenTitle title="不只给答案，自动带你学会" sub="识别错因 · 继续追问 · 自动进入强化学习" />
          <B6Inner onNext={advanceDemo} />
        </div>
      </div>
    );
  }

  if (subPhase === 'B65') {
    return (
      <div className="flex flex-col h-full">
        <A5DemoBar phase="B65" />
        <div className="flex flex-col flex-1 px-6 overflow-hidden">
          <ScreenTitle title="每个答案，都能找到出处" sub="直接标记来源，也能打开最新原笔记继续补记" />
          <TracebackDemo onNext={advanceDemo} />
        </div>
      </div>
    );
  }

  // ── B7: Report + mock exam close ──────────────────────────────────────────
  if (subPhase === 'B7') {
    return (
      <div className="flex flex-col h-full">
        <A5DemoBar phase="B7" />
        <div className="flex flex-col flex-1 px-6 overflow-hidden">
          <ScreenTitle title="知道学到哪，也知道接下来补什么" sub="学习报告与模考结果，自动变成下一步行动" />
          <B7Inner onNext={advanceDemo} />
        </div>
      </div>
    );
  }

  // ── C1: Social Proof ──────────────────────────────────────────────────────
  if (subPhase === 'C1') {
    return (
      <div className="flex flex-col h-full">
        <A5DemoBar phase="C1" />
        <div className="flex flex-col flex-1 px-6 overflow-y-auto">
          <div className="pt-4 pb-3 text-center">
            <h1 className="text-[22px] font-bold mb-1" style={{ color: T1 }}>很多人，已经用云记把资料真正学会</h1>
            <p className="text-[14px] font-medium" style={{ color: BLUE }}>从大学课程到考研、法考和职业考试</p>
          </div>
          <div className="space-y-4 pb-4">
            <div className="rounded-2xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[32px] font-bold" style={{ color: T1 }}>4.9</span>
                <div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} fill="#FFE562" color="#FFE562" />
                    ))}
                  </div>
                  <p className="text-[12px]" style={{ color: T4 }}>App Store · 1,200+ 评分</p>
                </div>
              </div>
              <div className="flex justify-between pb-3 mb-3" style={{ borderBottom: `1px solid ${BORDER}` }}>
                {['100K+ 下载', '4.9 评分', '50+ 国家'].map(s => (
                  <div key={s} className="text-center">
                    <p className="text-[13px] font-semibold" style={{ color: T1 }}>{s.split(' ')[0]}</p>
                    <p className="text-[11px]" style={{ color: T4 }}>{s.split(' ').slice(1).join(' ')}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ['林同学 · 大三 / 理工类课程', '讲义丢进去就变成知识结构，复习前终于不用再手动整理。'],
                  ['陈同学 · 考研 / 专业课复习', '简答题会提示我漏掉的关键词，答错后还会换个角度继续问。'],
                  ['周同学 · 法考 / 刑法', '星图让我很直观地看到哪些章节真的掌握了。'],
                  ['王同学 · 教资 / 冲刺', '薄弱点会自动排进后面的练习，不用自己反复做计划。'],
                ].map(([name, quote], i) => (
                  <div key={name} className="rounded-xl p-3" style={{ background: '#F7F7F7' }}>
                    <div className="flex items-center gap-2 mb-1.5"><span className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold" style={{ background: ['#FFE6D5','#DDEBFF','#E4F5E8','#F1E3FF'][i] }}>{name[0]}</span><p className="text-[10px] font-semibold" style={{ color: T3 }}>{name}</p></div>
                    <p className="text-[11px] leading-relaxed" style={{ color: T2 }}>{quote}</p>
                  </div>
                ))}
              </div>
            </div>
            <button className="w-full text-center text-[11px]" style={{ color: BLUE }}>隐私与 AI 服务说明</button>
          </div>
          <div className="pb-5 pt-1">
            <CTAButton onClick={advanceDemo}>继续 →</CTAButton>
          </div>
        </div>
      </div>
    );
  }

  // ── C2: Paywall (soft wall — can skip) ────────────────────────────────────
  if (subPhase === 'C2') {
    return (
      <div className="flex flex-col h-full">
        <A5DemoBar phase="C2" />
        <div className="flex flex-col flex-1 px-6 overflow-hidden">
          <div className="pt-4 pb-3">
            <p className="text-[11px] text-center mb-1" style={{ color: T4 }}>你刚才体验了一个章节的完整学习流程</p>
            <h1 className="text-[22px] font-bold text-center" style={{ color: T1 }}>从一堆资料，到真正掌握</h1>
            <p className="text-[12px] text-center mt-1" style={{ color: BLUE }}>升级后，用同样的方式学习你自己的全部资料</p>
          </div>
          <div className="flex-1 overflow-y-auto pb-2">
            <div className="flex gap-3 mb-3">
              {[
                { key: 'year',  title: '年度方案', price: '¥128/年', sub: '约¥10.7/月', badge: '最超值' },
                { key: 'month', title: '月度方案', price: '¥18/月',  sub: '',             badge: '' },
              ].map(p => (
                <button key={p.key} onClick={() => setPlanChoice(p.key as 'year' | 'month')}
                  className="flex-1 rounded-2xl p-4 text-left relative transition-all"
                  style={{
                    background: planChoice === p.key ? '#FFFBDE' : CARD,
                    border: `2px solid ${planChoice === p.key ? PRIMARY : BORDER}`,
                  }}>
                  {p.badge && (
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                      style={{ background: PRIMARY, color: '#7A6400' }}>{p.badge}</span>
                  )}
                  <p className="text-[14px] font-bold" style={{ color: T1 }}>{p.title}</p>
                  <p className="text-[18px] font-bold mt-1" style={{ color: T1 }}>{p.price}</p>
                  {p.sub && <p className="text-[12px]" style={{ color: T4 }}>{p.sub}</p>}
                </button>
              ))}
            </div>
            <div className="rounded-xl p-4 space-y-2" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
              {[
                '省下整理时间：资料自动拆成知识点、组织结构',
                '真正学会：多题型练习、答错继续追问并自动强化',
                '知道下一步：星图展示状态，薄弱点自动安排复习和模考',
              ].map((v, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Check size={14} color={GREEN} className="mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                  <span className="text-[13px]" style={{ color: T2 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="pb-4 pt-2 space-y-2">
            <CTAButton onClick={advanceDemo}>开始系统掌握我的知识点</CTAButton>
            <button onClick={advanceDemo} className="w-full text-center text-[13px]" style={{ color: T4 }}>
              暂时免费使用
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Loading phase (default) ───────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full px-6 justify-between">
      <div />
      <div className="flex flex-col items-center gap-6 py-8">
        <div className="relative w-20 h-20 flex items-center justify-center">
          <svg viewBox="0 0 80 80" className="absolute inset-0 w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="40" cy="40" r="34" fill="none" stroke="#EBEBEB" strokeWidth="5" />
            <circle cx="40" cy="40" r="34" fill="none" stroke={BLUE} strokeWidth="5"
              strokeDasharray={`${2 * Math.PI * 34 * progress / 100} 999`}
              style={{ transition: 'stroke-dasharray 0.6s ease' }} />
          </svg>
          <span className="text-[28px] z-10"
            style={{ display: 'inline-block', animation: 'spin 2s linear infinite' }}>✦</span>
        </div>
        <div className="text-center">
          <h1 className="text-[20px] font-bold mb-2" style={{ color: T1 }}>
            正在为你生成知识点{dots}
          </h1>
          <p className="text-[13px]" style={{ color: T3 }}>
            {hasPreset ? '真实提取后台并行，先体验一下效果' : '正在分析资料结构，请稍候…'}
          </p>
        </div>
        <div className="w-full space-y-2 max-w-xs">
          {[
            { label: '解析文档结构',    pct: 20 },
            { label: '提取核心概念',    pct: 38 },
            { label: '生成知识点',      pct: 55 },
            { label: '计算优先级权重',  pct: 72 },
            { label: '构建知识关联图',  pct: 88 },
            { label: '学习计划生成完毕', pct: 100 },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all"
              style={{
                background: progress >= s.pct ? '#F6FEF9' : '#F3F4F6',
                border: `1px solid ${progress >= s.pct ? '#B7EFCF' : BORDER}`,
              }}>
              <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: progress >= s.pct ? GREEN : '#DDD' }}>
                {progress >= s.pct && <Check size={10} color="#fff" strokeWidth={3} />}
              </div>
              <span className="text-[13px]" style={{ color: progress >= s.pct ? T2 : T4 }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="pb-6">
        <button className="w-full py-3.5 rounded-full text-[15px] font-bold"
          style={{ background: '#F3F4F6', color: T4 }} disabled>
          正在生成{dots}
        </button>
      </div>
    </div>
  );
}

// ── LCG RNG (seeded, deterministic) ──────────────────────────────────────────

function lcgRng(seed: number) {
  let s = seed >>> 0;
  return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
}

function B2Inner({ onNext }: { onNext: () => void }) {
  const branches = [
    { title: '受贿罪构成', items: ['主体身份', '职务便利', '财物控制'] },
    { title: '斡旋受贿', items: ['地位影响', '第三人谋利', '收受财物'] },
    { title: '既遂判断', items: ['实际控制', '财物交付'] },
  ];
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex justify-end mb-2"><span className="px-3 py-1 rounded-full text-[11px] font-semibold" style={{ background: '#EAF3FF', color: BLUE }}>当前：思维导图</span></div>
      <div className="flex-1 relative rounded-2xl overflow-hidden flex items-center justify-center" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-3 rounded-xl text-[14px] font-bold z-10" style={{ background: PRIMARY, color: '#6B5900' }}>贿赂犯罪</div>
        <div className="grid grid-cols-3 gap-20 w-[88%]">
          {branches.map((branch, index) => (
            <div key={branch.title} className={`flex flex-col gap-2 ${index === 1 ? 'mt-28' : index === 2 ? 'mt-4' : ''}`}>
              <div className="rounded-xl px-3 py-2 text-[12px] font-semibold text-center" style={{ background: '#EAF3FF', color: BLUE, border: '1px solid #BEDAFF' }}>{branch.title}</div>
              {branch.items.map(item => <div key={item} className="rounded-lg px-2 py-1.5 text-[11px] text-center" style={{ background: '#F7F7F7', color: T3, border: `1px solid ${BORDER}` }}>{item}</div>)}
            </div>
          ))}
        </div>
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 300">
          <path d="M400 150 C300 150 250 70 130 70 M400 150 C400 210 400 225 400 245 M400 150 C500 150 560 90 680 90" fill="none" stroke="#B9CEE8" strokeWidth="2" />
        </svg>
      </div>
      <p className="text-[11px] text-center mt-2" style={{ color: T4 }}>下一步，用同一批知识点查看掌握状态</p>
      <div className="pb-5 pt-2"><CTAButton onClick={onNext}>下一步：看看掌握状态 →</CTAButton></div>
    </div>
  );
}

// ── B3 inner (used inside A5 demo chain) ──────────────────────────────────────

function B3Inner({ onNext }: { onNext: () => void }) {
  const [newLit, setNewLit] = useState(0);

  const stars = useMemo(() => {
    const r = lcgRng(42);
    return Array.from({ length: 220 }, (_, i) => ({
      x: r() * 92 + 4, y: r() * 88 + 6,
      radius: r() * 2 + 0.5,
      opacity: r() * 0.13 + 0.03,
      cat: i < 46 ? 'mastered' : i < 54 ? 'new' : i < 110 ? 'learning' : 'dust',
    }));
  }, []);

  const connections = useMemo(() => {
    const lit = stars.filter(s => s.cat === 'mastered').slice(0, 38);
    const pairs: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
    const seen = new Set<string>();
    for (let i = 0; i < lit.length; i++) {
      const dists = lit
        .map((s, j) => ({ j, d: Math.hypot(lit[i].x - s.x, lit[i].y - s.y) }))
        .filter(({ j, d }) => j !== i && d < 16)
        .sort((a, b) => a.d - b.d).slice(0, 3);
      for (const { j } of dists) {
        const key = `${Math.min(i, j)}-${Math.max(i, j)}`;
        if (!seen.has(key)) {
          seen.add(key);
          pairs.push({ x1: lit[i].x, y1: lit[i].y, x2: lit[j].x, y2: lit[j].y });
        }
      }
    }
    return pairs;
  }, [stars]);

  useEffect(() => {
    let n = 0;
    const id = setInterval(() => { n = Math.min(n + 1, 8); setNewLit(n); if (n >= 8) clearInterval(id); }, 220);
    return () => clearInterval(id);
  }, []);

  const masteredStars = stars.filter(s => s.cat === 'mastered');
  const dustStars     = stars.filter(s => s.cat === 'dust');

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="px-6 pt-4 pb-2 flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold" style={{ color: '#EDEDED' }}>你的知识，连成一张星图</h1>
          <p className="text-[13px] font-medium" style={{ color: BLUE }}>学会一个，点亮一颗</p>
        </div>
        <div className="text-right">
          <p className="text-[12px]" style={{ color: '#888' }}>本周新点亮 <span style={{ color: '#FFE562' }}>8 颗</span></p>
          <p className="text-[12px]" style={{ color: '#888' }}>54% 已亮</p>
        </div>
      </div>
      <div className="flex-1 relative overflow-hidden mx-6 rounded-2xl" style={{ background: '#111116', minHeight: 0 }}>
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0 }}>
          {dustStars.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.radius * 0.4} fill="#FFFFFF" opacity={s.opacity} />
          ))}
          {connections.map((c, i) => (
            <line key={i} x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2}
              stroke="#FFE090" strokeWidth="0.18" opacity="0.22" strokeLinecap="round" />
          ))}
          {stars.filter(st => st.cat === 'learning').map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.radius * 0.7} fill="#5A7FCC" opacity={0.35} />
          ))}
          {masteredStars.map((s, i) => {
            const isLit      = i < 38 + newLit;
            const isNewlyLit = i >= 38 && i < 38 + newLit;
            return (
              <g key={i}>
                <circle cx={s.x} cy={s.y} r={s.radius} fill={isLit ? '#FFF8D6' : '#444'} opacity={isLit ? 0.95 : 0.3}>
                  {isNewlyLit && <animate attributeName="opacity" values="0;0.95" dur="0.35s" fill="freeze" />}
                </circle>
                {isLit && (
                  <circle cx={s.x} cy={s.y} r={s.radius * 2.8} fill="#FFE090" opacity={0.07}>
                    {isNewlyLit && <animate attributeName="r" values={`${s.radius}`} to={`${s.radius * 2.8}`} dur="0.4s" fill="freeze" />}
                  </circle>
                )}
                {isNewlyLit && connections
                  .filter(c => (Math.abs(c.x1 - s.x) < 0.1 && Math.abs(c.y1 - s.y) < 0.1) ||
                               (Math.abs(c.x2 - s.x) < 0.1 && Math.abs(c.y2 - s.y) < 0.1))
                  .map((c, ci) => (
                    <line key={ci} x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2}
                      stroke="#FFE562" strokeWidth="0.25" opacity="0" strokeLinecap="round">
                      <animate attributeName="opacity" values="0;0.5;0.22" dur="0.6s" fill="freeze" />
                    </line>
                  ))
                }
              </g>
            );
          })}
          {stars.filter(st => st.cat === 'new').map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.radius} fill="#8899CC" opacity={0.5} />
          ))}
          <text x="50" y="95" textAnchor="middle" fontSize="6" fill="#FFFFFF" opacity="0.04" fontFamily="sans-serif">
            刑法分论·贿赂渎职
          </text>
        </svg>
      </div>
      <div className="px-6 pb-4 pt-3">
        <p className="text-[12px] mb-3 text-center" style={{ color: '#666' }}>还能切换成思维导图看结构</p>
        <CTAButton onClick={onNext}>太酷了，继续 →</CTAButton>
      </div>
    </div>
  );
}

// ── B4 inner ──────────────────────────────────────────────────────────────────

function B4Inner({ onNext }: { onNext: () => void }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex-1 flex flex-col justify-center pb-3">
        <button onClick={() => setFlipped(v => !v)}
          className="w-full rounded-2xl p-5 text-left transition-all active:scale-[0.99]"
          style={{ background: CARD, border: `2px solid ${flipped ? GREEN : BORDER}`, minHeight: 160, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          {!flipped ? (
            <div>
              <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-bold mb-3"
                style={{ background: '#EAF3FF', color: BLUE }}>Q</span>
              <p className="text-[16px] font-semibold mb-5" style={{ color: T1 }}>斡旋受贿罪的行为主体是谁？</p>
              <p className="text-[12px] text-center" style={{ color: '#BBB' }}>点击翻面看概念</p>
            </div>
          ) : (
            <div>
              <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-bold mb-3"
                style={{ background: '#F6FEF9', color: GREEN }}>A</span>
              <p className="text-[14px] leading-relaxed" style={{ color: T2 }}>
                斡旋受贿罪的行为主体是<strong>国家工作人员</strong>。行为人利用职权或地位形成的影响力，
                斡旋其他国家工作人员为请托人谋利，并从请托人处收取财物。
              </p>
            </div>
          )}
        </button>
        {flipped && (
          <div className="flex gap-3 mt-3">
            <button onClick={onNext} className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold"
              style={{ background: BLUE, color: '#fff' }}>继续练习</button>
            <button onClick={onNext} className="flex-1 py-2.5 rounded-xl text-[13px]"
              style={{ background: '#F3F4F6', color: T2 }}>我已经会了，跳过</button>
            <button onClick={onNext} className="flex-1 py-2 rounded-xl font-semibold"
              style={{ background: PRIMARY, color: '#7A6400' }}><span className="block text-[13px]">先讲给我听</span><span className="block text-[9px] font-normal">进入 AI 引导学习</span></button>
          </div>
        )}
      </div>
      <div className="pb-5 pt-1">
        <CTAButton onClick={onNext}>继续 →</CTAButton>
      </div>
    </div>
  );
}

// ── B5 inner ──────────────────────────────────────────────────────────────────

function B5Inner({ onNext }: { onNext: () => void }) {
  const [tab, setTab] = useState<'填空' | '判断' | '多选' | '简答'>('填空');
  const [draft, setDraft] = useState('');
  const [solved, setSolved] = useState(false);
  const contents = {
    填空: { question: '斡旋受贿罪的行为主体必须是 ______。', user: '公职人员', answer: '国家工作人员', analysis: '“公职人员”范围过宽，法条要求行为人具有国家工作人员身份。' },
    判断: { question: '斡旋受贿要求行为人亲自利用本人职务为请托人谋利。', user: '正确', answer: '错误', analysis: '其核心是利用职权或地位形成的影响，通过其他国家工作人员为请托人谋利。' },
    多选: { question: '斡旋受贿的成立条件包括哪些？', user: '☑ 国家工作人员身份　☐ 地位影响　☑ 收受财物', answer: '☑ 国家工作人员身份　☑ 地位影响　☑ 收受财物', analysis: '三项均是关键条件；多选题使用方形复选框表达。' },
    简答: { question: '请用一句话说明斡旋受贿与普通受贿的核心区别。', user: '通过别人办事并收钱。', answer: '利用职权或地位形成的影响，斡旋其他国家工作人员为请托人谋利并收受财物。', analysis: '已命中“他人办事、收受财物”，遗漏“职权或地位形成的影响”。' },
  } as const;
  const current = contents[tab];
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex gap-2 mb-3">
        {(Object.keys(contents) as Array<keyof typeof contents>).map(type => <button key={type} onClick={() => { setTab(type); setDraft(''); setSolved(false); }} className="flex-1 py-2 rounded-lg text-[12px] font-semibold" style={{ background: tab === type ? BLUE : '#F3F4F6', color: tab === type ? '#fff' : T3 }}>{type}</button>)}
      </div>
      <div className="flex-1 rounded-2xl p-4 overflow-y-auto" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
        <p className="text-[14px] font-semibold mb-4" style={{ color: T1 }}>{current.question}</p>
        {!solved ? <>
          {tab === '判断' ? <div className="grid grid-cols-2 gap-2 mb-3">{['正确','错误'].map(v => <button key={v} onClick={() => setDraft(v)} className="py-3 rounded-xl text-[12px]" style={{ background: draft === v ? '#FFFBDE' : '#F6F6F6', border: `1.5px solid ${draft === v ? PRIMARY : BORDER}` }}>{v}</button>)}</div>
          : tab === '多选' ? <div className="space-y-2 mb-3">{['国家工作人员身份','地位影响','收受财物'].map(v => <button key={v} onClick={() => setDraft(draft.includes(v) ? draft.replace(v, '') : `${draft} ${v}`)} className="w-full text-left px-3 py-2 rounded-lg text-[12px]" style={{ background: draft.includes(v) ? '#FFFBDE' : '#F6F6F6' }}>□ {v}</button>)}</div>
          : <textarea value={draft} onChange={e => setDraft(e.target.value)} placeholder={tab === '填空' ? '输入答案' : '写下你的回答'} className="w-full rounded-xl p-3 text-[12px] mb-3 resize-none" style={{ border: `1.5px solid ${BORDER}`, minHeight: 72 }} />}
          <button onClick={() => { if (!draft) setDraft(current.user); setSolved(true); }} className="px-5 py-2 rounded-full text-[12px] font-semibold" style={{ background: BLUE, color: '#fff' }}>提交答案</button>
        </> : <>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="rounded-xl p-3" style={{ background: '#FFF0EE' }}><p className="text-[10px] font-semibold mb-1" style={{ color: RED }}>你的答案</p><p className="text-[12px]" style={{ color: T2 }}>{draft || current.user}</p></div>
            <div className="rounded-xl p-3" style={{ background: '#F6FEF9' }}><p className="text-[10px] font-semibold mb-1" style={{ color: GREEN }}>正确 / 参考答案</p><p className="text-[12px]" style={{ color: T2 }}>{current.answer}</p></div>
          </div>
          <div className="rounded-xl p-3" style={{ background: '#F3F4F6' }}><p className="text-[11px] font-semibold mb-1" style={{ color: T3 }}>解析</p><p className="text-[12px] leading-relaxed" style={{ color: T3 }}>{current.analysis}</p></div>
        </>}
      </div>
      <p className="text-[11px] text-center mt-2" style={{ color: T4 }}>下一步，AI 会根据你的答案继续追问和讲解</p>
      <div className="pb-5 pt-1">
        <CTAButton onClick={onNext}>继续 →</CTAButton>
      </div>
    </div>
  );
}

function ScratchpadDemo({ onNext }: { onNext: () => void }) {
  const [cleared, setCleared] = useState(false);
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
        <div className="rounded-2xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <p className="text-[11px] mb-2" style={{ color: BLUE }}>计算题</p>
          <p className="text-[15px] font-semibold" style={{ color: T1 }}>若 f(x)=x²−4x+3，求其最小值。</p>
          <div className="mt-5 rounded-xl px-3 py-2 text-[13px]" style={{ border: `1px solid ${BORDER}`, color: T4 }}>最终答案：−1</div>
        </div>
        <div className="rounded-2xl overflow-hidden shadow-lg" style={{ background: '#FFFDF1', border: `1.5px solid ${PRIMARY}` }}>
          <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: `1px solid #EEE5B8` }}>
            <GripVertical size={14} color="#AA9B62" /><span className="text-[12px] font-bold flex-1" style={{ color: '#6B5900' }}>草稿本</span>
            <PenLine size={14} color={BLUE} /><Eraser size={14} color={T4} /><button onClick={() => setCleared(true)} className="text-[10px]" style={{ color: RED }}>清空</button>
          </div>
          <div className="p-5 text-[18px] leading-loose" style={{ color: cleared ? '#D8D1AE' : '#31456A', fontFamily: 'cursive' }}>
            {cleared ? '在这里随手计算…' : <>f(x)=(x−2)²−1<br />x=2 时，min=−1 ✓</>}
          </div>
        </div>
      </div>
      <p className="text-[11px] text-center py-2" style={{ color: T4 }}>草稿不会被识别或判分，只帮你保留解题过程</p>
      <div className="pb-5"><CTAButton onClick={onNext}>继续：看看 AI 如何讲解 →</CTAButton></div>
    </div>
  );
}

function TracebackDemo({ onNext }: { onNext: () => void }) {
  const [marked, setMarked] = useState(false);
  const [openNote, setOpenNote] = useState(false);
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex-1 grid grid-cols-[42%_58%] rounded-2xl overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
        <div className="p-4" style={{ background: CARD }}>
          <p className="text-[11px] mb-2" style={{ color: T4 }}>练习已暂停</p>
          <p className="text-[14px] font-semibold mb-3" style={{ color: T1 }}>斡旋受贿的影响力来自哪里？</p>
          <div className="rounded-xl p-3 text-[12px]" style={{ background: '#F6FEF9', color: T2 }}>职权或地位形成的影响 ✓</div>
        </div>
        <div className="flex flex-col" style={{ background: '#FAFAFA', borderLeft: `1px solid ${BORDER}` }}>
          <div className="flex px-3 pt-2 gap-4" style={{ borderBottom: `1px solid ${BORDER}` }}><span className="pb-2 text-[11px]" style={{ color: T4 }}>AI 对话</span><span className="pb-2 text-[11px] font-bold" style={{ color: BLUE, borderBottom: `2px solid ${BLUE}` }}>溯源</span></div>
          {!openNote ? <div className="p-4 flex-1 overflow-y-auto">
            <div className="flex items-center gap-2 mb-3"><FileText size={14} color={BLUE} /><span className="text-[11px]" style={{ color: T3 }}>刑法分论讲义.pdf · 第 42 页</span></div>
            <p className="text-[12px] leading-7" style={{ color: T2 }}>斡旋受贿是指国家工作人员利用本人职权或者地位形成的便利条件，<mark style={{ background: '#FFF09A' }}>通过其他国家工作人员职务上的行为</mark>，为请托人谋取不正当利益。</p>
            <div className="flex gap-2 mt-4"><button onClick={() => setMarked(true)} className="px-3 py-1.5 rounded-lg text-[11px]" style={{ background: PRIMARY, color: '#6B5900' }}>{marked ? '已同步标记 ✓' : '标记这段原文'}</button><button onClick={() => setOpenNote(true)} className="px-3 py-1.5 rounded-lg text-[11px]" style={{ background: '#EAF3FF', color: BLUE }}>打开原笔记（最新）</button></div>
          </div> : <div className="p-4 flex-1"><div className="flex items-center gap-2 mb-3"><button onClick={() => setOpenNote(false)}><ArrowLeft size={14} /></button><BookOpen size={14} color={BLUE} /><span className="text-[12px] font-bold">斡旋受贿专题笔记 · 最新</span></div><div contentEditable suppressContentEditableWarning className="rounded-xl p-3 text-[12px] leading-6 h-32" style={{ background: CARD, border: `1px solid ${BORDER}` }}>核心区别：借助职权或地位形成的影响，通过其他国家工作人员为请托人谋利。</div></div>}
        </div>
      </div>
      <div className="pb-5 pt-3"><CTAButton onClick={onNext}>继续看学习结果 →</CTAButton></div>
    </div>
  );
}

// ── B6 inner ──────────────────────────────────────────────────────────────────

function B6Inner({ onNext }: { onNext: () => void }) {
  const [answer, setAnswer] = useState('');
  const [round, setRound] = useState(1);
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex-1 overflow-y-auto pb-2 space-y-2.5">
        <div className="rounded-lg px-3 py-2 text-[11px] flex items-center gap-2" style={{ background: '#FFFBDE', color: '#7A6400' }}><span>✨</span><span>AI 会根据你的回答继续追问，不是直接把答案念给你。</span><button onClick={() => { setAnswer('职权或地位形成的影响'); setRound(3); }} className="ml-auto underline">跳过动画</button></div>
        <div className="rounded-xl p-3 ml-auto max-w-[72%]" style={{ background: '#F3F4F6' }}>
          <p className="text-[10px] mb-1" style={{ color: T4 }}>你刚才的简答</p>
          <p className="text-[12px]" style={{ color: T2 }}>“通过别人办事并收钱。”</p>
        </div>
        <div className="rounded-xl p-3 max-w-[82%]" style={{ background: '#EAF3FF', border: '1px solid #C9E0FF' }}>
          <p className="text-[10px] mb-1 font-semibold" style={{ color: BLUE }}>AI Tutor</p>
          <p className="text-[12px] leading-relaxed" style={{ color: T2 }}>你已经抓到“通过他人办事”。再想一步：行为人为什么能影响另一名国家工作人员？</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {['私人交情', '职权或地位形成的影响', '请托人支付报酬'].map(option => <button key={option} onClick={() => setAnswer(option)} className="p-2.5 rounded-xl text-[11px]" style={{ background: answer === option ? '#FFFBDE' : CARD, border: `1.5px solid ${answer === option ? PRIMARY : BORDER}`, color: T2 }}>{option}</button>)}
        </div>
        {answer && (
          <div className="rounded-xl p-3 max-w-[88%]" style={{ background: answer === '职权或地位形成的影响' ? '#F6FEF9' : '#FFF8E7', border: `1px solid ${answer === '职权或地位形成的影响' ? '#B7EFCF' : '#F7D89A'}` }}>
            <p className="text-[12px] leading-relaxed" style={{ color: T2 }}>{answer === '职权或地位形成的影响' ? '对。核心不是普通人情，而是职权或地位带来的影响力。你已完成一次强化引导。' : '这个因素可能存在，但不是法条核心。再看看“影响力”来自哪里。'}</p>
          </div>
        )}
        {answer === '职权或地位形成的影响' && <>
          <div className="rounded-xl p-3 ml-auto max-w-[72%]" style={{ background: '#F3F4F6' }}><p className="text-[12px]" style={{ color: T2 }}>因为他的职权或地位能影响其他国家工作人员。</p></div>
          <div className="rounded-xl p-3 max-w-[86%]" style={{ background: '#EAF3FF', border: '1px solid #C9E0FF' }}><p className="text-[12px] leading-relaxed" style={{ color: T2 }}>{round < 3 ? '很好。最后判断一下：如果只是普通私人交情，没有这种影响力，是否成立斡旋受贿？' : '总结：关键不是“找别人办事”，而是影响力必须来自职权或地位。这个遗漏点已加入强化练习。'}</p></div>
          {round < 3 && <div className="grid grid-cols-2 gap-2"><button onClick={() => setRound(3)} className="py-2 rounded-xl text-[11px]" style={{ background: '#F3F4F6' }}>成立</button><button onClick={() => setRound(3)} className="py-2 rounded-xl text-[11px]" style={{ background: '#FFFBDE', border: `1px solid ${PRIMARY}` }}>不成立</button></div>}
          {round === 3 && <div className="flex items-center gap-2 text-[11px]" style={{ color: GREEN }}><Check size={13} />该知识点已加入强化练习</div>}
        </>}
      </div>
      <div className="pb-5 pt-1">
        <CTAButton onClick={onNext} disabled={round !== 3}>继续：查看答案出处 →</CTAButton>
      </div>
    </div>
  );
}

// ── B7 inner ──────────────────────────────────────────────────────────────────

function B7Inner({ onNext }: { onNext: () => void }) {
  const [added, setAdded] = useState(false);
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex-1 overflow-y-auto pb-2">
        <div className="rounded-2xl p-4" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="rounded-xl p-3" style={{ background: '#F6FEF9' }}><p className="text-[24px] font-bold" style={{ color: T1 }}>78%</p><p className="text-[10px]" style={{ color: GREEN }}>通过率预测 · 可信度中</p></div>
            <div className="rounded-xl p-3" style={{ background: '#EAF3FF' }}><p className="text-[24px] font-bold" style={{ color: T1 }}>6/12</p><p className="text-[10px]" style={{ color: BLUE }}>今日已处理知识点</p></div>
          </div>
          <div className="flex items-center gap-5 mb-3 pb-3" style={{ borderBottom: `1px solid ${BORDER}` }}>
            <div className="text-center">
              <p className="text-[34px] font-bold" style={{ color: T1 }}>70%</p>
              <p className="text-[12px]" style={{ color: T4 }}>正确率</p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-[13px]" style={{ color: T3 }}>14 / 20 题正确</p>
              <p className="text-[13px]" style={{ color: T3 }}>用时 24 分钟</p>
            </div>
          </div>
          <p className="text-[12px] font-semibold mb-2" style={{ color: T4 }}>能力分布</p>
          {[
            { name: '刑法分论·贿赂渎职',      pct: 75 },
            { name: '渎职罪名与受贿罪关系',    pct: 40, weak: true },
            { name: '犯罪构成与定罪方法',      pct: 80 },
          ].map(d => (
            <div key={d.name} className="mb-2">
              <div className="flex justify-between mb-0.5">
                <span className="text-[12px]" style={{ color: T3 }}>{d.name}</span>
                <span className="text-[12px]" style={{ color: d.weak ? RED : T3 }}>{d.pct}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#F3F4F6' }}>
                <div className="h-full rounded-full" style={{ width: `${d.pct}%`, background: d.weak ? RED : BLUE }} />
              </div>
            </div>
          ))}
          <div className="mt-3 rounded-xl p-4" style={{ background: '#1A1E2E' }}>
            <p className="text-[14px] font-medium mb-1" style={{ color: '#EDEDED' }}>
              发现 3 个重点薄弱模块 · 预计补强 95 分钟
            </p>
            <div className="flex gap-2 mt-3">
              <button className="flex-1 py-2 rounded-lg text-[12px]"
                style={{ background: '#2A3050', color: '#90C8FF' }}>查看复习方案</button>
              <button onClick={() => setAdded(true)} className="flex-1 py-2 rounded-lg text-[12px] font-bold"
                style={{ background: added ? GREEN : PRIMARY, color: added ? '#fff' : '#7A6400' }}>{added ? '已加入学习计划 ✓' : '加入学习计划'}</button>
            </div>
          </div>
        </div>
      </div>
      <div className="pb-5 pt-1">
        <CTAButton onClick={onNext}>我准备好了 →</CTAButton>
      </div>
    </div>
  );
}

// ── B1: Materials → KPs (auto-advance animation) ──────────────────────────────

const B1_CHIPS = [
  { label: '讲义.docx', bg: '#EAF3FF', rotate: -7,  x: 14,  y: 12 },
  { label: '手写.jpg',  bg: '#FFF8E7', rotate:  5,  x: 148, y: 6  },
  { label: '录音.mp3',  bg: '#FFF0EE', rotate: -4,  x: 268, y: 14 },
  { label: '网页.html', bg: '#F6FEF9', rotate:  6,  x: 70,  y: 54 },
  { label: 'PPT.pptx',  bg: '#F3F4F6', rotate: -5,  x: 196, y: 48 },
];

function B1Screen({ onNext }: { onNext: () => void }) {
  const [phase, setPhase] = useState<0 | 1 | 2>(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 800);
    const t2 = setTimeout(() => setPhase(2), 1700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="flex flex-col h-full px-6">
      <div className="pt-6 pb-3">
        <h1 className="text-[22px] font-bold leading-tight mb-1" style={{ color: T1 }}>一份资料，自动拆成知识点</h1>
        <p className="text-[14px] font-semibold" style={{ color: BLUE }}>重点、概念和考点，已经为你整理出来</p>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-5 overflow-hidden">
        <div className="rounded-2xl p-4 overflow-hidden" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <div className="flex items-center gap-2 mb-3"><FileText size={16} color={RED} /><span className="text-[12px] font-semibold" style={{ color: T2 }}>刑法分论·贿赂渎职.pdf</span></div>
          {['国家工作人员利用本人职权或地位形成的便利条件', '通过其他国家工作人员职务上的行为', '为请托人谋取不正当利益并索取或收受财物', '实际取得或控制财物时达到既遂'].map((line, index) => (
            <p key={line} className="text-[11px] leading-7 px-1 transition-all" style={{ color: T3, background: phase >= 1 && index < 3 ? '#FFF3A8' : 'transparent' }}>{line}</p>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {['受贿罪主体', '职务或地位影响', '财物控制', '既遂标准'].map((item, index) => (
            <div key={item} className="flex-1 rounded-xl px-4 flex items-center gap-3 transition-all" style={{ background: CARD, border: `1px solid ${phase >= 2 ? '#BEDAFF' : BORDER}`, opacity: phase >= 2 ? 1 : .35, transform: `translateX(${phase >= 2 ? 0 : 24}px)` }}>
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: '#EAF3FF', color: BLUE }}>{index + 1}</span>
              <div><p className="text-[12px] font-semibold" style={{ color: T2 }}>{item}</p><p className="text-[9px]" style={{ color: T4 }}>concept-law-bribery-{index + 1}</p></div>
            </div>
          ))}
        </div>
      </div>
      <p className="text-[11px] text-center mt-2" style={{ color: T4 }}>预制内容用于说明处理方式；真实提取将在选择资料并确认优先级后开始。</p>
      <div className="pb-5 pt-2"><CTAButton onClick={onNext}>添加我的学习资料 →</CTAButton></div>
    </div>
  );
}


// ── A6: Study Plan Confirmation ───────────────────────────────────────────────

const PLAN_DATA_FIT = [
  { day: 'Day 1 · 今天', chapters: [{ name: '受贿罪的构成与既遂', kps: 8 }, { name: '索贿与收受的区分', kps: 5 }] },
  { day: 'Day 2 · 明天', chapters: [{ name: '斡旋受贿罪', kps: 6 }, { name: '单位受贿', kps: 4 }] },
  { day: 'Day 3',        chapters: [{ name: '渎职罪总论', kps: 7 }, { name: '滥用职权罪', kps: 5 }] },
  { day: 'Day 4',        chapters: [{ name: '玩忽职守罪', kps: 6 }, { name: '徇私枉法罪', kps: 4 }] },
];

const PLAN_DATA_NOFIT = [
  { name: '受贿罪构成（★★★）', priority: 3, kps: 13, keep: true  },
  { name: '斡旋受贿罪（★★★）', priority: 3, kps: 6,  keep: true  },
  { name: '渎职罪总论（★★☆）', priority: 2, kps: 12, keep: true  },
  { name: '单位受贿（★★☆）',   priority: 2, kps: 4,  keep: false },
  { name: '行贿罪体系（★☆☆）', priority: 1, kps: 8,  keep: false },
  { name: '介绍贿赂罪（★☆☆）', priority: 1, kps: 3,  keep: false },
];

function A6Screen({ onNext }: { onNext: () => void }) {
  const [mode, setMode] = useState<'fit' | 'nofit'>('fit');
  const [weekdays, setWeekdays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [planDays, setPlanDays] = useState(PLAN_DATA_FIT);
  const [draggedChapter, setDraggedChapter] = useState<{ day: string; name: string } | null>(null);
  const [removedChapter, setRemovedChapter] = useState<{ day: string; chapter: { name: string; kps: number } } | null>(null);
  const [noFitKeep, setNoFitKeep] = useState<Record<string, boolean>>(
    Object.fromEntries(PLAN_DATA_NOFIT.map(r => [r.name, r.keep]))
  );

  const totalKps     = PLAN_DATA_NOFIT.filter(r => noFitKeep[r.name]).reduce((a, r) => a + r.kps, 0);
  const canConfirmNoFit = totalKps <= 36;
  const toggleWeekday = (day: number) => setWeekdays(current => current.includes(day) ? (current.length > 1 ? current.filter(item => item !== day) : current) : [...current, day].sort());
  const moveChapter = (targetDay: string) => {
    if (!draggedChapter) return;
    let moving: { name: string; kps: number } | undefined;
    const without = planDays.map(day => ({ ...day, chapters: day.chapters.filter(ch => {
      if (day.day === draggedChapter.day && ch.name === draggedChapter.name) { moving = ch; return false; }
      return true;
    }) }));
    if (moving) setPlanDays(without.map(day => day.day === targetDay ? { ...day, chapters: [...day.chapters, moving!] } : day));
    setDraggedChapter(null);
  };
  const removeFromPlan = (dayName: string, chapter: { name: string; kps: number }) => {
    setPlanDays(prev => prev.map(day => day.day === dayName ? { ...day, chapters: day.chapters.filter(ch => ch.name !== chapter.name) } : day));
    setRemovedChapter({ day: dayName, chapter });
  };

  return (
    <div className="flex flex-col h-full px-6">
      <div className="pt-6 pb-3">
        <h1 className="text-[22px] font-bold leading-tight mb-1" style={{ color: T1 }}>确认你的学习计划</h1>
        <p className="text-[14px] font-medium" style={{ color: BLUE }}>
          {mode === 'fit' ? '时间充裕，按此计划开始学习' : '时间有限，请筛选重点知识'}
        </p>
      </div>

      <div className="rounded-xl p-3 mb-3" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
        <div className="flex items-center justify-between mb-2"><p className="text-[12px] font-semibold" style={{ color: T2 }}>每周学习日</p><p className="text-[11px]" style={{ color: BLUE }}>距考试约 {weekdays.length * 4} 个学习日</p></div>
        <div className="grid grid-cols-7 gap-2">
          {['一','二','三','四','五','六','日'].map((label, index) => {
            const day = index + 1; const selected = weekdays.includes(day);
            return <button key={label} onClick={() => toggleWeekday(day)} className="py-2 rounded-lg text-[12px] font-semibold" style={{ background: selected ? PRIMARY : '#F3F4F6', color: selected ? '#6B5900' : T4 }}>{label}</button>;
          })}
        </div>
        <p className="text-[10px] mt-2" style={{ color: '#A88300' }}>默认周末休息，你可以按自己的节奏调整；休息日不排新学内容。</p>
      </div>

      {/* Mode toggle — demo only */}
      <div className="flex gap-2 mb-4 items-center">
        {(['fit', 'nofit'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className="px-3 py-1 rounded-full text-[12px] font-medium transition-all"
            style={{ background: mode === m ? BLUE : '#F3F4F6', color: mode === m ? '#fff' : T4 }}>
            {m === 'fit' ? '时间够' : '时间不够'}
          </button>
        ))}
        <span className="text-[11px]" style={{ color: '#CCC' }}>演示切换</span>
      </div>

      {mode === 'fit' ? (
        <div className="flex-1 overflow-y-auto pb-4 space-y-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-[12px]"
            style={{ background: '#F6FEF9', color: GREEN }}>
            <Check size={14} strokeWidth={2.5} />
            按当前考试日期，可覆盖全部 46 个知识点，无需筛减。
          </div>
          {planDays.map(day => (
            <div key={day.day} className="rounded-xl overflow-hidden" onDragOver={e => e.preventDefault()} onDrop={() => moveChapter(day.day)} style={{ border: `1px solid ${BORDER}` }}>
              <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: '#F3F4F6' }}>
                <span className="text-[13px] font-semibold" style={{ color: T2 }}>{day.day}</span>
                <span className="text-[12px]" style={{ color: T4 }}>
                  {day.chapters.reduce((a, c) => a + c.kps, 0)} 个知识点
                </span>
              </div>
              {day.chapters.map((ch, ci) => (
                <div key={ch.name} draggable onDragStart={() => setDraggedChapter({ day: day.day, name: ch.name })} className="group flex items-center gap-3 px-4 py-3 cursor-grab"
                  style={{ borderTop: ci > 0 ? `1px solid ${BORDER}` : undefined, background: CARD }}>
                  <GripVertical size={14} color="#BBB" />
                  <span className="flex-1 text-[13px]" style={{ color: T2 }}>{ch.name}</span>
                  <span className="text-[12px]" style={{ color: T4 }}>{ch.kps} 个</span>
                  <button onClick={() => removeFromPlan(day.day, ch)} className="px-2 py-1 rounded-lg text-[10px]" style={{ background: '#FFF0EE', color: RED }}>从计划移除</button>
                </div>
              ))}
              {day.chapters.length === 0 && <div className="py-4 text-center text-[11px]" style={{ color: T4 }}>拖拽知识点到这里</div>}
            </div>
          ))}
          {removedChapter && <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-[11px]" style={{ background: '#252525', color: '#fff' }}><span className="flex-1">已从计划移除，不会删除知识点或原资料</span><button onClick={() => { setPlanDays(prev => prev.map(day => day.day === removedChapter.day ? { ...day, chapters: [...day.chapters, removedChapter.chapter] } : day)); setRemovedChapter(null); }} style={{ color: PRIMARY }}>撤销</button></div>}
          <p className="text-[12px] text-center" style={{ color: '#AAA' }}>按住拖拽可跨日期调整；移动端左滑可移除</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pb-4 space-y-3">
          <div className="px-3 py-2.5 rounded-xl text-[13px]"
            style={{ background: '#FFF0EE', border: `1px solid #FFD0CB` }}>
            <p className="font-semibold mb-0.5" style={{ color: RED }}>按当前考试时间，无法学完全部知识点</p>
            <p style={{ color: '#C0504A' }}>
              可覆盖：三星 100% · 二星 82% · 一星暂缓 {PLAN_DATA_NOFIT.filter(r => r.priority === 1).length} 个章节
            </p>
          </div>
          {(!weekdays.includes(6) || !weekdays.includes(7)) && <button onClick={() => setWeekdays([1,2,3,4,5,6,7])} className="w-full py-2.5 rounded-xl text-[12px] font-semibold" style={{ background: '#FFFBDE', color: '#7A6400', border: `1px solid ${PRIMARY}` }}>把周末也设为学习日，可覆盖更多内容 →</button>}
          <p className="text-[12px]" style={{ color: T3 }}>请勾选要保留的章节（压到考试时间内才可确认）：</p>
          {PLAN_DATA_NOFIT.map(r => (
            <button key={r.name}
              onClick={() => setNoFitKeep(prev => ({ ...prev, [r.name]: !prev[r.name] }))}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
              style={{
                background: noFitKeep[r.name] ? CARD : '#F8F8F8',
                border: `1.5px solid ${noFitKeep[r.name] ? (r.priority === 3 ? GREEN : r.priority === 2 ? BLUE : '#DDD') : BORDER}`,
                opacity: noFitKeep[r.name] ? 1 : 0.55,
              }}>
              <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                style={{ background: noFitKeep[r.name] ? GREEN : '#F3F4F6', border: `1.5px solid ${noFitKeep[r.name] ? GREEN : BORDER}` }}>
                {noFitKeep[r.name] && <Check size={11} color="#fff" strokeWidth={3} />}
              </div>
              <span className="flex-1 text-[13px] font-medium" style={{ color: T2 }}>{r.name}</span>
              <span className="text-[12px]" style={{ color: T4 }}>{r.kps} 个知识点</span>
            </button>
          ))}
          <div className="flex items-center justify-between px-1">
            <span className="text-[12px]" style={{ color: T3 }}>{totalKps} 个知识点</span>
            {!canConfirmNoFit
              ? <span className="text-[12px]" style={{ color: RED }}>超出时间，请再删减</span>
              : <span className="text-[12px]" style={{ color: GREEN }}>✓ 在时间内</span>
            }
          </div>
        </div>
      )}

      <div className="pb-6 pt-2">
        <CTAButton onClick={onNext} disabled={mode === 'nofit' && !canConfirmNoFit}>
          {mode === 'fit' ? '确认，开始学习 →' : '按此计划开始 →'}
        </CTAButton>
      </div>
    </div>
  );
}

// ── Main Onboarding Orchestrator ───────────────────────────────────────────────

export default function OnboardingScreen({ onComplete, onSkip }: OnboardingScreenProps) {
  const [stepIdx, setStepIdx]       = useState(0);
  const [goalType, setGoalType]     = useState<GoalType>('cert');
  const [goalDetail, setGoalDetail] = useState('法考·法律类');
  const [materialSource, setMaterialSource] = useState<'REAL_UPLOAD' | 'SAMPLE'>('SAMPLE');

  // Language type has no preset sample pack → no B1 pre-animation, no demo chain in A5
  const hasPreset = goalType !== 'language';

  const STEPS = hasPreset ? STEPS_WITH_SAMPLE : STEPS_NO_SAMPLE;
  const step  = STEPS[stepIdx];
  const total = STEPS.length;

  const next = () => setStepIdx(i => Math.min(i + 1, total - 1));
  const back = () => setStepIdx(i => Math.max(i - 1, 0));

  // Disable back on A5 (loading/demo chain) and A6 (plan gate) to avoid broken state
  const canBack = stepIdx > 0 && step !== 'A5' && step !== 'A6';

  const renderStep = () => {
    switch (step) {
      case 'A1': return (
        <A1Screen onNext={(gt, gd) => { setGoalType(gt); setGoalDetail(gd); next(); }} />
      );
      case 'A2': return (
        <A2Screen goalType={goalType} goalDetail={goalDetail} onNext={next} onBack={back} />
      );
      case 'B1': return <B1Screen onNext={next} />;
      case 'A3': return (
        <A3Screen hasPreset={hasPreset} onNext={(src) => { setMaterialSource(src); next(); }} onBack={back} />
      );
      case 'A4': return <A4Screen onNext={next} onBack={back} />;
      // A5 internally hosts the full loading + demo chain (B3→B7→C1→C2 for preset flows)
      case 'A5': return (
        <A5Screen
          hasPreset={hasPreset}
          isStem={goalDetail.includes('理工')}
          onNext={() => {
            // After C2 (or simple loading for no-preset) → A6
            next();
          }}
        />
      );
      case 'A6': return <A6Screen onNext={onComplete} />;
      default:   return null;
    }
  };

  // ScreenWrapper needs position:relative so A5's dark B3 overlay can cover it
  return (
    <div className="w-full h-full relative" style={{ background: BG }}>
      <ScreenWrapper onBack={canBack ? back : undefined} totalSteps={total} currentStep={stepIdx}>
        {renderStep()}
      </ScreenWrapper>
    </div>
  );
}
