import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  AlertTriangle, ArrowLeft, BookOpen, CalendarDays, ChevronDown, ChevronLeft, ChevronRight,
  Check, Clock3, Flag, Grid3X3, GripVertical, Layers3, List, Sparkles, Star, Trash2, X,
} from 'lucide-react';

export type PlanDemoScenario = 'fit' | 'slight' | 'material' | 'extreme' | 'impossible';
export type PlanWeekendMode = 'rest' | 'study';

interface KP { id: string; name: string; known?: boolean }
interface Module { id: string; name: string; minutes: number; kps: KP[] }
interface PlanDate { iso: string; label: string; weekday: string; modules: Module[]; phase?: 'learn' | 'sprint' | 'exam'; isRestDay?: boolean }
interface PlanFrameworkScreenProps {
  onConfirm: () => void;
  onBack: () => void;
  onHome: () => void;
  demoScenario?: PlanDemoScenario;
  initialState?: 'confirmation' | 'daily';
  onViewKnowledgeSystem?: () => void;
  weekendMode?: PlanWeekendMode;
}

const C = {
  ink: '#1A1D2E', sub: '#666', mut: '#999', faint: '#C8CCD3',
  bg: '#F6F6F6', card: '#FFF', line: '#E8E9EC', panel: '#F3F4F6',
  blue: '#2D8CFF', blueBg: '#EEF6FF', green: '#00A63E', greenBg: '#F3FCF6',
  yellow: '#FFE562', amber: '#A86600', amberBg: '#FFF7E5', red: '#E5484D', redBg: '#FFF0F0',
};

const kp = (id: string, name: string): KP => ({ id, name });
const m = (id: string, name: string, minutes: number, names: string[]): Module => ({
  id, name, minutes, kps: names.map((name, i) => kp(`${id}-${i}`, name)),
});
const mKnown = (id: string, name: string, minutes: number, names: string[], knownCount: number): Module => ({
  ...m(id, name, minutes, names),
  kps: names.map((name, index) => ({ id: `${id}-${index}`, name, known: index < knownCount })),
});
const TODAY_ISO = '2026-08-04';

const PLAN_DATE_SEEDS: PlanDate[] = [
  { iso: '2026-07-30', label: '7月30日', weekday: '周四 · 待补', phase: 'learn', modules: [
    m('overdue-seed', '刑法基础导论', 20, ['刑法的任务', '刑法解释方法']),
  ]},
  { iso: '2026-07-31', label: '7月31日', weekday: '周五', phase: 'learn', modules: [
    mKnown('criminal-principles', '刑法基本原则', 28, ['罪刑法定原则', '罪刑相适应原则', '平等适用原则'], 3),
    mKnown('scope', '刑法效力范围', 34, ['属地管辖', '属人管辖', '保护管辖', '普遍管辖'], 4),
    mKnown('crime-concept', '犯罪概念与特征', 25, ['社会危害性', '刑事违法性', '应受惩罚性'], 3),
  ]},
  { iso: '2026-08-01', label: '8月1日', weekday: '周六 · 休息日', phase: 'learn', modules: [], isRestDay: true },
  { iso: '2026-08-02', label: '8月2日', weekday: '周日 · 休息日', phase: 'learn', modules: [], isRestDay: true },
  { iso: '2026-08-03', label: '8月3日', weekday: '周一', phase: 'learn', modules: [
    mKnown('intent', '故意与过失', 36, ['直接故意', '间接故意', '疏忽大意过失', '过于自信过失'], 4),
    mKnown('unfinished', '犯罪未完成形态', 32, ['犯罪预备', '犯罪未遂', '犯罪中止'], 1),
  ]},
  { iso: '2026-08-04', label: '8月4日', weekday: '周二 · 今天', phase: 'learn', modules: [
    mKnown('joint', '共同犯罪', 42, ['主犯认定', '从犯与胁从犯', '教唆犯', '共犯过剩'], 3),
    m('defense', '正当化事由', 30, ['正当防卫', '紧急避险', '防卫过当']),
  ]},
  { iso: '2026-08-05', label: '8月5日', weekday: '周三', phase: 'learn', modules: [
    m('life', '侵犯生命健康罪', 38, ['故意杀人罪', '故意伤害罪', '轻重伤认定']),
    m('freedom', '侵犯人身自由罪', 30, ['非法拘禁罪', '绑架罪', '两罪界限']),
  ]},
  { iso: '2026-08-06', label: '8月6日', weekday: '周四', phase: 'learn', modules: [
    m('property', '财产犯罪总论', 44, ['盗窃罪', '诈骗罪', '抢劫罪', '抢夺罪']),
  ]},
  { iso: '2026-08-07', label: '8月7日', weekday: '周五', phase: 'learn', modules: [
    m('bribery', '贪污贿赂犯罪', 46, ['受贿罪', '斡旋受贿', '行贿罪', '单位受贿']),
  ]},
  { iso: '2026-08-24', label: '8月24日', weekday: '周一', phase: 'sprint', modules: [
    m('review-weak', '薄弱知识补强', 45, ['共同犯罪边界', '财产犯罪区分']),
  ]},
  { iso: '2026-08-27', label: '8月27日', weekday: '周四 · 考前一天', phase: 'sprint', modules: [
    m('review-final', '考前查漏补缺', 50, ['错题回顾', '核心规则快速复习']),
  ]},
  { iso: '2026-08-28', label: '8月28日', weekday: '周五 · 考试日', phase: 'exam', modules: [] },
];

