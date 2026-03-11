"use client";

import { useState } from "react";
import { AGENT_STEPS, PixelIcon, generateSnippet, type AgentAnim } from "./AgenticLoader";
import ControlPanel, { Controls, DEFAULT_CONTROLS } from "./ControlPanel";

const monoFont = "var(--font-jetbrains-mono), 'JetBrains Mono', monospace";

function AnimCard({ step, controls }: { step: AgentAnim; controls: Controls }) {
  const [hovered, setHovered] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");

  const handleCopy = async () => {
    if (copyState === "copied") return;
    const snippet = generateSnippet(step, controls);
    await navigator.clipboard.writeText(snippet);
    setCopyState("copied");
    setTimeout(() => setCopyState("idle"), 1800);
  };

  const isCopied = copyState === "copied";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleCopy}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        cursor: isCopied ? "default" : "pointer",
      }}
    >
      {/* Animation — subtle ring on hover */}
      <div style={{
        borderRadius: 6,
        padding: 8,
        outline: hovered && !isCopied ? "1px solid #2a2a2a" : "1px solid transparent",
        transition: "outline-color 180ms ease",
      }}>
        <PixelIcon stepId={step.id} controls={controls} />
      </div>

      {/* Label / copy — crossfade in same slot */}
      <div style={{ position: "relative", height: 18, width: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>

        {/* Label */}
        <span style={{
          fontFamily: monoFont,
          fontSize: 9,
          fontWeight: 400,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#cfcfcf",
          whiteSpace: "nowrap",
          position: "absolute",
          opacity: hovered ? 0 : 1,
          transform: hovered ? "translateY(-3px)" : "translateY(0)",
          transition: "opacity 180ms ease, transform 180ms ease",
          pointerEvents: "none",
        }}>
          {step.label}
        </span>

        {/* Copy state */}
        <span style={{
          fontFamily: monoFont,
          fontSize: 8,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          display: "flex",
          alignItems: "center",
          gap: 4,
          whiteSpace: "nowrap",
          position: "absolute",
          color: isCopied ? "#6ee7b7" : "#888",
          opacity: hovered ? 1 : 0,
          transform: hovered ? "translateY(0)" : "translateY(3px)",
          transition: "opacity 180ms ease, transform 180ms ease, color 150ms",
          pointerEvents: "none",
        }}>
          {isCopied ? (
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
        </span>
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
          gap: "64px 48px",
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
