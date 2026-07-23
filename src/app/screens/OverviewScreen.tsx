import React, { useState, useMemo, useCallback } from "react";
import {
  Star, FolderOpen, Settings, Info, X,
  TrendingUp, AlertTriangle, RotateCcw, BookOpen, Share2,
} from "lucide-react";
import { useApp } from "../contexts/AppContext";

// ── Palette ───────────────────────────────────────────────────────────────────

const C = {
  bg: "#F6F6F6",
  panel: "#F3F4F6",
  card: "#FFFFFF",
  // 蓝负责“链接与进行中”（次级强调 / 可点文字）
  primary: "#2D8CFF",
  primaryLight: "#EAF3FF",
  // 黄负责“品牌与选中”；文字压在浅底上用更深的金保证可读
  brand: "#FDEA3B",
  brandDeep: "#FDC700",
  mastered: "#00A63E",
  masteredBg: "#F6FEF9",
  learning: "#2D8CFF",   // 练习中 = 主蓝（不用橙）
  learningBg: "#EAF3FF",
  weak: "#FF6252",
  weakBg: "#FFEDEB",
  reviewDue: "#8E99B0",
  newGray: "#CCCCCC",
  ink: "#333333",
  inkSub: "#666666",
  inkMuted: "#999999",
  border: "#EBEBEB",
  shadow: "0 1px 8px rgba(0,0,0,0.06)",
  shadowMd: "0 3px 20px rgba(0,0,0,0.09)",
  sky: "#06091A",
};

// ── Stage data (4 segments, invariant) ────────────────────────────────────────

const STAGES = [
  { label: "已验证掌握",   pct: 41, color: "#00A63E" },
  { label: "学习中",       pct: 16, color: "#2D8CFF" },
  { label: "自评标记待验证", pct:  8, color: "#8E99B0" },
  { label: "未学",         pct: 35, color: "#CCCCCC" },
];

// ── Exam countdown color ───────────────────────────────────────────────────────

const DAYS_TO_EXAM = 72;
const PLAN_TOTAL_DAYS = 220; // 72/220 ≈ 32.7% > 30% → neutral
const REMAINING_PCT = DAYS_TO_EXAM / PLAN_TOTAL_DAYS;
// Urgency anchor: even at neutral, the day count must be visible — use inkSub not muted
const urgencyNumColor = REMAINING_PCT > 0.30 ? "#666666" : REMAINING_PCT > 0.07 ? "#E17100" : "#FF6252";
const urgencyHookColor = REMAINING_PCT > 0.30 ? "#8E99B0" : REMAINING_PCT > 0.07 ? "#E17100" : "#FF6252";
const urgencyBg = REMAINING_PCT > 0.30 ? "rgba(51,51,51,0.04)" : REMAINING_PCT > 0.07 ? "rgba(225,113,0,0.07)" : "rgba(255,98,82,0.07)";

// ── Star data [x, y, deg, status] ─────────────────────────────────────────────
// Coordinates in [0,1] space; rendered into viewBox "0 0 800 250"

type S = "m" | "l" | "r" | "n" | "w";
type StarTuple = [number, number, number, S];

