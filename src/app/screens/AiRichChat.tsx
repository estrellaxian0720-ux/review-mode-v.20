// AiRichChat.tsx
// Rich AI chat: markdown / flashcard / quiz / diagram / image / traceback
// Three surfaces: 'panel' (right 40%) | 'fullscreen' | 'floating' (no quiz/flashcard)

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, ChevronRight, RotateCcw, Maximize2, Minimize2, Check, AlertCircle, GripVertical, BookOpen } from 'lucide-react';
import { CloudMascot } from '../assets/CloudMascot';

// ─── Block Protocol Types ─────────────────────────────────────────────────────

export type QuizKind = 'choice' | 'judgment';
export type DiagramKind = 'compare' | 'tree' | 'flow';
export type ImageSource = 'asset' | 'web' | 'ai_gen';

interface TreeNode { label: string; children?: TreeNode[] }

interface CompareData {
  title: string; columns: string[];
  rows: { label: string; cells: string[] }[];
}
interface TreeData { title: string; root: string; children: TreeNode[] }
interface FlowData {
  title: string;
  steps: { id: string; text: string }[];
  edges: { from: string; to: string }[];
}

export type AiBlock =
  | { type: 'markdown'; md: string }
  | { type: 'flashcard'; conceptId: string; front: string; back: string }
  | { type: 'quiz'; kind: QuizKind; conceptId: string; stem: string;
      options: { key: string; text: string }[]; answer: string; explanation: string;
      traceback?: { conceptId: string; label: string }; userAnswer?: string }
  | { type: 'diagram'; kind: DiagramKind; data: CompareData | TreeData | FlowData }
  | { type: 'image'; src: string; source: ImageSource; caption: string;
      ref?: { book?: string; page?: number; site?: string; url?: string }; disclaimer?: string }
  | { type: 'traceback'; conceptId: string; label: string }

export interface AiMessage {
  role: 'user' | 'assistant';
  blocks: AiBlock[];
  aiGenerated?: boolean;
}

export type ChatSurface = 'panel' | 'fullscreen' | 'floating';

// ─── Demo Data (受贿罪既遂) ────────────────────────────────────────────────────

