import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  ChevronDown, ChevronRight, ChevronLeft, ChevronUp, Play, Star, Check,
  Maximize2,
} from 'lucide-react';

// ── Design tokens (通用设计令牌) ────────────────────────────────────────────────

const C = {
  mastered: '#00A63E', masteredBg: '#F6FEF9',
  learning: '#2D8CFF',
  weak: '#FF6252', weakBg: '#FFEDEB',
  reviewDue: '#8E99B0',
  newGray: '#CCCCCC',
  primary: '#FDEA3B', primarySoft: '#FFF566', gold: '#FDC700',
  ink: '#333333', sub: '#666666', tertiary: '#999999', muted: '#CCCCCC',
  bg: '#F6F6F6', panel: '#F3F4F6', card: '#FFFFFF', border: '#EBEBEB', borderSoft: '#EFEFEF',
  dark: '#1A1D2E', // 深色 CTA / 进度环（令牌允许「主色/深色」作 CTA）
};

// ── Types ─────────────────────────────────────────────────────────────────────

type KPStatus = 'mastered' | 'learning' | 'new';
type ModuleType = 'new' | 'review';
type ModuleStatus = 'not-started' | 'in-progress' | 'completed';
type Importance = 1 | 2 | 3; // 3=高频考点(红) 2=重要(黄) 1=常规(灰)
type ViewMode = 'list' | 'flashcard';
type BubbleId = 'hero-cta' | 'type-new' | 'type-review' | 'module-expand'
  | 'module-start' | 'batch-ops' | 'star-bookmark' | 'priority-bar';

interface KP {
  id: string;
  name: string;
  status: KPStatus;
  importance: Importance;
  mastery: number; // 0-100
}

interface Module {
  id: string;
  type: ModuleType;
  name: string;
  done: number;
  total: number;
  minEst: number;
  status: ModuleStatus;
  daysAgo?: number;
  kps: KP[];
}

interface TodayScreenProps {
  onStartPractice?: () => void;
  onViewResources?: () => void;
  onStartMockExam?: () => void;
  onViewKnowledgeMap?: () => void;
  onViewPlan?: () => void;
  onViewAllSpaces?: () => void;
}

// ── Study spaces (H1 下拉切换用) ────────────────────────────────────────────────

interface StudySpace { id: string; name: string; }
const STUDY_SPACES: StudySpace[] = [
  { id: 'criminal', name: '法考 · 刑法' },
  { id: 'bio', name: 'Biology 101' },
  { id: 'history', name: 'World History' },
];
const CURRENT_SPACE_ID = 'criminal';
const CURRENT_SPACE_TITLE = '刑法';

// ── Quiz (考考你) ────────────────────────────────────────────────────────────

type QuizMode = 'operator' | 'quiz' | 'fallback';

const QUIZ_TEXT = '还记得吗：斡旋受贿罪的行为主体是谁？';
const OPERATOR_CONTENT: { text: string; url?: string } | null = null;

const QUIZ_KP: KP = { id: 'kp-quiz', name: '斡旋受贿罪的行为主体', status: 'mastered', importance: 3, mastery: 100 };
const QUIZ_MODULE_NAME = '受贿罪专题';
const FALLBACK_TEXT = '稳住节奏，离上岸又近一天';

// ── Demo data ─────────────────────────────────────────────────────────────────

const MODULES: Module[] = [
  {
    id: 'bribery', type: 'new',
    name: '受贿罪专题', done: 0, total: 3, minEst: 20, status: 'not-started',
    kps: [
      { id: 'kp-b1', name: '受贿罪主体认定', status: 'new', importance: 3, mastery: 0 },
      { id: 'kp-b2', name: '为他人谋取利益', status: 'new', importance: 2, mastery: 0 },
      { id: 'kp-b3', name: '事后受财的认定', status: 'new', importance: 2, mastery: 0 },
    ],
  },
  {
    id: 'malfeasance', type: 'new',
    name: '渎职罪', done: 3, total: 4, minEst: 18, status: 'in-progress',
    kps: [
      { id: 'kp-m1', name: '渎职罪构成要件', status: 'mastered', importance: 3, mastery: 100 },
      { id: 'kp-m2', name: '与受贿罪的关系', status: 'mastered', importance: 2, mastery: 100 },
      { id: 'kp-m3', name: '滥用职权罪', status: 'learning', importance: 2, mastery: 50 },
      { id: 'kp-m4', name: '玩忽职守罪', status: 'new', importance: 1, mastery: 0 },
    ],
  },
  {
    id: 'embezzlement', type: 'new',
    name: '侵占罪专题', done: 0, total: 1, minEst: 15, status: 'not-started',
    kps: [
      { id: 'kp-e1', name: '侵占罪构成要件', status: 'new', importance: 2, mastery: 0 },
    ],
  },
  {
    id: 'principles', type: 'review',
    name: '刑法基本原则', done: 3, total: 3, minEst: 12, status: 'not-started', daysAgo: 7,
    kps: [
      { id: 'kp-p1', name: '罪刑法定原则', status: 'mastered', importance: 3, mastery: 100 },
      { id: 'kp-p2', name: '平等适用原则', status: 'mastered', importance: 2, mastery: 100 },
      { id: 'kp-p3', name: '罪责刑相适应原则', status: 'mastered', importance: 2, mastery: 100 },
    ],
  },
  {
    id: 'elements', type: 'review',
    name: '犯罪构成要件', done: 0, total: 1, minEst: 8, status: 'not-started', daysAgo: 3,
    kps: [
      { id: 'kp-el1', name: '四要件说', status: 'new', importance: 3, mastery: 0 },
    ],
  },
];

// 全页唯一进度来源（口径锁定）：从模块数据计算，保证 Hero / 副行 / 今日任务三处一致
const TOTAL_KPS = MODULES.reduce((a, m) => a + m.total, 0);
const DONE_KPS = MODULES.reduce((a, m) => a + m.done, 0);
const REMAINING_KPS = TOTAL_KPS - DONE_KPS;

const STREAK = 7;
const STUDIED_MIN = 25;
const DAYS_TO_EXAM = 72;
const PLAN_TOTAL_DAYS = 220; // 72/220 ≈ 32.7% → 中性灰
const IS_COLD_START = false;

const REMAINING_PCT = DAYS_TO_EXAM / PLAN_TOTAL_DAYS;
const examTagColor = REMAINING_PCT > 0.30 ? C.tertiary : REMAINING_PCT > 0.07 ? '#E17100' : C.weak;

const FLASHCARD_ANSWERS: Record<string, string> = {
  'kp-quiz': '斡旋受贿罪的行为主体是国家工作人员，利用本人职权或地位形成的便利条件，通过其他国家工作人员职务行为为请托人谋取不正当利益，索取或收受财物。与一般受贿罪的关键区别在于：行为人本人不直接利用职务便利，而是借助与其他国家工作人员的关系实施。',
  'kp-b1': '受贿罪的主体为国家工作人员，包括在国家机关、国有公司企业事业单位从事公务的人员，以及受委托管理经营国有财产的人员。',
  'kp-b2': '“为他人谋取利益”既包括实际谋取，也包括承诺、着手谋取；只要有承诺即可成立，不以实际实现为必要。',
  'kp-b3': '事后受财：在为请托人谋取利益后收受财物，若事前有约定，成立受贿；无约定的事后收受也可能构成受贿。',
  'kp-m1': '渎职罪以国家机关工作人员为犯罪主体，须利用职务便利，且在主观上可为故意或过失，是身份犯。',
  'kp-m2': '二者均可由国家机关工作人员构成，区别在于渎职罪侵害国家机关正常管理活动，受贿罪侵害职务廉洁性。想象竞合时择一重处断。',
  'kp-m3': '滥用职权罪要求行为人在职权范围内超越权限或违法行使权力，导致公共财产损失或人员伤亡。',
  'kp-m4': '玩忽职守罪表现为不履行或不认真履行职责，属过失犯罪，需造成重大损失方构成犯罪。',
  'kp-e1': '侵占罪的对象是代为保管的他人财物、遗忘物或埋藏物，行为人须“变合法持有为非法所有”且拒不退还。',
  'kp-p1': '罪刑法定原则：法无明文规定不为罪、不处罚，禁止类推解释与事后法。',
  'kp-p2': '平等适用刑法原则：对任何人犯罪，在适用法律上一律平等，不允许任何人有超越法律的特权。',
  'kp-p3': '罪责刑相适应原则：刑罚轻重应与犯罪分子所犯罪行和承担的刑事责任相适应。',
  'kp-el1': '犯罪构成要件通说包括四要件说（主体、主观方面、客体、客观方面）与三阶层说（构成要件符合性、违法性、有责性）。',
};