const STARS: StarTuple[] = [
  // ch1s1
  [0.344,0.269,3,"m"],[0.462,0.437,3,"m"],[0.529,0.330,3,"m"],[0.525,0.377,3,"m"],
  [0.446,0.803,3,"m"],[0.569,0.130,3,"r"],[0.581,0.172,4,"m"],[0.665,0.295,3,"m"],
  [0.652,0.133,4,"m"],[0.614,0.583,3,"r"],[0.645,0.463,3,"m"],[0.672,0.538,4,"l"],
  [0.661,0.607,6,"n"],[0.655,0.670,5,"n"],[0.515,0.523,4,"l"],
  // ch1s2
  [0.935,0.640,6,"l"],[0.980,0.673,6,"m"],[0.348,0.385,5,"n"],[0.980,0.658,3,"r"],
  [0.337,0.406,3,"r"],[0.980,0.748,6,"r"],[0.267,0.411,4,"n"],[0.973,0.709,5,"m"],
  [0.980,0.707,3,"m"],[0.980,0.750,3,"m"],[0.927,0.698,9,"l"],[0.772,0.678,3,"n"],
  [0.980,0.728,3,"n"],[0.724,0.641,3,"m"],[0.980,0.687,3,"n"],
  // ch1s3
  [0.380,0.313,7,"m"],[0.451,0.352,3,"l"],[0.479,0.411,7,"r"],[0.464,0.303,4,"l"],
  [0.393,0.396,5,"m"],[0.294,0.393,5,"n"],[0.634,0.211,3,"w"],[0.379,0.373,10,"r"],
  [0.268,0.350,3,"n"],[0.253,0.312,4,"m"],[0.302,0.359,5,"r"],[0.302,0.422,9,"m"],
  [0.441,0.408,5,"r"],[0.384,0.278,3,"w"],[0.358,0.179,3,"m"],[0.371,0.338,5,"m"],
  [0.375,0.231,4,"l"],[0.313,0.283,3,"n"],
  // ch1s4
  [0.669,0.364,4,"l"],[0.556,0.386,4,"m"],[0.583,0.366,4,"m"],[0.619,0.360,4,"n"],
  [0.626,0.447,5,"m"],[0.502,0.310,8,"r"],[0.443,0.380,4,"m"],[0.511,0.284,4,"r"],
  [0.494,0.207,3,"n"],[0.551,0.351,5,"m"],[0.578,0.271,4,"m"],[0.484,0.267,3,"r"],
  [0.654,0.425,3,"l"],[0.520,0.172,3,"m"],[0.433,0.289,5,"n"],[0.546,0.416,3,"w"],
  [0.520,0.125,3,"n"],[0.497,0.344,3,"m"],[0.571,0.411,3,"l"],
  // ch1s5
  [0.712,0.464,4,"m"],[0.522,0.239,5,"w"],[0.647,0.516,8,"n"],[0.657,0.494,8,"n"],
  [0.754,0.479,4,"m"],[0.607,0.397,4,"m"],[0.542,0.290,4,"m"],[0.695,0.328,4,"n"],
  [0.630,0.418,4,"m"],[0.622,0.257,3,"n"],[0.641,0.390,5,"m"],[0.681,0.450,3,"n"],
  [0.501,0.372,3,"m"],[0.568,0.444,3,"m"],[0.524,0.493,4,"m"],[0.763,0.377,5,"r"],
  [0.735,0.351,5,"w"],[0.495,0.552,6,"m"],[0.496,0.496,3,"m"],[0.446,0.591,5,"l"],
  [0.514,0.459,3,"n"],[0.543,0.571,8,"m"],
  // ch1s6
  [0.369,0.593,5,"m"],[0.589,0.479,9,"r"],[0.477,0.531,3,"l"],[0.623,0.325,5,"l"],
  [0.681,0.582,6,"m"],[0.599,0.425,7,"n"],[0.711,0.565,3,"n"],[0.711,0.421,3,"n"],
  [0.699,0.501,7,"w"],[0.729,0.606,4,"r"],[0.648,0.633,4,"l"],[0.564,0.542,4,"m"],
  [0.727,0.284,3,"r"],[0.619,0.485,4,"n"],[0.679,0.474,5,"n"],[0.602,0.557,3,"w"],
  [0.747,0.558,3,"m"],[0.719,0.388,4,"n"],[0.680,0.405,3,"l"],[0.744,0.438,3,"w"],
  [0.804,0.528,5,"m"],
  // ch1s7
  [0.593,0.338,4,"r"],[0.553,0.196,7,"l"],[0.543,0.444,4,"r"],[0.511,0.413,4,"m"],
  [0.619,0.511,3,"m"],[0.337,0.346,4,"r"],[0.425,0.325,3,"m"],[0.359,0.438,3,"m"],
  [0.314,0.326,5,"n"],[0.341,0.310,3,"r"],[0.568,0.225,10,"n"],[0.598,0.198,13,"l"],
  [0.415,0.532,5,"l"],[0.650,0.581,5,"n"],[0.614,0.176,5,"m"],[0.555,0.608,5,"l"],
  [0.629,0.549,7,"n"],[0.657,0.330,4,"m"],[0.573,0.516,3,"m"],[0.691,0.617,4,"l"],
  [0.729,0.514,4,"l"],[0.678,0.213,4,"m"],[0.754,0.411,4,"m"],[0.557,0.477,3,"n"],
  [0.595,0.457,3,"m"],[0.695,0.367,5,"l"],[0.470,0.232,3,"l"],
  // ch2s1
  [0.508,0.671,4,"m"],[0.515,0.562,4,"n"],[0.419,0.663,5,"l"],[0.424,0.700,3,"r"],
  [0.497,0.634,5,"n"],[0.339,0.602,3,"n"],[0.484,0.735,5,"m"],[0.381,0.555,3,"l"],
  [0.546,0.509,3,"m"],
  // ch2s2
  [0.564,0.323,3,"m"],[0.607,0.133,3,"r"],[0.491,0.449,3,"m"],[0.575,0.578,5,"w"],
  [0.585,0.103,3,"n"],[0.392,0.442,7,"w"],[0.339,0.464,6,"m"],[0.357,0.501,4,"m"],
  [0.262,0.468,3,"n"],[0.418,0.470,3,"n"],[0.376,0.471,3,"m"],[0.475,0.475,3,"m"],
  [0.325,0.522,5,"w"],[0.470,0.384,3,"n"],[0.424,0.439,4,"r"],
  // ch2s3
  [0.275,0.543,6,"m"],[0.236,0.521,3,"n"],[0.262,0.627,5,"m"],[0.391,0.509,3,"m"],
  [0.364,0.540,5,"w"],[0.581,0.682,4,"w"],[0.512,0.765,5,"m"],[0.463,0.716,5,"m"],
  [0.522,0.602,3,"l"],[0.551,0.790,4,"r"],[0.294,0.481,4,"m"],[0.407,0.361,3,"m"],
  [0.457,0.501,3,"r"],[0.324,0.496,5,"l"],[0.846,0.628,4,"m"],
  // ch2s4
  [0.647,0.737,3,"l"],[0.616,0.797,3,"r"],[0.610,0.699,3,"r"],[0.612,0.664,3,"m"],
  [0.691,0.673,5,"l"],[0.593,0.749,3,"m"],[0.491,0.697,4,"n"],[0.414,0.605,3,"l"],
  [0.591,0.621,4,"w"],[0.596,0.532,6,"n"],[0.465,0.611,3,"w"],[0.470,0.335,3,"r"],
  [0.312,0.677,3,"n"],[0.425,0.501,3,"l"],[0.553,0.668,3,"m"],[0.456,0.640,3,"n"],
  // ch2s5
  [0.323,0.630,6,"l"],[0.313,0.761,5,"r"],[0.373,0.680,4,"n"],[0.362,0.758,6,"m"],
  [0.316,0.713,3,"m"],[0.292,0.802,3,"n"],[0.345,0.698,3,"n"],[0.272,0.753,4,"m"],
  [0.360,0.784,3,"m"],[0.393,0.801,5,"m"],[0.413,0.774,8,"l"],[0.407,0.845,3,"m"],
  [0.325,0.808,5,"m"],[0.594,0.300,3,"l"],[0.366,0.830,3,"l"],
  // ch2s6
  [0.387,0.707,5,"n"],[0.446,0.469,4,"m"],[0.432,0.632,4,"m"],[0.552,0.634,3,"n"],
  [0.519,0.644,3,"m"],[0.497,0.595,3,"l"],[0.311,0.601,4,"m"],[0.576,0.778,3,"m"],
  [0.478,0.572,4,"m"],[0.448,0.533,3,"m"],[0.268,0.667,3,"w"],[0.222,0.631,4,"m"],
  [0.305,0.554,3,"m"],[0.342,0.567,6,"m"],[0.275,0.589,4,"n"],
  // ch2s7
  [0.439,0.739,9,"r"],[0.458,0.836,5,"m"],[0.502,0.798,4,"m"],[0.577,0.718,4,"n"],
  [0.560,0.745,3,"m"],[0.525,0.723,4,"m"],[0.540,0.538,4,"m"],[0.347,0.653,4,"n"],
  [0.473,0.665,3,"w"],[0.448,0.558,3,"m"],[0.453,0.684,3,"n"],[0.383,0.654,3,"m"],
  [0.400,0.732,3,"l"],[0.246,0.570,3,"l"],[0.413,0.562,4,"l"],[0.394,0.587,5,"m"],
  [0.378,0.624,3,"n"],
];