function buildPlanDates(seeds: PlanDate[]): PlanDate[] {
  const seedMap = new Map(seeds.map(day => [day.iso, day]));
  const weekdayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const result: PlanDate[] = [];
  const cursor = new Date(2026, 6, 30);
  const end = new Date(2026, 7, 28);
  const generatedNames = [
    '犯罪构成基础', '因果关系判断', '责任要素', '违法阻却事由', '财产犯罪进阶',
    '人身犯罪进阶', '贪污贿赂辨析', '共同犯罪进阶', '罪数与竞合', '刑罚裁量',
    '间隔复习 · 基础原则', '间隔复习 · 犯罪形态', '间隔复习 · 重点罪名',
  ];
  let generatedIndex = 0;
  while (cursor <= end) {
    const iso = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
    const seed = seedMap.get(iso);
    const phase: PlanDate['phase'] = iso === '2026-08-28' ? 'exam' : iso >= '2026-08-24' ? 'sprint' : 'learn';
    const weekend = cursor.getDay() === 0 || cursor.getDay() === 6;
    const generatedModules = !weekend && phase !== 'exam' ? [
      m(`generated-${iso}`, phase === 'sprint' ? `冲刺 · ${generatedNames[generatedIndex % generatedNames.length]}` : generatedNames[generatedIndex % generatedNames.length],
        36 + generatedIndex % 4 * 4, ['核心概念', '判断规则', '易错辨析', ...(generatedIndex % 2 ? ['典型例题'] : [])]),
      ...(generatedIndex % 3 === 1 ? [m(`interval-${iso}`, '间隔复习', 18, ['昨日回顾', '薄弱点抽检'])] : []),
    ] : [];
    if (!seed && generatedModules.length) generatedIndex += 1;
    result.push(seed ?? {
      iso,
      label: `${cursor.getMonth() + 1}月${cursor.getDate()}日`,
      weekday: `${weekdayNames[cursor.getDay()]}${weekend ? ' · 休息日' : ''}`,
      phase,
      modules: generatedModules,
      isRestDay: weekend,
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return result;
}

const INITIAL_DATES = buildPlanDates(PLAN_DATE_SEEDS);

function applyWeekendMode(plan: PlanDate[], mode: PlanWeekendMode): PlanDate[] {
  if (mode === 'rest') return plan;
  return plan.map(day => {
    if (!day.isRestDay || day.phase === 'exam') return day;
    return {
      ...day,
      isRestDay: false,
      modules: [m(`weekend-${day.iso}`, '周末学习安排', 32, ['本周重点回顾', '易错点抽检', '下周内容预习'])],
    };
  });
}

function rebalanceFuturePlan(plan: PlanDate[], lockedModuleId?: string, lockedIso?: string): PlanDate[] {
  const futureDays = plan.filter(day => day.iso >= TODAY_ISO && day.phase !== 'exam');
  const eligible = futureDays.filter(day => !day.isRestDay);
  if (!eligible.length) return plan;
  const allFutureModules = futureDays.flatMap(day => day.modules);
  if (allFutureModules.length < eligible.length) return plan;
  const locked = lockedModuleId ? allFutureModules.find(mod => mod.id === lockedModuleId) : undefined;
  const queue = allFutureModules.filter(mod => mod.id !== lockedModuleId);
  const base = Math.floor(allFutureModules.length / eligible.length);
  const extra = allFutureModules.length % eligible.length;
  const modulesByIso = new Map<string, Module[]>();
  eligible.forEach((day, index) => modulesByIso.set(day.iso, []));
  if (locked && lockedIso && modulesByIso.has(lockedIso)) modulesByIso.get(lockedIso)!.push(locked);
  eligible.forEach((day, index) => {
    const target = modulesByIso.get(day.iso)!;
    const capacity = base + (index < extra ? 1 : 0);
    while (target.length < capacity && queue.length) target.push(queue.shift()!);
  });
  while (queue.length) modulesByIso.get(eligible[eligible.length - 1].iso)!.push(queue.shift()!);
  const futureIso = new Set(futureDays.map(day => day.iso));
  return plan.map(day => futureIso.has(day.iso) ? { ...day, modules: modulesByIso.get(day.iso) ?? [] } : day);
}

const EXCLUDED_SEED = [
  m('optional-1', '低频司法解释', 24, ['特殊时效规则', '域外判例辨析']),
  m('optional-2', '介绍贿赂罪', 18, ['行为方式', '既遂标准']),
  m('optional-3', '单位行贿补充', 22, ['主体范围', '责任人员认定']),
];

const scenarioData: Record<PlanDemoScenario, {
  needHours: number; included: number; days: number; dailyKps: number; coverage: number;
  title: string; detail: string; tone: 'ok' | 'warn' | 'danger';
}> = {
  fit: { needHours: 1.6, included: 164, days: 28, dailyKps: 6, coverage: 100,
    title: '', detail: '', tone: 'ok' },
  slight: { needHours: 9.1, included: 164, days: 20, dailyKps: 8, coverage: 100,
    title: '当前计划轻度超出建议范围', detail: '每天约需9小时06分钟，超过默认上限8小时。', tone: 'warn' },
  material: { needHours: 12.4, included: 164, days: 16, dailyKps: 11, coverage: 100,
    title: '当前计划明显超限', detail: '建议先增加学习日；若仍超限，再调整每日时长或计划范围。', tone: 'warn' },
  extreme: { needHours: 18.2, included: 164, days: 11, dailyKps: 15, coverage: 100,
    title: '当前计划极端超限', detail: '即使每天学习18小时，也几乎没有休息和补欠空间。', tone: 'danger' },
  impossible: { needHours: 27.3, included: 164, days: 8, dailyKps: 21, coverage: 100,
    title: '考试前无法完成全部内容', detail: '单日不会安排超过24小时，剩余任务将排到考试后。', tone: 'danger' },
};

function formatHours(value: number) {
  const h = Math.floor(value);
  const min = Math.round((value - h) * 60);
  return min ? `${h}h ${min}m` : `${h}h`;
}

export default function PlanFrameworkScreen({
  onConfirm, onBack, onHome, demoScenario = 'fit', initialState = 'confirmation', onViewKnowledgeSystem, weekendMode = 'rest',
}: PlanFrameworkScreenProps) {
  const [dates, setDates] = useState(() => applyWeekendMode(INITIAL_DATES, weekendMode));
  const [view, setView] = useState<'week' | 'month'>(initialState === 'daily' ? 'month' : 'week');
  const [weeklyDays, setWeeklyDays] = useState([1, 2, 3, 4, 5]);
  const [dailyLimit, setDailyLimit] = useState(8);
  const [customOpen, setCustomOpen] = useState(false);
  const [excluded, setExcluded] = useState(EXCLUDED_SEED);
  const [moduleId, setModuleId] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<{ kind: 'module' | 'kp'; moduleId: string; kpId?: string; label: string } | null>(null);
  const [drag, setDrag] = useState<{ kind: 'module' | 'kp'; moduleId: string; kpId?: string; fromIso: string; label: string } | null>(null);
  const [saved, setSaved] = useState(initialState === 'daily');
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set(['criminal-principles-0']));
  const [showMasteryHint, setShowMasteryHint] = useState(false);
  const [forceConfirm, setForceConfirm] = useState(false);
  const [showViewGuide, setShowViewGuide] = useState(initialState === 'daily');

  const scenario = scenarioData[demoScenario];
  const allModules = dates.flatMap(d => d.modules);
  const planStudyDays = dates.filter(day => day.modules.length > 0).length;
  const planRestDays = dates.filter(day => day.isRestDay).length;
  const activeModuleIndex = allModules.findIndex(item => item.id === moduleId);
  const activeModule = activeModuleIndex >= 0 ? allModules[activeModuleIndex] : null;
  const includedCount = Math.max(0, scenario.included - excluded.length * 2);
  const coverage = Math.round(includedCount / 164 * 100);
  const calculatedDays = Math.max(1, Math.round(scenario.days * weeklyDays.length / 5));
  const calculatedHours = Math.max(.5, scenario.needHours * 5 / weeklyDays.length);
  const summary = {
    included: includedCount,
    days: calculatedDays,
    hours: calculatedHours,
    dailyKps: Math.max(1, Math.round(includedCount / calculatedDays)),
    coverage,
  };
  const overloaded = demoScenario !== 'fit' || calculatedHours > dailyLimit;
  const danger = demoScenario === 'extreme' || demoScenario === 'impossible';
  const dailyMode = initialState === 'daily' || saved;
  const todayPlan = dates.find(day => day.iso === TODAY_ISO);
  const todayTodoCount = todayPlan?.modules.reduce((sum, mod) => sum + mod.kps.length, 0) ?? 0;
  const todayKnownCount = todayPlan?.modules.reduce((sum, mod) => sum + mod.kps.filter(item => item.known).length, 0) ?? 0;
  const todayCtaLabel = todayKnownCount === 0 ? '开始今日学习'
    : todayKnownCount < todayTodoCount ? '继续今日学习' : '复习今日内容';
  useEffect(() => { if (dailyMode) setShowViewGuide(true); }, [dailyMode]);

  const moveItem = (toIso: string) => {
    if (!drag || drag.fromIso === toIso) return setDrag(null);
    if (drag.kind === 'kp' && drag.kpId) {
      let moving: KP | undefined;
      setDates(prev => {
        const updated = prev.map(day => ({ ...day, modules: day.modules.map(mod => {
        const found = mod.id === drag.moduleId ? mod.kps.find(item => item.id === drag.kpId) : undefined;
        if (found) moving = found;
        return mod.id === drag.moduleId ? { ...mod, kps: mod.kps.filter(item => item.id !== drag.kpId) } : mod;
      }).filter(mod => mod.kps.length > 0) })).map(day => {
        if (day.iso !== toIso || !moving) return day;
        const manualId = `manual-${toIso}`;
        const existing = day.modules.find(mod => mod.id === manualId);
        return existing
          ? { ...day, isRestDay: false, modules: day.modules.map(mod => mod.id === manualId ? { ...mod, kps: [...mod.kps, moving!] } : mod) }
          : { ...day, isRestDay: false, modules: [...day.modules, { id: manualId, name: '手动调入', minutes: 8, kps: [moving] }] };
        });
        return rebalanceFuturePlan(updated, `manual-${toIso}`, toIso);
      });
      setDrag(null);
      return;
    }
    let moving: Module | undefined;
    const without = dates.map(day => {
      const found = day.modules.find(item => item.id === drag.moduleId);
      if (found) moving = found;
      return { ...day, modules: day.modules.filter(item => item.id !== drag.moduleId) };
    });
    if (moving) {
      const moved = without.map(day => day.iso === toIso ? { ...day, isRestDay: false, modules: [...day.modules, moving!] } : day);
      setDates(rebalanceFuturePlan(moved, moving.id, toIso));
    }
    setDrag(null);
  };

  const removeConfirmed = () => {
    if (!confirmRemove) return;
    if (confirmRemove.kind === 'module') {
      let removed: Module | undefined;
      setDates(prev => rebalanceFuturePlan(prev.map(day => {
        const found = day.modules.find(item => item.id === confirmRemove.moduleId);
        if (found) removed = found;
        return { ...day, modules: day.modules.filter(item => item.id !== confirmRemove.moduleId) };
      })));
      if (removed) setExcluded(prev => [...prev, removed!]);
      setModuleId(null);
    } else {
      setDates(prev => prev.map(day => ({ ...day, modules: day.modules.map(mod =>
        mod.id === confirmRemove.moduleId
          ? { ...mod, kps: mod.kps.filter(item => item.id !== confirmRemove.kpId) }
          : mod,
      ) })));
    }
    setConfirmRemove(null);
  };

  const applyAiSuggestion = () => {
    setWeeklyDays([1, 2, 3, 4, 5, 6, 7]);
    setDailyLimit(8);
    setCustomOpen(false);
  };

  const toggleKnown = (targetModuleId: string, kpId: string) => setDates(prev => prev.map(day => ({
    ...day,
    modules: day.modules.map(mod => mod.id === targetModuleId
      ? { ...mod, kps: mod.kps.map(item => item.id === kpId ? { ...item, known: !item.known } : item) }
      : mod),
  })));

  const setWeeklyDaysAndReflow: React.Dispatch<React.SetStateAction<number[]>> = (value) => {
    const next = typeof value === 'function' ? value(weeklyDays) : value;
    setWeeklyDays(next);
    setDates(prev => rebalanceFuturePlan(prev.map(day => {
      if (day.iso < TODAY_ISO || day.phase === 'exam') return day;
      const jsDay = new Date(`${day.iso}T12:00:00`).getDay();
      const planWeekday = jsDay === 0 ? 7 : jsDay;
      return { ...day, isRestDay: !next.includes(planWeekday) };
    })));
  };

  const activateStudyDay = (iso: string) => {
    setDates(prev => rebalanceFuturePlan(prev.map(day => day.iso === iso
      ? { ...day, isRestDay: false, weekday: day.weekday.replace(' · 休息日', '') }
      : day)));
  };

  const requestSave = () => {
    if (danger || demoScenario === 'material') setForceConfirm(true);
    else setSaved(true);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.bg, color: C.ink, position: 'relative' }}>
      <header style={{ height: 54, padding: '0 24px', display: 'flex', alignItems: 'center', gap: 12,
        background: C.card, borderBottom: `1px solid ${C.line}`, flexShrink: 0 }}>
        <button onClick={onBack} style={iconButton}><ArrowLeft size={17} /></button>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 17, fontWeight: 800 }}>法考 · 备考计划</span>
        </div>
        <span style={{ fontSize: 10.5, color: C.faint }}>30天 · {planStudyDays}个任务学习日</span>
        <div style={{ flex: 1 }} />
        {dailyMode && onViewKnowledgeSystem && <button onClick={onViewKnowledgeSystem}
          style={{ border: 0, background: 'transparent', color: C.blue, fontSize: 11.5, fontWeight: 600,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, padding: '4px 6px' }}>
          查看学习进度 <ChevronRight size={13} />
        </button>}
        {!dailyMode && <ViewIconSwitch value={view} onChange={setView} />}
      </header>

      <main style={{ flex: 1, overflowY: 'auto', padding: dailyMode && view === 'week' ? '12px 24px 82px'
        : dailyMode ? '12px 24px' : '12px 24px 88px' }}>
        {!dailyMode && <section style={{ ...card, padding: '14px 16px', marginBottom: 12, borderColor: danger ? '#F3B8BA' : C.line }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: danger ? C.redBg : C.blueBg,
              color: danger ? C.red : C.blue, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              {overloaded ? <AlertTriangle size={16} /> : <Sparkles size={16} />}
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ margin: 0, fontSize: 17, lineHeight: 1.3 }}>{saved ? '计划已保存' : 'AI 已生成学习计划'}</h1>
              <p style={{ margin: '4px 0 0', color: C.sub, fontSize: 11.5, lineHeight: 1.5 }}>
                基础与前置知识优先，并按你的每周学习节奏倒排至考试前一天。
              </p>
            </div>
          </div>

          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 7, color: C.mut, fontSize: 10.5 }}>
            <span>12份资料</span><span>→</span><span>24个章节</span><span>→</span>
            <span>164个知识点</span><span>→</span><strong style={{ color: C.blue }}>30天日历排程</strong>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', marginTop: 10,
            background: '#F7F8FA', borderRadius: 10, border: `1px solid ${C.line}` }}>
            <SummaryItem icon={<BookOpen size={15} />} label="计划范围"
              value={`${summary.included} / 164 已加入`} sub={`覆盖率 ${summary.coverage}%`} />
            <SummaryItem icon={<CalendarDays size={15} />} label="计划周期"
              value="30个自然日" sub={`${planStudyDays}个任务学习日 · ${planRestDays}个休息日`} />
            <SummaryItem icon={<Layers3 size={15} />} label="学习阶段"
              value={`${Math.max(1, summary.days - 7)}个新学日`} sub="7个冲刺日 · 新学含间隔复习" />
            <SummaryItem icon={<Clock3 size={15} />} label="每日负荷"
              value={`平均 ${formatHours(summary.hours)}`} sub={`约${summary.dailyKps}个知识点`} />
          </div>

          {overloaded && <div style={{ marginTop: 10, padding: '8px 10px', borderRadius: 8,
            background: danger ? C.redBg : C.amberBg, color: danger ? C.red : C.amber,
            display: 'flex', gap: 7, alignItems: 'center' }}>
            <AlertTriangle size={14} />
            <strong style={{ fontSize: 11.5 }}>{scenario.title}</strong>
            <span style={{ fontSize: 10.5 }}>{scenario.detail}</span>
          </div>}

          {overloaded && !saved && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.line}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <strong style={{ display: 'block', fontSize: 13 }}>AI 建议</strong>
                  <span style={{ fontSize: 11.5, color: C.sub }}>
                    优先增加至每周7个学习日；如果仍然超限，再调整每日时长或计划范围。
                  </span>
                </div>
                <button onClick={applyAiSuggestion} style={primarySmall}>接受 AI 建议</button>
                <button onClick={() => setCustomOpen(value => !value)} style={secondarySmall}>
                  自定义调整 {customOpen ? '收起' : '展开'}
                </button>
              </div>
              {customOpen && (
                <CustomPanel
                  weeklyDays={weeklyDays} setWeeklyDays={setWeeklyDaysAndReflow}
                  dailyLimit={dailyLimit} setDailyLimit={setDailyLimit}
                  dates={dates} setDates={setDates} excluded={excluded} setExcluded={setExcluded}
                />
              )}
            </div>
          )}
        </section>}

        {(dailyMode ? 'month' : view) === 'week' ? (
          <WeekSchedule dates={dates} drag={drag} setDrag={setDrag} moveItem={moveItem}
            view={view} onViewChange={setView}
            showViewGuide={showViewGuide} onDismissViewGuide={() => setShowViewGuide(false)}
            openModule={setModuleId} dailyMode={dailyMode} bookmarked={bookmarked}
            onKnown={toggleKnown} onMasteryHint={() => setShowMasteryHint(true)}
            onBookmark={(kpId) => setBookmarked(current => { const next = new Set(current); next.has(kpId) ? next.delete(kpId) : next.add(kpId); return next; })}
            requestRemove={(mod) => setConfirmRemove({ kind: 'module', moduleId: mod.id, label: mod.name })} />
        ) : (
          <MonthSchedule dates={dates} drag={drag} setDrag={setDrag}
            moveItem={moveItem} openModule={setModuleId} dailyMode={dailyMode} onReturnToSchedule={() => setView('week')}
            view={view} onViewChange={setView} bookmarked={bookmarked}
            showViewGuide={showViewGuide} onDismissViewGuide={() => setShowViewGuide(false)}
            onKnown={toggleKnown} onMasteryHint={() => setShowMasteryHint(true)} onStartLearning={onConfirm}
            onActivateStudyDay={activateStudyDay}
            onBookmark={(kpId) => setBookmarked(current => { const next = new Set(current); next.has(kpId) ? next.delete(kpId) : next.add(kpId); return next; })}
            requestRemove={(mod) => setConfirmRemove({ kind: 'module', moduleId: mod.id, label: mod.name })} />
        )}
      </main>

      {!dailyMode && <footer style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '12px 24px',
        display: 'flex', justifyContent: 'flex-end', gap: 10, background: C.card, borderTop: `1px solid ${C.line}` }}>
        <button onClick={requestSave} style={{ ...primaryButton, background: danger ? C.red : C.ink }}>
          {danger ? '仍按当前计划保存' : '确认并保存计划'} →
        </button>
      </footer>}

      {dailyMode && view === 'week' && <button onClick={onConfirm}
        style={{ ...primaryButton, position: 'absolute', right: 24, bottom: 18, zIndex: 90, minWidth: 168,
          padding: '13px 18px', borderRadius: 14, boxShadow: '0 10px 28px #11152735' }}>
        {todayCtaLabel} →
      </button>}

      {activeModule && (
        <ModulePopover module={activeModule} index={activeModuleIndex} total={allModules.length}
          dailyMode={dailyMode} bookmarked={bookmarked}
          onClose={() => setModuleId(null)}
          onPrev={() => setModuleId(allModules[Math.max(0, activeModuleIndex - 1)].id)}
          onNext={() => setModuleId(allModules[Math.min(allModules.length - 1, activeModuleIndex + 1)].id)}
          onKnown={(kpId) => toggleKnown(activeModule.id, kpId)} onMasteryHint={() => setShowMasteryHint(true)}
          onBookmark={(kpId) => setBookmarked(current => { const next = new Set(current); next.has(kpId) ? next.delete(kpId) : next.add(kpId); return next; })}
          onDragKP={(item) => {
            const fromDay = dates.find(day => day.modules.some(mod => mod.id === activeModule.id));
            if (fromDay) setDrag({ kind: 'kp', moduleId: activeModule.id, kpId: item.id, fromIso: fromDay.iso, label: item.name });
            setModuleId(null);
          }}
          onRemoveModule={() => setConfirmRemove({ kind: 'module', moduleId: activeModule.id, label: activeModule.name })}
          onRemoveKP={(item) => setConfirmRemove({ kind: 'kp', moduleId: activeModule.id, kpId: item.id, label: item.name })}
        />
      )}

      {showMasteryHint && <div style={{ position: 'absolute', left: '50%', bottom: 78, transform: 'translateX(-50%)', zIndex: 140,
        padding: '9px 14px', borderRadius: 10, background: C.ink, color: '#fff', fontSize: 10.5, boxShadow: '0 8px 24px #0003' }}>
        勾选表示“我已经掌握”；将跳过首次学习，并在之后安排复习验证。
        <button onClick={() => setShowMasteryHint(false)} style={{ marginLeft: 10, border: 0, background: 'transparent', color: C.yellow, cursor: 'pointer' }}>知道了</button>
      </div>}

      {drag?.kind === 'kp' && <div style={{ position: 'absolute', left: '50%', bottom: 76, transform: 'translateX(-50%)', zIndex: 130,
        background: C.ink, color: '#fff', padding: '8px 14px', borderRadius: 10, fontSize: 10.5, boxShadow: '0 8px 24px #0003' }}>
        正在移动「{drag.label}」——拖到时间轴的目标日期
      </div>}

      {confirmRemove && (
        <ConfirmModal title={`将“${confirmRemove.label}”移出当前计划？`}
          body="移出后不再安排学习、复习、出题或模考，也不计入计划容量与统计。知识点和原资料不会删除，之后可在完整知识点列表中重新加入。"
          confirmLabel="移出当前计划" onCancel={() => setConfirmRemove(null)} onConfirm={removeConfirmed} />
      )}

      {forceConfirm && (
        <ConfirmModal title="这个计划很可能无法按期完成"
          body={`${scenario.detail} 系统不会在任何一天安排超过24小时；无法排入考试前的内容将安排到考试后，目标达成率会持续体现覆盖不足风险。`}
          confirmLabel="我了解风险，仍然保存" onCancel={() => setForceConfirm(false)}
          onConfirm={() => { setForceConfirm(false); setSaved(true); }} danger />
      )}
    </div>
  );
}

