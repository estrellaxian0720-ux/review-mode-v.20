import React, { useState } from 'react';
import {
  AlertTriangle, ArrowLeft, BookOpen, CalendarDays, ChevronLeft, ChevronRight,
  Clock3, Flag, GripVertical, Layers3, Sparkles, X,
} from 'lucide-react';

export type PlanDemoScenario = 'fit' | 'slight' | 'material' | 'extreme' | 'impossible';

interface KP { id: string; name: string; known?: boolean }
interface Module { id: string; name: string; minutes: number; kps: KP[] }
interface PlanDate { iso: string; label: string; weekday: string; modules: Module[]; phase?: 'learn' | 'review' | 'exam' }
interface PlanFrameworkScreenProps {
  onConfirm: () => void;
  onSkip: () => void;
  demoScenario?: PlanDemoScenario;
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

const INITIAL_DATES: PlanDate[] = [
  { iso: '2026-07-31', label: '7月31日', weekday: '周五 · 今天', phase: 'learn', modules: [
    m('criminal-principles', '刑法基本原则', 28, ['罪刑法定原则', '罪刑相适应原则', '平等适用原则']),
    m('scope', '刑法效力范围', 34, ['属地管辖', '属人管辖', '保护管辖', '普遍管辖']),
    m('crime-concept', '犯罪概念与特征', 25, ['社会危害性', '刑事违法性', '应受惩罚性']),
  ]},
  { iso: '2026-08-01', label: '8月1日', weekday: '周六 · 休息日', phase: 'learn', modules: [] },
  { iso: '2026-08-02', label: '8月2日', weekday: '周日 · 休息日', phase: 'learn', modules: [] },
  { iso: '2026-08-03', label: '8月3日', weekday: '周一', phase: 'learn', modules: [
    m('intent', '故意与过失', 36, ['直接故意', '间接故意', '疏忽大意过失', '过于自信过失']),
    m('unfinished', '犯罪未完成形态', 32, ['犯罪预备', '犯罪未遂', '犯罪中止']),
  ]},
  { iso: '2026-08-04', label: '8月4日', weekday: '周二', phase: 'learn', modules: [
    m('joint', '共同犯罪', 42, ['主犯认定', '从犯与胁从犯', '教唆犯', '共犯过剩']),
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
  { iso: '2026-09-08', label: '9月8日', weekday: '周二', phase: 'review', modules: [
    m('review-weak', '薄弱知识补强', 45, ['共同犯罪边界', '财产犯罪区分']),
  ]},
  { iso: '2026-09-14', label: '9月14日', weekday: '周一 · 考前一天', phase: 'review', modules: [
    m('review-final', '考前查漏补缺', 50, ['错题回顾', '核心规则快速复习']),
  ]},
  { iso: '2026-09-15', label: '9月15日', weekday: '周二 · 考试日', phase: 'exam', modules: [] },
];

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
  onConfirm, onSkip, demoScenario = 'fit',
}: PlanFrameworkScreenProps) {
  const [dates, setDates] = useState(INITIAL_DATES);
  const [view, setView] = useState<'week' | 'month'>('week');
  const [weeklyDays, setWeeklyDays] = useState([1, 2, 3, 4, 5]);
  const [dailyLimit, setDailyLimit] = useState(8);
  const [customOpen, setCustomOpen] = useState(false);
  const [excluded, setExcluded] = useState(EXCLUDED_SEED);
  const [moduleId, setModuleId] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<{ kind: 'module' | 'kp'; moduleId: string; kpId?: string; label: string } | null>(null);
  const [drag, setDrag] = useState<{ moduleId: string; fromIso: string } | null>(null);
  const [saved, setSaved] = useState(false);
  const [forceConfirm, setForceConfirm] = useState(false);

  const scenario = scenarioData[demoScenario];
  const allModules = dates.flatMap(d => d.modules);
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

  const moveModule = (toIso: string) => {
    if (!drag || drag.fromIso === toIso) return setDrag(null);
    let moving: Module | undefined;
    const without = dates.map(day => {
      const found = day.modules.find(item => item.id === drag.moduleId);
      if (found) moving = found;
      return { ...day, modules: day.modules.filter(item => item.id !== drag.moduleId) };
    });
    if (moving) setDates(without.map(day => day.iso === toIso ? { ...day, modules: [...day.modules, moving!] } : day));
    setDrag(null);
  };

  const removeConfirmed = () => {
    if (!confirmRemove) return;
    if (confirmRemove.kind === 'module') {
      let removed: Module | undefined;
      setDates(prev => prev.map(day => {
        const found = day.modules.find(item => item.id === confirmRemove.moduleId);
        if (found) removed = found;
        return { ...day, modules: day.modules.filter(item => item.id !== confirmRemove.moduleId) };
      }));
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

  const requestSave = () => {
    if (danger || demoScenario === 'material') setForceConfirm(true);
    else setSaved(true);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.bg, color: C.ink }}>
      <header style={{ height: 54, padding: '0 24px', display: 'flex', alignItems: 'center', gap: 12,
        background: C.card, borderBottom: `1px solid ${C.line}`, flexShrink: 0 }}>
        <button onClick={onSkip} style={iconButton}><ArrowLeft size={17} /></button>
        <strong style={{ fontSize: 17 }}>学习计划</strong>
        <span style={{ fontSize: 11, color: C.mut }}>首次确认</span>
        <div style={{ flex: 1 }} />
      </header>

      <main style={{ flex: 1, overflowY: 'auto', padding: '12px 24px 88px' }}>
        <section style={{ ...card, padding: '14px 16px', marginBottom: 12, borderColor: danger ? '#F3B8BA' : C.line }}>
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
            <span>164个知识点</span><span>→</span><strong style={{ color: C.blue }}>46天日历排程</strong>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', marginTop: 10,
            background: '#F7F8FA', borderRadius: 10, border: `1px solid ${C.line}` }}>
            <SummaryItem icon={<BookOpen size={15} />} label="计划范围"
              value={`${summary.included} / 164 已加入`} sub={`覆盖率 ${summary.coverage}%`} />
            <SummaryItem icon={<CalendarDays size={15} />} label="计划周期"
              value="46个自然日" sub={`${summary.days}个计划日 · ${46 - summary.days}个休息日`} />
            <SummaryItem icon={<Layers3 size={15} />} label="学习阶段"
              value={`${Math.max(1, summary.days - 7)}个新学日`} sub="7个集中复习日" />
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
                  weeklyDays={weeklyDays} setWeeklyDays={setWeeklyDays}
                  dailyLimit={dailyLimit} setDailyLimit={setDailyLimit}
                  dates={dates} setDates={setDates} excluded={excluded} setExcluded={setExcluded}
                />
              )}
            </div>
          )}
        </section>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8, padding: '0 2px' }}>
          <div>
            <strong style={{ display: 'block', fontSize: 13 }}>计划日历</strong>
            <span style={{ fontSize: 9.5, color: C.mut }}>同一份计划，切换不同时间视图</span>
          </div>
          <div style={{ flex: 1 }} />
          <Segment value={view} onChange={setView} />
        </div>

        {view === 'week' ? (
          <WeekSchedule dates={dates} drag={drag} setDrag={setDrag} moveModule={moveModule}
            openModule={setModuleId} requestRemove={(mod) => setConfirmRemove({ kind: 'module', moduleId: mod.id, label: mod.name })} />
        ) : (
          <MonthSchedule dates={dates} drag={drag} setDrag={setDrag}
            moveModule={moveModule} openModule={setModuleId}
            requestRemove={(mod) => setConfirmRemove({ kind: 'module', moduleId: mod.id, label: mod.name })} />
        )}
      </main>

      <footer style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '12px 24px',
        display: 'flex', justifyContent: 'flex-end', gap: 10, background: C.card, borderTop: `1px solid ${C.line}` }}>
        {saved ? (
          <>
            <button onClick={onSkip} style={secondaryButton}>回到首页</button>
            <button onClick={onConfirm} style={primaryButton}>查看计划概览 →</button>
          </>
        ) : (
          <button onClick={requestSave} style={{ ...primaryButton, background: danger ? C.red : C.ink }}>
            {danger ? '仍按当前计划保存' : '确认并保存计划'} →
          </button>
        )}
      </footer>

      {activeModule && (
        <ModulePopover module={activeModule} index={activeModuleIndex} total={allModules.length}
          onClose={() => setModuleId(null)}
          onPrev={() => setModuleId(allModules[Math.max(0, activeModuleIndex - 1)].id)}
          onNext={() => setModuleId(allModules[Math.min(allModules.length - 1, activeModuleIndex + 1)].id)}
          onKnown={(kpId) => setDates(prev => prev.map(day => ({ ...day, modules: day.modules.map(mod =>
            mod.id === activeModule.id ? { ...mod, kps: mod.kps.map(item => item.id === kpId ? { ...item, known: !item.known } : item) } : mod,
          ) })))}
          onRemoveModule={() => setConfirmRemove({ kind: 'module', moduleId: activeModule.id, label: activeModule.name })}
          onRemoveKP={(item) => setConfirmRemove({ kind: 'kp', moduleId: activeModule.id, kpId: item.id, label: item.name })}
        />
      )}

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

