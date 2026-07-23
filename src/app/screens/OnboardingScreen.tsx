import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  BadgeCheck,
  BookOpen,
  Check,
  GraduationCap,
  Landmark,
  Languages,
  Shapes,
  Search,
  ChevronDown,
  Users,
} from 'lucide-react';

// ── Constants ──────────────────────────────────────────────────────────────────

const GOAL_TYPES = [
  { id: 'university_course', label: '大学课程', icon: BookOpen },
  { id: 'postgraduate', label: '考研', icon: GraduationCap },
  { id: 'civil_service', label: '考公', icon: Landmark },
  { id: 'certificate', label: '职业资格考试', icon: BadgeCheck },
  { id: 'language_exam', label: '语言考试', icon: Languages },
  { id: 'other', label: '其他', icon: Shapes },
];

const GOAL_DETAILS: Record<string, { id: string; label: string }[]> = {
  university_course: [
    { id: 'stem', label: '理工类' },
    { id: 'business', label: '经管类' },
    { id: 'medical', label: '医学类' },
    { id: 'other', label: '其他' },
  ],
  postgraduate: [
    { id: 'stem', label: '理工类' },
    { id: 'business', label: '经管类' },
    { id: 'medical', label: '医学类' },
    { id: 'other', label: '其他' },
  ],
  civil_service: [
    { id: 'national', label: '国考' },
    { id: 'provincial', label: '省考' },
    { id: 'public_institution', label: '事业单位' },
    { id: 'other', label: '其他' },
  ],
  certificate: [
    { id: 'finance', label: 'CPA · 财会类' },
    { id: 'law', label: '法考 · 法律类' },
    { id: 'teacher', label: '教师资格证' },
    { id: 'medical', label: '执医 · 医学类' },
    { id: 'other', label: '其他' },
  ],
  language_exam: [
    { id: 'cet', label: '四六级' },
    { id: 'ielts', label: '雅思' },
    { id: 'toefl', label: '托福' },
    { id: 'other', label: '其他语言考试' },
  ],
  other: [
    { id: 'stem', label: '理工类' },
    { id: 'business', label: '经管类' },
    { id: 'medical', label: '医学类' },
    { id: 'knowledge_other', label: '其他知识类' },
    { id: 'language', label: '语言类' },
  ],
};

const DETAIL_PROMPTS: Record<string, string> = {
  university_course: '课程属于哪个方向？',
  postgraduate: '报考方向属于哪一类？',
  civil_service: '具体准备哪类考试？',
  certificate: '具体准备什么考试？',
  language_exam: '具体准备什么考试？',
  other: '内容更接近哪一类？',
};

// Demo-only cohort counts. Production should read aggregated, thresholded counts.
const COHORT_COUNTS: Record<string, string> = {
  'university_course:stem': '15,000+',
  'university_course:business': '8,000+',
  'university_course:medical': '5,000+',
  'postgraduate:stem': '12,000+',
  'postgraduate:business': '6,000+',
  'postgraduate:medical': '4,000+',
  'civil_service:national': '20,000+',
  'civil_service:provincial': '10,000+',
  'civil_service:public_institution': '6,000+',
  'certificate:finance': '3,000+',
  'certificate:law': '5,000+',
  'certificate:teacher': '9,000+',
  'certificate:medical': '3,000+',
};

const SCHOOL_SUGGESTIONS = ['北京大学', '清华大学', '复旦大学', '上海交通大学', '浙江大学', '南京大学', '武汉大学', '中山大学'];
const MAJOR_SUGGESTIONS = ['计算机科学与技术', '软件工程', '电子信息工程', '机械工程', '自动化', '临床医学', '工商管理', '法学'];

const LAW_SUBJECTS = ['刑法', '民法', '行政法', '理论法', '商法', '诉讼法', '国际法'];

const FAMILIARITY = [
  { id: 'beginner',     title: '零基础 · 系统从头学', desc: '适合第一次接触，从基础概念开始系统学习' },
  { id: 'intermediate', title: '学过一遍 · 需要巩固', desc: '有基础，针对薄弱环节强化复习' },
  { id: 'advanced',     title: '冲刺复习 · 查漏补缺', desc: '扎实基础，高效查漏补缺精准提分' },
];

function lcgRng(seed: number) {
  let s = seed >>> 0;
  return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
}

// ── Shared sub-components ──────────────────────────────────────────────────────

function ScreenTitle({ title, sub, subColor = '#2D8CFF', titleColor = '#111' }: {
  title: string; sub: string; subColor?: string; titleColor?: string;
}) {
  return (
    <div className="px-8 pb-5">
      <h1 className="text-[26px] font-bold leading-tight mb-2" style={{ color: titleColor }}>{title}</h1>
      <p className="text-[15px] font-medium" style={{ color: subColor }}>{sub}</p>
    </div>
  );
}

function CreatingScreen() {
  const [pct, setPct] = useState(12);
  useEffect(() => {
    const id = setInterval(() => setPct(p => Math.min(p + 20, 91)), 180);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex flex-col items-center justify-center gap-6 px-8 py-16">
      <div className="text-[52px]">✨</div>
      <div className="text-center">
        <h2 className="text-[22px] font-bold mb-2" style={{ color: '#111' }}>正在为你搭建学习空间</h2>
        <p className="text-[14px]" style={{ color: '#888' }}>根据你的信息，定制专属学习路径</p>
      </div>
      <div style={{ width: 260 }}>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: '#EBEBEB' }}>
          <div className="h-full rounded-full transition-all duration-200"
            style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #FDEA3B, #FDC700)' }} />
        </div>
        <p className="text-center text-[12px] mt-2" style={{ color: '#AAA' }}>{pct}%</p>
      </div>
    </div>
  );
}

