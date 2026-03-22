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

// ─── Color palettes ───────────────────────────────────────────────────────────
const BASIC_COLORS = [
  { label: "White",   value: "#ffffff" },
  { label: "Silver",  value: "#a0a0a0" },
  { label: "Slate",   value: "#64748b" },
  { label: "Charcoal",value: "#374151" },
  { label: "Red",     value: "#ef4444" },
  { label: "Orange",  value: "#f97316" },
  { label: "Amber",   value: "#f59e0b" },
  { label: "Yellow",  value: "#eab308" },
  { label: "Lime",    value: "#84cc16" },
  { label: "Green",   value: "#22c55e" },
  { label: "Teal",    value: "#14b8a6" },
  { label: "Cyan",    value: "#06b6d4" },
  { label: "Blue",    value: "#3b82f6" },
  { label: "Indigo",  value: "#6366f1" },
  { label: "Purple",  value: "#a855f7" },
  { label: "Pink",    value: "#ec4899" },
];

const NEON_COLORS = [
  { label: "Neon White",  value: "#f0f0ff" },
  { label: "Neon Cyan",   value: "#00f5ff" },
  { label: "Neon Green",  value: "#39ff14" },
  { label: "Neon Lime",   value: "#ccff00" },
  { label: "Neon Yellow", value: "#fff01f" },
  { label: "Neon Orange", value: "#ff6600" },
  { label: "Neon Pink",   value: "#ff2d78" },
  { label: "Neon Red",    value: "#ff1111" },
  { label: "Neon Teal",   value: "#08e8de" },
  { label: "Neon Mint",   value: "#00ffb3" },
  { label: "Neon Purple", value: "#bf00ff" },
  { label: "Neon Violet", value: "#7b00ff" },
  { label: "Neon Blue",   value: "#0080ff" },
  { label: "Neon Sky",    value: "#00bfff" },
  { label: "Neon Rose",   value: "#ff007f" },
  { label: "Neon Coral",  value: "#ff4040" },
];

const CELL_OPTIONS = [
  { label: "XS", sub: "12×12", value: 4  },
  { label: "S",  sub: "18×18", value: 6  },
  { label: "M",  sub: "24×24", value: 8  },
  { label: "L",  sub: "30×30", value: 10 },
  { label: "XL", sub: "36×36", value: 12 },
];

const GRADIENTS = [
  { label: "Aurora",  s1: "#00f5ff", s2: "#bf00ff", value: "linear-gradient(135deg, #00f5ff, #bf00ff)" },
  { label: "Sunset",  s1: "#ff6600", s2: "#ff2d78", value: "linear-gradient(135deg, #ff6600, #ff2d78)" },
  { label: "Emerald", s1: "#39ff14", s2: "#00f5ff", value: "linear-gradient(135deg, #39ff14, #00f5ff)" },
  { label: "Gold",    s1: "#fff01f", s2: "#f97316", value: "linear-gradient(135deg, #fff01f, #f97316)" },
  { label: "Candy",   s1: "#ff2d78", s2: "#a855f7", value: "linear-gradient(135deg, #ff2d78, #a855f7)" },
  { label: "Ocean",   s1: "#3b82f6", s2: "#08e8de", value: "linear-gradient(135deg, #3b82f6, #08e8de)" },
  { label: "Inferno", s1: "#ef4444", s2: "#fff01f", value: "linear-gradient(135deg, #ef4444, #fff01f)" },
  { label: "Void",    s1: "#a855f7", s2: "#1b03a3", value: "linear-gradient(135deg, #a855f7, #1b03a3)" },
  { label: "Glacier", s1: "#e0f2fe", s2: "#3b82f6", value: "linear-gradient(135deg, #e0f2fe, #3b82f6)" },
  { label: "Toxic",   s1: "#ccff00", s2: "#39ff14", value: "linear-gradient(135deg, #ccff00, #39ff14)" },
  { label: "Blaze",   s1: "#ff1111", s2: "#ff6600", value: "linear-gradient(135deg, #ff1111, #ff6600)" },
  { label: "Nebula",  s1: "#bf00ff", s2: "#ff2d78", value: "linear-gradient(135deg, #bf00ff, #ff2d78)" },
  { label: "Mint",    s1: "#00ffb3", s2: "#06b6d4", value: "linear-gradient(135deg, #00ffb3, #06b6d4)" },
  { label: "Dusk",    s1: "#6366f1", s2: "#ec4899", value: "linear-gradient(135deg, #6366f1, #ec4899)" },
  { label: "Matrix",  s1: "#39ff14", s2: "#14b8a6", value: "linear-gradient(135deg, #39ff14, #14b8a6)" },
  { label: "Solar",   s1: "#fff01f", s2: "#bf00ff", value: "linear-gradient(135deg, #fff01f, #bf00ff)" },
];

