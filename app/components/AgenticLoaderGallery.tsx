"use client";

import { useState } from "react";
import { AGENT_STEPS, PixelIcon, generateSnippet, type AgentAnim } from "./AgenticLoader";
import ControlPanel, { Controls, DEFAULT_CONTROLS } from "./ControlPanel";

const monoFont = "var(--font-jetbrains-mono), 'JetBrains Mono', monospace";

function AnimCard({ step, controls }: { step: AgentAnim; controls: Controls }) {
  const [hovered, setHovered] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");

  const handleCopy = async () => {
    const snippet = generateSnippet(step, controls);
    await navigator.clipboard.writeText(snippet);
    setCopyState("copied");
    setTimeout(() => setCopyState("idle"), 1800);
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
      }}
    >
      <PixelIcon stepId={step.id} controls={controls} />

      {/* Name — always centered, never shifts */}
      <span
        style={{
          fontFamily: monoFont,
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

      {/* Copy CTA — fixed height slot so layout never jumps */}
      <div style={{ height: 18 }}>
        <button
          onClick={handleCopy}
          style={{
            fontFamily: monoFont,
            fontSize: 8,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            gap: 4,
            background: "none",
            border: "1px solid",
            borderColor: copyState === "copied" ? "#6ee7b7" : "#2a2a2a",
            borderRadius: 3,
            padding: "3px 7px",
            cursor: "pointer",
            color: copyState === "copied" ? "#6ee7b7" : "#444",
            opacity: hovered ? 1 : 0,
            transition: "opacity 150ms, color 150ms, border-color 150ms",
            whiteSpace: "nowrap",
          }}
        >
          {copyState === "copied" ? (
            <>
              <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              copied
            </>
          ) : (
            <>
              <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                <rect x="4" y="4" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M3 8H2a1 1 0 01-1-1V2a1 1 0 011-1h5a1 1 0 011 1v1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              copy
            </>
          )}
        </button>
      </div>
    </div>
  );
}

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
          <AnimCard key={step.id} step={step} controls={controls} />
        ))}
      </div>

      <ControlPanel controls={controls} onChange={setControls} />
    </>
  );
}
