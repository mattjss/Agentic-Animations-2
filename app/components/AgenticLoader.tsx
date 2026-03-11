"use client";

import { useEffect, useRef, useState } from "react";
import type { Controls } from "./ControlPanel";

// ─── Types ────────────────────────────────────────────────────────────────────
export type CssAnim = {
  kind: "css";
  id: string;
  label: string;
  cols: number;
  cellSize: number;
  duration: number;
  minOpacity: number;
  maxOpacity: number;
  delays: number[];
  easing?: string;
};

export type FrameAnim = {
  kind: "frame";
  id: string;
  label: string;
  fps: number;
  frames: number[][];
};

export type AgentAnim = CssAnim | FrameAnim;

// ─── Frame helpers ────────────────────────────────────────────────────────────
const O = [0, 0.08, 0.18, 0.32, 0.50, 0.68, 0.84, 1.0];
const o = (v: number) => O[Math.min(Math.max(v, 0), 7)];
function f(rows: number[][]): number[] {
  return rows.flat().map(v => o(v));
}

// ─── CSS delay helpers (3×3, step = ms between adjacent cells) ───────────────
const d = (arr: number[], step: number) => arr.map(v => v * step);

// All 20 patterns from the reference image:
const DELAYS: Record<string, (step: number) => number[]> = {
  // Row 1 — directional waves
  "wave-lr":      s => d([0,1,2, 0,1,2, 0,1,2], s),
  "wave-rl":      s => d([2,1,0, 2,1,0, 2,1,0], s),
  "wave-tb":      s => d([0,0,0, 1,1,1, 2,2,2], s),
  "wave-bt":      s => d([2,2,2, 1,1,1, 0,0,0], s),

  // Row 2 — diagonal waves
  "diagonal-tl":  s => d([0,1,2, 1,2,3, 2,3,4], s),
  "diagonal-tr":  s => d([2,1,0, 3,2,1, 4,3,2], s),
  "diagonal-bl":  s => d([2,3,4, 1,2,3, 0,1,2], s),
  "diagonal-br":  s => d([4,3,2, 3,2,1, 2,1,0], s),

  // Kept
  "rain":         s => d([0,4,2, 1,5,3, 2,6,4], s),   // each column cascades top→bottom, columns stagger
  "zigzag":       s => d([0,8,6, 1,7,5, 2,8,4], s),   // vertical snake: col0 top→bot, col1 bot→top, col2 top→bot
  "snake":        s => d([0,1,2, 5,4,3, 6,7,8], s),   // Z-path boustrophedon
  "fade":         s => d([0,2,1, 3,1,2, 1,0,3], s),   // organic breath: cells shimmer slightly out of phase
  "scatter":      s => d([0,5,2, 7,3,8, 1,6,4], s),   // pseudo-random spread
  "fill":         s => d([0,1,2, 3,4,5, 6,7,8], s),   // reading-order sequential fill
  "bounce":       s => d([0,2,4, 5,3,1, 6,8,10], s),  // rows alternate direction: row0 L→R, row1 R→L, row2 L→R — woven reversal
  "mirror-v":     s => d([2,1,0, 0,1,2, 2,1,0], s),   // rows mirror: outer cols fire, center last

  // New replacements
  "zoom":         s => d([4,3,4, 3,0,3, 4,3,4], s),   // all cells, center peaks hardest
  "corners":      s => d([0,4,0, 4,8,4, 0,4,0], s),   // 4 corners fire together, center last
  "rows-alt":     s => d([0,0,0, 2,2,2, 0,0,0], s),   // top+bottom rows in sync, middle offset
  "cols-alt":     s => d([0,2,0, 0,2,0, 0,2,0], s),   // left+right cols in sync, center offset
  "spiral-in":    s => d([0,1,2, 7,8,3, 6,5,4], s),   // perimeter → center (slower, ease-in)
  "spiral-out":   s => d([8,7,6, 1,0,5, 2,3,4], s),   // center → perimeter outward
  "cross-h":      s => d([2,0,2, 2,0,2, 2,0,2], s),   // center column fires, flanks follow
  "cross-v":      s => d([2,2,2, 0,0,0, 2,2,2], s),   // center row fires, top+bottom follow
  "stagger":      s => d([0,2,4, 1,3,5, 2,4,6], s),   // every cell offset by 1 step
};

