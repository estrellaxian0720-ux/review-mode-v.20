import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, GripVertical, Check, AlertTriangle, SlidersHorizontal } from 'lucide-react';

// ── Design tokens ────────────────────────────────────────────────────────────────

const C = {
  ink: '#333333', sub: '#666666', mut: '#999999', muted: '#CCCCCC',
  bdr: '#EBEBEB', bdrSoft: '#EFEFEF',
  bg: '#F6F6F6', panel: '#F3F4F6', card: '#FFFFFF',
  mastered: '#00A63E', masteredBg: '#F6FEF9',
  learning: '#2D8CFF',
  weak: '#FF6252', weakBg: '#FFEDEB',
  reviewDue: '#8E99B0',
  gold: '#FDC700', overdue: '#E17100', overdueBg: '#FFF4DF',
  dark: '#1A1D2E',
};

// ── Types ──────────────────────────────────────────────────────────────────────

type Stars = 1 | 2 | 3; // 3=三星（最重点） 2=二星 1=一星
interface KP { id: string; name: string; stars: Stars; known?: boolean; }
interface Chapter { id: string; name: string; kps: KP[]; isAdjusted?: boolean; }
interface DayPlan { dayNum: number; date: string; estimatedMin: number; chapters: Chapter[]; }
interface DragInfo { kind: 'kp' | 'chapter'; id: string; label: string; fromDay: number; fromChapter?: string; }