function heroHeadline(done: number, total: number): string {
  const pct = done / total;
  if (pct >= 1) return '今天全部完成！';
  if (pct >= 0.5) return '今天还差一点！';
  if (pct > 0) return '已经开始了';
  return '今天还没开始';
}

const newModules = MODULES.filter(m => m.type === 'new');
const reviewModules = MODULES.filter(m => m.type === 'review');
const newKPTotal = newModules.reduce((a, m) => a + m.total, 0);
const reviewKPTotal = reviewModules.reduce((a, m) => a + m.total, 0);

const importanceColor = (imp: Importance) => imp === 3 ? C.weak : imp === 2 ? C.gold : C.newGray;
const importanceReason = (imp: Importance) =>
  imp === 3 ? '高频考点 · 近 5 年考 8 次，优先学'
    : imp === 2 ? '重要考点 · 近 5 年考 3 次'
      : '常规考点 · 偶有涉及';

// ── Progress ring ─────────────────────────────────────────────────────────────

function ProgressRing({ pct, size = 108 }: { pct: number; size?: number }) {
  const sw = 8;
  const r = (size - sw * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.max(0, Math.min(1, pct)));
  const c = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={c} cy={c} r={r} fill="none" stroke="#EFEFEF" strokeWidth={sw} />
      <circle cx={c} cy={c} r={r} fill="none"
        stroke={C.dark} strokeWidth={sw}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 0.6s ease' }}
      />
      <text x={c} y={c + 2} textAnchor="middle" fontSize={size > 90 ? 24 : 18} fontWeight={800} fill={C.dark} fontFamily="inherit">
        {Math.round(pct * 100)}%
      </text>
      <text x={c} y={c + (size > 90 ? 20 : 16)} textAnchor="middle" fontSize={10} fill={C.tertiary} fontFamily="inherit">
        今日
      </text>
    </svg>
  );
}

// ── Mastery bar (掌握度横进度条，带数字) ────────────────────────────────────────

function MasteryBar({ status, mastery, full }: { status: KPStatus; mastery: number; full?: boolean }) {
  const label = status === 'mastered' ? '已掌握'
    : status === 'learning' ? `练习中·${mastery}%`
      : '未开始';
  const color = status === 'mastered' ? C.mastered : status === 'learning' ? C.learning : C.newGray;
  const width = status === 'mastered' ? 100 : status === 'learning' ? mastery : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, flex: full ? undefined : 1, width: full ? '100%' : undefined, minWidth: 0 }}>
      <div style={{ flex: 1, height: 5, background: '#EFEFEF', borderRadius: 3, overflow: 'hidden', minWidth: 40 }}>
        <div style={{ height: '100%', width: `${width}%`, background: color, borderRadius: 3, transition: 'width 0.4s ease' }} />
      </div>
      <span style={{ fontSize: 11, color: status === 'new' ? C.tertiary : color, fontWeight: 600, flexShrink: 0, whiteSpace: 'nowrap' }}>
        {label}
      </span>
    </div>
  );
}

// ── Priority color bar (▍ 考试重要度) ──────────────────────────────────────────

function PriorityBar({ imp, onClick, vertical }: { imp: Importance; onClick: (e: React.MouseEvent) => void; vertical?: boolean }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(e); }}
      title="点击查看重要度理由"
      style={{
        width: 4, height: vertical ? 18 : 15, borderRadius: 2, flexShrink: 0,
        background: importanceColor(imp), border: 'none', padding: 0, cursor: 'pointer',
      }}
    />
  );
}

// ── Long-press hook ─────────────────────────────────────────────────────────────

function useLongPress(onLongPress: () => void, ms = 450) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fired = useRef(false);
  const start = useCallback(() => {
    fired.current = false;
    timer.current = setTimeout(() => { fired.current = true; onLongPress(); }, ms);
  }, [onLongPress, ms]);
  const clear = useCallback(() => { if (timer.current) clearTimeout(timer.current); }, []);
  return {
    handlers: {
      onMouseDown: start, onMouseUp: clear, onMouseLeave: clear,
      onTouchStart: start, onTouchEnd: clear,
    },
    firedRef: fired,
  };
}

// ── Floating bubble tip ───────────────────────────────────────────────────────

type TailSide = 'top' | 'bottom' | 'left' | 'right';

interface BubbleTipProps {
  text: string;
  onDismiss: () => void;
  tailSide?: TailSide;
  tailOffset?: string;
  style?: React.CSSProperties;
}

function BubbleTip({ text, onDismiss, tailSide = 'top', tailOffset = '50%', style }: BubbleTipProps) {
  const W = '#FFFFFF';
  const tailMap: Record<TailSide, React.CSSProperties> = {
    top: {
      position: 'absolute', top: -7, left: tailOffset, transform: 'translateX(-50%)',
      width: 0, height: 0,
      borderLeft: '7px solid transparent', borderRight: '7px solid transparent',
      borderBottom: `7px solid ${W}`,
    },
    bottom: {
      position: 'absolute', bottom: -7, left: tailOffset, transform: 'translateX(-50%)',
      width: 0, height: 0,
      borderLeft: '7px solid transparent', borderRight: '7px solid transparent',
      borderTop: `7px solid ${W}`,
    },
    right: {
      position: 'absolute', right: -7, top: tailOffset, transform: 'translateY(-50%)',
      width: 0, height: 0,
      borderTop: '7px solid transparent', borderBottom: '7px solid transparent',
      borderLeft: `7px solid ${W}`,
    },
    left: {
      position: 'absolute', left: -7, top: tailOffset, transform: 'translateY(-50%)',
      width: 0, height: 0,
      borderTop: '7px solid transparent', borderBottom: '7px solid transparent',
      borderRight: `7px solid ${W}`,
    },
  };
  return (
    <div style={{
      position: 'absolute', zIndex: 60,
      filter: 'drop-shadow(0 3px 12px rgba(0,0,0,0.18))',
      pointerEvents: 'auto',
      ...style,
    }}>
      <div style={tailMap[tailSide]} />
      <div style={{
        background: W, borderRadius: 10, padding: '9px 12px 9px 10px',
        display: 'flex', alignItems: 'flex-start', gap: 8,
        minWidth: 200, maxWidth: 268,
      }}>
        <span style={{ fontSize: 14, lineHeight: 1, marginTop: 1, flexShrink: 0 }}>💡</span>
        <span style={{ fontSize: 12, color: C.ink, flex: 1, lineHeight: 1.5 }}>{text}</span>
        <button onClick={(e) => { e.stopPropagation(); onDismiss(); }}
          style={{ color: C.muted, fontSize: 17, cursor: 'pointer', lineHeight: 1,
            flexShrink: 0, marginTop: -1, background: 'none', border: 'none', padding: 0 }}>×</button>
      </div>
    </div>
  );
}