function Segment({ value, onChange }: { value: 'week' | 'month'; onChange: (value: 'week' | 'month') => void }) {
  return <div style={{ display: 'flex', padding: 3, borderRadius: 9, background: C.panel }}>
    {([['week', '日程视图'], ['month', '月历视图']] as const).map(([id, label]) =>
      <button key={id} onClick={() => onChange(id)} style={{ border: 0, borderRadius: 7, padding: '5px 12px',
        background: value === id ? C.card : 'transparent', color: value === id ? C.ink : C.mut,
        fontSize: 11, fontWeight: 700, cursor: 'pointer', boxShadow: value === id ? '0 1px 4px #00000012' : 'none' }}>
        {label}
      </button>)}
  </div>;
}

function WeekSchedule({ dates, drag, setDrag, moveModule, openModule, requestRemove }: {
  dates: PlanDate[]; drag: { moduleId: string; fromIso: string } | null;
  setDrag: (value: { moduleId: string; fromIso: string } | null) => void;
  moveModule: (iso: string) => void; openModule: (id: string) => void; requestRemove: (mod: Module) => void;
}) {
  return <section style={{ ...card, overflow: 'hidden' }}>
    <div style={{ display: 'grid', gridTemplateColumns: '126px 1fr', padding: '8px 14px',
      background: '#F7F8FA', fontSize: 10, color: C.mut, fontWeight: 700 }}>
      <span>日期时间轴</span><span>学习任务 · 可跨日期拖拽</span>
    </div>
    {dates.map((day, index) => {
      const phaseChanged = index === 0 || dates[index - 1].phase !== day.phase;
      const phaseColor = day.phase === 'review' ? '#7C5CFC' : day.phase === 'exam' ? C.red : C.blue;
      const phaseLabel = day.phase === 'review' ? '集中复习 · 9月8日—9月14日'
        : day.phase === 'exam' ? '考试 · 9月15日' : '新学 + 间隔复习 · 7月31日—9月7日';
      const isRest = day.modules.length === 0 && day.phase !== 'exam';
      return <React.Fragment key={day.iso}>
        {phaseChanged && <div style={{ padding: '6px 14px 6px 126px', background: `${phaseColor}0D`,
          borderTop: `1px solid ${phaseColor}22`, color: phaseColor, fontSize: 10, fontWeight: 700 }}>
          {day.phase === 'exam' && <Flag size={10} style={{ display: 'inline', marginRight: 5 }} />}{phaseLabel}
        </div>}
        <div onDragOver={e => e.preventDefault()} onDrop={() => moveModule(day.iso)}
          style={{ display: 'grid', gridTemplateColumns: '126px 1fr', minHeight: day.phase === 'exam' ? 48 : isRest ? 34 : 62,
            borderTop: `1px solid ${C.line}`, background: isRest ? '#FAFAFB' : drag ? '#FBFDFF' : C.card }}>
          <div style={{ padding: isRest ? '5px 12px 5px 27px' : '9px 12px 9px 27px', borderRight: `1px solid ${C.line}`, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 13, top: 0, bottom: 0, width: 1, background: `${phaseColor}35` }} />
            <span style={{ position: 'absolute', left: 9, top: isRest ? 11 : 16, width: 9, height: 9, borderRadius: '50%',
              background: day.weekday.includes('休息') ? '#D8DADF' : day.weekday.includes('今天') ? C.yellow : phaseColor,
              border: `2px solid ${C.card}`, boxShadow: `0 0 0 1px ${phaseColor}55` }} />
            <strong style={{ display: isRest ? 'inline' : 'block', fontSize: isRest ? 10.5 : 12 }}>{day.label}</strong>
            <span style={{ fontSize: 9.5, color: day.modules.length ? C.mut : C.faint, marginLeft: isRest ? 6 : 0 }}>{day.weekday}</span>
            {day.modules.length > 0 && <span style={{ display: 'block', marginTop: 3, fontSize: 9, color: phaseColor }}>
              {day.modules.reduce((n, mod) => n + mod.minutes, 0)}分钟
            </span>}
          </div>
          <div style={{ padding: isRest ? '4px 10px' : '6px 10px', display: 'flex', flexDirection: 'column', gap: 5, justifyContent: 'center' }}>
            {day.phase === 'exam'
              ? <span style={{ color: C.red, fontSize: 11, fontWeight: 700 }}>⚑ 考试日 · 不安排学习任务</span>
              : day.modules.length === 0 && <span style={{ color: C.faint, fontSize: 9.5 }}>休息间隔 · 可拖入任务</span>}
            {day.modules.map(mod => <ModuleTodo key={mod.id} mod={mod} iso={day.iso}
              dragging={drag?.moduleId === mod.id} setDrag={setDrag} openModule={openModule} requestRemove={requestRemove} />)}
          </div>
        </div>
      </React.Fragment>;
    })}
  </section>;
}