export const SHOUHUI_DEMO: AiMessage[] = [
  {
    role: 'user',
    blocks: [{ type: 'markdown', md: '受贿罪到底什么时候算既遂？我老是和未遂搞混。' }],
  },
  {
    role: 'assistant',
    aiGenerated: true,
    blocks: [
      { type: 'markdown', md: '好的，我们一步步来。**受贿罪的既遂标准**核心只有一句话：国家工作人员**实际取得对财物的控制**，就既遂了——不要求把钱花掉，也不要求办成事。' },
      {
        type: 'diagram', kind: 'compare',
        data: {
          title: '既遂 vs 未遂',
          columns: ['受贿既遂', '受贿未遂'],
          rows: [
            { label: '判断标准', cells: ['实际控制财物', '因意志以外原因未能控制'] },
            { label: '是否需办成事', cells: ['不需要', '不需要'] },
            { label: '典型情形', cells: ['收款入卡 / 收存折并掌握密码', '钱在途中被截获 / 当场拒收上交'] },
          ],
        } as CompareData,
      },
      { type: 'markdown', md: '我出一道题确认你掌握了 👇' },
      {
        type: 'quiz', kind: 'choice',
        conceptId: 'ch1s7-c-shouhui-jisui',
        stem: '甲收受请托人 50 万元转账支票，尚未到银行提取现金即案发。关于既遂认定，正确的是？',
        options: [
          { key: 'A', text: '未遂，因为现金尚未提取' },
          { key: 'B', text: '既遂，取得支票即已控制财物' },
          { key: 'C', text: '未遂，因为请托事项尚未办成' },
          { key: 'D', text: '不构成受贿罪' },
        ],
        answer: 'B',
        userAnswer: 'A',
        explanation: '收受转账支票，行为人已取得对财物的控制力，是否提现不影响既遂认定；是否办成请托事项也与既遂无关。故选 B。',
        traceback: { conceptId: 'ch1s7-c-shouhui-jisui', label: 'Traceback 看来源' },
      },
      {
        type: 'image', source: 'asset',
        src: 'asset://textbook/shouhui-jisui-flow.png',
        caption: '受贿罪既遂认定流程（教材原图）',
        ref: { book: '刑法分论讲义', page: 142 },
      },
      { type: 'markdown', md: '这张是教材里的认定流程图，配合上面的对比一起记。还想再练一道吗？' },
    ],
  },
  {
    role: 'user',
    blocks: [{ type: 'markdown', md: '再帮我理一下受贿罪整体怎么构成，最好有张图。' }],
  },
  {
    role: 'assistant',
    aiGenerated: true,
    blocks: [
      { type: 'markdown', md: '没问题。受贿罪和其他犯罪一样，按**四要件**拆解最清楚，先看这张体系树：' },
      {
        type: 'diagram', kind: 'tree',
        data: {
          title: '受贿罪构成要件',
          root: '受贿罪',
          children: [
            { label: '主体', children: [{ label: '国家工作人员（身份犯）' }] },
            { label: '主观方面', children: [{ label: '直接故意' }, { label: '为他人谋取利益的认识' }] },
            { label: '客体', children: [{ label: '职务行为的廉洁性' }] },
            { label: '客观方面', children: [{ label: '利用职务便利' }, { label: '收受 / 索取财物' }] },
          ],
        } as TreeData,
      },
      { type: 'markdown', md: '其中「利用职务便利」是最容易考的点，做成一张闪卡帮你随手翻：' },
      {
        type: 'flashcard',
        conceptId: 'ch1s7-c-zhiwu-bianli',
        front: '受贿罪中「利用职务便利」具体指什么？',
        back: '指利用本人职务范围内的权力，或利用职务、地位形成的便利条件，通过第三人职务行为为请托人谋利（后者即斡旋型）。不含单纯的亲友关系、私人影响力。',
      },
      { type: 'markdown', md: '判断一下，确认你分清了 👇' },
      {
        type: 'quiz', kind: 'judgment',
        conceptId: 'ch1s7-c-zhiwu-bianli',
        stem: '国家工作人员仅凭私人感情、未利用任何职务便利为他人办事并收受财物的，构成受贿罪。',
        options: [{ key: 'T', text: '正确' }, { key: 'F', text: '错误' }],
        answer: 'F',
        explanation: '受贿罪以「利用职务便利」为必备客观要件。纯凭私人感情、未利用职务便利的，缺少该要件，不构成受贿罪。',
        traceback: { conceptId: 'ch1s7-c-zhiwu-bianli', label: 'Traceback 看来源' },
      },
      { type: 'markdown', md: '本地教材没有现成的认定步骤图，我按通说帮你画了一张流程示意，**仅供理解、以教材为准**：' },
      {
        type: 'image', source: 'ai_gen',
        src: 'aigen://shouhui-flow-sketch.png',
        caption: '受贿罪认定四步流程（AI 生成示意）',
        disclaimer: '仅供理解，以教材为准',
      },
      {
        type: 'diagram', kind: 'flow',
        data: {
          title: '受贿罪认定步骤',
          steps: [
            { id: 's1', text: '是否为国家工作人员？' },
            { id: 's2', text: '是否利用职务便利？' },
            { id: 's3', text: '是否收受 / 索取财物？' },
            { id: 's4', text: '是否实际控制财物（既遂）？' },
          ],
          edges: [{ from: 's1', to: 's2' }, { from: 's2', to: 's3' }, { from: 's3', to: 's4' }],
        } as FlowData,
      },
      {
        type: 'image', source: 'web',
        src: 'https://example.com/cases/shouhui-jisui-judgment.png',
        caption: '受贿既遂认定参考判例（网络来源）',
        ref: { site: '中国裁判文书网', url: 'https://example.com/cases/shouhui-jisui-judgment' },
      },
    ],
  },
];

// ─── Inline Markdown ──────────────────────────────────────────────────────────

function InlineMd({ text, className = '' }: { text: string; className?: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <span className={className}>
      {parts.map((p, i) => {
        if (p.startsWith('**') && p.endsWith('**'))
          return <strong key={i} className="font-semibold">{p.slice(2, -2)}</strong>;
        if (p.startsWith('`') && p.endsWith('`'))
          return <code key={i} className="bg-black/10 rounded px-1 text-[0.9em] font-mono">{p.slice(1, -1)}</code>;
        return <span key={i}>{p}</span>;
      })}
    </span>
  );
}

