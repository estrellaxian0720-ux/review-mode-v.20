// FavoritesScreen.tsx — 我的收藏 (Bookmarks list page)
// Three types: ★ concept / ▤ question / ▤ explanation.
// 展示方式两种：按知识点(默认，分组按计划日期近→远) / 按日期(收藏日期分组头近→远)。
// 条目整行可点 → 列表内就地展开完整收藏文本（不弹预览弹窗）。
// Light / dark dual skin. Unfavorite with one tap (no confirmation).

import React, { useState, useMemo } from 'react';
import {
  ArrowLeft, Star, ChevronRight, ChevronDown,
  FileText, X, Moon, Sun, RotateCcw,
} from 'lucide-react';

// ── Palettes ──────────────────────────────────────────────────────────────────

const LIGHT = {
  bg: '#F6F6F6',
  surface: '#FFFFFF',
  surfaceSub: '#F3F4F6',
  border: '#EBEBEB',
  borderStrong: '#DFE3EA',
  shadow: '0 1px 8px rgba(0,0,0,0.06)',
  shadowMd: '0 4px 24px rgba(0,0,0,0.10)',
  ink: '#333333',
  inkSub: '#666666',
  inkMuted: '#999999',
  primary: '#2D8CFF',      // 链接 / 可点文字 = 主蓝
  primaryLight: '#EAF3FF',
  star: '#FDC700',         // 收藏 ★ 用品牌深金（浅底可读）
  starBg: '#FFFBE6',
  qBlue: '#2D8CFF',        // 题目 = 主蓝
  qBlueBg: '#EAF3FF',
  expPurple: '#7B5EA7',    // 解析 = 紫（第三类区分，非语义状态色）
  expPurpleBg: '#F3EEF8',
  green: '#00A63E',        // mastered 语义绿
  overlay: 'rgba(10,14,30,0.48)',
  groupHeader: '#FAFBFD',
  headerBg: '#FFFFFF',
};

const DARK = {
  bg: '#1B1B1B',
  surface: '#242424',
  surfaceSub: '#1E1E1E',
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.14)',
  shadow: '0 1px 8px rgba(0,0,0,0.35)',
  shadowMd: '0 4px 24px rgba(0,0,0,0.50)',
  ink: '#EDEDED',
  inkSub: '#B5B5B5',
  inkMuted: '#8A8A8A',
  primary: '#2D8CFF',
  primaryLight: 'rgba(45,140,255,0.18)',
  star: '#FDEA3B',         // 暗底上用主黄，保证亮度
  starBg: 'rgba(253,234,59,0.13)',
  qBlue: '#5BA6FF',
  qBlueBg: 'rgba(45,140,255,0.16)',
  expPurple: '#9B7BC4',
  expPurpleBg: 'rgba(123,94,167,0.16)',
  green: '#00A63E',
  overlay: 'rgba(0,0,0,0.65)',
  groupHeader: '#1E1E1E',
  headerBg: '#242424',
};

// ── Types ─────────────────────────────────────────────────────────────────────

type FavType = 'concept' | 'question' | 'explanation';
type FilterMode = FavType | 'all';
// 展示方式（取代旧「排序」概念）：按知识点分组 / 按收藏日期分组
type ViewMode = 'concept' | 'date';

interface FavItem {
  id: string;
  type: FavType;
  conceptId: string;
  conceptName: string;
  chapter: string;
  module: string;
  preview: string;
  questionKind?: string;
  addedAt: Date;
  flashFront?: string;
  flashBack?: string;
  answer?: string;   // 题目条：展开时需要题目+答案
  full?: string;     // 解析/题目条：展开时的完整正文（缺省用 preview）
}

type PreviewState = { item: FavItem } | null;

// 知识点所在学习计划日期 — 「按知识点」展示方式下分组按此日期近→远排序
const CONCEPT_PLAN_DATES: Record<string, Date> = {
  'c-shouhui':   new Date('2026-07-21'),
  'c-ewx':       new Date('2026-07-19'),
  'c-jisui':     new Date('2026-07-16'),
  'c-wanzhi':    new Date('2026-07-12'),
  'c-zhengdang': new Date('2026-07-08'),
  'c-zhongzhi':  new Date('2026-07-02'),
};