const GRAD_DIRECTIONS = [
  { label: "↑", deg: "0deg"   },
  { label: "↗", deg: "45deg"  },
  { label: "→", deg: "90deg"  },
  { label: "↘", deg: "135deg" },
  { label: "↓", deg: "180deg" },
  { label: "↙", deg: "225deg" },
  { label: "←", deg: "270deg" },
  { label: "↖", deg: "315deg" },
];

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

// ─── Slider ───────────────────────────────────────────────────────────────────
function SliderRow({ label, value, min, max, step, display, onChange }: {
  label: string; value: number; min: number; max: number;
  step: number; display: string; onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;

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
      {/* Custom track */}
      <div style={{ position: "relative", height: 20, display: "flex", alignItems: "center" }}>
        {/* Background track */}
        <div style={{
          position: "absolute", left: 0, right: 0, height: 3,
          backgroundColor: "#222", borderRadius: 2,
          border: "1px solid #2e2e2e",
        }} />
        {/* Filled portion */}
        <div style={{
          position: "absolute", left: 0, width: `${pct}%`, height: 3,
          backgroundColor: "#fff", borderRadius: 2,
          transition: "width 0ms",
        }} />
        {/* Native range input — invisible but interactive */}
        <input
          type="range"
          min={min} max={max} step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            opacity: 0, cursor: "pointer", margin: 0, padding: 0,
          }}
        />
        {/* Thumb — positioned via pct, non-interactive (input handles it) */}
        <div style={{
          position: "absolute",
          left: `calc(${pct}% - 14px)`,
          width: 28, height: 16,
          backgroundColor: "#1a1a1a",
          border: "1px solid #3d3d3d",
          borderRadius: 8,
          display: "flex", alignItems: "center", justifyContent: "center",
          pointerEvents: "none",
          transition: "left 0ms",
          boxShadow: "0 1px 4px rgba(0,0,0,0.6)",
        }}>
          <div style={{ width: 14, height: 2, backgroundColor: "#555", borderRadius: 1 }} />
        </div>
      </div>
    </div>
  );
}

