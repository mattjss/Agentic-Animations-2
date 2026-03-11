"use client";

// 4x4 grid of agentic pixel animations with labels under each.

import { STAGE_CONFIG, PixelStageIcon } from "./AgenticLoader";

export default function AgenticLoaderGallery() {
  const items = STAGE_CONFIG.slice(0, 16); // 4 x 4 grid

  return (
    <div className="flex flex-col items-center gap-10 text-slate-100">
      <div className="grid grid-cols-4 gap-12">
        {items.map((pattern, index) => (
          <div
            key={pattern.id}
            className="flex flex-col items-center text-center"
          >
            <PixelStageIcon stageKey={index} color="#ffffff" />
            <p className="mt-2 text-[10px] tracking-[0.18em] uppercase text-slate-400 max-w-[120px] leading-snug">
              {pattern.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