const fmtDate = (d: Date) => `${d.getMonth() + 1}月${d.getDate()}日`;

// ── Demo Data ─────────────────────────────────────────────────────────────────

const INITIAL_ITEMS: FavItem[] = [
  {
    id: 'f01', type: 'concept', conceptId: 'c-shouhui', conceptName: '受贿罪构成',
    chapter: '刑法分论', module: '受贿罪专题',
    preview: '受贿罪的主体必须是国家工作人员，客观方面表现为利用职务便利索取或收受他人财物…',
    flashFront: '受贿罪的四个构成要件是什么？',
    flashBack: '①主体：国家工作人员（身份犯）\n②主观：直接故意 + 为他人谋利认识\n③客体：职务行为的廉洁性\n④客观：利用职务便利，索取或收受财物',
    addedAt: new Date('2026-07-10'),
  },
  {
    id: 'f02', type: 'question', conceptId: 'c-shouhui', conceptName: '受贿罪构成',
    chapter: '刑法分论', module: '受贿罪专题', questionKind: '多选',
    preview: '以下哪些属于受贿罪"利用职务便利"的情形？A. 直接利用本人职权 B. 通过第三人职务行为谋利 C. 单纯凭私人情谊 D. 斡旋型受贿',
    answer: '答案：ABD。利用职务便利包括直接利用本人职权（A）、通过第三人职务行为谋利（B）与斡旋型受贿（D）；单纯凭私人情谊（C）不属职务便利。',
    addedAt: new Date('2026-07-09'),
  },
  {
    id: 'f03', type: 'explanation', conceptId: 'c-shouhui', conceptName: '受贿罪构成',
    chapter: '刑法分论', module: '受贿罪专题',
    preview: '「为他人谋取利益」认定分两步：第一步判断是否有谋利承诺（包括明示、默示）；第二步…',
    full: '「为他人谋取利益」认定分两步：第一步判断是否有谋利承诺（包括明示、默示）；第二步判断承诺与收受财物之间是否具有对价关系。承诺即可，不要求利益实现；默示承诺典型如明知请托事项而收受财物。',
    addedAt: new Date('2026-07-08'),
  },
  {
    id: 'f04', type: 'question', conceptId: 'c-ewx', conceptName: '斡旋受贿罪行为主体',
    chapter: '刑法分论', module: '斡旋受贿', questionKind: '单选',
    preview: '斡旋受贿罪的行为主体是谁？A. 任何公民 B. 国家工作人员 C. 有影响力的非公职人员 D. 仅限现职人员',
    answer: '答案：B。斡旋受贿的主体仍是国家工作人员，其特点是利用本人职权或地位形成的便利条件，通过其他国家工作人员的职务行为谋取不正当利益。',
    addedAt: new Date('2026-07-07'),
  },
  {
    id: 'f05', type: 'concept', conceptId: 'c-jisui', conceptName: '受贿罪既遂标准',
    chapter: '刑法分论', module: '受贿罪专题',
    preview: '受贿罪以行为人实际控制财物为既遂，不以钱款到手或请托事项办成为既遂要件…',
    flashFront: '受贿罪既遂的判断标准？',
    flashBack: '以行为人实际取得对财物的控制为既遂。\n不要求：①提取现金 ②请托事项已办成 ③对方确认收讫\n典型：收受存折并掌握密码 → 既遂',
    addedAt: new Date('2026-07-06'),
  },
  {
    id: 'f06', type: 'explanation', conceptId: 'c-jisui', conceptName: '受贿罪既遂标准',
    chapter: '刑法分论', module: '受贿罪专题',
    preview: '取得支票即已控制财物，尚未提现不影响既遂认定。答案B要点：控制财物 ≠ 实际领取现金…',
    full: '取得支票即已控制财物，尚未提现不影响既遂认定。答案B要点：控制财物 ≠ 实际领取现金；只要行为人对财物形成支配力（如掌握存折及密码、收受可兑付票据），即为既遂，后续是否提现、请托事项是否办成均不影响。',
    addedAt: new Date('2026-07-05'),
  },
  {
    id: 'f07', type: 'concept', conceptId: 'c-wanzhi', conceptName: '玩忽职守罪主观要件',
    chapter: '刑法分论', module: '渎职罪专题',
    preview: '玩忽职守罪要求行为人主观上出于过失，故意造成损害的不构成本罪而可能成立故意犯罪…',
    flashFront: '玩忽职守罪的主观方面是什么？',
    flashBack: '过失（过于自信的过失或疏忽大意的过失）。\n若行为人主观故意则不构成玩忽职守，可能成立滥用职权罪（308条）。',
    addedAt: new Date('2026-07-04'),
  },
  {
    id: 'f08', type: 'question', conceptId: 'c-wanzhi', conceptName: '玩忽职守罪主观要件',
    chapter: '刑法分论', module: '渎职罪专题', questionKind: '判断',
    preview: '玩忽职守罪的主观要件可以是故意或过失，二者均能成立。（判断：正确 / 错误）',
    answer: '答案：错误。玩忽职守罪的主观要件只能是过失；若出于故意，则可能成立滥用职权罪等故意犯罪，不构成本罪。',
    addedAt: new Date('2026-07-03'),
  },
  {
    id: 'f09', type: 'concept', conceptId: 'c-zhengdang', conceptName: '正当防卫过当判断',
    chapter: '刑法总论', module: '违法性',
    preview: '超过必要限度的判断以"明显超过"为标准，需综合考量侵害强度、缓急、手段对比等因素…',
    flashFront: '正当防卫过当的认定标准？',
    flashBack: '"明显超过必要限度"：\n①防卫手段相对侵害危险明显不相当\n②造成重大损害（死亡或重伤）\n两个条件须同时满足，缺一不可。',
    addedAt: new Date('2026-07-02'),
  },
  {
    id: 'f10', type: 'question', conceptId: 'c-zhengdang', conceptName: '正当防卫过当判断',
    chapter: '刑法总论', module: '违法性', questionKind: '多选',
    preview: '关于正当防卫，下列说法正确的有？A. 遭受言语威胁可立即动手 B. 防卫过当仍需减轻处罚…',
    full: '关于正当防卫，下列说法正确的有？A. 遭受言语威胁可立即动手 B. 防卫过当仍需减轻或免除处罚 C. 不法侵害必须正在进行 D. 对精神病人的侵害不能防卫',
    answer: '答案：BC。言语威胁不构成正在进行的不法侵害（A错）；对无责任能力人的侵害仍可防卫（D错）。',
    addedAt: new Date('2026-07-01'),
  },
  {
    id: 'f11', type: 'explanation', conceptId: 'c-zhengdang', conceptName: '正当防卫过当判断',
    chapter: '刑法总论', module: '违法性',
    preview: '本题考查防卫过当"明显超过"的判断——强调相当性原则，防卫手段须与侵害危险大体相当…',
    full: '本题考查防卫过当"明显超过"的判断——强调相当性原则，防卫手段须与侵害危险大体相当；同时须造成重大损害（死亡或重伤）才成立防卫过当，两条件缺一不可。',
    addedAt: new Date('2026-06-30'),
  },
  {
    id: 'f12', type: 'concept', conceptId: 'c-zhongzhi', conceptName: '犯罪中止的自动性',
    chapter: '刑法总论', module: '未完成犯罪形态',
    preview: '犯罪中止的自动性要求行为人主观认为能够继续犯罪但主动放弃，出于主观意志而非客观障碍…',
    flashFront: '犯罪中止"自动性"如何理解？',
    flashBack: '"能达目的而不欲"——\n行为人认为自己能够继续犯罪并完成，但出于本人意志（悔悟、同情等）主动停止，而不是因客观障碍被迫中断。',
    addedAt: new Date('2026-06-28'),
  },
];

