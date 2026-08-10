import { X, FileText, MessageSquare, BookOpen, ChevronLeft, ChevronRight, ChevronDown, Check, GripVertical, Minimize2, Maximize2, Flag, Zap, WifiOff, RefreshCw, PanelRightOpen, PanelRightClose, Moon, Sun, Loader2, CheckSquare, Square, PenLine } from 'lucide-react';
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import { DailyGoalAchievedPopup } from '../components/DailyGoalAchievedPopup';
import { MilestoneModal, MilestoneType } from '../components/MilestoneModal';
import { KnowledgePointMasteredPopup } from '../components/KnowledgePointMasteredPopup';
import { DraftCanvas } from '../components/DraftCanvas';
import { OriginalNoteOverlay } from '../components/OriginalNoteOverlay';
import {
  AiMessage, AiChatThread, AiChatInput, AiChatPanel, AiFullscreenOverlay,
  AiFloatingWindow, SHOUHUI_DEMO, FullscreenMode,
} from './AiRichChat';

type PracticeMode = 'mcq' | 'truefalse' | 'flashcard' | 'fill_blank' | 'multiple_choice' | 'short_answer';

// ── Dark-mode token map ───────────────────────────────────────────────────────
type DM = { bg: string; card: string; bdr: string; txt: string; sub: string; mut: string; inputBg: string; chip: string; chipTxt: string; }
const DK: DM = { bg:'#0F1117', card:'#171B26', bdr:'rgba(255,255,255,0.10)', txt:'#E8EAF0', sub:'#A0AABF', mut:'#5A6888', inputBg:'#1C2136', chip:'#1C2136', chipTxt:'#A0AABF' };
const LT: DM = { bg:'#ffffff', card:'#ffffff', bdr:'#E5E7EB', txt:'#1C1E2A', sub:'#4A5568', mut:'#8B8FA8', inputBg:'#ffffff', chip:'#F0F2F7', chipTxt:'#4A5568' };

// ── Semantic state colours ────────────────────────────────────────────────────
const CLR = {
  correct:'#00A63E', correctBg:'rgba(0,166,62,0.10)', correctBdr:'#00A63E',
  incorrect:'#FF6252', incorrectBg:'rgba(255,98,82,0.10)', incorrectBdr:'#FF6252',
  partial:'#E17100', partialBg:'rgba(225,113,0,0.10)', partialBdr:'#E17100',
  active:'#2D8CFF', activeBg:'rgba(45,140,255,0.12)', activeBdr:'#2D8CFF',
  retryCorrect:'#1A7A4A', retryCorrectBg:'rgba(26,122,74,0.08)', retryCorrectBdr:'rgba(26,122,74,0.35)',
};

// ── Demo data ─────────────────────────────────────────────────────────────────
const FILL_BLANK_Q = {
  id: 'fill-001',
  stem: '受贿罪的主体必须是',
  blanks: [{ id: 'b1', acceptedAnswers: ['国家工作人员', '国家公职人员'] }],
  explanation: '受贿罪属于身份犯，主体必须是国家工作人员。根据刑法第385条，国家工作人员利用职务上的便利索取或非法收受他人财物，即构成受贿罪。',
};

const MULTI_Q = {
  id: 'multi-001',
  stem: '以下哪些属于受贿罪中利用职务便利的情形？',
  options: [
    { key:'A', text:'直接利用本人职务权力', isCorrect: true },
    { key:'B', text:'纯粹利用私人朋友关系', isCorrect: false },
    { key:'C', text:'利用本人主管事项形成的便利', isCorrect: true },
    { key:'D', text:'利用职务形成的制约关系', isCorrect: true },
  ],
  explanation: 'A、C、D 均属于利用职务便利。D 中「职务形成的制约关系」是职务便利的延伸形式。B 属于利用影响力受贿情形，不属于本条。',
};

const SHORT_Q = {
  id: 'short-001',
  stem: "简述受贿罪中「为他人谋取利益」的认定方式。",
  matchedPoints: ['实际实施谋利行为', '承诺为他人谋利'],
  missingPoints: ['明知具体请托事项而收受财物的认定'],
  criticalErrors: [] as string[],
  referenceAnswer: '为他人谋取利益包括：①实际实施谋利行为；②承诺为他人谋利；③明知具体请托事项而收受财物（法定认定情形）。只要具备其中之一即可认定。',
  gradingConfidence: 'medium' as 'high' | 'medium' | 'low',
};

// ── HandwritingCanvas ─────────────────────────────────────────────────────────
interface HWCanvasRef { hasContent(): boolean; clear(): void; }

const HandwritingCanvas = forwardRef<HWCanvasRef, {
  dark: boolean; height?: number; disabled?: boolean; onChange?: (has: boolean) => void;
}>(({ dark, height = 160, disabled = false, onChange }, ref) => {
  const canvasEl = useRef<HTMLCanvasElement>(null);
  const wrapEl = useRef<HTMLDivElement>(null);
  const [activeTool, setActiveTool] = useState<'pen'|'eraser'>('pen');
  const drawing = useRef(false);
  const lastPos = useRef<{x:number;y:number}|null>(null);
  const contentExists = useRef(false);
  const T = dark ? DK : LT;

  const initCanvas = () => {
    const canvas = canvasEl.current; const wrap = wrapEl.current;
    if (!canvas || !wrap || !wrap.offsetWidth) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = wrap.offsetWidth;
    canvas.width = w * dpr; canvas.height = height * dpr;
    canvas.style.width = w + 'px'; canvas.style.height = height + 'px';
    const ctx = canvas.getContext('2d')!;
    ctx.setTransform(1,0,0,1,0,0); ctx.scale(dpr, dpr);
  };

  useEffect(() => {
    initCanvas();
    const ro = new ResizeObserver(initCanvas);
    if (wrapEl.current) ro.observe(wrapEl.current);
    return () => ro.disconnect();
  }, []);

  useImperativeHandle(ref, () => ({
    hasContent: () => contentExists.current,
    clear: () => {
      const canvas = canvasEl.current; if (!canvas) return;
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      contentExists.current = false; onChange?.(false);
    },
  }));

  const getPos = (e: React.PointerEvent) => {
    const rect = canvasEl.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onDown = (e: React.PointerEvent) => {
    if (disabled) return;
    drawing.current = true; lastPos.current = getPos(e);
    canvasEl.current?.setPointerCapture(e.pointerId);
  };

  const onMove = (e: React.PointerEvent) => {
    if (!drawing.current || !lastPos.current) return;
    const ctx = canvasEl.current?.getContext('2d'); if (!ctx) return;
    const pos = getPos(e);
    ctx.save();
    ctx.globalCompositeOperation = activeTool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.beginPath(); ctx.moveTo(lastPos.current.x, lastPos.current.y); ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = activeTool === 'pen' ? (dark ? '#D4D8E8' : '#1C1E2A') : 'rgba(0,0,0,1)';
    ctx.lineWidth = activeTool === 'pen' ? 2.5 : 22;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); ctx.restore();
    lastPos.current = pos;
    if (activeTool === 'pen' && !contentExists.current) { contentExists.current = true; onChange?.(true); }
  };

  const onUp = () => { drawing.current = false; lastPos.current = null; };

  const clearAll = () => {
    const canvas = canvasEl.current; if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    contentExists.current = false; onChange?.(false);
  };

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
        {(['pen','eraser'] as const).map(t => (
          <button key={t} onClick={() => setActiveTool(t)} style={{
            background: t === 'pen'
              ? (activeTool==='pen' ? CLR.activeBg : T.chip)
              : (activeTool==='eraser' ? CLR.incorrectBg : T.chip),
            color: t === 'pen'
              ? (activeTool==='pen' ? CLR.active : T.sub)
              : (activeTool==='eraser' ? CLR.incorrect : T.sub),
            border: `1px solid ${t === 'pen' ? (activeTool==='pen' ? CLR.active : T.bdr) : (activeTool==='eraser' ? CLR.incorrect : T.bdr)}`,
            borderRadius:8, padding:'4px 12px', fontSize:11, fontWeight:600, cursor:'pointer',
          }}>
            {t === 'pen' ? '✏️ 圆珠笔' : '⌫ 橡皮擦'}
          </button>
        ))}
        <button onClick={clearAll} style={{
          color: T.mut, background: T.chip, border:`1px solid ${T.bdr}`,
          borderRadius:8, padding:'4px 12px', fontSize:11, fontWeight:600, marginLeft:'auto', cursor:'pointer',
        }}>清空</button>
      </div>
      <div ref={wrapEl} style={{
        background: dark ? '#1C2136' : '#F9FAFB', border:`2px solid ${T.bdr}`, borderRadius:12,
        overflow:'hidden', height, cursor: disabled ? 'not-allowed' : (activeTool==='eraser' ? 'cell' : 'crosshair'),
      }}>
        <canvas ref={canvasEl}
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}
          style={{ display:'block', touchAction:'none' }}
        />
      </div>
      <p style={{ color: T.mut, fontSize:10, marginTop:6, textAlign:'right' }}>提交时将自动识别手写内容</p>
    </div>
  );
});
HandwritingCanvas.displayName = 'HandwritingCanvas';