function SummaryItem({ icon, value, label, sub }: { icon: React.ReactNode; value: string; label: string; sub: string }) {
  return <div style={{ display: 'flex', gap: 8, padding: '10px 12px', borderRight: `1px solid ${C.line}` }}>
    <span style={{ color: C.blue, marginTop: 1 }}>{icon}</span>
    <div>
      <span style={{ display: 'block', fontSize: 9.5, color: C.mut }}>{label}</span>
      <strong style={{ display: 'block', fontSize: 12, marginTop: 2 }}>{value}</strong>
      <span style={{ display: 'block', fontSize: 9.5, color: C.sub, marginTop: 1 }}>{sub}</span>
    </div>
  </div>;
}

function ViewIconSwitch({ value, onChange }: {
  value: 'week' | 'month'; onChange: (value: 'week' | 'month') => void;
}) {
  const target = value === 'week' ? 'month' : 'week';
  const label = target === 'month' ? '切换到月历视图' : '切换到日程视图';
  return <button aria-label={label} title={label} onClick={() => onChange(target)}
    style={{ ...iconButton, width: 40, height: 40, border: `1px solid ${C.line}`, borderRadius: 9,
      background: C.card, color: C.ink, boxShadow: '0 1px 4px #0000000D' }}>
    {target === 'month' ? <Grid3X3 size={15} /> : <List size={16} />}
  </button>;
}