// ── Subcomponents ─────────────────────────────────────────────────────────────

// Type chip/tag for each item row
function TypeTag({ item, C }: { item: FavItem; C: typeof LIGHT }) {
  const isConc = item.type === 'concept';
  const isQ = item.type === 'question';
  const color = isConc ? C.star : isQ ? C.qBlue : C.expPurple;
  const bg = isConc ? C.starBg : isQ ? C.qBlueBg : C.expPurpleBg;
  const label = isConc ? '知识点' : isQ ? `题目 · ${item.questionKind ?? '单选'}` : '解析';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      fontSize: 10, fontWeight: 600, color, background: bg,
      borderRadius: 5, padding: '2px 7px', whiteSpace: 'nowrap', flexShrink: 0,
    }}>
      {isConc ? <Star size={9} fill={color} color={color} /> : <FileText size={9} color={color} />}
      {label}
    </span>
  );
}

// A single flashcard preview modal
function FlashcardPreview({ item, C: palette, onClose }: { item: FavItem; C: typeof LIGHT; onClose: () => void }) {
  const [flipped, setFlipped] = useState(false);
  const front = item.flashFront ?? item.conceptName;
  const back = item.flashBack ?? item.preview;
  return (
    <div style={{ padding: '0 4px' }}>
      <p style={{ fontSize: 11, color: palette.inkMuted, marginBottom: 12, textAlign: 'center' }}>点击卡片翻面</p>
      <div
        onClick={() => setFlipped(f => !f)}
        style={{ perspective: 800, cursor: 'pointer', marginBottom: 16 }}
      >
        <div style={{
          position: 'relative', height: 160,
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: 'transform 0.4s ease',
        }}>
          {/* Front */}
          <div style={{
            position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            background: palette.primaryLight, border: `2px solid ${palette.primary}30`,
            borderRadius: 14, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', padding: '16px 20px', gap: 8,
          }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: palette.primary, textTransform: 'uppercase', letterSpacing: 1 }}>正面</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: palette.ink, textAlign: 'center', lineHeight: 1.55 }}>{front}</p>
          </div>
          {/* Back */}
          <div style={{
            position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)',
            background: `${palette.green}18`, border: `2px solid ${palette.green}30`,
            borderRadius: 14, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', padding: '16px 20px', gap: 8,
          }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: palette.green, textTransform: 'uppercase', letterSpacing: 1 }}>背面</p>
            <p style={{ fontSize: 13, color: palette.ink, textAlign: 'center', lineHeight: 1.65, whiteSpace: 'pre-line' }}>{back}</p>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
        <button onClick={() => setFlipped(f => !f)} style={{
          display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: palette.primary,
          background: palette.primaryLight, border: 'none', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontWeight: 500,
        }}>
          <RotateCcw size={13} /> 翻面
        </button>
      </div>
    </div>
  );
}

