import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Check, Star, Upload, FileText, Mic, Image, GripVertical, X, Search, ChevronDown, Users, Trash2, RotateCcw, BookOpen, PenLine, Eraser, MoreHorizontal, Send, Sparkles, Bookmark, ExternalLink, MousePointer2, Plus, Pencil } from 'lucide-react';
import { CloudMascot } from '../assets/CloudMascot';
import PlanFrameworkScreen, { type PlanDemoScenario } from './PlanFrameworkScreen';

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
  onEnterSample?: () => void;
  initialStep?: Step;
  demoScenario?: PlanDemoScenario;
  onActiveStepChange?: (step: Step) => void;
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

function ScreenWrapper({ children, onBack }: {
  children: React.ReactNode; onBack?: () => void;
}) {
  return (
    <div className="w-full h-full flex" style={{ background: BG, position: 'relative' }}>
      {onBack && (
        <div className="flex flex-col justify-start pt-5 pl-5 pr-2 flex-shrink-0" style={{ width: 44 }}>
          <button onClick={onBack} className="p-1.5 rounded-lg" style={{ background: '#F0F0F0' }}>
            <ArrowLeft size={16} color={T2} />
          </button>
        </div>
      )}
      <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
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
    <div className="pb-3 px-0">
      <h1 className="text-[18px] font-bold leading-tight mb-1" style={{ color: T1 }}>{title}</h1>
      <p className="text-[12.5px] font-medium leading-relaxed" style={{ color: subColor }}>{sub}</p>
    </div>
  );
}

function StepBar({ active }: { active: 0 | 1 | 2 | 3 }) {
  const steps = ['学什么', '怎么学', '用哪些资料', '先学什么'];
  return (
    <div className="flex items-center gap-2">
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <div className="flex items-center gap-1.5">
            <div className={`rounded-full flex items-center justify-center font-bold transition-all ${i === active ? 'w-7 h-7 text-[12px]' : 'w-5 h-5 text-[10px]'}`}
              style={{ background: i === active ? BLUE : '#EBEBEB', color: i === active ? '#fff' : '#AAA' }}>
              {i + 1}
            </div>
            <span className={i === active ? 'text-[13px] font-semibold' : 'text-[11px]'} style={{ color: i === active ? BLUE : '#AAA' }}>{s}</span>
          </div>
          {i < 3 && <div className="flex-1 h-px" style={{ background: i < active ? '#A9CEFF' : '#EBEBEB' }} />}
        </React.Fragment>
      ))}
    </div>
  );
}

const STEP_DESCRIPTIONS = [
  '你最近主要在准备什么？选择后将生成更适合你的题目',
  '设置目标与节奏，让系统安排每天学什么',
  '选择用于生成知识点和练习的资料',
  '确认资料优先级，让重点内容优先进入计划',
];

function PlanHeader({ active }: { active: 0 | 1 | 2 | 3 }) {
  const [showPriorityInfo, setShowPriorityInfo] = useState(false);
  const alignment = active === 0 ? {left:0, textAlign:'left' as const}
    : active === 3 ? {right:0, textAlign:'right' as const}
    : {left:`${active * 33.333}%`, transform:`translateX(-${active * 33.333}%)`, textAlign:'center' as const};
  return (
    <div className="pt-3 pb-3 flex-shrink-0">
      <h1 className="text-[21px] font-bold text-center mb-3" style={{color:T1}}>创建你的学习计划</h1>
      <div className="relative pb-8">
        <StepBar active={active}/>
        <div className="absolute top-9 w-[310px] text-[12px] font-medium" style={{color:BLUE,...alignment}}>
          <span>{STEP_DESCRIPTIONS[active]}</span>
          {active === 3 && <span className="relative inline-block ml-1">
            <button aria-label="查看 AI 优先级评估方式" onClick={()=>setShowPriorityInfo(v=>!v)} onBlur={()=>setTimeout(()=>setShowPriorityInfo(false),120)} className="w-4 h-4 rounded-full text-[10px] font-bold" style={{border:`1px solid ${BLUE}`,color:BLUE}}>i</button>
            {showPriorityInfo && <div className="absolute right-0 top-6 z-30 w-[310px] p-3 rounded-xl text-left text-[10px] leading-5 font-normal" style={{background:CARD,color:T2,border:`1px solid ${BORDER}`,boxShadow:'0 10px 28px rgba(20,35,60,.15)'}}>
              AI 会结合资料的优先级、知识点在多份资料中的出现次数，以及与考试目标的相关性，评估知识点的重要程度。你仍然可以拖动资料调整排序。
            </div>}
          </span>}
        </div>
      </div>
    </div>
  );
}

// ── A1: Goal & Direction ───────────────────────────────────────────────────────

function A1Screen({ onNext }: { onNext: (goalType: GoalType, detail: string) => void }) {
  const [primaryGoal, setPrimaryGoal]     = useState<GoalType | null>(null);
  const [detail, setDetail]               = useState('');
  const [bgFields, setBgFields]           = useState(['', '', '']);
  const [showModal, setShowModal]         = useState(false);
  const [langConfirmed, setLangConfirmed] = useState(false);
  const [schoolOpen, setSchoolOpen]       = useState(false);
  const schools = ['北京大学','北京理工大学','北京师范大学','北京航空航天大学','清华大学','复旦大学','上海交通大学','浙江大学'];
  const matchedSchools = schools.filter(s => !bgFields[2] || s.includes(bgFields[2])).slice(0, 5);

  const isLanguage   = primaryGoal === 'language' || (primaryGoal === 'other' && detail === '语言类');
  const canProceed   = !!primaryGoal && (!isLanguage || langConfirmed);
  const cohortCount  = detail ? (COHORT_COUNTS[detail] ?? '5,000+') : primaryGoal ? '10,000+' : null;

  const handlePrimary = (g: GoalType) => {
    if (g !== primaryGoal) { setDetail(''); setLangConfirmed(false); setBgFields(['', '', '']); }
    setPrimaryGoal(g);
    if (g === 'language') setShowModal(true);
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
      <PlanHeader active={0}/>

      <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <div>
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
          {primaryGoal && <div className="grid grid-cols-2 gap-2">
            {primaryGoal === 'other' ? (
              <label className="col-span-2"><FieldLabel>你准备学习什么？（选填）</FieldLabel><input value={detail} onChange={e=>setDetail(e.target.value)} placeholder="输入学习方向" className="w-full px-3 py-2 rounded-xl text-[12px] outline-none" style={inputBase}/></label>
            ) : <>
              <label><FieldLabel>{primaryGoal==='civil'?'考公类型':primaryGoal==='cert'?'资格类型':primaryGoal==='language'?'语言考试类型':'学科大类'}（选填）</FieldLabel>
                <select value={detail} onChange={e=>handleDetail(e.target.value)} className="w-full px-3 py-2 rounded-xl text-[12px] outline-none" style={inputBase}><option value="">暂未确定</option>{SECONDARY_GOALS[primaryGoal].map(v=><option key={v}>{v}</option>)}</select>
              </label>
              {(primaryGoal==='college'||primaryGoal==='postgrad') && <>
                <label><FieldLabel>细分专业（选填）</FieldLabel><input value={bgFields[0]} onChange={e=>setBgFields([e.target.value,bgFields[1],bgFields[2]])} list="major-options" placeholder="搜索或选择专业" className="w-full px-3 py-2 rounded-xl text-[12px] outline-none" style={inputBase}/></label>
                <label><FieldLabel>{primaryGoal==='college'?'课程':'备考科目'}（选填）</FieldLabel><input value={bgFields[1]} onChange={e=>setBgFields([bgFields[0],e.target.value,bgFields[2]])} placeholder="搜索或输入课程" className="w-full px-3 py-2 rounded-xl text-[12px] outline-none" style={inputBase}/></label>
                <label className="relative"><FieldLabel>学校（选填）</FieldLabel>
                  <div className="relative"><Search size={14} className="absolute left-3 top-2.5" color={T4}/><input value={bgFields[2]} onFocus={()=>setSchoolOpen(true)} onBlur={()=>setTimeout(()=>setSchoolOpen(false),120)} onChange={e=>{setBgFields([bgFields[0],bgFields[1],e.target.value]);setSchoolOpen(true);}} placeholder="搜索或输入学校" className="w-full pl-8 pr-8 py-2 rounded-xl text-[12px] outline-none" style={inputBase}/><ChevronDown size={14} className="absolute right-3 top-2.5" color={T4}/></div>
                  {schoolOpen && <div className="absolute left-0 right-0 top-full mt-1 z-20 rounded-xl overflow-hidden" style={{background:CARD,border:`1px solid ${BORDER}`,boxShadow:'0 10px 24px rgba(20,35,60,.12)'}}>
                    {matchedSchools.map(s=><button type="button" key={s} onMouseDown={e=>e.preventDefault()} onClick={()=>{setBgFields([bgFields[0],bgFields[1],s]);setSchoolOpen(false);}} className="w-full text-left px-3 py-2 text-[11px] hover:bg-gray-50" style={{color:T2}}>{s}</button>)}
                    {bgFields[2] && !schools.includes(bgFields[2]) && <button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>setSchoolOpen(false)} className="w-full text-left px-3 py-2 text-[11px]" style={{color:BLUE,borderTop:`1px solid ${BORDER}`}}>使用当前输入：{bgFields[2]}</button>}
                  </div>}
                </label>
                <datalist id="major-options"><option>计算机科学与技术</option><option>临床医学</option><option>工商管理</option><option>法学</option></datalist>
              </>}
              {primaryGoal==='civil' && <label><FieldLabel>考公科目（选填）</FieldLabel><input value={bgFields[0]} onChange={e=>setBgFields([e.target.value,'',''])} placeholder="如：行测、申论" className="w-full px-3 py-2 rounded-xl text-[12px] outline-none" style={inputBase}/></label>}
              {primaryGoal==='cert' && <label><FieldLabel>具体考试（选填）</FieldLabel><input value={bgFields[0]} onChange={e=>setBgFields([e.target.value,'',''])} placeholder={detail==='其他'?'请输入资格考试名称':'搜索或输入考试'} className="w-full px-3 py-2 rounded-xl text-[12px] outline-none" style={inputBase}/></label>}
              {primaryGoal==='language' && <label><FieldLabel>目标级别或分数（选填）</FieldLabel><input value={bgFields[0]} onChange={e=>setBgFields([e.target.value,'',''])} placeholder="如：雅思 7 分" className="w-full px-3 py-2 rounded-xl text-[12px] outline-none" style={inputBase}/></label>}
            </>}
          </div>}

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
        {primaryGoal && primaryGoal !== 'language' && cohortCount && <div className="flex items-center justify-center gap-2 mb-4">
          <div className="flex -space-x-2">{[12,32,47,5].map((n,i)=><img key={n} src={`https://i.pravatar.cc/48?img=${n}`} className="w-7 h-7 rounded-full object-cover" style={{border:`2px solid ${BG}`,zIndex:4-i}} alt="正在学习的同学"/>)}</div>
          <span className="text-[11.5px]" style={{color:T3}}>已有 <strong style={{color:'#7A6400'}}>{cohortCount} 位同学</strong>正在学习{detail?`「${detail}」`:`「${PRIMARY_GOALS.find(g=>g.id===primaryGoal)?.label}」`}</span>
        </div>}
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
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderDenied, setReminderDenied] = useState(false);
  const [reminderTime, setReminderTime] = useState('19:00');
  const [customReminder, setCustomReminder] = useState(false);

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
  const toggleReminder = async () => {
    if (reminderEnabled) { setReminderEnabled(false); return; }
    if (typeof Notification === 'undefined') { setReminderDenied(true); return; }
    const permission = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
    if (permission === 'granted') {
      setReminderEnabled(true);
      setReminderDenied(false);
    } else {
      setReminderEnabled(false);
      setReminderDenied(true);
    }
  };

  const inputCls = 'w-full px-3 py-2 rounded-xl text-[13px] outline-none';
  const inputStyle = (err?: boolean) => ({
    background: CARD, border: `1px solid ${err ? RED : BORDER}`, color: T2,
  });

  return (
    <div className="flex flex-col h-full px-5">
      <PlanHeader active={1}/>

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

            <div className="pt-2" style={{borderTop:`1px solid ${BORDER}`}}>
              <div className="flex items-center justify-between">
                <div><p className="text-[12px] font-semibold" style={{color:T2}}>复习提醒</p><p className="text-[10px]" style={{color:T4}}>按你的节奏提醒当天任务</p></div>
                <button onClick={toggleReminder} className="w-11 h-6 rounded-full p-0.5 transition-colors" style={{background:reminderEnabled?GREEN:'#D6D8DC'}}><span className="block w-5 h-5 rounded-full bg-white transition-transform" style={{transform:reminderEnabled?'translateX(20px)':'translateX(0)'}}/></button>
              </div>
              {reminderDenied && !reminderEnabled && <p className="text-[10px] mt-2" style={{color:'#A06B00'}}>需要开启通知权限才能设置复习提醒，可在系统设置中授权。</p>}
              {reminderEnabled && <div className="mt-2">
                <div className="flex flex-wrap gap-1.5">
                  {[['10:00','上午 10:00'],['12:00','中午 12:00'],['14:00','下午 2:00'],['19:00','晚上 7:00']].map(([value,label])=><button key={value} onClick={()=>{setReminderTime(value);setCustomReminder(false);}} className="px-2.5 py-1.5 rounded-lg text-[10px]" style={{background:!customReminder&&reminderTime===value?'#EAF3FF':CARD,border:`1px solid ${!customReminder&&reminderTime===value?BLUE:BORDER}`,color:!customReminder&&reminderTime===value?BLUE:T3}}>{label}</button>)}
                  <button onClick={()=>setCustomReminder(true)} className="px-2.5 py-1.5 rounded-lg text-[10px]" style={{background:customReminder?'#EAF3FF':CARD,border:`1px solid ${customReminder?BLUE:BORDER}`,color:customReminder?BLUE:T3}}>其他时间</button>
                </div>
                {customReminder && <input type="time" value={reminderTime} onChange={e=>setReminderTime(e.target.value)} className="w-full mt-2 px-3 py-2 rounded-xl text-[12px] outline-none" style={inputStyle()}/>}
              </div>}
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
      <PlanHeader active={2}/>
      <div className="grid grid-cols-[2fr_1fr] gap-2.5 mb-2">
        <button onClick={() => setSelected('REAL_UPLOAD')} className="rounded-xl px-4 py-3 flex items-center gap-3 text-left"
          style={{ background:CARD, border:`2px solid ${selected==='REAL_UPLOAD'?PRIMARY:BORDER}`, boxShadow:selected==='REAL_UPLOAD'?'0 2px 8px rgba(210,164,0,.15)':'none' }}>
          <span className="w-4 h-4 rounded-full flex-shrink-0" style={{ background:selected==='REAL_UPLOAD'?PRIMARY:'#EEE' }}/>
          <span className="text-[13px] font-bold" style={{color:T1}}>上传我自己的资料</span>
          {selected==='REAL_UPLOAD' && <span className="ml-auto text-[11px]" style={{color:GREEN}}>已选 {checked.size} 项</span>}
        </button>
        {hasPreset && <button onClick={() => setSelected('SAMPLE')} className="rounded-xl px-4 py-3 text-left"
          style={{ background:CARD, border:`2px solid ${selected==='SAMPLE'?PRIMARY:BORDER}` }}>
          <p className="text-[12px] font-bold" style={{color:T1}}>先用示例探索</p>
          <p className="text-[10px] mt-0.5" style={{color:T4}}>内容已备好，立即可用</p>
        </button>}
      </div>

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
  const [menuId, setMenuId] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState<{top:number;left:number} | null>(null);
  const [swipedId, setSwipedId] = useState<number | null>(null);
  const [pointerStart, setPointerStart] = useState<{ id: number; x: number } | null>(null);
  const [showGestureHint, setShowGestureHint] = useState(true);
  useEffect(() => {
    if (menuId === null) return;
    const closeMenu = () => { setMenuId(null); setMenuPosition(null); };
    window.addEventListener('resize', closeMenu);
    window.addEventListener('scroll', closeMenu, true);
    return () => {
      window.removeEventListener('resize', closeMenu);
      window.removeEventListener('scroll', closeMenu, true);
    };
  }, [menuId]);
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
    setMenuId(null);
    setMenuPosition(null);
    setSwipedId(null);
    setShowGestureHint(false);
  };
  const removeResource = (resource: PriorityResource) => {
    setResources(prev => prev.filter(r => r.id !== resource.id));
    setRemoved(resource);
    setMenuId(null);
    setMenuPosition(null);
    setSwipedId(null);
    setShowGestureHint(false);
  };

  return (
    <div className="flex flex-col h-full px-5">
      <PlanHeader active={3}/>
      {showGestureHint && <div className="flex items-center gap-1.5 mb-2 text-[10px]" style={{color:T4}}><GripVertical size={12}/><span>拖动可排序 · 左滑可移除 · 更多操作在 ⋯</span></div>}
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
                <div key={r.id} className="relative overflow-visible" style={{borderTop:index >= 0 ? `1px solid ${BORDER}` : undefined}}>
                  <button onClick={() => removeResource(r)} className="absolute right-0 inset-y-0 w-[72px] flex items-center justify-center gap-1 text-[10px] font-semibold" style={{background:'#FFF0EE',color:RED}}><Trash2 size={13}/>移除</button>
                  <div draggable onDragStart={() => {setDraggedId(r.id);setShowGestureHint(false);}}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.stopPropagation(); if (draggedId !== null) moveResource(draggedId, group.id, r.id); setDraggedId(null); }}
                    onPointerDown={e => setPointerStart({id:r.id,x:e.clientX})}
                    onPointerUp={e => {
                      if (pointerStart?.id === r.id && e.clientX - pointerStart.x < -42) {setSwipedId(r.id);setMenuId(null);setShowGestureHint(false);}
                      else if (pointerStart?.id === r.id && e.clientX - pointerStart.x > 28) setSwipedId(null);
                      setPointerStart(null);
                    }}
                    className="relative flex items-center gap-2.5 px-3 py-2 cursor-grab transition-transform"
                    style={{background:CARD,transform:swipedId===r.id?'translateX(-72px)':'translateX(0)',opacity:draggedId===r.id ? .45 : 1}}>
                    <GripVertical size={15} color="#B6BBC2" /><FileText size={14} color={group.color} />
                    <span className="flex-1 text-[12px]" style={{ color: T2 }}>{r.name}</span>
                    <button title="更多操作" onPointerDown={e=>e.stopPropagation()} onClick={e=>{
                      e.stopPropagation();
                      if (menuId===r.id) { setMenuId(null); setMenuPosition(null); }
                      else {
                        const rect=e.currentTarget.getBoundingClientRect();
                        const menuHeight=190;
                        setMenuId(r.id);
                        setMenuPosition({top:Math.min(rect.bottom+6,window.innerHeight-menuHeight-12),left:Math.max(12,rect.right-170)});
                      }
                      setSwipedId(null);setShowGestureHint(false);
                    }} className="p-1.5 rounded-lg" style={{color:T4}}><MoreHorizontal size={16}/></button>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
      {menuId!==null && menuPosition && createPortal((()=>{
        const resource=resources.find(item=>item.id===menuId);
        if (!resource) return null;
        return <><button aria-label="关闭更多操作" onClick={()=>{setMenuId(null);setMenuPosition(null);}} className="fixed inset-0 z-[999] cursor-default"/><div className="fixed z-[1000] w-[170px] rounded-xl p-1.5" style={{top:menuPosition.top,left:menuPosition.left,background:CARD,border:`1px solid ${BORDER}`,boxShadow:'0 14px 36px rgba(20,35,60,.22)'}}>
          <p className="px-2 py-1 text-[10px] font-semibold" style={{color:T4}}>调整优先级</p>
          {PRIORITIES.map(priority=><button key={priority.id} onClick={()=>moveResource(resource.id,priority.id)} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] text-left" style={{background:resource.priority===priority.id?priority.bg:'transparent',color:T2}}><span className="w-2 h-2 rounded-full" style={{background:priority.color}}/>{priority.name}{resource.priority===priority.id&&<Check size={11} className="ml-auto" color={GREEN}/>}</button>)}
          <div className="h-px my-1" style={{background:BORDER}}/>
          <button onClick={()=>removeResource(resource)} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px]" style={{color:RED}}><Trash2 size={12}/>从学习空间移除</button>
        </div></>;
      })(),document.body)}
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