// ── Priority reason popover ─────────────────────────────────────────────────────

function PriorityReasonPopover({ imp, style, onClose }: { imp: Importance; style: React.CSSProperties; onClose: () => void }) {
  return (
    <div
      onClick={(e) => { e.stopPropagation(); onClose(); }}
      style={{
        position: 'absolute', zIndex: 70,
        background: C.card, borderRadius: 8, padding: '7px 11px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.16)', border: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap',
        ...style,
      }}
    >
      <span style={{ width: 4, height: 13, borderRadius: 2, background: importanceColor(imp), flexShrink: 0 }} />
      <span style={{ fontSize: 12, color: C.sub }}>{importanceReason(imp)}</span>
    </div>
  );
}

// ── Full-screen KP preview flashcard overlay (Prompt 1b) ───────────────────────

interface OriginRect { x: number; y: number; w: number; h: number; }

function KPFlashcardOverlay({
  kps, initialIndex, modName, containerRect, originRect, onClose, onStartPractice, onMarkMastered,
}: {
  kps: KP[];
  initialIndex: number;
  modName: string;
  containerRect: OriginRect | null;
  originRect: OriginRect | null;
  onClose: () => void;
  onStartPractice: () => void;
  onMarkMastered: (kp: KP) => void;
}) {
  const [idx, setIdx] = useState(initialIndex);
  const [flipped, setFlipped] = useState(false);
  const [atEnd, setAtEnd] = useState(false);
  const [entered, setEntered] = useState(false);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const kp = kps[idx];
  const answer = FLASHCARD_ANSWERS[kp?.id ?? ''] || '请进入学习模块查看详细解析。';
  const isFirst = idx === 0;
  const isLast = idx === kps.length - 1;

  const goTo = (newIdx: number) => { setIdx(newIdx); setFlipped(false); setAtEnd(false); };
  const handleNext = () => { if (isLast) { setAtEnd(true); return; } goTo(idx + 1); };
  const handlePrev = () => { if (!isFirst) goTo(idx - 1); };

  if (!kp) return null;

  // zoom-from-origin：从被点 tile / 行位置放大出现
  const CARD_W = 480;
  let initialTransform = 'scale(0.96)';
  if (originRect && containerRect) {
    const originCX = originRect.x + originRect.w / 2 - containerRect.x;
    const originCY = originRect.y + originRect.h / 2 - containerRect.y;
    const centerX = containerRect.w / 2;
    const centerY = containerRect.h / 2;
    const dx = originCX - centerX;
    const dy = originCY - centerY;
    const scale = Math.max(0.15, Math.min(1, originRect.w / CARD_W));
    initialTransform = `translate(${dx}px, ${dy}px) scale(${scale})`;
  }

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 120,
      background: 'rgba(10,10,20,0.55)', backdropFilter: 'blur(5px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}
      onClick={onClose}
    >
      {/* Left arrow */}
      <button onClick={(e) => { e.stopPropagation(); handlePrev(); }} disabled={isFirst} style={{
        position: 'absolute', left: 28, top: '50%', transform: 'translateY(-50%)',
        width: 40, height: 40, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.2)',
        background: isFirst ? 'transparent' : 'rgba(255,255,255,0.12)',
        color: isFirst ? 'rgba(255,255,255,0.25)' : '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: isFirst ? 'default' : 'pointer', zIndex: 2,
      }}>
        <ChevronLeft size={18} />
      </button>

      {/* Right arrow */}
      <button onClick={(e) => { e.stopPropagation(); handleNext(); }} style={{
        position: 'absolute', right: 28, top: '50%', transform: 'translateY(-50%)',
        width: 40, height: 40, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.2)',
        background: 'rgba(255,255,255,0.12)', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2,
      }}>
        <ChevronRight size={18} />
      </button>

      {/* Card wrapper — zoom-from-origin */}
      <div
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          if (touchX.current == null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (dx < -40) handleNext(); else if (dx > 40) handlePrev();
          touchX.current = null;
        }}
        style={{
          width: CARD_W, maxWidth: '86%', perspective: 1000,
          transform: entered ? 'none' : initialTransform,
          opacity: entered ? 1 : 0.5,
          transition: 'transform 0.30s cubic-bezier(0.2,0.7,0.3,1), opacity 0.30s ease',
        }}
      >
        {/* Top meta + 关闭 */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 14, padding: '0 2px',
        }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
            {modName} · {idx + 1} / {kps.length}
          </span>
          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: 'rgba(255,255,255,0.15)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0,
          }}>✕</button>
        </div>

        {/* Flip container — 点卡片本体翻面（手势，非按钮） */}
        <div
          onClick={() => setFlipped(f => !f)}
          style={{
            position: 'relative', transformStyle: 'preserve-3d', cursor: 'pointer',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 0.44s ease',
          }}>
          {/* Front */}
          <div style={{
            backfaceVisibility: 'hidden', background: '#fff', borderRadius: 20,
            padding: '34px 34px 26px', minHeight: 240,
            display: 'flex', flexDirection: 'column',
          }}>
            <span style={{ fontSize: 11, color: C.tertiary, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 24 }}>
              知识点 · 正面
            </span>
            <p style={{ fontSize: 21, fontWeight: 700, color: C.dark, lineHeight: 1.5, flex: 1, marginBottom: 20 }}>
              {kp.name}
            </p>
            <p style={{ fontSize: 12, color: C.tertiary, margin: 0, textAlign: 'center' }}>点击翻面看概念</p>
          </div>

          {/* Back — 有且仅有两个动作：练习(实心主按钮) + 右上角弱化小按钮「我已经会了」 */}
          <div style={{
            backfaceVisibility: 'hidden', background: '#fff', borderRadius: 20,
            padding: '34px 34px 26px', minHeight: 240,
            position: 'absolute', top: 0, left: 0, right: 0,
            transform: 'rotateY(180deg)',
            display: 'flex', flexDirection: 'column',
          }}>
            {/* 仅背面·右上角弱化小按钮（幽灵样式，点击后 toast 反馈） */}
            <button
              onClick={(e) => { e.stopPropagation(); onMarkMastered(kp); if (!isLast) goTo(idx + 1); else onClose(); }}
              style={{
                position: 'absolute', top: 12, right: 12,
                fontSize: 11, fontWeight: 600, color: C.tertiary, cursor: 'pointer',
                background: 'transparent', border: `1px solid ${C.borderSoft}`,
                borderRadius: 7, padding: '4px 9px', whiteSpace: 'nowrap',
              }}>
              我已经会了
            </button>
            <span style={{ fontSize: 11, color: C.mastered, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 18, display: 'block' }}>
              知识点 · 背面
            </span>
            <p style={{ fontSize: 14, color: C.ink, lineHeight: 1.7, flex: 1, marginBottom: 20 }}>{answer}</p>
            <button onClick={(e) => { e.stopPropagation(); onClose(); onStartPractice(); }} style={{
              width: '100%', padding: '13px 0', borderRadius: 12, cursor: 'pointer',
              border: 'none', background: C.dark, color: '#fff', fontSize: 14, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            }}>
              <Play size={12} fill="#fff" strokeWidth={0} />
              从这个知识点开始练习
            </button>
          </div>
        </div>

        {atEnd && (
          <div style={{
            marginTop: 14, textAlign: 'center',
            fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 600,
          }}>
            已是本模块最后一张
          </div>
        )}
      </div>
    </div>
  );
}

