/* MARKER-MAKE-KIT-INVOKED */

// ─── Illustrations ─────────────────────────────────────────────────────────────

function UploadIllustration() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="40" fill="#EEF6FF" />
      <rect x="22" y="18" width="28" height="36" rx="4" fill="white" stroke="#BFDBFE" strokeWidth="1.5" />
      <path d="M42 18 L50 26 L42 26 Z" fill="#BFDBFE" />
      <line x1="27" y1="32" x2="43" y2="32" stroke="#BFDBFE" strokeWidth="2" strokeLinecap="round" />
      <line x1="27" y1="38" x2="43" y2="38" stroke="#BFDBFE" strokeWidth="2" strokeLinecap="round" />
      <line x1="27" y1="44" x2="37" y2="44" stroke="#BFDBFE" strokeWidth="2" strokeLinecap="round" />
      <circle cx="52" cy="52" r="14" fill="#FDEA3B" />
      <path d="M52 59 L52 45" stroke="#1C1C1C" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M46 51 L52 45 L58 51" stroke="#1C1C1C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="18" cy="24" r="2.5" fill="#FDEA3B" />
      <circle cx="64" cy="22" r="1.5" fill="#93C5FD" />
      <circle cx="68" cy="38" r="2" fill="#FDEA3B" opacity="0.6" />
    </svg>
  );
}

function DiscoverIllustration() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="40" fill="#FFFBEB" />
      <circle cx="36" cy="35" r="16" fill="white" stroke="#FDE68A" strokeWidth="2" />
      <line x1="47" y1="47" x2="58" y2="58" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
      <rect x="28" y="30" width="16" height="7" rx="3.5" fill="#FDEA3B" />
      <rect x="28" y="40" width="12" height="6" rx="3" fill="#FDE68A" />
      <circle cx="22" cy="20" r="3" fill="#FDEA3B" />
      <circle cx="58" cy="24" r="2" fill="#FDE68A" />
      <circle cx="62" cy="52" r="1.5" fill="#FDEA3B" opacity="0.7" />
      <path d="M64 30 L65 27 L66 30 L69 31 L66 32 L65 35 L64 32 L61 31 Z" fill="#FDEA3B" />
    </svg>
  );
}

function PracticeIllustration() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="40" fill="#F0FDF4" />
      <rect x="20" y="24" width="36" height="28" rx="6" fill="#DCFCE7" />
      <rect x="24" y="20" width="36" height="28" rx="6" fill="white" stroke="#BBF7D0" strokeWidth="1.5" />
      <circle cx="33" cy="30" r="4" fill="#F0FDF4" stroke="#BBF7D0" strokeWidth="1.5" />
      <rect x="29" y="36" width="26" height="4" rx="2" fill="#F0FDF4" />
      <rect x="29" y="42" width="26" height="4" rx="2" fill="#FDEA3B" />
      <circle cx="58" cy="52" r="12" fill="#22C55E" />
      <path d="M53 52 L57 56 L63 48" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="20" cy="54" r="2" fill="#86EFAC" />
      <circle cx="66" cy="24" r="1.5" fill="#FDEA3B" />
    </svg>
  );
}

function MasterIllustration() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="40" fill="#FFF7ED" />
      <path d="M40 58 C30 58 24 50 24 42 C24 36 28 30 32 26 C32 32 36 34 36 34 C36 28 38 20 44 16 C44 24 50 28 52 34 C54 30 54 26 52 22 C56 28 56 36 54 42 C56 40 58 36 56 30 C60 36 60 48 56 54 C54 57 48 58 40 58 Z" fill="#FB923C" />
      <path d="M40 54 C34 54 30 48 30 42 C30 38 32 34 36 32 C36 36 38 38 40 38 C40 34 42 28 46 26 C46 32 50 36 50 40 C50 44 46 54 40 54 Z" fill="#FDEA3B" />
      <path d="M22 30 L23.5 26 L25 30 L29 31.5 L25 33 L23.5 37 L22 33 L18 31.5 Z" fill="#FDEA3B" />
      <path d="M56 18 L57 16 L58 18 L60 19 L58 20 L57 22 L56 20 L54 19 Z" fill="#FB923C" />
      <circle cx="65" cy="42" r="3" fill="#FDEA3B" opacity="0.8" />
      <circle cx="18" cy="48" r="2" fill="#FED7AA" />
    </svg>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function StepConnector() {
  return (
    <div className="flex items-center justify-center shrink-0 px-1" style={{ marginTop: -16 }}>
      <svg width="32" height="24" viewBox="0 0 32 24" fill="none">
        <path d="M2 12 Q16 4 30 12" stroke="#E5E7EB" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
        <path d="M25 8 L30 12 L25 16" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    </div>
  );
}