function starStyle(s: S): { fill: string; opacity: number } {
  // Single warm-white hue; only brightness/opacity varies — no multi-colour per KM spec.
  // Weak = sole exception (warning red). Unlearned = dark silhouette.
  switch (s) {
    case "m": return { fill: "#FFF9EC", opacity: 0.97 };
    case "l": return { fill: "#F5EDD0", opacity: 0.58 };
    case "r": return { fill: "#C8BFA0", opacity: 0.34 };
    case "w": return { fill: "#FF6252", opacity: 0.80 };
    case "n": return { fill: "#3C4160", opacity: 0.22 };
  }
}

// LCG pseudo-random (deterministic seed)
function lcg(seed: number) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0x7fffffff; return s / 0x7fffffff; };
}

// ── StarMapPreview ─────────────────────────────────────────────────────────────

function StarMapPreview({ height, onClick, onShare }: { height: number; onClick: () => void; onShare: () => void }) {
  const VW = 800, VH = 250;
  // Fix 3: wider/taller crop so stars fill ~88–92% of frame height
  const VBX = 40, VBY = 8, VBW = 720, VBH = 230;

  const dust = useMemo(() => {
    const rand = lcg(7777);
    return Array.from({ length: 460 }, () => ({
      x: rand() * VW, y: rand() * VH,
      r: rand() * 1.4 + 0.2, op: rand() * 0.18 + 0.04,
    }));
  }, []);

  const atmosphericWeaks = STARS.filter(([,,, s]) => s === "w").slice(0, 4);

  return (
    // Fix 2: overflow hidden + display block, no margin/padding
    <div style={{ cursor: "pointer", position: "relative", height, overflow: "hidden", display: "block" }} onClick={onClick}>
      <style>{`@keyframes ovStarPulse { 0%,100% { opacity: .55; } 50% { opacity: 1; } }`}</style>
      <svg width="100%" height={height}
        viewBox={`${VBX} ${VBY} ${VBW} ${VBH}`}
        preserveAspectRatio="xMidYMid slice"
        style={{ display: "block" }}>
        <defs>
          <linearGradient id="ovSkyGrad" x1="0" y1="0" x2="0.2" y2="1" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="#06091C" />
            <stop offset="50%"  stopColor="#050817" />
            <stop offset="100%" stopColor="#060719" />
          </linearGradient>
          {/* Warm nebula glow where mastered-star clusters concentrate (~55%×40%) */}
          <radialGradient id="neb-warm" cx="56%" cy="42%" r="30%">
            <stop offset="0%" stopColor="rgba(200,160,60,0.07)" />
            <stop offset="100%" stopColor="rgba(200,160,60,0)" />
          </radialGradient>
          {/* Secondary cool nebula for depth */}
          <radialGradient id="neb-cool" cx="30%" cy="68%" r="26%">
            <stop offset="0%" stopColor="rgba(50,60,180,0.06)" />
            <stop offset="100%" stopColor="rgba(50,60,180,0)" />
          </radialGradient>
          {/* Large-star bloom: outer wide glow + inner tight halo, merged */}
          <filter id="ovBloom" x="-140%" y="-140%" width="380%" height="380%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4.2" result="wide" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.6" result="tight" />
            <feMerge>
              <feMergeNode in="wide" />
              <feMergeNode in="tight" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Medium-star bloom */}
          <filter id="ovBloomSm" x="-90%" y="-90%" width="280%" height="280%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.2" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Sky */}
        <rect x={0} y={0} width={VW} height={VH} fill="url(#ovSkyGrad)" />
        <rect x={0} y={0} width={VW} height={VH} fill="url(#neb-warm)" />
        <rect x={0} y={0} width={VW} height={VH} fill="url(#neb-cool)" />

        {/* Clickable-affordance inner border glow */}
        <rect x={VBX} y={VBY} width={VBW} height={VBH} fill="none"
          stroke="rgba(140,160,255,0.10)" strokeWidth={3} />

        {/* Dust field */}
        {dust.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#FFFFFF" opacity={d.op} />
        ))}

        {/* Fix 4: single faint Chinese watermark only, top-left sparse zone */}
        <text x={VW * 0.10} y={VH * 0.18} textAnchor="start"
          fill="rgba(185,200,255,0.048)" fontSize={24} fontWeight={700}
          style={{ letterSpacing: 3, userSelect: "none" }}>
          刑法分论
        </text>

        {/* Non-mastered (dim/review-due) stars */}
        {STARS.filter(([,,, s]) => s !== "m" && s !== "w").map(([x, y, deg, s], i) => {
          const st = starStyle(s);
          const r = Math.max(1.4, Math.min(5, deg * 0.58));
          return <circle key={`s-${i}`} cx={x * VW} cy={y * VH} r={r} fill={st.fill} opacity={st.opacity} />;
        })}

        {/* A few red weak stars — atmosphere only */}
        {atmosphericWeaks.map(([x, y, deg], i) => (
          <circle key={`w-${i}`} cx={x * VW} cy={y * VH}
            r={Math.max(1.4, Math.min(5, deg * 0.55))} fill="#FF7060" opacity={0.68} />
        ))}

        {/* Mastered stars — warm glow on top; first 8 = this-week new, get a breathing pulse */}
        {STARS.filter(([,,, s]) => s === "m").map(([x, y, deg], i) => {
          const r = Math.max(2, Math.min(7, deg * 0.72));
          const isNew = i < 8; // spec 行319: 本周新点亮的星带微光脉冲/呼吸
          return (
            <circle key={`m-${i}`} cx={x * VW} cy={y * VH} r={r}
              fill="#FFF8D6" opacity={0.94}
              filter={deg >= 6 ? "url(#ovBloom)" : "url(#ovBloomSm)"}
              style={isNew ? { animation: `ovStarPulse 2.6s ease-in-out ${(i * 0.28).toFixed(2)}s infinite` } : undefined} />
          );
        })}
      </svg>

      {/* Glass HUD overlay — inset container, pointer-events none; children opt in */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>

        {/* Bottom gradient scrim */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "72%",
          background: "linear-gradient(to top, rgba(5,8,22,0.93) 0%, rgba(5,8,22,0.38) 54%, transparent 100%)",
        }} />

        {/* Achievement glass HUD — bottom-left */}
        <div style={{
          position: "absolute", bottom: 11, left: 12,
          background: "rgba(6,9,22,0.72)", backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: 13, padding: "9px 12px",
          display: "flex", flexDirection: "column", gap: 5,
        }}>
          {/* Total account — spec 行321 正向叙事 */}
          <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,248,220,0.95)", lineHeight: 1.35, margin: 0 }}>
            你已点亮{" "}
            <span style={{ fontSize: 18, fontWeight: 800, color: "#FFD080", letterSpacing: -0.5 }}>100</span>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.32)", fontWeight: 400 }}>/241</span>
            {" "}颗 · <strong style={{ color: "#FFD080" }}>41%</strong> 的刑法星空被照亮
          </p>
          {/* Achievement badges */}
          <div style={{ display: "flex", gap: 6 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 5,
              background: "rgba(255,145,0,0.22)", borderRadius: 8, padding: "4px 8px",
            }}>
              <span style={{ fontSize: 12, lineHeight: 1 }}>🔥</span>
              <div>
                <div style={{ fontSize: 9, color: "rgba(255,195,70,0.62)", lineHeight: 1.2 }}>连续学习</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#FFCF4D", lineHeight: 1.1 }}>12 天</div>
              </div>
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 5,
              background: "rgba(75,115,255,0.22)", borderRadius: 8, padding: "4px 8px",
            }}>
              <span style={{ fontSize: 12, lineHeight: 1 }}>⌛</span>
              <div>
                <div style={{ fontSize: 9, color: "rgba(140,168,255,0.62)", lineHeight: 1.2 }}>累计投入</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#A0BEFF", lineHeight: 1.1 }}>18h 20m</div>
              </div>
            </div>
          </div>
          {/* New this week — 同侪排名 + 虚拟头像堆已上移到顶部「预测分数」旁（见 FusionCard A-top）。
              此处星图 HUD 只保留最轻的「本周新点亮」一行，不再重复画排名。 */}
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.42)", margin: 0, lineHeight: 1.45 }}>
              本周新点亮 <strong style={{ color: "rgba(255,238,140,0.62)" }}>8</strong> 颗
            </p>
          </div>
        </div>

        {/* CTA — bottom-right */}
        <button
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          style={{
            position: "absolute", bottom: 14, right: 12,
            fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.92)",
            background: "rgba(255,255,255,0.14)",
            border: "1px solid rgba(255,255,255,0.22)",
            borderRadius: 20, padding: "6px 14px", cursor: "pointer",
            pointerEvents: "auto", backdropFilter: "blur(6px)", letterSpacing: 0.2,
          }}>
          查看知识地图 →
        </button>

        {/* Share entry — top-right corner, offset from the map CTA (spec 行334) */}
        <button
          onClick={(e) => { e.stopPropagation(); onShare(); }}
          title="分享成就"
          style={{
            position: "absolute", top: 12, right: 12,
            display: "flex", alignItems: "center", gap: 5,
            fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.92)",
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.20)",
            borderRadius: 20, padding: "5px 11px", cursor: "pointer",
            pointerEvents: "auto", backdropFilter: "blur(6px)",
          }}>
          <Share2 size={12} /> 分享
        </button>
      </div>
    </div>
  );
}