// ── L3 list row ─────────────────────────────────────────────────────────────

interface KPRowProps {
  kp: KP;
  batchMode: boolean;
  selected: boolean;
  bookmarked: boolean;
  expanded: boolean;
  onTap: () => void;                  // 点行本体：批量=勾选；否则=就地展开概念
  onLongPress: () => void;
  onToggleBookmark: () => void;
  onOpenFullscreen: (rect: OriginRect) => void;
  showStarBubble: boolean;
  onDismissStarBubble: () => void;
  showPriorityBubble: boolean;
  onDismissPriorityBubble: () => void;
}

function KPRow({
  kp, batchMode, selected, bookmarked, expanded,
  onTap, onLongPress, onToggleBookmark, onOpenFullscreen,
  showStarBubble, onDismissStarBubble, showPriorityBubble, onDismissPriorityBubble,
}: KPRowProps) {
  const { handlers, firedRef } = useLongPress(onLongPress);
  const [reason, setReason] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);
  const answer = FLASHCARD_ANSWERS[kp.id];

  return (
    <div style={{ position: 'relative', borderTop: `1px solid ${C.borderSoft}` }}>
      <div
        ref={rowRef}
        {...handlers}
        onClick={() => { if (firedRef.current) return; onTap(); }}
        style={{
          display: 'flex', alignItems: 'center', gap: 9,
          padding: '10px 14px 10px 40px',
          background: selected ? '#F1F6FF' : '#FAFAF8',
          cursor: 'pointer', transition: 'background 0.12s',
        }}
      >
        {batchMode && (
          <button onClick={(e) => { e.stopPropagation(); onTap(); }} style={{
            width: 17, height: 17, borderRadius: 4, flexShrink: 0,
            border: `1.5px solid ${selected ? C.learning : C.muted}`,
            background: selected ? C.learning : '#fff',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {selected && <Check size={9} color="#fff" strokeWidth={3} />}
          </button>
        )}

        {/* 优先级色条 ▍ */}
        <PriorityBar imp={kp.importance} onClick={() => setReason(r => !r)} />

        {/* 知识点名 */}
        <span style={{ fontSize: 13, color: C.ink, flexShrink: 0, lineHeight: 1.4, maxWidth: 150,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {kp.name}
        </span>

        {/* 行内掌握度进度条（吃掉中段空白） */}
        <MasteryBar status={kp.status} mastery={kp.mastery} />

        {/* icon 一簇：收藏星 ☆/★ + 展开 ⤢ */}
        <button onClick={(e) => { e.stopPropagation(); onToggleBookmark(); }} style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: 2,
          flexShrink: 0, display: 'flex', alignItems: 'center',
        }}>
          <Star size={14} strokeWidth={1.5}
            color={bookmarked ? C.gold : C.muted}
            fill={bookmarked ? C.gold : 'none'} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            const r = rowRef.current?.getBoundingClientRect();
            if (r) onOpenFullscreen({ x: r.left, y: r.top, w: r.width, h: r.height });
          }}
          title="全屏预览"
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 2,
            flexShrink: 0, display: 'flex', alignItems: 'center', color: C.tertiary,
          }}>
          <Maximize2 size={13} />
        </button>
      </div>

      {/* 就地展开概念摘要（点知识点本体，非批量态） */}
      {expanded && !batchMode && answer && (
        <div style={{ padding: '2px 16px 12px 46px', background: '#FAFAF8' }}>
          <p style={{ fontSize: 12.5, color: C.sub, lineHeight: 1.65, margin: 0,
            borderLeft: `2px solid ${C.border}`, paddingLeft: 10 }}>
            {answer}
          </p>
        </div>
      )}

      {reason && (
        <PriorityReasonPopover imp={kp.importance} onClose={() => setReason(false)}
          style={{ top: 34, left: 46 }} />
      )}

      {showStarBubble && (
        <BubbleTip
          text="点 ☆ 收藏重点知识点，稍后在 Overview 集中回看"
          onDismiss={onDismissStarBubble}
          tailSide="bottom" tailOffset="80%"
          style={{ bottom: '100%', right: 0, marginBottom: 10 }}
        />
      )}
      {showPriorityBubble && (
        <BubbleTip
          text="彩条=考试重要度，红=高频考点、优先学；点色条看理由"
          onDismiss={onDismissPriorityBubble}
          tailSide="bottom" tailOffset="14%"
          style={{ bottom: '100%', left: 24, marginBottom: 10 }}
        />
      )}
    </div>
  );
}

// ── L3 flashcard tile ─────────────────────────────────────────────────────────

interface KPTileProps {
  kp: KP;
  batchMode: boolean;
  selected: boolean;
  bookmarked: boolean;
  onTap: () => void;                 // 批量=勾选；否则=就地翻卡
  onLongPress: () => void;
  onToggleBookmark: () => void;
  onOpenFullscreen: (rect: OriginRect) => void;
}