function MonthSchedule({ dates, drag, setDrag, moveModule, openModule, requestRemove }: {
  dates: PlanDate[];
  drag: { moduleId: string; fromIso: string } | null; setDrag: (value: { moduleId: string; fromIso: string } | null) => void;
  moveModule: (iso: string) => void; openModule: (id: string) => void; requestRemove: (mod: Module) => void;
}) {
  const [monthCursor, setMonthCursor] = useState(new Date(2026, 7, 1));
  const year = monthCursor.getFullYear();
  const month = monthCursor.getMonth();
  const byIso = new Map(dates.map(day => [day.iso, day]));
  const firstMondayOffset = (new Date(year, month, 1).getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - firstMondayOffset);
  const cells = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart); date.setDate(gridStart.getDate() + index);
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return { iso, day: date.getDate(), current: date.getMonth() === month };
  });
  const shiftMonth = (delta: number) => setMonthCursor(new Date(year, month + delta, 1));
  return <section style={{ ...card, overflow: 'hidden' }}>
    <div style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', borderBottom: `1px solid ${C.line}` }}>
      <button onClick={() => shiftMonth(-1)} style={iconButton}><ChevronLeft size={15} /></button>
      <strong style={{ flex: 1, textAlign: 'center', fontSize: 13 }}>{year}年{month + 1}月</strong>
      <button onClick={() => shiftMonth(1)} style={iconButton}><ChevronRight size={15} /></button>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', background: C.panel }}>
      {['一','二','三','四','五','六','日'].map(day => <div key={day} style={{ padding: 7, textAlign: 'center', fontSize: 10, color: C.mut }}>{day}</div>)}
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)' }}>
      {cells.map((cell, index) => {
        const dayPlan = byIso.get(cell.iso);
        const phase = dayPlan?.phase ?? (cell.iso >= '2026-07-31' && cell.iso <= '2026-09-07' ? 'learn'
          : cell.iso >= '2026-09-08' && cell.iso <= '2026-09-14' ? 'review'
          : cell.iso === '2026-09-15' ? 'exam' : undefined);
        const phaseColor = phase === 'review' ? '#7C5CFC' : phase === 'exam' ? C.red : phase === 'learn' ? C.blue : 'transparent';
        return <div key={`${cell.current}-${cell.day}-${index}`}
          onDragOver={e => dayPlan && e.preventDefault()} onDrop={() => dayPlan && moveModule(dayPlan.iso)}
          style={{ minHeight: 96, padding: 5, borderRight: `1px solid ${C.line}`, borderTop: `3px solid ${phaseColor}`,
            background: cell.current ? C.card : '#FAFAFA', opacity: cell.current ? 1 : .45 }}>
          <span style={{ fontSize: 10, color: phase === 'exam' ? C.red : C.mut }}>{cell.day}</span>
          {phase === 'exam' && <span style={{ float: 'right', fontSize: 9, color: C.red }}>⚑ 考试</span>}
          {dayPlan?.modules.slice(0, 3).map(mod => <div key={mod.id} draggable
            onDragStart={() => setDrag({ moduleId: mod.id, fromIso: dayPlan.iso })}
            onClick={() => openModule(mod.id)}
            style={{ marginTop: 4, padding: '4px 5px', borderRadius: 5,
              background: phase === 'review' ? '#F1EEFF' : C.blueBg,
              fontSize: 9, color: C.ink, cursor: 'grab', display: 'grid', gridTemplateColumns: '1fr auto', gap: 2 }}>
            <strong style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mod.name}</strong>
            <button title="移出当前计划" onClick={e => { e.stopPropagation(); requestRemove(mod); }} style={miniClose}>×</button>
            <span style={{ gridColumn: '1 / -1', color: C.mut, fontSize: 8 }}>{mod.kps.length}个知识点 · {mod.minutes}分钟</span>
          </div>)}
          {(dayPlan?.modules.length ?? 0) > 3 && <span style={{ fontSize: 9, color: C.blue }}>+{dayPlan!.modules.length - 3}项</span>}
        </div>;
      })}
    </div>
  </section>;
}