// ── Info Popover ──────────────────────────────────────────────────────────────
// Spec 行302: anchored popover card (~380px), NOT a mobile bottom drawer.
// Pops out from below the ⓘ; ✕ top-right; internal scroll only if content overflows.

function InfoPopover({ anchor, onClose }: { anchor: DOMRect; onClose: () => void }) {
  const WIDTH = 380;
  // Anchor under the ⓘ; clamp within viewport.
  const left = Math.min(
    Math.max(12, anchor.left),
    (typeof window !== "undefined" ? window.innerWidth : 1024) - WIDTH - 12,
  );
  const top = anchor.bottom + 8;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: "fixed", top, left, width: WIDTH,
          maxHeight: "calc(100vh - 24px)", overflowY: "auto",
          background: "#FFF", borderRadius: 12, boxShadow: C.shadowMd,
          border: `1px solid ${C.border}`, padding: 16,
        }}
      >
        {/* Little pointer notch above the card */}
        <div style={{
          position: "absolute", top: -6, left: Math.max(10, Math.min(anchor.left - left + 4, WIDTH - 22)),
          width: 12, height: 12, background: "#FFF",
          borderLeft: `1px solid ${C.border}`, borderTop: `1px solid ${C.border}`,
          transform: "rotate(45deg)",
        }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <h3 style={{ fontSize: 20, fontWeight: 600, color: C.ink, margin: 0 }}>预测依据</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.inkMuted, padding: 2 }}>
            <X size={18} />
          </button>
        </div>

        {/* ① 主数字区（只读，不在浮层内切换口径） */}
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 14, color: C.ink, margin: 0, fontWeight: 600 }}>
            考试通过率预测 <span style={{ fontSize: 18, fontWeight: 800 }}>78%</span> · 可信度中
          </p>
          <p style={{ fontSize: 13, color: C.inkMuted, margin: "3px 0 0" }}>更新于 2026-07-07 06:30</p>
          <p style={{ fontSize: 12, color: C.inkMuted, margin: "2px 0 0" }}>当前口径：含自评标记（可在设置切换）</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* ② 主要提升 */}
          <PopoverSection icon={<TrendingUp size={14} color={C.mastered} />} label="📈 主要提升" bg={C.masteredBg}
            items={[
              "最近两次模考平均提高 9 分",
              "渎职罪 D+7 留存正确率提升至 82%",
              "本周新点亮 8 个知识点",
            ]} />
          {/* ③ 主要风险 */}
          <PopoverSection icon={<AlertTriangle size={14} color={C.weak} />} label="⚠️ 主要风险" bg={C.weakBg}
            items={[
              "受贿数额认定已逾期 7 天，记忆留存进入衰减",
              "23 个三星知识点尚未验证",
              "8 个自评已掌握尚未抽检 · 验证后预测更准",
            ]} />
          {/* ④ 计算依据 — 新算法口径 */}
          <PopoverSection icon={<BookOpen size={14} color={C.primary} />} label="📖 计算依据" bg={C.primaryLight}
            items={[
              "模考 50% / V2.0 知识证据 35% / 计划容量 10% / 学习稳定性 5%，再扣关键风险",
              "可信度『中』= 已完成 ≥2 次模考、覆盖 ≥30%、近 21 天有数据",
            ]} />
        </div>
      </div>
    </div>
  );
}

