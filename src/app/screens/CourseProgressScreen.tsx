import React, { useState, useCallback } from 'react';
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight, Play, Check, Star, Trash2, GripVertical, Bell, X } from 'lucide-react';

interface CourseProgressScreenProps {
  onBack: () => void;
  onStartPractice?: () => void;
  /** 'created' = 创建完成后首次落地（语境A）；'view' = 日后从 Hero 进入（语境B） */
  context?: 'created' | 'view';
}

// ── Design tokens ───────────────────────────────────────────────────────────────

const C = {
  ink: '#333333', sub: '#666666', mut: '#999999', muted: '#CCCCCC',
  bdr: '#EBEBEB', bdrSoft: '#EFEFEF',
  bg: '#F6F6F6', panel: '#F3F4F6', card: '#FFFFFF',
  mastered: '#00A63E', masteredBg: '#F6FEF9',
  learning: '#2D8CFF',
  weak: '#FF6252', weakBg: '#FFEDEB',
  reviewDue: '#8E99B0',
  newGray: '#CCCCCC',
  gold: '#FDC700', overdue: '#E17100', overdueBg: '#FFF4DF',
  dark: '#1A1D2E',
};

// ── Date helpers ──────────────────────────────────────────────────────────────

// Treat today as 2026-07-09 (Thu). In production this would be `new Date()`.
const SYSTEM_TODAY = new Date(2026, 6, 9);
const PLAN_START = new Date(2026, 6, 2); // July 2, 2026 = Day 1
const PLAN_TOTAL = 72;