// Generic text preview (question or explanation) — 已不再用于弹窗：条目内容查看一律走列表内就地展开。
// 弹窗仅保留给分组头「→ 知识点」回溯的预览闪卡。

// Preview overlay modal（仅知识点预览闪卡）
function PreviewOverlay({
  preview, C: palette, onClose, onPractice,
}: {
  preview: PreviewState; C: typeof LIGHT; onClose: () => void; onPractice: (conceptId: string) => void;
}) {
  if (!preview) return null;
  const { item } = preview;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: palette.overlay, backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 20px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: palette.surface, borderRadius: 20,
          width: '100%', maxWidth: 420,
          boxShadow: palette.shadowMd, overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 18px 12px', borderBottom: `1px solid ${palette.border}`,
        }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: palette.ink }}>{item.conceptName}</p>
            <p style={{ fontSize: 11, color: palette.inkMuted, marginTop: 2 }}>
              {item.chapter} · {item.module}
            </p>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: palette.inkMuted, padding: 4,
          }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '16px 18px' }}>
          <FlashcardPreview item={item} C={palette} onClose={onClose} />
        </div>

        {/* Footer */}
        <div style={{
          padding: '10px 18px 16px', borderTop: `1px solid ${palette.border}`,
          display: 'flex', justifyContent: 'flex-end', gap: 8,
        }}>
          <button onClick={onClose} style={{
            fontSize: 12, color: palette.inkSub, background: palette.surfaceSub,
            border: 'none', borderRadius: 8, padding: '7px 14px', cursor: 'pointer',
          }}>
            关闭
          </button>
          <button onClick={() => { onPractice(item.conceptId); onClose(); }} style={{
            fontSize: 12, fontWeight: 600, color: '#fff', background: palette.primary,
            border: 'none', borderRadius: 8, padding: '7px 16px', cursor: 'pointer',
          }}>
            去练习
          </button>
        </div>
      </div>
    </div>
  );
}

// ── FavoritesScreen ───────────────────────────────────────────────────────────

interface FavoritesScreenProps {
  onBack: () => void;
  onStartPractice?: (conceptId?: string) => void;
}