// Product-intro chrome for B2→C2. The prominent top bar now foregrounds the REAL
// plan-generation progress (what the user actually waits on); the product-intro
// position is demoted to a faint dots row below. When generation completes, the
// right action flips from「跳过产品介绍」to a「立刻查看学习计划」CTA (mutually
// exclusive) so the moment-of-ready becomes a forward hand-off, not just a skip.
function A5DemoBar({ phase, progress, onBack, onSkip, onViewPlan }: {
  phase: A5SubPhase; progress: number; onBack: () => void; onSkip: () => void; onViewPlan: () => void;
}) {
  const idx = DEMO_PHASES.indexOf(phase);
  if (idx < 0) return null;
  const ready = progress >= 100;
  return (
    <>
      {/* Main bar — generation progress is the focal element */}
      <div className="relative z-[115] h-[52px] grid grid-cols-[auto_1fr_auto] items-center gap-4 px-7 flex-shrink-0" style={{background:CARD,borderBottom:`1px solid ${BORDER}`}}>
        <button onClick={onBack} className="flex items-center gap-1.5 text-[12px] font-medium whitespace-nowrap" style={{color:T3}}>
          <ArrowLeft size={15}/>{phase === 'B2' ? '退出学习空间' : '返回'}
        </button>
        <div className="flex items-center gap-2.5 min-w-0">
          {!ready && (
            <span className="text-[12px] font-semibold whitespace-nowrap" style={{ color: BLUE }}>
              学习计划生成中
            </span>
          )}
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#E3E9F2' }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${progress}%`, background: ready ? GREEN : BLUE }} />
          </div>
          {!ready && (
            <span className="text-[12px] font-medium whitespace-nowrap tabular-nums" style={{ color: T3 }}>
              {progress}%
            </span>
          )}
        </div>
        {ready ? (
          <button onClick={onViewPlan} className="justify-self-end flex items-center gap-1 px-4 py-2 rounded-full text-[12px] font-bold whitespace-nowrap" style={{background:PRIMARY,color:'#7A6400'}}>
            立刻查看学习计划 →
          </button>
        ) : (
          <button onClick={onSkip} className="justify-self-end text-[12px] font-medium whitespace-nowrap" style={{color:BLUE}}>跳过产品介绍</button>
        )}
      </div>
    </>
  );
}

/**
 * 产品介绍进度指示（弱化版）：无背底、放在各子页介绍模块与底部 CTA 之间，
 * 只做轻量「我在第几步」的定位，不抢主进度条与内容的视觉权重。
 */
function DemoDots({ phase }: { phase: A5SubPhase }) {
  const idx = DEMO_PHASES.indexOf(phase);
  if (idx < 0) return null;
  return (
    <div className="flex items-center justify-center gap-2 pt-1 pb-1.5">
      <div className="flex items-center gap-1.5">
        {DEMO_PHASES.map((_, i) => {
          const active = i === idx;
          const passed = i < idx;
          return (
            <div key={i} className="rounded-full transition-all"
              style={{
                width: active ? 14 : 5, height: 5,
                background: active ? BLUE : passed ? '#B7BEC9' : '#E6E9EE',
              }}/>
          );
        })}
      </div>
      <span className="text-[10px] font-medium tabular-nums" style={{color:T4}}>{idx + 1}/{DEMO_PHASES.length}</span>
    </div>
  );
}