type PlanDrag = { kind: 'module' | 'kp'; moduleId: string; kpId?: string; fromIso: string; label: string };

function WeekSchedule({ dates, drag, setDrag, moveItem, openModule, requestRemove, dailyMode,
  bookmarked, onKnown, onBookmark, onMasteryHint, view, onViewChange, showViewGuide, onDismissViewGuide }: {
  dates: PlanDate[]; drag: PlanDrag | null;
  setDrag: (value: PlanDrag | null) => void;
  moveItem: (iso: string) => void; openModule: (id: string) => void; requestRemove: (mod: Module) => void;
  dailyMode: boolean; bookmarked: Set<string>;
  onKnown: (moduleId: string, kpId: string) => void; onBookmark: (kpId: string) => void; onMasteryHint: () => void;
  view: 'week' | 'month'; onViewChange: (value: 'week' | 'month') => void;
  showViewGuide: boolean; onDismissViewGuide: () => void;
}) {
  const today = dates.find(day => day.iso === TODAY_ISO);
  const defaultExpanded = today?.modules.find(mod => mod.kps.some(item => item.known) && mod.kps.some(item => !item.known))
    ?? today?.modules.find(mod => mod.kps.some(item => !item.known));
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(dailyMode ? defaultExpanded?.id ?? null : null);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(() => new Set(TODAY_ISO ? [TODAY_ISO] : []));
  const toggleDay = (iso: string) => setExpandedDays(prev => {
    const next = new Set(prev);
    next.has(iso) ? next.delete(iso) : next.add(iso);
    return next;
  });
  const todayRowRef = useRef<HTMLDivElement | null>(null);
  const guideModuleId = dates.flatMap(day => day.modules)[0]?.id;
  useEffect(() => {
    if (!dailyMode) return;
    if (defaultExpanded) setExpandedModuleId(defaultExpanded.id);
  }, [dailyMode, defaultExpanded?.id]);
  useLayoutEffect(() => {
    if (dailyMode) todayRowRef.current?.scrollIntoView({ block: 'center', behavior: 'auto' });
  }, [dailyMode]);
  return <section style={{ ...card, overflow: 'hidden', position: 'relative' }}>
    {dates.map((day, index) => {
      const phaseChanged = index === 0 || dates[index - 1].phase !== day.phase;
      const phaseColor = day.phase === 'sprint' ? '#E58A00' : day.phase === 'exam' ? C.red : C.blue;
      const phaseLabel = day.phase === 'sprint' ? '冲刺 · 8月24日—8月27日'
        : day.phase === 'exam' ? '考试 · 8月28日' : '新学（含间隔复习） · 7月30日—8月23日';
      const isRest = !!day.isRestDay;
      const isToday = day.iso === TODAY_ISO;
      const dayCollapsed = dailyMode && day.modules.length > 0 && !expandedDays.has(day.iso);
      const compact = isRest || dayCollapsed;
      return <React.Fragment key={day.iso}>
        {phaseChanged && <div style={{ padding: '6px 14px 6px 150px', background: `${phaseColor}0D`,
          borderTop: `1px solid ${phaseColor}22`, color: phaseColor, fontSize: 10, fontWeight: 700 }}>
          {day.phase === 'exam' && <Flag size={10} style={{ display: 'inline', marginRight: 5 }} />}{phaseLabel}
        </div>}
        <div ref={isToday ? todayRowRef : undefined} onDragOver={e => e.preventDefault()} onDrop={() => moveItem(day.iso)}
          style={{ display: 'grid', gridTemplateColumns: '150px 1fr', minHeight: day.phase === 'exam' ? 44 : compact ? 38 : 62,
            borderTop: `1px solid ${C.line}`, background: isToday ? '#FFFBEA' : isRest ? '#FAFAFB' : drag ? '#FBFDFF' : C.card,
            boxShadow: isToday ? `inset 4px 0 0 ${C.yellow}` : 'none' }}>
          <div style={{ padding: compact ? '8px 10px 8px 27px' : '9px 12px 9px 27px', borderRight: `1px solid ${C.line}`, position: 'relative',
            display: compact ? 'flex' : 'block', alignItems: 'center', gap: 7 }}>
            <span style={{ position: 'absolute', left: 13, top: 0, bottom: 0, width: 1, background: `${phaseColor}35` }} />
            <span style={{ position: 'absolute', left: isToday ? 7 : 9, top: compact ? 14 : isToday ? 14 : 16, width: isToday ? 13 : 9, height: isToday ? 13 : 9, borderRadius: '50%',
              background: isRest ? '#D8DADF' : isToday ? C.yellow : phaseColor,
              border: `2px solid ${isToday ? '#FFFBEA' : C.card}`, boxShadow: `0 0 0 ${isToday ? 2 : 1}px ${isToday ? '#E5C90088' : `${phaseColor}55`}` }} />
            <strong style={{ display: compact ? 'inline' : 'block', fontSize: compact ? 10.5 : 12 }}>{day.label}</strong>
            <span style={{ fontSize: 9.5, color: day.modules.length ? C.mut : C.faint }}>{day.weekday.replace(' · 休息日', '').replace(' · 今天', '')}</span>
            {isToday && <span style={{ display: 'inline-block', marginLeft: 6, padding: '2px 6px', borderRadius: 9,
              background: '#D6B900', color: '#fff', fontSize: 8, fontWeight: 800 }}>今天</span>}
            {day.modules.length > 0 && !compact && <span style={{ display: 'block', marginTop: 3, fontSize: 9, color: phaseColor }}>
              {day.modules.reduce((n, mod) => n + mod.minutes, 0)}分钟
            </span>}
          </div>
          <div style={{ padding: compact ? '0 10px' : '6px 10px', display: 'flex', flexDirection: 'column', gap: 5, justifyContent: 'center' }}>
            {day.phase === 'exam'
              ? <span style={{ color: C.red, fontSize: 11, fontWeight: 700 }}>⚑ 考试日 · 不安排学习任务</span>
              : day.modules.length === 0 && <span style={{ color: C.faint, fontSize: 9.5 }}>{isRest ? '休息日 · 可拖入任务' : '当日暂无任务 · 可拖入任务'}</span>}
            {dayCollapsed
              ? <button onClick={() => toggleDay(day.iso)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', height: '100%', border: 0, background: 'transparent',
                    padding: 0, cursor: 'pointer', textAlign: 'left', color: C.sub }}>
                  <ChevronRight size={13} color={C.faint} style={{ flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 11, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {day.modules.map(mod => mod.name).join(' · ')}
                  </span>
                  <span style={{ fontSize: 9.5, color: C.faint, flexShrink: 0 }}>
                    {day.modules.length}模块 · {day.modules.reduce((n, mod) => n + mod.kps.length, 0)}知识点
                  </span>
                </button>
              : <>
                {dailyMode && !isToday && day.modules.length > 0 && <button onClick={() => toggleDay(day.iso)}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, alignSelf: 'flex-start', border: 0,
                    background: 'transparent', padding: '1px 2px', cursor: 'pointer', color: C.faint, fontSize: 10 }}>
                  <ChevronDown size={12} /> 收起
                </button>}
                {day.modules.map(mod => dailyMode ? <InlineModule key={mod.id} mod={mod} iso={day.iso}
              expanded={expandedModuleId === mod.id} active={isToday && expandedModuleId === mod.id}
              showDragGuide={showViewGuide && mod.id === guideModuleId} onDismissDragGuide={onDismissViewGuide}
              onToggle={() => setExpandedModuleId(current => current === mod.id ? null : mod.id)}
              dragging={drag?.moduleId === mod.id} setDrag={setDrag} requestRemove={requestRemove}
              bookmarked={bookmarked} onKnown={(kpId) => onKnown(mod.id, kpId)} onBookmark={onBookmark} onMasteryHint={onMasteryHint} />
              : <ModuleTodo key={mod.id} mod={mod} iso={day.iso}
                dragging={drag?.moduleId === mod.id} setDrag={setDrag} openModule={openModule} requestRemove={requestRemove} />)}
              </>}
          </div>
        </div>
      </React.Fragment>;
    })}
  </section>;
}

