"use client";

// Agentic pixel loader library: 16 thoughtful 6x6 pixel animation patterns in a 24x24 frame.

import { useEffect, useState } from "react";
import { motion } from "motion/react";

const GRID_SIZE = 6; // 6x6 grid
const CELL_COUNT = GRID_SIZE * GRID_SIZE;

type AnimationMode =
  | "orbit"
  | "snake"
  | "rowScan"
  | "colScan"
  | "breath"
  | "pulse"
  | "corners";

export type PatternConfig = {
  id: number;
  label: string;
  mode: AnimationMode;
  path?: number[]; // for orbit/snake
  mask?: number[]; // for breath/pulse
  row?: number; // for rowScan
  col?: number; // for colScan
  corners?: number[]; // for corners
  syncCorners?: boolean; // corners mode variant
};

// 6x6 grid indices (0–35), row-major.
export const STAGE_CONFIG: PatternConfig[] = [
  // 1. Solo Center
  {
    id: 0,
    label: "SOLO CENTER",
    mode: "orbit",
    path: [14, 15, 21, 20], // small square around center
  },
  // 2. Solo TL
  {
    id: 1,
    label: "SOLO TL",
    mode: "orbit",
    path: [1, 2, 8, 7],
  },
  // 3. Solo BR
  {
    id: 2,
    label: "SOLO BR",
    mode: "orbit",
    path: [33, 34, 28, 27],
  },
  // 4. Line H-Top
  {
    id: 3,
    label: "LINE H-TOP",
    mode: "rowScan",
    row: 1,
  },
  // 5. Line H-Mid
  {
    id: 4,
    label: "LINE H-MID",
    mode: "rowScan",
    row: 3,
  },
  // 6. Line H-Bot
  {
    id: 5,
    label: "LINE H-BOT",
    mode: "rowScan",
    row: 4,
  },
  // 7. Line V-Left
  {
    id: 6,
    label: "LINE V-LEFT",
    mode: "colScan",
    col: 1,
  },
  // 8. Line V-Mid
  {
    id: 7,
    label: "LINE V-MID",
    mode: "colScan",
    col: 3,
  },
  // 9. Line V-Right
  {
    id: 8,
    label: "LINE V-RIGHT",
    mode: "colScan",
    col: 4,
  },
  // 10. Line Diag-1
  {
    id: 9,
    label: "LINE DIAG-1",
    mode: "snake",
    path: [0, 7, 14, 21, 28, 35],
  },
  // 11. Line Diag-2
  {
    id: 10,
    label: "LINE DIAG-2",
    mode: "snake",
    path: [30, 25, 20, 15, 10, 5],
  },
  // 12. Corners Only
  {
    id: 11,
    label: "CORNERS ONLY",
    mode: "corners",
    corners: [0, 5, 30, 35],
    syncCorners: false,
  },
  // 13. Corners Sync
  {
    id: 12,
    label: "CORNERS SYNC",
    mode: "corners",
    corners: [0, 5, 30, 35],
    syncCorners: true,
  },
  // 14. Plus Hollow
  {
    id: 13,
    label: "PLUS HOLLOW",
    mode: "breath",
    // plus shape leaving very center slightly dimmer by mask choice
    mask: [
      7, 13, 19, 25, // vertical bar
      16, 17, 18, // horizontal bar (row 2)
      11, 23, // short ends
    ],
  },
  // 15. Duo H
  {
    id: 14,
    label: "DUO H",
    mode: "pulse",
    // two horizontal bands
    mask: [
      6, 7, 8, 9, 10, 11, // row 1
      24, 25, 26, 27, 28, 29, // row 4
    ],
  },
  // 16. Duo V
  {
    id: 15,
    label: "DUO V",
    mode: "pulse",
    // two vertical bands
    mask: [
      1, 7, 13, 19, 25, 31, // col 1
      4, 10, 16, 22, 28, 34, // col 4
    ],
  },
];

export interface PixelStageIconProps {
  stageKey: number;
  color?: string; // default white
  speed?: number; // global speed multiplier
}