interface PlanFrameworkScreenProps {
  onConfirm: () => void;
  onSkip: () => void;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const OVERLOAD = 26;
const FAR_THRESHOLD = 5; // day ≥ this collapses by default
const MIN_PER_KP = 6;    // 反推每日所需时长用

// ── Demo data ──────────────────────────────────────────────────────────────────

const BASE = new Date(2026, 6, 7);
function ds(n: number): string {
  const d = new Date(BASE);
  d.setDate(d.getDate() + n - 1);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

const S = (id: string, name: string, stars: Stars): KP => ({ id, name, stars });

const INITIAL_PLAN: DayPlan[] = [
  {
    dayNum: 1, date: ds(1), estimatedMin: 45,
    chapters: [
      { id: 'c1a', name: '刑法基本原则', kps: [S('k1','罪刑法定原则',3), S('k2','罪刑相适应原则',2), S('k3','平等适用原则',2)] },
      { id: 'c1b', name: '刑法效力范围', kps: [S('k4','属地管辖',2), S('k5','属人管辖',1), S('k6','保护管辖',1), S('k7','普遍管辖',1)] },
      { id: 'c1c', name: '犯罪概念与特征', kps: [S('k8','社会危害性',2), S('k9','刑事违法性',1), S('k10','应受惩罚性',1)] },
      { id: 'c1d', name: '犯罪构成总论', kps: [S('k11','犯罪主体',3), S('k12','主观方面',3), S('k13','犯罪客体',2), S('k14','客观方面',2)] },
    ],
  },
  {
    dayNum: 2, date: ds(2), estimatedMin: 42,
    chapters: [
      { id: 'c2a', name: '故意与过失', kps: [S('k15','直接故意',3), S('k16','间接故意',2), S('k17','疏忽大意过失',2), S('k18','过于自信过失',2)] },
      { id: 'c2b', name: '犯罪未完成形态', kps: [S('k19','犯罪预备',2), S('k20','犯罪未遂',3), S('k21','犯罪中止',3)] },
      { id: 'c2c', name: '共同犯罪', kps: [S('k22','主犯认定',3), S('k23','从犯与胁从犯',2), S('k24','教唆犯',2), S('k25','共犯过剩',1)] },
      { id: 'c2d', name: '正当化事由', kps: [S('k26','正当防卫',3), S('k27','紧急避险',2), S('k28','防卫过当',2)] },
    ],
  },
  {
    dayNum: 3, date: ds(3), estimatedMin: 38,
    chapters: [
      { id: 'c3a', name: '侵犯生命健康罪', kps: [S('k29','故意杀人罪',3), S('k30','故意伤害罪',3), S('k31','轻重伤认定',2)] },
      { id: 'c3b', name: '强奸与猥亵罪', kps: [S('k32','强奸罪要件',3), S('k33','强制猥亵罪',2), S('k34','猥亵儿童罪',2)] },
      { id: 'c3c', name: '非法拘禁与绑架', kps: [S('k35','非法拘禁罪',2), S('k36','绑架罪',3), S('k37','两罪界限',2)] },
      { id: 'c3d', name: '侵犯人身自由罪', kps: [S('k38','拐卖妇女儿童罪',2), S('k39','收买被拐卖妇女儿童罪',1)] },
    ],
  },
  {
    dayNum: 4, date: ds(4), estimatedMin: 40,
    chapters: [
      { id: 'c4a', name: '盗窃罪', kps: [S('k40','数额标准',3), S('k41','多次盗窃',2), S('k42','入户盗窃',2)] },
      { id: 'c4b', name: '诈骗罪系列', kps: [S('k43','诈骗罪要件',3), S('k44','合同诈骗罪',2), S('k45','集资诈骗罪',2)] },
      { id: 'c4c', name: '抢劫与抢夺罪', kps: [S('k46','抢劫罪要件',3), S('k47','转化型抢劫',2), S('k48','抢夺罪',1)] },
      { id: 'c4d', name: '职务侵占系列', kps: [S('k49','职务侵占罪',2), S('k50','挪用资金罪',1)] },
    ],
  },
  {
    dayNum: 5, date: ds(5), estimatedMin: 50,
    chapters: [
      { id: 'c5a', name: '受贿罪', kps: [S('k51','受贿罪要件',3), S('k52','斡旋受贿',3), S('k53','利用影响力受贿',2)] },
      { id: 'c5b', name: '行贿罪系列', kps: [S('k54','行贿罪',2), S('k55','对单位行贿',1), S('k56','介绍贿赂罪',1)] },
      { id: 'c5c', name: '渎职罪', kps: [S('k57','滥用职权罪',2), S('k58','玩忽职守罪',2), S('k59','与受贿罪关系',2)] },
      { id: 'c5d', name: '贪污挪用公款', kps: [S('k60','贪污罪',3), S('k61','挪用公款罪',2), S('k62','两罪界限',2)] },
    ],
  },
  {
    dayNum: 6, date: ds(6), estimatedMin: 35,
    chapters: [
      { id: 'c6a', name: '危险驾驶与交通肇事', kps: [S('k63','醉酒驾车',2), S('k64','交通肇事罪',2), S('k65','肇事逃逸',2)] },
      { id: 'c6b', name: '毒品犯罪', kps: [S('k66','走私贩卖毒品',2), S('k67','非法持有毒品',1)] },
      { id: 'c6c', name: '金融犯罪', kps: [S('k68','贷款诈骗罪',1), S('k69','信用卡诈骗',2), S('k70','洗钱罪',1)] },
    ],
  },
  {
    dayNum: 7, date: ds(7), estimatedMin: 28,
    chapters: [
      { id: 'c7a', name: '妨害司法罪', kps: [S('k71','伪证罪',1), S('k72','妨害作证罪',1), S('k73','帮助毁灭证据罪',1)] },
      { id: 'c7b', name: '扰乱社会秩序罪', kps: [S('k74','聚众斗殴罪',2), S('k75','寻衅滋事罪',2)] },
    ],
  },
];

// ── Chapter card ───────────────────────────────────────────────────────────────

interface ChapterCardProps {
  chapter: Chapter;
  isExpanded: boolean;
  onToggle: () => void;
  onDragStartKP: (kp: KP) => void;
  onDragStartChapter: () => void;
  onMarkKnownKP: (kpId: string) => void;
  onMarkKnownChapter: () => void;
  batchMode: boolean;
  selected: Set<string>;
  onSelectKP: (kpId: string) => void;
  draggingId: string | null;
}

function ChapterCard({
  chapter, isExpanded, onToggle, onDragStartKP, onDragStartChapter,
  onMarkKnownKP, onMarkKnownChapter, batchMode, selected, onSelectKP, draggingId,
}: ChapterCardProps) {
  const isAdjusted = chapter.isAdjusted;
  const allKnown = chapter.kps.every(k => k.known);

  return (
    <div
      draggable={!batchMode}
      onDragStart={(e) => { if (!batchMode) { e.stopPropagation(); onDragStartChapter(); } }}
      style={{
        background: isAdjusted ? '#F0F4FF' : '#FAFAF8',
        border: isAdjusted ? `1.5px dashed ${C.learning}88` : `1.5px solid ${C.bdr}`,
        borderRadius: 10, minWidth: 190, flex: '1 1 190px', maxWidth: 270,
        overflow: 'hidden', opacity: draggingId === chapter.id ? 0.4 : 1,
      }}
    >
      {/* Chapter header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 11px' }}>
        {!batchMode && <GripVertical size={12} color={C.muted} style={{ flexShrink: 0, cursor: 'grab' }} />}
        {isAdjusted && (
          <span style={{ fontSize: 9, fontWeight: 700, color: C.learning,
            background: '#E8EEFF', padding: '1px 5px', borderRadius: 3, flexShrink: 0, letterSpacing: '0.04em' }}>调整</span>
        )}
        <button onClick={onToggle} style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
          cursor: 'pointer', textAlign: 'left', padding: 0, minWidth: 0,
        }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: allKnown ? C.mut : C.ink, flex: 1, lineHeight: 1.3,
            textDecoration: allKnown ? 'line-through' : 'none' }}>
            {chapter.name}
          </span>
          <span style={{ fontSize: 11, color: C.mut, flexShrink: 0, background: C.bdr, padding: '1px 6px', borderRadius: 3 }}>
            {chapter.kps.length}
          </span>
          {isExpanded ? <ChevronDown size={11} color={C.muted} style={{ flexShrink: 0 }} />
            : <ChevronRight size={11} color={C.muted} style={{ flexShrink: 0 }} />}
        </button>
      </div>

      <div style={{ padding: '0 11px 9px' }}>
        {isExpanded ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {chapter.kps.map(kp => (
              <div
                key={kp.id}
                draggable={!batchMode}
                onDragStart={(e) => { if (!batchMode) { e.stopPropagation(); onDragStartKP(kp); } }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '5px 4px', borderRadius: 6,
                  opacity: draggingId === kp.id ? 0.25 : 1,
                  cursor: batchMode ? 'pointer' : 'grab',
                  background: batchMode && selected.has(kp.id) ? '#F1F6FF' : 'transparent',
                }}
                onClick={() => { if (batchMode) onSelectKP(kp.id); }}
              >
                {batchMode ? (
                  <span style={{
                    width: 15, height: 15, borderRadius: 4, flexShrink: 0,
                    border: `1.5px solid ${selected.has(kp.id) ? C.learning : C.muted}`,
                    background: selected.has(kp.id) ? C.learning : '#fff',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {selected.has(kp.id) && <Check size={8} color="#fff" strokeWidth={3} />}
                  </span>
                ) : (
                  <GripVertical size={11} color={C.muted} style={{ flexShrink: 0 }} />
                )}
                <span style={{ fontSize: 12, color: kp.known ? C.mut : C.ink, lineHeight: 1.35, flex: 1,
                  textDecoration: kp.known ? 'line-through' : 'none' }}>
                  {kp.name}
                </span>
                {/* 星级（重要度） */}
                <span style={{ fontSize: 9, color: C.gold, flexShrink: 0, letterSpacing: '-1px' }}>
                  {'★'.repeat(kp.stars)}
                </span>
                {/* 标记已会 */}
                {!batchMode && (
                  <button onClick={(e) => { e.stopPropagation(); onMarkKnownKP(kp.id); }}
                    title="标记我已经会了"
                    style={{
                      fontSize: 10, fontWeight: 600, flexShrink: 0, cursor: 'pointer',
                      padding: '2px 6px', borderRadius: 5, border: 'none',
                      background: kp.known ? C.mastered : C.panel,
                      color: kp.known ? '#fff' : C.sub,
                      display: 'inline-flex', alignItems: 'center', gap: 3,
                    }}>
                    {kp.known ? <Check size={9} strokeWidth={3} /> : null}
                    已会
                  </button>
                )}
              </div>
            ))}
            {!batchMode && (
              <button onClick={onMarkKnownChapter} style={{
                marginTop: 3, alignSelf: 'flex-start', fontSize: 10, color: C.learning,
                background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0',
              }}>
                整章标记已会
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {chapter.kps.slice(0, 3).map(kp => (
              <span key={kp.id} style={{
                fontSize: 10, color: kp.known ? C.mut : C.sub,
                background: C.bdr, padding: '2px 7px', borderRadius: 4, lineHeight: 1.5,
                textDecoration: kp.known ? 'line-through' : 'none',
              }}>
                {kp.name}
              </span>
            ))}
            {chapter.kps.length > 3 && (
              <span style={{ fontSize: 10, color: C.muted, alignSelf: 'center' }}>+{chapter.kps.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────────

export default function PlanFrameworkScreen({ onConfirm, onSkip }: PlanFrameworkScreenProps) {
  const [plan, setPlan] = useState<DayPlan[]>(INITIAL_PLAN);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [collapsedDays, setCollapsedDays] = useState<Set<number>>(
    new Set(INITIAL_PLAN.filter(d => d.dayNum >= FAR_THRESHOLD).map(d => d.dayNum))
  );
  const [drag, setDrag] = useState<DragInfo | null>(null);
  const [dragOverDay, setDragOverDay] = useState<number | null>(null);
  const [movedCount, setMovedCount] = useState(0);

  // 批量「标记已会」
  const [batchMode, setBatchMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // 容量不足态（一页两态）
  const [capacityPanelOpen, setCapacityPanelOpen] = useState(false);
  const [dailyCapMin, setDailyCapMin] = useState(120); // 每日时长滑杆（分钟）
  const [starThreshold, setStarThreshold] = useState<Stars>(1); // ≥ 该星级才学
  const [excludedChapters, setExcludedChapters] = useState<Set<string>>(new Set());

  const totalKPs = plan.reduce((s, d) => s + d.chapters.reduce((a, c) => a + c.kps.length, 0), 0);
  const activeKPs = plan.reduce((s, d) =>
    s + d.chapters.reduce((a, c) => a + c.kps.filter(k => !k.known).length, 0), 0);

  // 反推每日所需时长（分钟）：剩余知识点 × 每点耗时 ÷ 天数
  const dailyNeedMin = Math.round(activeKPs * MIN_PER_KP / plan.length);
  const isCapacityShort = capacityPanelOpen && dailyNeedMin > dailyCapMin;

  // 覆盖率报告（按星级 & 每日上限估算）
  const coverage = useMemo(() => {
    const byStar: Record<Stars, { total: number; kept: number }> = {
      1: { total: 0, kept: 0 }, 2: { total: 0, kept: 0 }, 3: { total: 0, kept: 0 },
    };
    plan.forEach(d => d.chapters.forEach(c => {
      const chExcluded = excludedChapters.has(c.name);
      c.kps.forEach(k => {
        if (k.known) return;
        byStar[k.stars].total += 1;
        const kept = k.stars >= starThreshold && !chExcluded;
        if (kept) byStar[k.stars].kept += 1;
      });
    }));
    const removed = ([1, 2, 3] as Stars[])
      .reduce((a, s) => a + (byStar[s].total - byStar[s].kept), 0);
    const pct = (s: Stars) => byStar[s].total === 0 ? 100 : Math.round(byStar[s].kept / byStar[s].total * 100);
    return { byStar, removed, pct };
  }, [plan, starThreshold, excludedChapters]);

  const allChapterNames = useMemo(() => {
    const set = new Set<string>();
    plan.forEach(d => d.chapters.forEach(c => { if (!c.isAdjusted) set.add(c.name); }));
    return Array.from(set);
  }, [plan]);

  const toggleChapter = (id: string) =>
    setExpandedChapters(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const toggleDay = (num: number) =>
    setCollapsedDays(s => { const n = new Set(s); n.has(num) ? n.delete(num) : n.add(num); return n; });

  // 标记已会（单点 / 整章 / 批量）
  const markKnownKP = (kpId: string) => {
    setPlan(prev => prev.map(day => ({
      ...day,
      chapters: day.chapters.map(c => ({
        ...c, kps: c.kps.map(k => k.id === kpId ? { ...k, known: !k.known } : k),
      })),
    })));
  };
  const markKnownChapter = (chId: string) => {
    setPlan(prev => prev.map(day => ({
      ...day,
      chapters: day.chapters.map(c => c.id === chId
        ? { ...c, kps: c.kps.map(k => ({ ...k, known: true })) } : c),
    })));
  };
  const batchMarkKnown = () => {
    setPlan(prev => prev.map(day => ({
      ...day,
      chapters: day.chapters.map(c => ({
        ...c, kps: c.kps.map(k => selected.has(k.id) ? { ...k, known: true } : k),
      })),
    })));
    setSelected(new Set());
    setBatchMode(false);
  };
  const selectKP = (kpId: string) =>
    setSelected(s => { const n = new Set(s); n.has(kpId) ? n.delete(kpId) : n.add(kpId); return n; });

  const handleDrop = (toDay: number) => {
    if (!drag || drag.fromDay === toDay) { setDrag(null); setDragOverDay(null); return; }

    if (drag.kind === 'chapter') {
      let movedChapter: Chapter | null = null;
      setPlan(prev => prev.map(day => {
        if (day.dayNum === drag.fromDay) {
          const ch = day.chapters.find(c => c.id === drag.id);
          if (ch) movedChapter = ch;
          const remaining = day.chapters.filter(c => c.id !== drag.id);
          const min = remaining.reduce((a, c) => a + c.kps.length * MIN_PER_KP, 10);
          return { ...day, chapters: remaining, estimatedMin: Math.max(10, min) };
        }
        return day;
      }).map(day => {
        if (day.dayNum === toDay && movedChapter) {
          const chapters = [...day.chapters, { ...movedChapter, isAdjusted: true }];
          const min = chapters.reduce((a, c) => a + c.kps.length * MIN_PER_KP, 10);
          return { ...day, chapters, estimatedMin: min };
        }
        return day;
      }));
    } else {
      const newKP: KP = { id: drag.id, name: drag.label, stars: 2 };
      setPlan(prev => prev.map(day => {
        if (day.dayNum === drag.fromDay) {
          const newChapters = day.chapters
            .map(ch => ch.id === drag.fromChapter ? { ...ch, kps: ch.kps.filter(k => k.id !== drag.id) } : ch)
            .filter(ch => ch.kps.length > 0);
          return { ...day, chapters: newChapters, estimatedMin: Math.max(5, day.estimatedMin - MIN_PER_KP) };
        }
        if (day.dayNum === toDay) {
          const adjId = `__adj_day${toDay}`;
          const existing = day.chapters.find(c => c.id === adjId);
          if (existing) {
            return { ...day, estimatedMin: day.estimatedMin + MIN_PER_KP,
              chapters: day.chapters.map(c => c.id === adjId ? { ...c, kps: [...c.kps, newKP] } : c) };
          }
          return { ...day, estimatedMin: day.estimatedMin + MIN_PER_KP,
            chapters: [...day.chapters, { id: adjId, name: '手动调入', kps: [newKP], isAdjusted: true }] };
        }
        return day;
      }));
    }

    setMovedCount(c => c + 1);
    setCollapsedDays(s => { const n = new Set(s); n.delete(toDay); return n; });
    setDrag(null);
    setDragOverDay(null);
  };

  const headerTitle = isCapacityShort
    ? (dailyNeedMin > 480 ? '以现有时间几乎无法完成，强烈建议缩小范围' : '以现在的时间，学不完全部——挑出重点，我帮你排')
    : '你的学习计划已就绪';
  const headerSub = isCapacityShort
    ? '拖动每日时长，看看能覆盖多少；也可按星级或模块挑重点'
    : '我已把知识点按章节安排到每天，可拖拽调整、标记已会，或直接开始';

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.bg, position: 'relative' }}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{
        padding: '18px 28px 14px',
        background: isCapacityShort ? C.overdueBg : '#fff',
        borderBottom: `1px solid ${isCapacityShort ? `${C.overdue}44` : C.bdr}`,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexShrink: 0,
      }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.3px',
            color: isCapacityShort ? C.overdue : C.dark, display: 'flex', alignItems: 'center', gap: 8 }}>
            {isCapacityShort && <AlertTriangle size={18} />}
            {headerTitle}
          </h1>
          <p style={{ fontSize: 13, color: C.sub, margin: 0, lineHeight: 1.5 }}>{headerSub}</p>
        </div>
        <button onClick={onSkip} style={{
          flexShrink: 0, padding: '6px 14px', borderRadius: 8,
          border: `1.5px solid ${C.bdr}`, background: 'transparent',
          fontSize: 13, fontWeight: 500, color: C.sub, cursor: 'pointer', marginTop: 2,
        }}>
          跳过
        </button>
      </div>

      {/* ── Stats strip ────────────────────────────────────────────────────── */}
      <div style={{
        padding: '8px 28px', background: C.panel,
        display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: 12, color: C.sub, fontWeight: 600 }}>
          共 <strong style={{ color: C.ink }}>{plan.length}</strong> 天
        </span>
        <span style={{ color: C.muted, fontSize: 11 }}>·</span>
        <span style={{ fontSize: 12, color: C.sub }}>
          <strong style={{ color: C.ink }}>{activeKPs}</strong> / {totalKPs} 个知识点
        </span>
        <span style={{ color: C.muted, fontSize: 11 }}>·</span>
        <span style={{ fontSize: 12, color: C.sub }}>反推约 {dailyNeedMin}min/天</span>
        {movedCount > 0 && (
          <>
            <span style={{ color: C.muted, fontSize: 11 }}>·</span>
            <span style={{ fontSize: 12, color: C.mastered, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Check size={11} strokeWidth={2.5} /> 已调整 {movedCount} 处
            </span>
          </>
        )}
        <div style={{ flex: 1 }} />
        {/* 批量标记已会入口 */}
        {batchMode ? (
          <button onClick={() => { setBatchMode(false); setSelected(new Set()); }} style={{
            fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 7,
            border: `1.5px solid ${C.learning}`, background: '#fff', color: C.learning, cursor: 'pointer',
          }}>退出多选</button>
        ) : (
          <button onClick={() => setBatchMode(true)} style={{
            fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 7,
            border: `1.5px solid ${C.bdr}`, background: '#fff', color: C.sub, cursor: 'pointer',
          }}>批量标记已会</button>
        )}
        {/* 容量取舍入口 */}
        <button onClick={() => setCapacityPanelOpen(o => !o)} style={{
          fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 7,
          border: `1.5px solid ${capacityPanelOpen ? C.overdue : C.bdr}`, cursor: 'pointer',
          background: capacityPanelOpen ? C.overdueBg : '#fff', color: capacityPanelOpen ? C.overdue : C.sub,
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <SlidersHorizontal size={11} /> 时间不够？取舍
        </button>
      </div>

      {/* ── 容量不足态：取舍面板（每日时长滑杆 + 覆盖率 + 星级/模块筛选） ─────────── */}
      {capacityPanelOpen && (
        <div style={{
          padding: '14px 28px', background: '#fff', borderBottom: `1px solid ${C.bdr}`,
          flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          {/* 每日时长滑杆 */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.ink }}>每日最多学习时长</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: isCapacityShort ? C.overdue : C.mastered }}>
                {(dailyCapMin / 60).toFixed(1)} 小时
              </span>
            </div>
            <input type="range" min={30} max={300} step={15}
              value={dailyCapMin} onChange={e => setDailyCapMin(Number(e.target.value))}
              style={{ width: '100%', accentColor: C.learning }} />
          </div>

          {/* 实时覆盖率报告 */}
          <div style={{
            background: isCapacityShort ? C.overdueBg : C.masteredBg, borderRadius: 10, padding: '10px 12px',
            fontSize: 12, color: C.sub, lineHeight: 1.8,
          }}>
            以每天最多 <strong>{(dailyCapMin / 60).toFixed(1)} 小时</strong>，可覆盖：
            <span style={{ color: C.mastered, fontWeight: 600 }}> {coverage.pct(3)}% 三星</span> /
            <span style={{ color: C.gold, fontWeight: 600 }}> {coverage.pct(2)}% 二星</span> /
            <span style={{ color: C.reviewDue, fontWeight: 600 }}> {coverage.pct(1)}% 一星</span>
            {coverage.removed > 0 && (
              <span style={{ color: C.overdue, fontWeight: 600 }}> · 移出 {coverage.removed} 个知识点</span>
            )}
          </div>

          {/* 筛选维度① 星级阈值 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: C.sub, fontWeight: 600, flexShrink: 0 }}>只学 ≥</span>
            {([1, 2, 3] as Stars[]).map(s => (
              <button key={s} onClick={() => setStarThreshold(s)} style={{
                fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 7, cursor: 'pointer',
                border: `1.5px solid ${starThreshold === s ? C.learning : C.bdr}`,
                background: starThreshold === s ? '#F1F6FF' : '#fff',
                color: starThreshold === s ? C.learning : C.sub,
              }}>
                {'★'.repeat(s)} {s} 星
              </button>
            ))}
          </div>

          {/* 筛选维度② 模块勾选 */}
          <div>
            <span style={{ fontSize: 12, color: C.sub, fontWeight: 600 }}>保留重点模块（取消勾选=移出计划）</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
              {allChapterNames.map(name => {
                const excluded = excludedChapters.has(name);
                return (
                  <button key={name} onClick={() => setExcludedChapters(s => {
                    const n = new Set(s); n.has(name) ? n.delete(name) : n.add(name); return n;
                  })} style={{
                    fontSize: 11, padding: '3px 9px', borderRadius: 14, cursor: 'pointer',
                    border: `1.5px solid ${excluded ? C.bdr : C.mastered}`,
                    background: excluded ? '#fff' : C.masteredBg,
                    color: excluded ? C.muted : C.mastered, fontWeight: 600,
                    textDecoration: excluded ? 'line-through' : 'none',
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                  }}>
                    {!excluded && <Check size={9} strokeWidth={3} />}
                    {name}
                  </button>
                );
              })}
            </div>
          </div>
          <p style={{ fontSize: 11, color: C.mut, margin: 0 }}>
            被筛掉的知识点将移出当前计划（不是删除知识点本身），日后想学可手动重新加入。
          </p>
        </div>
      )}

      {/* ── Scrollable day list ─────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 24px 8px', scrollbarWidth: 'none' }}>
        {plan.map((day) => {
          const dayKPs = day.chapters.reduce((a, c) => a + c.kps.length, 0);
          const isOverloaded = dayKPs > OVERLOAD;
          const isCollapsed = collapsedDays.has(day.dayNum);
          const isDragTarget = drag !== null && dragOverDay === day.dayNum && drag.fromDay !== day.dayNum;

          return (
            <div
              key={day.dayNum}
              style={{ marginBottom: 10 }}
              onDragOver={e => { e.preventDefault(); if (drag) setDragOverDay(day.dayNum); }}
              onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverDay(null); }}
              onDrop={e => { e.preventDefault(); handleDrop(day.dayNum); }}
            >
              {/* Day header row */}
              <div
                onClick={() => toggleDay(day.dayNum)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px',
                  background: isDragTarget ? '#EEF2FF' : C.bdr,
                  borderRadius: isCollapsed ? 10 : '10px 10px 0 0',
                  border: `2px solid ${isDragTarget ? C.learning : 'transparent'}`,
                  cursor: 'pointer', userSelect: 'none', transition: 'background 0.15s, border-color 0.15s',
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 800, color: C.dark, minWidth: 44 }}>Day {day.dayNum}</span>
                <span style={{ fontSize: 12, color: C.mut }}>·</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.sub }}>{day.date}</span>
                <span style={{ fontSize: 12, color: C.muted }}>·</span>
                <span style={{ fontSize: 12, color: C.sub }}>约{day.estimatedMin}min</span>
                <span style={{ fontSize: 12, color: C.muted }}>·</span>
                <span style={{ fontSize: 12, color: C.sub }}>{day.chapters.length} 章节 · {dayKPs} 知识点</span>
                {isOverloaded && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: C.overdue,
                    background: C.overdueBg, padding: '2px 7px', borderRadius: 4, letterSpacing: '0.04em' }}>⚠ 偏多</span>
                )}
                <div style={{ flex: 1 }} />
                {isDragTarget && <span style={{ fontSize: 12, color: C.learning, fontWeight: 600 }}>放在这天</span>}
                {isCollapsed ? <ChevronRight size={13} color={C.muted} /> : <ChevronDown size={13} color={C.muted} />}
              </div>

              {/* Chapter grid */}
              {!isCollapsed && (
                <div style={{
                  background: '#fff', borderRadius: '0 0 10px 10px',
                  border: `2px solid ${isDragTarget ? C.learning : C.bdr}`, borderTop: 'none',
                  padding: '10px 10px', display: 'flex', flexWrap: 'wrap', gap: 8,
                  transition: 'border-color 0.15s',
                }}>
                  {day.chapters.map(ch => (
                    <ChapterCard
                      key={ch.id}
                      chapter={ch}
                      isExpanded={expandedChapters.has(ch.id)}
                      onToggle={() => toggleChapter(ch.id)}
                      onDragStartKP={(kp) => setDrag({ kind: 'kp', id: kp.id, label: kp.name, fromDay: day.dayNum, fromChapter: ch.id })}
                      onDragStartChapter={() => setDrag({ kind: 'chapter', id: ch.id, label: ch.name, fromDay: day.dayNum })}
                      onMarkKnownKP={markKnownKP}
                      onMarkKnownChapter={() => markKnownChapter(ch.id)}
                      batchMode={batchMode}
                      selected={selected}
                      onSelectKP={selectKP}
                      draggingId={drag?.id ?? null}
                    />
                  ))}

                  {drag && drag.fromDay !== day.dayNum && isDragTarget && (
                    <div style={{
                      width: '100%', padding: '8px 12px', background: '#EEF2FF', borderRadius: 8, marginTop: 4,
                      border: `1.5px dashed ${C.learning}88`, fontSize: 12, color: C.learning, fontWeight: 500, textAlign: 'center',
                    }}>
                      松开鼠标，将「{drag.label}」移到 Day {day.dayNum}
                    </div>
                  )}
                </div>
              )}

              {/* Collapsed far-day summary */}
              {isCollapsed && day.dayNum >= FAR_THRESHOLD && (
                <div style={{ marginTop: -2, padding: '0 14px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '8px 0' }}>
                    {day.chapters.map(ch => (
                      <span key={ch.id} style={{ fontSize: 11, color: C.sub, background: C.bdr, padding: '2px 9px', borderRadius: 4 }}>
                        {ch.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {drag && (
          <div style={{
            position: 'sticky', bottom: 12, left: 0, right: 0,
            background: C.dark, color: '#fff', fontSize: 12, fontWeight: 500,
            padding: '9px 16px', borderRadius: 10, textAlign: 'center',
            boxShadow: '0 4px 16px rgba(0,0,0,0.22)', pointerEvents: 'none',
          }}>
            正在移动「{drag.label}」— 拖到目标日期松开
          </div>
        )}

        <div style={{ height: 12 }} />
      </div>

      {/* ── Batch action bar（标记已会） ─────────────────────────────────────── */}
      {batchMode && selected.size > 0 && (
        <div style={{
          position: 'absolute', left: 24, right: 24, bottom: 76, zIndex: 30,
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '11px 16px', borderRadius: 14, background: C.dark,
          boxShadow: '0 8px 24px rgba(0,0,0,0.28)',
        }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>选中 {selected.size} 项</span>
          <div style={{ flex: 1 }} />
          <button onClick={batchMarkKnown} style={{
            fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 8, border: 'none',
            background: C.mastered, color: '#fff', cursor: 'pointer',
          }}>标记已会</button>
          <button onClick={() => setSelected(new Set())} style={{
            fontSize: 12, padding: '6px 12px', borderRadius: 8, border: '1.5px solid rgba(255,255,255,0.3)',
            background: 'transparent', color: 'rgba(255,255,255,0.85)', cursor: 'pointer',
          }}>取消</button>
        </div>
      )}

      {/* ── Bottom CTA ──────────────────────────────────────────────────────── */}
      <div style={{
        padding: '12px 28px', background: '#fff', borderTop: `1px solid ${C.bdr}`,
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, flexShrink: 0,
      }}>
        <button onClick={onSkip} style={{
          padding: '9px 18px', borderRadius: 9, border: `1.5px solid ${C.bdr}`,
          background: 'transparent', fontSize: 13, color: C.sub, cursor: 'pointer', fontWeight: 500,
        }}>
          跳过，直接开始
        </button>
        <button onClick={onConfirm} style={{
          padding: '10px 24px', borderRadius: 9, border: 'none', background: C.dark,
          fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6, letterSpacing: '-0.1px',
        }}>
          {isCapacityShort ? '按当前范围生成' : '确认计划'}
          <span style={{ fontSize: 16, lineHeight: 1 }}>→</span>
        </button>
      </div>
    </div>
  );
}