function InlineModule({ mod, iso, expanded, active, showDragGuide, onDismissDragGuide, onToggle, dragging, setDrag, requestRemove,
  bookmarked, onKnown, onBookmark, onMasteryHint }: {
  mod: Module; iso: string; expanded: boolean; active: boolean; onToggle: () => void; dragging: boolean;
  showDragGuide: boolean; onDismissDragGuide: () => void;
  setDrag: (value: PlanDrag | null) => void; requestRemove: (mod: Module) => void;
  bookmarked: Set<string>; onKnown: (kpId: string) => void; onBookmark: (kpId: string) => void; onMasteryHint: () => void;
}) {
  const completed = mod.kps.filter(item => item.known).length;
  return <div style={{ border: `1px solid ${active ? '#E8D34E' : C.line}`, borderRadius: 8,
    background: active ? '#FFFDF4' : C.card, overflow: 'hidden', opacity: dragging ? .35 : 1 }}>
    <div draggable onDragStart={() => setDrag({ kind: 'module', moduleId: mod.id, fromIso: iso, label: mod.name })}
      onClick={onToggle} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 8px', cursor: 'pointer' }}>
      <span style={{ position: 'relative', display: 'grid', placeItems: 'center' }}>
        <GripVertical size={13} color={C.faint} style={{ cursor: 'grab' }} />
        {showDragGuide && <span style={{ position: 'absolute', left: -5, top: 25, zIndex: 12, width: 205,
          padding: '8px 28px 8px 10px', borderRadius: 8, background: C.ink, color: '#fff', fontSize: 9,
          fontWeight: 500, boxShadow: '0 8px 24px #0003' }}>
          拖动模块或知识点，可以调整到其他日期
          <button onClick={e => { e.stopPropagation(); onDismissDragGuide(); }} style={{ position: 'absolute', right: 6, top: 6,
            border: 0, background: 'transparent', color: '#fff', padding: 2 }}><X size={11} /></button>
        </span>}
      </span>
      {expanded ? <ChevronDown size={13} color={C.sub} /> : <ChevronRight size={13} color={C.sub} />}
      <strong style={{ fontSize: 11.5 }}>{mod.name}</strong>
      {active && <span style={{ padding: '2px 6px', borderRadius: 8, background: C.yellow, fontSize: 8, fontWeight: 700 }}>正在学习</span>}
      <span style={{ marginLeft: 'auto', fontSize: 9.5, color: completed === mod.kps.length ? C.green : C.mut }}>{completed}/{mod.kps.length}</span>
      <button onClick={e => { e.stopPropagation(); requestRemove(mod); }} title="移出当前计划" style={closeButton}><Trash2 size={12} /></button>
    </div>
    {expanded && <div style={{ borderTop: `1px solid ${C.line}`, paddingLeft: 32 }}>
      {mod.kps.map((item, index) => <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 10px 8px 0', borderTop: index ? `1px solid ${C.line}` : 'none' }}>
        <button onClick={() => { if (!item.known) onMasteryHint(); onKnown(item.id); }} title="勾选表示我已经掌握"
          style={{ width: 18, height: 18, flexShrink: 0, borderRadius: '50%', border: `2px solid ${item.known ? C.green : C.faint}`,
            background: item.known ? C.green : C.card, display: 'grid', placeItems: 'center', padding: 0 }}>
          {item.known && <Check size={10} color="#fff" strokeWidth={3} />}
        </button>
        <span style={{ flex: 1, fontSize: 10.5, color: item.known ? C.mut : C.ink,
          textDecoration: item.known ? 'line-through' : 'none' }}>{item.name}</span>
        <button onClick={() => onBookmark(item.id)} style={{ border: 0, background: 'transparent', padding: 2 }}>
          <Star size={14} color={bookmarked.has(item.id) ? '#D8B800' : C.faint} fill={bookmarked.has(item.id) ? C.yellow : 'none'} />
        </button>
      </div>)}
    </div>}
  </div>;
}