function StarMapView() {
  const [newLit, setNewLit] = useState(0);

  const stars = useMemo(() => {
    const rng = lcgRng(42);
    return Array.from({ length: 220 }, (_, i) => ({
      x: rng() * 94 + 3, y: rng() * 94 + 3,
      r: rng() * 2 + 0.4,
      op: rng() * 0.12 + 0.03,
      cat: i < 46 ? 'mastered' : i < 54 ? 'new' : i < 110 ? 'learning' : 'dust',
    }));
  }, []);

  const connections = useMemo(() => {
    const ms = stars.map((s, i) => ({ ...s, i })).filter(s => s.cat === 'mastered');
    return ms.slice(0, 10).map((s, i) => ({ from: s, to: ms[(i + 3) % ms.length] }));
  }, [stars]);

  useEffect(() => {
    let n = 0;
    const id = setInterval(() => {
      if (n >= 8) { clearInterval(id); return; }
      setNewLit(l => l + 1); n++;
    }, 220);
    return () => clearInterval(id);
  }, []);

  return (
    <div>
      <div className="px-8 pb-3">
        <h1 className="text-[26px] font-bold leading-tight mb-1.5" style={{ color: '#F5F5F5' }}>同一张知识地图，正在被点亮</h1>
        <p className="text-[15px] font-semibold" style={{ color: '#FDEA3B' }}>完成学习，小章节的星星逐颗亮起</p>
      </div>
      <div className="mx-8 mb-3 flex items-center justify-between px-4 py-2 rounded-[10px]"
        style={{ background: 'rgba(255,255,255,0.07)' }}>
        <span className="text-[13px]" style={{ color: '#A0A8B8' }}>演示章节 · 受贿罪构成</span>
        <span className="text-[13px]" style={{ color: '#A0A8B8' }}><strong style={{ color: '#4FAE7A' }}>{newLit}/8</strong> 已点亮</span>
      </div>
      <div className="mx-8 rounded-[16px] overflow-hidden" style={{ background: '#111', height: 256 }}>
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
          {stars.filter(s => s.cat === 'dust').map((s, i) => (
            <circle key={`d${i}`} cx={s.x} cy={s.y} r={s.r * 0.35} fill="#DDD" opacity={s.op} />
          ))}
          {stars.filter(s => s.cat === 'learning').map((s, i) => (
            <circle key={`l${i}`} cx={s.x} cy={s.y} r={s.r * 0.6} fill="#B0C0E0" opacity={s.op * 2.5} />
          ))}
          {connections.map((c, i) => (
            <line key={`cn${i}`} x1={c.from.x} y1={c.from.y} x2={c.to.x} y2={c.to.y}
              stroke="#FDEA3B" strokeWidth={0.18} opacity={0.22} />
          ))}
          {stars.filter(s => s.cat === 'mastered').map((s, i) => (
            <g key={`m${i}`}>
              <circle cx={s.x} cy={s.y} r={s.r * 3.5} fill="#FDEA3B" opacity={0.07} />
              <circle cx={s.x} cy={s.y} r={s.r} fill="#FDEA3B" opacity={0.88} />
            </g>
          ))}
          {stars.filter(s => s.cat === 'new').map((s, i) => {
            const on = i < newLit;
            return (
              <g key={`n${i}`}>
                {on && <circle cx={s.x} cy={s.y} r={s.r * 5} fill="#4FAE7A" opacity={0.13} />}
                <circle cx={s.x} cy={s.y} r={s.r * 1.1} fill={on ? '#4FAE7A' : '#333'} opacity={on ? 0.92 : 0.2} />
              </g>
            );
          })}
          <text x={50} y={91} textAnchor="middle" fill="rgba(255,255,255,0.035)"
            fontSize={5.5} fontWeight={700} letterSpacing={1}>刑法分论·贿赂渎职</text>
        </svg>
      </div>
      <p className="px-8 mt-3 text-center text-[12px]" style={{ color: '#777' }}>
        {newLit === 8 ? '这一小节已全部点亮，整科仍保留待探索星域' : '正在模拟学习、作答与掌握过程…'}
      </p>
    </div>
  );
}