function ModuleTodo({ mod, iso, dragging, setDrag, openModule, requestRemove }: {
  mod: Module; iso: string; dragging: boolean;
  setDrag: (value: { moduleId: string; fromIso: string } | null) => void;
  openModule: (id: string) => void; requestRemove: (mod: Module) => void;
}) {
  return <div draggable onDragStart={() => setDrag({ moduleId: mod.id, fromIso: iso })}
    onClick={() => openModule(mod.id)}
    style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 8px', border: `1px solid ${C.line}`,
      borderRadius: 8, cursor: 'pointer', opacity: dragging ? .35 : 1 }}>
    <GripVertical size={13} color={C.faint} style={{ cursor: 'grab' }} />
    <strong style={{ fontSize: 11.5, flex: 1 }}>{mod.name}</strong>
    <span style={{ fontSize: 10, color: C.mut }}>{mod.kps.length}个知识点 · {mod.minutes}分钟</span>
    <button onClick={e => { e.stopPropagation(); requestRemove(mod); }} title="移出当前计划" style={closeButton}><X size={11} /></button>
  </div>;
}

function ModulePopover({ module, index, total, onClose, onPrev, onNext, onKnown, onRemoveModule, onRemoveKP }: {
  module: Module; index: number; total: number; onClose: () => void; onPrev: () => void; onNext: () => void;
  onKnown: (id: string) => void; onRemoveModule: () => void; onRemoveKP: (kp: KP) => void;
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
        {module.kps.map((item, i) => <div key={item.id} style={{ padding: '9px 10px', display: 'flex', alignItems: 'center',
          gap: 8, borderTop: i ? `1px solid ${C.line}` : 'none' }}>
          <GripVertical size={12} color={C.faint} />
          <span style={{ flex: 1, fontSize: 12, color: item.known ? C.mut : C.ink,
            textDecoration: item.known ? 'line-through' : 'none' }}>{item.name}</span>
          <button onClick={() => onKnown(item.id)} style={ghostSmall}>{item.known ? '已会 ✓' : '我已经会了'}</button>
          <button onClick={() => onRemoveKP(item)} style={closeButton}><X size={11} /></button>
        </div>)}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', marginTop: 12 }}>
        <span style={{ fontSize: 10.5, color: C.mut, flex: 1 }}>左右滑动或使用箭头预览其他模块</span>
        <button onClick={onRemoveModule} style={{ ...ghostSmall, color: C.red }}>整个模块移出计划</button>
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
const closeButton: React.CSSProperties = { border: 0, background: C.redBg, color: C.red, width: 23, height: 23,
  borderRadius: 6, display: 'grid', placeItems: 'center', cursor: 'pointer' };
const miniClose: React.CSSProperties = { border: 0, background: 'transparent', color: C.red, padding: 0, cursor: 'pointer' };
const configLabel: React.CSSProperties = { display: 'block', fontSize: 10.5, color: C.ink };