function ProgressDots() {
  const dots = [true, true, false, false];
  return (
    <div className="flex items-center gap-1.5">
      {dots.map((filled, i) => (
        <div
          key={i}
          className="rounded-full"
          style={{ width: filled ? 20 : 8, height: 8, background: filled ? "#FDEA3B" : "#E5E7EB" }}
        />
      ))}
    </div>
  );
}

// ─── Step data ─────────────────────────────────────────────────────────────────

const STEPS = [
  { num: 1, label: "Upload", desc: "Drop in your notes, slides, or textbooks.", Illus: UploadIllustration, badge: "#93C5FD" },
  { num: 2, label: "Discover", desc: "AI highlights the concepts that matter most.", Illus: DiscoverIllustration, badge: "#FDEA3B" },
  { num: 3, label: "Practice", desc: "Answer smart questions built from your material.", Illus: PracticeIllustration, badge: "#86EFAC" },
  { num: 4, label: "Master", desc: "Build a streak. Ace your exam.", Illus: MasterIllustration, badge: "#FB923C" },
];

const AVATARS = [
  { bg: "#FDEA3B", label: "M" },
  { bg: "#93C5FD", label: "N" },
  { bg: "#86EFAC", label: "E" },
];

// ─── Main export ───────────────────────────────────────────────────────────────

export default function Container(props: { onCreateNew?: () => void }) {
  const { onCreateNew } = props;

  return (
    <div
      className="flex flex-col items-center justify-center size-full bg-white px-10"
      style={{ minHeight: 0 }}
      data-name="Container"
    >
      {/* Progress dots */}
      <div style={{ marginBottom: 20 }}>
        <ProgressDots />
      </div>

      {/* Headline */}
      <h1
        className="text-center"
        style={{ fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 26, lineHeight: 1.2, letterSpacing: "-0.6px", color: "#111827", marginBottom: 8 }}
      >
        Turn your notes into{" "}
        <span style={{ background: "#FDEA3B", borderRadius: 6, padding: "1px 6px", display: "inline-block" }}>
          exam wins
        </span>
      </h1>

      {/* Sub-headline */}
      <p
        className="text-center"
        style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: 13, color: "#9CA3AF", letterSpacing: "-0.1px", marginBottom: 32 }}
      >
        Your personal study space — ready in minutes, not hours.
      </p>

      {/* 4-step journey */}
      <div className="flex items-start justify-center w-full" style={{ maxWidth: 760, marginBottom: 32 }}>
        {STEPS.map((step, i) => {
          const Illus = step.Illus;
          return (
            <div key={step.num} className="flex items-start flex-1 min-w-0">
              <div className="flex flex-col items-center text-center gap-3" style={{ flex: 1, minWidth: 0 }}>
                <div className="relative">
                  <Illus />
                  <div
                    className="absolute -bottom-1 -right-1 flex items-center justify-center rounded-full"
                    style={{ width: 22, height: 22, background: step.badge, border: "2px solid white", fontFamily: "Inter, sans-serif", fontSize: 10, fontWeight: 800, color: "#1c1c1c" }}
                  >
                    {step.num}
                  </div>
                </div>
                <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 13, color: "#111827", lineHeight: 1.3, letterSpacing: "-0.2px" }}>
                  {step.label}
                </p>
                <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: 11.5, color: "#9CA3AF", lineHeight: 1.5, maxWidth: 140 }}>
                  {step.desc}
                </p>
              </div>
              {i < STEPS.length - 1 && <StepConnector />}
            </div>
          );
        })}
      </div>

      {/* Social proof */}
      <div className="flex items-center" style={{ marginBottom: 14, gap: 0 }}>
        {AVATARS.map((a, i) => (
          <div
            key={i}
            className="flex items-center justify-center rounded-full"
            style={{ width: 22, height: 22, background: a.bg, border: "2px solid white", marginLeft: i === 0 ? 0 : -8, fontSize: 10, fontWeight: 700, color: "#1c1c1c", zIndex: 3 - i, position: "relative" }}
          >
            {a.label}
          </div>
        ))}
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11.5, color: "#9CA3AF", fontWeight: 500, marginLeft: 14 }}>
          Med, Nursing &amp; Engineering students are already studying smarter
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={onCreateNew}
        style={{
          display: "flex", alignItems: "center", gap: 10, background: "#FDEA3B", height: 52, paddingLeft: 36, paddingRight: 36,
          border: "none", borderRadius: 26, fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 15, color: "#111827",
          letterSpacing: "-0.3px", boxShadow: "0 4px 0 #D4C000, 0 6px 16px rgba(253,234,59,0.35)", cursor: "pointer",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2 L8 14 M2 8 L14 8" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        Create a Study Space
      </button>

      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 10.5, color: "#D1D5DB", marginTop: 10, letterSpacing: "0.2px" }}>
        Free to start · No setup required
      </p>
    </div>
  );
}
