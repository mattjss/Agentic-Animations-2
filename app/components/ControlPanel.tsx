"use client";

import { Dialog } from "@base-ui/react/dialog";
import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
export type ColorMode = "solid" | "gradient";

export type Controls = {
  color: string;
  colorMode: ColorMode;
  speed: number;
  glow: number;
  opacity: number;
  cellSize: number;
};

export const DEFAULT_CONTROLS: Controls = {
  color: "#ffffff",
  colorMode: "solid",
  speed: 1,
  glow: 0,
  opacity: 1,
  cellSize: 8,
};

// ─── Color palettes (16 each) — hex from Tailwind default palette ─────────────
// Basic: neutrals + full hue ring at 500 (balanced on UI)
const BASIC_COLORS = [
  { label: "Stone 50",   value: "#fafaf9" },
  { label: "Stone 900",  value: "#1c1917" },
  { label: "Zinc 500",   value: "#71717b" },
  { label: "Red 500",    value: "#ef4444" },
  { label: "Orange 500", value: "#f97316" },
  { label: "Amber 500",  value: "#f59e0b" },
  { label: "Yellow 500", value: "#eab308" },
  { label: "Lime 500",   value: "#84cc16" },
  { label: "Green 500",  value: "#22c55e" },
  { label: "Emerald 500",value: "#10b981" },
  { label: "Teal 500",   value: "#14b8a6" },
  { label: "Cyan 500",   value: "#06b6d4" },
  { label: "Sky 500",    value: "#0ea5e9" },
  { label: "Blue 500",   value: "#3b82f6" },
  { label: "Indigo 500", value: "#6366f1" },
  { label: "Purple 500", value: "#a855f7" },
];

// Neon: high-chroma / full-gamut picks (not Tailwind pastels) — reads electric on #000
const NEON_COLORS = [
  { label: "Tube White",  value: "#bfffef" },
  { label: "Voltage",     value: "#fcff33" },
  { label: "Acid",        value: "#c4ff00" },
  { label: "Gamma",       value: "#39ff14" },
  { label: "Toxic",       value: "#00ff66" },
  { label: "Aqua",        value: "#00ffc6" },
  { label: "Plasma",      value: "#00f5ff" },
  { label: "Arc",         value: "#00b8ff" },
  { label: "Cobalt",      value: "#0077ff" },
  { label: "Ultraviolet", value: "#6b21ff" },
  { label: "Violet",      value: "#a600ff" },
  { label: "Synth",       value: "#e000ff" },
  { label: "Magenta",     value: "#ff00e5" },
  { label: "Hot Pink",    value: "#ff1493" },
  { label: "Laser Red",   value: "#ff003c" },
  { label: "Blaze",      value: "#ff5a00" },
];

const basic = (i: number) => BASIC_COLORS[i].value;
const neon = (i: number) => NEON_COLORS[i].value;

function gradPreset(
  label: string,
  a: { kind: "basic" | "neon"; i: number },
  b: { kind: "basic" | "neon"; i: number },
): { label: string; s1: string; s2: string; value: string } {
  const s1 = a.kind === "basic" ? basic(a.i) : neon(a.i);
  const s2 = b.kind === "basic" ? basic(b.i) : neon(b.i);
  return {
    label,
    s1,
    s2,
    value: `linear-gradient(135deg, ${s1}, ${s2})`,
  };
}

const CELL_OPTIONS = [
  { label: "XS", sub: "12×12", value: 4  },
  { label: "S",  sub: "18×18", value: 6  },
  { label: "M",  sub: "24×24", value: 8  },
  { label: "L",  sub: "30×30", value: 10 },
  { label: "XL", sub: "36×36", value: 12 },
];