// ─── CSS animation factory ────────────────────────────────────────────────────
function css(
  id: string,
  label: string,
  duration: number,
  step: number,
  opts: Partial<Pick<CssAnim, "minOpacity"|"maxOpacity"|"easing"|"cols"|"cellSize">> = {}
): CssAnim {
  return {
    kind: "css",
    id,
    label,
    cols: opts.cols ?? 3,
    cellSize: opts.cellSize ?? 8,
    duration,
    minOpacity: opts.minOpacity ?? 0.06,
    maxOpacity: opts.maxOpacity ?? 1,
    delays: DELAYS[id](step),
    easing: opts.easing ?? "ease-in-out",
  };
}

// ─── Animation library ────────────────────────────────────────────────────────
export const AGENT_STEPS: AgentAnim[] = [
  // Keepers — directional waves
  css("wave-lr",     "WAVE-LR",     800,  110),
  css("wave-rl",     "WAVE-RL",     800,  110),
  css("wave-tb",     "WAVE-TB",     800,  110),
  css("wave-bt",     "WAVE-BT",     800,  110),

  // Keepers — diagonal waves
  css("diagonal-tl", "DIAGONAL-TL", 900,  90),
  css("diagonal-tr", "DIAGONAL-TR", 900,  90),
  css("diagonal-bl", "DIAGONAL-BL", 900,  90),
  css("diagonal-br", "DIAGONAL-BR", 900,  90),

  // Keepers — motion
  css("snake",       "SNAKE",       1000, 90,  { easing: "linear" }),
  css("fill",        "FILL",        1400, 80,  { easing: "ease-in-out" }),
  css("bounce",      "BOUNCE",      1400, 70,  { easing: "ease-in-out" }),

  // Rhythm
  css("fade",        "FADE",        1800, 60,  { easing: "ease-in-out" }),
  css("scatter",     "SCATTER",     800,  75,  { easing: "ease-in-out" }),
  css("spiral-out",  "SPIRAL-OUT",  1200, 90,  { easing: "ease-out" }),
  css("rain",        "RAIN",        500,  90,  { easing: "ease-in", minOpacity: 0.04, maxOpacity: 1 }),
  css("zigzag",      "ZIGZAG",      1000, 80,  { easing: "linear" }),
];

// ─── CSS keyframe injection ───────────────────────────────────────────────────
const injectedKeyframes = new Set<string>();
function ensureKeyframe(minOp: number, maxOp: number): string {
  const key = `px_${Math.round(minOp * 100)}_${Math.round(maxOp * 100)}`;
  if (injectedKeyframes.has(key)) return key;
  if (typeof document === "undefined") return key;
  const style = document.createElement("style");
  style.textContent = `
    @keyframes ${key} {
      0%   { opacity: ${minOp}; }
      50%  { opacity: ${maxOp}; }
      100% { opacity: ${minOp}; }
    }
  `;
  document.head.appendChild(style);
  injectedKeyframes.add(key);
  return key;
}

