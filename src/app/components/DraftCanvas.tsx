// DraftCanvas.tsx — Floating scratch-pad overlay for the practice screen.
// Pure sketchpad: no OCR, no submission, no scoring linkage.
// Two states: open (floating window) | closed (entry button only).
// Canvas clears on close and on "清空"; persists across questions / tool switches.

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { PenLine, Eraser, Trash2, X, GripHorizontal } from 'lucide-react';

// ── Constants ─────────────────────────────────────────────────────────────────

const CW = 480;          // canvas CSS width
const CH = 300;          // canvas CSS height
const TITLE_H = 40;
const TOOLBAR_H = 38;
const WIN_W = CW;
const WIN_H = TITLE_H + TOOLBAR_H + CH;
const PEN_W = 2;         // ballpoint line width (CSS px, pre-scale)
const ERASER_R = 14;     // eraser radius (CSS px, pre-scale)

type Tool = 'pen' | 'eraser';

// ── Palette matching PracticeScreen DK/LT tokens ──────────────────────────────

function palette(dark: boolean) {
  return dark
    ? { bg: '#12151E', titleBar: '#1C2136', toolbar: '#171B26', border: 'rgba(255,255,255,0.09)',
        txt: '#E8EAF0', sub: '#A0AABF', mut: '#5A6888',
        paper: '#0F121A', rule: 'rgba(255,255,255,0.032)',
        penStroke: '#D8DCE8', btnAct: 'rgba(45,140,255,0.16)', entryBg: '#1C2136', entryBdr: 'rgba(255,255,255,0.12)' }
    : { bg: '#FFFFFF', titleBar: '#F5F7FA', toolbar: '#FEFEFE', border: '#E2E6EF',
        txt: '#1C1E2A', sub: '#4A5568', mut: '#9AA3B8',
        paper: '#FEFCF7', rule: 'rgba(0,0,60,0.045)',
        penStroke: '#1C1E2A', btnAct: 'rgba(45,140,255,0.08)', entryBg: '#F0F2F7', entryBdr: '#D8DCE8' };
}

// ── DraftCanvas ───────────────────────────────────────────────────────────────

interface DraftCanvasProps {
  dark?: boolean;
  /** Bounding box the window must stay within (usually the practice screen rect) */
  bounds?: { w: number; h: number };
  /** Initial position of the floating window */
  defaultPos?: { x: number; y: number };
}