// Gradients: 16 presets — every stop is from Basic or Neon above; pairs tuned for smooth 135° blends
const GRADIENTS = [
  gradPreset("Pulse",       { kind: "basic", i: 3 }, { kind: "neon", i: 6 }),   // Red → Plasma cyan
  gradPreset("Arcade",      { kind: "neon", i: 3 }, { kind: "basic", i: 14 }), // Gamma → Indigo
  gradPreset("Veil",        { kind: "basic", i: 0 }, { kind: "basic", i: 15 }), // Stone 50 → Purple
  gradPreset("Jewel",       { kind: "neon", i: 12 }, { kind: "basic", i: 9 }),  // Magenta → Emerald
  gradPreset("Marina",      { kind: "basic", i: 4 }, { kind: "neon", i: 8 }),   // Orange → Cobalt
  gradPreset("Strobe",      { kind: "neon", i: 1 }, { kind: "basic", i: 1 }),    // Voltage → Stone 900
  gradPreset("South Beach", { kind: "basic", i: 10 }, { kind: "neon", i: 13 }), // Teal → Hot pink
  gradPreset("Nebula",      { kind: "neon", i: 9 }, { kind: "basic", i: 5 }),     // UV → Amber
  gradPreset("Contrast",    { kind: "basic", i: 11 }, { kind: "basic", i: 4 }),  // Cyan → Orange
  gradPreset("Horizon",     { kind: "neon", i: 15 }, { kind: "basic", i: 12 }),  // Blaze → Sky
  gradPreset("Synthwave",   { kind: "basic", i: 7 }, { kind: "neon", i: 11 }),   // Lime → Synth
  gradPreset("Alert",       { kind: "neon", i: 5 }, { kind: "basic", i: 3 }),    // Aqua → Red
  gradPreset("Classic",     { kind: "basic", i: 6 }, { kind: "basic", i: 13 }),  // Yellow → Blue
  gradPreset("Toxic Royal", { kind: "neon", i: 2 }, { kind: "basic", i: 15 }),   // Acid → Purple
  gradPreset("Stratos",     { kind: "basic", i: 12 }, { kind: "neon", i: 14 }),  // Sky → Laser red
  gradPreset("Comet",       { kind: "basic", i: 14 }, { kind: "neon", i: 0 }),   // Indigo → Tube white
];

/** Fixed gradient angle (matches preset swatches). */
const GRAD_ANGLE = "135deg";

// ─── Shared styles ────────────────────────────────────────────────────────────
const monoFont = "var(--font-jetbrains-mono), 'JetBrains Mono', monospace";

const labelStyle: React.CSSProperties = {
  fontFamily: monoFont,
  fontSize: 9,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "#888",
  display: "block",
};

function Divider() {
  return <div style={{ height: 1, backgroundColor: "#2a2a2a", margin: "14px 0" }} />;
}

const SLIDER_THUMB_W = 32;
const SLIDER_THUMB_H = 18;
const SLIDER_THUMB_R = SLIDER_THUMB_W / 2;

// ─── Slider ───────────────────────────────────────────────────────────────────
function SliderRow({ label, value, min, max, step, display, onChange }: {
  label: string; value: number; min: number; max: number;
  step: number; display: string; onChange: (v: number) => void;
}) {
  const t = (value - min) / (max - min);
  const fillToCenter = `calc(${SLIDER_THUMB_R}px + (100% - ${SLIDER_THUMB_W}px) * ${t})`;

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={labelStyle}>{label}</span>
        <span style={{
          fontFamily: monoFont, fontSize: 9, letterSpacing: "0.08em",
          color: "#aaa", backgroundColor: "#1a1a1a",
          border: "1px solid #333", borderRadius: 3,
          padding: "2px 6px", lineHeight: 1.4,
        }}>{display}</span>
      </div>
      {/* Rail: thumb travels [0, W−thumbW] so nothing clips at panel margins */}
      <div
        className="cp-slider-track"
        style={{
          position: "relative",
          width: "100%",
          height: 22,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "50%",
            height: 4,
            marginTop: -2,
            backgroundColor: "#222",
            borderRadius: 2,
            border: "1px solid #2e2e2e",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: "50%",
            marginTop: -2,
            width: fillToCenter,
            maxWidth: "100%",
            height: 4,
            backgroundColor: "#fff",
            borderRadius: 2,
            transition: "width 0ms",
          }}
        />
        <input
          type="range"
          min={min} max={max} step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="cp-slider-input"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
            opacity: 0,
            cursor: "pointer",
            margin: 0,
            padding: 0,
            WebkitAppearance: "none" as const,
            appearance: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: `calc((100% - ${SLIDER_THUMB_W}px) * ${t})`,
            top: "50%",
            width: SLIDER_THUMB_W,
            height: SLIDER_THUMB_H,
            marginTop: -(SLIDER_THUMB_H / 2),
            backgroundColor: "#1a1a1a",
            border: "1px solid #3d3d3d",
            borderRadius: 9,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            transition: "left 0ms",
            boxShadow: "0 1px 4px rgba(0,0,0,0.6)",
          }}
        >
          <div style={{ width: 16, height: 2, backgroundColor: "#555", borderRadius: 1 }} />
        </div>
      </div>
    </div>
  );
}