// ─── Gradient glow color: extract a representative solid color for box-shadow ─
function glowColor(color: string, isGradient: boolean): string {
  if (!isGradient) return color;
  // Pull the first hex from the gradient string for glow tint
  const match = color.match(/#[0-9a-fA-F]{6}/);
  return match ? match[0] : "#ffffff";
}

// ─── CssPixelIcon ─────────────────────────────────────────────────────────────
function CssPixelIcon({ anim, controls }: { anim: CssAnim; controls: Controls }) {
  const easing = anim.easing ?? "ease-in-out";
  const minOp = 0.06;
  const maxOp = controls.opacity;
  const duration = Math.round(anim.duration / controls.speed);
  const cellSize = controls.cellSize;
  const gap = controls.gap;
  const borderRadius = controls.shape === "round" ? "50%" : 2;
  const isGradient = controls.colorMode === "gradient";
  const glow = controls.glow;

  const [keyframe, setKeyframe] = useState("");

  useEffect(() => {
    setKeyframe(ensureKeyframe(minOp, maxOp));
  }, [maxOp]);

  const size = anim.cols * cellSize + (anim.cols - 1) * gap;
  const gc = glowColor(controls.color, isGradient);

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        flexShrink: 0,
        isolation: isGradient ? "isolate" : undefined,
      }}
    >
      {isGradient && (
        <div style={{ position: "absolute", inset: 0, background: controls.color, borderRadius: 1 }} />
      )}
      <div
        style={{
          position: "relative",
          width: size,
          height: size,
          display: "grid",
          gridTemplateColumns: `repeat(${anim.cols}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${anim.cols}, ${cellSize}px)`,
          gap: `${gap}px`,
        }}
      >
        {anim.delays.map((delay, i) => (
          <div
            key={i}
            style={{
              width: cellSize,
              height: cellSize,
              borderRadius,
              backgroundColor: isGradient ? "#ffffff" : controls.color,
              mixBlendMode: isGradient ? ("screen" as React.CSSProperties["mixBlendMode"]) : undefined,
              opacity: minOp,
              animation: keyframe
                ? `${keyframe} ${duration}ms ${easing} ${delay}ms infinite`
                : undefined,
              boxShadow: glow > 0
                ? `0 0 ${glow}px ${Math.round(glow * 0.6)}px ${gc}`
                : undefined,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── FramePixelIcon ───────────────────────────────────────────────────────────
function FramePixelIcon({ anim, controls }: { anim: FrameAnim; controls: Controls }) {
  const [frameIdx, setFrameIdx] = useState(0);
  const ref = useRef(0);

  useEffect(() => { ref.current = 0; setFrameIdx(0); }, [anim.id]);

  useEffect(() => {
    const ms = Math.round(1000 / (anim.fps * controls.speed));
    const id = setInterval(() => {
      ref.current = (ref.current + 1) % anim.frames.length;
      setFrameIdx(ref.current);
    }, ms);
    return () => clearInterval(id);
  }, [anim, controls.speed]);

  const cells = anim.frames[frameIdx] ?? anim.frames[0];
  const cellSize = controls.cellSize;
  const gap = controls.gap;
  const borderRadius = controls.shape === "round" ? "50%" : 2;
  const G = 4;
  const isGradient = controls.colorMode === "gradient";
  const gc = glowColor(controls.color, isGradient);
  const glow = controls.glow;
  const size = G * cellSize + (G - 1) * gap;

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0, isolation: isGradient ? "isolate" : undefined }}>
      {isGradient && (
        <div style={{ position: "absolute", inset: 0, background: controls.color, borderRadius: 1 }} />
      )}
      <div
        style={{
          position: "relative",
          width: size,
          height: size,
          display: "grid",
          gridTemplateColumns: `repeat(${G}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${G}, ${cellSize}px)`,
          gap: `${gap}px`,
        }}
      >
        {cells.map((opacity, i) => (
          <div
            key={i}
            style={{
              width: cellSize,
              height: cellSize,
              borderRadius,
              backgroundColor: isGradient ? "#ffffff" : controls.color,
              mixBlendMode: isGradient ? ("screen" as React.CSSProperties["mixBlendMode"]) : undefined,
              opacity: opacity * controls.opacity,
              transition: "opacity 80ms linear",
              boxShadow: glow > 0 && opacity > 0.3
                ? `0 0 ${glow}px ${Math.round(glow * 0.6)}px ${gc}`
                : undefined,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── PixelIcon (unified) ──────────────────────────────────────────────────────
export interface PixelIconProps {
  stepId: string;
  controls: Controls;
}

export function PixelIcon({ stepId, controls }: PixelIconProps) {
  const anim = AGENT_STEPS.find(s => s.id === stepId) ?? AGENT_STEPS[0];
  if (anim.kind === "css") return <CssPixelIcon anim={anim} controls={controls} />;
  return <FramePixelIcon anim={anim} controls={controls} />;
}

export default PixelIcon;