export default function FavoritesScreen({ onBack, onStartPractice }: FavoritesScreenProps) {
  const [dark, setDark] = useState(false);
  const [filter, setFilter] = useState<FilterMode>('all');
  const [view, setView] = useState<ViewMode>('concept');
  const [scope, setScope] = useState<string>('all'); // 分类树范围过滤: 'all' | chapter | chapter/module
  const [favIds, setFavIds] = useState<Set<string>>(new Set(INITIAL_ITEMS.map(i => i.id)));
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set()); // 就地展开的条目 id
  const [preview, setPreview] = useState<PreviewState>(null);

  const C = dark ? DARK : LIGHT;
  const FF = "'Inter','Noto Sans SC',system-ui,-apple-system,'PingFang SC','Microsoft YaHei',sans-serif";

  // Active items (only non-removed favorites)
  const activeItems = useMemo(
    () => INITIAL_ITEMS.filter(i => favIds.has(i.id)),
    [favIds],
  );

  // Counts by type
  const counts = useMemo(() => ({
    all: activeItems.length,
    concept: activeItems.filter(i => i.type === 'concept').length,
    question: activeItems.filter(i => i.type === 'question').length,
    explanation: activeItems.filter(i => i.type === 'explanation').length,
  }), [activeItems]);

  // Classification tree (chapter · module) — reuse mind-map structure, spec 行398
  const scopeTree = useMemo(() => {
    const tree = new Map<string, Set<string>>();
    activeItems.forEach(i => {
      if (!tree.has(i.chapter)) tree.set(i.chapter, new Set());
      tree.get(i.chapter)!.add(i.module);
    });
    const opts: { value: string; label: string; depth: number }[] = [{ value: 'all', label: '全部范围', depth: 0 }];
    Array.from(tree.entries()).forEach(([chapter, modules]) => {
      opts.push({ value: chapter, label: chapter, depth: 0 });
      Array.from(modules).forEach(m => opts.push({ value: `${chapter}/${m}`, label: m, depth: 1 }));
    });
    return opts;
  }, [activeItems]);

  const matchesScope = (i: FavItem) => {
    if (scope === 'all') return true;
    if (scope.includes('/')) { const [ch, mo] = scope.split('/'); return i.chapter === ch && i.module === mo; }
    return i.chapter === scope;
  };

  // Filtered + grouped。展示方式两种打组：
  //   按知识点(默认)：分组按知识点计划日期近→远，组内按收藏日期近→远
  //   按日期：收藏日期作分组头近→远，组内按收藏时间近→远
  interface Group {
    key: string;
    kind: ViewMode;
    conceptId?: string;
    conceptName?: string;
    chapter?: string;
    module?: string;
    dateLabel?: string;
    items: FavItem[];
  }

  const groups = useMemo<Group[]>(() => {
    const filtered = activeItems.filter(i => (filter === 'all' || i.type === filter) && matchesScope(i));

    if (view === 'concept') {
      const map = new Map<string, Group>();
      filtered.forEach(item => {
        if (!map.has(item.conceptId)) {
          map.set(item.conceptId, {
            key: item.conceptId, kind: 'concept',
            conceptId: item.conceptId, conceptName: item.conceptName,
            chapter: item.chapter, module: item.module, items: [],
          });
        }
        map.get(item.conceptId)!.items.push(item);
      });
      const result = Array.from(map.values());
      // 分组按知识点所在计划日期近→远
      result.sort((a, b) =>
        (CONCEPT_PLAN_DATES[b.conceptId!]?.getTime() ?? 0) - (CONCEPT_PLAN_DATES[a.conceptId!]?.getTime() ?? 0));
      result.forEach(g => g.items.sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime()));
      return result;
    }

    // 按日期：收藏日期分组头，近→远
    const sorted = [...filtered].sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime());
    const map = new Map<string, Group>();
    sorted.forEach(item => {
      const label = fmtDate(item.addedAt);
      if (!map.has(label)) {
        map.set(label, { key: `d-${label}`, kind: 'date', dateLabel: label, items: [] });
      }
      map.get(label)!.items.push(item);
    });
    return Array.from(map.values());
  }, [activeItems, filter, view, scope]);

  const toggleCollapse = (key: string) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  // 点击条目 = 列表内就地展开 / 再点收起（不弹独立预览弹窗）
  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const unfavorite = (id: string) => {
    setFavIds(prev => { const next = new Set(prev); next.delete(id); return next; });
  };

  // 分组头「→ 知识点」回溯：打开该知识点预览闪卡 (spec 行401)
  const openConceptPreview = (group: { conceptId?: string; conceptName?: string; chapter?: string; module?: string; items: FavItem[] }) => {
    const conceptItem = group.items.find(i => i.type === 'concept');
    if (conceptItem) { setPreview({ item: conceptItem }); return; }
    // 无收藏的知识点条目时，用分组信息合成一张只读闪卡
    setPreview({ item: {
      id: `syn-${group.conceptId}`, type: 'concept', conceptId: group.conceptId ?? '',
      conceptName: group.conceptName ?? '', chapter: group.chapter ?? '', module: group.module ?? '',
      preview: group.conceptName ?? '', addedAt: new Date(),
    } });
  };

  // Filter chip config
  const chips: { mode: FilterMode; label: string; count: number }[] = [
    { mode: 'all', label: '全部', count: counts.all },
    { mode: 'concept', label: '知识点', count: counts.concept },
    { mode: 'question', label: '题目', count: counts.question },
    { mode: 'explanation', label: '解析', count: counts.explanation },
  ];

  return (
    <div style={{
      position: 'relative', height: '100%', background: C.bg,
      fontFamily: FF, display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>

      {/* ── Sticky header ── */}
      <div style={{
        background: C.headerBg, borderBottom: `1px solid ${C.border}`,
        padding: '0 18px', flexShrink: 0, boxShadow: C.shadow,
      }}>
        {/* Title row */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: 52,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={onBack} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: C.inkSub, padding: '4px 4px 4px 0', display: 'flex', alignItems: 'center',
            }}>
              <ArrowLeft size={20} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Star size={16} color={C.star} fill={C.star} />
              <span style={{ fontSize: 17, fontWeight: 700, color: C.ink }}>我的收藏</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              fontSize: 12, color: C.inkMuted,
              background: C.surfaceSub, borderRadius: 20, padding: '3px 10px',
            }}>
              共 {counts.all} 条
            </span>
            <button onClick={() => setDark(d => !d)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: C.inkMuted, padding: 4, display: 'flex', alignItems: 'center',
            }}>
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>

        {/* Filter chips + sort row */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingBottom: 12, gap: 8,
        }}>
          {/* Chips */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'nowrap', overflow: 'auto' }}
            className="[&::-webkit-scrollbar]:hidden">
            {chips.map(chip => {
              const active = filter === chip.mode;
              return (
                <button
                  key={chip.mode}
                  onClick={() => setFilter(chip.mode)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    fontSize: 12, fontWeight: active ? 600 : 400,
                    color: active ? C.primary : C.inkSub,
                    background: active ? C.primaryLight : C.surfaceSub,
                    border: `1.5px solid ${active ? C.primary + '50' : 'transparent'}`,
                    borderRadius: 20, padding: '5px 11px', cursor: 'pointer', whiteSpace: 'nowrap',
                    transition: 'all 0.15s',
                  }}
                >
                  {chip.label}
                  <span style={{
                    fontSize: 10, fontWeight: 600,
                    color: active ? C.primary : C.inkMuted,
                    background: active ? C.primary + '18' : C.border,
                    borderRadius: 10, padding: '1px 5px',
                  }}>
                    {chip.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Scope (classification tree) + Sort toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            {/* 分类树范围过滤 — 复用章节·模块那棵树 (spec 行398) */}
            <select
              value={scope}
              onChange={e => setScope(e.target.value)}
              style={{
                fontSize: 11, color: scope === 'all' ? C.inkSub : C.primary,
                background: scope === 'all' ? C.surfaceSub : C.primaryLight,
                border: `1px solid ${scope === 'all' ? C.border : C.primary + '50'}`,
                borderRadius: 8, padding: '5px 8px', cursor: 'pointer',
                maxWidth: 140, appearance: 'none', WebkitAppearance: 'none',
              }}
            >
              {scopeTree.map(o => (
                <option key={o.value} value={o.value}>
                  {o.depth === 1 ? `　· ${o.label}` : o.label}
                </option>
              ))}
            </select>

            {/* 展示方式切换（取代旧「排序」）：按知识点(默认) / 按日期 */}
            <button
              onClick={() => setView(v => v === 'concept' ? 'date' : 'concept')}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: 11, color: C.inkSub, background: C.surfaceSub,
                border: `1px solid ${C.border}`, borderRadius: 8,
                padding: '5px 10px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >
              {view === 'concept' ? '按知识点' : '按日期'}
              <ChevronDown size={11} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Scrollable list ── */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '10px 0 24px' }}
        className="[&::-webkit-scrollbar]:hidden">

        {/* Empty state */}
        {groups.length === 0 && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '60px 32px', textAlign: 'center', gap: 12,
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: C.starBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Star size={24} color={C.star} />
            </div>
            <p style={{ fontSize: 15, fontWeight: 600, color: C.ink }}>暂无收藏</p>
            <p style={{ fontSize: 13, color: C.inkMuted, lineHeight: 1.7, maxWidth: 260 }}>
              练习时点 ☆ 收藏题目 / 解析，或在知识地图收藏重点知识点，都会汇总到这里
            </p>
          </div>
        )}

        {/* Grouped list */}
        {groups.map((group, gi) => {
          const isCollapsed = collapsed.has(group.key);
          return (
            <div key={group.key} style={{ marginBottom: gi < groups.length - 1 ? 6 : 0 }}>

              {/* Group header — 按知识点：知识点名+路径+→知识点；按日期：收藏日期分组头 */}
              <div
                onClick={() => toggleCollapse(group.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 18px 8px',
                  background: C.groupHeader,
                  borderTop: gi > 0 ? `1px solid ${C.border}` : undefined,
                  cursor: 'pointer',
                }}
              >
                {/* Collapse chevron */}
                <div style={{ color: C.inkMuted, flexShrink: 0 }}>
                  {isCollapsed
                    ? <ChevronRight size={14} />
                    : <ChevronDown size={14} />
                  }
                </div>

                {group.kind === 'concept' ? (
                  <>
                    {/* Concept name + path */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{group.conceptName}</span>
                      <span style={{
                        fontSize: 11, color: C.inkMuted, marginLeft: 8,
                        display: 'inline',
                      }}>
                        {group.chapter} · {group.module} · {group.items.length} 条
                      </span>
                    </div>

                    {/* → 知识点 回溯入口 — 打开该知识点预览闪卡 (spec 行401) */}
                    <button
                      onClick={e => { e.stopPropagation(); openConceptPreview(group); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 3,
                        fontSize: 11, fontWeight: 500, color: C.primary,
                        background: C.primaryLight, border: 'none',
                        borderRadius: 7, padding: '4px 9px', cursor: 'pointer', flexShrink: 0,
                      }}
                    >
                      → 知识点
                    </button>
                  </>
                ) : (
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{group.dateLabel}</span>
                    <span style={{ fontSize: 11, color: C.inkMuted, marginLeft: 8 }}>
                      {group.items.length} 条
                    </span>
                  </div>
                )}
              </div>

              {/* Item rows — 整行可点，点击就地展开/收起完整收藏文本（不弹预览弹窗） */}
              {!isCollapsed && (
                <div style={{ background: C.surface }}>
                  {group.items.map((item, ii) => {
                    const isLast = ii === group.items.length - 1;
                    const isConc = item.type === 'concept';
                    const isQ = item.type === 'question';
                    const isOpen = expanded.has(item.id);
                    const accent = isConc ? C.star : isQ ? C.qBlue : C.expPurple;
                    const accentBg = isConc ? C.starBg : isQ ? C.qBlueBg : C.expPurpleBg;

                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleExpand(item.id)}
                        style={{
                          padding: '10px 18px 10px 36px',
                          borderBottom: isLast ? 'none' : `1px solid ${C.border}`,
                          cursor: 'pointer',
                          background: isOpen ? C.surfaceSub : undefined,
                          transition: 'background 0.15s',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                          {/* Type tag */}
                          <div style={{ paddingTop: 1, flexShrink: 0 }}>
                            <TypeTag item={item} C={C} />
                          </div>

                          {/* Preview text（收起态截断两行；展开态下方另展示完整内容） */}
                          <p style={{
                            flex: 1, fontSize: 12, color: C.inkSub, lineHeight: 1.55,
                            overflow: 'hidden', display: '-webkit-box',
                            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any,
                            minWidth: 0,
                          }}>
                            {item.preview}
                          </p>

                          {/* 收藏日期 — 两种展示方式下每条均展示 */}
                          <span style={{
                            fontSize: 11, color: C.inkMuted, flexShrink: 0, paddingTop: 2,
                            whiteSpace: 'nowrap',
                          }}>
                            {fmtDate(item.addedAt)}
                          </span>

                          {/* Actions：去练习 + ★ 取消收藏 */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                            {/* 去练习 — 每条都带 (spec 行403) */}
                            <button
                              onClick={e => { e.stopPropagation(); onStartPractice?.(item.conceptId); }}
                              style={{
                                fontSize: 11, fontWeight: 500, color: C.inkSub,
                                background: C.surfaceSub, border: `1px solid ${C.border}`,
                                borderRadius: 7, padding: '4px 9px', cursor: 'pointer',
                              }}
                            >
                              去练习
                            </button>

                            {/* Unfavorite */}
                            <button
                              onClick={e => { e.stopPropagation(); unfavorite(item.id); }}
                              title="取消收藏"
                              style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                padding: '4px 3px', display: 'flex', alignItems: 'center',
                                color: C.star,
                              }}
                            >
                              <Star size={14} fill={C.star} color={C.star} />
                            </button>
                          </div>
                        </div>

                        {/* 就地展开：知识点=闪卡正反面；题目=题目+答案；解析=解析正文 */}
                        {isOpen && (
                          <div
                            onClick={e => e.stopPropagation()}
                            style={{
                              marginTop: 8, borderRadius: 10, padding: '11px 13px',
                              background: accentBg, border: `1px solid ${accent}25`,
                              display: 'flex', flexDirection: 'column', gap: 8, cursor: 'default',
                            }}
                          >
                            {isConc ? (
                              <>
                                <div>
                                  <p style={{ fontSize: 10, fontWeight: 700, color: accent, marginBottom: 3, letterSpacing: 0.5 }}>提问</p>
                                  <p style={{ fontSize: 12.5, fontWeight: 600, color: C.ink, lineHeight: 1.6 }}>
                                    {item.flashFront ?? item.conceptName}
                                  </p>
                                </div>
                                <div>
                                  <p style={{ fontSize: 10, fontWeight: 700, color: C.green, marginBottom: 3, letterSpacing: 0.5 }}>概念说明</p>
                                  <p style={{ fontSize: 12.5, color: C.ink, lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                                    {item.flashBack ?? item.preview}
                                  </p>
                                </div>
                              </>
                            ) : isQ ? (
                              <>
                                <div>
                                  <p style={{ fontSize: 10, fontWeight: 700, color: accent, marginBottom: 3, letterSpacing: 0.5 }}>
                                    题目 · {item.questionKind ?? '单选'}
                                  </p>
                                  <p style={{ fontSize: 12.5, color: C.ink, lineHeight: 1.7 }}>
                                    {item.full ?? item.preview}
                                  </p>
                                </div>
                                <div>
                                  <p style={{ fontSize: 10, fontWeight: 700, color: C.green, marginBottom: 3, letterSpacing: 0.5 }}>答案</p>
                                  <p style={{ fontSize: 12.5, color: C.ink, lineHeight: 1.7 }}>
                                    {item.answer ?? '—'}
                                  </p>
                                </div>
                              </>
                            ) : (
                              <div>
                                <p style={{ fontSize: 10, fontWeight: 700, color: accent, marginBottom: 3, letterSpacing: 0.5 }}>解析</p>
                                <p style={{ fontSize: 12.5, color: C.ink, lineHeight: 1.7 }}>
                                  {item.full ?? item.preview}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Bottom spacer */}
        {groups.length > 0 && (
          <p style={{ fontSize: 11, color: C.inkMuted, textAlign: 'center', marginTop: 20 }}>
            共 {counts.all} 条收藏 · 在练习或知识地图中点 ☆ 添加更多
          </p>
        )}
      </div>

      {/* ── Preview overlay ── */}
      <PreviewOverlay
        preview={preview}
        C={C}
        onClose={() => setPreview(null)}
        onPractice={conceptId => { onStartPractice?.(conceptId); }}
      />
    </div>
  );
}