function dayIndex(d: Date): number {
  const ms = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
           - new Date(PLAN_START.getFullYear(), PLAN_START.getMonth(), PLAN_START.getDate()).getTime();
  return Math.round(ms / 86400000) + 1; // Day 1 = plan start
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function addDays(d: Date, n: number) {
  const r = new Date(d); r.setDate(r.getDate() + n); return r;
}

// Monday-anchored week containing `d`
function weekMonday(d: Date): Date {
  const day = d.getDay(); // 0=Sun
  const diff = (day === 0 ? -6 : 1 - day);
  return addDays(d, diff);
}

function formatMonthDay(d: Date) {
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

const DAY_NAMES = ['日', '一', '二', '三', '四', '五', '六'];
function shortDayName(d: Date) { return DAY_NAMES[d.getDay()]; }

type DateType = 'past' | 'today' | 'future';
function dateType(d: Date): DateType {
  if (sameDay(d, SYSTEM_TODAY)) return 'today';
  return d < SYSTEM_TODAY ? 'past' : 'future';
}

// ── Task data ─────────────────────────────────────────────────────────────────

type KPCheck = 'done' | 'progress' | 'todo';
type ModuleType = 'new' | 'review';

interface KP { id: string; name: string; check: KPCheck; overdueDays?: number; }
interface Module {
  id: string; name: string; type: ModuleType;
  kps: KP[]; totalMin: number; daysAgo?: number;
  reminderSynced?: boolean;
}

// Demo data for "today" (Day 8)
const TODAY_MODULES: Module[] = [
  {
    id: 'bribery', name: '受贿罪专题', type: 'new', totalMin: 20, reminderSynced: true,
    kps: [
      { id: 'br1', name: '受贿罪主体认定', check: 'todo' },
      { id: 'br2', name: '为他人谋取利益', check: 'todo' },
      { id: 'br3', name: '事后受财的认定', check: 'todo' },
      { id: 'br4', name: '共同受贿', check: 'todo' },
      { id: 'br5', name: '受贿与行贿的竞合', check: 'todo' },
    ],
  },
  {
    id: 'malfeasance', name: '渎职罪', type: 'new', totalMin: 18,
    kps: [
      { id: 'kp-m1', name: '渎职罪主体认定', check: 'done' },
      { id: 'kp-m2', name: '与受贿罪的竞合关系', check: 'progress' },
      { id: 'kp-m3', name: '滥用职权罪', check: 'todo' },
      { id: 'kp-m4', name: '玩忽职守罪', check: 'todo' },
    ],
  },
  {
    id: 'embezzle', name: '侵占罪专题', type: 'new', totalMin: 15,
    kps: [
      { id: 'em1', name: '侵占罪构成要件', check: 'todo' },
      { id: 'em2', name: '拒不归还的认定', check: 'todo' },
      { id: 'em3', name: '与职务侵占的区别', check: 'todo' },
    ],
  },
  {
    id: 'principle', name: '刑法基本原则', type: 'review', totalMin: 10, daysAgo: 7,
    kps: [
      { id: 'pr1', name: '罪刑法定原则', check: 'done' },
      { id: 'pr2', name: '平等适用原则', check: 'done' },
      { id: 'pr3', name: '罪责刑相适应原则', check: 'done' },
    ],
  },
  {
    id: 'elements', name: '犯罪构成理论', type: 'review', totalMin: 12, daysAgo: 5,
    kps: [
      { id: 'el1', name: '四要件说', check: 'done' },
      { id: 'el2', name: '三阶层说', check: 'done' },
    ],
  },
];

// Demo data for a past day (Day 7 = Jul 8) — 含逾期项（overdue）
const PAST_MODULES: Module[] = [
  {
    id: 'defense', name: '正当防卫', type: 'new', totalMin: 18,
    kps: [
      { id: 'def1', name: '正当防卫构成要件', check: 'done' },
      { id: 'def2', name: '防卫过当的认定', check: 'done' },
      { id: 'def3', name: '特殊防卫权', check: 'done' },
      { id: 'def4', name: '假想防卫', check: 'todo', overdueDays: 1 },
      { id: 'def5', name: '相互斗殴中的防卫', check: 'todo', overdueDays: 1 },
    ],
  },
  {
    id: 'excessive', name: '防卫过当', type: 'new', totalMin: 12,
    kps: [
      { id: 'ex1', name: '防卫过当的主观要件', check: 'done' },
      { id: 'ex2', name: '防卫过当的量刑', check: 'done' },
      { id: 'ex3', name: '典型案例分析', check: 'done' },
    ],
  },
  {
    id: 'intentional', name: '故意犯罪停止形态', type: 'review', totalMin: 8,
    kps: [
      { id: 'int1', name: '犯罪未遂的认定', check: 'done' },
      { id: 'int2', name: '犯罪中止的认定', check: 'done' },
    ],
  },
];

// Demo data for a future day (Day 9 = Jul 10)
const FUTURE_MODULES: Module[] = [
  {
    id: 'fraud', name: '诈骗罪专题', type: 'new', totalMin: 22,
    kps: [
      { id: 'fr1', name: '诈骗罪构成要件', check: 'todo' },
      { id: 'fr2', name: '诈骗金额的计算', check: 'todo' },
      { id: 'fr3', name: '诈骗与盗窃的界限', check: 'todo' },
      { id: 'fr4', name: '合同诈骗的认定', check: 'todo' },
      { id: 'fr5', name: '网络诈骗的特殊规定', check: 'todo' },
      { id: 'fr6', name: '诈骗中的共犯认定', check: 'todo' },
    ],
  },
  {
    id: 'creditfraud', name: '信用卡诈骗罪', type: 'new', totalMin: 14,
    kps: [
      { id: 'cf1', name: '信用卡诈骗罪的行为类型', check: 'todo' },
      { id: 'cf2', name: '恶意透支的认定', check: 'todo' },
      { id: 'cf3', name: '催收程序要求', check: 'todo' },
      { id: 'cf4', name: '与盗窃罪的竞合', check: 'todo' },
    ],
  },
  {
    id: 'briberyreview', name: '受贿罪关联知识', type: 'review', totalMin: 10,
    kps: [
      { id: 'brr1', name: '行贿罪的构成', check: 'todo' },
      { id: 'brr2', name: '介绍贿赂罪', check: 'todo' },
      { id: 'brr3', name: '单位行贿', check: 'todo' },
    ],
  },
];

function seedModulesForDate(d: Date): Module[] {
  const t = dateType(d);
  const dIdx = dayIndex(d);
  const clone = (mods: Module[], suffix: string) =>
    mods.map(m => ({ ...m, id: m.id + suffix, kps: m.kps.map(k => ({ ...k, id: k.id + suffix })) }));
  if (t === 'today') return clone(TODAY_MODULES, '');
  if (t === 'past') return dIdx === 7 ? clone(PAST_MODULES, '') : clone(PAST_MODULES, `-${dIdx}`);
  return dIdx === 9 ? clone(FUTURE_MODULES, '') : clone(FUTURE_MODULES, `-${dIdx}`);
}

// ── Check mark ────────────────────────────────────────────────────────────────

function CheckMark({ check, onClick, disabled }: { check: KPCheck; onClick?: () => void; disabled?: boolean }) {
  const base: React.CSSProperties = {
    width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    cursor: disabled ? 'default' : 'pointer', padding: 0,
  };
  if (check === 'done') {
    return (
      <button onClick={onClick} disabled={disabled} style={{ ...base, background: C.mastered, border: 'none' }}>
        <Check size={11} color="#fff" strokeWidth={3} />
      </button>
    );
  }
  if (check === 'progress') {
    return (
      <button onClick={onClick} disabled={disabled} style={{ ...base, background: 'transparent', border: `2px solid ${C.learning}` }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.learning }} />
      </button>
    );
  }
  return <button onClick={onClick} disabled={disabled} style={{ ...base, background: 'transparent', border: `2px solid ${C.muted}` }} />;
}

// ── Module todo group ─────────────────────────────────────────────────────────

interface ModuleGroupProps {
  mod: Module;
  dateT: DateType;
  bookmarked: Set<string>;
  onBookmark: (id: string) => void;
  onToggleCheck: (modId: string, kpId: string) => void;
  onDragStartKP: (modId: string, kp: KP) => void;
  onRequestDelete: (modId: string, kp: KP) => void;
  draggingKPId: string | null;
}

function ModuleGroup({ mod, dateT, bookmarked, onBookmark, onToggleCheck, onDragStartKP, onRequestDelete, draggingKPId }: ModuleGroupProps) {
  const doneCount = mod.kps.filter(k => k.check === 'done').length;

  return (
    <div style={{ marginBottom: 10 }}>
      {/* Module header (同步单元) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 4px 6px' }}>
        <span style={{ fontSize: 11, fontWeight: 700,
          color: mod.type === 'new' ? C.learning : C.reviewDue,
          background: mod.type === 'new' ? 'rgba(45,140,255,0.08)' : 'rgba(142,153,176,0.12)',
          padding: '1px 6px', borderRadius: 5, flexShrink: 0 }}>
          {mod.type === 'new' ? '新学' : '复习'}
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.ink, flex: 1 }}>{mod.name}</span>
        <span style={{ fontSize: 11, color: C.mut }}>{doneCount}/{mod.kps.length}</span>
        {mod.daysAgo != null && <span style={{ fontSize: 11, color: C.reviewDue }}>· {mod.daysAgo}天未复习</span>}
        {mod.reminderSynced && (
          <span title="已同步到提醒事项" style={{ display: 'inline-flex', alignItems: 'center', gap: 3,
            fontSize: 10, color: C.mut, background: C.panel, padding: '2px 6px', borderRadius: 4 }}>
            <Bell size={9} /> 已同步提醒
          </span>
        )}
      </div>

      {/* KP todo items */}
      <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.bdr}`, overflow: 'hidden' }}>
        {mod.kps.map((kp, ki) => {
          const isOverdue = kp.overdueDays != null && kp.check !== 'done';
          const done = kp.check === 'done';
          const canCheck = dateT === 'today';
          const canEdit = dateT !== 'past'; // 拖拽改期/删除仅未来与今天可用
          return (
            <div
              key={kp.id}
              draggable={canEdit}
              onDragStart={(e) => { if (canEdit) { e.stopPropagation(); onDragStartKP(mod.id, kp); } }}
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '9px 12px',
                borderTop: ki === 0 ? 'none' : `1px solid ${C.bdrSoft}`,
                background: isOverdue ? C.overdueBg : '#fff',
                opacity: draggingKPId === kp.id ? 0.35 : 1,
              }}
            >
              {canEdit && <GripVertical size={13} color={C.muted} style={{ flexShrink: 0, cursor: 'grab' }} />}
              <CheckMark check={kp.check} disabled={!canCheck}
                onClick={canCheck ? () => onToggleCheck(mod.id, kp.id) : undefined} />
              <span style={{
                fontSize: 12.5, flex: 1, lineHeight: 1.4,
                color: done ? C.mut : C.ink,
                textDecoration: done ? 'line-through' : 'none',
              }}>
                {kp.name}
              </span>
              {isOverdue && (
                <span style={{ fontSize: 10, fontWeight: 600, color: '#fff', background: C.overdue,
                  padding: '2px 7px', borderRadius: 4, flexShrink: 0 }}>
                  逾期 · {kp.overdueDays} 天未学
                </span>
              )}
              {dateT === 'today' && (
                <button onClick={() => onBookmark(kp.id)} style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: 2, flexShrink: 0,
                }}>
                  <Star size={13} strokeWidth={1.5}
                    color={bookmarked.has(kp.id) ? C.gold : C.muted}
                    fill={bookmarked.has(kp.id) ? C.gold : 'none'} />
                </button>
              )}
              {canEdit && (
                <button onClick={() => onRequestDelete(mod.id, kp)} title="从计划中删除"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, flexShrink: 0, color: C.muted }}>
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Week strip ────────────────────────────────────────────────────────────────

interface WeekStripProps {
  selectedDate: Date;
  weekOffset: number;
  onSelectDate: (d: Date) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onReturnToday: () => void;
}

function WeekStrip({ selectedDate, weekOffset, onSelectDate, onPrevWeek, onNextWeek, onReturnToday }: WeekStripProps) {
  const mon = weekMonday(addDays(SYSTEM_TODAY, weekOffset * 7));
  const days = Array.from({ length: 7 }, (_, i) => addDays(mon, i));
  const isOnToday = sameDay(selectedDate, SYSTEM_TODAY);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 0,
      padding: '0 16px', background: '#fff', borderBottom: `1px solid ${C.bdr}`,
      height: 64, flexShrink: 0,
    }}>
      <button onClick={onPrevWeek} style={{
        width: 28, height: 28, borderRadius: '50%', border: `1px solid ${C.bdr}`,
        background: '#fff', color: C.sub, display: 'flex', alignItems: 'center',
        justifyContent: 'center', cursor: 'pointer', flexShrink: 0, marginRight: 6,
      }}>
        <ChevronLeft size={14} />
      </button>

      <div style={{ display: 'flex', flex: 1, gap: 0 }}>
        {days.map((d, i) => {
          const isSel = sameDay(d, selectedDate);
          const isToday = sameDay(d, SYSTEM_TODAY);
          const dt = dateType(d);
          const dIdx = dayIndex(d);
          const inPlan = dIdx >= 1 && dIdx <= PLAN_TOTAL;

          let dotColor = 'transparent';
          if (dt === 'past' && inPlan) dotColor = C.mastered;
          else if (isToday) dotColor = C.learning;
          else if (dt === 'future' && inPlan) dotColor = C.bdr;

          return (
            <button key={i} onClick={() => onSelectDate(d)} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 3, padding: '8px 4px', border: 'none', cursor: 'pointer',
              borderRadius: 10, background: isSel ? C.dark : 'transparent',
              transition: 'background 0.15s',
            }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: isSel ? 'rgba(255,255,255,0.6)' : C.mut }}>
                {shortDayName(d)}
              </span>
              <span style={{
                fontSize: 15, fontWeight: isSel || isToday ? 700 : 500,
                color: isSel ? '#fff' : isToday ? C.ink : inPlan ? C.sub : C.mut,
              }}>
                {d.getDate()}
              </span>
              <span style={{
                width: 5, height: 5, borderRadius: '50%',
                background: isSel ? 'rgba(255,255,255,0.5)' : dotColor,
                border: dt === 'future' && inPlan && !isSel ? `1px solid ${C.mut}` : 'none',
              }} />
            </button>
          );
        })}
      </div>

      <button onClick={onNextWeek} style={{
        width: 28, height: 28, borderRadius: '50%', border: `1px solid ${C.bdr}`,
        background: '#fff', color: C.sub, display: 'flex', alignItems: 'center',
        justifyContent: 'center', cursor: 'pointer', flexShrink: 0, marginLeft: 6,
      }}>
        <ChevronRight size={14} />
      </button>

      {!isOnToday && (
        <button onClick={onReturnToday} style={{
          marginLeft: 12, fontSize: 12, fontWeight: 600, color: C.learning,
          background: 'rgba(45,140,255,0.08)', border: 'none', cursor: 'pointer',
          padding: '5px 11px', borderRadius: 8, flexShrink: 0, whiteSpace: 'nowrap',
        }}>
          回到今天
        </button>
      )}
    </div>
  );
}

// ── Month calendar (推进进度视图) ────────────────────────────────────────────────

function MonthProgressCalendar({ onClose, onPickDate }: { onClose: () => void; onPickDate: (d: Date) => void }) {
  const [month, setMonth] = useState(new Date(SYSTEM_TODAY.getFullYear(), SYSTEM_TODAY.getMonth(), 1));
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const startPad = (firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1); // Monday-first
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();

  // Demo：本月每天完成情况，仅过去/今天有推进结果
  const completion = (d: Date): 'full' | 'partial' | 'none' | 'out' => {
    const dIdx = dayIndex(d);
    if (dIdx < 1 || dIdx > PLAN_TOTAL) return 'out';
    if (d > SYSTEM_TODAY) return 'out';
    if (dIdx === 7) return 'partial'; // 有 overdue
    return 'full';
  };
  const cells: (Date | null)[] = [
    ...Array.from({ length: startPad }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1)),
  ];
  const monthDone = cells.filter(c => c && completion(c) === 'full').length;

  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, zIndex: 100, background: 'rgba(10,10,20,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: 380, maxWidth: '90%', background: '#fff', borderRadius: 16, padding: 20,
        boxShadow: '0 12px 40px rgba(0,0,0,0.22)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <button onClick={() => setMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))} style={{
            width: 28, height: 28, borderRadius: 8, border: `1px solid ${C.bdr}`, background: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.sub }}>
            <ChevronLeft size={15} />
          </button>
          <span style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>
            {month.getFullYear()} 年 {month.getMonth() + 1} 月
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))} style={{
              width: 28, height: 28, borderRadius: 8, border: `1px solid ${C.bdr}`, background: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.sub }}>
              <ChevronRight size={15} />
            </button>
            <button onClick={onClose} style={{
              width: 28, height: 28, borderRadius: 8, border: `1px solid ${C.bdr}`, background: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.sub }}>
              <X size={15} />
            </button>
          </div>
        </div>

        <p style={{ fontSize: 12, color: C.sub, margin: '2px 0 14px' }}>
          本月已完成 <strong style={{ color: C.mastered }}>{monthDone}</strong> 天的计划 · 看看这个月坚持得怎么样
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 6 }}>
          {['一', '二', '三', '四', '五', '六', '日'].map(w => (
            <div key={w} style={{ textAlign: 'center', fontSize: 10, color: C.mut, fontWeight: 600 }}>{w}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {cells.map((d, i) => {
            if (!d) return <div key={i} />;
            const st = completion(d);
            const isToday = sameDay(d, SYSTEM_TODAY);
            const bg = st === 'full' ? C.mastered : st === 'partial' ? C.overdue : st === 'none' ? C.panel : 'transparent';
            const fg = st === 'full' || st === 'partial' ? '#fff' : st === 'out' ? C.muted : C.sub;
            return (
              <button key={i} onClick={() => { onPickDate(d); onClose(); }} disabled={st === 'out'} style={{
                aspectRatio: '1', borderRadius: 8, border: isToday ? `2px solid ${C.learning}` : '1px solid transparent',
                background: bg, color: fg, fontSize: 12, fontWeight: 600,
                cursor: st === 'out' ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {d.getDate()}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: 14, marginTop: 14, justifyContent: 'center' }}>
          {([['完成', C.mastered], ['部分/欠账', C.overdue], ['未开始', C.panel]] as [string, string][]).map(([lbl, col]) => (
            <span key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: C.sub }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: col }} /> {lbl}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export function CourseProgressScreen({ onBack, onStartPractice, context = 'view' }: CourseProgressScreenProps) {
  const [selectedDate, setSelectedDate] = useState(SYSTEM_TODAY);
  const [weekOffset, setWeekOffset] = useState(0);
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set(['kp-m1']));
  const [showCalendar, setShowCalendar] = useState(false);

  // 各日期的模块数据（可变：打勾 / 删除 / 拖拽改期）
  const [modulesByDay, setModulesByDay] = useState<Record<number, Module[]>>({});
  const [drag, setDrag] = useState<{ fromDay: number; modId: string; kp: KP } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ modId: string; kp: KP } | null>(null);

  const dt = dateType(selectedDate);
  const dIdx = dayIndex(selectedDate);
  const inPlan = dIdx >= 1 && dIdx <= PLAN_TOTAL;

  const getModules = useCallback((d: Date): Module[] => {
    const idx = dayIndex(d);
    if (modulesByDay[idx]) return modulesByDay[idx];
    return seedModulesForDate(d);
  }, [modulesByDay]);

  const setModules = (idx: number, updater: (mods: Module[]) => Module[]) => {
    setModulesByDay(prev => {
      const current = prev[idx] ?? seedModulesForDate(addDays(PLAN_START, idx - 1));
      return { ...prev, [idx]: updater(current) };
    });
  };

  const modules = getModules(selectedDate);
  const newModules = modules.filter(m => m.type === 'new');
  const reviewModules = modules.filter(m => m.type === 'review');

  const totalKPs = modules.reduce((a, m) => a + m.kps.length, 0);
  const doneKPs = modules.reduce((a, m) => a + m.kps.filter(k => k.check === 'done').length, 0);
  const overdueCount = modules.reduce((a, m) => a + m.kps.filter(k => k.overdueDays != null && k.check !== 'done').length, 0);
  const remaining = totalKPs - doneKPs;

  const handleReturnToday = useCallback(() => { setSelectedDate(SYSTEM_TODAY); setWeekOffset(0); }, []);
  const handlePrevWeek = useCallback(() => setWeekOffset(w => w - 1), []);
  const handleNextWeek = useCallback(() => setWeekOffset(w => w + 1), []);
  const handleSelectDate = useCallback((d: Date) => {
    setSelectedDate(d);
    const mon = weekMonday(d);
    const todayMon = weekMonday(SYSTEM_TODAY);
    setWeekOffset(Math.round((mon.getTime() - todayMon.getTime()) / (7 * 86400000)));
  }, []);

  // 逐个知识点打勾（○ → ✓ → ○）
  const toggleCheck = (modId: string, kpId: string) => {
    setModules(dIdx, mods => mods.map(m => m.id !== modId ? m : {
      ...m, kps: m.kps.map(k => k.id !== kpId ? k : {
        ...k, check: k.check === 'done' ? 'todo' : 'done',
      }),
    }));
  };

  // 拖拽改期
  const handleDrop = (toDay: Date) => {
    if (!drag) return;
    const toIdx = dayIndex(toDay);
    if (toIdx === drag.fromDay) { setDrag(null); return; }
    // 从源日移除
    setModules(drag.fromDay, mods =>
      mods.map(m => m.id === drag.modId ? { ...m, kps: m.kps.filter(k => k.id !== drag.kp.id) } : m)
        .filter(m => m.kps.length > 0));
    // 加入目标日「手动调入」模块
    setModules(toIdx, mods => {
      const adjId = `__adj_${toIdx}`;
      const existing = mods.find(m => m.id === adjId);
      const movedKP: KP = { ...drag.kp, overdueDays: undefined };
      if (existing) return mods.map(m => m.id === adjId ? { ...m, kps: [...m.kps, movedKP] } : m);
      return [...mods, { id: adjId, name: '手动调入', type: 'new' as ModuleType, totalMin: 5, kps: [movedKP] }];
    });
    setDrag(null);
  };

  // 硬删除
  const confirmDelete = () => {
    if (!deleteTarget) return;
    setModules(dIdx, mods =>
      mods.map(m => m.id === deleteTarget.modId ? { ...m, kps: m.kps.filter(k => k.id !== deleteTarget.kp.id) } : m)
        .filter(m => m.kps.length > 0));
    setDeleteTarget(null);
  };

  const handleBookmark = (id: string) =>
    setBookmarked(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  // Date header label
  let dateLabel = '';
  if (dt === 'today') dateLabel = `今天 ${formatMonthDay(selectedDate)}`;
  else if (sameDay(selectedDate, addDays(SYSTEM_TODAY, -1))) dateLabel = `昨天 ${formatMonthDay(selectedDate)}`;
  else if (sameDay(selectedDate, addDays(SYSTEM_TODAY, 1))) dateLabel = `明天 ${formatMonthDay(selectedDate)}`;
  else dateLabel = formatMonthDay(selectedDate);

  const ctaLabel = dt === 'past' ? '复习当天内容' : dt === 'future' ? '查看计划内容' : '开始今日学习';

  return (
    <div style={{ background: C.bg, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', height: 52, background: C.card,
        borderBottom: `1px solid ${C.bdr}`, flexShrink: 0,
      }}>
        <button onClick={onBack} style={{
          display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
          cursor: 'pointer', color: C.sub, fontSize: 13, fontWeight: 600, padding: '6px 4px',
        }}>
          <ArrowLeft size={16} />
          返回 Today
        </button>
        <span style={{ fontSize: 16, fontWeight: 700, color: C.ink }}>学习计划</span>
        <button onClick={() => setShowCalendar(true)} title="查看本月推进进度" style={{
          display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
          cursor: 'pointer', color: C.sub, padding: '6px 4px',
        }}>
          <Calendar size={18} />
        </button>
      </div>

      {/* Week strip */}
      <WeekStrip
        selectedDate={selectedDate}
        weekOffset={weekOffset}
        onSelectDate={handleSelectDate}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
        onReturnToday={handleReturnToday}
      />

      {/* Date header */}
      <div style={{
        padding: '14px 20px 10px', background: C.card, borderBottom: `1px solid ${C.bdr}`,
        flexShrink: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.ink, lineHeight: 1 }}>{dateLabel}</div>
          {inPlan
            ? <div style={{ fontSize: 12, color: C.mut, marginTop: 4, fontWeight: 600 }}>Day {dIdx} / {PLAN_TOTAL}</div>
            : <div style={{ fontSize: 12, color: C.mut, marginTop: 4 }}>计划范围之外</div>
          }
        </div>
        {dt === 'today' && inPlan && (
          <span style={{ fontSize: 12, color: C.sub }}>
            已处理 <strong>{doneKPs}</strong> / {totalKPs} 个知识点
          </span>
        )}
        {dt === 'past' && inPlan && (
          <span style={{ fontSize: 12, color: C.mastered }}>完成 {doneKPs} / {totalKPs} 个知识点 ✓</span>
        )}
        {dt === 'future' && inPlan && (
          <span style={{ fontSize: 12, color: C.mut }}>计划 {totalKPs} 个知识点</span>
        )}
      </div>

      {/* Scrollable task area */}
      {inPlan ? (
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px 120px', scrollbarWidth: 'none' }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>

            {/* 语境A：机制说明文案（此刻没有真实逾期，不画红色逾期态） */}
            {context === 'created' && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 8,
                background: C.panel, borderRadius: 10, padding: '10px 12px', marginBottom: 12,
              }}>
                <span style={{ fontSize: 14, lineHeight: 1.3 }}>💡</span>
                <span style={{ fontSize: 12, color: C.sub, lineHeight: 1.6 }}>
                  没学完的知识点会自动顺延到后面，并标记为待补 —— 掉队也不用怕，计划会帮你滚动消化。
                </span>
              </div>
            )}

            {/* 语境B：真有欠账时的顶部提醒 */}
            {context !== 'created' && overdueCount > 0 && (
              <button onClick={handleReturnToday} style={{
                display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                background: C.overdueBg, border: `1px solid ${C.overdue}33`, borderRadius: 10,
                padding: '10px 12px', marginBottom: 12, cursor: 'pointer', textAlign: 'left',
              }}>
                <span style={{ fontSize: 13 }}>⏳</span>
                <span style={{ fontSize: 12, color: C.overdue, fontWeight: 600, flex: 1 }}>
                  你有 {overdueCount} 个欠账待补
                </span>
                <ChevronRight size={14} color={C.overdue} />
              </button>
            )}

            {/* 当日达成条 */}
            {dt === 'today' && (
              <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.bdr}`, padding: '12px 14px', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>今天 {doneKPs}/{totalKPs} 已完成</span>
                  <span style={{ fontSize: 12, color: C.mastered, fontWeight: 600 }}>
                    {remaining > 0 ? `再 ${remaining} 个就收尾` : '今天全部收尾 🎉'}
                  </span>
                </div>
                <div style={{ height: 6, background: C.panel, borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${totalKPs ? Math.round(doneKPs / totalKPs * 100) : 0}%`,
                    background: C.mastered, borderRadius: 4, transition: 'width 0.4s ease' }} />
                </div>
              </div>
            )}

            {/* 新学 */}
            {newModules.length > 0 && (
              <div style={{ marginBottom: 4 }}>
                {newModules.map(mod => (
                  <ModuleGroup
                    key={mod.id} mod={mod} dateT={dt}
                    bookmarked={bookmarked} onBookmark={handleBookmark}
                    onToggleCheck={toggleCheck}
                    onDragStartKP={(modId, kp) => setDrag({ fromDay: dIdx, modId, kp })}
                    onRequestDelete={(modId, kp) => setDeleteTarget({ modId, kp })}
                    draggingKPId={drag?.kp.id ?? null}
                  />
                ))}
              </div>
            )}

            {/* 复习 */}
            {reviewModules.length > 0 && (
              <div>
                {reviewModules.map(mod => (
                  <ModuleGroup
                    key={mod.id} mod={mod} dateT={dt}
                    bookmarked={bookmarked} onBookmark={handleBookmark}
                    onToggleCheck={toggleCheck}
                    onDragStartKP={(modId, kp) => setDrag({ fromDay: dIdx, modId, kp })}
                    onRequestDelete={(modId, kp) => setDeleteTarget({ modId, kp })}
                    draggingKPId={drag?.kp.id ?? null}
                  />
                ))}
              </div>
            )}

            {/* 拖拽时的改期落点提示（相邻日期） */}
            {drag && (
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                {[-1, 1].map(delta => {
                  const target = addDays(selectedDate, delta);
                  const tIdx = dayIndex(target);
                  if (tIdx < 1 || tIdx > PLAN_TOTAL) return null;
                  return (
                    <div key={delta}
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => { e.preventDefault(); handleDrop(target); }}
                      style={{
                        flex: 1, padding: '14px 12px', borderRadius: 10,
                        border: `1.5px dashed ${C.learning}`, background: 'rgba(45,140,255,0.06)',
                        fontSize: 12, color: C.learning, fontWeight: 600, textAlign: 'center',
                      }}>
                      拖到「{delta < 0 ? '前一天' : '后一天'} {formatMonthDay(target)}」改期
                    </div>
                  );
                })}
              </div>
            )}

            {/* 设备同步说明 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', padding: '14px 0 4px' }}>
              <Bell size={12} color={C.mut} />
              <span style={{ fontSize: 11, color: C.mut }}>
                todo 已按模块同步到系统「提醒事项」，完成模块会自动勾掉
              </span>
            </div>

            {/* Context note for past/future */}
            {dt !== 'today' && (
              <p style={{ fontSize: 12, color: C.mut, textAlign: 'center', padding: '4px 0' }}>
                {dt === 'past' ? '查看历史记录不会修改学习进度。' : '预览内容，将在计划当天解锁。'}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
          <Calendar size={36} color={C.mut} />
          <p style={{ fontSize: 14, color: C.sub, fontWeight: 600 }}>此日期不在当前学习计划内</p>
          <button onClick={handleReturnToday} style={{
            fontSize: 13, color: C.learning, background: 'rgba(45,140,255,0.08)',
            border: 'none', cursor: 'pointer', padding: '8px 18px', borderRadius: 10, fontWeight: 600,
          }}>
            回到今天
          </button>
        </div>
      )}

      {/* 底部行动区 */}
      {inPlan && (
        context === 'created' ? (
          /* 语境A专属：创建完成后首次落地，给两选择 */
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: '#fff', borderTop: `1px solid ${C.bdr}`,
            padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center',
          }}>
            <button onClick={onBack} style={{
              padding: '12px 22px', borderRadius: 12, border: `1.5px solid ${C.bdr}`,
              background: '#fff', color: C.sub, fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}>
              回到首页
            </button>
            <button onClick={() => onStartPractice?.()} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '13px 32px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: C.dark, color: '#fff', fontSize: 15, fontWeight: 700,
              boxShadow: '0 4px 16px rgba(26,29,46,0.22)',
            }}>
              <Play size={13} fill="#fff" strokeWidth={0} />
              开始练习
            </button>
          </div>
        ) : (
          /* 语境B：单个日期 CTA */
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 72,
            background: 'linear-gradient(to top, #F6F6F6 60%, transparent)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 16,
            pointerEvents: 'none',
          }}>
            <button onClick={() => onStartPractice?.()} style={{
              display: 'flex', alignItems: 'center', gap: 8, pointerEvents: 'auto',
              padding: '13px 32px', borderRadius: 13, border: 'none', cursor: 'pointer',
              background: dt === 'future' ? C.panel : C.dark,
              color: dt === 'future' ? C.sub : '#fff',
              fontSize: 15, fontWeight: 700, boxShadow: dt !== 'future' ? '0 4px 16px rgba(26,29,46,0.22)' : 'none',
            }}>
              {dt !== 'future' && <Play size={13} fill="#fff" strokeWidth={0} />}
              {ctaLabel}
            </button>
          </div>
        )
      )}

      {/* 月历（推进进度视图） */}
      {showCalendar && (
        <MonthProgressCalendar onClose={() => setShowCalendar(false)} onPickDate={handleSelectDate} />
      )}

      {/* 删除确认（加重、写明后果） */}
      {deleteTarget && (
        <div onClick={() => setDeleteTarget(null)} style={{
          position: 'absolute', inset: 0, zIndex: 110, background: 'rgba(10,10,20,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            width: 360, maxWidth: '92%', background: '#fff', borderRadius: 16, padding: 22,
            boxShadow: '0 12px 40px rgba(0,0,0,0.24)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ width: 36, height: 36, borderRadius: '50%', background: C.weakBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Trash2 size={17} color={C.weak} />
              </span>
              <span style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>
                删除「{deleteTarget.kp.name}」？
              </span>
            </div>
            <p style={{ fontSize: 13, color: C.sub, lineHeight: 1.7, margin: '0 0 18px' }}>
              将从你的知识结构中<strong style={{ color: C.weak }}>永久删除</strong>，其练习记录、星图与连线一并移除，<strong style={{ color: C.weak }}>不可恢复</strong>。（这不是「标记已掌握 / 跳过」）
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setDeleteTarget(null)} style={{
                padding: '9px 18px', borderRadius: 10, border: `1.5px solid ${C.bdr}`,
                background: '#fff', color: C.sub, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>取消</button>
              <button onClick={confirmDelete} style={{
                padding: '9px 18px', borderRadius: 10, border: 'none',
                background: C.weak, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}>永久删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseProgressScreen;