function A5Screen({ hasPreset, isStem, initialPhase = 'loading', onNext, onExit, onEnterSample }: {
  hasPreset: boolean; isStem: boolean; initialPhase?: A5SubPhase; onNext: () => void; onExit: () => void; onEnterSample: () => void;
}) {
  const [subPhase, setSubPhase]   = useState<A5SubPhase>(initialPhase);
  const [genProgress, setGenProgress] = useState(initialPhase === 'C2' ? 100 : 0);
  const [dotCount, setDotCount]   = useState(0);
  const [planChoice, setPlanChoice] = useState<'year' | 'month'>('year');
  const [showNotReadyModal, setShowNotReadyModal] = useState(false);

  // Animated dots
  useEffect(() => {
    const id = setInterval(() => setDotCount(c => (c + 1) % 4), 500);
    return () => clearInterval(id);
  }, []);

  // Real background extraction progress — keeps advancing across the whole A5
  // lifetime (loading + B2→C2 product-intro chain). Surfaced as a persistent
  // indicator so the user always sees the plan is still being generated and will
  // be notified to confirm it when ready.
  useEffect(() => {
    if (genProgress >= 100) return;
    const id = setInterval(() => {
      setGenProgress(p => Math.min(100, p + 2 + Math.floor(Math.random() * 4)));
    }, 900);
    return () => clearInterval(id);
  }, [genProgress]);

  // Loading phase does NOT show the extraction process — it only previews the
  // upcoming steps, then hands off to the product-value intro (preset) or
  // straight to the plan-confirm step (no preset). Real generation runs in the
  // background (genProgress above) and is announced via the persistent bar.
  useEffect(() => {
    if (subPhase !== 'loading') return;
    const t = setTimeout(() => {
      if (hasPreset) setSubPhase('B2');
      else onNext();
    }, 3600);
    return () => clearTimeout(t);
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

  const backAfterCreation = () => {
    const idx = DEMO_PHASES.indexOf(subPhase);
    if (subPhase === 'loading' || subPhase === 'B2' || idx <= 0) {
      onExit();
      return;
    }
    let previous = DEMO_PHASES[idx - 1];
    if (previous === 'B5S' && !isStem) previous = 'B5';
    setSubPhase(previous);
  };

  const demoChrome = (
    <>
      <A5DemoBar phase={subPhase} progress={genProgress} onBack={backAfterCreation} onSkip={() => setShowNotReadyModal(true)} onViewPlan={onNext} />
      {showNotReadyModal && (
        <div className="absolute inset-0 z-[180] flex items-center justify-center p-6" style={{background:'rgba(20,24,32,.42)'}}>
          <div className="w-full max-w-[430px] rounded-3xl p-6" style={{background:CARD,boxShadow:'0 20px 60px rgba(0,0,0,.22)'}}>
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3" style={{background:'#EAF3FF',color:BLUE}}><Sparkles size={20}/></div>
            <h2 className="text-[18px] font-bold" style={{color:T1}}>新学习空间仍在生成中</h2>
            <p className="text-[12px] mt-2 leading-relaxed" style={{color:T3}}>你可以留在当前页面等待，或先进入 sample 空间体验完整功能。计划生成后，我们会直接弹窗通知你。</p>
            <div className="mt-5 space-y-2">
              <button onClick={() => setShowNotReadyModal(false)} className="w-full py-3 rounded-full text-[13px] font-bold" style={{background:PRIMARY,color:'#7A6400'}}>留在这里等待</button>
              <button onClick={onEnterSample} className="w-full py-3 rounded-full text-[13px] font-semibold" style={{background:'#F3F4F6',color:T2}}>进入 sample 空间体验</button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  const dots = '.'.repeat(dotCount);

  if (subPhase === 'B2') {
    return (
      <div className="flex flex-col h-full">
        {demoChrome}
        <div className="flex flex-col flex-1 px-7 pt-5 overflow-hidden">
          <ScreenTitle title="杂乱的资料，自动梳理成思维导图" sub="章节、知识点和关联关系，一眼看清并梳理知识关系" />
          <B2Inner onNext={advanceDemo} dots={<DemoDots phase={subPhase} />} />
        </div>
      </div>
    );
  }

  // ── B3: Star Map (white onboarding shell + dark galaxy canvas) ─────────────
  if (subPhase === 'B3') {
    return (
      <div className="flex flex-col h-full relative" style={{ background: CARD }}>
        {demoChrome}
        <B3Inner onNext={advanceDemo} dots={<DemoDots phase={subPhase} />} />
      </div>
    );
  }

  // ── B4: Flashcard ─────────────────────────────────────────────────────────
  if (subPhase === 'B4') {
    return (
      <div className="flex flex-col h-full">
        {demoChrome}
        <div className="flex flex-col flex-1 px-7 pt-5 overflow-hidden">
          <ScreenTitle title="不是让你背，是先问你会不会" sub="每个知识点，先给你一张闪卡" />
          <B4Inner onNext={advanceDemo} dots={<DemoDots phase={subPhase} />} />
        </div>
      </div>
    );
  }

  // ── B5: Question Types ────────────────────────────────────────────────────
  if (subPhase === 'B5') {
    return (
      <div className="flex flex-col h-full">
        {demoChrome}
        <div className="flex flex-col flex-1 px-7 pt-5 overflow-hidden">
          <ScreenTitle title="一个知识点，多种练习方式，直到真正掌握" sub="根据每次作答结果，逐步从记忆、辨析走向理解与应用" />
          <B5Inner onNext={advanceDemo} dots={<DemoDots phase={subPhase} />} />
        </div>
      </div>
    );
  }

  if (subPhase === 'B5S') {
    return (
      <div className="flex flex-col h-full">
        {demoChrome}
        <div className="flex flex-col flex-1 px-7 pt-5 overflow-hidden">
          <ScreenTitle title="计算题，也能随手打草稿" sub="草稿本跟着练习走，不遮挡题目" />
          <ScratchpadDemo onNext={advanceDemo} dots={<DemoDots phase={subPhase} />} />
        </div>
      </div>
    );
  }

  // ── B6: AI tutoring ───────────────────────────────────────────────────────
  if (subPhase === 'B6') {
    return (
      <div className="flex flex-col h-full">
        {demoChrome}
        <div className="flex flex-col flex-1 px-7 pt-5 overflow-hidden">
          <ScreenTitle title="不只给答案，像老师一样带你学会" sub="遇到不会的知识点，AI 会换种方式带你一步步理解" />
          <B6Inner onNext={advanceDemo} dots={<DemoDots phase={subPhase} />} />
        </div>
      </div>
    );
  }

  if (subPhase === 'B65') {
    return (
      <div className="flex flex-col h-full">
        {demoChrome}
        <div className="flex flex-col flex-1 px-7 pt-5 overflow-hidden">
          <ScreenTitle title="每个答案，都能找到出处" sub="直接标记来源，也能打开最新原笔记继续补记" />
          <TracebackDemo onNext={advanceDemo} dots={<DemoDots phase={subPhase} />} />
        </div>
      </div>
    );
  }

  // ── B7: Report + mock exam close ──────────────────────────────────────────
  if (subPhase === 'B7') {
    return (
      <div className="flex flex-col h-full">
        {demoChrome}
        <div className="flex flex-col flex-1 px-7 pt-5 overflow-hidden">
          <ScreenTitle title="知道学到哪，也知道接下来补什么" sub="学习报告与模考结果，自动变成下一步行动" />
          <B7Inner onNext={advanceDemo} dots={<DemoDots phase={subPhase} />} />
        </div>
      </div>
    );
  }

  // ── C1: Social Proof ──────────────────────────────────────────────────────
  if (subPhase === 'C1') {
    return (
      <div className="flex flex-col h-full">
        {demoChrome}
        <div className="flex flex-col flex-1 px-7 pt-5 overflow-hidden">
          <div className="flex-1 overflow-y-auto min-h-0">
          <div className="pb-4 text-center">
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
          </div>
          <div className="pt-1 flex-shrink-0">
            <DemoDots phase={subPhase} />
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
        {demoChrome}
        <div className="flex flex-col flex-1 px-7 pt-5 overflow-hidden">
          <div className="pb-4">
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
          <div className="pb-4 pt-1 space-y-2 flex-shrink-0">
            <DemoDots phase={subPhase} />
            <CTAButton onClick={advanceDemo}>立刻购买</CTAButton>
            <button onClick={advanceDemo} className="w-full text-center text-[13px]" style={{ color: T4 }}>
              先开始体验
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Loading phase (default) ───────────────────────────────────────────────
  // Not an extraction-process readout. It previews the steps ahead and tells the
  // user the plan is being generated in the background — when it's ready we'll
  // notify them to confirm the plan and start learning. This makes the handoff
  // into the product-value intro feel intentional instead of abrupt.
  const previewSteps = hasPreset
    ? [
        { icon: '🗺️', label: '思维导图' },
        { icon: '✨', label: '知识星图' },
        { icon: '📝', label: '多种题型' },
        { icon: '📊', label: '学习报告' },
      ]
    : [
        { icon: '🔍', label: '解析资料' },
        { icon: '🧩', label: '生成知识点' },
        { icon: '📊', label: '排学习计划' },
      ];
  return (
    <div className="flex flex-col h-full relative">
      <div className="h-[52px] flex items-center px-7 flex-shrink-0" style={{background:CARD,borderBottom:`1px solid ${BORDER}`}}>
        <button onClick={onExit} className="flex items-center gap-1.5 text-[12px] font-medium" style={{color:T3}}><ArrowLeft size={15}/>退出学习空间</button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-6 py-6 px-6">
        <div className="relative w-20 h-20 flex items-center justify-center">
          <svg viewBox="0 0 80 80" className="absolute inset-0 w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="40" cy="40" r="34" fill="none" stroke="#EBEBEB" strokeWidth="5" />
            <circle cx="40" cy="40" r="34" fill="none" stroke={BLUE} strokeWidth="5"
              strokeDasharray={`${2 * Math.PI * 34 * genProgress / 100} 999`}
              style={{ transition: 'stroke-dasharray 0.6s ease' }} />
          </svg>
          <span className="text-[28px] z-10"
            style={{ display: 'inline-block', animation: 'spin 2s linear infinite' }}>✦</span>
        </div>
        <div className="text-center max-w-sm">
          <h1 className="text-[20px] font-bold mb-2" style={{ color: T1 }}>
            正在为你生成学习计划{dots}
          </h1>
          <p className="text-[13px] leading-relaxed" style={{ color: T3 }}>
            {hasPreset
              ? '生成需要一点时间，先花 1 分钟看看云记怎么帮你学。'
              : '这会花一点时间，你可以先离开。计划就绪后会提醒你确认并开始学习。'}
          </p>
        </div>
        <div className="w-full max-w-2xl">
          <p className="text-[11px] font-semibold mb-2.5 text-center" style={{ color: T4 }}>
            {hasPreset ? '接下来带你看看这些' : '正在为你做这些'}
          </p>
          <div className="flex flex-nowrap items-center justify-center gap-2">
            {previewSteps.map((s, i) => (
              <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ background: '#F3F4F6', border: `1px solid ${BORDER}` }}>
                <span className="text-[13px] flex-shrink-0">{s.icon}</span>
                <span className="text-[12px] font-medium whitespace-nowrap" style={{ color: T2 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── LCG RNG (seeded, deterministic) ──────────────────────────────────────────

function lcgRng(seed: number) {
  let s = seed >>> 0;
  return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
}

function B2Inner({ onNext, dots }: { onNext: () => void; dots?: React.ReactNode }) {
  const [branches, setBranches] = useState([
    { title: '受贿罪构成', color:'#6C8CFF', x:24, y:25, items: ['主体身份', '职务便利', '财物控制'] },
    { title: '斡旋受贿', color:'#8C6BFF', x:76, y:24, items: ['地位影响', '第三人谋利', '收受财物'] },
    { title: '既遂与量刑', color:'#35B37E', x:24, y:73, items: ['实际控制', '数额情节', '既遂标准'] },
    { title: '关联罪名', color:'#E6A23C', x:76, y:72, items: ['单位受贿', '利用影响力', '行贿罪'] },
  ]);
  const [selected, setSelected] = useState<{ branch: number; item: number } | null>(null);
  const [editing, setEditing] = useState(false);
  const [editDraft, setEditDraft] = useState('');
  const [showGesture, setShowGesture] = useState(true);
  const itemCount = branches.reduce((sum, branch) => sum + branch.items.length, 0);
  const selectItem = (branch: number, item: number) => {
    setSelected({ branch, item });
    setEditing(false);
    setShowGesture(false);
  };
  const editSelected = () => {
    if (!selected) return;
    setEditDraft(branches[selected.branch].items[selected.item]);
    setEditing(true);
  };
  const commitEdit = () => {
    if (!selected) return;
    const nextName = editDraft.trim();
    if (!nextName) {
      setEditing(false);
      return;
    }
    setBranches(prev => prev.map((branch, bi) => bi === selected.branch
      ? { ...branch, items: branch.items.map((item, ii) => ii === selected.item ? nextName : item) }
      : branch));
    setEditing(false);
  };
  const addKnowledge = () => {
    const branchIndex = selected?.branch ?? 0;
    setBranches(prev => prev.map((branch, bi) => bi === branchIndex
      ? { ...branch, items: [...branch.items, '新增知识点'] }
      : branch));
    setSelected({ branch: branchIndex, item: branches[branchIndex].items.length });
    setShowGesture(false);
  };
  const deleteSelected = () => {
    if (!selected) return;
    setBranches(prev => prev.map((branch, bi) => bi === selected.branch
      ? { ...branch, items: branch.items.filter((_, ii) => ii !== selected.item) }
      : branch));
    setSelected(null);
    setEditing(false);
  };
  return (
    <div className="flex flex-col flex-1 overflow-hidden max-w-[920px] w-full mx-auto">
      <div className="flex-1 relative rounded-2xl overflow-hidden mx-auto w-full" style={{ background:'linear-gradient(135deg,#FBFCFF,#F5F8FF)', border:`1px solid ${BORDER}`, minHeight: 0 }}>
        <div className="absolute left-3 top-3 z-20 flex items-center gap-2 text-[11px]">
          <span className="px-2.5 py-1 rounded-full font-semibold" style={{background:'rgba(234,243,255,.92)',color:BLUE}}>已整理 {branches.length} 个章节</span>
          <span className="px-2.5 py-1 rounded-full font-semibold" style={{background:'rgba(246,254,249,.92)',color:GREEN}}>提取 {itemCount} 个核心知识点</span>
        </div>
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs><filter id="mapShadow"><feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity=".12"/></filter></defs>
          {branches.map(b => <path key={b.title} d={`M50 50 C${b.x<50?38:62} 50 ${b.x<50?32:68} ${b.y} ${b.x} ${b.y}`} fill="none" stroke={b.color} strokeWidth=".7" opacity=".55"/>)}
          {branches.flatMap(b => b.items.map((_,i) => <path key={`${b.title}-${i}`} d={`M${b.x} ${b.y} C${b.x} ${b.y+(i-1)*7} ${b.x<50?b.x-8:b.x+8} ${b.y+(i-1)*8} ${b.x<50?b.x-12:b.x+12} ${b.y+(i-1)*8}`} fill="none" stroke={b.color} strokeWidth=".45" opacity=".35"/>))}
        </svg>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-5 py-3 rounded-2xl text-[14px] font-bold z-10 shadow-md" style={{ background:PRIMARY,color:'#6B5900',border:'2px solid #FFF3A8' }}>贿赂犯罪体系</div>
        {branches.map((b, bi) => <React.Fragment key={b.title}>
          <div className="absolute -translate-x-1/2 -translate-y-1/2 rounded-xl px-3 py-2 text-[11px] font-bold z-10 shadow-sm" style={{left:`${b.x}%`,top:`${b.y}%`,background:CARD,color:b.color,border:`1.5px solid ${b.color}`}}>{b.title}</div>
          {b.items.map((item,i) => {
            const isSelected = selected?.branch === bi && selected.item === i;
            const nodeStyle = {left:`${b.x<50?b.x-12:b.x+12}%`,top:`${b.y+(i-1)*8}%`,background:CARD,color:isSelected?b.color:T3,border:`1.5px solid ${isSelected?b.color:`${b.color}55`}`,boxShadow:isSelected?`0 0 0 5px ${b.color}18,0 5px 14px rgba(32,52,82,.14)`:'none'};
            if (isSelected && editing) {
              return <input key={`${bi}-${i}-editing`} autoFocus value={editDraft}
                onChange={e => setEditDraft(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={e => {
                  if (e.key === 'Enter') commitEdit();
                  if (e.key === 'Escape') setEditing(false);
                }}
                onClick={e => e.stopPropagation()}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-[9px] z-40 text-center outline-none"
                style={{...nodeStyle,width:Math.max(70,editDraft.length*13),boxShadow:`0 0 0 5px ${b.color}18,0 6px 18px rgba(32,52,82,.18)`}}/>;
            }
            return <button key={`${bi}-${i}-${item}`} onClick={() => selectItem(bi, i)}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-[9px] z-10 whitespace-nowrap transition-all"
              style={nodeStyle}>{item}</button>;
          })}
        </React.Fragment>)}
        {showGesture && <button onClick={() => selectItem(0, 1)} className="absolute z-30 flex items-center gap-1.5 px-3 py-2 rounded-full text-[10px] font-semibold"
          style={{left:'12%',top:'37%',background:'#2D8CFF',color:'#fff',boxShadow:'0 0 0 0 rgba(45,140,255,.4)',animation:'pulse 1.5s ease-in-out infinite'}}>
          <MousePointer2 size={14}/>点一下知识点
        </button>}
        {selected && <div className="absolute z-30 flex items-center gap-1 p-1 rounded-xl" style={{left:'50%',bottom:12,transform:'translateX(-50%)',background:'rgba(255,255,255,.96)',border:`1px solid ${BORDER}`,boxShadow:'0 8px 24px rgba(32,52,82,.14)'}}>
          <button onClick={editSelected} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px]" style={{color:T2}}><Pencil size={12}/>编辑</button>
          <button onClick={addKnowledge} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px]" style={{color:BLUE}}><Plus size={12}/>添加</button>
          <button onClick={deleteSelected} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px]" style={{color:RED}}><Trash2 size={12}/>删除</button>
        </div>}
      </div>
      <div className="pb-5 pt-2 flex-shrink-0">{dots}<CTAButton onClick={onNext}>查看这批知识点的掌握状态 →</CTAButton></div>
    </div>
  );
}

// ── B3 inner (used inside A5 demo chain) ──────────────────────────────────────

function B3Inner({ onNext, dots }: { onNext: () => void; dots?: React.ReactNode }) {
  const [newLit, setNewLit] = useState(0);
  const [playback, setPlayback] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const stars = useMemo(() => {
    const r = lcgRng(42);
    return Array.from({ length: 220 }, (_, i) => ({
      x: r() * 152 + 4, y: r() * 88 + 6,
      radius: r() * 0.82 + 0.22,
      opacity: r() * 0.13 + 0.03,
      cat: i < 46 ? 'mastered' : i < 54 ? 'new' : i < 110 ? 'learning' : 'dust',
    }));
  }, []);
  const backgroundStars = useMemo(() => {
    const r = lcgRng(2026);
    return Array.from({ length: 360 }, (_, i) => ({
      x: r() * 158 + 1,
      y: r() * 98 + 1,
      radius: i % 29 === 0 ? r() * .28 + .24 : r() * .14 + .05,
      opacity: r() * .28 + .06,
    }));
  }, []);

  const connections = useMemo(() => {
    const lit = stars.filter(s => s.cat === 'mastered').slice(0, 38);
    const pairs: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
    const seen = new Set<string>();
    for (let i = 0; i < lit.length; i++) {
      const dists = lit
        .map((s, j) => ({ j, d: Math.hypot(lit[i].x - s.x, lit[i].y - s.y) }))
        .filter(({ j, d }) => j !== i && d < 22)
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
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    setNewLit(0);
    setIsPlaying(true);
    setIsComplete(false);
    if (reduceMotion) {
      const reducedTimer = setTimeout(() => {
        setNewLit(8);
        setIsPlaying(false);
        setIsComplete(true);
      }, 300);
      return () => clearTimeout(reducedTimer);
    }
    const cues = [
      [650, 1], [1050, 2], [1700, 3], [2150, 4],
      [2600, 5], [3150, 6], [3550, 7], [3950, 8],
    ] as const;
    const timers = cues.map(([delay, value]) => setTimeout(() => setNewLit(value), delay));
    timers.push(setTimeout(() => {
      setIsPlaying(false);
      setIsComplete(true);
    }, 5000));
    return () => timers.forEach(clearTimeout);
  }, [playback, reduceMotion]);

  const replay = () => setPlayback(value => value + 1);

  const masteredStars = stars.filter(s => s.cat === 'mastered');
  const dustStars     = stars.filter(s => s.cat === 'dust');

  return (
    <div className="flex flex-col flex-1 overflow-hidden px-7 pt-5">
      <div className="pb-4 max-w-[1080px] w-full mx-auto flex items-center justify-between gap-8">
        <div className="min-w-0">
          <h1 className="text-[23px] font-bold leading-tight" style={{ color: T1 }}>刚才梳理出的知识点，正在沉淀成一片知识星空</h1>
          <p className="text-[14px] font-medium mt-2 leading-relaxed" style={{ color: BLUE }}>每掌握一个，就点亮一颗星；星与星相连，组成属于你的学习路径</p>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <div className="rounded-xl px-4 py-3 min-w-[160px] flex items-center justify-between gap-4" style={{background:'#FFFCED',border:'1px solid #F2E4A0'}}>
            <p className="text-[11px] font-medium" style={{color:'#8C7410'}}>本周新点亮</p>
            <p className="text-[21px] font-bold leading-none" style={{color:'#9B7A00'}}><span key={newLit}>{newLit}</span><span className="text-[10px] ml-1">颗</span></p>
          </div>
          <div className="rounded-xl px-4 py-3 min-w-[160px] flex items-center justify-between gap-4" style={{background:'#F4F8FF',border:'1px solid #D4E3FA'}}>
            <p className="text-[11px] font-medium" style={{color:'#56749D'}}>星空已点亮</p>
            <p className="text-[21px] font-bold leading-none" style={{color:BLUE}}>{48 + Math.round(newLit * 6 / 8)}<span className="text-[10px] ml-0.5">%</span></p>
          </div>
        </div>
      </div>
      <div className="flex-1 relative overflow-hidden mx-auto w-full max-w-[1080px] rounded-2xl"
        style={{
          background:'radial-gradient(ellipse at 68% 38%,#19376F 0%,#0B1C42 28%,#050B20 62%,#020511 100%)',
          minHeight:0,
          boxShadow:'inset 0 0 100px rgba(45,114,255,.2),0 10px 30px rgba(23,42,78,.18)',
          transform:reduceMotion || isComplete?'scale(1)':'scale(1.025)',
          transition:'transform 1s cubic-bezier(.22,.8,.3,1), box-shadow 1s ease',
        }}>
        {isComplete && !isPlaying && (
          <button onClick={replay} aria-label="重新播放星空动画"
            className="absolute right-3 top-3 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-opacity"
            style={{background:'rgba(255,255,255,.14)',border:'1px solid rgba(255,255,255,.22)',color:'#F4F8FF',backdropFilter:'blur(8px)'}}>
            <RotateCcw size={15}/>
          </button>
        )}
        <svg width="100%" height="100%" viewBox="0 0 160 100" preserveAspectRatio="xMidYMid meet"
          style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <filter id="blueGlow" x="-400%" y="-400%" width="900%" height="900%"><feGaussianBlur stdDeviation=".75" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id="goldGlow" x="-400%" y="-400%" width="900%" height="900%"><feGaussianBlur stdDeviation="1.15" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <radialGradient id="nebula"><stop offset="0" stopColor="#275CCB" stopOpacity=".22"/><stop offset="1" stopColor="#061127" stopOpacity="0"/></radialGradient>
            <linearGradient id="activePath"><stop offset="0" stopColor="#FFF6B6"/><stop offset="1" stopColor="#75B7FF"/></linearGradient>
          </defs>
          <ellipse cx="112" cy="50" rx="54" ry="42" fill="url(#nebula)"/>
          <ellipse cx="38" cy="24" rx="34" ry="20" fill="#7436B8" opacity=".07"/>
          {backgroundStars.map((s, i) => <circle key={`bg-${i}`} cx={s.x} cy={s.y} r={s.radius} fill="#F5F8FF" opacity={s.opacity}
            style={isComplete && !reduceMotion ? {animation:`pulse ${2.8 + (i % 5) * .35}s ease-in-out ${(i % 7) * .18}s infinite`} : undefined}>
            {isComplete && !reduceMotion && i < 18 && <animate attributeName="cx" values={`${s.x};${s.x + .7};${s.x}`} dur={`${7 + (i % 5)}s`} repeatCount="indefinite"/>}
          </circle>)}
          {dustStars.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.radius * 0.4} fill="#FFFFFF" opacity={s.opacity} />
          ))}
          {connections.map((c, i) => (
            <line key={i} x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2}
              stroke="#C8D9F6" strokeWidth="0.12" opacity="0.18" strokeLinecap="round"
              style={isComplete && !reduceMotion ? {animation:`pulse ${3.2 + (i % 4) * .4}s ease-in-out ${(i % 6) * .2}s infinite`} : undefined}/>
          ))}
          {stars.filter(st => st.cat === 'learning').map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.radius * 0.7} fill="#7896C7" opacity={0.42} />
          ))}
          {masteredStars.map((s, i) => {
            const isLit      = i < 38 + newLit;
            const isNewlyLit = i >= 38 && i < 38 + newLit;
            return (
              <g key={i}>
                {isLit && i % 17 === 0 && <><line x1={s.x-2.4} y1={s.y} x2={s.x+2.4} y2={s.y} stroke={isNewlyLit?'#FFF1A2':'#D8E8FF'} strokeWidth=".18" opacity=".72"/><line x1={s.x} y1={s.y-3.2} x2={s.x} y2={s.y+3.2} stroke={isNewlyLit?'#FFF1A2':'#D8E8FF'} strokeWidth=".14" opacity=".64"/></>}
                <circle cx={s.x} cy={s.y} r={s.radius} fill={isLit ? (isNewlyLit?'#FFF2A5':'#F2F6FF') : '#465064'} opacity={isLit ? 0.98 : 0.26} filter={isLit?(isNewlyLit?'url(#goldGlow)':'url(#blueGlow)'):undefined}>
                  {isNewlyLit && <animate attributeName="opacity" values="0;0.95" dur="0.35s" fill="freeze" />}
                </circle>
                {isLit && (
                  <circle cx={s.x} cy={s.y} r={s.radius * 2.8} fill={isNewlyLit?'#FFECA0':'#B8D7FF'} opacity={isNewlyLit?0.11:0.045}>
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
            <circle key={i} cx={s.x} cy={s.y} r={s.radius * .8} fill="#73819C" opacity={0.34} />
          ))}
          {/* 掌握演示：对钩 → 星星 → 虚线展开 → 下一颗掌握 → 实线 */}
          <g>
            <line x1="72" y1="53" x2="92" y2="44" stroke="url(#activePath)" strokeWidth=".28"
              strokeDasharray={newLit >= 6 ? undefined : '1.4 1.4'} opacity={newLit >= 3 ? .9 : 0}>
              <animate attributeName="stroke-dashoffset" values="5;0" dur=".8s" repeatCount="indefinite"/>
            </line>
            <line x1="72" y1="53" x2="58" y2="39" stroke="#B7D7FF" strokeWidth=".22" strokeDasharray="1.2 1.4" opacity={newLit >= 3 ? .48 : 0}/>
            <line x1="92" y1="44" x2="108" y2="52" stroke="#B7D7FF" strokeWidth=".22" strokeDasharray="1.2 1.4" opacity={newLit >= 7 ? .48 : 0}/>
            <circle cx="72" cy="53" r="4.2" fill="#FFE562" opacity={newLit >= 2 ? .07 : 0}/>
            <circle cx="72" cy="53" r="1.15" fill="#FFF4A8" filter="url(#goldGlow)" opacity={newLit >= 2 ? 1 : .25}/>
            {newLit < 2 && <g stroke="#FFF" strokeWidth=".55" fill="none"><path d="M70.2 53 l1.2 1.2 2.6-3"/></g>}
            <circle cx="92" cy="44" r="1.15" fill={newLit >= 6 ? '#FFF4A8' : '#67758F'} filter={newLit >= 6 ? 'url(#goldGlow)' : undefined}/>
            {newLit === 5 && <g stroke="#FFF" strokeWidth=".55" fill="none"><path d="M90.2 44 l1.2 1.2 2.6-3"/></g>}
          </g>
          {[
            {x:34,y:30,t:'受贿罪构成'},{x:84,y:38,t:'斡旋受贿'},{x:122,y:69,t:'既遂标准'},{x:62,y:77,t:'数额与情节'}
          ].map((p,i)=><g key={p.t}><circle cx={p.x} cy={p.y} r={i===1?1.15:.82} fill={i===1?'#FFF1A0':'#F0F5FF'} filter={i===1?'url(#goldGlow)':'url(#blueGlow)'}/><text x={p.x+2} y={p.y+.8} fontSize="1.9" fill="#DDE8FF" opacity=".88">{p.t}</text></g>)}
          <text x="80" y="95" textAnchor="middle" fontSize="5" fill="#FFFFFF" opacity="0.035" fontFamily="sans-serif">
            刑法分论·贿赂渎职
          </text>
        </svg>
        {newLit >= 3 && newLit < 6 && <div className="absolute left-1/2 top-[46%] -translate-x-1/2 px-3 py-1.5 rounded-full text-[10px] font-medium" style={{background:'rgba(9,19,45,.88)',border:'1px solid rgba(154,196,255,.35)',color:'#BBD8FF'}}>新的知识关联正在展开…</div>}
        {newLit >= 6 && newLit < 8 && <div className="absolute left-1/2 top-[46%] -translate-x-1/2 px-3 py-1.5 rounded-full text-[10px] font-medium" style={{background:'rgba(13,35,34,.9)',border:'1px solid rgba(139,220,177,.4)',color:'#BDF3D5'}}>学习路径已建立 ✓</div>}
      </div>
      <div className="pb-4 pt-2 max-w-[1080px] w-full mx-auto">
        {dots}
        <CTAButton onClick={onNext}>继续查看知识点 →</CTAButton>
      </div>
    </div>
  );
}

// ── B4 inner ──────────────────────────────────────────────────────────────────

function B4Inner({ onNext, dots }: { onNext: () => void; dots?: React.ReactNode }) {
  const [flipped, setFlipped] = useState(false);
  const [saved, setSaved] = useState(false);
  const [mastered, setMastered] = useState(false);
  const [saveToast, setSaveToast] = useState('');
  useEffect(() => {
    if (!saveToast) return;
    const id = setTimeout(() => setSaveToast(''), 1600);
    return () => clearTimeout(id);
  }, [saveToast]);
  const toggleSaved = () => {
    setSaved(current => {
      setSaveToast(current ? '已取消收藏' : '已收藏到「我的收藏」');
      return !current;
    });
  };
  return (
    <div className="flex flex-col flex-1 overflow-hidden max-w-[760px] w-full mx-auto relative">
      {saveToast && <div className="absolute top-1 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full text-[12px] font-semibold" style={{background:'#222',color:'#fff',boxShadow:'0 8px 24px rgba(0,0,0,.2)'}}><Check size={14} color="#7CE3A3"/>{saveToast}</div>}
      <div className="flex-1 flex flex-col items-center justify-center pb-3 min-h-0">
        <div className="w-full max-w-[620px]" style={{perspective:'1200px'}}>
          <button onClick={() => setFlipped(v => !v)} className="relative w-full text-left active:scale-[0.99]"
            style={{height:250,transformStyle:'preserve-3d',transform:`rotateY(${flipped ? 180 : 0}deg)`,transition:'transform .55s cubic-bezier(.2,.75,.25,1)'}}>
            <div className="absolute inset-0 rounded-[24px] p-6 flex flex-col" style={{backfaceVisibility:'hidden',background:'linear-gradient(145deg,#FFFFFF,#FAFBFF)',border:'1px solid #DFE5EF',boxShadow:'0 16px 45px rgba(32,55,90,.12)'}}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider" style={{color:BLUE}}>知识闪卡 · 正面</span>
                <span onClick={e => {e.stopPropagation();toggleSaved();}} className="p-2 -m-2 rounded-full" aria-label="收藏">
                  <Star size={21} fill={saved ? '#FFE562' : 'none'} color={saved ? '#D9B900' : '#AAB2C0'}/>
                </span>
              </div>
              <div className="flex-1 flex items-center justify-center text-center px-8"><p className="text-[22px] font-bold leading-relaxed" style={{color:T1}}>斡旋受贿罪的行为主体是谁？</p></div>
              <p className="text-[12px] text-center flex items-center justify-center gap-1.5" style={{color:T4}}><RotateCcw size={13}/>点击卡片翻面查看答案</p>
            </div>
            <div className="absolute inset-0 rounded-[24px] p-6 flex flex-col" style={{backfaceVisibility:'hidden',transform:'rotateY(180deg)',background:'linear-gradient(145deg,#F7FFF9,#FFFFFF)',border:'1.5px solid #AEE5C1',boxShadow:'0 16px 45px rgba(0,166,62,.1)'}}>
              <div className="flex items-center justify-between"><span className="text-[11px] font-bold tracking-wider" style={{color:GREEN}}>知识闪卡 · 答案</span><Check size={20} color={GREEN}/></div>
              <div className="flex-1 flex items-center"><p className="text-[15px] leading-7" style={{color:T2}}>斡旋受贿罪的行为主体是<strong>国家工作人员</strong>。行为人利用职权或地位形成的影响力，斡旋其他国家工作人员为请托人谋利，并从请托人处收取财物。</p></div>
              <p className="text-[11px] text-center" style={{color:T4}}>再次点击可返回正面</p>
            </div>
          </button>
          <div className="h-12 mt-3 flex items-center justify-center">
            {flipped && <button onClick={() => setMastered(v=>!v)} className="flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold" style={{background:mastered?'#EAF9EF':'#F2F4F7',color:mastered?GREEN:T3}}><Check size={15}/>{mastered?'已掌握':'已掌握，跳过后续练习'}</button>}
          </div>
        </div>
      </div>
      <div className="pb-5 pt-1 max-w-[620px] w-full mx-auto">
        {dots}
        <CTAButton onClick={onNext}>下一题 →</CTAButton>
      </div>
    </div>
  );
}

// ── B5 inner ──────────────────────────────────────────────────────────────────

function B5Inner({ onNext, dots }: { onNext: () => void; dots?: React.ReactNode }) {
  type PracticeType = '单选' | '填空' | '判断' | '多选' | '简答';
  const journey: Array<{ type: PracticeType; purpose: string }> = [
    { type: '单选', purpose: '识别概念' },
    { type: '填空', purpose: '记忆关键词' },
    { type: '判断', purpose: '辨析概念' },
    { type: '多选', purpose: '强化理解' },
    { type: '简答', purpose: '训练应用' },
  ];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [draft, setDraft] = useState('');
  const [solved, setSolved] = useState(false);
  const [multiSelected, setMultiSelected] = useState<Set<string>>(new Set());
  const [showSource, setShowSource] = useState(false);
  const [showSourceTip, setShowSourceTip] = useState(false);
  const [replayKey, setReplayKey] = useState(0);
  const [typeHintDismissed, setTypeHintDismissed] = useState(false);
  const [firstRoundDone, setFirstRoundDone] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [wide, setWide] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const update = () => setWide(el.clientWidth >= 760);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const contents = {
    单选: { question: '斡旋受贿罪的行为主体必须是？', answer: '国家工作人员', analysis: '斡旋受贿属于受贿罪的特殊形态，行为主体必须具有国家工作人员身份。' },
    填空: { question: '斡旋受贿罪的行为主体必须是 ______。', user: '公职人员', answer: '国家工作人员', analysis: '"公职人员"范围过宽，法条要求行为人具有国家工作人员身份。' },
    判断: { question: '斡旋受贿要求行为人亲自利用本人职务为请托人谋利。', user: '正确', answer: '错误', analysis: '其核心是利用职权或地位形成的影响，通过其他国家工作人员为请托人谋利。' },
    多选: { question: '斡旋受贿的成立条件包括哪些？', user: '☑ 国家工作人员身份　☐ 地位影响　☑ 收受财物', answer: '☑ 国家工作人员身份　☑ 地位影响　☑ 收受财物', analysis: '三项均是关键条件；多选题使用方形复选框表达。' },
    简答: { question: '请用一句话说明斡旋受贿与普通受贿的核心区别。', user: '通过别人办事并收钱。', answer: '利用职权或地位形成的影响，斡旋其他国家工作人员为请托人谋利并收受财物。', analysis: '已命中"他人办事、收受财物"，遗漏"职权或地位形成的影响"。' },
  } as const;
  const currentType = journey[currentIndex].type;
  const current = contents[currentType];
  useEffect(() => {
    setSolved(false);
    setDraft('');
    setMultiSelected(new Set());
    setShowSource(false);
    const timers: ReturnType<typeof setTimeout>[] = [];
    const preset = currentType === '单选' ? '国家工作人员'
      : currentType === '填空' ? '公职人员'
      : currentType === '判断' ? '错误'
      : currentType === '简答' ? '通过别人办事并收钱。'
      : '';
    if (currentType === '填空' || currentType === '简答') {
      let index = 0;
      timers.push(setTimeout(() => {
        const typing = setInterval(() => {
          index += 1;
          setDraft(preset.slice(0, index));
          if (index >= preset.length) clearInterval(typing);
        }, 55);
        timers.push(typing as unknown as ReturnType<typeof setTimeout>);
      }, 350));
    } else if (currentType === '多选') {
      timers.push(setTimeout(() => {
        const selected = new Set(['国家工作人员身份', '职权或地位形成的影响', '收受财物']);
        setMultiSelected(selected);
        setDraft([...selected].join('、'));
      }, 500));
    } else {
      timers.push(setTimeout(() => setDraft(preset), 500));
    }
    const solveAt = currentType === '简答' ? 2100 : currentType === '填空' ? 1500 : 1250;
    timers.push(setTimeout(() => setSolved(true), solveAt));
    if (autoPlay) {
      timers.push(setTimeout(() => setShowSource(true), solveAt + 700));
    }
    return () => timers.forEach(clearTimeout);
  }, [currentType, replayKey]);
  useEffect(() => {
    if (!autoPlay || !solved) return;
    if (currentIndex >= journey.length - 1) {
      const t = setTimeout(() => setFirstRoundDone(true), 1600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setCurrentIndex(i => i + 1);
      setReplayKey(k => k + 1);
    }, 2600);
    return () => clearTimeout(t);
  }, [autoPlay, solved, currentIndex]);
  const isCorrect = currentType === '单选' ? draft === '国家工作人员'
    : currentType === '填空' ? draft.trim() === '国家工作人员'
    : currentType === '判断' ? draft === '错误'
    : currentType === '多选' ? multiSelected.size === 3 && !multiSelected.has('仅靠普通私人交情')
    : draft.includes('影响') || draft.includes('职权');
  const selectPractice = (index: number) => {
    if (autoPlay) setShowSourceTip(true);
    setAutoPlay(false);
    setCurrentIndex(index);
    setReplayKey(key => key + 1);
    setTypeHintDismissed(true);
  };
  const replayCurrent = (index: number) => {
    setAutoPlay(false);
    setCurrentIndex(index);
    setReplayKey(key => key + 1);
    setTypeHintDismissed(true);
  };
  const nextPractice = () => onNext();
  const renderTabs = (vertical: boolean) => (
    <div className={vertical ? 'flex flex-col gap-2 relative' : 'grid grid-cols-5 gap-1.5 relative'}>
      {firstRoundDone && !typeHintDismissed && (
        <div className="absolute z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold whitespace-nowrap pointer-events-none"
          style={vertical
            ? {left:'100%',top:'8px',marginLeft:'8px',background:'#2D8CFF',color:'#fff',boxShadow:'0 6px 16px rgba(45,140,255,.32)',animation:'pulse 1.5s ease-in-out infinite'}
            : {left:'30%',top:'-30px',transform:'translateX(-50%)',background:'#2D8CFF',color:'#fff',boxShadow:'0 6px 16px rgba(45,140,255,.32)',animation:'pulse 1.5s ease-in-out infinite'}}>
          <MousePointer2 size={13}/>点击可查看该题型
          <span className="absolute w-2 h-2 rotate-45" style={vertical?{left:'-3px',top:'12px',background:'#2D8CFF'}:{left:'50%',bottom:'-4px',transform:'translateX(-50%)',background:'#2D8CFF'}}/>
        </div>
      )}
      {journey.map((step, index) => {
        const active = index === currentIndex;
        return (
          <div key={step.type}
            className={`rounded-xl transition-all flex items-center ${vertical ? 'px-3.5 py-3 gap-2' : 'flex-col px-2 py-2.5 gap-0.5 relative'}`}
            style={{background:active?'#EAF3FF':CARD,border:`1.5px solid ${active?BLUE:'#E3E5E9'}`,boxShadow:active?'0 4px 14px rgba(47,137,252,.18)':'0 1px 2px rgba(20,35,60,.04)'}}>
            <button onClick={() => selectPractice(index)} className={vertical ? 'flex-1 text-left' : 'w-full text-center'}>
              <p className="text-[13px] font-bold" style={{color:active?BLUE:T1}}>{step.type}</p>
              <p className="text-[10px] mt-0.5 font-medium" style={{color:active?'#5B9BF5':T3}}>{step.purpose}</p>
            </button>
            {active && solved && (
              <button onClick={() => replayCurrent(index)} title="重播本题演示"
                className={`flex items-center justify-center rounded-full flex-shrink-0 ${vertical ? 'w-7 h-7' : 'absolute top-1 right-1 w-5 h-5'}`}
                style={{background:BLUE,color:'#fff'}}>
                <RotateCcw size={vertical?13:10}/>
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
  const questionCard = (
    <div className="flex-1 rounded-2xl p-5 overflow-y-auto min-h-0" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow:'0 10px 32px rgba(20,35,60,.06)' }}>
      <p className="text-[15px] font-semibold mb-4" style={{ color: T1 }}>{current.question}</p>
      {currentType === '单选' && <div className="grid grid-cols-2 gap-2 mb-3">{['国家工作人员','一般公职人员','受托办事人员','任何自然人'].map(v => {
        const selected = draft === v; const correct = v === '国家工作人员';
        return <button key={v} disabled className="py-3 rounded-xl text-[11px] flex items-center justify-center gap-1.5" style={{background:solved&&correct?'#EAF9EF':solved&&selected&&!correct?'#FFF0EE':selected?'#FFFBDE':'#F6F6F6',border:`1.5px solid ${solved&&correct?GREEN:solved&&selected&&!correct?RED:selected?PRIMARY:BORDER}`,color:solved&&correct?GREEN:T2}}>{v}{solved&&correct&&<Check size={12}/>} </button>})}</div>}
      {currentType === '判断' && <div className="grid grid-cols-2 gap-2 mb-3">{['正确','错误'].map(v => {
        const selected=draft===v; const correct=v==='错误';
        return <button key={v} disabled className="py-3 rounded-xl text-[12px]" style={{background:solved&&correct?'#EAF9EF':solved&&selected&&!correct?'#FFF0EE':selected?'#FFFBDE':'#F6F6F6',border:`1.5px solid ${solved&&correct?GREEN:solved&&selected&&!correct?RED:selected?PRIMARY:BORDER}`,color:solved&&correct?GREEN:T2}}>{v}{solved&&correct?' ✓':''}</button>})}</div>}
      {currentType === '多选' && <div className="grid grid-cols-2 gap-2 mb-3">{['国家工作人员身份','职权或地位形成的影响','收受财物','仅靠普通私人交情'].map(v => {
        const checked=multiSelected.has(v); const correct=v!=='仅靠普通私人交情';
        return <button key={v} disabled className="w-full text-left px-3 py-2 rounded-lg text-[12px] flex items-center gap-2" style={{background:solved&&correct?'#EAF9EF':solved&&checked&&!correct?'#FFF0EE':checked?'#FFFBDE':'#F6F6F6',border:`1.5px solid ${solved&&correct?GREEN:solved&&checked&&!correct?RED:checked?PRIMARY:BORDER}`}}><span className="w-4 h-4 rounded flex items-center justify-center" style={{background:(solved&&correct)?GREEN:checked?BLUE:CARD,border:`1px solid ${(solved&&correct)?GREEN:checked?BLUE:'#C9CDD3'}`}}>{(checked||solved&&correct)&&<Check size={11} color="#fff" strokeWidth={3}/>}</span>{v}</button>})}</div>}
      {(currentType === '填空' || currentType === '简答') && <div className="relative mb-3"><textarea value={draft} readOnly onChange={e => setDraft(e.target.value)} className="w-full rounded-xl p-3 text-[12px] resize-none" style={{border:`1.5px solid ${solved?(isCorrect?GREEN:RED):BORDER}`,background:solved?(isCorrect?'#F1FBF5':'#FFF7F5'):'#FAFAFA',minHeight:68,color:T2}}/><span className="absolute right-3 bottom-2 text-[9px]" style={{color:T4}}>演示答案已自动填入</span></div>}
      {!solved && <div className="rounded-xl px-3 py-2 flex items-center gap-2 text-[10px]" style={{background:'#F6F8FC',color:T3}}><Sparkles size={12} color={BLUE}/>预制答案正在自动完成，无需手动作答</div>}
      {solved && <>
        <div className="rounded-2xl p-4 relative" style={{background:isCorrect?'#F1FBF5':'#FFF8E7',border:`1px solid ${isCorrect?'#B7EFCF':'#F4D99A'}`}}>
          <div className="flex items-center gap-2 mb-2"><div className="w-6 h-6 rounded-full flex items-center justify-center" style={{background:isCorrect?GREEN:'#E6A23C'}}>{isCorrect?<Check size={14} color="#fff"/>:<span className="text-white text-[12px]">!</span>}</div><p className="text-[13px] font-bold" style={{color:isCorrect?GREEN:'#9A6B00'}}>{isCorrect?'回答正确':'还差一点'}</p><span className="ml-auto px-2.5 py-1 rounded-full text-[10px] font-bold" style={{background:isCorrect?'#DDF6E6':'#F8E8BB',color:isCorrect?GREEN:'#8C6500'}}>{isCorrect?'掌握程度 +1':'掌握程度暂未提升'}</span></div>
          <p className="text-[11.5px] leading-5" style={{color:T2}}>{current.analysis}</p>
          <div className="mt-3 pt-2.5 relative" style={{borderTop:`1px solid ${isCorrect?'#D7EFDF':'#EFE1B8'}`}}>
            <button onClick={()=>{setShowSource(v=>!v);setShowSourceTip(false);}} className="flex items-center gap-1 text-[11px] font-semibold" style={{color:BLUE}}><BookOpen size={13}/>{showSource?'收起来源':'查看来源'}</button>
            {showSourceTip&&<div className="absolute left-0 bottom-[26px] z-20 w-[200px] px-3 py-2 rounded-xl text-[9px] leading-4" style={{background:'#20283A',color:'#fff',boxShadow:'0 8px 22px rgba(0,0,0,.2)'}}>对解析有疑问？可以查看教材原文<div className="absolute left-6 -bottom-1 w-2 h-2 rotate-45" style={{background:'#20283A'}}/></div>}
            {showSource&&<div className="mt-2.5 rounded-xl p-3 flex items-start gap-2" style={{background:'rgba(255,255,255,.72)',border:`1px solid ${BORDER}`}}><FileText size={14} color={BLUE} className="mt-0.5"/><div><p className="text-[9px] font-semibold" style={{color:T2}}>刑法分论讲义.pdf · 第 42 页</p><p className="text-[9px] leading-4 mt-1" style={{color:T3}}>"国家工作人员利用本人职权或者地位形成的便利条件……"</p><mark className="text-[9px]" style={{background:'#FFF09A'}}>主体必须具有国家工作人员身份</mark></div></div>}
          </div>
        </div>
      </>}
    </div>
  );
  return (
    <div ref={rootRef} className="flex flex-col flex-1 overflow-hidden max-w-[920px] w-full mx-auto">
      {wide ? (
        <div className="flex-1 flex gap-4 min-h-0">
          <div className="w-[160px] flex-shrink-0 flex flex-col">
            {renderTabs(true)}
          </div>
          <div className="flex-1 flex flex-col min-w-0">
            {questionCard}
          </div>
        </div>
      ) : (
        <>
          <div className="mb-3">
            {renderTabs(false)}
          </div>
          {questionCard}
        </>
      )}
      <div className="pb-5 pt-2 flex-shrink-0">
        {dots}
        <CTAButton onClick={nextPractice}>继续体验 AI 辅导 →</CTAButton>
      </div>
    </div>
  );
}

function ScratchpadDemo({ onNext, dots }: { onNext: () => void; dots?: React.ReactNode }) {
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
      <div className="pb-5 pt-1">{dots}<CTAButton onClick={onNext}>继续：看看 AI 如何讲解 →</CTAButton></div>
    </div>
  );
}

function TracebackDemo({ onNext, dots }: { onNext: () => void; dots?: React.ReactNode }) {
  const [marked, setMarked] = useState(false);
  const [selectedText, setSelectedText] = useState(false);
  const [showNoteWindow, setShowNoteWindow] = useState(false);
  const [noteTool, setNoteTool] = useState<'pen' | 'highlight' | 'eraser'>('pen');
  const [notePage, setNotePage] = useState(7);
  return (
    <div className="flex flex-col flex-1 overflow-hidden max-w-[1040px] w-full mx-auto relative">
      <div className="flex-1 grid grid-cols-[42%_58%] rounded-2xl overflow-hidden min-h-0" style={{ border: `1px solid #DDE3EC`, boxShadow:'0 12px 36px rgba(24,42,70,.08)' }}>
        <div className="p-4 flex flex-col" style={{ background: '#F8F9FB', borderRight:'1px solid #DDE3EC' }}>
          <div className="flex items-center gap-2 mb-3"><span className="px-2.5 py-1 rounded-full text-[10px] font-semibold" style={{background:'#EAF3FF',color:BLUE}}>当前题目</span><span className="text-[10px]" style={{color:T4}}>单选题 · 斡旋受贿</span></div>
          <p className="text-[13px] font-bold leading-5 mb-3" style={{ color: T1 }}>甲利用本人职权形成的影响，通过其他国家工作人员为请托人谋利并收受财物，应如何认定？</p>
          <div className="space-y-2">
            {['A. 普通受贿罪','B. 斡旋受贿','C. 利用影响力受贿罪'].map((v,i)=><div key={v} className="rounded-xl px-3 py-2.5 text-[11px] flex items-center gap-2" style={{background:i===1?'#EAF9EF':CARD,border:`1.5px solid ${i===1?'#8BD5A8':BORDER}`,color:i===1?GREEN:T2}}><span className="w-4 h-4 rounded-full flex items-center justify-center" style={{border:`1px solid ${i===1?GREEN:'#C8CDD5'}`,background:i===1?GREEN:CARD}}>{i===1&&<Check size={10} color="#fff"/>}</span>{v}</div>)}
          </div>
          <div className="mt-auto pt-3 flex items-center gap-2 text-[10px]" style={{color:GREEN}}><Check size={13}/>回答正确 · 解析可追溯</div>
        </div>
        <div className="flex flex-col min-w-0" style={{ background: CARD }}>
          <div className="flex items-center px-4 py-3 gap-3" style={{borderBottom:`1px solid ${BORDER}`}}><BookOpen size={15} color={BLUE}/><div className="flex-1"><p className="text-[11px] font-bold" style={{color:T1}}>刑法分论讲义.pdf</p><p className="text-[9px]" style={{color:T4}}>第 42 页 · 以下为导入时的内容快照</p></div></div>
          <div className="flex-1 overflow-y-auto px-5 py-4 text-[11px] leading-6" style={{color:T2}}>
            <p className="font-bold text-[14px] mb-2" style={{color:T1}}>第三节　受贿罪的特殊形态</p>
            <p className="mb-2">斡旋受贿是受贿罪的一种特殊表现形式，其主体必须为国家工作人员。</p>
            <button onClick={()=>setSelectedText(true)} className="w-full text-left rounded-xl px-3 py-2.5 my-2 relative"
              style={{background:marked?'#FFF2A8':selectedText?'#EAF3FF':'#FFF9D9',borderLeft:`3px solid ${marked?'#E1B800':selectedText?BLUE:'#F0C800'}`}}>
              <span className="text-[11px] leading-6">通过其他国家工作人员职务上的行为，为请托人谋取不正当利益，并索取或者收受请托人财物的，以受贿罪论处。</span>
              {selectedText && !marked && <span className="absolute -top-3 right-3 px-2 py-1 rounded-lg text-[9px] font-semibold" style={{background:'#20242D',color:'#fff'}}>已选中文字</span>}
            </button>
            <p>判断时应区分普通私人交情与职权、地位形成的影响。</p>
            {marked && <p className="mt-2 text-[10px] font-semibold" style={{color:GREEN}}>✓ 高亮已写入原笔记</p>}
          </div>
          <div className="px-4 py-3 flex gap-2" style={{borderTop:`1px solid ${BORDER}`}}>
            <button onClick={()=>{setSelectedText(true);setMarked(true);}} className="px-3 py-2 rounded-lg text-[10px] font-semibold" style={{background:marked?'#EAF9EF':PRIMARY,color:marked?GREEN:'#6B5900'}}>{marked?'已标记 ✓':'标记所选文字'}</button>
            <button onClick={()=>setShowNoteWindow(true)} className="px-3 py-2 rounded-lg text-[10px]" style={{background:'#EAF3FF',color:BLUE}}>打开原笔记（最新）</button>
          </div>
        </div>
      </div>
      {showNoteWindow && (
        <div className="absolute inset-0 z-50 flex items-center justify-center rounded-2xl" style={{background:'rgba(20,25,35,.28)',backdropFilter:'blur(1px)'}}>
          <div className="w-[90%] h-[86%] rounded-[18px] overflow-hidden flex flex-col" style={{background:'#ECEDEF',border:'1px solid #CDD2DA',boxShadow:'0 22px 64px rgba(13,22,38,.30)'}}>
            <div className="h-12 flex items-center gap-3 px-4 cursor-move flex-shrink-0" style={{background:'#796B82',color:'#fff'}}>
              <button onClick={()=>setShowNoteWindow(false)} className="p-1 rounded-lg hover:bg-white/10"><ArrowLeft size={18}/></button>
              <div className="grid grid-cols-2 gap-0.5 p-1"><span className="w-2 h-2 bg-white rounded-[2px]"/><span className="w-2 h-2 bg-white rounded-[2px]"/><span className="w-2 h-2 bg-white rounded-[2px]"/><span className="w-2 h-2 bg-white rounded-[2px]"/></div>
              <Bookmark size={18}/><Plus size={19}/><span className="text-[16px]">⌗</span>
              <div className="flex-1 text-center min-w-0"><p className="text-[12px] font-semibold truncate">刑法分论讲义.pdf</p><p className="text-[8px] text-white/70">最新笔记 · 与练习内容可能有差异</p></div>
              <Search size={18}/><span className="text-[17px]">☝</span><span className="text-[17px]">◉</span><MoreHorizontal size={19}/>
              <button onClick={()=>setShowNoteWindow(false)} className="p-1.5 rounded-lg bg-white/10"><X size={17}/></button>
            </div>
            <div className="h-14 px-4 flex items-center gap-2 flex-shrink-0 overflow-x-auto" style={{background:CARD,borderBottom:`1px solid #D4D7DC`}}>
              <span className="text-[18px] text-gray-400 mr-1">↶</span><span className="text-[18px] text-gray-400 mr-2">↷</span>
              {[
                {id:'pen',label:'✎',title:'钢笔'},
                {id:'highlight',label:'▰',title:'荧光笔'},
                {id:'eraser',label:'▱',title:'橡皮'},
              ].map(tool=><button key={tool.id} title={tool.title} onClick={()=>setNoteTool(tool.id as 'pen'|'highlight'|'eraser')} className="w-9 h-9 rounded-xl text-[20px] flex items-center justify-center" style={{background:noteTool===tool.id?'#FFF2A8':'#F5F6F7',border:`1px solid ${noteTool===tool.id?'#E4C73D':'#E1E3E6'}`}}>{tool.label}</button>)}
              <button className="w-9 h-9 rounded-xl border bg-gray-50 text-[18px]">◌</button>
              <button className="w-9 h-9 rounded-xl border bg-gray-50"><Image size={17} className="mx-auto"/></button>
              <button className="w-9 h-9 rounded-xl border bg-gray-50 font-serif text-[17px]">T</button>
              <button className="w-9 h-9 rounded-xl border bg-gray-50 text-[17px]">○△</button>
              <span className="h-7 w-px bg-gray-200 mx-1"/>
              <span className="w-6 h-6 rounded-full bg-[#273C67] border-2 border-white shadow"/>
              <span className="w-6 h-6 rounded-full bg-[#F02F47] border-2 border-white shadow"/>
              <span className="w-6 h-6 rounded-full bg-black border-2 border-white shadow"/>
              <div className="flex items-center gap-2 ml-2"><span className="w-6 h-[2px] bg-black"/><span className="w-6 h-1 bg-black rounded"/><span className="w-6 h-2 bg-black rounded"/></div>
            </div>
            <div className="flex-1 min-h-0 overflow-auto p-5 relative" style={{background:'#E9EAEC'}}>
              <div className="sticky top-0 z-20 ml-auto mb-2 w-fit flex items-center rounded-full overflow-hidden shadow bg-white text-[11px]" style={{color:T3}}>
                <button onClick={()=>setNotePage(p=>Math.max(1,p-1))} className="px-3 py-2">‹</button><span className="px-3">{notePage} / 249</span><button onClick={()=>setNotePage(p=>Math.min(249,p+1))} className="px-3 py-2">›</button>
              </div>
              <article className="relative mx-auto w-[82%] min-h-[1020px] px-[8%] py-[6%] shadow-sm" style={{background:'#FFF',color:'#2D3035'}}>
                <p className="text-right text-[11px] font-semibold mb-8">刑法｜授课精要</p>
                <h2 className="text-[21px] font-bold mb-6" style={{color:'#2BAE8A'}}>二、解释理由：论证结论的合理性</h2>
                <h3 className="text-[17px] font-bold mb-3" style={{color:'#2BAE8A'}}>（一）体系解释</h3>
                <div className="space-y-3 text-[14px] leading-8">
                  <p>1．"同一用语的含义相对化"（一词多义）。体系解释并不意味着同一用语在不同条文中需要保持同一含义。相反，同一用语在不同语境中可以保持不同含义。</p>
                  <p><span style={{color:'#2BAE8A'}}>［练习 1］</span>（2016 年第 51 题），强制猥亵、侮辱罪与侮辱罪，二者中的"侮辱"含义是否相同？</p>
                  <p><span style={{color:'#2BAE8A'}}>［练习 2］</span>甲开设洗浴中心，组织服务员只提供色情按摩服务，不提供性交服务。甲是否构成组织卖淫罪？</p>
                  <p>2．"不同用语的含义同一化"（多词一义）。刑法中几个不同的用语也可以保持同一个含义。</p>
                  <p className="rounded px-2 -mx-2" style={{background:marked?'#FFF1A6':'transparent'}}><span style={{color:'#2BAE8A'}}>［问题］</span>刑法条文中的"出售""销售""倒卖""贩卖"的含义是否相同？</p>
                </div>
                <h3 className="text-[17px] font-bold mt-6 mb-3" style={{color:'#2BAE8A'}}>（二）当然解释</h3>
                <div className="space-y-3 text-[14px] leading-8">
                  <p><span style={{color:'#2BAE8A'}}>［问题］</span>可否主张"强制猥亵都是犯罪，强奸更应是犯罪"？</p>
                  <p><span style={{color:'#2BAE8A'}}>［考点］</span>当然解释，是指在论证无罪时"举重以明轻"，在论证有罪时"举轻以明重"。</p>
                  <p><span style={{color:'#2BAE8A'}}>［注意］</span>当然解释所比较的两个事项必须是性质相同、程度不同的关系。</p>
                </div>
                <h3 className="text-[17px] font-bold mt-6 mb-3" style={{color:'#2BAE8A'}}>（三）目的解释</h3>
                <p className="text-[14px] leading-8"><span style={{color:'#2BAE8A'}}>［考点］</span>目的解释，是指根据刑法的保护目的为解释的结论提供理由。刑法的保护目的就是法益。</p>
                <svg className="absolute inset-0 w-full h-full pointer-events-none"><path d="M205 480 C300 468 390 490 515 474" fill="none" stroke={noteTool==='highlight'?'#F1D73A':'#2D8CFF'} strokeWidth={noteTool==='highlight'?12:3} strokeLinecap="round" opacity=".55"/><path d="M650 690 q45 -30 88 12" fill="none" stroke="#F02F47" strokeWidth="3" strokeLinecap="round"/></svg>
                <span className="absolute bottom-5 right-6 text-[14px]" style={{color:'#2BAE8A'}}>{notePage}</span>
              </article>
            </div>
          </div>
        </div>
      )}
      <div className="pb-5 pt-2 flex-shrink-0">{dots}<CTAButton onClick={onNext}>继续看学习结果 →</CTAButton></div>
    </div>
  );
}

// ── B6 inner ──────────────────────────────────────────────────────────────────

// B6 对话脚本：回合制自动演示（用户提问 → AI 讲解 → 内嵌判断题 → 内嵌填空题 → 掌握收尾）
type B6Item =
  | { role: 'user'; text: string }
  | { role: 'ai'; text: string }
  | { role: 'done'; text: string }
  | { role: 'quiz'; kind: 'judgment' | 'blank'; stem: string; options: { key: string; label: string }[]; answer: string; autoKey: string; explanation: string };

const B6_SCRIPT: B6Item[] = [
  { role: 'user', text: '我总是搞混光合作用到底在哪里进行。' },
  { role: 'ai', text: '没关系，我们不背结论，做两道小题就懂了。先判断一下 👇' },
  { role: 'quiz', kind: 'judgment', stem: '光合作用主要在叶绿体中进行。', options: [{ key: 'T', label: '✓ 正确' }, { key: 'F', label: '✗ 错误' }], answer: 'T', autoKey: 'T', explanation: '对。叶绿体里含有叶绿素，是植物进行光合作用的主要场所。' },
  { role: 'ai', text: '很好！再补一道填空，看看能量最后去了哪里。' },
  { role: 'quiz', kind: 'blank', stem: '光合作用把光能转化为储存在 ___ 中的化学能。', options: [{ key: '有机物', label: '有机物' }, { key: '水', label: '水' }, { key: '氧气', label: '氧气' }], answer: '有机物', autoKey: '有机物', explanation: '正确。光能最终被固定在有机物（如葡萄糖）里，成为可储存的化学能。' },
  { role: 'done', text: '🎉 两道全对！你已经掌握【光合作用的场所与能量转化】。' },
];

function B6QuizInChat({ item, picked, onPick }: { item: Extract<B6Item, { role: 'quiz' }>; picked?: string; onPick: (key: string) => void }) {
  const answered = picked !== undefined;
  const correct = answered && picked === item.answer;
  const isBlank = item.kind === 'blank';
  return (
    <div className="max-w-[92%] rounded-2xl rounded-tl-md p-3" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
      <p className="text-[10px] font-semibold leading-5 mb-2" style={{ color: T1 }}>
        {isBlank
          ? <>光合作用把光能转化为储存在 <span className="px-1.5 py-0.5 rounded" style={{ background: answered ? '#EAF9EF' : '#FFF7DB', color: answered ? GREEN : '#A57400', fontWeight: 700 }}>{answered ? picked : '＿＿'}</span> 中的化学能。</>
          : item.stem}
      </p>
      {item.kind === 'judgment' ? (
        <div className="flex gap-2">
          {item.options.map(o => {
            // 仅高亮用户实际所选：对→绿 / 错→红；未选中的一律留白。可再次点击取消。
            const sel = picked === o.key;
            let bg = '#F7F8FA', bd = BORDER, fg = T2;
            if (sel) {
              if (o.key === item.answer) { bg = '#EAF9EF'; bd = GREEN; fg = GREEN; }
              else { bg = '#FFF0EE'; bd = RED; fg = RED; }
            }
            return <button key={o.key} onClick={() => onPick(o.key)} className="flex-1 py-2 rounded-lg text-[10px] font-semibold transition-colors" style={{ background: bg, border: `1px solid ${bd}`, color: fg }}>{o.label}</button>;
          })}
        </div>
      ) : (
        <div className="flex gap-1.5">
          {item.options.map(o => {
            const sel = picked === o.key;
            let bg = '#F7F8FA', bd = BORDER, fg = T2;
            if (sel) {
              if (o.key === item.answer) { bg = '#EAF9EF'; bd = GREEN; fg = GREEN; }
              else { bg = '#FFF0EE'; bd = RED; fg = RED; }
            }
            return <button key={o.key} onClick={() => onPick(o.key)} className="flex-1 py-1.5 rounded-lg text-[9px] font-semibold transition-colors" style={{ background: bg, border: `1px solid ${bd}`, color: fg }}>{o.label}</button>;
          })}
        </div>
      )}
      {answered && (
        <div className="mt-2 rounded-lg p-2.5 text-[9px] leading-5" style={{ background: correct ? '#EAF9EF' : '#FFF0EE' }}>
          <span className="font-semibold" style={{ color: correct ? GREEN : RED }}>{correct ? '✓ 正确！' : '✗ 再想想'}</span>
          <span style={{ color: T2 }}> {item.explanation}</span>
        </div>
      )}
    </div>
  );
}

function B6Inner({ onNext, dots }: { onNext: () => void; dots?: React.ReactNode }) {
  const [visible, setVisible] = useState(0);              // 已揭示的脚本条数
  const [typing, setTyping] = useState<{ idx: number; n: number } | null>(null); // 当前逐字打印
  const [picked, setPicked] = useState<Record<number, string>>({});             // 各题所选
  const [autoDone, setAutoDone] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const schedule = (fn: () => void, ms: number) => { const id = setTimeout(fn, ms); timers.current.push(id); };

  const play = () => {
    clearTimers();
    setVisible(0); setTyping(null); setPicked({}); setAutoDone(false);
    const typewrite = (idx: number, text: string, done: () => void) => {
      setTyping({ idx, n: 0 });
      let n = 0;
      const stepChar = () => { n++; setTyping({ idx, n }); if (n < text.length) schedule(stepChar, 26); else { setTyping(null); done(); } };
      schedule(stepChar, 26);
    };
    const runFrom = (i: number) => {
      if (i >= B6_SCRIPT.length) { setAutoDone(true); return; }
      const item = B6_SCRIPT[i];
      setVisible(i + 1);
      if (item.role === 'user') { schedule(() => runFrom(i + 1), 750); }
      else if (item.role === 'ai') { typewrite(i, item.text, () => schedule(() => runFrom(i + 1), 550)); }
      else if (item.role === 'done') { typewrite(i, item.text, () => setAutoDone(true)); }
      else if (item.role === 'quiz') {
        schedule(() => { setPicked(p => ({ ...p, [i]: item.autoKey })); schedule(() => runFrom(i + 1), 1500); }, 900);
      }
    };
    schedule(() => runFrom(0), 400);
  };

  useEffect(() => { play(); return clearTimers; }, []);
  useEffect(() => { requestAnimationFrame(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })); }, [visible, typing, picked]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden max-w-[980px] w-full mx-auto">
      <div className="flex-1 grid grid-cols-[44%_56%] rounded-2xl overflow-hidden min-h-0" style={{ background: CARD, border: '1px solid #DDE3EC', boxShadow: '0 12px 36px rgba(25,44,75,.09)' }}>
        {/* 左：触发辅导的错题（上下文） */}
        <div className="p-4 flex flex-col" style={{ background: '#F8F9FB', borderRight: `1px solid ${BORDER}` }}>
          <div className="flex items-center gap-2 mb-3"><span className="px-2 py-1 rounded-full text-[9px] font-semibold" style={{ background: '#FFF0EE', color: RED }}>回答错误</span><span className="text-[9px]" style={{ color: T4 }}>练习 · 单选题</span></div>
          <p className="text-[13px] font-bold leading-5 mb-3" style={{ color: T1 }}>光合作用主要发生在植物细胞的哪个结构中？</p>
          {[{ t: 'A. 线粒体', wrong: true }, { t: 'B. 叶绿体' }, { t: 'C. 细胞核' }].map(o => <div key={o.t} className="rounded-xl px-3 py-2.5 mb-2 text-[10px]" style={{ background: o.wrong ? '#FFF0EE' : CARD, border: `1px solid ${o.wrong ? '#FFC6BF' : BORDER}`, color: o.wrong ? RED : T2 }}>{o.t}</div>)}
        </div>
        {/* 右：AI 对话（回合制自动演示） */}
        <div className="flex flex-col min-w-0 min-h-0">
          <div className="flex items-center gap-2 px-4 py-2.5" style={{ borderBottom: `1px solid ${BORDER}` }}>
            <CloudMascot size={22} />
            <p className="flex-1 text-[11px] font-bold" style={{ color: T1 }}>AI 助教</p>
            {autoDone && <button onClick={play} className="flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-medium" style={{ background: '#EAF3FF', color: BLUE }}><RotateCcw size={10} />重播</button>}
          </div>
          <div className="relative flex-1 min-h-0 overflow-hidden">
            <div className="absolute inset-0 overflow-y-auto p-4 pr-3 space-y-2.5" style={{ background: '#F6F8FC', scrollbarGutter: 'stable' }}>
              {B6_SCRIPT.slice(0, visible).map((item, i) => {
                if (item.role === 'user') return <div key={i} className="ml-auto max-w-[78%] rounded-2xl rounded-tr-md px-3 py-2 text-[10px]" style={{ background: BLUE, color: '#fff' }}>{item.text}</div>;
                if (item.role === 'quiz') return <B6QuizInChat key={i} item={item} picked={picked[i]} onPick={(key) => setPicked(p => { const cur = p[i]; const next = { ...p }; if (cur === key) delete next[i]; else next[i] = key; return next; })} />;
                // ai / done：逐字打印
                const shown = typing && typing.idx === i ? item.text.slice(0, typing.n) : item.text;
                const isTyping = typing != null && typing.idx === i;
                return <div key={i} className="max-w-[92%] rounded-2xl rounded-tl-md px-3 py-2 text-[10px] leading-5" style={{ background: item.role === 'done' ? '#EAF9EF' : CARD, border: `1px solid ${item.role === 'done' ? '#BFEBCF' : BORDER}`, color: item.role === 'done' ? GREEN : T2, fontWeight: item.role === 'done' ? 600 : 400 }}>{shown}{isTyping && <span className="inline-block w-1 h-3 ml-0.5 align-middle" style={{ background: BLUE, animation: 'pulse 1s ease-in-out infinite' }} />}</div>;
              })}
              <div ref={chatEndRef} className="h-1" />
            </div>
          </div>
        </div>
      </div>
      <div className="pb-5 pt-2 flex-shrink-0">
        {dots}
        <CTAButton onClick={onNext} disabled={!autoDone}>继续：查看每道题的来源 →</CTAButton>
      </div>
    </div>
  );
}

// ── B7 inner ──────────────────────────────────────────────────────────────────

function B7Inner({ onNext, dots }: { onNext: () => void; dots?: React.ReactNode }) {
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
        {dots}
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
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 650);
    const t2 = setTimeout(() => setPhase(2), 1450);
    const t3 = setTimeout(() => setPhase(3), 2500);
    const done = setTimeout(onNext, 3800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(done); };
  }, []);

  return (
    <div className="flex flex-col h-full px-6">
      <div className="pt-3"><StepBar active={2} /></div>
      <div className="pt-5 pb-2 flex items-end justify-between">
        <div>
          <h1 className="text-[22px] font-bold leading-tight mb-1" style={{ color: T1 }}>一堆资料，自动拆成可学习的知识点</h1>
          <p className="text-[14px] font-semibold" style={{ color: BLUE }}>从资料堆里抽丝剥茧，整理出真正要学的内容</p>
        </div>
        <span className="text-[11px] px-3 py-1.5 rounded-full" style={{ background: '#EAF3FF', color: BLUE }}>
          {phase < 1 ? '正在读取资料…' : phase < 2 ? '正在抽取内容…' : phase < 3 ? '正在标记重点…' : '已整理 28 个知识点 ✓'}
        </span>
      </div>

      <div className="flex-1 relative rounded-3xl overflow-hidden" style={{ background:'linear-gradient(135deg,#FBFCFF,#F5F8FF)',border:`1px solid ${BORDER}` }}>
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs><linearGradient id="extractFlow" x1="0" x2="1"><stop stopColor="#BFD4FF"/><stop offset=".55" stopColor="#7EA7FF"/><stop offset="1" stopColor="#FFE562"/></linearGradient></defs>
          {[24,35,46,57,68].map((y,i)=><path key={y} d={`M28 ${y} C42 ${y} 42 50 53 50 C64 50 64 ${31+i*10} 76 ${31+i*10}`} fill="none" stroke="url(#extractFlow)" strokeWidth={phase>=1?0.8:0.35} opacity={phase>=1?.72:.2}/>)}
        </svg>
        <div className="absolute left-[8%] top-[17%] w-[23%] h-[64%]">
          {B1_CHIPS.map((chip,i)=><div key={chip.label} className="absolute w-28 h-14 rounded-xl px-3 py-2 shadow-sm transition-all" style={{left:`${(i%3)*18}px`,top:`${i*32}px`,background:chip.bg,border:`1px solid ${BORDER}`,transform:`rotate(${chip.rotate}deg) translateX(${phase>=1?8:0}px)`,opacity:phase>=1?.72:1}}>
            <FileText size={13} color={i%2?BLUE:RED}/><span className="block text-[9px] mt-1" style={{color:T3}}>{chip.label}</span>
          </div>)}
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full flex flex-col items-center justify-center shadow-lg transition-all" style={{background:phase>=2?PRIMARY:CARD,border:`2px solid ${phase>=2?'#F4C900':'#BFD4FF'}`}}>
          <span className="text-[22px]">{phase>=2?'✦':'⌁'}</span><span className="text-[9px] font-bold" style={{color:phase>=2?'#6B5900':BLUE}}>AI 提取</span>
        </div>
        <div className="absolute right-[6%] top-[15%] w-[25%] h-[70%] grid grid-cols-2 gap-2">
          {['核心概念','高频考点','重点结论','易错辨析','关联知识','复习提示'].map((item,i)=>{
            const visible=phase>=2 && i<(phase===2?3:6);
            return <div key={item} className="rounded-xl px-2 flex items-center gap-2 transition-all shadow-sm" style={{background:CARD,border:`1px solid ${i<3?'#FFE562':'#BEDAFF'}`,opacity:visible?1:.15,transform:`translateX(${visible?0:12}px)`}}>
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px]" style={{background:i<3?'#FFF6B8':'#EAF3FF',color:i<3?'#9A7B00':BLUE}}>{i<3?'★':i+1}</span>
              <span className="text-[9px] font-semibold" style={{color:T2}}>{item}</span>
            </div>
          })}
        </div>
        <div className="absolute left-[35%] bottom-5 text-[10px]" style={{color:T4}}>资料堆</div>
        <div className="absolute right-[12%] bottom-5 text-[10px]" style={{color:T4}}>可学习知识点</div>
      </div>
      <div className="pb-5 pt-3">
        <div className="h-1 rounded-full overflow-hidden" style={{ background:'#E8E8E8' }}><div className="h-full transition-all duration-700" style={{ width:`${[18,45,76,100][phase]}%`, background:BLUE }}/></div>
        <p className="text-[10px] text-center mt-1.5" style={{ color:T4 }}>演示完成后将自动进入添加资料</p>
      </div>
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
  { name: '受贿罪构成', priority: 3, kps: 13, keep: true  },
  { name: '斡旋受贿罪', priority: 3, kps: 6,  keep: true  },
  { name: '渎职罪总论', priority: 2, kps: 12, keep: true  },
  { name: '单位受贿',   priority: 2, kps: 4,  keep: true  },
  { name: '行贿罪体系', priority: 1, kps: 8,  keep: false },
  { name: '介绍贿赂罪', priority: 1, kps: 3,  keep: false },
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
  const [planEdited, setPlanEdited] = useState(false);

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
        <h1 className="text-[22px] font-bold leading-tight mb-1" style={{ color: T1 }}>{mode === 'fit' ? '确认你的学习计划' : '距离考试还有 28 天'}</h1>
        <p className="text-[14px] font-medium" style={{ color: BLUE }}>
          {mode === 'fit' ? '时间充裕，按此计划开始学习' : 'AI 已根据考试时间和知识重要性，帮你优化学习范围'}
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
          <div className="p-4 rounded-2xl" style={{ background:'linear-gradient(135deg,#EEF6FF,#F7FBFF)', border:'1px solid #C9E0FF' }}>
            <div className="flex items-center gap-2 mb-3"><div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background:BLUE,color:'#fff'}}><Sparkles size={14}/></div><p className="text-[13px] font-bold" style={{color:T1}}>AI 推荐方案</p><span className="ml-auto text-[10px]" style={{color:BLUE}}>已为你优先排序</span></div>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-white p-3"><p className="text-[10px]" style={{color:T4}}>⭐⭐⭐ 核心知识点</p><p className="text-[16px] font-bold mt-1" style={{color:GREEN}}>100% 完成</p></div>
              <div className="rounded-xl bg-white p-3"><p className="text-[10px]" style={{color:T4}}>⭐⭐ 重要知识点</p><p className="text-[16px] font-bold mt-1" style={{color:BLUE}}>82% 完成</p></div>
              <div className="rounded-xl bg-white p-3"><p className="text-[10px]" style={{color:T4}}>⭐ 低频知识点</p><p className="text-[13px] font-bold mt-1" style={{color:T3}}>自动延后学习</p></div>
            </div>
            <p className="text-[11px] mt-3" style={{color:T3}}>优先掌握高价值知识点，当前方案覆盖 4 / 6 个知识模块、35 / 46 个知识点，预计覆盖大部分考试重点。</p>
          </div>
          {(!weekdays.includes(6) || !weekdays.includes(7)) && <div className="rounded-2xl p-4 flex items-center gap-4" style={{background:'#FFFBDE',border:`1px solid ${PRIMARY}`}}><div className="flex-1"><p className="text-[13px] font-bold" style={{color:'#6B5900'}}>增加学习时间 <span className="ml-2 text-[9px] px-2 py-0.5 rounded-full" style={{background:PRIMARY}}>推荐</span></p><p className="text-[11px] mt-1" style={{color:'#8B7300'}}>开启周末学习，可再覆盖 1 个知识模块 · 预计增加 18% 内容覆盖</p></div><button onClick={() => {setWeekdays([1,2,3,4,5,6,7]);setPlanEdited(true);}} className="px-4 py-2 rounded-full text-[11px] font-semibold whitespace-nowrap" style={{background:PRIMARY,color:'#6B5900'}}>开启周末学习 →</button></div>}
          <p className="text-[12px] font-semibold" style={{ color: T2 }}>AI 建议优先学习以下章节</p>
          {PLAN_DATA_NOFIT.map(r => (
            <button key={r.name}
              onClick={() => {setNoFitKeep(prev => ({ ...prev, [r.name]: !prev[r.name] }));setPlanEdited(true);}}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
              style={{
                background: noFitKeep[r.name] ? CARD : '#F8F8F8',
                border: `1.5px solid ${noFitKeep[r.name] ? GREEN : BORDER}`,
                opacity: noFitKeep[r.name] ? 1 : 0.72,
              }}>
              <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                style={{ background: noFitKeep[r.name] ? GREEN : '#F3F4F6', border: `1.5px solid ${noFitKeep[r.name] ? GREEN : BORDER}` }}>
                {noFitKeep[r.name] && <Check size={11} color="#fff" strokeWidth={3} />}
              </div>
              <span className="flex-1"><span className="block text-[13px] font-semibold" style={{ color: T2 }}>{r.name}</span><span className="block text-[10px] mt-0.5" style={{color:T4}}>{'⭐'.repeat(r.priority)} {r.priority===3?'Core':r.priority===2?'Important':'Optional'}</span></span>
              <span className="text-[12px]" style={{ color: T4 }}>{r.kps} 个知识点</span>
            </button>
          ))}
          <div className="flex items-center justify-between px-1">
            <span className="text-[12px]" style={{ color: T3 }}>{totalKps} 个知识点</span>
            <span className="text-[12px]" style={{ color: canConfirmNoFit ? GREEN : '#A88300' }}>{canConfirmNoFit ? '✓ 已匹配当前备考时间' : 'AI 将继续优化每日负荷'}</span>
          </div>
        </div>
      )}

      <div className="pb-6 pt-2">
        <CTAButton onClick={onNext}>
          {mode === 'fit' ? '确认，开始学习 →' : planEdited ? '创建我的学习计划 →' : '接受 AI 推荐方案 →'}
        </CTAButton>
      </div>
    </div>
  );
}

// ── Main Onboarding Orchestrator ───────────────────────────────────────────────

export default function OnboardingScreen({ onComplete, onSkip, onEnterSample = onSkip, initialStep, demoScenario = 'fit', onActiveStepChange }: OnboardingScreenProps) {
  const [stepIdx, setStepIdx]       = useState(() => initialStep ? Math.max(0, STEPS_WITH_SAMPLE.indexOf(initialStep)) : 0);
  const [goalType, setGoalType]     = useState<GoalType>('cert');
  const [goalDetail, setGoalDetail] = useState('法考·法律类');
  const [materialSource, setMaterialSource] = useState<'REAL_UPLOAD' | 'SAMPLE'>('SAMPLE');
  const [spaceCreated, setSpaceCreated] = useState(false);
  const [resumeDemoAtEnd, setResumeDemoAtEnd] = useState(false);

  // Language type has no preset sample pack → no B1 pre-animation, no demo chain in A5
  const hasPreset = goalType !== 'language';

  const STEPS = hasPreset ? STEPS_WITH_SAMPLE : STEPS_NO_SAMPLE;
  const step  = STEPS[stepIdx];
  const total = STEPS.length;

  useEffect(() => {
    onActiveStepChange?.(step);
  }, [onActiveStepChange, step]);

  const next = () => setStepIdx(i => Math.min(i + 1, total - 1));
  const back = () => setStepIdx(i => Math.max(i - 1, 0));

  const returnFromPlanToDemo = () => {
    if (!hasPreset) {
      onSkip();
      return;
    }
    setResumeDemoAtEnd(true);
    setStepIdx(i => Math.max(i - 1, 0));
  };

  const wrapperBack = step === 'A5'
    ? undefined
    : step === 'A6'
      ? returnFromPlanToDemo
      : stepIdx > 0
        ? back
        : onSkip;

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
      case 'A4': return <A4Screen onNext={() => { setSpaceCreated(true); setResumeDemoAtEnd(false); next(); }} onBack={back} />;
      // A5 internally hosts the full loading + demo chain (B3→B7→C1→C2 for preset flows)
      case 'A5': return (
        <A5Screen
          hasPreset={hasPreset}
          isStem={goalDetail.includes('理工')}
          initialPhase={resumeDemoAtEnd ? 'C2' : 'loading'}
          onExit={spaceCreated ? onSkip : back}
          onEnterSample={onEnterSample}
          onNext={() => {
            // After C2 (or simple loading for no-preset) → A6
            setResumeDemoAtEnd(false);
            next();
          }}
        />
      );
      case 'A6': return <A6Screen onNext={onComplete} />;
      default:   return null;
    }
  };

  // A6 与独立计划入口共用同一个日历工作台，避免 onboarding 继续渲染历史确认页。
  if (step === 'A6') {
    return (
      <div className="w-full h-full relative" style={{ background: BG }}>
        <PlanFrameworkScreen
          onConfirm={onComplete}
          onSkip={returnFromPlanToDemo}
          demoScenario={demoScenario}
        />
      </div>
    );
  }

  // ScreenWrapper needs position:relative so A5's dark B3 overlay can cover it
  return (
    <div className="w-full h-full relative" style={{ background: BG }}>
      <ScreenWrapper onBack={wrapperBack}>
        {renderStep()}
      </ScreenWrapper>
    </div>
  );
}
