"use client";

import { useEffect, useRef, useState } from "react";

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
  "orbit":        s => d([0,1,2, 7,8,3, 6,5,4], s),   // CW spiral around perimeter
  "snake":        s => d([0,1,2, 5,4,3, 6,7,8], s),   // Z-path boustrophedon
  "fade":         s => d([0,0,0, 0,0,0, 0,0,0], s),   // all cells breathe in unison
  "scatter":      s => d([0,5,2, 7,3,8, 1,6,4], s),   // pseudo-random spread
  "fill":         s => d([0,1,2, 3,4,5, 6,7,8], s),   // reading-order sequential fill
  "ripple":       s => d([0,1,2, 1,2,3, 2,3,4], s),   // corner origin, expands diagonally
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
  css("orbit",       "ORBIT",       1100, 85,  { easing: "linear" }),
  css("snake",       "SNAKE",       1000, 90,  { easing: "linear" }),
  css("fill",        "FILL",        1400, 80,  { easing: "ease-in-out" }),
  css("ripple",      "RIPPLE",      1000, 90,  { easing: "ease-out" }),

  // Keepers — rhythm
  css("fade",        "FADE",        1400, 0,   { easing: "ease-in-out" }),
  css("scatter",     "SCATTER",     800,  75,  { easing: "ease-in-out" }),
  css("mirror-v",    "MIRROR-V",    800,  110, { easing: "ease-in-out" }),

  // New patterns
  css("zoom",        "ZOOM",        1200, 110, { easing: "ease-in-out" }),
  css("corners",     "CORNERS",     1100, 100, { easing: "ease-in-out" }),
  css("rows-alt",    "ROWS-ALT",    700,  200, { easing: "ease-in-out" }),
  css("cols-alt",    "COLS-ALT",    700,  200, { easing: "ease-in-out" }),
  css("spiral-in",   "SPIRAL-IN",   1200, 90,  { easing: "ease-in" }),
  css("spiral-out",  "SPIRAL-OUT",  1200, 90,  { easing: "ease-out" }),
  css("cross-h",     "CROSS-H",     800,  150, { easing: "ease-in-out" }),
  css("cross-v",     "CROSS-V",     800,  150, { easing: "ease-in-out" }),
  css("stagger",     "STAGGER",     900,  80,  { easing: "ease-in-out" }),
];

// ─── CSS keyframe injection ───────────────────────────────────────────────────
const injectedKeyframes = new Set<string>();
function ensureKeyframe(minOp: number, maxOp: number, easing: string): string {
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

// ─── CssPixelIcon ─────────────────────────────────────────────────────────────
function CssPixelIcon({ anim }: { anim: CssAnim }) {
  const easing = anim.easing ?? "ease-in-out";
  const [keyframe, setKeyframe] = useState("");

  useEffect(() => {
    setKeyframe(ensureKeyframe(anim.minOpacity, anim.maxOpacity, easing));
  }, [anim.minOpacity, anim.maxOpacity, easing]);

  const size = anim.cols * anim.cellSize;

  return (
    <div
      style={{
        width: size,
        height: size,
        display: "grid",
        gridTemplateColumns: `repeat(${anim.cols}, ${anim.cellSize}px)`,
        gridTemplateRows: `repeat(${anim.cols}, ${anim.cellSize}px)`,
        backgroundColor: "#111111",
        flexShrink: 0,
      }}
    >
      {anim.delays.map((delay, i) => (
        <div
          key={i}
          style={{
            width: anim.cellSize,
            height: anim.cellSize,
            backgroundColor: "#ffffff",
            opacity: anim.minOpacity,
            animation: keyframe
              ? `${keyframe} ${anim.duration}ms ${easing} ${delay}ms infinite`
              : undefined,
          }}
        />
      ))}
    </div>
  );
}

// ─── FramePixelIcon ───────────────────────────────────────────────────────────
function FramePixelIcon({ anim, speed = 1 }: { anim: FrameAnim; speed?: number }) {
  const [frameIdx, setFrameIdx] = useState(0);
  const ref = useRef(0);

  useEffect(() => { ref.current = 0; setFrameIdx(0); }, [anim.id]);

  useEffect(() => {
    const ms = Math.round(1000 / (anim.fps * speed));
    const id = setInterval(() => {
      ref.current = (ref.current + 1) % anim.frames.length;
      setFrameIdx(ref.current);
    }, ms);
    return () => clearInterval(id);
  }, [anim, speed]);

  const cells = anim.frames[frameIdx] ?? anim.frames[0];
  const G = 4, CELL = 6;

  return (
    <div
      style={{
        width: G * CELL,
        height: G * CELL,
        display: "grid",
        gridTemplateColumns: `repeat(${G}, ${CELL}px)`,
        gridTemplateRows: `repeat(${G}, ${CELL}px)`,
        backgroundColor: "#111111",
        flexShrink: 0,
      }}
    >
      {cells.map((opacity, i) => (
        <div
          key={i}
          style={{
            width: CELL,
            height: CELL,
            backgroundColor: "#ffffff",
            opacity,
            transition: "opacity 80ms linear",
          }}
        />
      ))}
    </div>
  );
}

// ─── PixelIcon (unified) ──────────────────────────────────────────────────────
export interface PixelIconProps {
  stepId: string;
  speed?: number;
}

export function PixelIcon({ stepId, speed = 1 }: PixelIconProps) {
  const anim = AGENT_STEPS.find(s => s.id === stepId) ?? AGENT_STEPS[0];
  if (anim.kind === "css") return <CssPixelIcon anim={anim} />;
  return <FramePixelIcon anim={anim} speed={speed} />;
}

export default PixelIcon;