// ── InputModeToggle ──────────────────────────────────────────────────────────
function InputModeToggle({ mode, onChange, dark }: { mode:'keyboard'|'handwriting'; onChange:(m:'keyboard'|'handwriting')=>void; dark:boolean }) {
  const T = dark ? DK : LT;
  return (
    <div style={{ background: T.chip, padding:3, borderRadius:10, display:'inline-flex', gap:2 }}>
      {(['keyboard','handwriting'] as const).map(m => {
        const active = mode === m;
        return (
          <button key={m} onClick={() => onChange(m)} style={{
            background: active ? (dark ? '#2A3248' : '#fff') : 'transparent',
            color: active ? T.txt : T.mut,
            boxShadow: active ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
            borderRadius:8, padding:'4px 12px', fontSize:12, fontWeight:600, border:'none', cursor:'pointer',
          }}>
            {m === 'keyboard' ? '⌨️ 键盘' : '✍️ 手写'}
          </button>
        );
      })}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── FillBlankQuestion ─────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
function FillBlankQuestion({ dark, onTraceback }: { dark:boolean; onTraceback:()=>void }) {
  const T = dark ? DK : LT;
  const q = FILL_BLANK_Q;
  type Phase = 'initial'|'filling'|'recognizing'|'recognize-result'|'submitting'|'result';
  const [inputMode, setInputMode] = useState<'keyboard'|'handwriting'>('keyboard');
  const [phase, setPhase] = useState<Phase>('initial');
  const [inputs, setInputs] = useState<Record<string,string>>({});
  const [hwHasContent, setHwHasContent] = useState(false);
  const [ocrEmpty, setOcrEmpty] = useState(false);
  const [retryUsed, setRetryUsed] = useState(false);
  const [isRetry, setIsRetry] = useState(false);
  const canvasRef = useRef<HWCanvasRef>(null);

  const inProgress = phase === 'initial' || phase === 'filling';
  const isRecognizing = phase === 'recognizing';
  const isRecognizeResult = phase === 'recognize-result';
  const isSubmitting = phase === 'submitting';
  const isDone = phase === 'result';

  const canSubmit = inputMode === 'keyboard'
    ? q.blanks.some(b => (inputs[b.id]||'').trim().length > 0)
    : hwHasContent;

  const normalize = (s: string) =>
    s.trim().toLowerCase().replace(/[\s　]+/g,'').replace(/[，。？！、；：""''（）【】,.?!;:]/g,'');

  const blankResult = (id: string): 'correct'|'incorrect'|null => {
    if (!isDone) return null;
    const b = q.blanks.find(x => x.id === id); if (!b) return null;
    const norm = normalize(inputs[id]||''); if (!norm) return 'incorrect';
    const ok = b.acceptedAnswers.some(a => {
      const na = normalize(a);
      return na === norm || na.includes(norm) || norm.includes(na);
    });
    return ok ? 'correct' : 'incorrect';
  };

  const allCorrect = isDone && q.blanks.every(b => blankResult(b.id) === 'correct');
  const correctCount = q.blanks.filter(b => blankResult(b.id) === 'correct').length;
  const isRetryCorrect = isRetry && allCorrect;
  const showRedo = isDone && !allCorrect && !retryUsed;

  const submit = () => {
    if (inputMode === 'handwriting') {
      if (!hwHasContent) { setOcrEmpty(true); return; }
      setOcrEmpty(false); setPhase('recognizing');
      setTimeout(() => { setInputs({ b1: '国家工作人员' }); setPhase('recognize-result'); }, 1200);
    } else {
      setPhase('submitting');
      setTimeout(() => setPhase('result'), 500);
    }
  };

  const confirmOcr = () => { setPhase('submitting'); setTimeout(() => setPhase('result'), 500); };

  const redo = () => {
    setRetryUsed(true); setIsRetry(true);
    setPhase('initial'); setInputs({}); setHwHasContent(false); setOcrEmpty(false);
    canvasRef.current?.clear();
  };

  return (
    <div className="w-full max-w-[600px] space-y-5">
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
        <span style={{ background: T.chip, color: CLR.active, borderRadius:8, padding:'4px 10px', fontSize:12, fontWeight:700 }}>填空题</span>
        {!isDone && <InputModeToggle mode={inputMode} dark={dark}
          onChange={m => { if (!isRecognizing && !isSubmitting) { setInputMode(m); setOcrEmpty(false); } }} />}
      </div>

      {/* Stem */}
      <div>
        <h2 style={{ color: T.txt, fontSize:20, fontWeight:700, lineHeight:1.5 }}>
          {q.stem}
          <span style={{ borderBottom:`2px dashed ${T.mut}`, margin:'0 6px', padding:'0 10px', color: T.mut }}>___</span>。
        </h2>
        <span style={{ color: T.mut, fontSize:11, marginTop:6, display:'block' }}>
          {inputMode === 'keyboard' ? '在下方输入框填写答案' : '在手写板书写答案，提交时自动识别'}
        </span>
      </div>

      {/* Blanks */}
      {q.blanks.map((blank, i) => {
        const res = blankResult(blank.id);
        return (
          <div key={blank.id}>
            {q.blanks.length > 1 && (
              <label style={{ color: T.sub, fontSize:12, fontWeight:600, display:'block', marginBottom:6 }}>第{i+1}空</label>
            )}

            {/* Keyboard mode */}
            {inputMode === 'keyboard' && (
              <>
                <input type="text"
                  value={inputs[blank.id]||''}
                  onChange={e => {
                    if (inProgress) {
                      const v = e.target.value;
                      setInputs(s => ({...s, [blank.id]: v}));
                      setPhase(v ? 'filling' : 'initial');
                    }
                  }}
                  disabled={isSubmitting || isDone}
                  placeholder="输入你的答案…"
                  style={{
                    width:'100%', padding:'12px 16px', borderRadius:12, fontSize:15, outline:'none', boxSizing:'border-box',
                    background: T.inputBg, color: T.txt,
                    border:`2px solid ${res==='correct' ? CLR.correct : res==='incorrect' ? CLR.incorrect : phase==='filling' ? CLR.active : T.bdr}`,
                  }}
                />
                {res === 'incorrect' && (
                  <div style={{ color: CLR.incorrect, fontSize:12, marginTop:6 }}>
                    ✗ 你答：「{inputs[blank.id]}」　可接受：{blank.acceptedAnswers.join('、')}
                  </div>
                )}
                {res === 'correct' && <div style={{ color: CLR.correct, fontSize:12, marginTop:6 }}>✓ 正确</div>}
              </>
            )}

            {/* Handwriting mode */}
            {inputMode === 'handwriting' && (
              <>
                {inProgress && <HandwritingCanvas ref={canvasRef} dark={dark} height={160} onChange={setHwHasContent} />}
                {isRecognizing && (
                  <div style={{
                    background: T.inputBg, border:`2px solid ${T.bdr}`, borderRadius:12,
                    height:160, display:'flex', alignItems:'center', justifyContent:'center', gap:12,
                  }}>
                    <Loader2 style={{ width:20, height:20, color: CLR.active, animation:'spin 1s linear infinite' }}/>
                    <span style={{ color: T.sub, fontSize:13 }}>手写识别中…</span>
                  </div>
                )}
                {(isRecognizeResult || isSubmitting) && (
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    <span style={{ background: CLR.activeBg, color: CLR.active, fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:6, alignSelf:'flex-start' }}>
                      识别结果 · 可修改
                    </span>
                    <input type="text"
                      value={inputs[blank.id]||''}
                      onChange={e => isRecognizeResult && setInputs(s => ({...s, [blank.id]: e.target.value}))}
                      disabled={isSubmitting}
                      style={{
                        width:'100%', padding:'12px 16px', borderRadius:12, fontSize:15, outline:'none', boxSizing:'border-box',
                        background: T.inputBg, color: T.txt, border:`2px solid ${CLR.active}`,
                      }}
                    />
                    <span style={{ color: T.mut, fontSize:11 }}>如识别有误，请修改后再提交</span>
                  </div>
                )}
                {isDone && (
                  <>
                    <div style={{
                      padding:'12px 16px', borderRadius:12, fontSize:15,
                      background: T.inputBg, color: T.txt,
                      border:`2px solid ${res==='correct' ? CLR.correct : CLR.incorrect}`,
                    }}>{inputs[blank.id]}</div>
                    {res === 'incorrect' && (
                      <div style={{ color: CLR.incorrect, fontSize:12, marginTop:6 }}>
                        ✗ 可接受答案：{blank.acceptedAnswers.join('、')}
                      </div>
                    )}
                    {res === 'correct' && <div style={{ color: CLR.correct, fontSize:12, marginTop:6 }}>✓ 正确</div>}
                  </>
                )}
              </>
            )}
          </div>
        );
      })}

      {/* OCR empty warning */}
      {ocrEmpty && (
        <div style={{ background: CLR.incorrectBg, border:`1px solid ${CLR.incorrectBdr}`, borderRadius:12, padding:'12px 16px', color: CLR.incorrect, fontSize:13 }}>
          未识别到内容，请重写或改用键盘
        </div>
      )}

      {/* Submit / Confirm */}
      {!isDone && !isRecognizeResult && (
        <button onClick={submit}
          disabled={!canSubmit || isSubmitting || isRecognizing}
          style={{
            width:'100%', padding:'14px 0', borderRadius:12, fontSize:15, fontWeight:700, border:'none',
            background: (canSubmit && !isSubmitting && !isRecognizing) ? CLR.active : (dark?'#2A3248':'#E5E7EB'),
            color: (canSubmit && !isSubmitting && !isRecognizing) ? '#fff' : T.mut,
            cursor: (canSubmit && !isSubmitting && !isRecognizing) ? 'pointer' : 'not-allowed',
            display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          }}>
          {isSubmitting ? <><Loader2 style={{ width:16, height:16, animation:'spin 1s linear infinite' }}/>提交中…</> :
           isRecognizing ? <><Loader2 style={{ width:16, height:16, animation:'spin 1s linear infinite' }}/>识别中…</> : '提交答案'}
        </button>
      )}
      {isRecognizeResult && (
        <button onClick={confirmOcr}
          style={{
            width:'100%', padding:'14px 0', borderRadius:12, fontSize:15, fontWeight:700,
            background: CLR.active, color:'#fff', border:'none', cursor:'pointer',
          }}>确认并提交</button>
      )}

      {/* Result card */}
      {isDone && (
        <div style={{
          background: isRetryCorrect ? CLR.retryCorrectBg : allCorrect ? CLR.correctBg : CLR.incorrectBg,
          border:`1px solid ${isRetryCorrect ? CLR.retryCorrectBdr : allCorrect ? CLR.correctBdr : CLR.incorrectBdr}`,
          borderRadius:12, padding:20, display:'flex', flexDirection:'column', gap:12,
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ color: isRetryCorrect ? CLR.retryCorrect : allCorrect ? CLR.correct : CLR.incorrect, fontSize:15, fontWeight:700 }}>
              {isRetryCorrect ? '✓ 这次对了' : allCorrect ? '✓ 完全正确' :
               q.blanks.length > 1 ? `答对 ${correctCount} / ${q.blanks.length} 空` : '✗ 回答有误'}
            </span>
            {isRetryCorrect && (
              <span style={{ background:'rgba(26,122,74,0.15)', color: CLR.retryCorrect, fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:6 }}>重试正确</span>
            )}
          </div>
          <p style={{ color: T.sub, fontSize:13, lineHeight:1.6 }}>{q.explanation}</p>
          <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
            <button onClick={onTraceback} style={{
              display:'flex', alignItems:'center', gap:8, padding:'8px 14px', borderRadius:8, cursor:'pointer',
              background: dark?'rgba(255,255,255,0.08)':'#fff', color: T.sub, border:`1px solid ${T.bdr}`, fontSize:13, fontWeight:500,
            }}><FileText style={{ width:15, height:15 }}/>溯源查看</button>
            {showRedo && (
              <button onClick={redo} style={{
                display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:8, cursor:'pointer',
                background: dark?'rgba(255,255,255,0.05)':'#fff', color: CLR.partial,
                border:`1px solid ${CLR.partialBdr}`, fontSize:13, fontWeight:500,
              }}>重做本题</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── MultiSelectQuestion ───────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
function MultiSelectQuestion({ dark, onTraceback }: { dark:boolean; onTraceback:()=>void }) {
  const T = dark ? DK : LT;
  const q = MULTI_Q;
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [retryUsed, setRetryUsed] = useState(false);
  const [isRetry, setIsRetry] = useState(false);

  const toggle = (key: string) => {
    if (submitted) return;
    setSelected(s => { const n = new Set(s); n.has(key) ? n.delete(key) : n.add(key); return n; });
  };

  const correctKeys = new Set(q.options.filter(o => o.isCorrect).map(o => o.key));
  const isFullyCorrect = submitted && [...selected].every(k => correctKeys.has(k)) && [...correctKeys].every(k => selected.has(k));
  const isPartial = submitted && !isFullyCorrect && [...selected].some(k => correctKeys.has(k));
  const isRetryCorrect = isRetry && isFullyCorrect;

  const resultColor = isRetryCorrect ? CLR.retryCorrect : isFullyCorrect ? CLR.correct : isPartial ? CLR.partial : CLR.incorrect;
  const resultBg = isRetryCorrect ? CLR.retryCorrectBg : isFullyCorrect ? CLR.correctBg : isPartial ? CLR.partialBg : CLR.incorrectBg;
  const resultBdr = isRetryCorrect ? CLR.retryCorrectBdr : isFullyCorrect ? CLR.correctBdr : isPartial ? CLR.partialBdr : CLR.incorrectBdr;
  const resultLabel = isRetryCorrect ? '这次对了' : isFullyCorrect ? '完全正确' : isPartial ? '部分正确' : '回答错误';
  const showRedo = submitted && !isFullyCorrect && !retryUsed;

  const redo = () => {
    setRetryUsed(true); setIsRetry(true);
    setSelected(new Set()); setSubmitted(false);
  };

  const optionBorder = (key: string) => {
    if (!submitted) return selected.has(key) ? CLR.active : T.bdr;
    const sel = selected.has(key), corr = correctKeys.has(key);
    if (sel && corr) return CLR.correct;
    if (sel && !corr) return CLR.incorrect;
    if (!sel && corr) return CLR.correct;
    return T.bdr;
  };
  const optionBg = (key: string) => {
    if (!submitted) return selected.has(key) ? CLR.activeBg : T.card;
    const sel = selected.has(key), corr = correctKeys.has(key);
    if (sel && corr) return CLR.correctBg;
    if (sel && !corr) return CLR.incorrectBg;
    if (!sel && corr) return 'rgba(0,166,62,0.05)';
    return T.card;
  };

  return (
    <div className="w-full max-w-[600px] space-y-5">
      <span style={{ background: T.chip, color: CLR.active, borderRadius:8, padding:'4px 10px', fontSize:12, fontWeight:700 }}>
        多选题 · 可选择多个答案
      </span>
      <h2 style={{ color: T.txt, fontSize:20, fontWeight:700, lineHeight:1.5 }}>{q.stem}</h2>

      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {q.options.map(opt => {
          const isSel = selected.has(opt.key);
          const isMissed = submitted && !isSel && correctKeys.has(opt.key);
          return (
            <button key={opt.key} onClick={() => toggle(opt.key)} style={{
              background: optionBg(opt.key),
              border:`2px ${isMissed ? 'dashed' : 'solid'} ${optionBorder(opt.key)}`,
              borderRadius:12, padding:'14px 16px', color: T.txt, textAlign:'left',
              display:'flex', alignItems:'center', gap:12,
              cursor: submitted ? 'default' : 'pointer', transition:'all 0.15s',
            }}>
              <span style={{ color: !submitted ? (isSel ? CLR.active : T.mut) : (isSel ? (correctKeys.has(opt.key) ? CLR.correct : CLR.incorrect) : T.mut), flexShrink:0 }}>
                {isSel ? <CheckSquare style={{ width:20, height:20 }}/> : <Square style={{ width:20, height:20 }}/>}
              </span>
              <span style={{ color: T.sub, fontWeight:700, fontSize:15, flexShrink:0, width:20 }}>{opt.key}.</span>
              <span style={{ flex:1, fontSize:15, color: T.txt }}>{opt.text}</span>
              {isMissed && (
                <span style={{ background: CLR.correctBg, color: CLR.correct, fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:6, flexShrink:0 }}>漏选</span>
              )}
            </button>
          );
        })}
      </div>

      {!submitted && (
        <button onClick={() => setSubmitted(true)} disabled={selected.size === 0} style={{
          width:'100%', padding:'14px 0', borderRadius:12, fontSize:15, fontWeight:700, border:'none',
          background: selected.size > 0 ? CLR.active : (dark?'#2A3248':'#E5E7EB'),
          color: selected.size > 0 ? '#fff' : T.mut,
          cursor: selected.size > 0 ? 'pointer' : 'not-allowed',
        }}>
          提交答案{selected.size > 0 ? `（已选 ${selected.size} 项）` : ''}
        </button>
      )}

      {submitted && (
        <div style={{ background: resultBg, border:`1px solid ${resultBdr}`, borderRadius:12, padding:20, display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ color: resultColor, fontSize:15, fontWeight:700 }}>{resultLabel}</span>
            {isRetryCorrect && (
              <span style={{ background:'rgba(26,122,74,0.15)', color: CLR.retryCorrect, fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:6 }}>重试正确</span>
            )}
          </div>
          <p style={{ color: T.sub, fontSize:13, lineHeight:1.6 }}>{q.explanation}</p>
          {!isFullyCorrect && (
            <p style={{ color: T.mut, fontSize:11 }}>全部薄弱项见星图 — 仅完全正确才计入一次掌握记录</p>
          )}
          <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
            <button onClick={onTraceback} style={{
              display:'flex', alignItems:'center', gap:8, padding:'8px 14px', borderRadius:8, cursor:'pointer',
              background: dark?'rgba(255,255,255,0.08)':'#fff', color: T.sub, border:`1px solid ${T.bdr}`, fontSize:13, fontWeight:500,
            }}><FileText style={{ width:15, height:15 }}/>溯源查看</button>
            {showRedo && (
              <button onClick={redo} style={{
                display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:8, cursor:'pointer',
                background: dark?'rgba(255,255,255,0.05)':'#fff', color: CLR.partial,
                border:`1px solid ${CLR.partialBdr}`, fontSize:13, fontWeight:500,
              }}>重做本题</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── ShortAnswerQuestion ───────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
function ShortAnswerQuestion({ dark, onTraceback }: { dark:boolean; onTraceback:()=>void }) {
  const T = dark ? DK : LT;
  const q = SHORT_Q;
  type Phase = 'initial'|'typing'|'recognizing'|'recognize-result'|'evaluating'|'result';
  const [inputMode, setInputMode] = useState<'keyboard'|'handwriting'>('keyboard');
  const [phase, setPhase] = useState<Phase>('initial');
  const [text, setText] = useState('');
  const [hwHasContent, setHwHasContent] = useState(false);
  const [showRef, setShowRef] = useState(false);
  const [retryUsed, setRetryUsed] = useState(false);
  const [isRetry, setIsRetry] = useState(false);
  const canvasRef = useRef<HWCanvasRef>(null);
  const MAX = 500;

  const inProgress = phase === 'initial' || phase === 'typing';
  const isRecognizing = phase === 'recognizing';
  const isRecognizeResult = phase === 'recognize-result';
  const isEvaluating = phase === 'evaluating';
  const isDone = phase === 'result';

  const canSubmit = inputMode === 'keyboard' ? text.trim().length > 0 : hwHasContent;

  // Demo: always shows partial
  const demoLevel: 'basic'|'partial'|'review' = isRetry ? 'basic' : 'partial';
  const rCfg = {
    basic:   { label:'基本正确', color: CLR.correct,   bg: CLR.correctBg,   bdr: CLR.correctBdr },
    partial: { label:'部分正确', color: CLR.partial,   bg: CLR.partialBg,   bdr: CLR.partialBdr },
    review:  { label:'需要复习', color: CLR.incorrect, bg: CLR.incorrectBg, bdr: CLR.incorrectBdr },
  }[demoLevel];
  const isRetryCorrect = isRetry && demoLevel === 'basic';

  const submit = () => {
    if (inputMode === 'handwriting') {
      if (!hwHasContent) return;
      setPhase('recognizing');
      setTimeout(() => {
        setText('为他人谋取利益包括：一是实际实施谋利行为；二是承诺为他人谋利。');
        setPhase('recognize-result');
      }, 1400);
    } else {
      setPhase('evaluating');
      setTimeout(() => setPhase('result'), 1400);
    }
  };

  const confirmOcr = () => { setPhase('evaluating'); setTimeout(() => setPhase('result'), 1400); };

  const redo = () => {
    setRetryUsed(true); setIsRetry(true);
    setPhase('initial'); setText(''); setHwHasContent(false); setShowRef(false);
    canvasRef.current?.clear();
  };

  const showRedo = isDone && demoLevel !== 'basic' && !retryUsed;

  return (
    <div className="w-full max-w-[600px] space-y-5">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
        <span style={{ background: T.chip, color: T.sub, borderRadius:8, padding:'4px 10px', fontSize:12, fontWeight:700 }}>简答题</span>
        {!isDone && <InputModeToggle mode={inputMode} dark={dark}
          onChange={m => { if (!isRecognizing && !isEvaluating) setInputMode(m); }} />}
      </div>

      <h2 style={{ color: T.txt, fontSize:20, fontWeight:700, lineHeight:1.5 }}>{q.stem}</h2>

      {/* Keyboard textarea */}
      {inputMode === 'keyboard' && (
        <div style={{ position:'relative' }}>
          <textarea
            value={text}
            onChange={e => {
              if (inProgress) { const v = e.target.value.slice(0,MAX); setText(v); setPhase(v ? 'typing' : 'initial'); }
            }}
            disabled={isEvaluating || isDone}
            placeholder="请用自己的语言作答，支持换行和粘贴…"
            rows={6}
            style={{
              width:'100%', padding:'14px 16px', paddingBottom:32, borderRadius:12, fontSize:14,
              lineHeight:1.7, outline:'none', resize:'vertical', boxSizing:'border-box',
              background: T.inputBg, color: T.txt,
              border:`2px solid ${(isEvaluating||isDone) ? T.bdr : phase==='typing' ? CLR.active : T.bdr}`,
              opacity: isEvaluating ? 0.7 : 1,
            }}
          />
          <span style={{ position:'absolute', bottom:10, right:14, color: T.mut, fontSize:11, pointerEvents:'none' }}>
            {text.length} / {MAX}
          </span>
        </div>
      )}

      {/* Handwriting canvas */}
      {inputMode === 'handwriting' && (
        <>
          {inProgress && <HandwritingCanvas ref={canvasRef} dark={dark} height={220} onChange={setHwHasContent} />}
          {isRecognizing && (
            <div style={{
              background: T.inputBg, border:`2px solid ${T.bdr}`, borderRadius:12,
              height:220, display:'flex', alignItems:'center', justifyContent:'center', gap:12,
            }}>
              <Loader2 style={{ width:24, height:24, color: CLR.active, animation:'spin 1s linear infinite' }}/>
              <span style={{ color: T.sub, fontSize:14 }}>手写识别中…</span>
            </div>
          )}
          {(isRecognizeResult || isEvaluating) && (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <span style={{ background: CLR.activeBg, color: CLR.active, fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:6, alignSelf:'flex-start' }}>
                识别结果 · 可修改后提交
              </span>
              <div style={{ position:'relative' }}>
                <textarea
                  value={text}
                  onChange={e => isRecognizeResult && setText(e.target.value.slice(0, MAX))}
                  disabled={isEvaluating}
                  rows={5}
                  style={{
                    width:'100%', padding:'14px 16px', paddingBottom:32, borderRadius:12, fontSize:14,
                    lineHeight:1.7, outline:'none', resize:'vertical', boxSizing:'border-box',
                    background: T.inputBg, color: T.txt, border:`2px solid ${CLR.active}`,
                    opacity: isEvaluating ? 0.7 : 1,
                  }}
                />
                <span style={{ position:'absolute', bottom:10, right:14, color: T.mut, fontSize:11, pointerEvents:'none' }}>
                  {text.length} / {MAX}
                </span>
              </div>
              <span style={{ color: T.mut, fontSize:11 }}>如识别有误，请修改后再提交</span>
            </div>
          )}
          {isDone && (
            <div style={{ padding:'14px 16px', borderRadius:12, fontSize:14, lineHeight:1.7, background: T.inputBg, color: T.sub, border:`2px solid ${T.bdr}`, whiteSpace:'pre-wrap' }}>
              {text}
            </div>
          )}
        </>
      )}

      {/* Submit / Confirm / Evaluating */}
      {!isDone && !isRecognizeResult && (
        <button onClick={submit}
          disabled={!canSubmit || isEvaluating || isRecognizing}
          style={{
            width:'100%', padding:'14px 0', borderRadius:12, fontSize:15, fontWeight:700, border:'none',
            background: (canSubmit && !isEvaluating && !isRecognizing) ? CLR.active : (dark?'#2A3248':'#E5E7EB'),
            color: (canSubmit && !isEvaluating && !isRecognizing) ? '#fff' : T.mut,
            cursor: (canSubmit && !isEvaluating && !isRecognizing) ? 'pointer' : 'not-allowed',
            display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          }}>
          {isEvaluating ? <><Loader2 style={{ width:16, height:16, animation:'spin 1s linear infinite' }}/>正在评估…</> :
           isRecognizing ? <><Loader2 style={{ width:16, height:16, animation:'spin 1s linear infinite' }}/>识别中…</> : '提交答案'}
        </button>
      )}
      {isRecognizeResult && (
        <button onClick={confirmOcr}
          disabled={!text.trim()}
          style={{
            width:'100%', padding:'14px 0', borderRadius:12, fontSize:15, fontWeight:700,
            background: text.trim() ? CLR.active : (dark?'#2A3248':'#E5E7EB'),
            color: text.trim() ? '#fff' : T.mut, border:'none',
            cursor: text.trim() ? 'pointer' : 'not-allowed',
          }}>确认并提交</button>
      )}

      {/* Result */}
      {isDone && (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ background: rCfg.bg, border:`1px solid ${rCfg.bdr}`, borderRadius:12, padding:'14px 16px', display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:10, height:10, borderRadius:'50%', background: rCfg.color, flexShrink:0 }}/>
            <span style={{ color: rCfg.color, fontSize:15, fontWeight:700 }}>{rCfg.label}</span>
            {isRetryCorrect && (
              <span style={{ background:'rgba(26,122,74,0.15)', color: CLR.retryCorrect, fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:6 }}>重试正确</span>
            )}
          </div>

          {q.matchedPoints.length > 0 && (
            <DetailSection dark={dark} icon="✓" label="答对的要点" color={CLR.correct}>
              <ul style={{ margin:0, padding:0, listStyle:'none', display:'flex', flexDirection:'column', gap:4 }}>
                {q.matchedPoints.map((p,i) => (
                  <li key={i} style={{ color: T.sub, fontSize:13, display:'flex', alignItems:'flex-start', gap:8 }}>
                    <span style={{ color: CLR.correct }}>·</span>{p}
                  </li>
                ))}
              </ul>
            </DetailSection>
          )}
          {q.missingPoints.length > 0 && (
            <DetailSection dark={dark} icon="○" label="还缺少的要点" color={CLR.partial}>
              <ul style={{ margin:0, padding:0, listStyle:'none', display:'flex', flexDirection:'column', gap:4 }}>
                {q.missingPoints.map((p,i) => (
                  <li key={i} style={{ color: T.sub, fontSize:13, display:'flex', alignItems:'flex-start', gap:8 }}>
                    <span style={{ color: CLR.partial }}>·</span>{p}
                  </li>
                ))}
              </ul>
            </DetailSection>
          )}
          {q.criticalErrors.length > 0 && (
            <DetailSection dark={dark} icon="✗" label="需要纠正的内容" color={CLR.incorrect}>
              <ul style={{ margin:0, padding:0, listStyle:'none', display:'flex', flexDirection:'column', gap:4 }}>
                {q.criticalErrors.map((p,i) => (
                  <li key={i} style={{ color: T.sub, fontSize:13, display:'flex', alignItems:'flex-start', gap:8 }}>
                    <span style={{ color: CLR.incorrect }}>·</span>{p}
                  </li>
                ))}
              </ul>
            </DetailSection>
          )}

          <div style={{ border:`1px solid ${T.bdr}`, borderRadius:12, overflow:'hidden' }}>
            <button onClick={() => setShowRef(s => !s)} style={{
              background: T.chip, color: T.sub, width:'100%', textAlign:'left',
              padding:'12px 16px', fontSize:13, fontWeight:600, border:'none', cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'space-between',
            }}>
              <span>参考答案</span>
              <span style={{ color: T.mut, fontSize:10 }}>{showRef ? '▲' : '▼'}</span>
            </button>
            {showRef && (
              <div style={{ background: T.card, color: T.sub, padding:'12px 16px 16px', fontSize:13, lineHeight:1.7 }}>
                {q.referenceAnswer}
              </div>
            )}
          </div>

          {q.gradingConfidence === 'low' && (
            <div style={{ background: T.chip, border:`1px solid ${T.bdr}`, borderRadius:12, padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
              <span style={{ color: T.sub, fontSize:12 }}>本题需要进一步验证</span>
              <button style={{ background: CLR.active, color:'#fff', padding:'6px 12px', borderRadius:8, fontSize:12, fontWeight:600, border:'none', cursor:'pointer', flexShrink:0 }}>
                再做一道客观题
              </button>
            </div>
          )}

          <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
            <button onClick={onTraceback} style={{
              display:'flex', alignItems:'center', gap:8, padding:'8px 14px', borderRadius:8, cursor:'pointer',
              background: dark?'rgba(255,255,255,0.08)':'#fff', color: T.sub, border:`1px solid ${T.bdr}`, fontSize:13, fontWeight:500,
            }}><FileText style={{ width:15, height:15 }}/>溯源查看</button>
            {showRedo && (
              <button onClick={redo} style={{
                display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:8, cursor:'pointer',
                background: dark?'rgba(255,255,255,0.05)':'#fff', color: CLR.partial,
                border:`1px solid ${CLR.partialBdr}`, fontSize:13, fontWeight:500,
              }}>重做本题</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DetailSection({ dark, icon, label, color, children }: { dark:boolean; icon:string; label:string; color:string; children:React.ReactNode }) {
  const T = dark ? DK : LT;
  return (
    <div style={{ background: T.card, border:`1px solid ${T.bdr}`, borderRadius:12, padding:16 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
        <span style={{ color, fontSize:13, fontWeight:700 }}>{icon}</span>
        <span style={{ color: T.sub, fontSize:12, fontWeight:600 }}>{label}</span>
      </div>
      {children}
    </div>
  );
}

interface Question {
  id: number;
  mode: PracticeMode;
  text: string;
  options?: string[];
  correctAnswer?: number | boolean;
  explanation: string;
  sources: Source[];
  frontText?: string; // For flashcards
  backText?: string;  // For flashcards
}

interface Source {
  id: number;
  type: 'pdf' | 'ppt' | 'notes';
  name: string;
  snippet: string;
  page?: number;
  /** 导入时的内容快照：命中段落前后的上下文，用于溯源正文渲染 */
  contextBefore?: string;
  contextAfter?: string;
  /** 「打开原笔记（最新）」浮层里展示的最新笔记正文 */
  noteLatest?: string;
}

interface PracticeScreenProps {
  onBack: (forcedMastery?: number) => void;
  onShowReport?: (mode: 'DAILY_COMPLETED' | 'SECTION_EXITED') => void;
  startingPointId?: number;
  dailyHours?: number;
  masteryPercentage?: number;
  remainingKnowledgePoints?: number;
}

export function PracticeScreen({ onBack, onShowReport, startingPointId, dailyHours = 2, masteryPercentage = 65, remainingKnowledgePoints = 100 }: PracticeScreenProps) {
  const showExitReport = (mode: 'DAILY_COMPLETED' | 'SECTION_EXITED') => {
    if (onShowReport) onShowReport(mode);
    else onBack();
  };
  const [currentMode, setCurrentMode] = useState<PracticeMode>('mcq');
  const [darkMode, setDarkMode] = useState(false);
  // Map startingPointId to valid question index (default to 0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [aiPosition, setAiPosition] = useState(() => {
    // 悬浮窗宽 = 1/3 屏宽、上下留白 16px：默认贴右、顶部留白
    const w = typeof window !== 'undefined' ? window.innerWidth : 1280;
    return { x: Math.max(16, Math.round(w - w / 3 - 24)), y: 16 };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [activeSource, setActiveSource] = useState<Source | null>(null);
  const [showSourceList, setShowSourceList] = useState(false);
  // Rich AI chat state (replaces old chatMessages)
  const [richMessages, setRichMessages] = useState<AiMessage[]>([]);
  const [panelTab, setPanelTab] = useState<'chat' | 'traceback'>('chat');
  // 分屏线：右面板占比吸附四挡 收起(0) / 1/3(默认) / 1/2 / 2/3；拖拽松手吸附，收起箭头一键整体收起
  const PANEL_SNAPS = [0, 1 / 3, 1 / 2, 2 / 3];
  const [panelFrac, setPanelFrac] = useState(1 / 3);
  const [dragFrac, setDragFrac] = useState<number | null>(null); // 拖拽中的实时占比（松手吸附）
  const lastPanelFrac = useRef(1 / 3);                            // 收起前档位，重新展开时恢复
  const splitRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null); // 溯源长按选中计时

  // 分屏线 / 薄手柄按下：拖动实时跟手，松手吸附最近档位；未拖动视为单击执行 onPlainClick
  const startSplitDrag = (e: React.PointerEvent, onPlainClick?: () => void) => {
    e.preventDefault();
    const rect = splitRef.current?.getBoundingClientRect();
    if (!rect) return;
    const startX = e.clientX;
    let moved = false;
    const calc = (x: number) => Math.min(0.72, Math.max(0, (rect.right - x) / rect.width));
    const move = (ev: PointerEvent) => {
      if (!moved && Math.abs(ev.clientX - startX) > 4) moved = true;
      if (moved) setDragFrac(calc(ev.clientX));
    };
    const up = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      setDragFrac(null);
      if (!moved) { onPlainClick?.(); return; }
      const f = calc(ev.clientX);
      const snapped = PANEL_SNAPS.reduce((a, b) => (Math.abs(b - f) < Math.abs(a - f) ? b : a));
      setPanelFrac(snapped);
      if (snapped > 0) lastPanelFrac.current = snapped;
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const panelFracLive = dragFrac ?? panelFrac; // 渲染用占比（拖拽中为实时值）
  // 溯源面板：划词标记 + 打开原笔记浮层
  const [selectionText, setSelectionText] = useState('');           // 当前划词选中的文字
  const [markBtnPos, setMarkBtnPos] = useState<{ x: number; y: number } | null>(null); // 「标记」浮出按钮位置
  const [highlights, setHighlights] = useState<string[]>([]);       // 已标记（批注高亮）的文字片段
  const [showNoteOverlay, setShowNoteOverlay] = useState(false);    // 「打开原笔记（最新）」浮层
  const [showSourceDropdown, setShowSourceDropdown] = useState(false); // 来源切换下拉选单（平板端）
  const [markMode, setMarkMode] = useState(false);                  // 标记态：长按选中出工具栏
  const [markToolbar, setMarkToolbar] = useState<{ text: string; x: number; y: number } | null>(null); // 长按浮出的标记工具栏
  const [markSaved, setMarkSaved] = useState(false);                // 「已写入原笔记」提示
  // Fullscreen AI overlay
  const [showAiFullscreen, setShowAiFullscreen] = useState(false);
  const [aiFullscreenMode, setAiFullscreenMode] = useState<FullscreenMode>('voluntary');
  const [aiFullscreenStarted, setAiFullscreenStarted] = useState(false);
  const [aiFullscreenMessages, setAiFullscreenMessages] = useState<AiMessage[]>([]);
  // Entry triggers
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);
  const [cumulativeWrong, setCumulativeWrong] = useState(0);
  const [showThreeWrongBanner, setShowThreeWrongBanner] = useState(false);
  const [threeWrongDismissed, setThreeWrongDismissed] = useState(false);
  // Floating window
  const [showFloatingChat, setShowFloatingChat] = useState(false);
  const [floatingMessages, setFloatingMessages] = useState<AiMessage[]>([]);
  const [aiMinimized, setAiMinimized] = useState(false);
  // Legacy compat
  const [chatInput, setChatInput] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  const [mastery, setMastery] = useState(0.65);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [showDebugMenu, setShowDebugMenu] = useState(false);
  const [followUpMode, setFollowUpMode] = useState(false);
  const [showMiniBar, setShowMiniBar] = useState(false);
  
  // Network error states
  const [networkError, setNetworkError] = useState(false);
  const [cacheExhausted, setCacheExhausted] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  
  // Timer states (positive count-up timer)
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showDailyGoalPopup, setShowDailyGoalPopup] = useState(false);
  const dailyGoalSeconds = dailyHours * 60 * 60; // Convert hours to seconds
  
  // Mastery change indicator
  const [masteryChange, setMasteryChange] = useState<number | null>(null);
  const [showMasteryChange, setShowMasteryChange] = useState(false);
  
  // Milestone tracking
  const [masteredPoints, setMasteredPoints] = useState(0);
  const [totalPoints] = useState(100); // Total knowledge points in the course
  const [showMilestone, setShowMilestone] = useState<MilestoneType | null>(null);
  const [achievedMilestones, setAchievedMilestones] = useState<Set<MilestoneType>>(new Set());
  
  // Knowledge Point Mastered Popup
  const [showKnowledgePointMastered, setShowKnowledgePointMastered] = useState(false);
  const [currentKnowledgePointName] = useState('受贿罪的既遂标准');
  const [remainingPointsCount, setRemainingPointsCount] = useState(remainingKnowledgePoints || 15);
  
  // Bookmark states
  const [favQuestion, setFavQuestion] = useState(false);
  const [favExplanation, setFavExplanation] = useState(false);
  const [favToast, setFavToast] = useState(false);

  const aiRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const focusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const favToastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mock questions
  const questions: Question[] = [
    {
      id: 1,
      mode: 'mcq',
      text: '关于受贿罪既遂的认定，下列说法正确的是？',
      options: [
        '必须实际取得财物并办成请托事项才既遂',
        '国家工作人员实际控制财物即既遂，是否办成事在所不问',
        '收受转账支票但未提现的，一律认定为未遂',
        '只要有收受财物的意思表示即构成既遂'
      ],
      correctAnswer: 1,
      explanation: '受贿罪的既遂标准是国家工作人员实际取得对财物的控制，不要求把钱花掉，也不要求办成请托事项。收受转账支票即已取得控制力，是否提现不影响既遂认定。故选 B。',
      sources: [
        { id: 1, type: 'ppt', name: '刑法分论·贿赂犯罪 第7讲.pptx', snippet: '受贿罪既遂以行为人实际控制财物为标准，不以提现或办成请托事项为要件……', page: 27,
          contextBefore: '受贿罪的停止形态是历年考试重点。判断既遂与未遂，关键看行为人是否已经实际取得对财物的控制。',
          contextAfter: '因此，收受银行卡并掌握密码、收受存折、收受转账支票等，均已取得控制，属于既遂；财物在途中被截获、当场拒收上交的，属于未遂。',
          noteLatest: '受贿罪既遂标准（最新整理）：\n\n1. 核心：实际控制财物即既遂，不要求提现、不要求办成事。\n2. 收受转账支票 → 取得控制 → 既遂。\n3. 对比：因意志以外原因未能控制 → 未遂。\n4. 补充：新司法解释强调「财物」包括财产性利益。' },
        { id: 2, type: 'pdf', name: '刑法分论讲义.pdf', snippet: '第385条：国家工作人员利用职务上的便利，索取他人财物，或者非法收受他人财物为他人谋取利益的……', page: 142,
          contextBefore: '受贿罪规定于刑法第385条至第388条之一。基本犯为第385条第1款。',
          contextAfter: '据此，受贿罪的客观方面包括「利用职务便利」与「收受或索取财物」两个核心要素。' }
      ]
    },
    {
      id: 2,
      mode: 'truefalse',
      text: '国家工作人员仅凭私人感情、未利用任何职务便利为他人办事并收受财物的，构成受贿罪。',
      correctAnswer: false,
      explanation: '错误。受贿罪以「利用职务便利」为必备客观要件。纯凭私人感情、未利用职务便利为他人办事的，缺少该要件，不构成受贿罪。',
      sources: [
        { id: 3, type: 'notes', name: '学习笔记 - 受贿罪构成要件', snippet: '要点：利用职务便利是受贿罪的必备要件，私人影响力不属于职务便利……' }
      ]
    },
    {
      id: 3,
      mode: 'flashcard',
      frontText: '受贿罪中「利用职务便利」具体指什么？',
      backText: '指利用本人职务范围内的权力，或利用职务、地位形成的便利条件，通过第三人职务行为为请托人谋利（后者即斡旋型受贿）。\n\n• 包括本人主管、负责、承办某项公共事务的职权\n• 包括利用职务、地位形成的便利条件（斡旋受贿）\n• 不含单纯的亲友关系、私人影响力\n\n这是区分受贿罪与非罪、以及与利用影响力受贿罪的关键。',
      text: '受贿罪中「利用职务便利」具体指什么？',
      explanation: '',
      sources: [
        { id: 4, type: 'pdf', name: '刑法分论讲义.pdf', snippet: '「利用职务上的便利」，是指利用本人职务范围内的权力，或者利用职务、地位形成的便利条件……', page: 203 }
      ]
    },
    {
      id: 4,
      mode: 'fill_blank',
      text: '受贿罪的主体必须是 ___。',
      explanation: '受贿罪属于身份犯，主体必须是国家工作人员。',
      sources: [
        { id: 5, type: 'pdf', name: '刑法分论讲义.pdf', snippet: '第385条：国家工作人员利用职务上的便利索取或非法收受他人财物…', page: 112 }
      ]
    },
    {
      id: 5,
      mode: 'multiple_choice',
      text: '以下哪些属于受贿罪中利用职务便利的情形？',
      explanation: 'A、C、D 均属于利用职务便利。B 属于利用影响力受贿情形。',
      sources: [
        { id: 6, type: 'notes', name: '受贿罪要点梳理', snippet: '利用职务便利包括直接权力、主管事项、制约关系三种情形…' }
      ]
    },
    {
      id: 6,
      mode: 'short_answer',
      text: "简述受贿罪中「为他人谋取利益」的认定方式。",
      explanation: '为他人谋取利益包括实际谋利、承诺谋利、明知请托事项三种认定情形。',
      sources: [
        { id: 7, type: 'pdf', name: '刑法分论讲义.pdf', snippet: '为他人谋取利益的认定：实际实施、承诺、明知…', page: 115 }
      ]
    }
  ];

  // Handle retry/refresh
  const handleRetry = async () => {
    setIsRetrying(true);
    
    // Simulate network request
    setTimeout(() => {
      // In production, this would actually try to fetch new questions
      // For now, we'll just reset the error states
      setNetworkError(false);
      setCacheExhausted(false);
      setIsRetrying(false);
    }, 1500);
  };

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  // Handle answer selection
  const handleAnswerSelect = (answer: number | boolean) => {
    setSelectedAnswer(answer);
    setShowFeedback(true);
    
    // Calculate mastery change
    const correct = answer === currentQuestion.correctAnswer;
    const change = correct ? 3 : -3;
    setMasteryChange(change);
    setShowMasteryChange(true);
    
    // If correct answer, increment mastered points and check for milestones
    if (correct) {
      const newMasteredPoints = masteredPoints + 1;
      setMasteredPoints(newMasteredPoints);
      checkMilestones(newMasteredPoints);
    }
    
    // Hide the change indicator after 2 seconds
    setTimeout(() => {
      setShowMasteryChange(false);
    }, 2000);
  };

  // Check for milestones
  const checkMilestones = (currentMastered: number) => {
    const percentage = Math.floor((currentMastered / totalPoints) * 100);
    
    // First mastered point
    if (currentMastered === 1 && !achievedMilestones.has('first_mastered')) {
      setTimeout(() => {
        setShowMilestone('first_mastered');
        setAchievedMilestones(prev => new Set(prev).add('first_mastered'));
      }, 1500); // Delay to show feedback first
      return;
    }
    
    // Progress milestones
    const milestoneChecks: { threshold: number; type: MilestoneType }[] = [
      { threshold: 20, type: 'progress_20' },
      { threshold: 40, type: 'progress_40' },
      { threshold: 60, type: 'progress_60' },
      { threshold: 80, type: 'progress_80' }
    ];
    
    for (const { threshold, type } of milestoneChecks) {
      if (percentage >= threshold && !achievedMilestones.has(type)) {
        setTimeout(() => {
          setShowMilestone(type);
          setAchievedMilestones(prev => new Set(prev).add(type));
        }, 1500); // Delay to show feedback first
        return;
      }
    }
  };

  const handleMilestoneContinue = () => {
    setShowMilestone(null);
  };
  
  // Handle next question
  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setActiveSource(null);
      setShowSourceList(false);
      setIsFlipped(false);
    }
  };

  // Handle flashcard flip
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    setShowFeedback(!isFlipped);
  };

  // Handle source traceback
  const handleTraceback = () => {
    if (currentQuestion.sources.length > 0) {
      setShowSourceList(true);
      setActiveSource(null); // Start with list view
    }
  };

  // Handle source selection from list
  const handleSourceSelect = (source: Source) => {
    setActiveSource(source);
    setShowSourceList(false); // Hide list, show detail
  };

  // Back to source list
  const handleBackToSourceList = () => {
    setActiveSource(null);
    setShowSourceList(true);
  };

  // Close source panel completely
  const handleCloseSource = () => {
    setActiveSource(null);
    setShowSourceList(false);
  };

  // Handle Ask Follow-up
  const handleAskFollowup = () => {
    // Don't open floating window, just enable follow-up mode
    setFollowUpMode(true);
    setShowSourceList(false);
    setActiveSource(null);
    // Focus the input
    focusTimeoutRef.current = setTimeout(() => {
      chatInputRef.current?.focus();
    }, 100);
  };

  // Pop right-panel chat out to floating window
  const handlePopOut = () => {
    setFloatingMessages([...richMessages]);
    setShowFloatingChat(true);
    setAiMinimized(false);
  };

  // Send to panel chat
  const handlePanelSend = useCallback((text: string) => {
    const userMsg: AiMessage = { role: 'user', blocks: [{ type: 'markdown', md: text }] };
    setRichMessages(prev => [...prev, userMsg]);
  }, []);

  // Send to fullscreen chat
  const handleFullscreenSend = useCallback((text: string) => {
    const userMsg: AiMessage = { role: 'user', blocks: [{ type: 'markdown', md: text }] };
    setAiFullscreenMessages(prev => [...prev, userMsg]);
  }, []);

  // Send to floating chat
  const handleFloatingSend = useCallback((text: string) => {
    const userMsg: AiMessage = { role: 'user', blocks: [{ type: 'markdown', md: text }] };
    setFloatingMessages(prev => [...prev, userMsg]);
  }, []);

  // Legacy send (no-op kept for compile compat)
  const handleSendMessage = () => {};

  // Dragging logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if (aiRef.current) {
      setIsDragging(true);
      const rect = aiRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  // Reset bookmarks when question changes
  useEffect(() => {
    setFavQuestion(false);
    setFavExplanation(false);
  }, [currentQuestionIndex]);

  const triggerFavToast = () => {
    setFavToast(true);
    if (favToastTimer.current) clearTimeout(favToastTimer.current);
    favToastTimer.current = setTimeout(() => setFavToast(false), 2000);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setAiPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  useEffect(() => {
    // Reset state when startingPointId changes (new session)
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setRichMessages([]);
    setShowSourceList(false);
    setActiveSource(null);
    setIsFlipped(false);
    // Reset timer for new session
    setElapsedSeconds(0);
    setShowDailyGoalPopup(false);
  }, [startingPointId]);

  // Timer effect (count up)
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(prev => {
        const newTime = prev + 1;
        // Check if daily goal is reached
        if (newTime >= dailyGoalSeconds && !showDailyGoalPopup) {
          setShowDailyGoalPopup(true);
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [dailyGoalSeconds, showDailyGoalPopup]);

  // Cleanup focus timeout on unmount
  useEffect(() => {
    return () => {
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
      }
    };
  }, []);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Minimalist Header */}
      <div className="border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-center">
          {/* Center - Debug Button, Study Time */}
          <div className="flex items-center gap-6">
            {/* Debug Trigger */}
            <div className="relative">
              <button
                onClick={() => setShowDebugMenu(!showDebugMenu)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors ${showDebugMenu ? 'bg-yellow-100 text-yellow-600' : 'text-gray-400 hover:text-yellow-600'}`}
                title="Debug Mastery Triggers"
              >
                <Zap className="w-4 h-4" />
                调试按钮
              </button>
              
              {showDebugMenu && (
                <div className="absolute left-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-slideDown origin-top-left overflow-y-auto max-h-[80vh]">
                  {/* ── AI 富文本对话 — FIRST ── */}
                  <div className="px-4 py-2 border-b border-gray-100 mb-1">
                    <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">AI 富文本对话</p>
                  </div>
                  {/* 面板：加载受贿罪全量演示对话 */}
                  <button
                    onClick={() => {
                      setShowDebugMenu(false);
                      setRichMessages(SHOUHUI_DEMO);
                      setPanelTab('chat');
                    }}
                    className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0"></span>
                    受贿罪既遂（面板富对话）
                  </button>
                  {/* 全屏·主动深度学习 */}
                  <button
                    onClick={() => {
                      setShowDebugMenu(false);
                      setAiFullscreenMode('voluntary');
                      setAiFullscreenMessages(SHOUHUI_DEMO);
                      setAiFullscreenStarted(true);
                      setShowAiFullscreen(true);
                    }}
                    className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-violet-500 shrink-0"></span>
                    全屏·深度学习（主动入口）
                  </button>
                  {/* 全屏·20错强干预 */}
                  <button
                    onClick={() => {
                      setShowDebugMenu(false);
                      setAiFullscreenMode('forced_20');
                      setAiFullscreenMessages([]);
                      setAiFullscreenStarted(false);
                      setShowAiFullscreen(true);
                    }}
                    className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-red-400 shrink-0"></span>
                    全屏·20错强干预（二选一）
                  </button>
                  {/* 悬浮窗 */}
                  <button
                    onClick={() => {
                      setShowDebugMenu(false);
                      setFloatingMessages(SHOUHUI_DEMO.slice(0, 2));
                      setShowFloatingChat(true);
                      setAiMinimized(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0"></span>
                    悬浮窗（降级演示）
                  </button>
                  {/* 3连错横幅 */}
                  <button
                    onClick={() => {
                      setShowDebugMenu(false);
                      setConsecutiveWrong(3);
                      setShowThreeWrongBanner(true);
                      setThreeWrongDismissed(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
                    触发「连续错3次」提示
                  </button>

                  {/* ── Simulate Mastery ── */}
                  <div className="border-t border-gray-100 my-1"></div>
                  <div className="px-4 py-2 border-b border-gray-100 mb-1">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Simulate Mastery</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowDebugMenu(false);
                      onBack(80);
                    }}
                    className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 transition-colors flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                    Trigger 80% Pivot
                  </button>
                  <button
                    onClick={() => {
                      setShowDebugMenu(false);
                      onBack(100);
                    }}
                    className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Trigger 100% Complete
                  </button>
                  
                  <div className="border-t border-gray-100 my-1"></div>
                  <div className="px-4 py-2">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Milestones</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowDebugMenu(false);
                      setShowMilestone('first_mastered');
                    }}
                    className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 transition-colors flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                    First Point Mastered
                  </button>
                  <button
                    onClick={() => {
                      setShowDebugMenu(false);
                      setShowMilestone('progress_20');
                    }}
                    className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    20% Progress
                  </button>
                  <button
                    onClick={() => {
                      setShowDebugMenu(false);
                      setShowMilestone('progress_40');
                    }}
                    className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    40% Progress
                  </button>
                  <button
                    onClick={() => {
                      setShowDebugMenu(false);
                      setShowMilestone('progress_60');
                    }}
                    className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    60% Progress
                  </button>
                  <button
                    onClick={() => {
                      setShowDebugMenu(false);
                      setShowMilestone('progress_80');
                    }}
                    className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    80% Progress
                  </button>
                  
                  <div className="border-t border-gray-100 my-1"></div>
                  <div className="px-4 py-2">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Error States</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowDebugMenu(false);
                      setNetworkError(true);
                    }}
                    className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    Network Error
                  </button>
                  <button
                    onClick={() => {
                      setShowDebugMenu(false);
                      setCacheExhausted(true);
                    }}
                    className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    Cache Exhausted
                  </button>
                  
                  <div className="border-t border-gray-100 my-1"></div>
                  <div className="px-4 py-2">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Achievement</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowDebugMenu(false);
                      setShowDailyGoalPopup(true);
                    }}
                    className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 transition-colors flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                    Daily Goal Achieved
                  </button>
                  <button
                    onClick={() => {
                      setShowDebugMenu(false);
                      setShowKnowledgePointMastered(true);
                    }}
                    className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Knowledge Point Mastered
                  </button>

                  <div className="border-t border-gray-100 my-1"></div>
                  <div className="px-4 py-2">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">题型切换</p>
                  </div>
                  {[
                    { label: '填空题（受贿罪主体）', idx: 3, color: '#2D8CFF' },
                    { label: '多选题（职务便利）', idx: 4, color: '#7C3AED' },
                    { label: '简答题（谋利认定）', idx: 5, color: '#059669' },
                  ].map(({ label, idx, color }) => (
                    <button key={idx}
                      onClick={() => {
                        setShowDebugMenu(false);
                        setCurrentQuestionIndex(idx);
                        setSelectedAnswer(null);
                        setShowFeedback(false);
                        setIsFlipped(false);
                        setActiveSource(null);
                        setShowSourceList(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-blue-50 transition-colors flex items-center gap-2"
                    >
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display:'inline-block', flexShrink: 0 }}></span>
                      {label}
                    </button>
                  ))}

                </div>
              )}
            </div>

            <div className="text-[13px] text-[#666] font-medium">
              Study Time: <span className="font-bold text-[#333]">{formatTime(elapsedSeconds)}</span>
            </div>

            <button
              onClick={() => setDarkMode(d => !d)}
              title={darkMode ? '切换亮色' : '切换暗色'}
              className="p-1.5 rounded-lg text-[#999] hover:text-[#555] hover:bg-gray-100 transition-colors"
            >
              {darkMode ? <Sun className="w-4 h-4"/> : <Moon className="w-4 h-4"/>}
            </button>

            <button
              onClick={() => showExitReport('SECTION_EXITED')}
              className="text-[13px] text-[#999] hover:text-[#666] font-medium transition-colors"
            >
              End Session
            </button>
          </div>
        </div>
      </div>

      {/* Split Screen Layout — 分屏线拖拽吸附四挡：收起 / 1/3(默认) / 1/2 / 2/3 */}
      <div ref={splitRef} className="flex-1 flex overflow-hidden">
        {/* Left Panel — Workspace（占余下全部宽度） */}
        <div className="flex-1 min-w-0 flex flex-col relative" style={{ background: darkMode ? DK.bg : '#ffffff' }}>
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto px-12 py-8">
            <div className="flex items-center justify-center min-h-full">
            
            {/* Network Error State */}
            {(networkError || cacheExhausted) ? (
              <div className="w-full max-w-[500px] text-center">
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-24 h-24 bg-red-50 rounded-2xl mb-6">
                  <WifiOff className="w-12 h-12 text-red-500" />
                </div>

                {/* Title */}
                <h2 className="text-[24px] font-bold text-[#333] mb-3">
                  {networkError ? 'No Internet Connection' : 'Cache Exhausted'}
                </h2>

                {/* Description */}
                <p className="text-[15px] text-[#666] leading-relaxed mb-8">
                  {networkError 
                    ? 'Unable to load new questions. Please check your internet connection and try again.'
                    : 'All cached questions have been completed. Please connect to the internet to load more questions.'
                  }
                </p>

                {/* Refresh Button */}
                <button
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[#2D8CFF] text-white rounded-xl text-[15px] font-bold hover:bg-[#1D7CEF] shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-5 h-5 ${isRetrying ? 'animate-spin' : ''}`} />
                  {isRetrying ? 'Refreshing...' : 'Refresh'}
                </button>

                {/* Secondary Action */}
                <div className="mt-6">
                  <button
                    onClick={() => onBack()}
                    className="text-[13px] text-[#666] hover:text-[#333] font-medium transition-colors"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>
            ) : (
              <>
            {/* MCQ Mode */}
            {currentQuestion.mode === 'mcq' && (
              <div className="w-full max-w-[600px] space-y-6">
                <div>
                  <h2 className="text-[22px] font-bold text-[#333] leading-relaxed mb-3">
                    {currentQuestion.text}
                  </h2>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => {
                        const newFlagged = new Set(flaggedQuestions);
                        if (newFlagged.has(currentQuestion.id)) {
                          newFlagged.delete(currentQuestion.id);
                        } else {
                          newFlagged.add(currentQuestion.id);
                        }
                        setFlaggedQuestions(newFlagged);
                      }}
                      className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors ${
                        flaggedQuestions.has(currentQuestion.id)
                          ? 'text-yellow-600'
                          : 'text-[#999] hover:text-[#666]'
                      }`}
                    >
                      <Flag className={`w-3.5 h-3.5 ${flaggedQuestions.has(currentQuestion.id) ? 'fill-yellow-600' : ''}`} />
                      {flaggedQuestions.has(currentQuestion.id) ? 'Flagged for review' : 'Flag for review'}
                    </button>
                    <button
                      onClick={() => { setFavQuestion(v => { if (!v) triggerFavToast(); return !v; }); }}
                      className="flex items-center gap-1 text-[11px] font-medium transition-colors"
                      style={{ color: favQuestion ? '#FDC700' : '#999' }}
                    >
                      <span style={{ fontSize: 13 }}>{favQuestion ? '★' : '☆'}</span>
                      收藏题目
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {currentQuestion.options?.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={showFeedback}
                      className={`w-full text-left px-6 py-4 rounded-xl border-2 text-[15px] font-medium transition-all ${
                        selectedAnswer === index
                          ? showFeedback
                            ? isCorrect
                              ? 'border-green-500 bg-green-50 text-green-900'
                              : 'border-red-500 bg-red-50 text-red-900'
                            : 'border-yellow-400 bg-yellow-50 text-[#333]'
                          : 'border-gray-200 hover:border-gray-300 text-[#666]'
                      }`}
                    >
                      <span className="mr-3 text-[#999] font-semibold">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      {option}
                    </button>
                  ))}
                </div>

                {/* Feedback Section */}
                {showFeedback && (
                  <div className="mt-8 space-y-4 animate-slideDown">
                    <div className={`rounded-xl p-6 ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className={`text-[14px] font-bold ${isCorrect ? 'text-green-900' : 'text-red-900'}`}>
                          {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                        </div>
                        <button
                          onClick={() => { setFavExplanation(v => { if (!v) triggerFavToast(); return !v; }); }}
                          className="flex items-center gap-1 text-[11px] font-medium transition-colors"
                          style={{ color: favExplanation ? '#FDC700' : '#999' }}
                        >
                          <span style={{ fontSize: 13 }}>{favExplanation ? '★' : '☆'}</span>
                          收藏解析
                        </button>
                      </div>
                      <p className="text-[14px] text-[#333] leading-relaxed mb-4">
                        {currentQuestion.explanation}
                      </p>

                      {/* Traceback button inside feedback */}
                      <button
                        onClick={handleTraceback}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-[13px] font-medium text-[#666] hover:text-[#333] hover:border-gray-300 transition-all"
                      >
                        <FileText className="w-4 h-4" />
                        Traceback to Source
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* True/False Mode */}
            {currentQuestion.mode === 'truefalse' && (
              <div className="w-full max-w-[600px] space-y-6">
                <div>
                  <h2 className="text-[22px] font-bold text-[#333] leading-relaxed mb-3">
                    {currentQuestion.text}
                  </h2>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => {
                        const newFlagged = new Set(flaggedQuestions);
                        if (newFlagged.has(currentQuestion.id)) {
                          newFlagged.delete(currentQuestion.id);
                        } else {
                          newFlagged.add(currentQuestion.id);
                        }
                        setFlaggedQuestions(newFlagged);
                      }}
                      className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors ${
                        flaggedQuestions.has(currentQuestion.id)
                          ? 'text-yellow-600'
                          : 'text-[#999] hover:text-[#666]'
                      }`}
                    >
                      <Flag className={`w-3.5 h-3.5 ${flaggedQuestions.has(currentQuestion.id) ? 'fill-yellow-600' : ''}`} />
                      {flaggedQuestions.has(currentQuestion.id) ? 'Flagged for review' : 'Flag for review'}
                    </button>
                    <button
                      onClick={() => { setFavQuestion(v => { if (!v) triggerFavToast(); return !v; }); }}
                      className="flex items-center gap-1 text-[11px] font-medium transition-colors"
                      style={{ color: favQuestion ? '#FDC700' : '#999' }}
                    >
                      <span style={{ fontSize: 13 }}>{favQuestion ? '★' : '☆'}</span>
                      收藏题目
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleAnswerSelect(true)}
                    disabled={showFeedback}
                    className={`px-8 py-6 rounded-xl border-2 text-[18px] font-bold transition-all ${
                      selectedAnswer === true
                        ? showFeedback
                          ? isCorrect
                            ? 'border-green-500 bg-green-50 text-green-900'
                            : 'border-red-500 bg-red-50 text-red-900'
                          : 'border-yellow-400 bg-yellow-50 text-[#333]'
                        : 'border-gray-200 hover:border-gray-300 text-[#666]'
                    }`}
                  >
                    TRUE
                  </button>
                  <button
                    onClick={() => handleAnswerSelect(false)}
                    disabled={showFeedback}
                    className={`px-8 py-6 rounded-xl border-2 text-[18px] font-bold transition-all ${
                      selectedAnswer === false
                        ? showFeedback
                          ? isCorrect
                            ? 'border-green-500 bg-green-50 text-green-900'
                            : 'border-red-500 bg-red-50 text-red-900'
                          : 'border-yellow-400 bg-yellow-50 text-[#333]'
                        : 'border-gray-200 hover:border-gray-300 text-[#666]'
                    }`}
                  >
                    FALSE
                  </button>
                </div>

                {/* Feedback Section */}
                {showFeedback && (
                  <div className="mt-8 space-y-4 animate-slideDown">
                    <div className={`rounded-xl p-6 ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className={`text-[14px] font-bold ${isCorrect ? 'text-green-900' : 'text-red-900'}`}>
                          {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                        </div>
                        <button
                          onClick={() => { setFavExplanation(v => { if (!v) triggerFavToast(); return !v; }); }}
                          className="flex items-center gap-1 text-[11px] font-medium transition-colors"
                          style={{ color: favExplanation ? '#FDC700' : '#999' }}
                        >
                          <span style={{ fontSize: 13 }}>{favExplanation ? '★' : '☆'}</span>
                          收藏解析
                        </button>
                      </div>
                      <p className="text-[14px] text-[#333] leading-relaxed mb-4">
                        {currentQuestion.explanation}
                      </p>

                      {/* Traceback button inside feedback */}
                      <button
                        onClick={handleTraceback}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-[13px] font-medium text-[#666] hover:text-[#333] hover:border-gray-300 transition-all"
                      >
                        <FileText className="w-4 h-4" />
                        Traceback to Source
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Flashcard Mode */}
            {currentQuestion.mode === 'flashcard' && (
              <div className="w-full max-w-[600px]">
                <div 
                  onClick={handleFlip}
                  className="relative cursor-pointer"
                  style={{ perspective: '1000px' }}
                >
                  <div 
                    className={`relative w-full min-h-[320px] rounded-2xl border-2 border-gray-200 bg-white shadow-lg transition-all duration-500 ${
                      isFlipped ? 'rotate-y-180' : ''
                    }`}
                    style={{
                      transformStyle: 'preserve-3d',
                      transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                    }}
                  >
                    {/* Front */}
                    <div 
                      className="absolute inset-0 flex flex-col items-center justify-center p-10"
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      <h3 className="text-[20px] font-bold text-[#333] text-center mb-4">
                        {currentQuestion.frontText}
                      </h3>
                      <p className="text-[13px] text-[#999] mt-8">Tap to reveal answer</p>
                    </div>

                    {/* Back */}
                    <div 
                      className="absolute inset-0 flex flex-col items-center justify-center p-10 bg-blue-50"
                      style={{ 
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)'
                      }}
                    >
                      <div className="text-[15px] text-[#333] leading-relaxed whitespace-pre-line">
                        {currentQuestion.backText}
                      </div>
                      <p className="text-[13px] text-[#666] mt-8">Tap to flip back</p>
                    </div>
                  </div>
                </div>

                {/* Secondary Actions */}
                {isFlipped && (
                  <div className="mt-6 flex items-center gap-3">
                    <button
                      onClick={handleTraceback}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-[13px] font-medium text-[#666] hover:text-[#333] hover:border-gray-300 transition-all"
                    >
                      <FileText className="w-4 h-4" />
                      View Source
                    </button>
                    {!showFloatingChat && (
                      <button
                        onClick={handleAskFollowup}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-[13px] font-medium text-[#666] hover:text-[#333] hover:border-gray-300 transition-all"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Ask Question
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Fill-blank Mode */}
            {currentQuestion.mode === 'fill_blank' && (
              <FillBlankQuestion key={currentQuestion.id} dark={darkMode} onTraceback={() => setShowSourceList(true)} />
            )}

            {/* Multiple-choice Mode */}
            {currentQuestion.mode === 'multiple_choice' && (
              <MultiSelectQuestion key={currentQuestion.id} dark={darkMode} onTraceback={() => setShowSourceList(true)} />
            )}

            {/* Short-answer Mode */}
            {currentQuestion.mode === 'short_answer' && (
              <ShortAnswerQuestion key={currentQuestion.id} dark={darkMode} onTraceback={() => setShowSourceList(true)} />
            )}
              </>
            )}
            </div>
          </div>

          {/* Fixed Navigation Bar */}
          <div className="border-t border-gray-200 bg-white px-12 py-4">
            <div className="flex items-center justify-between max-w-[600px] mx-auto">
              <button
                onClick={() => {
                  if (currentQuestionIndex > 0) {
                    setCurrentQuestionIndex(currentQuestionIndex - 1);
                    setSelectedAnswer(null);
                    setShowFeedback(false);
                    setActiveSource(null);
                    setShowSourceList(false);
                    setIsFlipped(false);
                  }
                }}
                disabled={currentQuestionIndex === 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 rounded-lg text-[13px] font-medium text-[#666] hover:text-[#333] hover:border-gray-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-bold text-[#333]">
                  Mastery: {masteryPercentage}%
                </span>
                {showMasteryChange && masteryChange !== null && (
                  <span 
                    className={`text-[13px] font-bold animate-slideDown ${
                      masteryChange > 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {masteryChange > 0 ? '+' : ''}{masteryChange}%
                  </span>
                )}
              </div>
              
              <button
                onClick={handleNext}
                disabled={currentQuestionIndex === totalQuestions - 1}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 rounded-lg text-[13px] font-medium text-[#666] hover:text-[#333] hover:border-gray-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 20 错强制复习：确认阶段只覆盖练习区（右侧溯源/聊天与头部仍可见） */}
          {showAiFullscreen && aiFullscreenMode === 'forced_20' && !aiFullscreenStarted && (
            <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-6">
              <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-2xl p-6 text-center">
                <div className="mb-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-500 text-[11px] font-medium">
                  <Zap className="w-3 h-3" /> 今日已累计答错 20 次
                </div>
                <h2 className="text-[18px] font-bold text-[#333] mb-2">受贿罪的既遂标准</h2>
                <p className="text-[13px] text-[#666] leading-relaxed mb-6">
                  这个知识点今天已经累计答错 20 次。花 5 分钟让 AI 帮你彻底讲清楚，还是先跳过？
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAiFullscreen(false)}
                    className="flex-1 py-2.5 border border-gray-300 rounded-xl text-[13px] font-medium text-[#666] hover:bg-gray-50 transition-colors"
                  >
                    先跳过
                  </button>
                  <button
                    onClick={() => { setAiFullscreenStarted(true); setAiFullscreenMessages(SHOUHUI_DEMO); }}
                    className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 rounded-xl text-[13px] font-bold text-white shadow-md transition-colors"
                  >
                    开始强化学习
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        {panelFracLive > 0 && (
          <div
            onPointerDown={startSplitDrag}
            title="拖动调整面板宽度（吸附 1/3 · 1/2 · 2/3 · 收起）"
            className="relative shrink-0 group"
            style={{ width: 7, cursor: 'col-resize', background: darkMode ? '#2A2A2A' : '#EBEBEB' }}
          >
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] group-hover:bg-[#2D8CFF]/50 transition-colors" />
            <button
              onPointerDown={e => e.stopPropagation()}
              onClick={() => setPanelFrac(0)}
              title="收起右侧面板"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-10 flex items-center justify-center rounded-md border shadow-sm z-10 transition-colors"
              style={{ background: darkMode ? '#333333' : '#ffffff', borderColor: darkMode ? '#444444' : '#E0E0E0', color: darkMode ? '#AAAAAA' : '#999999' }}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Right Panel — AI Tutor + Traceback（宽度=吸附档位占比；收起时隐藏但保留状态） */}
        <div
          className="bg-gray-50 flex flex-col min-w-0 overflow-hidden"
          style={{ width: `${panelFracLive * 100}%`, display: panelFracLive === 0 ? 'none' : undefined }}
        >
          {/* Tab bar */}
          <div className="shrink-0 flex border-b border-gray-200 bg-white">
            {(['chat', 'traceback'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setPanelTab(tab)}
                className={`flex-1 py-3 text-[12px] font-semibold transition-colors border-b-2
                  ${panelTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-400 hover:text-gray-600'}`}
              >
                {tab === 'chat' ? 'AI 聊天' : '溯源 Traceback'}
              </button>
            ))}
          </div>

          {/* AI Chat tab */}
          {panelTab === 'chat' && (
            <AiChatPanel
              messages={richMessages}
              onSend={handlePanelSend}
              onPopOut={handlePopOut}
              onGoPractice={() => setPanelTab('chat')}
            />
          )}

          {/* Traceback tab — source list / detail / empty */}
          {panelTab === 'traceback' && (() => {
            // 当前溯源来源：优先 activeSource，否则取当前题第一个来源
            const src = activeSource ?? currentQuestion.sources[0] ?? null;

            // 划词选择处理（保留鼠标端）：选中文字后「标记」按钮就近浮出
            const handleSourceMouseUp = (e: React.MouseEvent) => {
              if (!markMode) return;
              const sel = window.getSelection();
              const t = sel?.toString().trim() ?? '';
              if (t && t.length > 0) {
                setSelectionText(t);
                setMarkBtnPos({ x: e.clientX, y: e.clientY });
              } else {
                setSelectionText('');
                setMarkBtnPos(null);
              }
            };

            // 长按某段正文：进入标记态并就近浮出「标记高亮 / 取消」工具栏
            const handleLongPressStart = (text: string) => (e: React.PointerEvent) => {
              if (!markMode) return;
              const x = e.clientX, y = e.clientY;
              longPressTimer.current = setTimeout(() => {
                setMarkToolbar({ text, x, y });
              }, 450);
            };
            const handleLongPressCancel = () => {
              if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
            };

            // 命中标记：写入 highlights（同步进原始笔记），提示「已写入原笔记」
            const commitMark = (text: string) => {
              const t = text.trim();
              if (t && !highlights.includes(t)) setHighlights(h => [...h, t]);
              setMarkToolbar(null);
              setMarkSaved(true);
              setTimeout(() => setMarkSaved(false), 1800);
              window.getSelection()?.removeAllRanges();
            };

            // 点击浮出「标记」按钮（鼠标划词路径）
            const applyMark = () => {
              commitMark(selectionText);
              setSelectionText('');
              setMarkBtnPos(null);
            };

            // 把一段正文按已标记的高亮片段渲染成带批注高亮的富文本
            const renderWithHighlights = (text: string) => {
              if (!highlights.length) return text;
              // 依次按每个高亮片段切分
              let segs: React.ReactNode[] = [text];
              highlights.forEach((hl, hi) => {
                const next: React.ReactNode[] = [];
                segs.forEach((seg, si) => {
                  if (typeof seg !== 'string' || !seg.includes(hl)) { next.push(seg); return; }
                  const parts = seg.split(hl);
                  parts.forEach((p, pi) => {
                    if (p) next.push(p);
                    if (pi < parts.length - 1) {
                      next.push(
                        <mark key={`h${hi}-${si}-${pi}`} style={{
                          background: darkMode ? 'rgba(253,199,0,0.28)' : '#FFF3B0',
                          color: darkMode ? '#FDEA3B' : '#7A5B00',
                          borderRadius: 3, padding: '0 2px',
                        }}>{hl}</mark>
                      );
                    }
                  });
                });
                segs = next;
              });
              return <>{segs}</>;
            };

            if (!src) {
              return (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <BookOpen className="w-12 h-12 text-gray-300 mb-3" />
                  <p className="text-[13px] font-semibold text-gray-500 mb-1">溯源 Traceback</p>
                  <p className="text-[12px] text-gray-400 max-w-[200px]">当前题目暂无关联来源</p>
                </div>
              );
            }

            return (
              <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* 头部：来源信息 + 多来源切换（下拉选单） + 固定标记入口 */}
                <div className="border-b border-gray-200 bg-white px-5 py-3 relative">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#2D8CFF] shrink-0" />
                    {/* 当前来源名 + 计数 + ▾（多来源时可点开下拉） */}
                    <button
                      onClick={() => currentQuestion.sources.length > 1 && setShowSourceDropdown(v => !v)}
                      className={`flex items-center gap-1.5 flex-1 min-w-0 text-left ${currentQuestion.sources.length > 1 ? 'hover:opacity-80' : 'cursor-default'}`}
                    >
                      <h3 className="text-[13px] font-bold text-[#333] truncate">{src.name}</h3>
                      {currentQuestion.sources.length > 1 && (
                        <>
                          <span className="text-[10px] text-[#999] shrink-0">{currentQuestion.sources.findIndex(s => s.id === src.id) + 1}/{currentQuestion.sources.length}</span>
                          <ChevronDown className={`w-3.5 h-3.5 text-[#999] shrink-0 transition-transform ${showSourceDropdown ? 'rotate-180' : ''}`} />
                        </>
                      )}
                    </button>
                    {src.page && <span className="text-[11px] text-[#999] shrink-0">第 {src.page} 页</span>}
                    {/* 固定「标记」入口：点击进入标记态，长按正文选中即可标记 */}
                    <button
                      onClick={() => { setMarkMode(m => !m); setMarkToolbar(null); }}
                      title="标记 / 批注"
                      className={`ml-1 p-1.5 rounded-lg shrink-0 transition-colors ${markMode ? 'bg-[#FFF2A8] text-[#B8860B]' : 'text-[#999] hover:bg-gray-100'}`}
                    >
                      <PenLine className="w-4 h-4" />
                    </button>
                  </div>

                  {/* 来源下拉选单：滚动列表，点选切换并收起 */}
                  {showSourceDropdown && currentQuestion.sources.length > 1 && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowSourceDropdown(false)} />
                      <div className="absolute left-5 right-5 top-[calc(100%-4px)] z-50 bg-white border border-gray-200 rounded-xl shadow-xl max-h-[260px] overflow-y-auto py-1">
                        {currentQuestion.sources.map(s => (
                          <button
                            key={s.id}
                            onClick={() => { setActiveSource(s); setShowSourceDropdown(false); }}
                            className={`w-full flex items-center gap-2 px-3 py-2.5 text-left transition-colors ${s.id === src.id ? 'bg-[#EAF3FF]' : 'hover:bg-gray-50'}`}
                          >
                            <span className="text-[13px] shrink-0">{s.type === 'pdf' ? '📄' : s.type === 'ppt' ? '📊' : '📝'}</span>
                            <span className={`text-[12px] flex-1 truncate ${s.id === src.id ? 'font-semibold text-[#2D8CFF]' : 'text-[#333]'}`}>{s.name}</span>
                            {s.page && <span className="text-[10px] text-[#999] shrink-0">第 {s.page} 页</span>}
                            {s.id === src.id && <Check className="w-3.5 h-3.5 text-[#2D8CFF] shrink-0" />}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* 快照提示 + 「打开原笔记（最新）」入口 */}
                <div className="flex items-center justify-between px-5 py-2 bg-gray-50 border-b border-gray-100">
                  <p className="text-[11px] text-[#9AA3B8]">以下为导入时的内容快照</p>
                  {src.noteLatest && (
                    <button
                      onClick={() => setShowNoteOverlay(true)}
                      className="flex items-center gap-1 text-[11px] font-medium text-[#2D8CFF] hover:text-[#1a6fd0]"
                    >
                      <BookOpen className="w-3 h-3" />
                      打开原笔记（最新）
                    </button>
                  )}
                </div>

                {/* 标记态提示条 */}
                {markMode && (
                  <div className="px-5 py-1.5 bg-[#FFF9E6] border-b border-[#FDEEB0] flex items-center gap-1.5">
                    <PenLine className="w-3 h-3 text-[#B8860B]" />
                    <p className="text-[11px] text-[#B8860B]">标记态：长按任意段落选中，再点「标记高亮」</p>
                  </div>
                )}

                {/* 来源正文（标记态下长按段落选中标记） */}
                <div
                  className="flex-1 overflow-y-auto p-5"
                  onMouseUp={handleSourceMouseUp}
                  onPointerUp={handleLongPressCancel}
                  onPointerLeave={handleLongPressCancel}
                >
                  {src.contextBefore && (
                    <p
                      className={`text-[13px] text-[#999] leading-relaxed mb-3 select-text ${markMode ? 'cursor-pointer rounded hover:bg-[#FFF9E6]' : ''}`}
                      onPointerDown={handleLongPressStart(src.contextBefore)}
                    >
                      {renderWithHighlights(src.contextBefore)}
                    </p>
                  )}
                  {/* 当前知识点命中段落：默认高亮定位 */}
                  <div className="bg-[#FFF9E6] border-l-[3px] border-[#FDC700] rounded-r-lg p-3.5 mb-3">
                    <p className="text-[10px] text-[#B8860B] font-bold mb-1.5 tracking-wide">◉ 当前知识点来源</p>
                    <p
                      className={`text-[13px] text-[#333] leading-relaxed font-medium select-text ${markMode ? 'cursor-pointer' : ''}`}
                      onPointerDown={handleLongPressStart(src.snippet)}
                    >
                      {renderWithHighlights(src.snippet)}
                    </p>
                  </div>
                  {src.contextAfter && (
                    <p
                      className={`text-[13px] text-[#999] leading-relaxed mb-3 select-text ${markMode ? 'cursor-pointer rounded hover:bg-[#FFF9E6]' : ''}`}
                      onPointerDown={handleLongPressStart(src.contextAfter)}
                    >
                      {renderWithHighlights(src.contextAfter)}
                    </p>
                  )}
                  <p className="text-[11px] text-[#B0B0B0] text-center py-3">
                    {markMode ? '长按段落选中，点「标记高亮」即同步写入原始笔记' : '点击右上角 ✎ 进入标记态，长按段落即可标记'}
                  </p>
                </div>

                {/* 长按后就近浮出的标记工具栏 */}
                {markToolbar && (
                  <>
                    <div className="fixed inset-0 z-[55]" onClick={() => setMarkToolbar(null)} />
                    <div
                      style={{
                        position: 'fixed',
                        left: Math.min(markToolbar.x, window.innerWidth - 170),
                        top: markToolbar.y + 12,
                        zIndex: 60,
                      }}
                      className="flex items-center gap-1 p-1 bg-[#20242D] rounded-xl shadow-lg"
                    >
                      <button
                        onClick={() => commitMark(markToolbar.text)}
                        className="flex items-center gap-1 px-3 py-1.5 text-white text-[12px] font-medium rounded-lg hover:bg-white/10"
                      >
                        <PenLine className="w-3.5 h-3.5" />
                        标记高亮
                      </button>
                      <button
                        onClick={() => setMarkToolbar(null)}
                        className="px-3 py-1.5 text-white/70 text-[12px] rounded-lg hover:bg-white/10"
                      >
                        取消
                      </button>
                    </div>
                  </>
                )}

                {/* 划词后就近浮出的「标记」按钮（鼠标端） */}
                {selectionText && markBtnPos && (
                  <button
                    onClick={applyMark}
                    style={{
                      position: 'fixed',
                      left: Math.min(markBtnPos.x, window.innerWidth - 90),
                      top: markBtnPos.y + 12,
                      zIndex: 60,
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#333] text-white text-[12px] font-medium rounded-lg shadow-lg hover:bg-black"
                  >
                    <PenLine className="w-3.5 h-3.5" />
                    标记
                  </button>
                )}

                {/* 已写入原笔记提示 */}
                {markSaved && (
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-6 z-[65] flex items-center gap-1.5 px-3.5 py-2 bg-[#20242D] text-white text-[12px] rounded-full shadow-lg">
                    <Check className="w-3.5 h-3.5 text-green-400" />
                    高亮已写入原笔记
                  </div>
                )}

                {/* 「打开原笔记（最新）」浮层 —— 原始笔记详情页样式（与新用户引导一致） */}
                {showNoteOverlay && src.noteLatest && (
                  <OriginalNoteOverlay
                    noteName={src.name}
                    noteLatest={src.noteLatest}
                    onClose={() => setShowNoteOverlay(false)}
                  />
                )}
              </div>
            );
          })()}
        </div>

        {/* 收起态：原分屏线位置留薄手柄，单击或拖出即恢复上次档位 */}
        {panelFracLive === 0 && (
          <div
            onPointerDown={e => startSplitDrag(e, () => setPanelFrac(lastPanelFrac.current || 1 / 3))}
            title="展开右侧面板"
            className="shrink-0 flex items-center justify-center hover:bg-[#2D8CFF]/10 transition-colors"
            style={{ width: 14, cursor: 'col-resize', background: darkMode ? '#2A2A2A' : '#F3F4F6', borderLeft: `1px solid ${darkMode ? '#333333' : '#EBEBEB'}` }}
          >
            <ChevronLeft className="w-3.5 h-3.5" style={{ color: darkMode ? '#888888' : '#999999' }} />
          </div>
        )}
      </div>

      {/* 3-wrong banner — left panel bottom */}
      {showThreeWrongBanner && !threeWrongDismissed && (
        <div className="fixed bottom-20 left-4 right-auto z-40 max-w-[400px] bg-amber-50 border border-amber-200 rounded-2xl shadow-xl p-4">
          <p className="text-[13px] font-semibold text-amber-800 mb-3">
            这个知识点已经连续错了 3 次，要不要找 AI Tutor 帮帮你？
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowThreeWrongBanner(false);
                setRichMessages(SHOUHUI_DEMO);
                setPanelTab('chat');
              }}
              className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white text-[12px] font-semibold rounded-xl transition-colors"
            >
              给我讲解这个知识点
            </button>
            <button
              onClick={() => { setShowThreeWrongBanner(false); setThreeWrongDismissed(true); }}
              className="px-4 py-2 border border-amber-200 text-amber-600 text-[12px] font-medium rounded-xl hover:bg-amber-100 transition-colors"
            >
              暂时不需要
            </button>
          </div>
        </div>
      )}

      {/* Fullscreen AI overlay —— forced_20 的确认阶段改为练习区局部覆盖，仅正式强化学习(started)才走全屏 */}
      {showAiFullscreen && !(aiFullscreenMode === 'forced_20' && !aiFullscreenStarted) && (
        <AiFullscreenOverlay
          mode={aiFullscreenMode}
          conceptName="受贿罪的既遂标准"
          messages={aiFullscreenMessages}
          onSend={handleFullscreenSend}
          onClose={() => setShowAiFullscreen(false)}
          onSkip={() => { setShowAiFullscreen(false); }}
          onStart={() => {
            setAiFullscreenStarted(true);
            setAiFullscreenMessages(SHOUHUI_DEMO);
          }}
          started={aiFullscreenStarted}
          exitQuiz={[
            { stem: '国家工作人员收受存折并掌握密码，但未取款。受贿罪是否既遂？', options: [{ key: 'A', text: '既遂' }, { key: 'B', text: '未遂' }], answer: 'A' },
            { stem: '受贿既遂是否要求请托事项已经办成？', options: [{ key: 'A', text: '要求办成' }, { key: 'B', text: '不要求办成' }], answer: 'B' },
          ]}
          onGoPractice={() => { setShowAiFullscreen(false); setPanelTab('chat'); }}
        />
      )}

      {/* Floating AI window */}
      {showFloatingChat && (
        <AiFloatingWindow
          messages={floatingMessages}
          onSend={handleFloatingSend}
          position={aiPosition}
          onDragEnd={setAiPosition}
          onClose={() => setShowFloatingChat(false)}
          minimized={aiMinimized}
          onToggleMinimize={() => setAiMinimized(m => !m)}
          onGoPractice={() => { setShowFloatingChat(false); setPanelTab('chat'); }}
        />
      )}

      {/* Daily Goal Achievement Popup */}
      {showDailyGoalPopup && (
        <DailyGoalAchievedPopup
          dailyHours={dailyHours}
          masteryPercentage={masteryPercentage}
          remainingKnowledgePoints={remainingKnowledgePoints}
          onContinue={() => setShowDailyGoalPopup(false)}
          onReturnToDashboard={() => {
            setShowDailyGoalPopup(false);
            showExitReport('DAILY_COMPLETED');
          }}
        />
      )}

      {/* Milestone Modal */}
      {showMilestone && (
        <MilestoneModal
          type={showMilestone}
          onContinue={handleMilestoneContinue}
        />
      )}

      {/* Knowledge Point Mastered Popup */}
      {showKnowledgePointMastered && (
        <KnowledgePointMasteredPopup
          knowledgePointName={currentKnowledgePointName}
          remainingPoints={remainingPointsCount}
          onContinue={() => setShowKnowledgePointMastered(false)}
          onExit={() => {
            setShowKnowledgePointMastered(false);
            showExitReport('SECTION_EXITED');
          }}
        />
      )}

      {/* Draft canvas — floating scratch pad, no scoring linkage */}
      <DraftCanvas dark={darkMode} bounds={{ w: 1024, h: 640 }} />

      {/* 收藏 toast */}
      {favToast && (
        <div
          style={{
            position: 'absolute',
            bottom: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            background: darkMode ? 'rgba(30,36,52,0.96)' : 'rgba(28,30,42,0.90)',
            color: '#fff',
            borderRadius: 10,
            padding: '8px 18px',
            fontSize: 13,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            pointerEvents: 'none',
            zIndex: 200,
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
          }}
        >
          <span style={{ color: '#FDC700', fontSize: 15 }}>★</span>
          已加入收藏
        </div>
      )}
    </div>
  );
}

export default PracticeScreen;