export function PixelStageIcon({
  stageKey,
  color = "#ffffff",
  speed = 1,
}: PixelStageIconProps) {
  const pattern = STAGE_CONFIG[stageKey % STAGE_CONFIG.length];
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const intervalMs = 100 / speed; // ~10fps scaled
    const id = setInterval(() => {
      setPhase((p) => (p + 1) % 240);
    }, intervalMs);
    return () => clearInterval(id);
  }, [speed]);

  const isIn = (idx: number, list?: number[]) =>
    list ? list.includes(idx) : false;

  const intensityFor = (index: number): number => {
    const t = phase;

    switch (pattern.mode) {
      case "orbit": {
        const path = pattern.path ?? [];
        if (!path.length) return 0;
        const head = t % path.length;
        const prev = (head - 1 + path.length) % path.length;
        const idx = path.indexOf(index);
        if (idx === head) return 1;
        if (idx === prev) return 0.4;
        return 0;
      }

      case "snake": {
        const path = pattern.path ?? [];
        if (!path.length) return 0;
        const head = t % path.length;
        const tail1 = (head - 1 + path.length) % path.length;
        const tail2 = (head - 2 + path.length) % path.length;
        const idx = path.indexOf(index);
        if (idx === head) return 1;
        if (idx === tail1) return 0.6;
        if (idx === tail2) return 0.3;
        return 0;
      }

      case "rowScan": {
        const row = pattern.row ?? 0;
        const r = Math.floor(index / GRID_SIZE);
        if (r !== row) return 0;
        const offset = (t / 8) % GRID_SIZE;
        const activeCol = Math.floor(offset);
        const c = index % GRID_SIZE;
        if (c === activeCol) return 1;
        if (Math.abs(c - activeCol) === 1) return 0.4;
        return 0.15;
      }

      case "colScan": {
        const col = pattern.col ?? 0;
        const c = index % GRID_SIZE;
        if (c !== col) return 0;
        const offset = (t / 8) % GRID_SIZE;
        const activeRow = Math.floor(offset);
        const r = Math.floor(index / GRID_SIZE);
        if (r === activeRow) return 1;
        if (Math.abs(r - activeRow) === 1) return 0.4;
        return 0.15;
      }

      case "breath": {
        const mask = pattern.mask ?? [];
        if (!isIn(index, mask)) return 0;
        const cycle = Math.sin((t / 60) * Math.PI * 2); // -1..1
        return 0.3 + 0.7 * ((cycle + 1) / 2); // 0.3..1
      }

      case "pulse": {
        const mask = pattern.mask ?? [];
        if (!isIn(index, mask)) return 0;
        const segment = Math.floor((t / 20) % 4);
        const strong = segment === 0 || segment === 2;
        return strong ? 1 : 0.3;
      }

      case "corners": {
        const corners = pattern.corners ?? [0, 5, 30, 35];
        const period = 40;
        const local = t % period;
        if (pattern.syncCorners) {
          // all corners pulsing together
          if (!corners.includes(index)) return 0;
          const cycle = Math.sin((local / period) * Math.PI * 2);
          return 0.4 + 0.6 * ((cycle + 1) / 2);
        }
        // one corner at a time
        const cornerIndex = Math.floor((local / period) * corners.length);
        return index === corners[cornerIndex] ? 1 : 0;
      }

      default:
        return 0;
    }
  };

  return (
    <motion.div
      className="w-6 h-6 flex items-center justify-center"
      animate={{ scale: [1, 1.04, 1] }}
      transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
    >
      <div
        className="grid grid-cols-6 grid-rows-6"
        style={{ width: 24, height: 24 }}
      >
        {Array.from({ length: CELL_COUNT }).map((_, i) => {
          const opacity = intensityFor(i);
          return (
            <div
              key={i}
              style={{
                width: 4,
                height: 4,
                backgroundColor: color,
                opacity,
                transition: "opacity 120ms ease-out",
              }}
            />
          );
        })}
      </div>
    </motion.div>
  );
}

export default function AgenticLoader() {
  const pattern = STAGE_CONFIG[0];
  return (
    <div className="flex flex-col items-center gap-3 text-slate-100">
      <PixelStageIcon stageKey={0} />
      <p className="text-[11px] text-slate-400">{pattern.label}</p>
    </div>
  );
}