function ChevronSection({ expanded }: { expanded: boolean }) {
  return (
    <svg className={`cp-section-chevron${expanded ? " is-open" : ""}`} viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CollapseSection({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="cp-section">
      <button type="button" className="cp-section-head" onClick={onToggle} aria-expanded={expanded}>
        <span>{title}</span>
        <ChevronSection expanded={expanded} />
      </button>
      <div className={`cp-section-body${expanded ? " is-open" : ""}`} aria-hidden={!expanded}>
        <div className="cp-section-inner">
          <div className="cp-section-inner-pad">{children}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Swatch grid ──────────────────────────────────────────────────────────────
function SwatchGrid({ swatches, active, onSelect }: {
  swatches: { label: string; value: string }[];
  active: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div className="cp-swatch-grid" style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 4, marginBottom: 8 }}>
      {swatches.map((s) => (
        <button key={s.value} className="cp-swatch" onClick={() => onSelect(s.value)} title={s.label}
          style={{
            width: "100%", aspectRatio: "1", borderRadius: "50%",
            background: s.value,
            border: active === s.value ? "2px solid #fff" : "2px solid transparent",
            cursor: "pointer", padding: 0, outline: "none",
          }}
        />
      ))}
    </div>
  );
}

// ─── Tab button ───────────────────────────────────────────────────────────────
function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button className="cp-tab-btn" onClick={onClick}
      style={{
        fontFamily: monoFont, fontSize: 8, letterSpacing: "0.1em", textTransform: "uppercase",
        padding: "3px 9px", borderRadius: 3, border: "none",
        backgroundColor: active ? "#1e1e1e" : "transparent",
        color: active ? "#ffffff" : "#888",
        cursor: "pointer", transition: "all 100ms",
      }}
    >{children}</button>
  );
}

