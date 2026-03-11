"use client";

import { useState } from "react";
import { AGENT_STEPS, PixelIcon } from "./AgenticLoader";
import ControlPanel, { Controls, DEFAULT_CONTROLS } from "./ControlPanel";

export default function AgenticLoaderGallery() {
  const [controls, setControls] = useState<Controls>(DEFAULT_CONTROLS);

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "52px 44px",
        }}
      >
        {AGENT_STEPS.map((step) => (
          <div
            key={step.id}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
            }}
          >
            <PixelIcon stepId={step.id} controls={controls} />
            <span
              style={{
                fontFamily: "var(--font-jetbrains-mono), 'JetBrains Mono', monospace",
                fontSize: 9,
                fontWeight: 400,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#cfcfcf",
                whiteSpace: "nowrap",
              }}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>

      <ControlPanel controls={controls} onChange={setControls} />
    </>
  );
}