export function DraftCanvas({ dark = false, bounds = { w: 1024, h: 640 }, defaultPos }: DraftCanvasProps) {
  const C = palette(dark);

  const [open, setOpen] = useState(false);
  const [tool, setTool] = useState<Tool>('pen');
  const [pos, setPos] = useState(
    defaultPos ?? { x: Math.max(20, Math.min(80, bounds.w - WIN_W - 20)), y: 80 },
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const lastPt = useRef({ x: 0, y: 0 });
  const ratio = useRef(1);

  // Drag state (mutable, doesn't need re-render)
  const drag = useRef({ active: false, sx: 0, sy: 0, ox: 0, oy: 0 });

  // ── Canvas setup: run once each time the window opens ────────────────────────
  useEffect(() => {
    if (!open) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    ratio.current = dpr;
    canvas.width = CW * dpr;
    canvas.height = CH * dpr;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);
  }, [open]);

  // ── Clear helpers ─────────────────────────────────────────────────────────────
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    // Reset composite mode before clearing to ensure full wipe
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, CW, CH);
  }, []);

  const handleClose = useCallback(() => {
    clearCanvas();
    setOpen(false);
  }, [clearCanvas]);

  // ── Coordinate helper ─────────────────────────────────────────────────────────
  const canvasPt = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * CW,
      y: ((e.clientY - rect.top) / rect.height) * CH,
    };
  };

  const canvasTouchPt = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const t = e.touches[0];
    return {
      x: ((t.clientX - rect.left) / rect.width) * CW,
      y: ((t.clientY - rect.top) / rect.height) * CH,
    };
  };

  // ── Drawing ───────────────────────────────────────────────────────────────────
  const applyPen = (ctx: CanvasRenderingContext2D, from: { x: number; y: number }, to: { x: number; y: number }) => {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = C.penStroke;
    ctx.lineWidth = PEN_W;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  };

  const applyEraser = (ctx: CanvasRenderingContext2D, pt: { x: number; y: number }) => {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, ERASER_R, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,1)';
    ctx.fill();
  };

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    drawing.current = true;
    const pt = canvasPt(e);
    lastPt.current = pt;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    if (tool === 'pen') {
      // Draw a dot at the starting point
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = C.penStroke;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, PEN_W / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      applyEraser(ctx, pt);
    }
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pt = canvasPt(e);
    if (tool === 'pen') applyPen(ctx, lastPt.current, pt);
    else applyEraser(ctx, pt);
    lastPt.current = pt;
  };

  const onMouseUp = () => { drawing.current = false; };
  const onMouseLeave = () => { drawing.current = false; };

  // Touch events for tablet
  const onTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    drawing.current = true;
    const pt = canvasTouchPt(e);
    lastPt.current = pt;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    if (tool === 'pen') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = C.penStroke;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, PEN_W / 2, 0, Math.PI * 2);
      ctx.fill();
    } else applyEraser(ctx, pt);
  };

  const onTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pt = canvasTouchPt(e);
    if (tool === 'pen') applyPen(ctx, lastPt.current, pt);
    else applyEraser(ctx, pt);
    lastPt.current = pt;
  };

  const onTouchEnd = () => { drawing.current = false; };

  // ── Window drag ───────────────────────────────────────────────────────────────
  const onTitleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    drag.current = { active: true, sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y };
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!drag.current.active) return;
      const nx = Math.max(0, Math.min(drag.current.ox + e.clientX - drag.current.sx, bounds.w - WIN_W));
      const ny = Math.max(0, Math.min(drag.current.oy + e.clientY - drag.current.sy, bounds.h - WIN_H));
      setPos({ x: nx, y: ny });
    };
    const onUp = () => { drag.current.active = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [bounds]);

  // ── Shared button style ───────────────────────────────────────────────────────
  const toolBtn = (active: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 5,
    padding: '5px 10px', borderRadius: 8,
    border: active ? `1.5px solid #2D8CFF` : '1.5px solid transparent',
    background: active ? C.btnAct : 'transparent',
    cursor: 'pointer',
    color: active ? '#2D8CFF' : C.sub,
    fontSize: 11.5, fontWeight: active ? 600 : 400,
    transition: 'all 0.13s',
  });

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Entry button (always visible) ── */}
      <button
        onClick={() => open ? handleClose() : setOpen(true)}
        title="草稿纸"
        aria-label="打开草稿纸"
        style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: open ? '#2D8CFF' : C.entryBg,
          border: `1.5px solid ${open ? '#2D8CFF' : C.entryBdr}`,
          boxShadow: open
            ? '0 0 0 4px rgba(45,140,255,0.16), 0 4px 16px rgba(45,140,255,0.30)'
            : '0 2px 12px rgba(0,0,0,0.14), 0 1px 4px rgba(0,0,0,0.08)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 30,
          transition: 'all 0.18s ease',
          color: open ? '#fff' : C.sub,
          flexShrink: 0,
        }}
      >
        {/* Draft-paper icon: ruled lines + pen */}
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="2" width="10" height="13" rx="1.5" strokeWidth="1.4" />
          <line x1="5.5" y1="6"  x2="10.5" y2="6"  strokeWidth="1.1" />
          <line x1="5.5" y1="9"  x2="10.5" y2="9"  strokeWidth="1.1" />
          <line x1="5.5" y1="12" x2="8.5"  y2="12" strokeWidth="1.1" />
          <path d="M13 10.5l1.6 1.6-3 3L10 13.5l3-3z" strokeWidth="1.3" />
          <line x1="14.6" y1="10.5" x2="17" y2="8.1" strokeWidth="1.3" />
        </svg>
      </button>

      {/* ── Floating window ── */}
      {open && (
        <div
          style={{
            position: 'absolute',
            left: pos.x, top: pos.y,
            width: WIN_W,
            zIndex: 40,
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: dark
              ? '0 12px 48px rgba(0,0,0,0.55), 0 2px 10px rgba(0,0,0,0.35)'
              : '0 10px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10)',
            border: `1px solid ${C.border}`,
            background: C.bg,
            userSelect: 'none',
          }}
        >
          {/* ── Title bar (draggable) ── */}
          <div
            onMouseDown={onTitleMouseDown}
            style={{
              height: TITLE_H,
              background: C.titleBar,
              borderBottom: `1px solid ${C.border}`,
              display: 'flex', alignItems: 'center',
              padding: '0 10px 0 8px',
              cursor: 'grab', gap: 6,
            }}
          >
            <GripHorizontal size={13} color={C.mut} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 12.5, fontWeight: 600, color: C.sub, flex: 1, letterSpacing: 0.2 }}>
              草稿纸
            </span>
            <span style={{ fontSize: 10.5, color: dark ? '#3A4460' : '#C4C9D6', fontWeight: 400, whiteSpace: 'nowrap' }}>
              不提交 · 不判分
            </span>
            <button
              onClick={handleClose}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: C.mut, padding: '4px', display: 'flex', alignItems: 'center',
                borderRadius: 6, marginLeft: 6, flexShrink: 0,
              }}
            >
              <X size={14} />
            </button>
          </div>

          {/* ── Toolbar ── */}
          <div
            style={{
              height: TOOLBAR_H,
              background: C.toolbar,
              borderBottom: `1px solid ${C.border}`,
              display: 'flex', alignItems: 'center',
              padding: '0 8px', gap: 4,
            }}
          >
            <button onClick={() => setTool('pen')} title="圆珠笔" style={toolBtn(tool === 'pen')}>
              <PenLine size={13} />
              <span>圆珠笔</span>
            </button>

            <button onClick={() => setTool('eraser')} title="橡皮擦（像素擦除）" style={toolBtn(tool === 'eraser')}>
              <Eraser size={13} />
              <span>橡皮擦</span>
            </button>

            <div style={{ width: 1, height: 16, background: C.border, margin: '0 4px', flexShrink: 0 }} />

            <button
              onClick={clearCanvas}
              title="清空画布"
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 10px', borderRadius: 8,
                border: '1.5px solid transparent',
                background: 'transparent',
                cursor: 'pointer', color: C.mut,
                fontSize: 11.5, transition: 'all 0.13s',
              }}
            >
              <Trash2 size={13} />
              <span>清空</span>
            </button>

            {/* Eraser-size hint */}
            {tool === 'eraser' && (
              <div style={{
                marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5,
                paddingRight: 4,
              }}>
                <div style={{
                  width: ERASER_R, height: ERASER_R, borderRadius: '50%',
                  border: `1.5px solid ${C.mut}`, background: 'transparent', flexShrink: 0,
                }} />
                <span style={{ fontSize: 10, color: C.mut }}>橡皮大小</span>
              </div>
            )}
          </div>

          {/* ── Canvas area ── */}
          <div style={{ position: 'relative', height: CH, background: C.paper, overflow: 'hidden' }}>

            {/* Ruled lines (decorative, non-interactive) */}
            <svg
              style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
              width={CW} height={CH}
            >
              {Array.from({ length: Math.floor(CH / 22) }, (_, i) => (
                <line
                  key={i}
                  x1={0} y1={(i + 1) * 22}
                  x2={CW} y2={(i + 1) * 22}
                  stroke={C.rule} strokeWidth={1}
                />
              ))}
              {/* Left margin line */}
              <line x1={40} y1={0} x2={40} y2={CH}
                stroke={dark ? 'rgba(255,80,80,0.06)' : 'rgba(255,80,80,0.10)'} strokeWidth={1} />
            </svg>

            {/* Drawing canvas */}
            <canvas
              ref={canvasRef}
              style={{
                display: 'block',
                width: CW, height: CH,
                cursor: tool === 'eraser' ? 'cell' : 'crosshair',
                touchAction: 'none',
                position: 'relative', zIndex: 1,
              }}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseLeave}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            />
          </div>
        </div>
      )}
    </>
  );
}