function KPTile({ kp, batchMode, selected, bookmarked, onTap, onLongPress, onToggleBookmark, onOpenFullscreen }: KPTileProps) {
  const { handlers, firedRef } = useLongPress(onLongPress);
  const [flipped, setFlipped] = useState(false);
  const [reason, setReason] = useState(false);
  const tileRef = useRef<HTMLDivElement>(null);
  const answer = FLASHCARD_ANSWERS[kp.id] || '进入全屏查看完整概念';

  return (
    <div
      ref={tileRef}
      {...handlers}
      onClick={() => {
        if (firedRef.current) return;
        if (batchMode) onTap();
        else setFlipped(f => !f); // 就地翻卡
      }}
      style={{
        position: 'relative', flex: '1 1 30%', minWidth: 180, maxWidth: '32%',
        aspectRatio: '2 / 1', minHeight: 96,
        background: selected ? '#F1F6FF' : '#fff',
        border: `1.5px solid ${selected ? C.learning : C.border}`,
        borderRadius: 12, padding: '9px 11px',
        display: 'flex', flexDirection: 'column',
        cursor: 'pointer', transition: 'border-color 0.12s, background 0.12s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}
    >
      {/* 顶部：全部可交互 icon 一排 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <PriorityBar imp={kp.importance} onClick={() => setReason(r => !r)} vertical />
        {batchMode && (
          <span style={{
            width: 15, height: 15, borderRadius: 4,
            border: `1.5px solid ${selected ? C.learning : C.muted}`,
            background: selected ? C.learning : '#fff',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            {selected && <Check size={8} color="#fff" strokeWidth={3} />}
          </span>
        )}
        <div style={{ flex: 1 }} />
        <button onClick={(e) => { e.stopPropagation(); onToggleBookmark(); }} style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: 1, display: 'flex',
        }}>
          <Star size={13} strokeWidth={1.5} color={bookmarked ? C.gold : C.muted} fill={bookmarked ? C.gold : 'none'} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            const r = tileRef.current?.getBoundingClientRect();
            if (r) onOpenFullscreen({ x: r.left, y: r.top, w: r.width, h: r.height });
          }}
          title="全屏预览"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 1, display: 'flex', color: C.tertiary }}>
          <Maximize2 size={12} />
        </button>
      </div>

      {/* 中部：知识点名 / 概念，垂直+左右居中 */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '4px 2px', minHeight: 0 }}>
        <span style={{
          fontSize: flipped ? 11.5 : 13, fontWeight: flipped ? 400 : 600,
          color: flipped ? C.sub : C.dark, lineHeight: 1.4,
          display: '-webkit-box', WebkitLineClamp: flipped ? 3 : 2, WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {flipped ? answer : kp.name}
        </span>
      </div>

      {/* 底部：纯展示掌握度横进度条（通栏） */}
      <div style={{ flexShrink: 0 }}>
        <MasteryBar status={kp.status} mastery={kp.mastery} full />
      </div>

      {reason && (
        <PriorityReasonPopover imp={kp.importance} onClose={() => setReason(false)}
          style={{ top: 28, left: 8 }} />
      )}
    </div>
  );
}

// ── Module section (L2 row + L3 list/tiles) ────────────────────────────────────

interface ModuleSectionProps {
  mod: Module;
  viewMode: ViewMode;
  batchMode: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  selected: Set<string>;
  onSelect: (id: string) => void;
  bookmarked: Set<string>;
  onBookmark: (id: string) => void;
  expandedKP: Set<string>;
  onToggleKP: (id: string) => void;
  onOpenFullscreen: (kp: KP, mod: Module, rect: OriginRect) => void;
  onEnterBatch: (kpId: string) => void;
  onStartModule: () => void;
  showExpandBubble: boolean;
  onDismissExpandBubble: () => void;
  showStartBubble: boolean;
  onDismissStartBubble: () => void;
  showBatchBubble: boolean;
  onDismissBatchBubble: () => void;
  showStarBubble: boolean;
  onDismissStarBubble: () => void;
  showPriorityBubble: boolean;
  onDismissPriorityBubble: () => void;
  isLast: boolean;
}

function ModuleSection({
  mod, viewMode, batchMode, isExpanded, onToggle,
  selected, onSelect, bookmarked, onBookmark, expandedKP, onToggleKP,
  onOpenFullscreen, onEnterBatch, onStartModule,
  showExpandBubble, onDismissExpandBubble,
  showStartBubble, onDismissStartBubble,
  showBatchBubble, onDismissBatchBubble,
  showStarBubble, onDismissStarBubble,
  showPriorityBubble, onDismissPriorityBubble,
  isLast,
}: ModuleSectionProps) {
  const btnLabel = mod.type === 'review' ? '开始复习'
    : mod.status === 'in-progress' ? '继续学习' : '开始学习';

  const statusLabel: Record<ModuleStatus, string> = {
    'not-started': '未开始', 'in-progress': '练习中', 'completed': '已完成',
  };
  const statusColor = mod.status === 'in-progress' ? C.learning
    : mod.status === 'completed' ? C.mastered : C.tertiary;

  return (
    <div style={{ position: 'relative', borderBottom: isLast ? 'none' : `1px solid ${C.borderSoft}` }}>
      {/* L2 row */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '12px 14px 12px 12px',
        background: '#fff', gap: 8 }}>
        {/* 独立展开箭头热区 ▸ */}
        <button onClick={onToggle} style={{
          width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'none', border: 'none', cursor: 'pointer', color: '#BBB', flexShrink: 0,
        }}>
          {isExpanded ? <ChevronUp size={14} /> : <ChevronRight size={14} />}
        </button>

        {/* 行主体点击=展开预览 */}
        <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={onToggle}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 3,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {mod.name}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: C.tertiary }}>{mod.done}/{mod.total} 知识点</span>
            <span style={{ fontSize: 11, color: C.muted }}>·</span>
            <span style={{ fontSize: 11, color: C.tertiary }}>约 {mod.minEst}min</span>
            <span style={{ fontSize: 11, color: C.muted }}>·</span>
            {mod.daysAgo != null
              ? <span style={{ fontSize: 11, color: C.reviewDue }}>{mod.daysAgo} 天未复习</span>
              : <span style={{ fontSize: 11, color: statusColor }}>{statusLabel[mod.status]}</span>
            }
          </div>
        </div>

        {/* 右侧显式次级按钮 ▶ */}
        <button onClick={(e) => { e.stopPropagation(); onStartModule(); }} style={{
          display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0,
          padding: '6px 11px', borderRadius: 8, border: 'none', cursor: 'pointer',
          background: C.panel, color: C.ink, fontSize: 11, fontWeight: 600,
        }}>
          <Play size={9} fill={C.ink} strokeWidth={0} />
          {btnLabel}
        </button>
      </div>

      {showExpandBubble && (
        <BubbleTip
          text="点开看这个模块今天学哪些 ▸"
          onDismiss={onDismissExpandBubble}
          tailSide="top" tailOffset="30px"
          style={{ top: '100%', left: 12, marginTop: 8 }}
        />
      )}
      {showStartBubble && (
        <BubbleTip
          text="点击「开始」直接练习该模块，已跳过的会自动略过"
          onDismiss={onDismissStartBubble}
          tailSide="top" tailOffset="88%"
          style={{ top: '100%', right: 12, marginTop: 8 }}
        />
      )}

      {/* L3 expanded */}
      {isExpanded && mod.kps.length > 0 && (
        viewMode === 'list' ? (
          <div style={{ position: 'relative' }}>
            {mod.kps.map((kp, ki) => (
              <KPRow
                key={kp.id}
                kp={kp}
                batchMode={batchMode}
                selected={selected.has(kp.id)}
                bookmarked={bookmarked.has(kp.id)}
                expanded={expandedKP.has(kp.id)}
                onTap={() => { if (batchMode) onSelect(kp.id); else onToggleKP(kp.id); }}
                onLongPress={() => onEnterBatch(kp.id)}
                onToggleBookmark={() => onBookmark(kp.id)}
                onOpenFullscreen={(rect) => onOpenFullscreen(kp, mod, rect)}
                showStarBubble={showStarBubble && ki === 1}
                onDismissStarBubble={onDismissStarBubble}
                showPriorityBubble={showPriorityBubble && ki === 0}
                onDismissPriorityBubble={onDismissPriorityBubble}
              />
            ))}
            {showBatchBubble && (
              <BubbleTip
                text="想批量处理？点「批量」或长按知识点进入多选，可标记已掌握或重置进度"
                onDismiss={onDismissBatchBubble}
                tailSide="top" tailOffset="40px"
                style={{ top: 0, left: 40, marginTop: -4 }}
              />
            )}
          </div>
        ) : (
          <div style={{ position: 'relative', background: '#FAFAF8', padding: '10px 12px',
            display: 'flex', flexWrap: 'wrap', gap: 8, borderTop: `1px solid ${C.borderSoft}` }}>
            {mod.kps.map(kp => (
              <KPTile
                key={kp.id}
                kp={kp}
                batchMode={batchMode}
                selected={selected.has(kp.id)}
                bookmarked={bookmarked.has(kp.id)}
                onTap={() => onSelect(kp.id)}
                onLongPress={() => onEnterBatch(kp.id)}
                onToggleBookmark={() => onBookmark(kp.id)}
                onOpenFullscreen={(rect) => onOpenFullscreen(kp, mod, rect)}
              />
            ))}
            {showBatchBubble && (
              <BubbleTip
                text="想批量处理？点「批量」或长按知识点进入多选，可标记已掌握或重置进度"
                onDismiss={onDismissBatchBubble}
                tailSide="top" tailOffset="40px"
                style={{ top: 0, left: 40, marginTop: -4 }}
              />
            )}
          </div>
        )
      )}
    </div>
  );
}

// ── L1 type header ──────────────────────────────────────────────────────────

