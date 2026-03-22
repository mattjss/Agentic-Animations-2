"use client";

import { useState, useEffect } from "react";
import { AGENT_STEPS, PixelIcon, generateSnippet, type AgentAnim } from "./AgenticLoader";
import ControlPanel, { Controls, DEFAULT_CONTROLS } from "./ControlPanel";

const monoFont = "var(--font-jetbrains-mono), 'JetBrains Mono', monospace";
const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function scramble(str: string): string {
  return str
    .split("")
    .map((c) =>
      c === " " || c === "-" ? c : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
    )
    .join("");
}

function AnimCard({ step, controls }: { step: AgentAnim; controls: Controls }) {
  const [hovered, setHovered] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const [scrambledText, setScrambledText] = useState(step.label);
  const [showDownload, setShowDownload] = useState(false);

  useEffect(() => {
    if (!hovered) {
      setScrambledText(step.label);
      setShowDownload(false);
      return;
    }
    const scrambleId = setInterval(() => setScrambledText(() => scramble(step.label)), 40);
    const downloadId = setTimeout(() => setShowDownload(true), 140);
    return () => {
      clearInterval(scrambleId);
      clearTimeout(downloadId);
    };
  }, [hovered, step.label]);

  const handleDownload = () => {
    if (copyState === "copied") return;
    const snippet = generateSnippet(step, controls);
    const doc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${step.label} Loader</title>
</head>
<body style="margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#000;">
${snippet}
</body>
</html>`;
    const blob = new Blob([doc], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${step.id}-loader.html`;
    a.click();
    URL.revokeObjectURL(url);
    setCopyState("copied");
    setTimeout(() => setCopyState("idle"), 1800);
  };

  const isCopied = copyState === "copied";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleDownload}
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

        {/* Label — scrambles on hover, then fades out */}
        <span style={{
          fontFamily: monoFont,
          fontSize: 9,
          fontWeight: 400,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#cfcfcf",
          whiteSpace: "nowrap",
          position: "absolute",
          opacity: showDownload ? 0 : 1,
          transform: showDownload ? "translateY(-3px)" : "translateY(0)",
          transition: "opacity 180ms ease, transform 180ms ease",
          pointerEvents: "none",
        }}>
          {hovered ? scrambledText : step.label}
        </span>

        {/* Download state — fades in after scramble */}
        <span style={{
          fontFamily: monoFont,
          fontSize: 9,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          display: "flex",
          alignItems: "center",
          gap: 4,
          whiteSpace: "nowrap",
          position: "absolute",
          color: isCopied ? "#6ee7b7" : "#888",
          opacity: showDownload ? 1 : 0,
          transform: showDownload ? "translateY(0)" : "translateY(3px)",
          transition: "opacity 180ms ease, transform 180ms ease, color 150ms",
          pointerEvents: "none",
        }}>
          {isCopied ? (
            <>
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              downloaded
            </>
          ) : (
            <>
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M6 2v5M4 6l2 2 2-2M2 9h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              download
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
        className="gallery-grid"
        style={{
          display: "grid",
          gap: "36px",
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
