import svgPaths from "@/imports/Container-4/svg-ihs755yiwl";

// ─── tiny reusable SVG pieces from the import ───────────────────────────────

function PdfIconRed() {
  return (
    <svg width="10" height="12" viewBox="0 0 10 11.9965" fill="none">
      <g clipPath="url(#pdfRed)">
        <path d={svgPaths.p11345a00} fill="#FEE2E2" />
        <path d={svgPaths.p28eb8b00} fill="#FCA5A5" />
        <path d={svgPaths.p112d2a00} fill="#FCA5A5" />
        <path d={svgPaths.p2ce6f600} fill="#FCA5A5" />
      </g>
      <defs><clipPath id="pdfRed"><rect width="10" height="11.9965" fill="white" /></clipPath></defs>
    </svg>
  );
}

function PdfIconBlue() {
  return (
    <svg width="10" height="12" viewBox="0 0 10 11.9965" fill="none">
      <g clipPath="url(#pdfBlue)">
        <path d={svgPaths.p11345a00} fill="#DBEAFE" />
        <path d={svgPaths.p28eb8b00} fill="#93C5FD" />
        <path d={svgPaths.p1cb26980} fill="#93C5FD" />
        <path d={svgPaths.pc34cbf0}  fill="#93C5FD" />
      </g>
      <defs><clipPath id="pdfBlue"><rect width="10" height="11.9965" fill="white" /></clipPath></defs>
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 12.9948 12.9948" fill="none">
      <path d={svgPaths.p22b09100} fill="#1C1C1C" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg width="8" height="8" viewBox="0 0 7.99479 7.99479" fill="none">
      <path d={svgPaths.p1b67de00} fill="#FDEA3B" />
    </svg>
  );
}

function DashedArrow() {
  return (
    <svg width="30" height="12" viewBox="0 0 30 11.9965" fill="none">
      <path d="M2.00379 5.99825H21.998" stroke="#E5E7EB" strokeDasharray="3 2.5" strokeWidth="1.49956" />
      <path d={svgPaths.p3ce46800} stroke="#D1D5DB" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.49956" />
    </svg>
  );
}

function SolidArrow() {
  return (
    <svg width="30" height="12" viewBox="0 0 30 11.9965" fill="none">
      <path d="M2.00379 5.99825H21.998" stroke="#FDEA3B" strokeWidth="2.49927" />
      <path d={svgPaths.p3ce46800} stroke="#C9A800" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.99942" />
    </svg>
  );
}

// ─── Left column: chaotic notes ──────────────────────────────────────────────

function ChaoticNotes() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 172 }}>
      {/* Two-card pile */}
      <div style={{ position: 'relative', width: 160, height: 148 }}>

        {/* Back card — tilted, gray */}
        <div style={{
          position: 'absolute', left: 12, top: 19,
          width: 114, background: '#F9FAFB',
          border: '0.6px solid #E5E7EB', borderRadius: 10,
          padding: '8.5px 10.5px',
          transform: 'rotate(-5deg)',
          zIndex: 1,
        }}>
          <div style={{ display: 'flex', gap: 5, alignItems: 'center', marginBottom: 5 }}>
            <PdfIconRed />
            <span style={{ fontSize: 8, color: '#9CA3AF', fontFamily: 'Inter,sans-serif', whiteSpace: 'nowrap' }}>Textbook_Ch3-9.pdf</span>
          </div>
          <div style={{ height: 3, background: '#EEEFF1', borderRadius: 2, marginBottom: 5 }} />
          <div style={{ height: 3, background: '#EEEFF1', borderRadius: 2, width: '75%' }} />
        </div>

        {/* Front card — Anatomy_Notes */}
        <div style={{
          position: 'absolute', left: 17, top: 5,
          width: 122, background: 'white',
          border: '0.6px solid #D1D5DB', borderRadius: 10,
          padding: '8.5px 10.5px',
          transform: 'rotate(-1deg)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.07)',
          zIndex: 2,
        }}>
          <div style={{ display: 'flex', gap: 5, alignItems: 'center', marginBottom: 5 }}>
            <PdfIconBlue />
            <span style={{ fontSize: 8, fontWeight: 600, color: '#374151', fontFamily: 'Inter,sans-serif', whiteSpace: 'nowrap' }}>Anatomy_Notes.pdf</span>
          </div>
          <div style={{ height: 3, background: '#F3F4F6', borderRadius: 2, marginBottom: 3 }} />
          <div style={{ height: 3, background: '#F3F4F6', borderRadius: 2, width: '90%', marginBottom: 3 }} />
          <div style={{ height: 3, background: '#F3F4F6', borderRadius: 2, width: '65%' }} />
        </div>

        {/* ⚠️ Exam badge — top right */}
        <div style={{
          position: 'absolute', top: 0, right: 0, zIndex: 10,
          background: '#FEF2F2', border: '0.6px solid #FCA5A5',
          borderRadius: 20, padding: '3.5px 9.5px',
          fontSize: 9, fontWeight: 700, color: '#EF4444',
          fontFamily: 'Inter,sans-serif', whiteSpace: 'nowrap',
        }}>
          ⚠️ Exam: 7 days
        </div>

        {/* 1000+ pages badge — bottom left */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, zIndex: 10,
          background: '#FFF7ED', border: '0.6px solid #FED7AA',
          borderRadius: 20, padding: '3.5px 9.5px',
          fontSize: 9, fontWeight: 700, color: '#C2410C',
          fontFamily: 'Inter,sans-serif', whiteSpace: 'nowrap',
        }}>
          1,000+ pages
        </div>
      </div>

    </div>
  );
}