function MdBlock({ md, compact = false }: { md: string; compact?: boolean }) {
  const lines = md.split('\n');
  const nodes: React.ReactNode[] = [];
  let listBuf: string[] = [];

  const flushList = (key: string) => {
    if (!listBuf.length) return;
    nodes.push(
      <ul key={key} className="space-y-1 my-1">
        {listBuf.map((item, i) => (
          <li key={i} className="flex gap-2 items-start">
            <span className="text-blue-500 mt-0.5 shrink-0 text-[10px]">▸</span>
            <InlineMd text={item} className="text-[13px] leading-relaxed" />
          </li>
        ))}
      </ul>
    );
    listBuf = [];
  };

  lines.forEach((raw, i) => {
    const line = raw.trim();
    if (!line) { flushList(`l${i}`); return; }
    if (line.startsWith('- ') || line.startsWith('• ')) {
      listBuf.push(line.slice(2));
      return;
    }
    flushList(`l${i}`);
    if (line.startsWith('## ')) {
      nodes.push(<p key={i} className="font-bold text-[14px] text-[#111] mt-1"><InlineMd text={line.slice(3)} /></p>);
    } else if (line.startsWith('### ')) {
      nodes.push(<p key={i} className="font-semibold text-[13px] text-[#222] mt-1"><InlineMd text={line.slice(4)} /></p>);
    } else {
      nodes.push(
        <p key={i} className={`text-[13px] leading-relaxed ${compact ? '' : 'mt-0.5'}`}>
          <InlineMd text={line} />
        </p>
      );
    }
  });
  flushList('last');
  return <div className="space-y-[3px]">{nodes}</div>;
}

// ─── Source Badge ─────────────────────────────────────────────────────────────

function SourceBadge({ source, siteName }: { source: ImageSource; siteName?: string }) {
  if (source === 'asset')
    return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700">教材原图</span>;
  if (source === 'web')
    return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700">网络 · {siteName || '外部来源'}</span>;
  return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-500">AI 生成</span>;
}

// ─── Image Block ──────────────────────────────────────────────────────────────

function ImageBlock({ block }: { block: Extract<AiBlock, { type: 'image' }> }) {
  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50 my-1">
      {/* Placeholder for actual image */}
      <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 h-[120px] flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl mb-1">🖼</div>
          <p className="text-[11px] text-gray-400">{block.caption}</p>
        </div>
        <div className="absolute top-2 right-2">
          <SourceBadge source={block.source} siteName={block.ref?.site} />
        </div>
      </div>
      <div className="px-3 py-2 flex items-center justify-between">
        <p className="text-[11px] text-gray-500">{block.caption}</p>
        {block.ref?.page && (
          <p className="text-[10px] text-gray-400">《{block.ref.book}》第{block.ref.page}页</p>
        )}
      </div>
      {block.source === 'ai_gen' && (
        <p className="px-3 pb-2 text-[10px] text-gray-400">仅供理解，以教材为准</p>
      )}
    </div>
  );
}

// ─── Diagram Blocks ───────────────────────────────────────────────────────────