function PopoverSection({ icon, label, bg, items }: {
  icon: React.ReactNode; label: string; bg: string; items: string[];
}) {
  return (
    <div style={{ background: bg, borderRadius: 12, padding: "10px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        {icon}
        <span style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{label}</span>
      </div>
      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
        {items.map((t, i) => (
          <li key={i} style={{ fontSize: 14, color: C.inkSub, lineHeight: 1.55, display: "flex", gap: 6 }}>
            <span style={{ color: C.inkMuted }}>·</span><span>{t}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Share Achievement Poster ──────────────────────────────────────────────────
// Spec 行361-374: standalone 16:9 landscape poster, positive-only data,
// central square safe-zone, brand logo shown (share material). NOT a page screenshot.

function SharePosterModal({ onClose }: { onClose: () => void }) {
  const VW = 800, VH = 250, VBX = 40, VBY = 8, VBW = 720, VBH = 230;
  const stars = useMemo(() => STARS, []);
  const dust = useMemo(() => {
    const rand = lcg(4242);
    return Array.from({ length: 380 }, () => ({
      x: rand() * VW, y: rand() * VH, r: rand() * 1.3 + 0.2, op: rand() * 0.16 + 0.04,
    }));
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 50,
      background: "rgba(6,9,22,0.72)", backdropFilter: "blur(6px)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: 20, gap: 14,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: "min(680px, 92vw)" }}>
        {/* Poster (16:9) */}
        <div style={{
          position: "relative", width: "100%", aspectRatio: "16 / 9",
          borderRadius: 16, overflow: "hidden", boxShadow: C.shadowMd,
        }}>
          <svg width="100%" height="100%" viewBox={`${VBX} ${VBY} ${VBW} ${VBH}`}
            preserveAspectRatio="xMidYMid slice" style={{ display: "block", position: "absolute", inset: 0 }}>
            <defs>
              <linearGradient id="posterSky" x1="0" y1="0" x2="0.2" y2="1" gradientUnits="objectBoundingBox">
                <stop offset="0%" stopColor="#06091C" /><stop offset="50%" stopColor="#050817" /><stop offset="100%" stopColor="#060719" />
              </linearGradient>
              <radialGradient id="posterNeb" cx="50%" cy="46%" r="34%">
                <stop offset="0%" stopColor="rgba(210,168,70,0.09)" /><stop offset="100%" stopColor="rgba(210,168,70,0)" />
              </radialGradient>
              <filter id="posterBloom" x="-140%" y="-140%" width="380%" height="380%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="w" />
                <feMerge><feMergeNode in="w" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <rect x={0} y={0} width={VW} height={VH} fill="url(#posterSky)" />
            <rect x={0} y={0} width={VW} height={VH} fill="url(#posterNeb)" />
            {dust.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#FFF" opacity={d.op} />)}
            {/* dim stars */}
            {stars.filter(([,,, s]) => s !== "m" && s !== "w").map(([x, y, deg, s], i) => {
              const st = starStyle(s); const r = Math.max(1.2, Math.min(4.5, deg * 0.5));
              return <circle key={`pd-${i}`} cx={x * VW} cy={y * VH} r={r} fill={st.fill} opacity={st.opacity * 0.8} />;
            })}
            {/* mastered — peak-bright static frame */}
            {stars.filter(([,,, s]) => s === "m").map(([x, y, deg], i) => {
              const r = Math.max(2, Math.min(7, deg * 0.72));
              return <circle key={`pm-${i}`} cx={x * VW} cy={y * VH} r={r} fill="#FFF8D6" opacity={1} filter="url(#posterBloom)" />;
            })}
          </svg>

          {/* Central square safe-zone with positive-only data */}
          <div style={{
            position: "absolute", inset: 0, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 10, textAlign: "center",
            padding: "0 12%",
          }}>
            <p style={{ fontSize: "clamp(15px,2.6vw,22px)", fontWeight: 800, color: "rgba(255,248,220,0.97)", margin: 0, lineHeight: 1.35 }}>
              已点亮 <span style={{ color: "#FFD080" }}>100 / 241</span> 颗
              <br />
              <span style={{ fontSize: "0.8em", fontWeight: 700 }}><span style={{ color: "#FFD080" }}>41%</span> 的刑法星空被照亮</span>
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
              <span style={{ fontSize: "clamp(11px,1.7vw,14px)", fontWeight: 700, color: "#FFCF4D", background: "rgba(255,145,0,0.18)", borderRadius: 8, padding: "4px 10px" }}>🔥 连续学习 12 天</span>
              <span style={{ fontSize: "clamp(11px,1.7vw,14px)", fontWeight: 700, color: "#A0BEFF", background: "rgba(75,115,255,0.18)", borderRadius: 8, padding: "4px 10px" }}>⌛ 累计投入 18h20m</span>
            </div>
            <p style={{ fontSize: "clamp(10px,1.5vw,12px)", color: "rgba(255,255,255,0.62)", margin: 0 }}>
              全力以赴，未来可期 ✦
            </p>
            {/* space name + date + brand logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
              <span style={{ fontSize: "clamp(10px,1.4vw,12px)", color: "rgba(255,255,255,0.55)" }}>刑法 · 2026.07.08</span>
              <span style={{ fontSize: "clamp(10px,1.4vw,12px)", fontWeight: 800, color: C.brand, letterSpacing: 0.5 }}>云记</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 14 }}>
          <button onClick={onClose} style={{
            fontSize: 13, color: "rgba(255,255,255,0.9)", background: "rgba(255,255,255,0.14)",
            border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10, padding: "8px 18px", cursor: "pointer",
          }}>关闭</button>
          <button style={{
            fontSize: 13, fontWeight: 700, color: C.ink, background: C.brand,
            border: "none", borderRadius: 10, padding: "8px 20px", cursor: "pointer",
          }}>保存 / 分享</button>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function RiskTag({ icon, label, color, bg }: { icon: React.ReactNode; label: string; color: string; bg: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      fontSize: 11, fontWeight: 500, color, background: bg,
      borderRadius: 6, padding: "3px 8px",
    }}>
      {icon}{label}
    </span>
  );
}

// ── Fusion Card ───────────────────────────────────────────────────────────────

interface FusionCardProps {
  mapHeight: number;
  onShowInfo: (rect: DOMRect) => void;
  onMapClick: () => void;
  onShare: () => void;
}

function FusionCard({ mapHeight, onShowInfo, onMapClick, onShare }: FusionCardProps) {
  const unlearnedPct = STAGES.find(s => s.label === "未学")!.pct;

  return (
    <div style={{
      background: C.card, borderRadius: 18, boxShadow: C.shadowMd,
      overflow: "hidden", position: "relative",
    }}>

      {/* ── A-top: Prediction (left) + Urgency anchor (right) ── */}
      <div style={{ padding: "18px 20px 16px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "stretch", gap: 12 }}>

          {/* Left — pass-rate prediction */}
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: C.inkMuted, fontWeight: 500 }}>考试通过率预测</span>
              <button onClick={(e) => onShowInfo(e.currentTarget.getBoundingClientRect())} style={{
                width: 18, height: 18, borderRadius: "50%", background: "#EEF1F7",
                border: "none", cursor: "pointer", display: "flex", alignItems: "center",
                justifyContent: "center", color: C.inkMuted, flexShrink: 0,
              }}>
                <Info size={11} />
              </button>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
              <span style={{ fontSize: 46, fontWeight: 800, color: C.ink, lineHeight: 1, letterSpacing: "-1px" }}>
                78%
              </span>
              <div>
                <div style={{ fontSize: 12, color: C.mastered, fontWeight: 600, marginBottom: 4 }}>
                  较上周 +6%
                </div>
                <span style={{ fontSize: 11, color: C.inkMuted, background: "#F0F2F6", borderRadius: 6, padding: "2px 8px" }}>
                  可信度 中
                </span>
              </div>
            </div>

            {/* 同侪临场 / 陪伴：虚拟头像堆 + 「已超过 X% 同学」，紧贴预测分数下方。
                口径=竞争临场 + 陪伴，不贬低用户；头像为示意元素，暂不支持点击。 */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
              <div style={{ display: "flex", flexShrink: 0 }}>
                {[
                  { bg: "linear-gradient(135deg,#FFB74D,#F57C00)", ch: "李" },
                  { bg: "linear-gradient(135deg,#64B5F6,#1976D2)", ch: "王" },
                  { bg: "linear-gradient(135deg,#81C784,#388E3C)", ch: "张" },
                  { bg: "linear-gradient(135deg,#BA68C8,#7B1FA2)", ch: "陈" },
                  { bg: "linear-gradient(135deg,#4DB6AC,#00796B)", ch: "刘" },
                ].map((a, i) => (
                  <span key={i} style={{
                    width: 22, height: 22, borderRadius: "50%", background: a.bg,
                    border: "2px solid #fff", boxShadow: "0 1px 3px rgba(0,0,0,0.16)",
                    marginLeft: i === 0 ? 0 : -7, zIndex: 5 - i, position: "relative",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.95)",
                  }}>
                    {a.ch}
                  </span>
                ))}
              </div>
              <p style={{ fontSize: 12, color: C.inkMuted, margin: 0, lineHeight: 1.4 }}>
                已超过 <strong style={{ color: C.ink, fontWeight: 800 }}>68%</strong> 同学 · 还有 32% 在你前面
              </p>
            </div>
          </div>

          {/* Vertical divider */}
          <div style={{ width: 1, background: C.border, flexShrink: 0, alignSelf: "stretch" }} />

          {/* Fix 6: Urgency block with real visual weight */}
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "flex-end",
            justifyContent: "center", background: urgencyBg,
            borderRadius: 12, padding: "10px 14px", minWidth: 120,
          }}>
            <span style={{ fontSize: 11, color: C.inkMuted, fontWeight: 500, marginBottom: 2 }}>⏳ 距考试</span>
            <div style={{ display: "flex", alignItems: "baseline", gap: 2, marginBottom: 4 }}>
              <span style={{ fontSize: 36, fontWeight: 800, color: urgencyNumColor, lineHeight: 1, letterSpacing: "-0.5px" }}>
                {DAYS_TO_EXAM}
              </span>
              <span style={{ fontSize: 14, color: urgencyNumColor, fontWeight: 600 }}>天</span>
            </div>
            <span style={{ fontSize: 11, color: urgencyHookColor, fontWeight: 600, textAlign: "right" }}>
              还有 <strong style={{ fontWeight: 700 }}>{unlearnedPct}%</strong> 未学
            </span>
          </div>
        </div>
      </div>

      {/* ── A-mid: Star map — no padding, fills full card width ── */}
      <StarMapPreview height={mapHeight} onClick={onMapClick} onShare={onShare} />

      {/* Fix 10: Stage bar legend readable at small size */}
      <div style={{ padding: "13px 20px 17px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9, gap: 8, flexWrap: "wrap" }}>
          {/* 风险标签放在进度条上方、与标题同一行（标题右侧），紧邻当前学习阶段 */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.inkMuted, letterSpacing: "0.04em" }}>
              当前学习阶段
            </div>
            <RiskTag icon={<AlertTriangle size={10} />} label="薄弱 24 个" color={C.weak} bg={C.weakBg} />
            <RiskTag icon={<RotateCcw size={10} />} label="到期复习 17 个" color={C.reviewDue} bg="#F0F2F6" />
          </div>
          {/* 当前熟悉程度 — read-only system indicator (spec 行346) */}
          <div style={{ display: "flex", alignItems: "center", gap: 5 }} title="由你的练习数据自动评估，不支持手动修改">
            <span style={{ fontSize: 11, color: C.inkMuted }}>当前熟悉程度</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.mastered }}>中等</span>
            <span style={{
              width: 14, height: 14, borderRadius: "50%", background: "#EEF1F7",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              color: C.inkMuted, flexShrink: 0,
            }}>
              <Info size={9} />
            </span>
          </div>
        </div>

        {/* Legend — 8px dots, 11px labels */}
        <div style={{ display: "flex", gap: 14, marginBottom: 8, flexWrap: "wrap" }}>
          {STAGES.map(s => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: C.inkMuted }}>{s.label}</span>
              <span style={{ fontSize: 11, color: C.inkSub, fontWeight: 600 }}>{s.pct}%</span>
            </div>
          ))}
        </div>

        {/* 4-segment bar — 8px height */}
        <div style={{ display: "flex", borderRadius: 5, overflow: "hidden", height: 8, gap: 1.5 }}>
          {STAGES.map(s => (
            <div key={s.label} style={{ flex: s.pct, background: s.color, minWidth: 2 }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Suggested next steps cards ────────────────────────────────────────────────

interface ActionCardProps {
  name: string;
  tag: string;
  tagColor: string;
  tagBg: string;
  action: string;
  actionColor: string;
  actionBg: string;
  onAction?: () => void;
}

function ActionCard({ name, tag, tagColor, tagBg, action, actionColor, actionBg, onAction }: ActionCardProps) {
  return (
    <div style={{
      flex: 1, background: C.card, borderRadius: 14,
      boxShadow: C.shadow, padding: "14px 16px",
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
      border: `1px solid ${C.border}`,
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 5,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {name}
        </div>
        <span style={{ fontSize: 11, color: tagColor, background: tagBg, borderRadius: 5, padding: "2px 7px", fontWeight: 500 }}>
          {tag}
        </span>
      </div>
      <button
        onClick={() => onAction?.()}
        style={{
          fontSize: 12, fontWeight: 600, color: actionColor, background: actionBg,
          border: "none", borderRadius: 9, padding: "7px 14px", cursor: "pointer",
          flexShrink: 0,
        }}>
        {action}
      </button>
    </div>
  );
}

// Fix 9: MockExamCard — most visually striking
function MockExamCard({ onStartMockExam }: { onStartMockExam?: () => void }) {
  return (
    <div style={{
      flex: 1,
      background: "linear-gradient(135deg, #1A2235 0%, #0F1520 100%)",
      border: "1px solid rgba(253,234,59,0.15)",
      borderRadius: 14,
      boxShadow: C.shadow, padding: "14px 16px",
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
    }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 5 }}>综合模考</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div className="animate-pulse" style={{
            width: 6, height: 6, borderRadius: "50%", background: "#FDEA3B",
          }} />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>已 14 天未做整卷</span>
        </div>
      </div>
      <button
        onClick={() => onStartMockExam?.()}
        style={{
          fontSize: 13, fontWeight: 700, color: C.ink,
          background: "#FDEA3B", border: "none", borderRadius: 9,
          padding: "8px 16px", cursor: "pointer", flexShrink: 0,
        }}>
        开始模考
      </button>
    </div>
  );
}

// ── Next steps section ────────────────────────────────────────────────────────

interface NextStepsProps {
  direction: "row" | "column";
  onStartPractice?: () => void;
  onStartMockExam?: () => void;
  onMapClick: () => void;
}

function NextSteps({ direction, onStartPractice, onStartMockExam, onMapClick }: NextStepsProps) {
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>建议下一步</span>
        <button onClick={onMapClick}
          style={{ fontSize: 12, color: C.inkMuted, background: "none", border: "none", cursor: "pointer" }}>
          全部薄弱项见星图 →
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: direction, gap: direction === "row" ? 10 : 8 }}>
        <MockExamCard onStartMockExam={onStartMockExam} />
        <ActionCard
          name="渎职罪构成"
          tag="连错 3 次"
          tagColor={C.weak} tagBg={C.weakBg}
          action="去强化"
          actionColor={C.weak} actionBg={C.weakBg}
          onAction={onStartPractice}
        />
        <ActionCard
          name="受贿数额认定"
          tag="7 天未复习"
          tagColor={C.reviewDue} tagBg="#F0F2F6"
          action="去复习"
          actionColor={C.primary} actionBg={C.primaryLight}
          onAction={onStartPractice}
        />
      </div>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface OverviewScreenProps {
  onViewResources?: () => void;
  onStartMockExam?: () => void;
  onStartPractice?: () => void;
  onViewKnowledgeMap?: () => void;
  onNavigateToFavorites?: () => void;
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function OverviewScreen({
  onViewResources, onStartMockExam, onStartPractice, onViewKnowledgeMap, onNavigateToFavorites,
}: OverviewScreenProps) {
  const [infoAnchor, setInfoAnchor] = useState<DOMRect | null>(null);
  const [showShare, setShowShare] = useState(false);
  // 朝向改为消费全局 orientation（切换按钮已上移到 App 外框全局控件）
  const { orientation } = useApp();
  const portrait = orientation === 'portrait';

  const FF = "'Inter','Noto Sans SC',system-ui,-apple-system,'PingFang SC','Microsoft YaHei',sans-serif";

  const handleMapClick = useCallback(() => {
    onViewKnowledgeMap?.();
  }, [onViewKnowledgeMap]);

  return (
    <div style={{ position: "relative", height: "100%", background: C.bg, fontFamily: FF, overflow: "hidden" }}>
      {/* 横竖屏切换已提升为 App 外框的全局控件（见 App.tsx），此处不再单独放置按钮 */}

      {/* Scrollable content */}
      <div
        style={{ height: "100%", overflowY: "auto", overflowX: "hidden" }}
        className="[&::-webkit-scrollbar]:hidden"
      >
        {/* Fix 8: Portrait = maxWidth 440, landscape = full width */}
        {/* 底部 96px 余量：Review Mode 底部 Tab 栏(h-16=64px)以 absolute 覆盖在屏幕内容之上，
            预留不足会导致最后一屏内容永远滚不出来（滚动“无法正常操作”问题根因） */}
        <div style={{
          maxWidth: portrait ? 440 : "100%",
          margin: portrait ? "0 auto" : undefined,
          padding: "0 18px 96px",
        }}>

          {/* ── Page header ── */}
          <div style={{
            padding: "15px 0 12px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: C.ink }}>学习总览</span>

            <div style={{ display: "flex", alignItems: "center" }}>
              <button onClick={() => onNavigateToFavorites?.()} style={{
                display: "flex", alignItems: "center", gap: 4,
                padding: "5px 10px", background: "none", border: "none",
                cursor: "pointer", color: C.inkSub, fontSize: 13, fontWeight: 500,
              }}>
                <Star size={13} color={C.brandDeep} fill={C.brandDeep} />
                <span>收藏12</span>
              </button>

              <div style={{ width: 1, height: 14, background: C.border, margin: "0 2px" }} />

              <button onClick={() => onViewResources?.()} style={{
                display: "flex", alignItems: "center", gap: 4,
                padding: "5px 9px", background: "none", border: "none",
                cursor: "pointer", color: C.inkMuted, fontSize: 13,
              }}>
                <FolderOpen size={13} />
                <span>资料</span>
              </button>

              <button style={{
                display: "flex", alignItems: "center", gap: 4,
                padding: "5px 9px", background: "none", border: "none",
                cursor: "pointer", color: C.inkMuted, fontSize: 13,
              }}>
                <Settings size={13} />
                <span>设置</span>
              </button>
            </div>
          </div>

          {/* Fix 8: Portrait = 220px star map, landscape = 200px */}
          <FusionCard
            mapHeight={portrait ? 220 : 200}
            onShowInfo={(rect) => setInfoAnchor(rect)}
            onMapClick={handleMapClick}
            onShare={() => setShowShare(true)}
          />

          {/* Fix 8: Portrait = column direction, landscape = row */}
          <NextSteps
            direction={portrait ? "column" : "row"}
            onStartPractice={onStartPractice}
            onStartMockExam={onStartMockExam}
            onMapClick={handleMapClick}
          />
        </div>
      </div>

      {/* Overlays are position:fixed, rendered at root level */}
      {infoAnchor && <InfoPopover anchor={infoAnchor} onClose={() => setInfoAnchor(null)} />}
      {showShare && <SharePosterModal onClose={() => setShowShare(false)} />}
    </div>
  );
}