// ─── Compact color + hex row ──────────────────────────────────────────────────
function PickerRow({ value, hex, onPicker, onHex, onBlur }: {
  value: string; hex: string;
  onPicker: (v: string) => void;
  onHex: (v: string) => void;
  onBlur: () => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
      <input type="color" className="cp-picker-color" value={value} onChange={(e) => onPicker(e.target.value)}
        style={{ width: 24, height: 24, border: "1px solid #3d3d3d", borderRadius: 3, backgroundColor: "transparent", cursor: "pointer", padding: 1, flexShrink: 0 }}
      />
      <input type="text" className="cp-picker-hex" value={hex} onChange={(e) => onHex(e.target.value)} onBlur={onBlur} placeholder="#ffffff"
        style={{ fontFamily: monoFont, fontSize: 10, letterSpacing: "0.06em", backgroundColor: "#111", border: "1px solid #3d3d3d", borderRadius: 3, color: "#aaa", padding: "3px 7px", width: "100%", outline: "none" }}
      />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ControlPanel({ controls, onChange }: {
  controls: Controls;
  onChange: (c: Controls) => void;
}) {
  const [colorTab, setColorTab] = useState<"basic" | "neon" | "gradient">("basic");
  const [hexInput, setHexInput] = useState(controls.color);
  const [gradStop1, setGradStop1] = useState("#00f5ff");
  const [gradStop2, setGradStop2] = useState("#bf00ff");
  const [hex1, setHex1] = useState("#00f5ff");
  const [hex2, setHex2] = useState("#bf00ff");

  const [minimized, setMinimized] = useState(false);
  const [openColor, setOpenColor] = useState(true);
  const [openMotion, setOpenMotion] = useState(false);
  const [openSize, setOpenSize] = useState(false);

  const buildGrad = (s1: string, s2: string, dir: string) =>
    `linear-gradient(${dir}, ${s1}, ${s2})`;

  const applyGrad = (s1: string, s2: string, dir: string) =>
    onChange({ ...controls, color: buildGrad(s1, s2, dir), colorMode: "gradient" });

  const set = <K extends keyof Controls>(key: K, val: Controls[K]) =>
    onChange({ ...controls, [key]: val });

  const setSolid = (v: string) => {
    setHexInput(v);
    onChange({ ...controls, color: v, colorMode: "solid" });
  };

  const cellLabel = CELL_OPTIONS.find((o) => o.value === controls.cellSize)?.label ?? "M";
  const colorSummary =
    controls.colorMode === "gradient" ? "Grad" : colorTab === "neon" ? "Neon" : "Basic";

  return (
    <Dialog.Root>
      <Dialog.Trigger
        className="cp-trigger"
        style={{
          position: "fixed", bottom: 24, right: 16,
          fontFamily: monoFont, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase",
          padding: "10px 22px", backgroundColor: "#ffffff", color: "#000000",
          border: "none", borderRadius: 6, cursor: "pointer", zIndex: 50,
          boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
        }}
      >
        Controls
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Popup
          className="cp-panel cp-popup"
          style={{
            position: "fixed", bottom: 72, right: 16,
            width: 288,
            backgroundColor: "#080808",
            border: "1px solid #2e2e2e",
            borderRadius: 12,
            zIndex: 101,
            padding: "18px 18px 16px",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 24px 64px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: minimized ? 0 : 10 }}>
            <span style={{ fontFamily: monoFont, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#ffffff" }}>
              Controls
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
              {!minimized && (
                <button
                  type="button"
                  className="cp-minimize-btn"
                  aria-label="Minimize panel"
                  onClick={() => setMinimized(true)}
                  style={{ width: 36, height: 36 }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                    <path d="M2 5h10M2 9h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                </button>
              )}
              {minimized && (
                <button
                  type="button"
                  className="cp-minimize-btn"
                  aria-label="Expand panel"
                  onClick={() => setMinimized(false)}
                  style={{ width: 36, height: 36 }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                    <path d="M7 10V4M4 7l3-3 3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
              <Dialog.Close className="cp-close" style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 3, fontFamily: monoFont }}>
                ✕
              </Dialog.Close>
            </div>
          </div>

          {minimized ? (
            <button type="button" className="cp-expand-strip" onClick={() => setMinimized(false)}>
              <span className="cp-color-dot" style={{ background: controls.color }} />
              <span style={{ color: "#aaa" }}>
                {`${controls.speed.toFixed(2)}× · ${cellLabel} · ${colorSummary}`}
              </span>
              <span style={{ marginLeft: "auto", color: "#666" }}>Expand</span>
            </button>
          ) : (
            <div className="cp-panel-body">
              <CollapseSection title="Color" expanded={openColor} onToggle={() => setOpenColor((v) => !v)}>
                <div style={{ marginBottom: 4 }}>
                  <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ display: "flex", gap: 1 }}>
                      <TabBtn active={colorTab === "basic"} onClick={() => setColorTab("basic")}>Basic</TabBtn>
                      <TabBtn active={colorTab === "neon"} onClick={() => setColorTab("neon")}>Neon</TabBtn>
                      <TabBtn active={colorTab === "gradient"} onClick={() => setColorTab("gradient")}>Grad</TabBtn>
                    </div>
                  </div>

                  {colorTab !== "gradient" && (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <SwatchGrid
                        swatches={colorTab === "basic" ? BASIC_COLORS : NEON_COLORS}
                        active={controls.color}
                        onSelect={(v) => setSolid(v)}
                      />
                      <PickerRow
                        value={controls.colorMode === "solid" ? controls.color : "#ffffff"}
                        hex={hexInput}
                        onPicker={(v) => setSolid(v)}
                        onHex={(v) => { setHexInput(v); if (/^#[0-9a-fA-F]{6}$/.test(v)) setSolid(v); }}
                        onBlur={() => setHexInput(controls.colorMode === "solid" ? controls.color : "#ffffff")}
                      />
                    </div>
                  )}

                  {colorTab === "gradient" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <div className="cp-grad-grid" style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 4 }}>
                        {GRADIENTS.map((g) => (
                          <button key={g.value} onClick={() => {
                            setGradStop1(g.s1); setHex1(g.s1);
                            setGradStop2(g.s2); setHex2(g.s2);
                            applyGrad(g.s1, g.s2, GRAD_ANGLE);
                          }}
                            title={g.label}
                            style={{
                              width: "100%", aspectRatio: "1", borderRadius: 3,
                              background: g.value,
                              border: controls.color === g.value ? "2px solid #fff" : "2px solid transparent",
                              cursor: "pointer", padding: 0, outline: "none",
                            }}
                          />
                        ))}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <div>
                          <PickerRow value={gradStop1} hex={hex1}
                            onPicker={(v) => { setGradStop1(v); setHex1(v); applyGrad(v, gradStop2, GRAD_ANGLE); }}
                            onHex={(v) => { setHex1(v); if (/^#[0-9a-fA-F]{6}$/.test(v)) { setGradStop1(v); applyGrad(v, gradStop2, GRAD_ANGLE); } }}
                            onBlur={() => setHex1(gradStop1)}
                          />
                        </div>
                        <div>
                          <PickerRow value={gradStop2} hex={hex2}
                            onPicker={(v) => { setGradStop2(v); setHex2(v); applyGrad(gradStop1, v, GRAD_ANGLE); }}
                            onHex={(v) => { setHex2(v); if (/^#[0-9a-fA-F]{6}$/.test(v)) { setGradStop2(v); applyGrad(gradStop1, v, GRAD_ANGLE); } }}
                            onBlur={() => setHex2(gradStop2)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CollapseSection>

              <CollapseSection title="Motion" expanded={openMotion} onToggle={() => setOpenMotion((v) => !v)}>
                <SliderRow label="Speed" value={controls.speed} min={0.25} max={3} step={0.05}
                  display={`${controls.speed.toFixed(2)}×`} onChange={(v) => set("speed", v)} />
                <SliderRow label="Glow" value={controls.glow} min={0} max={3} step={0.1}
                  display={controls.glow === 0 ? "off" : `${controls.glow}px`} onChange={(v) => set("glow", v)} />
                <SliderRow label="Opacity" value={controls.opacity} min={0.5} max={1} step={0.1}
                  display={`${Math.round(controls.opacity * 100)}%`} onChange={(v) => set("opacity", v)} />
              </CollapseSection>

              <CollapseSection title="Cell size" expanded={openSize} onToggle={() => setOpenSize((v) => !v)}>
                <div style={{ display: "flex", gap: 5, marginBottom: 4 }}>
                  {CELL_OPTIONS.map((opt) => (
                    <button key={opt.value} className="cp-cell-btn" onClick={() => set("cellSize", opt.value)}
                      style={{
                        fontFamily: monoFont, flex: 1,
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                        padding: "5px 0", borderRadius: 4, border: "1px solid",
                        borderColor: controls.cellSize === opt.value ? "#ffffff" : "#3d3d3d",
                        backgroundColor: controls.cellSize === opt.value ? "#1e1e1e" : "transparent",
                        cursor: "pointer", transition: "all 100ms",
                      }}
                    >
                      <span style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: controls.cellSize === opt.value ? "#ffffff" : "#888" }}>
                        {opt.label}
                      </span>
                      <span style={{ fontSize: 7, letterSpacing: "0.04em", color: controls.cellSize === opt.value ? "#aaa" : "#555" }}>
                        {opt.sub}
                      </span>
                    </button>
                  ))}
                </div>
              </CollapseSection>

              <Divider />

          {/* ── Reset ── */}
          <button className="cp-reset"
            onClick={() => {
              setHexInput(DEFAULT_CONTROLS.color);
              setColorTab("basic");
              setGradStop1("#00f5ff"); setHex1("#00f5ff");
              setGradStop2("#bf00ff"); setHex2("#bf00ff");
              onChange(DEFAULT_CONTROLS);
            }}
            style={{
              fontFamily: monoFont, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase",
              padding: "7px 0", backgroundColor: "transparent", border: "1px solid #3d3d3d",
              borderRadius: 4, color: "#888", cursor: "pointer", width: "100%",
            }}
          >
            Reset
          </button>
            </div>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