// ─── Center column: AI transformation card ───────────────────────────────────

function AiCard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 228 }}>
      <div style={{
        width: 228, background: 'white',
        border: '1.7px solid #FDEA3B', borderRadius: 22,
        overflow: 'hidden',
        boxShadow: '0 0 0 6px rgba(253,234,59,0.09), 0 8px 32px rgba(253,234,59,0.2)',
      }}>

        {/* Top — "6 hours" struck-through */}
        <div style={{
          padding: '16px 24px 14.5px', borderBottom: '0.6px solid #F3F4F6',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}>
          <div style={{
            fontSize: 32, fontWeight: 800, color: '#D1D5DB',
            fontFamily: 'Inter,sans-serif', letterSpacing: '-1.5px',
            textDecoration: 'line-through', lineHeight: 1,
          }}>6 hours</div>
          <div style={{ fontSize: 10, color: '#E5E7EB', fontFamily: 'Inter,sans-serif', marginTop: 3 }}>
            of preparation
          </div>
        </div>

        {/* AI divider */}
        <div style={{
          background: '#FAFAFA', display: 'flex', alignItems: 'center',
          padding: '8px 20px', gap: 8,
        }}>
          <div style={{ flex: 1, height: 1, background: '#EEEFF1' }} />
          <div style={{
            background: '#111827', borderRadius: 20,
            padding: '3px 11px', display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <SparkIcon />
            <span style={{ fontSize: 9, fontWeight: 700, color: 'white', fontFamily: 'Inter,sans-serif', letterSpacing: '0.36px' }}>AI</span>
          </div>
          <div style={{ flex: 1, height: 1, background: '#EEEFF1' }} />
        </div>

        {/* Bottom — "8 min" result */}
        <div style={{
          background: '#FDEA3B', padding: '16px 24px 14px',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}>
          <div style={{
            fontSize: 50, fontWeight: 900, color: '#111827',
            fontFamily: 'Inter,sans-serif', letterSpacing: '-3px', lineHeight: 1,
          }}>8 min</div>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#92680A', fontFamily: 'Inter,sans-serif', marginTop: 2 }}>
            ready to study
          </div>
        </div>
      </div>

    </div>
  );
}

// ─── Right column: study space card ──────────────────────────────────────────

function StudySpaceCard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 172 }}>
      <div style={{
        width: 172, background: 'white',
        border: '1.7px solid #FDEA3B', borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(253,234,59,0.18)',
      }}>

        {/* Header */}
        <div style={{ padding: '14px 16px 12.5px', borderBottom: '0.6px solid #FEF9C3' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8, flexShrink: 0,
              background: 'linear-gradient(135deg, #FDEA3B 0%, #F59E0B 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <StarIcon />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#111827', fontFamily: 'Inter,sans-serif', lineHeight: '16.5px' }}>
                Anatomy Final
              </div>
              <div style={{ fontSize: 9, fontWeight: 600, color: '#22C55E', fontFamily: 'Inter,sans-serif', marginTop: 1, lineHeight: '13.5px' }}>
                ● Ready to study
              </div>
            </div>
          </div>
        </div>

        {/* Today's Goal */}
        <div style={{ background: '#FFFDE7', padding: '10px 16px 12px' }}>
          <div style={{
            fontSize: 8.5, fontWeight: 700, color: '#92680A',
            fontFamily: 'Inter,sans-serif', letterSpacing: '0.51px',
            textTransform: 'uppercase', marginBottom: 5,
          }}>
            Today's Goal
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 0 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#111827', fontFamily: 'Inter,sans-serif', lineHeight: 1 }}>5</span>
            <span style={{ fontSize: 10, color: '#6B7280', fontFamily: 'Inter,sans-serif', marginLeft: 3 }}>concepts</span>
            <span style={{ fontSize: 12, color: '#D1D5DB', fontFamily: 'Inter,sans-serif', margin: '0 4px' }}>·</span>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#111827', fontFamily: 'Inter,sans-serif', lineHeight: 1 }}>8</span>
            <span style={{ fontSize: 10, color: '#6B7280', fontFamily: 'Inter,sans-serif', marginLeft: 3 }}>min</span>
          </div>
        </div>
      </div>

    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function StudySpaceEmptyState({ onCreateNew }: { onCreateNew: () => void }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', width: '100%', height: '100%',
      background: '#FAFAF8', padding: '0 48px', position: 'relative',
      overflow: 'hidden',
    }}>

      {/* ── Headline ───────────────────────────────────────────── */}
      <div style={{ textAlign: 'center', marginBottom: 28, position: 'relative' }}>
        <h1 style={{
          fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 25,
          letterSpacing: '-0.6px', color: '#111827', lineHeight: '28.75px',
          margin: 0, display: 'inline',
        }}>
          {'Stop organizing notes. '}
          <span style={{
            background: '#FDEA3B', borderRadius: 6,
            padding: '1px 8px 2px', display: 'inline-block',
            lineHeight: '28.75px',
          }}>
            Start learning.
          </span>
        </h1>

        {/* X10 badge */}
        <div style={{
          position: 'absolute', top: -8, right: -56,
          background: '#357BFF', borderRadius: 999,
          padding: '4.66px 10px',
          fontSize: 15, fontWeight: 700, color: 'white',
          fontFamily: 'Inter, sans-serif', letterSpacing: '0.45px',
          lineHeight: '16px',
        }}>
          X10
        </div>
      </div>

      {/* ── Three-column transformation ─────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 0, marginBottom: 6,
      }}>
        <ChaoticNotes />

        {/* dashed arrow */}
        <div style={{ flexShrink: 0, margin: '0 4px', paddingBottom: 44 }}>
          <DashedArrow />
        </div>

        <AiCard />

        {/* solid arrow */}
        <div style={{ flexShrink: 0, margin: '0 4px', paddingBottom: 44 }}>
          <SolidArrow />
        </div>

        <StudySpaceCard />
      </div>

      {/* ── Column captions ─────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'center',
        gap: 0, width: 660, marginBottom: 22,
      }}>
        <div style={{ width: 172, textAlign: 'center' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 500, color: '#111', margin: 0 }}>
            Feeling overwhelmed?
          </p>
        </div>
        {/* spacer for arrows ~66px each */}
        <div style={{ width: 66 }} />
        <div style={{ width: 228, textAlign: 'center' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 20, fontWeight: 600, color: '#166534', margin: 0 }}>
            AI builds your study plan
          </p>
        </div>
        <div style={{ width: 66 }} />
        <div style={{ width: 172, textAlign: 'center' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 500, color: '#111', margin: 0 }}>
            {"Today's task is ready"}
          </p>
        </div>
      </div>

      {/* ── CTA button ─────────────────────────────────────────── */}
      <button
        onClick={onCreateNew}
        style={{
          background: '#FDEA3B', height: 54, paddingLeft: 40, paddingRight: 40,
          border: 'none', borderRadius: 16,
          fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 16,
          color: '#1C1C1C', letterSpacing: '-0.47px',
          cursor: 'pointer', marginBottom: 14,
          transition: 'transform 0.08s, box-shadow 0.08s',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          minWidth: 284,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(0.96)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.filter = ''; }}
      >
        Create a New Study Plan
      </button>

      {/* ── Footer notes ────────────────────────────────────────── */}
      <p style={{
        fontFamily: 'PingFang SC, sans-serif', fontSize: 14, color: 'rgba(0,0,0,0.5)',
        textAlign: 'center', maxWidth: 579, margin: '0 0 4px', lineHeight: 'normal',
      }}>
        适合<strong style={{ fontWeight: 600 }}>知识点/概念型资料</strong>，辅助消化教材笔记、章节总结、资格证备考
      </p>
      <p style={{
        fontFamily: 'PingFang SC, sans-serif', fontSize: 14, color: 'rgba(0,0,0,0.5)',
        textAlign: 'center', maxWidth: 376, margin: 0, lineHeight: 'normal',
      }}>
        <strong style={{ fontWeight: 600 }}>语言类资料</strong>暂不适用；英语学习模式即将上线。
      </p>
    </div>
  );
}
