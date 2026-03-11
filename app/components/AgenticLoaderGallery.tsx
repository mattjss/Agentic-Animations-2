"use client";

import { AGENT_STEPS, PixelIcon } from "./AgenticLoader";

export default function AgenticLoaderGallery() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "36px 44px",
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
          <PixelIcon stepId={step.id} />
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
  );
}