function TypeHeader({
  label, blocks, kpTotal, done, expanded, onToggle,
}: { label: string; blocks: number; kpTotal: number; done: number; expanded: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      width: '100%', padding: '11px 16px', border: 'none', cursor: 'pointer',
      background: C.panel, textAlign: 'left', gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {expanded ? <ChevronUp size={13} color={C.sub} /> : <ChevronRight size={13} color={C.sub} />}
        <span style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>{label}</span>
        <span style={{ fontSize: 12, color: C.tertiary }}>{blocks} 块 · {kpTotal} 知识点</span>
      </div>
      <span style={{ fontSize: 11, color: C.muted }}>{done}/{kpTotal}</span>
    </button>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function TodayScreen({
  onStartPractice, onViewResources, onStartMockExam, onViewKnowledgeMap, onViewPlan, onViewAllSpaces,
}: TodayScreenProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  const [spaceMenuOpen, setSpaceMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [batchMode, setBatchMode] = useState(false);

  const [l1Expanded, setL1Expanded] = useState({ new: true, review: true });
  const [l2Expanded, setL2Expanded] = useState<Record<string, boolean>>({ malfeasance: true });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expandedKP, setExpandedKP] = useState<Set<string>>(new Set());
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set(['kp-m1']));
  const [, setMastered] = useState<Set<string>>(new Set());
  const [masteredToast, setMasteredToast] = useState(false);
  const masteredToastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [dismissed, setDismissed] = useState<Set<BubbleId>>(new Set());

  const [flashcard, setFlashcard] = useState<
    { kps: KP[]; idx: number; modName: string; origin: OriginRect | null } | null
  >(null);

  const dismiss = useCallback((id: BubbleId) =>
    setDismissed(s => { const n = new Set(s); n.add(id); return n; }), []);

  const triggerMasteredToast = useCallback(() => {
    setMasteredToast(true);
    if (masteredToastTimer.current) clearTimeout(masteredToastTimer.current);
    masteredToastTimer.current = setTimeout(() => setMasteredToast(false), 2000);
  }, []);

  const anyL2Expanded = Object.values(l2Expanded).some(Boolean);

  const showHeroCTA      = !dismissed.has('hero-cta');
  const showTypeNew      = dismissed.has('hero-cta') && !dismissed.has('type-new');
  const showTypeReview   = dismissed.has('type-new') && !dismissed.has('type-review');
  const showModExpand    = dismissed.has('type-review') && !dismissed.has('module-expand');
  const showModStart     = dismissed.has('module-expand') && !dismissed.has('module-start');
  const showBatchBubble  = dismissed.has('module-start') && !dismissed.has('batch-ops') && anyL2Expanded;
  const showStarBubble   = dismissed.has('batch-ops') && !dismissed.has('star-bookmark') && anyL2Expanded;
  const showPriorityBubble = dismissed.has('star-bookmark') && !dismissed.has('priority-bar') && anyL2Expanded;

  const handleStart = useCallback(() => { dismiss('hero-cta'); onStartPractice?.(); }, [dismiss, onStartPractice]);

  const handleL1Toggle = (type: 'new' | 'review') => {
    setL1Expanded(s => ({ ...s, [type]: !s[type] }));
    if (type === 'new' && showTypeNew) dismiss('type-new');
    if (type === 'review' && showTypeReview) dismiss('type-review');
  };

  const handleL2Toggle = (id: string) => {
    setL2Expanded(s => ({ ...s, [id]: !s[id] }));
    if (showModExpand) dismiss('module-expand');
  };

  const handleSelect = (kpId: string) =>
    setSelected(s => { const n = new Set(s); n.has(kpId) ? n.delete(kpId) : n.add(kpId); return n; });

  const handleToggleKP = (kpId: string) =>
    setExpandedKP(s => { const n = new Set(s); n.has(kpId) ? n.delete(kpId) : n.add(kpId); return n; });

  const handleBookmark = (kpId: string) => {
    setBookmarked(s => { const n = new Set(s); n.has(kpId) ? n.delete(kpId) : n.add(kpId); return n; });
    if (showStarBubble) dismiss('star-bookmark');
  };

  const enterBatch = (kpId: string) => {
    setBatchMode(true);
    setSelected(new Set([kpId]));
  };
  const exitBatch = () => { setBatchMode(false); setSelected(new Set()); setShowResetConfirm(false); };

  const markSelectedMastered = () => {
    setMastered(m => { const n = new Set(m); selected.forEach(id => n.add(id)); return n; });
    exitBatch();
  };

  const containerRect = (): OriginRect | null => {
    const r = rootRef.current?.getBoundingClientRect();
    return r ? { x: r.left, y: r.top, w: r.width, h: r.height } : null;
  };

  const handleOpenFullscreen = useCallback((kp: KP, mod: Module, rect: OriginRect) => {
    const idx = mod.kps.findIndex(k => k.id === kp.id);
    setFlashcard({ kps: mod.kps, idx: Math.max(0, idx), modName: mod.name, origin: rect });
  }, []);

  // 考考你
  const quizMode: QuizMode = OPERATOR_CONTENT ? 'operator' : QUIZ_TEXT ? 'quiz' : 'fallback';
  const quizLabel = quizMode === 'operator' ? '📢' : quizMode === 'quiz' ? '考考你' : null;
  const quizText = quizMode === 'operator' ? OPERATOR_CONTENT!.text
    : quizMode === 'quiz' ? QUIZ_TEXT : FALLBACK_TEXT;
  const handleQuizClick = () => {
    if (quizMode === 'operator' && OPERATOR_CONTENT?.url) window.open(OPERATOR_CONTENT.url, '_blank');
    else if (quizMode === 'quiz') setFlashcard({ kps: [QUIZ_KP], idx: 0, modName: QUIZ_MODULE_NAME, origin: null });
  };
  const isQuizClickable = quizMode === 'operator' || quizMode === 'quiz';

  return (
    <div ref={rootRef} style={{ position: 'relative', height: '100%', overflow: 'hidden', background: C.bg }}>
      <div style={{ height: '100%', overflowY: 'auto', scrollbarWidth: 'none' }}>
        {/* 内容按栅格填满 Main 宽度，不做单列窄居中留白 */}
        <div style={{ padding: '0 24px 96px' }}>

          {/* ⓪ Header ─────────────────────────────────────────────────────────── */}
          <div style={{ paddingTop: 20, paddingBottom: 14 }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
              {/* H1 空间名 — 点文字或箭头都弹下拉 */}
              <button onClick={() => setSpaceMenuOpen(o => !o)} style={{
                display: 'flex', alignItems: 'center', gap: 7, background: 'none', border: 'none',
                cursor: 'pointer', padding: 0,
              }}>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: C.dark, margin: 0, letterSpacing: '-0.4px' }}>
                  {CURRENT_SPACE_TITLE}
                </h1>
                <span style={{
                  display: 'flex', alignItems: 'center', padding: '2px 5px', borderRadius: 6,
                  border: `1.5px solid ${C.border}`, background: 'transparent', color: C.sub,
                }}>
                  <ChevronDown size={13} strokeWidth={2.5}
                    style={{ transform: spaceMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s' }} />
                </span>
              </button>

              {/* 学习空间下拉面板（真弹面板，可切换） */}
              {spaceMenuOpen && (
                <>
                  <div onClick={() => setSpaceMenuOpen(false)}
                    style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, marginTop: 8, zIndex: 41,
                    background: C.card, borderRadius: 12, border: `1px solid ${C.border}`,
                    boxShadow: '0 8px 28px rgba(0,0,0,0.14)', minWidth: 220, padding: 6, overflow: 'hidden',
                  }}>
                    <div style={{ fontSize: 11, color: C.tertiary, padding: '6px 10px 4px', fontWeight: 600 }}>
                      切换学习空间
                    </div>
                    {STUDY_SPACES.map(sp => {
                      const active = sp.id === CURRENT_SPACE_ID;
                      return (
                        <button key={sp.id} onClick={() => setSpaceMenuOpen(false)} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
                          width: '100%', padding: '9px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
                          background: active ? C.masteredBg : 'transparent', textAlign: 'left',
                        }}>
                          <span style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: active ? C.dark : C.ink }}>
                            {sp.name}
                          </span>
                          {active && <Check size={14} color={C.mastered} strokeWidth={3} />}
                        </button>
                      );
                    })}
                    <div style={{ height: 1, background: C.borderSoft, margin: '5px 6px' }} />
                    <button onClick={() => { setSpaceMenuOpen(false); onViewAllSpaces?.(); }} style={{
                      display: 'flex', alignItems: 'center', gap: 6, width: '100%',
                      padding: '9px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
                      background: 'transparent', textAlign: 'left',
                    }}>
                      <span style={{ fontSize: 13, color: C.learning, fontWeight: 600 }}>查看全部学习空间 →</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* 副标题位 = 考考你（整行可点，落到全屏预览闪卡） */}
            <button
              onClick={isQuizClickable ? handleQuizClick : undefined}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                background: 'transparent', border: 'none',
                cursor: isQuizClickable ? 'pointer' : 'default', padding: 0, textAlign: 'left',
              }}
            >
              {quizLabel && (
                <span style={{
                  fontSize: 10, fontWeight: 700, color: C.gold,
                  background: '#FFFBEA', padding: '2px 7px', borderRadius: 4,
                  letterSpacing: '0.04em', flexShrink: 0,
                }}>
                  {quizLabel}
                </span>
              )}
              <span style={{ fontSize: 13, color: C.sub, lineHeight: 1.4, flex: 1 }}>{quizText}</span>
              {isQuizClickable && <ChevronRight size={13} color={C.muted} style={{ flexShrink: 0 }} />}
            </button>
          </div>

          {/* ① Hero card ─────────────────────────────────────────────────────────── */}
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <div style={{ background: '#fff', borderRadius: 16, overflow: 'visible',
              boxShadow: '0 1px 6px rgba(0,0,0,0.07)' }}>
              {IS_COLD_START ? (
                <div style={{ padding: '28px 20px', textAlign: 'center' }}>
                  <p style={{ fontSize: 20, fontWeight: 700, color: C.dark, marginBottom: 8 }}>
                    欢迎来到刑法的第一天
                  </p>
                  <p style={{ fontSize: 14, color: C.tertiary, marginBottom: 24 }}>计划已就绪，从第一个知识点出发</p>
                  <button onClick={handleStart} style={{
                    padding: '13px 36px', borderRadius: 12, border: 'none', cursor: 'pointer',
                    background: C.dark, color: '#fff', fontSize: 15, fontWeight: 700,
                  }}>
                    开始你的第一天 →
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '22px 24px 0' }}>
                    {/* 左·状态区：环形（主角）+ 情绪/动机文案 */}
                    <ProgressRing pct={DONE_KPS / TOTAL_KPS} size={112} />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <button onClick={onViewPlan} style={{
                        fontSize: 21, fontWeight: 800, color: C.dark,
                        margin: '0 0 5px', letterSpacing: '-0.3px', background: 'none',
                        border: 'none', cursor: onViewPlan ? 'pointer' : 'default',
                        padding: 0, textAlign: 'left', display: 'block',
                      }}>
                        {heroHeadline(DONE_KPS, TOTAL_KPS)}
                      </button>
                      {/* 收尾动机文案（可点，进计划概览页 Prompt 1a） */}
                      <button onClick={onViewPlan} style={{
                        fontSize: 13, color: C.sub, background: 'none', border: 'none',
                        cursor: 'pointer', padding: 0, margin: 0,
                        display: 'flex', alignItems: 'center', gap: 3,
                      }}>
                        再 {REMAINING_KPS} 个，今天就能收尾
                        <ChevronRight size={12} color={C.muted} />
                      </button>
                    </div>

                    {/* 右·行动区：CTA（主角）+ 约45min，位于卡片右侧 */}
                    <div style={{ position: 'relative', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <button onClick={handleStart} style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '15px 32px', borderRadius: 12, border: 'none', cursor: 'pointer',
                        background: C.dark, color: '#fff', fontSize: 15, fontWeight: 700,
                      }}>
                        <Play size={14} fill="#fff" strokeWidth={0} />
                        开始今日学习
                      </button>
                      <p style={{ fontSize: 11, color: C.tertiary, margin: '6px 0 0' }}>约 45 min</p>

                      {showHeroCTA && (
                        <BubbleTip
                          text="点这里开始今天的学习"
                          onDismiss={() => dismiss('hero-cta')}
                          tailSide="top" tailOffset="56px"
                          style={{ top: '100%', left: 0, marginTop: 14 }}
                        />
                      )}
                    </div>
                  </div>

                  {/* 三小标：横向铺满卡片底部 */}
                  <div style={{
                    display: 'flex', gap: 8, padding: '14px 24px 16px',
                    borderTop: `1px solid ${C.borderSoft}`, marginTop: 18,
                  }}>
                    <span style={{ flex: 1, textAlign: 'center', fontSize: 12, padding: '5px 11px', borderRadius: 20,
                      background: '#FFF3E0', color: '#B86000' }}>
                      🔥 {STREAK} 天连续
                    </span>
                    <span style={{ flex: 1, textAlign: 'center', fontSize: 12, padding: '5px 11px', borderRadius: 20,
                      background: C.panel, color: C.sub }}>
                      ⏱ 今日已学 {STUDIED_MIN}min
                    </span>
                    <span style={{ flex: 1, textAlign: 'center', fontSize: 12, padding: '5px 11px', borderRadius: 20,
                      background: C.panel, color: examTagColor }}>
                      ⏳ 距考试 {DAYS_TO_EXAM} 天
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ② Today tasks ───────────────────────────────────────────────────────── */}
          <div style={{ position: 'relative' }}>
            <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden',
              boxShadow: '0 1px 6px rgba(0,0,0,0.07)' }}>

              {/* Card title — 左标题 · 中[列表|闪卡]+批量 · 右计数 */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 16px', borderBottom: `1px solid ${C.borderSoft}`, gap: 10,
              }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: C.dark, flexShrink: 0 }}>今日任务</span>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {/* [列表 | 闪卡] 分段切换 —— 作用域仅今日任务 */}
                  <div style={{ display: 'flex', background: C.panel, borderRadius: 8, padding: 2 }}>
                    {(['list', 'flashcard'] as ViewMode[]).map(m => (
                      <button key={m} onClick={() => setViewMode(m)} style={{
                        fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6,
                        border: 'none', cursor: 'pointer',
                        background: viewMode === m ? '#fff' : 'transparent',
                        color: viewMode === m ? C.dark : C.tertiary,
                        boxShadow: viewMode === m ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                      }}>
                        {m === 'list' ? '列表' : '闪卡'}
                      </button>
                    ))}
                  </div>
                  {/* 批量 按钮 */}
                  {batchMode ? (
                    <button onClick={exitBatch} style={{
                      fontSize: 11, fontWeight: 600, padding: '5px 11px', borderRadius: 8,
                      border: `1.5px solid ${C.learning}`, background: '#F1F6FF', color: C.learning, cursor: 'pointer',
                    }}>完成</button>
                  ) : (
                    <button onClick={() => { setBatchMode(true); if (showBatchBubble) dismiss('batch-ops'); }} style={{
                      fontSize: 11, fontWeight: 600, padding: '5px 11px', borderRadius: 8,
                      border: `1.5px solid ${C.border}`, background: '#fff', color: C.sub, cursor: 'pointer',
                    }}>批量</button>
                  )}
                </div>

                <span style={{ fontSize: 12, color: C.tertiary, flexShrink: 0 }}>已处理 {DONE_KPS}/{TOTAL_KPS} 知识点</span>
              </div>

              {/* L1: 新学 */}
              <div style={{ position: 'relative' }}>
                <TypeHeader
                  label="新学" blocks={newModules.length} kpTotal={newKPTotal}
                  done={newModules.reduce((a, m) => a + m.done, 0)}
                  expanded={l1Expanded.new} onToggle={() => handleL1Toggle('new')}
                />
                {showTypeNew && (
                  <BubbleTip
                    text="今天新学的知识点，已按模块分好。"
                    onDismiss={() => dismiss('type-new')}
                    tailSide="top" tailOffset="28%"
                    style={{ top: '100%', left: 16, marginTop: 8 }}
                  />
                )}
              </div>

              {l1Expanded.new && newModules.map((mod, mi) => (
                <ModuleSection
                  key={mod.id}
                  mod={mod}
                  viewMode={viewMode}
                  batchMode={batchMode}
                  isExpanded={!!l2Expanded[mod.id]}
                  onToggle={() => handleL2Toggle(mod.id)}
                  selected={selected}
                  onSelect={handleSelect}
                  bookmarked={bookmarked}
                  onBookmark={handleBookmark}
                  expandedKP={expandedKP}
                  onToggleKP={handleToggleKP}
                  onOpenFullscreen={handleOpenFullscreen}
                  onEnterBatch={enterBatch}
                  onStartModule={() => { dismiss('module-start'); onStartPractice?.(); }}
                  showExpandBubble={showModExpand && mi === 0}
                  onDismissExpandBubble={() => dismiss('module-expand')}
                  showStartBubble={showModStart && mi === 0}
                  onDismissStartBubble={() => dismiss('module-start')}
                  showBatchBubble={showBatchBubble && mi === 1}
                  onDismissBatchBubble={() => dismiss('batch-ops')}
                  showStarBubble={showStarBubble && mi === 1}
                  onDismissStarBubble={() => dismiss('star-bookmark')}
                  showPriorityBubble={showPriorityBubble && mi === 1}
                  onDismissPriorityBubble={() => dismiss('priority-bar')}
                  isLast={mi === newModules.length - 1}
                />
              ))}

              {/* 类型间细分隔线 */}
              <div style={{ height: 1, background: C.border }} />

              {/* L1: 复习 */}
              <div style={{ position: 'relative' }}>
                <TypeHeader
                  label="复习" blocks={reviewModules.length} kpTotal={reviewKPTotal}
                  done={reviewModules.reduce((a, m) => a + m.done, 0)}
                  expanded={l1Expanded.review} onToggle={() => handleL1Toggle('review')}
                />
                {showTypeReview && (
                  <BubbleTip
                    text="学过、到点该回顾的，趁没忘过一遍。"
                    onDismiss={() => dismiss('type-review')}
                    tailSide="top" tailOffset="28%"
                    style={{ top: '100%', left: 16, marginTop: 8 }}
                  />
                )}
              </div>

              {l1Expanded.review && reviewModules.map((mod, mi) => (
                <ModuleSection
                  key={mod.id}
                  mod={mod}
                  viewMode={viewMode}
                  batchMode={batchMode}
                  isExpanded={!!l2Expanded[mod.id]}
                  onToggle={() => handleL2Toggle(mod.id)}
                  selected={selected}
                  onSelect={handleSelect}
                  bookmarked={bookmarked}
                  onBookmark={handleBookmark}
                  expandedKP={expandedKP}
                  onToggleKP={handleToggleKP}
                  onOpenFullscreen={handleOpenFullscreen}
                  onEnterBatch={enterBatch}
                  onStartModule={() => onStartPractice?.()}
                  showExpandBubble={false}
                  onDismissExpandBubble={() => {}}
                  showStartBubble={false}
                  onDismissStartBubble={() => {}}
                  showBatchBubble={false}
                  onDismissBatchBubble={() => {}}
                  showStarBubble={false}
                  onDismissStarBubble={() => {}}
                  showPriorityBubble={false}
                  onDismissPriorityBubble={() => {}}
                  isLast={mi === reviewModules.length - 1}
                />
              ))}

              {/* Footer 查看全部 → */}
              <div style={{ padding: '12px 16px', borderTop: `1px solid ${C.borderSoft}`, textAlign: 'right' }}>
                <button onClick={onViewKnowledgeMap ?? onViewResources} style={{
                  fontSize: 12, color: C.learning, background: 'none', border: 'none',
                  cursor: 'pointer', padding: 0, fontWeight: 600,
                }}>
                  查看全部 →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 批量操作栏 —— 视口悬浮条，钉在底部、tab 栏之上 */}
      {batchMode && selected.size > 0 && (
        <div style={{
          position: 'absolute', left: 16, right: 16, bottom: 16, zIndex: 90,
          display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
          padding: '11px 16px', borderRadius: 14, background: C.dark,
          boxShadow: '0 8px 24px rgba(0,0,0,0.28)',
        }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginRight: 2, fontWeight: 600 }}>
            选中 {selected.size} 项
          </span>
          <div style={{ flex: 1 }} />
          {showResetConfirm ? (
            <>
              <span style={{ fontSize: 12, color: '#FFC9C2' }}>
                重置 {selected.size} 个知识点的学习进度？
              </span>
              <button onClick={exitBatch} style={{
                fontSize: 12, padding: '6px 13px', borderRadius: 8, border: 'none',
                background: C.weak, color: '#fff', cursor: 'pointer', fontWeight: 600,
              }}>确认重置</button>
              <button onClick={() => setShowResetConfirm(false)} style={{
                fontSize: 12, padding: '6px 13px', borderRadius: 8,
                border: '1.5px solid rgba(255,255,255,0.3)', background: 'transparent', color: 'rgba(255,255,255,0.85)', cursor: 'pointer',
              }}>取消</button>
            </>
          ) : (
            <>
              <button onClick={markSelectedMastered} style={{
                fontSize: 12, padding: '6px 13px', borderRadius: 8,
                border: 'none', background: C.mastered, color: '#fff',
                cursor: 'pointer', fontWeight: 600,
              }}>
                我已经会了（标记已掌握）
              </button>
              <button onClick={() => setShowResetConfirm(true)} style={{
                fontSize: 12, padding: '6px 13px', borderRadius: 8,
                border: '1.5px solid rgba(255,255,255,0.3)', background: 'transparent', color: 'rgba(255,255,255,0.85)', cursor: 'pointer',
              }}>
                批量重置进度
              </button>
              <button onClick={exitBatch} style={{
                fontSize: 12, padding: '6px 13px', borderRadius: 8, border: 'none',
                background: 'transparent', color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
              }}>取消</button>
            </>
          )}
        </div>
      )}

      {/* 全屏预览闪卡叠层 */}
      {flashcard && (
        <KPFlashcardOverlay
          kps={flashcard.kps}
          initialIndex={flashcard.idx}
          modName={flashcard.modName}
          containerRect={containerRect()}
          originRect={flashcard.origin}
          onClose={() => setFlashcard(null)}
          onStartPractice={() => { setFlashcard(null); onStartPractice?.(); }}
          onMarkMastered={(kp) => {
            setMastered(m => { const n = new Set(m); n.add(kp.id); return n; });
            triggerMasteredToast();
          }}
        />
      )}

      {/* 标记已掌握 toast */}
      {masteredToast && (
        <div style={{
          position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(26,29,46,0.92)', color: '#fff', fontSize: 13, fontWeight: 600,
          padding: '9px 18px', borderRadius: 10, zIndex: 200, whiteSpace: 'nowrap',
          boxShadow: '0 4px 16px rgba(0,0,0,0.25)', pointerEvents: 'none',
        }}>
          已标记为已掌握
        </div>
      )}
    </div>
  );
}