function AITutorDemo() {
  const [choice, setChoice] = useState('');
  const [visibleChars, setVisibleChars] = useState(0);
  const intro = '你刚才判断“价格下降一定会增加总收益”。先不看答案：如果价格下降 20%，销量只增加 5%，总收益会怎样？';
  const followup = choice === '减少'
    ? '答对了。价格下降幅度大于销量增长幅度，总收益会减少。真正决定结果的是需求价格弹性。这个知识点已加入强化练习。'
    : choice
      ? '再想一步：总收益 = 价格 × 销量。价格降得更多、销量只增加一点，总收益会怎样？'
      : '';

  useEffect(() => {
    setVisibleChars(0);
    const text = choice ? followup : intro;
    const timer = window.setInterval(() => {
      setVisibleChars(current => {
        if (current >= text.length) {
          window.clearInterval(timer);
          return current;
        }
        return current + 1;
      });
    }, 22);
    return () => window.clearInterval(timer);
  }, [choice, followup]);

  const activeText = choice ? followup : intro;

  return (
    <div>
      <ScreenTitle title="不只给答案，自动带你学会" sub="识别错因 · 继续追问 · 自动进入强化学习" />
      <div className="px-8 space-y-3">
        <div className="flex justify-end">
          <div className="max-w-[82%] rounded-[14px] rounded-br-[4px] px-4 py-3 text-[12px] leading-5"
            style={{ background: '#2D8CFF', color: '#FFF' }}>
            我觉得价格下降一定会增加总收益。
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[12px] font-bold"
            style={{ background: '#FDEA3B', color: '#4E4200' }}>AI</div>
          <div className="max-w-[86%] min-h-[82px] rounded-[14px] rounded-tl-[4px] px-4 py-3 text-[12px] leading-5"
            style={{ background: '#FFF', border: '1px solid #E8E8E8', color: '#444' }}>
            {activeText.slice(0, visibleChars)}
            {visibleChars < activeText.length && <span className="inline-block w-[2px] h-3 ml-0.5 align-middle animate-pulse" style={{ background: '#2D8CFF' }} />}
          </div>
        </div>
        {!choice && visibleChars >= intro.length && (
          <div className="grid grid-cols-3 gap-2 pl-[42px]">
            {['增加', '减少', '不确定'].map(option => (
              <button key={option} onClick={() => setChoice(option)}
                className="py-2.5 rounded-[9px] text-[12px] font-semibold"
                style={{ background: '#FFF', border: '1.5px solid #DDE6F0', color: '#444' }}>
                {option}
              </button>
            ))}
          </div>
        )}
        {choice && visibleChars >= followup.length && (
          <div className="ml-[42px] flex items-center justify-between gap-3 px-3.5 py-3 rounded-[10px]"
            style={{ background: choice === '减少' ? '#F0FBF4' : '#FFF7E6', border: `1px solid ${choice === '减少' ? '#BCE5CA' : '#F5D9A2'}` }}>
            <span className="text-[12px] font-medium" style={{ color: choice === '减少' ? '#178345' : '#9A6500' }}>
              {choice === '减少' ? '✓ 已完成一次强化引导' : '继续追问，不直接公布答案'}
            </span>
            <button onClick={() => setChoice('')} className="text-[11px] font-semibold" style={{ color: '#2D8CFF' }}>重新作答</button>
          </div>
        )}
        <p className="text-center text-[11px]" style={{ color: '#AAA' }}>对话会根据你的回答实时调整，演示可直接作答</p>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

interface Props { onComplete: () => void; onSkip?: () => void; }

export default function OnboardingScreen({ onComplete, onSkip }: Props) {
  const [step, setStep]         = useState(1);
  const [goalType, setGoalType] = useState('');
  const [goalDetail, setGoalDetail] = useState('');
  const [otherGoal, setOtherGoal] = useState('');
  const [school, setSchool] = useState('');
  const [major, setMajor] = useState('');
  const [languageConfirmed, setLanguageConfirmed] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [subjects, setSubjects] = useState<string[]>(['刑法']);
  const [familiarity, setFamiliarity] = useState('');
  const [creating, setCreating] = useState(false);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [practiceType, setPracticeType] = useState<'fill' | 'judgment' | 'multiple' | 'short'>('fill');

  const TOTAL = 12;
  const isStarMap = step === 6 && !creating;

  function goNext() {
    if (creating) return;
    if (step === TOTAL) { onComplete(); return; }
    if (step === 3) {
      if (!familiarity) return;
      setCreating(true);
      setTimeout(() => { setCreating(false); setStep(4); }, 1800);
      return;
    }
    setStep(s => s + 1);
  }
  function goBack() {
    if (creating) return;
    if (step === 1) { onSkip?.(); return; }
    setStep(s => s - 1);
  }

  const ctaLabel = () => {
    if (step === 1)  return '下一步：设置复习科目 →';
    if (step === 3)  return '生成我的学习空间 →';
    if (step === 6)  return '太酷了，继续 →';
    if (step === 10) return '我准备好了 →';
    if (step === 11) return '继续 →';
    if (step === 12) return '开始系统掌握我的知识点';
    return '继续 →';
  };
  const ctaEnabled = () => {
    if (step === 1) {
      const hasRequiredSelection = !!goalType && !!goalDetail && (goalType !== 'other' || otherGoal.trim().length > 0);
      const isLanguageChoice = goalType === 'language_exam' || (goalType === 'other' && goalDetail === 'language');
      return hasRequiredSelection && (!isLanguageChoice || languageConfirmed);
    }
    if (step === 3) return !!familiarity;
    return true;
  };

  function renderContent() {
    if (creating) return <CreatingScreen />;
    switch (step) {
      case 1:  return screenA1();
      case 2:  return screenA2();
      case 3:  return screenA3();
      case 4:  return screenB1();
      case 5:  return screenB2();
      case 6:  return <StarMapView />;
      case 7:  return screenB4();
      case 8:  return screenB5();
      case 9:  return <AITutorDemo />;
      case 10: return screenB7();
      case 11: return screenC1();
      case 12: return screenC2();
      default: return null;
    }
  }

  // ── A1 ── Goal type + linked details ───────────────────────────────────────

  function screenA1() {
    const details = GOAL_DETAILS[goalType] ?? [];
    const showBackground = !!goalType && goalType !== 'language_exam';
    const backgroundLabels =
      goalType === 'university_course'
        ? ['所在学校', '所学专业']
        : goalType === 'postgraduate'
          ? ['本科专业', '报考方向']
          : goalType === 'civil_service'
            ? ['专业背景', '']
            : ['学习或从业方向', ''];
    const selectedGoalLabel = GOAL_TYPES.find(item => item.id === goalType)?.label;
    const selectedDetailLabel = details.find(item => item.id === goalDetail)?.label;
    const cohortCount = COHORT_COUNTS[`${goalType}:${goalDetail}`];
    const isKnowledgeSelection =
      !!goalDetail && goalType !== 'language_exam' && !(goalType === 'other' && goalDetail === 'language');

    const selectGoalType = (id: string) => {
      setGoalType(id);
      setGoalDetail('');
      setOtherGoal('');
      setSchool('');
      setMajor('');
      setLanguageConfirmed(false);
    };

    const selectGoalDetail = (id: string) => {
      setGoalDetail(id);
      setLanguageConfirmed(false);
      if (goalType === 'language_exam' || (goalType === 'other' && id === 'language')) {
        setShowLanguageModal(true);
      }
    };

    return (
      <div className="pb-2 max-w-[980px] mx-auto">
        <div className="px-8 pb-2 text-[13px] font-medium" style={{ color: '#737373' }}>
          告诉我们你的方向，我们好为你准备更贴合的学习内容
        </div>
        <div className="px-8 space-y-3">
          <section>
            <div className="text-[12px] font-semibold mb-2" style={{ color: '#8B8B8B' }}>选择备考类型</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
          {GOAL_TYPES.map(e => {
            const sel = goalType === e.id;
            const Icon = e.icon;
            return (
              <button key={e.id} onClick={() => selectGoalType(e.id)}
                className="relative h-[64px] flex items-center justify-center gap-2.5 px-4 rounded-[12px] text-center transition-all"
                style={{
                  background: sel ? '#FFFBDF' : '#FFF',
                  border: `2px solid ${sel ? '#FDEA3B' : '#EBEBEB'}`,
                  boxShadow: sel ? '0 1px 5px rgba(168,131,0,0.10)' : '0 1px 4px rgba(0,0,0,0.04)',
                }}>
                <Icon size={21} color={sel ? '#A88300' : '#6B7280'} strokeWidth={1.8} />
                <span className="text-[14px] font-semibold" style={{ color: '#222' }}>{e.label}</span>
                {sel && (
                  <span className="absolute right-2.5 top-2.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#FDEA3B' }}>
                    <Check size={12} color="#333" strokeWidth={2.6} />
                  </span>
                )}
              </button>
            );
          })}
            </div>
          </section>

          {goalType && (
            <section className="pt-2.5" style={{ borderTop: '1px solid #E8E8E8' }}>
              {goalType === 'other' && (
                <div className="mb-4">
                  <label className="block text-[12px] font-semibold mb-2" style={{ color: '#555' }}>具体准备什么？</label>
                  <input
                    value={otherGoal}
                    onChange={(event) => setOtherGoal(event.target.value)}
                    placeholder="输入考试、课程或学习目标"
                    className="w-full h-11 px-3.5 rounded-[10px] text-[13px] outline-none transition-colors"
                    style={{ background: '#FFF', border: '1.5px solid #DEDEDE', color: '#222' }}
                  />
                </div>
              )}

              <div className="text-[12px] font-semibold mb-2" style={{ color: '#555' }}>{DETAIL_PROMPTS[goalType]}</div>
              <div className="flex flex-wrap gap-2">
                {details.map(detail => {
                  const selected = goalDetail === detail.id;
                  return (
                    <button
                      key={detail.id}
                      onClick={() => selectGoalDetail(detail.id)}
                      className="px-4 py-2 rounded-[10px] text-[13px] font-medium transition-all"
                      style={{
                        background: selected ? '#FFFBDF' : '#FFF',
                        border: `1.5px solid ${selected ? '#FDC700' : '#E3E3E3'}`,
                        color: selected ? '#5D4A00' : '#555',
                      }}
                    >
                      {detail.label}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {isKnowledgeSelection && cohortCount && (
            <section
              className="min-h-10 flex items-center gap-3 px-3.5 py-2 rounded-[12px] transition-all"
              style={{ background: '#FFF8D8', border: '1px solid #F6E69C', color: '#574900' }}
            >
              <div className="flex items-center -space-x-1.5 flex-shrink-0" aria-hidden="true">
                {['#FDEA3B', '#FFE98A', '#FFF3BC'].map((background, index) => (
                  <span key={background} className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background, border: '2px solid #FFF8D8', zIndex: 3 - index }}>
                    <Users size={12} color="#6B5900" />
                  </span>
                ))}
              </div>
              <p className="text-[12px] leading-5">
                已有 <strong className="text-[14px]">{cohortCount} 位同学</strong>正在准备
                <span style={{ color: '#7C6B18' }}>「{selectedGoalLabel} · {selectedDetailLabel}」</span>
              </p>
            </section>
          )}

          {showBackground && (
            <section className="pt-2.5" style={{ borderTop: '1px solid #E8E8E8' }}>
              <div className="flex items-end justify-between gap-3 mb-2">
                <div>
                  <div className="text-[12px] font-semibold" style={{ color: '#555' }}>学习背景 <span style={{ color: '#AAA', fontWeight: 400 }}>（选填）</span></div>
                  <p className="text-[11px] mt-0.5" style={{ color: '#AAA' }}>帮助我们更好地了解你的学习需求 · 可稍后补充</p>
                </div>
              </div>
              <div className={`grid gap-3 ${backgroundLabels[1] ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                <label className="relative">
                  <span className="block text-[11px] font-medium mb-1.5" style={{ color: '#777' }}>{backgroundLabels[0]}</span>
                  <Search size={15} className="absolute left-3 top-[34px] pointer-events-none" color="#999" />
                  <input
                    value={school}
                    onChange={(event) => setSchool(event.target.value)}
                    list="onboarding-school-suggestions"
                    placeholder={`搜索或输入${backgroundLabels[0]}`}
                    className="w-full h-11 pl-9 pr-9 rounded-[10px] text-[13px] outline-none"
                    style={{ background: '#FFF', border: '1.5px solid #DEDEDE', color: '#222' }}
                  />
                  <ChevronDown size={15} className="absolute right-3 top-[34px] pointer-events-none" color="#999" />
                  <datalist id="onboarding-school-suggestions">
                    {SCHOOL_SUGGESTIONS.map(item => <option key={item} value={item} />)}
                  </datalist>
                </label>
                {backgroundLabels[1] && (
                  <label className="relative">
                    <span className="block text-[11px] font-medium mb-1.5" style={{ color: '#777' }}>{backgroundLabels[1]}</span>
                    <Search size={15} className="absolute left-3 top-[34px] pointer-events-none" color="#999" />
                    <input
                      value={major}
                      onChange={(event) => setMajor(event.target.value)}
                      list="onboarding-major-suggestions"
                      placeholder={`搜索或输入${backgroundLabels[1]}`}
                      className="w-full h-11 pl-9 pr-9 rounded-[10px] text-[13px] outline-none"
                      style={{ background: '#FFF', border: '1.5px solid #DEDEDE', color: '#222' }}
                    />
                    <ChevronDown size={15} className="absolute right-3 top-[34px] pointer-events-none" color="#999" />
                    <datalist id="onboarding-major-suggestions">
                      {MAJOR_SUGGESTIONS.map(item => <option key={item} value={item} />)}
                    </datalist>
                  </label>
                )}
              </div>
            </section>
          )}

          {isKnowledgeSelection && (
            <section className="flex flex-wrap items-center gap-2">
              <p className="text-[12px]" style={{ color: '#6B7280' }}>明白了，我们会据此准备更贴合的学习内容与练习。</p>
            </section>
          )}
        </div>
      </div>
    );
  }

  // ── A2 ── Subject + date ───────────────────────────────────────────────────

  function screenA2() {
    const toggle = (s: string) =>
      setSubjects(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
    return (
      <div>
        <ScreenTitle title="快到了吗？" sub="告诉我们科目和时间，自动排好每天学什么" />
        <div className="px-8 space-y-6">
          <div>
            <div className="text-[12px] font-semibold mb-2.5 uppercase tracking-wider" style={{ color: '#999' }}>选择科目（可多选）</div>
            <div className="flex flex-wrap gap-2">
              {LAW_SUBJECTS.map(s => {
                const sel = subjects.includes(s);
                return (
                  <button key={s} onClick={() => toggle(s)}
                    className="px-4 py-1.5 rounded-full text-[13px] font-medium transition-all"
                    style={{
                      background: sel ? '#FDEA3B' : '#FFF',
                      border: `1.5px solid ${sel ? '#FDC700' : '#EBEBEB'}`,
                      color: sel ? '#222' : '#666',
                    }}>
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <div className="text-[12px] font-semibold mb-2.5 uppercase tracking-wider" style={{ color: '#999' }}>考试时间</div>
            <div className="rounded-[12px] p-5 text-center" style={{ background: '#FFF', border: '1.5px solid #EBEBEB' }}>
              <div className="text-[32px] font-bold mb-1" style={{ color: '#111' }}>2025年11月20日</div>
              <div className="text-[14px]" style={{ color: '#2D8CFF' }}>
                📅 距考试还有 <strong>72 天</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── A3 ── Familiarity ──────────────────────────────────────────────────────

  function screenA3() {
    return (
      <div>
        <ScreenTitle title="你现在到哪一步了？" sub="据此为你估算学习节奏" />
        <div className="px-8 space-y-3">
          {FAMILIARITY.map(f => {
            const sel = familiarity === f.id;
            return (
              <button key={f.id} onClick={() => setFamiliarity(f.id)}
                className="w-full p-4 rounded-[12px] text-left transition-all"
                style={{
                  background: sel ? '#FFFBDF' : '#FFF',
                  border: `2px solid ${sel ? '#FDEA3B' : '#EBEBEB'}`,
                  boxShadow: sel ? '0 0 0 3px rgba(255,229,98,0.18)' : '0 1px 4px rgba(0,0,0,0.05)',
                }}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[14px] font-semibold mb-1" style={{ color: '#111' }}>{f.title}</div>
                    <div className="text-[12px]" style={{ color: '#999' }}>{f.desc}</div>
                  </div>
                  {sel && (
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: '#FDEA3B' }}>
                      <Check size={11} color="#333" strokeWidth={2.5} />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
          <div className="flex items-center gap-3 pt-1">
            <span className="text-[12px]" style={{ color: '#AAA' }}>输出语种：</span>
            <div className="px-3 py-1.5 rounded-[8px] text-[13px]"
              style={{ background: '#FFF', border: '1.5px solid #EBEBEB', color: '#555' }}>
              中文 ▾
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── B1 ── Upload ───────────────────────────────────────────────────────────

  function screenB1() {
    const points = ['受贿罪主体', '职务便利', '财物控制', '既遂标准', '斡旋受贿'];
    return (
      <div>
        <ScreenTitle title="一份资料，自动拆成知识点" sub="重点、概念和考点，已经为你整理出来" />
        <div className="px-8">
          <div className="grid grid-cols-[1.05fr_0.95fr] gap-4 items-stretch">
            <div className="rounded-[14px] p-4" style={{ background: '#FFF', border: '1px solid #E7E7E7' }}>
              <div className="flex items-center gap-2 pb-3 mb-3" style={{ borderBottom: '1px solid #F0F0F0' }}>
                <span className="w-7 h-7 rounded-[7px] flex items-center justify-center text-[11px] font-bold" style={{ background: '#FF6252', color: '#FFF' }}>PDF</span>
                <div>
                  <div className="text-[12px] font-semibold" style={{ color: '#333' }}>刑法分论·贿赂渎职</div>
                  <div className="text-[10px]" style={{ color: '#AAA' }}>42 页 · 正在识别考点</div>
                </div>
              </div>
              <div className="space-y-2 text-[11px] leading-5" style={{ color: '#777' }}>
                <p>受贿罪的主体是国家工作人员，行为人须利用职务上的便利……</p>
                <p className="px-1 rounded" style={{ background: '#FFF4A8', color: '#4D4521' }}>实际控制财物时，通常认定犯罪既遂。</p>
                <p>斡旋受贿要求通过其他国家工作人员的职务行为谋取不正当利益……</p>
                <p className="px-1 rounded" style={{ background: '#DDEEFF', color: '#315778' }}>核心判断：主体、职务便利、财物控制。</p>
              </div>
            </div>
            <div className="rounded-[14px] p-4 flex flex-col" style={{ background: '#F8FBFF', border: '1px solid #D9E9F8' }}>
              <div className="text-[11px] font-semibold mb-3" style={{ color: '#2D8CFF' }}>已提取 28 个知识点</div>
              <div className="flex flex-wrap content-start gap-2">
                {points.map((point, index) => (
                  <div key={point} className="px-3 py-2 rounded-[9px] text-[11px] font-medium"
                    style={{ background: '#FFF', border: '1px solid #DCE8F3', color: '#40566A', animationDelay: `${index * 120}ms` }}>
                    {point}
                  </div>
                ))}
              </div>
              <div className="mt-auto pt-4">
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#E5EDF5' }}>
                  <div className="h-full rounded-full" style={{ width: '100%', background: '#2D8CFF' }} />
                </div>
                <p className="text-[10px] mt-1.5" style={{ color: '#87A0B6' }}>这些知识点将在下一步自动组成知识结构</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── B2 ── Structured notes ─────────────────────────────────────────────────

  function screenB2() {
    const branches = [
      { title: '主体条件', items: ['国家工作人员', '从事公务'] },
      { title: '行为条件', items: ['利用职务便利', '为他人谋利'] },
      { title: '既遂判断', items: ['实际控制财物', '到账或交付'] },
    ];
    return (
      <div>
        <ScreenTitle title="零散知识点，自动连成体系" sub="章节关系和知识结构，一眼看清" />
        <div className="px-8">
          <div className="flex items-center justify-center gap-1 mb-3">
            <button className="px-4 py-2 rounded-full text-[11px] font-semibold" style={{ background: '#FDEA3B', color: '#4E4200' }}>思维导图</button>
            <button className="px-4 py-2 rounded-full text-[11px] font-semibold" style={{ background: '#FFF', color: '#777', border: '1px solid #E5E5E5' }}>知识星图</button>
          </div>
          <div className="rounded-[16px] p-5 min-h-[250px] flex items-center" style={{ background: '#FFF', border: '1px solid #E8E8E8' }}>
            <div className="w-full">
              <div className="mx-auto w-fit px-5 py-3 rounded-[12px] text-[14px] font-bold mb-6"
                style={{ background: '#FFF7C7', border: '2px solid #FDEA3B', color: '#3D3500' }}>
                受贿罪的构成与既遂
              </div>
              <div className="grid grid-cols-3 gap-4 relative">
                {branches.map((branch, index) => (
                  <div key={branch.title} className="relative text-center">
                    <div className="absolute left-1/2 -top-6 w-px h-6" style={{ background: '#B9D7F3' }} />
                    {index !== 0 && <div className="absolute right-1/2 -top-6 h-px w-[calc(50%+1rem)]" style={{ background: '#B9D7F3' }} />}
                    {index !== branches.length - 1 && <div className="absolute left-1/2 -top-6 h-px w-[calc(50%+1rem)]" style={{ background: '#B9D7F3' }} />}
                    <div className="px-3 py-2 rounded-[9px] text-[12px] font-semibold mb-2" style={{ background: '#EAF4FF', color: '#31658E' }}>{branch.title}</div>
                    <div className="space-y-1.5">
                      {branch.items.map(item => (
                        <div key={item} className="px-2 py-1.5 rounded-[7px] text-[10px]" style={{ background: '#F8F8F8', color: '#666' }}>{item}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p className="text-center text-[11px] mt-3" style={{ color: '#999' }}>下一步，同一批知识点会切换为掌握状态星图</p>
        </div>
      </div>
    );
  }

  // ── B4 ── Flashcard ────────────────────────────────────────────────────────

  function screenB4() {
    return (
      <div>
        <ScreenTitle title="不是让你背，是先问你会不会" sub="每个知识点，先给你一张闪卡" />
        <div className="px-8">
          <div style={{ perspective: 900 }} className="mb-5 cursor-pointer" onClick={() => setCardFlipped(f => !f)}>
            <div style={{
              position: 'relative', height: 196,
              transformStyle: 'preserve-3d',
              transform: cardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              transition: 'transform 0.5s ease',
            }}>
              {/* Front */}
              <div style={{
                position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
                background: '#1B1B1B', borderRadius: 16, padding: 24,
                display: 'flex', flexDirection: 'column',
              }}>
                <span className="w-7 h-7 rounded-[6px] flex items-center justify-center text-[11px] font-bold mb-auto"
                  style={{ background: '#2D8CFF', color: '#FFF' }}>Q</span>
                <p className="text-[16px] font-medium leading-relaxed" style={{ color: '#F0F0F0' }}>
                  斡旋受贿罪的行为主体是谁？
                </p>
                <p className="text-[11px] mt-3" style={{ color: '#555' }}>点击翻面看概念 →</p>
              </div>
              {/* Back */}
              <div style={{
                position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
                background: '#F6FEF9', borderRadius: 16, padding: 24,
                display: 'flex', flexDirection: 'column',
                transform: 'rotateY(180deg)', border: '2px solid #00A63E',
              }}>
                <span className="w-7 h-7 rounded-[6px] flex items-center justify-center text-[11px] font-bold mb-3"
                  style={{ background: '#00A63E', color: '#FFF' }}>A</span>
                <p className="text-[13px] leading-relaxed" style={{ color: '#333' }}>
                  <strong>国家工作人员</strong>，利用本人职权或地位形成的便利条件，通过其他国家工作人员的职务行为，为请托人谋取不正当利益，索取或收受财物。
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: '继续练习', bg: '#2D8CFF', fg: '#FFF' },
              { label: '我已经会了，跳过', bg: '#F3F4F6', fg: '#555' },
              { label: '深度学习', bg: '#FDEA3B', fg: '#333' },
            ].map(btn => (
              <button key={btn.label} className="py-3 rounded-[10px] text-[12px] font-semibold"
                style={{ background: btn.bg, color: btn.fg }}>{btn.label}</button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── B5 ── Question types ───────────────────────────────────────────────────

  function screenB5() {
    const types = [
      { id: 'fill' as const, label: '填空' },
      { id: 'judgment' as const, label: '判断' },
      { id: 'multiple' as const, label: '多选' },
      { id: 'short' as const, label: '简答' },
    ];

    const content = {
      fill: {
        question: '受贿罪既遂通常以行为人实际 ______ 财物为判断标准。',
        answer: '控制',
        user: '控制',
        explanation: '取得对财物的实际支配，即可认定达到既遂状态。',
      },
      judgment: {
        question: '只要收受财物，就一定构成受贿罪。',
        answer: '错误',
        user: '错误',
        explanation: '还需满足国家工作人员、利用职务便利等构成条件。',
      },
      multiple: {
        question: '受贿罪的成立通常需要哪些条件？',
        answer: 'A、B、D',
        user: 'A、B、D',
        explanation: '主体身份、职务便利和收受财物是核心判断条件。',
      },
      short: {
        question: '为什么“实际控制财物”可以作为既遂判断标准？',
        answer: '因为行为人已经能够支配财物，犯罪利益已经实现。',
        user: '因为已经能实际支配财物。',
        explanation: '回答覆盖了“实际支配”这个关键点，表达可以更完整。',
      },
    }[practiceType];

    return (
      <div>
        <ScreenTitle title="一个知识点，用不同方式练到会" sub="填空 · 判断 · 多选 · 简答，自动生成真实解析" />
        <div className="px-8 space-y-3">
          <div className="grid grid-cols-4 gap-2">
            {types.map(type => {
              const selected = practiceType === type.id;
              return (
                <button key={type.id} onClick={() => setPracticeType(type.id)}
                  className="py-2.5 rounded-[9px] text-[12px] font-semibold transition-all"
                  style={{
                    background: selected ? '#FDEA3B' : '#FFF',
                    border: `1.5px solid ${selected ? '#FDC700' : '#E5E5E5'}`,
                    color: selected ? '#4D4200' : '#777',
                  }}>
                  {type.label}
                </button>
              );
            })}
          </div>
          <div className="rounded-[12px] p-4" style={{ background: '#FFF', border: '1px solid #EBEBEB' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2 py-1 rounded-[6px] text-[10px] font-bold" style={{ background: '#EEF6FF', color: '#2D8CFF' }}>
                {types.find(type => type.id === practiceType)?.label}题
              </span>
              <span className="text-[10px]" style={{ color: '#AAA' }}>知识点：受贿罪构成</span>
            </div>
            <p className="text-[13px] font-medium leading-6 mb-3" style={{ color: '#222' }}>{content.question}</p>

            {practiceType === 'multiple' ? (
              <div className="space-y-2 mb-3">
                {[
                  ['A', '国家工作人员', true],
                  ['B', '利用职务便利', true],
                  ['C', '具有亲属关系', false],
                  ['D', '索取或收受财物', true],
                ].map(([key, text, checked]) => (
                  <div key={String(key)} className="flex items-center gap-2.5 px-3 py-2 rounded-[8px]"
                    style={{ background: checked ? '#F2FBF5' : '#FAFAFA', border: `1px solid ${checked ? '#BDE4CA' : '#E9E9E9'}` }}>
                    <span className="w-4 h-4 rounded-[3px] flex items-center justify-center text-[10px] font-bold"
                      style={{ background: checked ? '#00A63E' : '#FFF', border: `1.5px solid ${checked ? '#00A63E' : '#C9C9C9'}`, color: '#FFF' }}>
                      {checked ? '✓' : ''}
                    </span>
                    <span className="text-[11px] font-semibold" style={{ color: '#777' }}>{key}</span>
                    <span className="text-[12px]" style={{ color: '#444' }}>{text}</span>
                  </div>
                ))}
              </div>
            ) : practiceType === 'judgment' ? (
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button className="py-2.5 rounded-[8px] text-[12px]" style={{ background: '#FAFAFA', border: '1px solid #E5E5E5', color: '#777' }}>正确</button>
                <button className="py-2.5 rounded-[8px] text-[12px] font-semibold" style={{ background: '#F2FBF5', border: '1.5px solid #00A63E', color: '#00843A' }}>错误 ✓</button>
              </div>
            ) : (
              <div className="p-3 rounded-[8px] mb-3 text-[12px] leading-5" style={{ background: '#F8F8F8', border: '1px solid #E8E8E8', color: '#555' }}>
                <span className="text-[10px] block mb-1" style={{ color: '#AAA' }}>你的答案</span>
                {content.user}
              </div>
            )}

            <div className="p-3 rounded-[9px]" style={{ background: '#F6FEF9', border: '1px solid #CBEAD7' }}>
              <div className="text-[11px] font-semibold mb-1.5" style={{ color: '#00863B' }}>✓ 正确 / 参考答案：{content.answer}</div>
              <p className="text-[11px] leading-5" style={{ color: '#52705E' }}><strong>解析：</strong>{content.explanation}</p>
            </div>
          </div>
          <p className="text-[11px] text-center" style={{ color: '#AAA' }}>下一步，AI 会根据你的答案继续追问和讲解</p>
        </div>
      </div>
    );
  }

  // ── B7 ── Report + mock exam ───────────────────────────────────────────────

  function screenB7() {
    const chapters = [
      { name: '受贿罪构成', pct: 85, ok: true },
      { name: '渎职罪认定', pct: 55, ok: false },
      { name: '斡旋受贿',   pct: 72, ok: true },
      { name: '数额认定',   pct: 48, ok: false },
    ];
    return (
      <div>
        <ScreenTitle title="知道学到哪，也知道接下来补什么" sub="学习报告与模考结果，自动变成下一步行动" />
        <div className="px-8">
          <div className="rounded-[16px] p-5" style={{ background: '#FFF', border: '1px solid #EBEBEB' }}>
            <div className="flex items-center justify-between mb-4 pb-4" style={{ borderBottom: '1px solid #F0F0F0' }}>
              <div>
                <div className="text-[11px] mb-1" style={{ color: '#AAA' }}>考试通过率预测</div>
                <div className="text-[26px] font-bold" style={{ color: '#00A63E' }}>78%</div>
              </div>
              <div className="text-right">
                <div className="text-[11px] mb-1" style={{ color: '#AAA' }}>已处理知识点</div>
                <div className="text-[18px] font-bold" style={{ color: '#2D8CFF' }}>46 / 72</div>
                <div className="text-[10px]" style={{ color: '#7EA9D0' }}>较上周 +8</div>
              </div>
            </div>
            <div className="grid grid-cols-3 text-center mb-4 pb-4" style={{ borderBottom: '1px solid #F0F0F0' }}>
              {[['得分', '142/150'], ['正确率', '78%'], ['用时', '92:30']].map(([l, v]) => (
                <div key={l}>
                  <div className="text-[20px] font-bold" style={{ color: '#111' }}>{v}</div>
                  <div className="text-[11px] mt-0.5" style={{ color: '#AAA' }}>{l}</div>
                </div>
              ))}
            </div>
            <div className="space-y-2 mb-4 pb-4" style={{ borderBottom: '1px solid #F0F0F0' }}>
              <div className="text-[11px] font-semibold mb-1.5" style={{ color: '#BBB' }}>章节正确率</div>
              {chapters.map(ch => (
                <div key={ch.name} className="flex items-center gap-2">
                  <span className="text-[11px] flex-shrink-0" style={{ color: '#666', width: 72 }}>{ch.name}</span>
                  <div className="flex-1 h-1.5 rounded-full" style={{ background: '#F0F0F0' }}>
                    <div className="h-full rounded-full" style={{ width: `${ch.pct}%`, background: ch.ok ? '#00A63E' : '#FF6252' }} />
                  </div>
                  <span className="text-[11px] w-8 text-right font-semibold"
                    style={{ color: ch.ok ? '#00A63E' : '#FF6252' }}>{ch.pct}%</span>
                </div>
              ))}
            </div>
            <div className="rounded-[10px] p-3.5" style={{ background: '#FFEDEB' }}>
              <p className="text-[13px] font-semibold mb-2.5" style={{ color: '#D44' }}>
                发现 3 个重点薄弱模块 · 预计补强 95 分钟
              </p>
              <div className="flex gap-2">
                <button className="flex-1 py-2 rounded-[8px] text-[12px] font-semibold"
                  style={{ background: '#FF6252', color: '#FFF' }}>查看复习方案</button>
                <button className="flex-1 py-2 rounded-[8px] text-[12px] font-semibold"
                  style={{ background: '#FFF', color: '#555', border: '1px solid #DDD' }}>加入学习计划</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── C1 ── Social proof + data notice ──────────────────────────────────────

  function screenC1() {
    const reviews = [
      { avatar: '林', color: '#DDEEFF', name: '林同学 · 大三', tag: '理工类课程', text: '300 页课件不用再自己一页页整理，知识结构一下就清楚了。' },
      { avatar: '陈', color: '#E8E0FF', name: '陈同学 · 考研', tag: '专业课复习', text: '最有用的是答错后继续追问，能发现自己到底卡在哪里。' },
      { avatar: '周', color: '#DDF4E5', name: '周同学 · 法考', tag: '法律类考试', text: '星图让我第一次看到哪些已经学过，哪些还需要强化。' },
      { avatar: '赵', color: '#FFE8DC', name: '赵同学 · 教资', tag: '职业资格', text: '简答题会指出漏掉的关键词，比只看标准答案更有效。' },
    ];
    return (
      <div>
        <ScreenTitle title="很多人，已经用云记把资料真正学会" sub="从大学课程到考研、法考和职业考试" subColor="#2D8CFF" />
        <div className="px-8 space-y-3">
          <div className="rounded-[14px] px-4 py-3 flex items-center justify-between" style={{ background: '#FFF7D5', border: '1px solid #F5E18A' }}>
            <div>
              <span className="text-[24px] font-bold" style={{ color: '#2C2600' }}>4.9</span>
              <span className="ml-2 text-[13px]" style={{ color: '#D1A900' }}>★★★★★</span>
            </div>
            <div className="flex gap-4 text-[11px]" style={{ color: '#756921' }}>
              <span><strong>100K+</strong> 下载</span>
              <span><strong>1,200+</strong> 评分</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {reviews.map(review => (
              <div key={review.name} className="rounded-[13px] p-3.5" style={{ background: '#FFF', border: '1px solid #E8E8E8' }}>
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold"
                    style={{ background: review.color, color: '#4E5966' }}>{review.avatar}</div>
                  <div>
                    <div className="text-[11px] font-semibold" style={{ color: '#333' }}>{review.name}</div>
                    <div className="text-[10px]" style={{ color: '#2D8CFF' }}>{review.tag}</div>
                  </div>
                </div>
                <p className="text-[11px] leading-5" style={{ color: '#666' }}>“{review.text}”</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <button className="text-[10px]" style={{ color: '#AAA' }}>隐私与 AI 服务说明</button>
          </div>
        </div>
      </div>
    );
  }

  // ── C2 ── Subscription ─────────────────────────────────────────────────────

  function screenC2() {
    const valueGroups = [
      ['省下整理时间', '资料自动拆成知识点 · 自动生成结构'],
      ['真正学会', '多题型练习 · 答错后继续追问讲解'],
      ['知道下一步', '星图展示状态 · 薄弱知识自动强化'],
    ];
    return (
      <div>
        <div className="px-8 pb-5 pt-1">
          <div className="text-[12px] font-medium mb-1" style={{ color: '#2D8CFF' }}>你刚才体验了一个章节的完整学习流程</div>
          <h1 className="text-[28px] font-bold leading-tight mb-1" style={{ color: '#111' }}>从一堆资料，到真正掌握</h1>
          <p className="text-[13px] mt-1" style={{ color: '#777' }}>升级后，用同样的方式学习你自己的全部资料</p>
        </div>
        <div className="px-8 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {valueGroups.map(([title, desc]) => (
              <div key={title} className="rounded-[10px] p-3" style={{ background: '#FFF', border: '1px solid #E9E9E9' }}>
                <div className="text-[11px] font-bold mb-1" style={{ color: '#333' }}>✓ {title}</div>
                <div className="text-[10px] leading-4" style={{ color: '#888' }}>{desc}</div>
              </div>
            ))}
          </div>
          {/* Annual plan */}
          <div className="rounded-[16px] p-4 relative" style={{ background: '#FFFBDF', border: '2.5px solid #FDEA3B' }}>
            <div className="absolute -top-3 left-4 px-2.5 py-0.5 rounded-full text-[11px] font-bold"
              style={{ background: '#FDEA3B', color: '#333' }}>最超值</div>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-[15px] font-bold" style={{ color: '#111' }}>年度方案</div>
                <div className="text-[12px]" style={{ color: '#AAA' }}>按年付费，每月折合更低</div>
              </div>
              <div className="text-right">
                <div className="text-[22px] font-bold" style={{ color: '#111' }}>¥198<span className="text-[12px] font-normal">/年</span></div>
                <div className="text-[11px]" style={{ color: '#AAA' }}>约 ¥16.5/月</div>
              </div>
            </div>
          </div>
          {/* Monthly plan */}
          <div className="rounded-[16px] p-4" style={{ background: '#FFF', border: '1.5px solid #EBEBEB' }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[14px] font-semibold" style={{ color: '#333' }}>月度方案</div>
                <div className="text-[12px]" style={{ color: '#BBB' }}>随时取消</div>
              </div>
              <div className="text-[18px] font-bold" style={{ color: '#555' }}>¥28<span className="text-[12px] font-normal">/月</span></div>
            </div>
          </div>
          <p className="text-center text-[11px]" style={{ color: '#999' }}>可随时取消 · <span style={{ color: '#2D8CFF' }}>暂时免费使用</span></p>
        </div>
      </div>
    );
  }

  // ── Shell ──────────────────────────────────────────────────────────────────

  return (
    <div className="h-full flex overflow-hidden"
      style={{
        background: isStarMap ? '#1B1B1B' : '#F6F6F6',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        transition: 'background 0.4s ease',
      }}>

      {/* Content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-14 flex items-center gap-2 px-6 flex-shrink-0">
          <button onClick={goBack}
            className="w-9 h-9 flex items-center justify-center rounded-full transition-colors"
            style={{ background: 'transparent' }}>
            <ArrowLeft size={20} strokeWidth={2} color={isStarMap ? '#666' : '#555'} />
          </button>
          {step === 1 && !creating && (
            <h1 className="text-[22px] font-semibold leading-none" style={{ color: '#171717' }}>
              最近主要在准备什么？
            </h1>
          )}
        </div>

        {/* Screen */}
        <div className="flex-1 overflow-y-auto py-1">
          {renderContent()}
        </div>

        {/* CTA */}
        {!creating && (
          <div className={`px-8 pb-4 pt-2 flex-shrink-0 ${step === 1 ? 'w-full max-w-[980px] mx-auto' : ''}`}>
            <button onClick={goNext} disabled={!ctaEnabled()}
              className="w-full py-[18px] rounded-[20px] text-[15px] font-semibold transition-all"
              style={{
                background: ctaEnabled() ? '#FDEA3B' : '#E8E8E8',
                color: ctaEnabled() ? '#222' : '#BBB',
                cursor: ctaEnabled() ? 'pointer' : 'not-allowed',
                boxShadow: ctaEnabled() ? '0 4px 20px rgba(255,229,98,0.4)' : 'none',
              }}>
              {ctaLabel()}
            </button>
          </div>
        )}
      </div>

      {/* Right progress dots */}
      <div className="flex flex-col items-center justify-center gap-2.5 px-3 flex-shrink-0"
        style={{
          background: isStarMap ? '#161616' : '#FFF',
          borderLeft: `1px solid ${isStarMap ? '#2A2A2A' : '#EBEBEB'}`,
          width: 44,
        }}>
        {Array.from({ length: TOTAL }, (_, i) => {
          const active = i + 1 === step;
          const done   = i + 1 < step;
          return (
            <div key={i} style={{
              width: 7,
              height: active ? 22 : 7,
              borderRadius: 4,
              background: active ? '#FDEA3B' : done ? '#FDC70088' : (isStarMap ? '#2C2C2C' : '#E4E4E4'),
              transition: 'all 0.3s ease',
            }} />
          );
        })}
      </div>

      {showLanguageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5" style={{ background: 'rgba(17,17,17,0.42)' }}>
          <div className="w-full max-w-[430px] rounded-[18px] p-6 shadow-2xl" style={{ background: '#FFF' }} role="dialog" aria-modal="true" aria-labelledby="language-limit-title">
            <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4" style={{ background: '#FFF7CC' }}>
              <Languages size={21} color="#8A6B00" strokeWidth={1.9} />
            </div>
            <h2 id="language-limit-title" className="text-[18px] font-bold mb-2" style={{ color: '#111' }}>当前版本暂未针对语言学习优化</h2>
            <p className="text-[13px] leading-6 mb-5" style={{ color: '#666' }}>
              云记目前更适合需要理解、整理和记忆的知识类科目。四六级、雅思、托福等语言考试涉及词汇、听力、口语等专项训练，当前版本暂不能提供完整支持。
            </p>
            <div className="flex flex-col-reverse sm:flex-row gap-2.5">
              <button
                onClick={() => {
                  setGoalDetail('');
                  setLanguageConfirmed(false);
                  setShowLanguageModal(false);
                }}
                className="flex-1 h-11 rounded-[10px] text-[13px] font-semibold"
                style={{ background: '#F3F4F6', color: '#555' }}
              >
                返回选择其他类型
              </button>
              <button
                onClick={() => {
                  setLanguageConfirmed(true);
                  setShowLanguageModal(false);
                }}
                className="flex-1 h-11 rounded-[10px] text-[13px] font-semibold"
                style={{ background: '#FDEA3B', color: '#222' }}
              >
                仍然继续
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