function DiagramCompare({ data }: { data: CompareData }) {
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden my-1">
      <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
        <p className="text-[11px] font-semibold text-gray-600">{data.title}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[12px] border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-3 py-2 text-left text-gray-400 font-medium w-[90px] border-r border-gray-100"></th>
              {data.columns.map((col, i) => (
                <th key={i} className="px-3 py-2 text-left font-semibold text-gray-700 border-r border-gray-100 last:border-r-0">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, ri) => (
              <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}>
                <td className="px-3 py-2 text-gray-400 font-medium border-r border-gray-100 border-t border-gray-100">{row.label}</td>
                {row.cells.map((cell, ci) => (
                  <td key={ci} className="px-3 py-2 text-gray-700 border-r border-gray-100 border-t border-gray-100 last:border-r-0 leading-relaxed">
                    <InlineMd text={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TreeNodeView({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  return (
    <div className={depth > 0 ? 'ml-4 border-l-2 border-blue-100 pl-3 mt-1' : ''}>
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-medium
        ${depth === 0 ? 'bg-blue-500 text-white' : depth === 1 ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'bg-gray-50 text-gray-700 border border-gray-200'}`}>
        <InlineMd text={node.label} />
      </div>
      {node.children?.map((child, i) => (
        <TreeNodeView key={i} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}

function DiagramTree({ data }: { data: TreeData }) {
  const rootNode: TreeNode = { label: data.root, children: data.children };
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/40 p-3 my-1">
      <p className="text-[11px] font-semibold text-gray-500 mb-2">{data.title}</p>
      <TreeNodeView node={rootNode} />
    </div>
  );
}

function DiagramFlow({ data }: { data: FlowData }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/40 p-3 my-1">
      <p className="text-[11px] font-semibold text-gray-500 mb-2">{data.title}</p>
      <div className="flex flex-col items-center gap-0">
        {data.steps.map((step, i) => (
          <React.Fragment key={step.id}>
            <div className="flex items-center justify-center w-full">
              <div className="bg-white border-2 border-blue-200 rounded-lg px-4 py-2 text-[12px] font-medium text-blue-800 text-center max-w-[260px] w-full shadow-sm">
                <InlineMd text={step.text} />
              </div>
            </div>
            {i < data.steps.length - 1 && (
              <div className="flex flex-col items-center my-0.5">
                <div className="w-0.5 h-3 bg-blue-300" />
                <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-blue-400" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function DiagramBlock({ block }: { block: Extract<AiBlock, { type: 'diagram' }> }) {
  if (block.kind === 'compare') return <DiagramCompare data={block.data as CompareData} />;
  if (block.kind === 'tree') return <DiagramTree data={block.data as TreeData} />;
  if (block.kind === 'flow') return <DiagramFlow data={block.data as FlowData} />;
  return null;
}

// ─── Flashcard Block ──────────────────────────────────────────────────────────

function FlashcardBlock({ block }: { block: Extract<AiBlock, { type: 'flashcard' }> }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className="my-1" style={{ perspective: '800px' }}>
      <div
        onClick={() => setFlipped(f => !f)}
        style={{
          position: 'relative', height: 100,
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: 'transform 0.4s ease',
          cursor: 'pointer',
        }}
      >
        {/* Front */}
        <div style={{
          position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
          className="rounded-xl border-2 border-blue-200 bg-blue-50 flex flex-col items-center justify-center px-4 text-center"
        >
          <p className="text-[10px] text-blue-400 font-semibold mb-1.5 tracking-wide uppercase">点击翻面</p>
          <p className="text-[13px] font-medium text-blue-900 leading-relaxed">
            <InlineMd text={block.front} />
          </p>
        </div>
        {/* Back */}
        <div style={{
          position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)',
        }}
          className="rounded-xl border-2 border-violet-200 bg-violet-50 flex flex-col items-center justify-center px-4 text-center"
        >
          <p className="text-[10px] text-violet-400 font-semibold mb-1.5 tracking-wide uppercase">背面</p>
          <p className="text-[12px] text-violet-900 leading-relaxed">
            <InlineMd text={block.back} />
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Quiz Block ───────────────────────────────────────────────────────────────

function QuizBlock({ block, surface }: { block: Extract<AiBlock, { type: 'quiz' }>; surface: ChatSurface }) {
  const isJudgment = block.kind === 'judgment';
  const initialAnswer = block.userAnswer ?? null;
  const [selected, setSelected] = useState<string | null>(initialAnswer);
  const [submitted, setSubmitted] = useState(!!initialAnswer);

  const correct = submitted && selected === block.answer;
  const wrong = submitted && selected !== block.answer;

  const optionStyle = (key: string) => {
    if (!submitted) {
      return selected === key
        ? 'border-blue-400 bg-blue-50 text-blue-800'
        : 'border-gray-200 bg-white text-gray-700 hover:border-blue-200 hover:bg-blue-50/40';
    }
    if (key === block.answer) return 'border-green-400 bg-green-50 text-green-800';
    if (key === selected && key !== block.answer) return 'border-red-300 bg-red-50 text-red-700';
    return 'border-gray-100 bg-gray-50/60 text-gray-400';
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white my-1 overflow-hidden">
      {/* Stem */}
      <div className="px-4 pt-4 pb-3">
        <p className="text-[13px] text-gray-800 leading-relaxed font-medium">
          <InlineMd text={block.stem} />
        </p>
      </div>

      {/* Options */}
      <div className={`px-4 pb-3 ${isJudgment ? 'flex gap-3' : 'space-y-2'}`}>
        {block.options.map(opt => (
          <button
            key={opt.key}
            disabled={submitted}
            onClick={() => {
              if (submitted) return;
              setSelected(opt.key);
              if (isJudgment) { setSubmitted(true); }
            }}
            className={`transition-all border rounded-lg text-[13px] font-medium
              ${isJudgment ? 'flex-1 py-2.5 text-center' : 'w-full flex items-center gap-3 px-3 py-2.5 text-left'}
              ${optionStyle(opt.key)}`}
          >
            {!isJudgment && (
              <span className={`shrink-0 w-5 h-5 rounded-full border flex items-center justify-center text-[11px] font-bold
                ${submitted && opt.key === block.answer ? 'border-green-500 bg-green-500 text-white' :
                  submitted && opt.key === selected ? 'border-red-400 bg-red-400 text-white' :
                  selected === opt.key ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300 text-gray-400'}`}>
                {opt.key}
              </span>
            )}
            <InlineMd text={opt.text} />
          </button>
        ))}
      </div>

      {/* Submit for choice (not judgment — judgment submits on click) */}
      {!isJudgment && !submitted && selected && (
        <div className="px-4 pb-3">
          <button
            onClick={() => setSubmitted(true)}
            className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white text-[13px] font-semibold rounded-lg transition-colors"
          >
            提交
          </button>
        </div>
      )}

      {/* Result + Explanation */}
      {submitted && (
        <div className={`border-t px-4 py-3 ${correct ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
          <div className="flex items-center gap-2 mb-2">
            {correct
              ? <Check className="w-4 h-4 text-green-600 shrink-0" />
              : <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />}
            <span className={`text-[12px] font-bold ${correct ? 'text-green-700' : 'text-red-600'}`}>
              {correct ? '回答正确' : `正确答案：${block.answer}`}
            </span>
          </div>
          <p className="text-[12px] text-gray-600 leading-relaxed">
            <InlineMd text={block.explanation} />
          </p>
          <div className="flex gap-2 mt-3">
            {block.traceback && (
              <button className="text-[11px] text-blue-500 hover:text-blue-700 font-medium flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                {block.traceback.label}
              </button>
            )}
            <button
              onClick={() => { setSelected(null); setSubmitted(false); }}
              className="text-[11px] text-gray-400 hover:text-gray-600 font-medium flex items-center gap-1 ml-auto"
            >
              <RotateCcw className="w-3 h-3" />
              再来一道
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Traceback Block ──────────────────────────────────────────────────────────

function TracebackBlock({ block }: { block: Extract<AiBlock, { type: 'traceback' }> }) {
  return (
    <button className="flex items-center gap-1.5 text-[12px] text-blue-500 hover:text-blue-700 font-medium my-1 py-1">
      <BookOpen className="w-3.5 h-3.5" />
      {block.label}
      <ChevronRight className="w-3 h-3" />
    </button>
  );
}

// ─── Quiz Downgrade Card (floating surface) ───────────────────────────────────

function QuizDowngradeCard({ onGoPractice }: { onGoPractice?: () => void }) {
  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 my-1 flex items-center justify-between">
      <p className="text-[12px] text-blue-700 font-medium">为你准备了 1 道练习题</p>
      <button
        onClick={onGoPractice}
        className="flex items-center gap-1 text-[12px] text-blue-600 font-semibold hover:text-blue-800"
      >
        去练习 <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Block Renderer (dispatches, handles surface downgrades) ──────────────────

function BlockRenderer({
  block, surface, onGoPractice,
}: {
  block: AiBlock; surface: ChatSurface; onGoPractice?: () => void;
}) {
  if (block.type === 'markdown') return <MdBlock md={block.md} />;

  if (block.type === 'flashcard') {
    if (surface === 'floating') return <QuizDowngradeCard onGoPractice={onGoPractice} />;
    return <FlashcardBlock block={block} />;
  }

  if (block.type === 'quiz') {
    if (surface === 'floating') return <QuizDowngradeCard onGoPractice={onGoPractice} />;
    return <QuizBlock block={block} surface={surface} />;
  }

  if (block.type === 'diagram') return <DiagramBlock block={block} />;
  if (block.type === 'image') return <ImageBlock block={block} />;
  if (block.type === 'traceback') return <TracebackBlock block={block} />;
  return null;
}

// ─── Cloud Avatar ─────────────────────────────────────────────────────────────

function CloudAvatar({ size = 28 }: { size?: number }) {
  return <CloudMascot size={size} className="shrink-0" />;
}

// ─── Message Bubbles ──────────────────────────────────────────────────────────

function AiMessageBubble({
  message, surface, onGoPractice,
}: {
  message: AiMessage; surface: ChatSurface; onGoPractice?: () => void;
}) {
  const maxW = surface === 'fullscreen' ? 'max-w-[82%]' : 'max-w-[90%]';
  return (
    <div className="flex items-start gap-2.5">
      <CloudAvatar />
      <div className={`${maxW} flex flex-col gap-1.5`}>
        <div className="bg-white rounded-2xl rounded-tl-sm border border-gray-200 shadow-sm px-4 py-3 space-y-2">
          {message.blocks.map((block, i) => (
            <BlockRenderer key={i} block={block} surface={surface} onGoPractice={onGoPractice} />
          ))}
        </div>
        {message.aiGenerated && (
          <p className="text-[10px] text-gray-400 pl-1">部分内容由 AI 生成</p>
        )}
      </div>
    </div>
  );
}

function UserMessageBubble({ message }: { message: AiMessage }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[72%] bg-blue-500 text-white rounded-2xl rounded-tr-sm px-4 py-3">
        {message.blocks.map((block, i) =>
          block.type === 'markdown'
            ? <MdBlock key={i} md={block.md} compact />
            : null
        )}
      </div>
    </div>
  );
}

// ─── Chat Thread ──────────────────────────────────────────────────────────────

export function AiChatThread({
  messages, surface, onGoPractice,
}: {
  messages: AiMessage[]; surface: ChatSurface; onGoPractice?: () => void;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center px-6 py-8 text-center">
        <div className="mb-5"><CloudAvatar size={64} /></div>
        <p className="text-[17px] font-bold text-gray-700 mb-2">AI 助教准备好了</p>
        <p className="text-[13px] leading-relaxed text-gray-400 max-w-[260px] mb-6">
          选择一个答案即可获得即时反馈，也可以在下方随时向我提问。
        </p>
        <div className="w-full max-w-[300px] space-y-2.5">
          <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-left text-[12.5px] leading-relaxed text-gray-500">
            <span className="mr-1">💡</span><span className="font-semibold text-gray-700">提示：</span>用「溯源」可以看到知识点在资料中的出处
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-left text-[12.5px] leading-relaxed text-gray-500">
            <span className="mr-1">🎯</span><span className="font-semibold text-gray-700">重点：</span>反复出错的题会在后续复习里优先出现
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      {messages.map((msg, i) =>
        msg.role === 'user'
          ? <UserMessageBubble key={i} message={msg} />
          : <AiMessageBubble key={i} message={msg} surface={surface} onGoPractice={onGoPractice} />
      )}
      <div ref={bottomRef} />
    </div>
  );
}

// ─── Chat Input Bar ───────────────────────────────────────────────────────────

const QUICK_CHIPS = ['解释步骤', '这考什么概念', '出一道类似题'];

export function AiChatInput({
  onSend, placeholder = '随时追问…', compact = false,
}: {
  onSend: (text: string) => void;
  placeholder?: string;
  compact?: boolean;
}) {
  const [val, setVal] = useState('');

  const send = () => {
    const t = val.trim();
    if (!t) return;
    onSend(t);
    setVal('');
  };

  return (
    <div className={`border-t border-gray-200 bg-white ${compact ? 'p-3' : 'p-4'}`}>
      {/* Quick chips */}
      <div className="flex gap-2 mb-2.5 overflow-x-auto pb-0.5">
        {QUICK_CHIPS.map(chip => (
          <button
            key={chip}
            onClick={() => onSend(chip)}
            className="shrink-0 px-3 py-1 bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-500 rounded-full text-[11px] font-medium transition-colors"
          >
            {chip}
          </button>
        ))}
      </div>
      {/* Input row */}
      <div className="flex items-center gap-2">
        <input
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-gray-50 transition-all"
        />
        <button
          onClick={send}
          disabled={!val.trim()}
          className="p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 text-white rounded-xl transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Right Panel (embedded in PracticeScreen 40% col) ────────────────────────

export interface AiPanelProps {
  messages: AiMessage[];
  onSend: (text: string) => void;
  onPopOut?: () => void;
  onGoPractice?: () => void;
}

export function AiChatPanel({ messages, onSend, onPopOut, onGoPractice }: AiPanelProps) {
  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <CloudAvatar size={22} />
          <span className="text-[13px] font-semibold text-gray-700">AI 助教</span>
        </div>
        {onPopOut && (
          <button
            onClick={onPopOut}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="全屏展开"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <AiChatThread messages={messages} surface="panel" onGoPractice={onGoPractice} />
      <AiChatInput onSend={onSend} />
    </div>
  );
}

// ─── Fullscreen Overlay ───────────────────────────────────────────────────────

export type FullscreenMode = 'voluntary' | 'forced_20';

export interface AiFullscreenProps {
  mode: FullscreenMode;
  conceptName: string;
  messages: AiMessage[];
  onSend: (text: string) => void;
  onClose?: () => void;   // voluntary only
  onSkip?: () => void;    // forced_20: 先跳过
  onStart?: () => void;   // forced_20: 开始强化学习
  started?: boolean;      // forced_20: has user chosen to start
  exitQuiz?: { stem: string; options: { key: string; text: string }[]; answer: string }[];
  onGoPractice?: () => void;
}

export function AiFullscreenOverlay({
  mode, conceptName, messages, onSend,
  onClose, onSkip, onStart, started = false, exitQuiz, onGoPractice,
}: AiFullscreenProps) {
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<number, boolean>>({});
  const allPassed = exitQuiz
    ? exitQuiz.every((q, i) => quizSubmitted[i] && quizAnswers[i] === q.answer)
    : false;

  return (
    <div className="fixed inset-0 z-50 bg-[#F4F6FA] flex flex-col">
      {/* Top bar */}
      <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <CloudAvatar size={30} />
          <div>
            <p className="text-[13px] font-bold text-gray-800">
              {mode === 'voluntary' ? `${conceptName} · 深度学习` : '这个知识点已经反复出错'}
            </p>
            {mode === 'forced_20' && (
              <p className="text-[11px] text-red-500 font-medium">今日已累计答错 20 次</p>
            )}
          </div>
        </div>
        {mode === 'voluntary' && (
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center">
        <div className="w-full max-w-[720px] flex flex-col h-full">
          {/* Forced 20: choice screen before starting */}
          {mode === 'forced_20' && !started && (
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
              <div className="mb-6"><CloudAvatar size={56} /></div>
              <h2 className="text-[20px] font-bold text-gray-800 mb-2">{conceptName}</h2>
              <p className="text-[14px] text-gray-500 mb-8 max-w-[380px]">
                这个知识点今天已经累计答错 20 次。花 5 分钟让 AI 帮你彻底讲清楚，还是先跳过？
              </p>
              <div className="flex gap-4">
                <button
                  onClick={onSkip}
                  className="px-6 py-3 border border-gray-300 rounded-xl text-[14px] font-medium text-gray-600 hover:border-gray-400 hover:bg-gray-50 transition-all"
                >
                  先跳过
                </button>
                <button
                  onClick={onStart}
                  className="px-8 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl text-[14px] font-bold text-white transition-all shadow-md"
                >
                  开始强化学习
                </button>
              </div>
            </div>
          )}

          {/* Chat thread (voluntary always; forced after started) */}
          {(mode === 'voluntary' || (mode === 'forced_20' && started)) && (
            <div className="flex flex-col flex-1 pb-4">
              <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-12">
                    <div className="inline-block mb-4"><CloudAvatar size={48} /></div>
                    <p className="text-[14px] text-gray-500">准备好了，问我任何关于「{conceptName}」的问题吧</p>
                  </div>
                )}
                {messages.map((msg, i) =>
                  msg.role === 'user'
                    ? <UserMessageBubble key={i} message={msg} />
                    : <AiMessageBubble key={i} message={msg} surface="fullscreen" onGoPractice={onGoPractice} />
                )}

                {/* Exit quiz (forced_20 after conversation) */}
                {mode === 'forced_20' && messages.length > 0 && exitQuiz && !allPassed && (
                  <div className="mt-4 p-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
                    <p className="text-[13px] font-semibold text-gray-700 mb-3">完成 2 道小测，确认掌握：</p>
                    {exitQuiz.map((q, qi) => (
                      <div key={qi} className="mb-3 last:mb-0">
                        <p className="text-[13px] text-gray-800 font-medium mb-2"><InlineMd text={q.stem} /></p>
                        <div className="flex gap-2">
                          {q.options.map(opt => (
                            <button
                              key={opt.key}
                              disabled={!!quizSubmitted[qi]}
                              onClick={() => {
                                setQuizAnswers(a => ({ ...a, [qi]: opt.key }));
                                setQuizSubmitted(s => ({ ...s, [qi]: true }));
                              }}
                              className={`flex-1 py-2 rounded-lg text-[13px] font-medium border transition-all
                                ${quizSubmitted[qi]
                                  ? opt.key === q.answer ? 'bg-green-100 border-green-400 text-green-800'
                                    : quizAnswers[qi] === opt.key ? 'bg-red-50 border-red-300 text-red-700'
                                    : 'bg-gray-50 border-gray-200 text-gray-400'
                                  : quizAnswers[qi] === opt.key ? 'bg-blue-50 border-blue-400 text-blue-800'
                                  : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300'}`}
                            >
                              <InlineMd text={`${opt.key}. ${opt.text}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* All passed */}
                {mode === 'forced_20' && allPassed && (
                  <div className="mt-4 flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl">
                    <Check className="w-5 h-5 text-green-600 shrink-0" />
                    <div>
                      <p className="text-[14px] font-bold text-green-800">今日已掌握，明天复习巩固</p>
                      <p className="text-[12px] text-green-600">即将进入下一知识点</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="px-4">
                <AiChatInput onSend={onSend} placeholder={`追问「${conceptName}」的任何问题…`} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Floating Window ──────────────────────────────────────────────────────────

export interface AiFloatingProps {
  messages: AiMessage[];
  onSend: (text: string) => void;
  position: { x: number; y: number };
  onDragEnd: (pos: { x: number; y: number }) => void;
  onClose: () => void;
  minimized: boolean;
  onToggleMinimize: () => void;
  onGoPractice?: () => void;
}

export function AiFloatingWindow({
  messages, onSend, position, onDragEnd, onClose, minimized, onToggleMinimize, onGoPractice,
}: AiFloatingProps) {
  const dragRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    dragOffset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  }, [position]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      onDragEnd({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
    };
    const onUp = () => { isDragging.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [onDragEnd]);

  return (
    <div
      ref={dragRef}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 999,
        // 固定默认尺寸、不可调节：宽 = 1/3 屏宽；高 = 上下轻微留白（收起时仅标题条高度）
        width: minimized ? 240 : '33.333vw',
        height: minimized ? undefined : 'calc(100vh - 32px)',
      }}
      className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col"
    >
      {/* Handle */}
      <div
        onMouseDown={onMouseDown}
        className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-500 to-violet-500 cursor-move"
      >
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-white/60" />
          <span className="text-[13px] font-semibold text-white">AI 助教</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onToggleMinimize} className="p-1 hover:bg-white/20 rounded transition-colors">
            <Minimize2 className="w-3.5 h-3.5 text-white" />
          </button>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded transition-colors">
            <X className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-3 bg-gray-50">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <CloudAvatar size={28} />
                <p className="text-[12px] text-gray-400 mt-2">随手问我任何问题</p>
              </div>
            )}
            {messages.map((msg, i) =>
              msg.role === 'user'
                ? <UserMessageBubble key={i} message={msg} />
                : <AiMessageBubble key={i} message={msg} surface="floating" onGoPractice={onGoPractice} />
            )}
          </div>
          <AiChatInput onSend={onSend} compact placeholder="看源随手问…" />
        </>
      )}
    </div>
  );
}