function MonthSchedule({ dates, drag, setDrag, moveItem, openModule, requestRemove, dailyMode, onReturnToSchedule,
  view, onViewChange, bookmarked, onKnown, onBookmark, onMasteryHint, onStartLearning, onActivateStudyDay,
  showViewGuide, onDismissViewGuide }: {
  dates: PlanDate[];
  drag: PlanDrag | null; setDrag: (value: PlanDrag | null) => void;
  moveItem: (iso: string) => void; openModule: (id: string) => void; requestRemove: (mod: Module) => void;
  dailyMode: boolean; onReturnToSchedule: () => void;
  view: 'week' | 'month'; onViewChange: (value: 'week' | 'month') => void;
  bookmarked: Set<string>; onKnown: (moduleId: string, kpId: string) => void; onBookmark: (kpId: string) => void;
  onMasteryHint: () => void; onStartLearning: () => void; onActivateStudyDay: (iso: string) => void;
  showViewGuide: boolean; onDismissViewGuide: () => void;
}) {
  const [monthCursor, setMonthCursor] = useState(new Date(2026, 7, 1));
  const [selectedIso, setSelectedIso] = useState<string | null>(dailyMode ? TODAY_ISO : null);
  const [detailIso, setDetailIso] = useState<string | null>(null);
  const [actionModule, setActionModule] = useState<Module | null>(null);
  const [showGuide, setShowGuide] = useState(!dailyMode);
  const [expandedInspectorModule, setExpandedInspectorModule] = useState<string | null>(null);
  const pressTimer = useRef<number | null>(null);
  const longPressed = useRef(false);
  const year = monthCursor.getFullYear();
  const month = monthCursor.getMonth();
  const byIso = new Map(dates.map(day => [day.iso, day]));
  const weekendHasTasks = dates.some(day => day.iso.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)
    && [0, 6].includes(new Date(`${day.iso}T12:00:00`).getDay()) && day.modules.length > 0);
  const calendarColumns = weekendHasTasks ? 'repeat(7,minmax(0,1fr))' : 'repeat(5,minmax(0,1fr)) minmax(44px,.48fr) minmax(44px,.48fr)';
  const firstMondayOffset = (new Date(year, month, 1).getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - firstMondayOffset);
  const cells = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart); date.setDate(gridStart.getDate() + index);
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return { iso, day: date.getDate(), current: date.getMonth() === month };
  });
  const shiftMonth = (delta: number) => setMonthCursor(new Date(year, month + delta, 1));
  const selectedPlan = selectedIso ? byIso.get(selectedIso) : undefined;
  const selectedTotal = selectedPlan?.modules.length ?? 0;
  const selectedKnown = selectedPlan?.modules.filter(mod => mod.kps.every(item => item.known)).length ?? 0;
  const monthPlans = dates.filter(day => day.iso.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`) && day.modules.length > 0);
  const monthTotal = monthPlans.reduce((sum, day) => sum + day.modules.length, 0);
  const monthKnown = monthPlans.reduce((sum, day) => sum + day.modules.filter(mod => mod.kps.every(item => item.known)).length, 0);
  const completedDays = monthPlans.filter(day => day.modules.every(mod => mod.kps.every(item => item.known))).length;
  const activeDays = monthPlans.filter(day => day.iso <= TODAY_ISO).length;
  const overdueCount = monthPlans.filter(day => day.iso < TODAY_ISO)
    .reduce((sum, day) => sum + day.modules.filter(mod => mod.kps.some(item => !item.known)).length, 0);
  const detailPlan = detailIso ? byIso.get(detailIso) : undefined;
  useEffect(() => {
    if (!dailyMode || !selectedPlan) return;
    const next = selectedPlan.modules.find(mod => mod.kps.some(item => item.known) && mod.kps.some(item => !item.known))
      ?? selectedPlan.modules.find(mod => mod.kps.some(item => !item.known));
    setExpandedInspectorModule(next?.id ?? null);
  }, [dailyMode, selectedIso]);
  const startLongPress = (mod: Module) => {
    longPressed.current = false;
    pressTimer.current = window.setTimeout(() => {
      longPressed.current = true;
      setActionModule(mod);
      setShowGuide(false);
    }, 520);
  };
  const cancelLongPress = () => {
    if (pressTimer.current) window.clearTimeout(pressTimer.current);
    pressTimer.current = null;
  };

  const monthCalendar = <>
    <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', borderBottom: `1px solid ${C.line}` }}>
      <button onClick={() => { shiftMonth(-1); setSelectedIso(null); }} style={iconButton}><ChevronLeft size={15} /></button>
      <strong style={{ flex: 1, textAlign: 'center', fontSize: 13 }}>{year}年{month + 1}月</strong>
      <PhaseLegend />
      <button onClick={() => { shiftMonth(1); setSelectedIso(null); }} style={iconButton}><ChevronRight size={15} /></button>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: calendarColumns, background: '#FAFAFB', borderBottom: `1px solid ${C.line}`, transition: 'grid-template-columns .25s ease' }}>
      {['一','二','三','四','五','六','日'].map(day => <div key={day} style={{ padding: '7px 4px', textAlign: 'center', fontSize: 9.5, color: C.mut }}>{day}</div>)}
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: calendarColumns, padding: 8, gap: 5, transition: 'grid-template-columns .25s ease' }}>
      {cells.map((cell, index) => {
        const dayPlan = byIso.get(cell.iso);
        const totalKps = dayPlan?.modules.reduce((sum, mod) => sum + mod.kps.length, 0) ?? 0;
        const actualKnown = dayPlan?.modules.reduce((sum, mod) => sum + mod.kps.filter(item => item.known).length, 0) ?? 0;
        const knownKps = actualKnown;
        const totalModules = dayPlan?.modules.length ?? 0;
        const completeModules = dayPlan?.modules.filter(mod => mod.kps.every(item => item.known)).length ?? 0;
        const isToday = cell.iso === TODAY_ISO;
        const isExam = dayPlan?.phase === 'exam';
        const isOverdue = dailyMode && !!dayPlan && dayPlan.iso < TODAY_ISO && totalKps > knownKps;
        const isRest = !!dayPlan?.isRestDay;
        const status = totalKps === 0 ? 'empty' : knownKps === totalKps ? 'done' : knownKps > 0 ? 'partial' : 'todo';
        const selected = selectedIso === cell.iso;
        const statusColor = isOverdue ? '#E17100' : status === 'done' ? C.green : status === 'partial' ? '#E58A00' : C.faint;
        const phaseBg = dayPlan?.phase === 'exam' ? '#FFE1E1' : dayPlan?.phase === 'sprint' ? '#FFEEC7' : dayPlan?.phase === 'learn' ? '#E4F0FF' : C.card;
        const phaseBorder = dayPlan?.phase === 'exam' ? '#F4A6A6' : dayPlan?.phase === 'sprint' ? '#F1CC76' : dayPlan?.phase === 'learn' ? '#BCD8FA' : C.line;
        const cellBg = isRest ? '#F0F2F5' : phaseBg;
        const cellBorder = isRest ? '#D6DAE0' : phaseBorder;
        const hiddenModules = Math.max(0, (dayPlan?.modules.length ?? 0) - 2);
        return <button key={`${cell.current}-${cell.day}-${index}`}
          onClick={() => {
            if (longPressed.current) { longPressed.current = false; return; }
            if (drag && cell.current) { moveItem(cell.iso); setSelectedIso(cell.iso); return; }
            if (dailyMode && cell.current) setSelectedIso(cell.iso);
            if (!dailyMode && dayPlan) setDetailIso(dayPlan.iso);
          }}
          onDragOver={e => dayPlan && e.preventDefault()} onDrop={() => { if (dayPlan) { moveItem(dayPlan.iso); setSelectedIso(dayPlan.iso); } }}
          style={{ position: 'relative', height: dailyMode ? 56 : 88, padding: 6, borderRadius: 8, overflow: 'hidden',
            border: isToday ? `2px solid #E2BF00` : selected ? `2px solid ${C.ink}` : `1px solid ${cellBorder}`,
            background: cellBg,
            boxShadow: isToday ? '0 0 0 2px #FFF1A5' : 'none',
            opacity: cell.current ? 1 : .32, cursor: dailyMode && cell.current ? 'pointer' : 'default', textAlign: 'left' }}>
          {dailyMode ? <>
            <span style={{ fontSize: 9.5, color: isToday ? C.ink : C.mut, fontWeight: isToday ? 800 : 500 }}>{cell.day}</span>
            {isToday && <span style={{ position: 'absolute', top: 6, right: 6, fontSize: 7.5, color: C.amber }}>今天</span>}
          </> : <div style={{ position: 'absolute', left: 7, right: 7, top: 6, display: 'flex', alignItems: 'center', minWidth: 0 }}>
            <span style={{ flex: 1, fontSize: 8, color: C.blue, fontWeight: 700 }}>{hiddenModules > 0 ? `+${hiddenModules}` : ''}</span>
            {isToday && <span style={{ marginRight: 5, fontSize: 7.5, color: C.amber }}>今天</span>}
            <strong style={{ fontSize: 9.5, color: isToday ? C.ink : C.mut }}>{cell.day}</strong>
          </div>}
          {isExam && <Flag size={10} color={C.red} style={{ position: 'absolute', top: 7, right: 7 }} />}
          {dailyMode && isExam && <strong style={{ position: 'absolute', left: 3, right: 3, top: '52%', transform: 'translateY(-50%)', textAlign: 'center', fontSize: 9, color: C.red }}>考试日</strong>}
          {dailyMode && totalModules > 0 && <div style={{ position: 'absolute', left: 3, right: 3, top: '54%', transform: 'translateY(-50%)', textAlign: 'center' }}>
            <ModuleProgressDots modules={dayPlan!.modules} overdue={isOverdue} />
            <strong style={{ display: 'block', marginTop: 5, fontSize: 8.5, color: statusColor, whiteSpace: 'nowrap' }}>
              {completeModules === totalModules ? '✓ 已完成' : isOverdue ? `${totalModules - completeModules}个模块待补` : `${totalModules - completeModules}个模块待办`}
            </strong>
          </div>}
          {dailyMode && isRest && <span style={{ position: 'absolute', left: 0, right: 0, top: '54%', transform: 'translateY(-50%)', textAlign: 'center', fontSize: 8.5, color: '#8D939D' }}>休</span>}
          {!dailyMode && isRest && <span style={{ position: 'absolute', left: 0, right: 0, top: '54%', transform: 'translateY(-50%)', textAlign: 'center', fontSize: 8.5, color: '#8D939D' }}>休息日</span>}
          {!dailyMode && dayPlan?.modules.slice(0, 2).map(mod => <div key={mod.id} draggable
            onDragStart={() => setDrag({ kind: 'module', moduleId: mod.id, fromIso: dayPlan.iso, label: mod.name })}
            onPointerDown={() => startLongPress(mod)} onPointerUp={cancelLongPress} onPointerCancel={cancelLongPress}
            onClick={e => { e.stopPropagation(); if (!longPressed.current) openModule(mod.id); longPressed.current = false; }}
            style={{ marginTop: 3, padding: '5px 5px', borderRadius: 5,
              background: dayPlan.phase === 'sprint' ? '#FFF0D8' : 'rgba(255,255,255,.78)',
              fontSize: 8.5, color: C.ink, cursor: 'grab', display: 'block', position: 'relative', top: 17 }}>
            <strong style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mod.name}</strong>
          </div>)}
        </button>;
      })}
    </div>
    {!dailyMode && showGuide && <div style={{ position: 'absolute', left: 18, bottom: 14, zIndex: 4, maxWidth: 250,
      padding: '9px 30px 9px 11px', borderRadius: 9, background: C.ink, color: '#fff', boxShadow: '0 8px 24px #0003', fontSize: 9.5 }}>
      拖动模块可调整日期；长按可查看更多操作
      <button onClick={() => setShowGuide(false)} style={{ position: 'absolute', right: 7, top: 7, border: 0, background: 'transparent', color: '#fff' }}><X size={12} /></button>
    </div>}
    {!dailyMode && drag && <div style={{ position: 'absolute', left: '50%', bottom: 14, zIndex: 5, transform: 'translateX(-50%)',
      padding: '8px 12px', borderRadius: 20, background: C.ink, color: '#fff', boxShadow: '0 8px 24px #0003', fontSize: 9.5 }}>
      正在调整「{drag.label}」· 点选目标日期
    </div>}
  </>;

  if (dailyMode) {
    const actionLabel = selectedPlan?.phase === 'exam' ? '查看考试安排'
      : selectedPlan?.isRestDay ? '调整为学习日'
      : selectedIso === TODAY_ISO ? '开始今日学习'
      : selectedIso && selectedIso < TODAY_ISO ? '复习当天内容' : '查看日程详情';
    return <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.75fr) minmax(250px, .75fr)', gap: 12 }}>
    <div style={{ ...card, overflow: 'hidden', position: 'relative' }}>{monthCalendar}</div>
    <aside style={{ ...card, padding: 14, minHeight: 342, maxHeight: 510, display: 'flex', flexDirection: 'column' }}>
      {selectedIso ? <>
        <button onClick={() => setSelectedIso(null)} style={{ ...ghostSmall, padding: 0, color: C.mut }}>← 返回本月成就</button>
        <div style={{ marginTop: 15 }}>
          <span style={{ fontSize: 10, color: C.mut }}>单日进度</span>
          <h3 style={{ margin: '4px 0 2px', fontSize: 18 }}>{selectedPlan?.label ?? `${month + 1}月${Number(selectedIso.slice(-2))}日`}</h3>
          <span style={{ fontSize: 10.5, color: C.sub }}>{selectedPlan?.weekday ?? '无学习安排'}</span>
        </div>
        {selectedPlan?.phase === 'exam' ? <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
            marginTop: 14, padding: '22px 18px', borderRadius: 14, textAlign: 'center',
            background: 'linear-gradient(180deg, #FFF4F3 0%, #FFF9F6 100%)', border: '1px solid #F4C1BC' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', display: 'grid', placeItems: 'center',
              background: '#FFE0DC', color: C.red, boxShadow: '0 0 0 8px #FFF0EE' }}>
              <Flag size={24} strokeWidth={2.2} />
            </div>
            <span style={{ marginTop: 18, fontSize: 10, color: C.red, fontWeight: 800, letterSpacing: 1 }}>目标日</span>
            <h3 style={{ margin: '7px 0 0', fontSize: 18 }}>准备已经完成，带着积累去应考</h3>
            <p style={{ margin: '9px 0 0', maxWidth: 240, fontSize: 10.5, lineHeight: 1.65, color: C.sub }}>
              你已经走过这份30天计划。今天不安排新的学习任务，专注发挥，相信自己的准备。
            </p>
          </div>
          <button onClick={onReturnToSchedule}
            style={{ ...primarySmall, width: '100%', marginTop: 12, padding: '10px 12px', background: C.ink }}>
            查看考试安排 →
          </button>
        </div> : selectedTotal > 0 ? <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'end', gap: 6, marginTop: 14 }}>
            <strong style={{ fontSize: 28 }}>{selectedKnown}</strong><span style={{ color: C.mut, marginBottom: 4 }}>/ {selectedTotal} 个模块完成</span>
          </div>
          <div style={{ height: 7, borderRadius: 6, background: C.panel, marginTop: 8, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${selectedTotal ? selectedKnown / selectedTotal * 100 : 0}%`, background: C.green }} />
          </div>
          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', marginTop: 12, borderTop: `1px solid ${C.line}` }}>
            {selectedPlan?.modules.map(mod => <InspectorModule key={mod.id} mod={mod} iso={selectedPlan.iso}
              expanded={expandedInspectorModule === mod.id}
              onToggle={() => setExpandedInspectorModule(current => current === mod.id ? null : mod.id)}
              setDrag={setDrag} bookmarked={bookmarked} onKnown={(kpId) => onKnown(mod.id, kpId)}
              onBookmark={onBookmark} onMasteryHint={onMasteryHint} />)}
          </div>
          <button onClick={selectedPlan?.isRestDay ? () => onActivateStudyDay(selectedPlan.iso)
            : selectedIso === TODAY_ISO ? onStartLearning : onReturnToSchedule}
            style={{ ...primarySmall, width: '100%', marginTop: 12, padding: '10px 12px' }}>{actionLabel} →</button>
        </div> : <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', color: C.mut }}>
          <CalendarDays size={26} style={{ marginBottom: 8 }} />
          <p style={{ margin: 0, fontSize: 11 }}>这一天没有安排学习任务</p>
          <button onClick={selectedPlan?.isRestDay ? () => onActivateStudyDay(selectedPlan.iso) : onReturnToSchedule}
            style={{ ...secondarySmall, marginTop: 18 }}>{actionLabel}</button>
        </div>}
      </> : <>
        <span style={{ fontSize: 10, color: C.mut }}>本月计划进度</span>
        <h3 style={{ margin: '5px 0 0', fontSize: 18 }}>你正在稳步推进</h3>
        <div style={{ marginTop: 12, padding: '10px 0', borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}` }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
            <strong style={{ fontSize: 30, color: C.green }}>{monthKnown}</strong><span style={{ fontSize: 11, color: C.mut }}>/ {monthTotal} 个模块任务</span>
          </div>
          <div style={{ height: 7, borderRadius: 6, background: C.panel, marginTop: 10, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${monthTotal ? monthKnown / monthTotal * 100 : 0}%`, background: C.green }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
          <AchievementStat value={`${completedDays}/${activeDays}`} label="完成学习日" />
          <AchievementStat value={`${Math.max(0, monthTotal - monthKnown)}`} label="模块待办" suffix="个" />
          <AchievementStat value="2" label="连续学习" suffix="天" />
          <AchievementStat value={`${overdueCount}`} label="当前欠账" suffix="项" />
        </div>
        <div style={{ marginTop: 14, padding: 11, borderRadius: 9, background: C.greenBg }}>
          <strong style={{ display: 'block', fontSize: 11, color: C.green }}>下一个里程碑</strong>
          <span style={{ display: 'block', marginTop: 4, fontSize: 10, color: C.sub }}>再完成 4 个模块任务，推进至下一学习阶段</span>
        </div>
        <p style={{ margin: '14px 0 0', fontSize: 9.5, color: C.mut }}>点击日期查看当天完成情况与模块</p>
      </>}
    </aside>
  </section>;
  }

  return <section style={{ ...card, overflow: 'hidden', position: 'relative' }}>
    {monthCalendar}
    {detailPlan && <DayPlanSheet day={detailPlan} openModule={openModule} onClose={() => setDetailIso(null)} />}
    {actionModule && <TouchActionSheet module={actionModule} onClose={() => setActionModule(null)}
      onAdjust={() => {
        const fromDay = dates.find(day => day.modules.some(mod => mod.id === actionModule.id));
        if (fromDay) setDrag({ kind: 'module', moduleId: actionModule.id, fromIso: fromDay.iso, label: actionModule.name });
        setActionModule(null);
        setShowGuide(false);
      }}
      onRemove={() => { requestRemove(actionModule); setActionModule(null); }} />}
  </section>;
}

function PhaseLegend() {
  return <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginRight: 8 }}>
    {([['新学', C.blue], ['冲刺', '#E58A00'], ['考试', C.red]] as const).map(([label, color]) =>
      <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 8.5, color: C.mut }}>
        <i style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />{label}
      </span>)}
  </div>;
}

function ModuleProgressDots({ modules, overdue }: { modules: Module[]; overdue: boolean }) {
  return <div aria-label={`共${modules.length}个模块`} style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
    {modules.map(mod => {
      const completed = mod.kps.filter(item => item.known).length;
      const done = completed === mod.kps.length;
      const partial = completed > 0 && !done;
      const color = overdue && !done ? '#E17100' : done ? C.green : partial ? '#E58A00' : '#BCC2CC';
      return <i key={mod.id} style={{ width: 6, height: 6, borderRadius: '50%', border: `1px solid ${color}`,
        background: done ? color : partial ? `linear-gradient(90deg, ${color} 50%, transparent 50%)` : 'transparent' }} />;
    })}
  </div>;
}

function InspectorModule({ mod, iso, expanded, onToggle, setDrag, bookmarked, onKnown, onBookmark, onMasteryHint }: {
  mod: Module; iso: string; expanded: boolean; onToggle: () => void; setDrag: (value: PlanDrag | null) => void;
  bookmarked: Set<string>; onKnown: (kpId: string) => void; onBookmark: (kpId: string) => void; onMasteryHint: () => void;
}) {
  const completed = mod.kps.filter(item => item.known).length;
  const timer = useRef<number | null>(null);
  const longPressed = useRef(false);
  const startMove = (value: PlanDrag) => {
    longPressed.current = false;
    timer.current = window.setTimeout(() => { longPressed.current = true; setDrag(value); }, 520);
  };
  const cancelMove = () => { if (timer.current) window.clearTimeout(timer.current); timer.current = null; };
  return <div style={{ borderBottom: `1px solid ${C.line}` }}>
    <div draggable onDragStart={() => setDrag({ kind: 'module', moduleId: mod.id, fromIso: iso, label: mod.name })}
      onPointerDown={() => startMove({ kind: 'module', moduleId: mod.id, fromIso: iso, label: mod.name })}
      onPointerUp={cancelMove} onPointerCancel={cancelMove}
      onClick={() => { if (longPressed.current) { longPressed.current = false; return; } onToggle(); }}
      style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 0', cursor: 'pointer' }}>
      <GripVertical size={13} color={C.faint} />
      {expanded ? <ChevronDown size={13} color={C.sub} /> : <ChevronRight size={13} color={C.sub} />}
      <strong style={{ flex: 1, fontSize: 11.5 }}>{mod.name}</strong>
      <span style={{ fontSize: 9.5, color: completed === mod.kps.length ? C.green : C.mut }}>{completed}/{mod.kps.length}</span>
    </div>
    {expanded && <div style={{ paddingLeft: 18, paddingBottom: 4 }}>
      {mod.kps.map((item, index) => <div key={item.id} draggable
        onDragStart={() => setDrag({ kind: 'kp', moduleId: mod.id, kpId: item.id, fromIso: iso, label: item.name })}
        onPointerDown={() => startMove({ kind: 'kp', moduleId: mod.id, kpId: item.id, fromIso: iso, label: item.name })}
        onPointerUp={cancelMove} onPointerCancel={cancelMove}
        style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 0', borderTop: index ? `1px solid ${C.line}` : 'none' }}>
        <GripVertical size={11} color={C.faint} />
        <button onClick={() => { if (!item.known) onMasteryHint(); onKnown(item.id); }}
          style={{ width: 17, height: 17, borderRadius: '50%', padding: 0, border: `2px solid ${item.known ? C.green : C.faint}`,
            background: item.known ? C.green : C.card, display: 'grid', placeItems: 'center' }}>
          {item.known && <Check size={9} color="#fff" strokeWidth={3} />}
        </button>
        <span style={{ flex: 1, fontSize: 10, color: item.known ? C.mut : C.ink, textDecoration: item.known ? 'line-through' : 'none' }}>{item.name}</span>
        <button onClick={() => onBookmark(item.id)} style={{ border: 0, background: 'transparent', padding: 2 }}>
          <Star size={13} color={bookmarked.has(item.id) ? '#D8B800' : C.faint} fill={bookmarked.has(item.id) ? C.yellow : 'none'} />
        </button>
      </div>)}
    </div>}
  </div>;
}

function DayPlanSheet({ day, openModule, onClose }: { day: PlanDate; openModule: (id: string) => void; onClose: () => void }) {
  return <div style={overlay} onClick={onClose}>
    <div onClick={e => e.stopPropagation()} style={{ width: 430, maxWidth: '88%', maxHeight: '72%', overflowY: 'auto',
      background: C.card, borderRadius: 16, padding: 16, boxShadow: '0 18px 60px #0003' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ flex: 1 }}><strong style={{ fontSize: 16 }}>{day.label}</strong><span style={{ display: 'block', marginTop: 2, fontSize: 10, color: C.mut }}>{day.weekday} · 当日完整计划</span></div>
        <button onClick={onClose} style={iconButton}><X size={16} /></button>
      </div>
      <div style={{ marginTop: 12, borderTop: `1px solid ${C.line}` }}>
        {day.modules.map(mod => <button key={mod.id} onClick={() => { onClose(); openModule(mod.id); }} style={{ width: '100%', padding: '11px 2px',
          border: 0, borderBottom: `1px solid ${C.line}`, background: 'transparent', display: 'flex', textAlign: 'left', cursor: 'pointer' }}>
          <strong style={{ flex: 1, fontSize: 12 }}>{mod.name}</strong><ChevronRight size={14} color={C.faint} />
        </button>)}
      </div>
    </div>
  </div>;
}

function TouchActionSheet({ module, onClose, onRemove, onAdjust }: {
  module: Module; onClose: () => void; onRemove: () => void; onAdjust?: () => void;
}) {
  return <div style={overlay} onClick={onClose}>
    <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', left: 16, right: 16, bottom: 16,
      background: C.card, borderRadius: 16, padding: 14, boxShadow: '0 -8px 40px #0002' }}>
      <strong style={{ display: 'block', fontSize: 13 }}>{module.name}</strong>
      <span style={{ display: 'block', marginTop: 2, fontSize: 9.5, color: C.mut }}>模块操作</span>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
        <button onClick={onAdjust ?? onClose} style={secondarySmall}>调整日期</button>
        <button onClick={onRemove} style={{ ...secondarySmall, color: C.red }}><Trash2 size={12} /> 移出当前计划</button>
      </div>
      <button onClick={onClose} style={{ ...ghostSmall, width: '100%', marginTop: 10 }}>取消</button>
    </div>
  </div>;
}

function AchievementStat({ value, label, suffix }: { value: string; label: string; suffix?: string }) {
  return <div style={{ padding: 10, borderRadius: 9, background: '#F7F8FA' }}>
    <strong style={{ fontSize: 17 }}>{value}<small style={{ marginLeft: 2, color: C.mut, fontSize: 9 }}>{suffix}</small></strong>
    <span style={{ display: 'block', marginTop: 3, color: C.mut, fontSize: 9 }}>{label}</span>
  </div>;
}

function ModuleTodo({ mod, iso, dragging, setDrag, openModule, requestRemove }: {
  mod: Module; iso: string; dragging: boolean;
  setDrag: (value: PlanDrag | null) => void;
  openModule: (id: string) => void; requestRemove: (mod: Module) => void;
}) {
  return <div draggable onDragStart={() => setDrag({ kind: 'module', moduleId: mod.id, fromIso: iso, label: mod.name })}
    onClick={() => openModule(mod.id)}
    style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 8px', border: `1px solid ${C.line}`,
      borderRadius: 8, cursor: 'pointer', opacity: dragging ? .35 : 1 }}>
    <GripVertical size={13} color={C.faint} style={{ cursor: 'grab' }} />
    <strong style={{ fontSize: 11.5, flex: 1 }}>{mod.name}</strong>
    <span style={{ fontSize: 10, color: C.mut }}>{mod.kps.length}个知识点 · {mod.minutes}分钟</span>
    <button onClick={e => { e.stopPropagation(); requestRemove(mod); }} title="移出当前计划" style={closeButton}><Trash2 size={12} /></button>
  </div>;
}

function ModulePopover({ module, index, total, onClose, onPrev, onNext, onKnown, onRemoveModule, onRemoveKP,
  dailyMode, bookmarked, onBookmark, onDragKP, onMasteryHint }: {
  module: Module; index: number; total: number; onClose: () => void; onPrev: () => void; onNext: () => void;
  onKnown: (id: string) => void; onRemoveModule: () => void; onRemoveKP: (kp: KP) => void;
  dailyMode: boolean; bookmarked: Set<string>; onBookmark: (id: string) => void; onDragKP: (kp: KP) => void;
  onMasteryHint: () => void;
}) {
  return <div style={overlay} onClick={onClose}>
    <div style={{ width: 430, maxWidth: '90%', background: C.card, borderRadius: 16, padding: 18,
      boxShadow: '0 18px 60px #00000030' }} onClick={e => e.stopPropagation()}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={onPrev} disabled={index === 0} style={iconButton}><ChevronLeft size={16} /></button>
        <div style={{ flex: 1 }}>
          <strong style={{ display: 'block', fontSize: 16 }}>{module.name}</strong>
          <span style={{ fontSize: 10.5, color: C.mut }}>{index + 1} / {total} · {module.kps.length}个知识点 · 约{module.minutes}分钟</span>
        </div>
        <button onClick={onNext} disabled={index === total - 1} style={iconButton}><ChevronRight size={16} /></button>
        <button onClick={onClose} style={iconButton}><X size={16} /></button>
      </div>
      <div style={{ marginTop: 14, border: `1px solid ${C.line}`, borderRadius: 10, overflow: 'hidden' }}>
        {module.kps.map((item, i) => <div key={item.id} draggable
          onDragStart={() => onDragKP(item)}
          style={{ padding: '9px 10px', display: 'flex', alignItems: 'center',
          gap: 8, borderTop: i ? `1px solid ${C.line}` : 'none' }}>
          <GripVertical size={12} color={C.faint} style={{ cursor: 'grab' }} />
          {dailyMode && <button onClick={() => { if (!item.known) onMasteryHint(); onKnown(item.id); }}
            title="勾选表示我已经掌握" style={{ width: 19, height: 19, flexShrink: 0, borderRadius: '50%',
              border: `2px solid ${item.known ? C.green : C.faint}`, background: item.known ? C.green : C.card,
              display: 'grid', placeItems: 'center', cursor: 'pointer', padding: 0 }}>
            {item.known && <Check size={11} color="#fff" strokeWidth={3} />}
          </button>}
          <span style={{ flex: 1, fontSize: 12, color: item.known ? C.mut : C.ink,
            textDecoration: item.known ? 'line-through' : 'none' }}>{item.name}</span>
          {!dailyMode && <button onClick={() => onKnown(item.id)} style={ghostSmall}>{item.known ? '已会 ✓' : '我已经会了'}</button>}
          {dailyMode && <button onClick={() => onBookmark(item.id)} title={bookmarked.has(item.id) ? '取消收藏' : '收藏'}
            style={{ border: 0, background: 'transparent', padding: 3, cursor: 'pointer' }}>
            <Star size={15} color={bookmarked.has(item.id) ? C.yellow : C.faint} fill={bookmarked.has(item.id) ? C.yellow : 'none'} />
          </button>}
          <button onClick={() => onRemoveKP(item)} title="移出当前计划" style={closeButton}><Trash2 size={12} /></button>
        </div>)}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', marginTop: 12 }}>
        <span style={{ fontSize: 10.5, color: C.mut, flex: 1 }}>拖动知识点到时间轴可调整日期</span>
        <button onClick={onRemoveModule} style={{ ...ghostSmall, color: C.red, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Trash2 size={12} />整个模块移出计划</button>
      </div>
    </div>
  </div>;
}

function CustomPanel({ weeklyDays, setWeeklyDays, dailyLimit, setDailyLimit, dates, setDates, excluded, setExcluded }: {
  weeklyDays: number[]; setWeeklyDays: React.Dispatch<React.SetStateAction<number[]>>;
  dailyLimit: number; setDailyLimit: (value: number) => void;
  dates: PlanDate[]; setDates: React.Dispatch<React.SetStateAction<PlanDate[]>>;
  excluded: Module[]; setExcluded: React.Dispatch<React.SetStateAction<Module[]>>;
}) {
  const included = dates.flatMap(day => day.modules);
  const transferOut = (mod: Module) => {
    setDates(prev => prev.map(day => ({ ...day, modules: day.modules.filter(item => item.id !== mod.id) })));
    setExcluded(prev => [...prev, mod]);
  };
  const transferIn = (mod: Module) => {
    setExcluded(prev => prev.filter(item => item.id !== mod.id));
    setDates(prev => prev.map((day, index) => index === 0 ? { ...day, modules: [...day.modules, mod] } : day));
  };
  return <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: C.panel }}>
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr .8fr 1fr', gap: 14 }}>
      <div>
        <strong style={configLabel}>每周学习日</strong>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginTop: 6 }}>
          {['一','二','三','四','五','六','日'].map((label, index) => {
            const day = index + 1; const active = weeklyDays.includes(day);
            return <button key={label} onClick={() => setWeeklyDays(value => active
              ? value.length > 1 ? value.filter(item => item !== day) : value
              : [...value, day].sort())}
              style={{ border: 0, padding: '6px 0', borderRadius: 7, background: active ? C.yellow : C.card,
                fontSize: 10.5, fontWeight: 700, cursor: 'pointer' }}>{label}</button>;
          })}
        </div>
      </div>
      <div>
        <strong style={configLabel}>每日可学习时间</strong>
        <input type="range" min={1} max={24} value={dailyLimit} onChange={e => setDailyLimit(Number(e.target.value))}
          style={{ width: '100%', marginTop: 9, accentColor: C.blue }} />
        <span style={{ fontSize: 10.5, color: C.blue }}>{dailyLimit}小时 · 硬上限24小时</span>
      </div>
      <div>
        <strong style={configLabel}>考试日期</strong>
        <input type="date" defaultValue="2026-09-15" style={{ width: '100%', boxSizing: 'border-box', marginTop: 6,
          padding: '6px 8px', borderRadius: 7, border: `1px solid ${C.line}`, fontSize: 10.5 }} />
      </div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
      <RangeColumn title={`已加入计划 · ${included.length}模块`} modules={included} action="移出 →" onAction={transferOut} />
      <RangeColumn title={`未加入计划 · ${excluded.length}模块`} modules={excluded} action="← 加入" onAction={transferIn} muted />
    </div>
  </div>;
}

function RangeColumn({ title, modules, action, onAction, muted }: {
  title: string; modules: Module[]; action: string; onAction: (mod: Module) => void; muted?: boolean;
}) {
  return <div style={{ border: `1px solid ${C.line}`, background: C.card, borderRadius: 9, padding: 9 }}>
    <strong style={{ fontSize: 10.5 }}>{title}</strong>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 7, maxHeight: 82, overflowY: 'auto' }}>
      {modules.map(mod => <button key={mod.id} onClick={() => onAction(mod)} style={{ border: `1px solid ${C.line}`,
        borderRadius: 6, background: muted ? C.panel : C.blueBg, padding: '4px 7px', cursor: 'pointer',
        fontSize: 9.5, color: muted ? C.mut : C.ink }}>{mod.name}　<span style={{ color: C.blue }}>{action}</span></button>)}
    </div>
  </div>;
}

function ConfirmModal({ title, body, confirmLabel, onCancel, onConfirm, danger }: {
  title: string; body: string; confirmLabel: string; onCancel: () => void; onConfirm: () => void; danger?: boolean;
}) {
  return <div style={overlay} onClick={onCancel}>
    <div style={{ width: 400, maxWidth: '90%', background: C.card, borderRadius: 16, padding: 20,
      boxShadow: '0 18px 60px #00000035' }} onClick={e => e.stopPropagation()}>
      <strong style={{ fontSize: 16 }}>{title}</strong>
      <p style={{ fontSize: 12, color: C.sub, lineHeight: 1.75 }}>{body}</p>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button onClick={onCancel} style={secondarySmall}>返回调整</button>
        <button onClick={onConfirm} style={{ ...primarySmall, background: danger ? C.red : C.ink }}>{confirmLabel}</button>
      </div>
    </div>
  </div>;
}

const card: React.CSSProperties = { background: C.card, border: `1px solid ${C.line}`, borderRadius: 14 };
const overlay: React.CSSProperties = { position: 'absolute', inset: 0, zIndex: 120, background: '#11182770',
  display: 'grid', placeItems: 'center', padding: 20 };
const iconButton: React.CSSProperties = { border: 0, background: 'transparent', color: C.sub, padding: 5, cursor: 'pointer',
  display: 'grid', placeItems: 'center' };
const primaryButton: React.CSSProperties = { border: 0, borderRadius: 10, background: C.ink, color: '#fff',
  padding: '10px 20px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' };
const secondaryButton: React.CSSProperties = { ...primaryButton, background: C.card, color: C.sub, border: `1px solid ${C.line}` };
const primarySmall: React.CSSProperties = { border: 0, borderRadius: 8, background: C.ink, color: '#fff',
  padding: '7px 11px', fontSize: 10.5, fontWeight: 700, cursor: 'pointer' };
const secondarySmall: React.CSSProperties = { ...primarySmall, color: C.sub, background: C.card, border: `1px solid ${C.line}` };
const ghostSmall: React.CSSProperties = { border: 0, background: 'transparent', color: C.blue, fontSize: 9.5,
  fontWeight: 700, cursor: 'pointer' };
const closeButton: React.CSSProperties = { border: 0, background: C.panel, color: C.mut, width: 23, height: 23,
  borderRadius: 6, display: 'grid', placeItems: 'center', cursor: 'pointer' };
const miniClose: React.CSSProperties = { border: 0, background: 'transparent', color: C.mut, padding: 0, cursor: 'pointer' };
const tabButton: React.CSSProperties = { border: 0, borderRadius: 8, padding: '6px 14px', background: 'transparent',
  color: C.sub, fontSize: 11, fontWeight: 700, cursor: 'pointer' };
const configLabel: React.CSSProperties = { display: 'block', fontSize: 10.5, color: C.ink };
