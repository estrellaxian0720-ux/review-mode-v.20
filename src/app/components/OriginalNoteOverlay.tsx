import { useState } from 'react';
import { ArrowLeft, Bookmark, Plus, Search, MoreHorizontal, Image, X } from 'lucide-react';

interface OriginalNoteOverlayProps {
  /** 笔记文件名，如「刑法分论讲义.pdf」 */
  noteName: string;
  /** 最新笔记正文（纯文本，按段落渲染） */
  noteLatest?: string;
  onClose: () => void;
}

/**
 * 「打开原笔记（最新）」浮层。
 * 样式与新用户引导 OnboardingScreen 的 TracebackDemo `showNoteWindow` 保持一致：
 * 紫色顶栏(#796B82) + 白色工具栏(钢笔/荧光笔/橡皮 + 颜色/粗细) + 灰底纸张正文(带页码 pill)。
 * 覆盖在溯源面板内部（absolute inset-0），不是全屏。
 */
export function OriginalNoteOverlay({ noteName, noteLatest, onClose }: OriginalNoteOverlayProps) {
  const [noteTool, setNoteTool] = useState<'pen' | 'highlight' | 'eraser'>('pen');
  const [notePage, setNotePage] = useState(7);

  const paragraphs = (noteLatest ?? '').split('\n').filter(Boolean);

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(20,25,35,.28)', backdropFilter: 'blur(1px)' }}
    >
      <div
        className="w-[94%] h-[92%] rounded-[18px] overflow-hidden flex flex-col"
        style={{ background: '#ECEDEF', border: '1px solid #CDD2DA', boxShadow: '0 22px 64px rgba(13,22,38,.30)' }}
      >
        {/* 紫色顶栏 */}
        <div className="h-12 flex items-center gap-3 px-4 flex-shrink-0" style={{ background: '#796B82', color: '#fff' }}>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10"><ArrowLeft size={18} /></button>
          <div className="grid grid-cols-2 gap-0.5 p-1">
            <span className="w-2 h-2 bg-white rounded-[2px]" /><span className="w-2 h-2 bg-white rounded-[2px]" />
            <span className="w-2 h-2 bg-white rounded-[2px]" /><span className="w-2 h-2 bg-white rounded-[2px]" />
          </div>
          <Bookmark size={18} /><Plus size={19} /><span className="text-[16px]">⌗</span>
          <div className="flex-1 text-center min-w-0">
            <p className="text-[12px] font-semibold truncate">{noteName}</p>
            <p className="text-[8px] text-white/70">最新笔记 · 与练习内容可能有差异</p>
          </div>
          <Search size={18} /><span className="text-[17px]">☝</span><span className="text-[17px]">◉</span><MoreHorizontal size={19} />
          <button onClick={onClose} className="p-1.5 rounded-lg bg-white/10"><X size={17} /></button>
        </div>

        {/* 白色工具栏 */}
        <div className="h-14 px-4 flex items-center gap-2 flex-shrink-0 overflow-x-auto" style={{ background: '#fff', borderBottom: '1px solid #D4D7DC' }}>
          <span className="text-[18px] text-gray-400 mr-1">↶</span><span className="text-[18px] text-gray-400 mr-2">↷</span>
          {[
            { id: 'pen', label: '✎', title: '钢笔' },
            { id: 'highlight', label: '▰', title: '荧光笔' },
            { id: 'eraser', label: '▱', title: '橡皮' },
          ].map(tool => (
            <button
              key={tool.id}
              title={tool.title}
              onClick={() => setNoteTool(tool.id as 'pen' | 'highlight' | 'eraser')}
              className="w-9 h-9 rounded-xl text-[20px] flex items-center justify-center"
              style={{ background: noteTool === tool.id ? '#FFF2A8' : '#F5F6F7', border: `1px solid ${noteTool === tool.id ? '#E4C73D' : '#E1E3E6'}` }}
            >{tool.label}</button>
          ))}
          <button className="w-9 h-9 rounded-xl border bg-gray-50 text-[18px]">◌</button>
          <button className="w-9 h-9 rounded-xl border bg-gray-50"><Image size={17} className="mx-auto" /></button>
          <button className="w-9 h-9 rounded-xl border bg-gray-50 font-serif text-[17px]">T</button>
          <button className="w-9 h-9 rounded-xl border bg-gray-50 text-[17px]">○△</button>
          <span className="h-7 w-px bg-gray-200 mx-1" />
          <span className="w-6 h-6 rounded-full bg-[#273C67] border-2 border-white shadow" />
          <span className="w-6 h-6 rounded-full bg-[#F02F47] border-2 border-white shadow" />
          <span className="w-6 h-6 rounded-full bg-black border-2 border-white shadow" />
          <div className="flex items-center gap-2 ml-2">
            <span className="w-6 h-[2px] bg-black" /><span className="w-6 h-1 bg-black rounded" /><span className="w-6 h-2 bg-black rounded" />
          </div>
        </div>

        {/* 灰底纸张正文 */}
        <div className="flex-1 min-h-0 overflow-auto p-5 relative" style={{ background: '#E9EAEC' }}>
          <div className="sticky top-0 z-20 ml-auto mb-2 w-fit flex items-center rounded-full overflow-hidden shadow bg-white text-[11px]" style={{ color: '#8A94A6' }}>
            <button onClick={() => setNotePage(p => Math.max(1, p - 1))} className="px-3 py-2">‹</button>
            <span className="px-3">{notePage} / 249</span>
            <button onClick={() => setNotePage(p => Math.min(249, p + 1))} className="px-3 py-2">›</button>
          </div>
          <article className="relative mx-auto w-[82%] min-h-[1020px] px-[8%] py-[6%] shadow-sm" style={{ background: '#FFF', color: '#2D3035' }}>
            <p className="text-right text-[11px] font-semibold mb-8">{noteName}</p>
            <div className="space-y-3 text-[14px] leading-8">
              {paragraphs.length > 0
                ? paragraphs.map((p, i) => <p key={i}>{p}</p>)
                : <p className="text-gray-400">（暂无最新笔记内容）</p>}
            </div>
            <span className="absolute bottom-5 right-6 text-[14px]" style={{ color: '#2BAE8A' }}>{notePage}</span>
          </article>
        </div>
      </div>
    </div>
  );
}