// ─── Segment buttons ──────────────────────────────────────────────────────────
function SegmentRow({ label, options, value, onChange }: {
  label: string;
  options: { label: string; value: string | number }[];
  value: string | number;
  onChange: (v: string | number) => void;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <span style={{ ...labelStyle, marginBottom: 8, display: "block" }}>{label}</span>
      <div style={{ display: "flex", gap: 5 }}>
        {options.map((opt) => (
          <button key={String(opt.value)} onClick={() => onChange(opt.value)}
            style={{
              fontFamily: monoFont, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase",
              padding: "4px 10px", borderRadius: 4, border: "1px solid",
              borderColor: value === opt.value ? "#ffffff" : "#3d3d3d",
              backgroundColor: value === opt.value ? "#1e1e1e" : "transparent",
              color: value === opt.value ? "#ffffff" : "#888",
              cursor: "pointer", transition: "all 100ms",
            }}
          >{opt.label}</button>
        ))}
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
    <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 4, marginBottom: 8 }}>
      {swatches.map((s) => (
        <button key={s.value} onClick={() => onSelect(s.value)} title={s.label}
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
    <button onClick={onClick}
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
      <input type="color" value={value} onChange={(e) => onPicker(e.target.value)}
        style={{ width: 24, height: 24, border: "1px solid #3d3d3d", borderRadius: 3, backgroundColor: "transparent", cursor: "pointer", padding: 1, flexShrink: 0 }}
      />
      <input type="text" value={hex} onChange={(e) => onHex(e.target.value)} onBlur={onBlur} placeholder="#ffffff"
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
  const [gradDir, setGradDir]     = useState("135deg");
  const [hex1, setHex1] = useState("#00f5ff");
  const [hex2, setHex2] = useState("#bf00ff");

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

  return (
    <Dialog.Root animated>
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
            position: "fixed", bottom: 88, right: 16,
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontFamily: monoFont, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#ffffff" }}>
              Controls
            </span>
            <Dialog.Close style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 13, lineHeight: 1, padding: 3, fontFamily: monoFont }}>
              ✕
            </Dialog.Close>
          </div>

          <Divider />

          {/* ── Color ── */}
          <div style={{ marginBottom: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={labelStyle}>Color</span>
              <div style={{ display: "flex", gap: 1 }}>
                <TabBtn active={colorTab === "basic"}    onClick={() => setColorTab("basic")}>Basic</TabBtn>
                <TabBtn active={colorTab === "neon"}     onClick={() => setColorTab("neon")}>Neon</TabBtn>
                <TabBtn active={colorTab === "gradient"} onClick={() => setColorTab("gradient")}>Grad</TabBtn>
              </div>
            </div>

            {/* Fixed-height tab body — solid tabs same height, gradient taller */}
            <div style={{ height: colorTab === "gradient" ? 210 : 126, transition: "height 200ms ease" }}>

              {/* Basic / Neon */}
              {colorTab !== "gradient" && (
                <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
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

              {/* Gradient tab */}
              {colorTab === "gradient" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {/* Preset swatches — 2 rows of 8 */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 4 }}>
                    {GRADIENTS.map((g) => (
                      <button key={g.value} onClick={() => {
                        setGradStop1(g.s1); setHex1(g.s1);
                        setGradStop2(g.s2); setHex2(g.s2);
                        applyGrad(g.s1, g.s2, gradDir);
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

                  {/* Preview bar */}
                  <div style={{ height: 20, borderRadius: 5, background: buildGrad(gradStop1, gradStop2, gradDir), border: "1px solid #2e2e2e", flexShrink: 0 }} />

                  {/* Direction */}
                  <div style={{ display: "flex", gap: 3 }}>
                    {GRAD_DIRECTIONS.map((d) => (
                      <button key={d.deg}
                        onClick={() => { setGradDir(d.deg); applyGrad(gradStop1, gradStop2, d.deg); }}
                        style={{
                          flex: 1, fontFamily: monoFont, fontSize: 10, padding: "3px 0",
                          borderRadius: 3, border: "1px solid",
                          borderColor: gradDir === d.deg ? "#ffffff" : "#3d3d3d",
                          backgroundColor: gradDir === d.deg ? "#1e1e1e" : "transparent",
                          color: gradDir === d.deg ? "#ffffff" : "#888",
                          cursor: "pointer", transition: "all 100ms", lineHeight: 1,
                        }}
                      >{d.label}</button>
                    ))}
                  </div>

                  {/* Two stops side by side */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div>
                      <span style={{ ...labelStyle, marginBottom: 4, display: "block" }}>Stop A</span>
                      <PickerRow value={gradStop1} hex={hex1}
                        onPicker={(v) => { setGradStop1(v); setHex1(v); applyGrad(v, gradStop2, gradDir); }}
                        onHex={(v) => { setHex1(v); if (/^#[0-9a-fA-F]{6}$/.test(v)) { setGradStop1(v); applyGrad(v, gradStop2, gradDir); } }}
                        onBlur={() => setHex1(gradStop1)}
                      />
                    </div>
                    <div>
                      <span style={{ ...labelStyle, marginBottom: 4, display: "block" }}>Stop B</span>
                      <PickerRow value={gradStop2} hex={hex2}
                        onPicker={(v) => { setGradStop2(v); setHex2(v); applyGrad(gradStop1, v, gradDir); }}
                        onHex={(v) => { setHex2(v); if (/^#[0-9a-fA-F]{6}$/.test(v)) { setGradStop2(v); applyGrad(gradStop1, v, gradDir); } }}
                        onBlur={() => setHex2(gradStop2)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Divider />

          {/* ── Sliders ── */}
          <SliderRow label="Speed" value={controls.speed} min={0.25} max={3} step={0.05}
            display={`${controls.speed.toFixed(2)}×`} onChange={(v) => set("speed", v)} />
          <SliderRow label="Glow" value={controls.glow} min={0} max={3} step={0.1}
            display={controls.glow === 0 ? "off" : `${controls.glow}px`} onChange={(v) => set("glow", v)} />
          <SliderRow label="Opacity" value={controls.opacity} min={0.5} max={1} step={0.1}
            display={`${Math.round(controls.opacity * 100)}%`} onChange={(v) => set("opacity", v)} />

          <Divider />

          {/* ── Cell Size ── */}
          <div style={{ marginBottom: 14 }}>
            <span style={{ ...labelStyle, marginBottom: 8, display: "block" }}>Cell Size</span>
            <div style={{ display: "flex", gap: 5 }}>
              {CELL_OPTIONS.map((opt) => (
                <button key={opt.value} onClick={() => set("cellSize", opt.value)}
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
          </div>

          <Divider />

          {/* ── Reset ── */}
          <button
            onClick={() => {
              setHexInput(DEFAULT_CONTROLS.color);
              setColorTab("basic");
              setGradStop1("#00f5ff"); setHex1("#00f5ff");
              setGradStop2("#bf00ff"); setHex2("#bf00ff");
              setGradDir("135deg");
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
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
