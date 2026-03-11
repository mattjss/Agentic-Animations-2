"use client";

import { useEffect, useRef, useState } from "react";

// 24×24px frame — 4×4 grid of 6×6px cells
const G = 4;
const CELL = 6;

// 0=off  1=0.08  2=0.18  3=0.32  4=0.50  5=0.68  6=0.84  7=1.0
const O = [0, 0.08, 0.18, 0.32, 0.50, 0.68, 0.84, 1.0];
const o = (v: number) => O[Math.min(Math.max(v, 0), 7)];

function f(rows: number[][]): number[] {
  return rows.flat().map(v => o(v));
}

export type AgentAnim = {
  id: string;
  label: string;
  fps: number;
  frames: number[][];
};

// ─── Design rules ────────────────────────────────────────────────────────────
// Every animation follows the same formula as Reasoning + Indexing:
//   • 1–3 bright focal pixels (opacity 7) at any given time
//   • Clear geometric motion path (orbit, line, spiral, bounce…)
//   • Opacity trail: 7 → 5 → 3 → 1 → 0 behind the head
//   • Negative space: most cells are 0 or very dim (1–2)
//   • No full rows/columns lit uniformly — that reads as a bar, not a pixel
// ─────────────────────────────────────────────────────────────────────────────

export const AGENT_STEPS: AgentAnim[] = [

  // 1. REASONING ── two bright dots orbit 180° apart (KEEP — reference quality)
  {
    id: "reasoning",
    label: "REASONING",
    fps: 9,
    frames: (() => {
      const pos: [number,number][] = [
        [0,1],[0,2],[1,3],[2,3],[3,2],[3,1],[2,0],[1,0],
      ];
      return pos.map((_, i) => {
        const g = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
        g[1][1] = 1; g[1][2] = 1; g[2][1] = 1; g[2][2] = 1;
        const ta2 = pos[(i-2+8)%8]; g[ta2[0]][ta2[1]] = 1;
        const tb2 = pos[(i+2)%8];   g[tb2[0]][tb2[1]] = 1;
        const ta1 = pos[(i-1+8)%8]; g[ta1[0]][ta1[1]] = 3;
        const tb1 = pos[(i+3)%8];   g[tb1[0]][tb1[1]] = 3;
        const a = pos[i];            g[a[0]][a[1]] = 7;
        const b = pos[(i+4)%8];      g[b[0]][b[1]] = 7;
        return f(g);
      });
    })(),
  },

  // 2. INDEXING ── single dot walks every cell, fading ghost trail (KEEP)
  {
    id: "indexing",
    label: "INDEXING",
    fps: 12,
    frames: (() => {
      const path: [number,number][] = [];
      for (let r = 0; r < 4; r++)
        for (let c = 0; c < 4; c++)
          path.push([r, c]);
      return path.map((_, i) => {
        const g = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
        for (let k = 0; k < i; k++) {
          const age = i - k;
          const v = age === 1 ? 4 : age === 2 ? 2 : age === 3 ? 1 : 0;
          if (v > 0) g[path[k][0]][path[k][1]] = v;
        }
        g[path[i][0]][path[i][1]] = 7;
        return f(g);
      });
    })(),
  },

  // 3. THINKING ── 3 dots flicker independently, each on its own slow pulse
  // Each dot has its own position and phase — they never sync
  {
    id: "thinking",
    label: "THINKING",
    fps: 9,
    frames: (() => {
      // Three fixed positions, each cycling through opacity independently
      const dots: [number,number][] = [[0,0],[1,3],[3,1]];
      const phases = [0, 3, 6]; // offset phases
      const cycle = [7,6,4,2,1,2,4,6]; // brightness wave
      return Array.from({length: 12}, (_, i) =>
        f(Array.from({length:4}, (__, r) =>
          Array.from({length:4}, (___, c) => {
            const di = dots.findIndex(([dr,dc]) => dr===r && dc===c);
            if (di === -1) return 0;
            return cycle[(i + phases[di]) % cycle.length];
          })
        ))
      );
    })(),
  },

  // 4. PROCESSING ── snake on Z-path, 3-pixel tail, clean and fast
  {
    id: "processing",
    label: "PROCESSING",
    fps: 11,
    frames: (() => {
      const path: [number,number][] = [
        [0,0],[0,1],[0,2],[0,3],
        [1,3],[1,2],[1,1],[1,0],
        [2,0],[2,1],[2,2],[2,3],
        [3,3],[3,2],[3,1],[3,0],
      ];
      return path.map((_, i) => {
        const g = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
        const s = (k: number, v: number) => {
          const p = path[(i-k+16)%16];
          g[p[0]][p[1]] = Math.max(g[p[0]][p[1]], v);
        };
        s(3,1); s(2,2); s(1,4); s(0,7);
        return f(g);
      });
    })(),
  },

  // 5. SCANNING ── single bright dot sweeps left→right across one row,
  // then drops to next row. Like a read-head.
  {
    id: "scanning",
    label: "SCANNING",
    fps: 10,
    frames: (() => {
      const frames: number[][] = [];
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          const g = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
          // dim visited rows
          for (let pr = 0; pr < r; pr++)
            for (let pc = 0; pc < 4; pc++) g[pr][pc] = 1;
          // trail in current row
          if (c > 0) g[r][c-1] = 3;
          if (c > 1) g[r][c-2] = 1;
          g[r][c] = 7;
          frames.push(f(g));
        }
      }
      return frames;
    })(),
  },

  // 6. ROUTING ── single bright dot travels the diagonal TL→BR,
  // then resets. Clean line, 3-step trail.
  {
    id: "routing",
    label: "ROUTING",
    fps: 10,
    frames: (() => {
      // diagonal path: (0,0)→(1,1)→(2,2)→(3,3), then off-grid fade
      const path: [number,number][] = [
        [0,0],[1,1],[2,2],[3,3],
      ];
      const frames: number[][] = [];
      for (let i = 0; i < path.length; i++) {
        const g = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
        if (i >= 3) g[path[i-3][0]][path[i-3][1]] = 1;
        if (i >= 2) g[path[i-2][0]][path[i-2][1]] = 2;
        if (i >= 1) g[path[i-1][0]][path[i-1][1]] = 4;
        g[path[i][0]][path[i][1]] = 7;
        frames.push(f(g));
      }
      // fade out
      frames.push(f([[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,0,0]]));
      frames.push(f([[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,0,0,0]]));
      frames.push(f([[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]));
      return frames;
    })(),
  },

  // 7. PARSING ── dot spirals inward clockwise: outer ring → inner ring → center
  {
    id: "parsing",
    label: "PARSING",
    fps: 10,
    frames: (() => {
      const path: [number,number][] = [
        [0,0],[0,1],[0,2],[0,3],
        [1,3],[2,3],[3,3],
        [3,2],[3,1],[3,0],
        [2,0],[1,0],
        [1,1],[1,2],
        [2,2],[2,1],
      ];
      return path.map((_, i) => {
        const g = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
        const s = (k: number, v: number) => {
          const p = path[(i-k+path.length)%path.length];
          g[p[0]][p[1]] = v;
        };
        s(4,1); s(3,2); s(2,3); s(1,5); s(0,7);
        return f(g);
      });
    })(),
  },

  // 8. DRAFTING ── dot moves along top edge L→R, then right edge T→B,
  // then bottom edge R→L, then left edge B→T — a perimeter orbit
  // but only ONE dot, no trail duplication with PARSING
  {
    id: "drafting",
    label: "DRAFTING",
    fps: 10,
    frames: (() => {
      const path: [number,number][] = [
        [0,0],[0,1],[0,2],[0,3],
        [1,3],[2,3],[3,3],
        [3,2],[3,1],[3,0],
        [2,0],[1,0],
      ];
      return path.map((_, i) => {
        const g = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
        const s = (k: number, v: number) => {
          const p = path[(i-k+path.length)%path.length];
          g[p[0]][p[1]] = Math.max(g[p[0]][p[1]], v);
        };
        s(3,1); s(2,2); s(1,4); s(0,7);
        return f(g);
      });
    })(),
  },

  // 9. LINKING ── two dots start at opposite corners and swap positions,
  // passing through center. They cross mid-frame.
  {
    id: "linking",
    label: "LINKING",
    fps: 8,
    frames: (() => {
      // dot A: TL→BR diagonal
      // dot B: TR→BL diagonal
      const pathA: [number,number][] = [[0,0],[1,1],[2,2],[3,3],[2,2],[1,1]];
      const pathB: [number,number][] = [[0,3],[1,2],[2,1],[3,0],[2,1],[1,2]];
      return pathA.map((_, i) => {
        const g = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
        // trails
        if (i>0) { g[pathA[i-1][0]][pathA[i-1][1]] = Math.max(g[pathA[i-1][0]][pathA[i-1][1]],3); }
        if (i>0) { g[pathB[i-1][0]][pathB[i-1][1]] = Math.max(g[pathB[i-1][0]][pathB[i-1][1]],3); }
        if (i>1) { g[pathA[i-2][0]][pathA[i-2][1]] = Math.max(g[pathA[i-2][0]][pathA[i-2][1]],1); }
        if (i>1) { g[pathB[i-2][0]][pathB[i-2][1]] = Math.max(g[pathB[i-2][0]][pathB[i-2][1]],1); }
        // heads
        g[pathA[i][0]][pathA[i][1]] = Math.max(g[pathA[i][0]][pathA[i][1]], 7);
        g[pathB[i][0]][pathB[i][1]] = Math.max(g[pathB[i][0]][pathB[i][1]], 7);
        return f(g);
      });
    })(),
  },

  // 10. COMPILING ── dot bounces vertically in col 1, then col 2, col 3, col 4
  // Like a progress indicator moving column by column
  {
    id: "compiling",
    label: "COMPILING",
    fps: 10,
    frames: (() => {
      const frames: number[][] = [];
      for (let col = 0; col < 4; col++) {
        // bounce: 0→3→0
        const bounce = [0,1,2,3,2,1];
        for (const row of bounce) {
          const g = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
          // ghost: completed columns
          for (let pc = 0; pc < col; pc++)
            for (let pr = 0; pr < 4; pr++) g[pr][pc] = 1;
          // trail
          const prev = row > 0 ? row - 1 : null;
          const prev2 = row > 1 ? row - 2 : null;
          if (prev !== null) g[prev][col] = 3;
          if (prev2 !== null) g[prev2][col] = 1;
          g[row][col] = 7;
          frames.push(f(g));
        }
      }
      return frames;
    })(),
  },

  // 11. MAPPING ── dot traces the anti-diagonal BR→TL, clean and minimal
  {
    id: "mapping",
    label: "MAPPING",
    fps: 10,
    frames: (() => {
      const path: [number,number][] = [
        [3,3],[2,2],[1,1],[0,0],
      ];
      const frames: number[][] = [];
      for (let i = 0; i < path.length; i++) {
        const g = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
        if (i >= 3) g[path[i-3][0]][path[i-3][1]] = 1;
        if (i >= 2) g[path[i-2][0]][path[i-2][1]] = 2;
        if (i >= 1) g[path[i-1][0]][path[i-1][1]] = 4;
        g[path[i][0]][path[i][1]] = 7;
        frames.push(f(g));
      }
      frames.push(f([[1,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]));
      frames.push(f([[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]));
      return frames;
    })(),
  },

  // 12. QUERYING ── dot drops down col 0, then col 1, col 2, col 3 — read-head
  {
    id: "querying",
    label: "QUERYING",
    fps: 10,
    frames: (() => {
      const frames: number[][] = [];
      for (let col = 0; col < 4; col++) {
        for (let row = 0; row < 4; row++) {
          const g = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
          for (let pc = 0; pc < col; pc++)
            for (let pr = 0; pr < 4; pr++) g[pr][pc] = 1;
          if (row > 1) g[row-2][col] = 1;
          if (row > 0) g[row-1][col] = 3;
          g[row][col] = 7;
          frames.push(f(g));
        }
      }
      return frames;
    })(),
  },

  // 13. SYNCING ── two dots start at opposite sides of the same row and
  // move toward each other, meet at center, then separate to next row
  {
    id: "syncing",
    label: "SYNCING",
    fps: 9,
    frames: (() => {
      const frames: number[][] = [];
      for (let row = 0; row < 4; row++) {
        // approach: col 0 and col 3 move inward
        const steps: [number,number][] = [[0,3],[1,2],[1,2],[2,1],[2,1],[3,0]];
        for (const [lc, rc] of steps) {
          const g = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
          // dim visited rows
          for (let pr = 0; pr < row; pr++)
            for (let pc = 0; pc < 4; pc++) g[pr][pc] = 1;
          g[row][lc] = 7;
          if (lc !== rc) g[row][rc] = 7;
          else { // meeting point — flash brighter
            g[row][lc] = 7;
            if (lc > 0) g[row][lc-1] = 2;
            if (rc < 3) g[row][rc+1] = 2;
          }
          frames.push(f(g));
        }
      }
      return frames;
    })(),
  },

  // 14. PATCHING ── checkerboard: two interlocked dots pulse in opposition
  // A is bright when B is dim and vice versa — clean alternating rhythm
  {
    id: "patching",
    label: "PATCHING",
    fps: 8,
    frames: (() => {
      // Only 4 pixels ever lit: the 4 "A" cells of a checkerboard
      // They pulse while the 4 "B" cells pulse inversely
      const cycleA = [7,6,5,4,3,2,1,2,3,4,5,6];
      const cycleB = [1,2,3,4,5,6,7,6,5,4,3,2];
      return Array.from({length: 12}, (_, i) =>
        f([
          [cycleA[i], cycleB[i], cycleA[i], cycleB[i]],
          [cycleB[i], cycleA[i], cycleB[i], cycleA[i]],
          [cycleA[i], cycleB[i], cycleA[i], cycleB[i]],
          [cycleB[i], cycleA[i], cycleB[i], cycleA[i]],
        ])
      );
    })(),
  },

  // 15. STAGING ── center 2×2 pulses; as it dims, a ring of 4 corner dots brightens
  // Clean inverse relationship between core and ring
  {
    id: "staging",
    label: "STAGING",
    fps: 7,
    frames: (() => {
      // core = [1][1],[1][2],[2][1],[2][2]
      // ring = [0][0],[0][3],[3][0],[3][3]
      const coreV = [7,6,5,4,3,2,1,2,3,4,5,6];
      const ringV = [1,2,3,4,5,6,7,6,5,4,3,2];
      return Array.from({length: 12}, (_, i) => {
        const cv = coreV[i], rv = ringV[i];
        return f([
          [rv, 0, 0, rv],
          [0, cv, cv, 0],
          [0, cv, cv, 0],
          [rv, 0, 0, rv],
        ]);
      });
    })(),
  },

  // 16. RESOLVING ── single dot traces a figure-8 path through the grid
  {
    id: "resolving",
    label: "RESOLVING",
    fps: 10,
    frames: (() => {
      // Figure-8: top loop CW then bottom loop CW
      const path: [number,number][] = [
        [0,1],[0,2],        // top edge
        [1,3],[0,3],        // top-right
        [0,2],[0,1],        // back across top
        [1,0],[0,0],        // top-left
        [1,1],[1,2],        // center cross
        [2,1],[2,2],        // center cross lower
        [3,1],[3,0],        // bottom-left
        [2,0],[3,0],
        [3,1],[3,2],        // bottom edge
        [2,3],[3,3],        // bottom-right
        [3,2],[3,1],
        [2,2],[2,1],        // back to center
      ];
      return path.map((_, i) => {
        const g = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
        const s = (k: number, v: number) => {
          const p = path[(i-k+path.length)%path.length];
          g[p[0]][p[1]] = Math.max(g[p[0]][p[1]], v);
        };
        s(3,1); s(2,2); s(1,4); s(0,7);
        return f(g);
      });
    })(),
  },
];

// ─── PixelIcon ──────────────────────────────────────────────────────────────
export interface PixelIconProps {
  stepId: string;
  speed?: number;
}

export function PixelIcon({ stepId, speed = 1 }: PixelIconProps) {
  const step = AGENT_STEPS.find((s) => s.id === stepId) ?? AGENT_STEPS[0];
  const [frameIdx, setFrameIdx] = useState(0);
  const ref = useRef(0);

  useEffect(() => { ref.current = 0; setFrameIdx(0); }, [stepId]);

  useEffect(() => {
    const ms = Math.round(1000 / (step.fps * speed));
    const id = setInterval(() => {
      ref.current = (ref.current + 1) % step.frames.length;
      setFrameIdx(ref.current);
    }, ms);
    return () => clearInterval(id);
  }, [step, speed]);

  const cells = step.frames[frameIdx] ?? step.frames[0];

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

export default PixelIcon;
