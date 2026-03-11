"use client";

import { Slider } from "@base-ui/react/slider";
import { Dialog } from "@base-ui/react/dialog";
import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
export type ColorMode = "solid" | "gradient";
export type CellShape = "square" | "round";

export type Controls = {
  color: string;
  colorMode: ColorMode;
  speed: number;
  glow: number;
  opacity: number;
  cellSize: number;
  gap: number;
  shape: CellShape;
};

export const DEFAULT_CONTROLS: Controls = {
  color: "#ffffff",
  colorMode: "solid",
  speed: 1,
  glow: 0,
  opacity: 1,
  cellSize: 8,
  gap: 1,
  shape: "square",
};

// ─── Color palettes (16 each = 2 rows of 8) ──────────────────────────────────
const BASIC_COLORS = [
  { label: "White",       value: "#ffffff" },
  { label: "Silver",      value: "#a0a0a0" },
  { label: "Slate",       value: "#64748b" },
  { label: "Charcoal",    value: "#374151" },
  { label: "Red",         value: "#ef4444" },
  { label: "Orange",      value: "#f97316" },
  { label: "Amber",       value: "#f59e0b" },
  { label: "Yellow",      value: "#eab308" },
  { label: "Lime",        value: "#84cc16" },
  { label: "Green",       value: "#22c55e" },
  { label: "Teal",        value: "#14b8a6" },
  { label: "Cyan",        value: "#06b6d4" },
  { label: "Blue",        value: "#3b82f6" },
  { label: "Indigo",      value: "#6366f1" },
  { label: "Purple",      value: "#a855f7" },
  { label: "Pink",        value: "#ec4899" },
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

const GRADIENTS = [
  { label: "Aurora",      value: "linear-gradient(135deg, #00f5ff, #bf00ff)" },
  { label: "Sunset",      value: "linear-gradient(135deg, #ff6600, #ff2d78)" },
  { label: "Emerald",     value: "linear-gradient(135deg, #39ff14, #00f5ff)" },
  { label: "Gold",        value: "linear-gradient(135deg, #fff01f, #f97316)" },
  { label: "Candy",       value: "linear-gradient(135deg, #ff2d78, #a855f7)" },
  { label: "Ocean",       value: "linear-gradient(135deg, #3b82f6, #08e8de)" },
  { label: "Inferno",     value: "linear-gradient(135deg, #ef4444, #fff01f)" },
  { label: "Void",        value: "linear-gradient(135deg, #a855f7, #1b03a3)" },
  { label: "Glacier",     value: "linear-gradient(135deg, #e0f2fe, #3b82f6)" },
  { label: "Toxic",       value: "linear-gradient(135deg, #ccff00, #39ff14)" },
  { label: "Blaze",       value: "linear-gradient(135deg, #ff1111, #ff6600)" },
  { label: "Nebula",      value: "linear-gradient(135deg, #bf00ff, #ff2d78)" },
  { label: "Mint",        value: "linear-gradient(135deg, #00ffb3, #06b6d4)" },
  { label: "Dusk",        value: "linear-gradient(135deg, #6366f1, #ec4899)" },
  { label: "Matrix",      value: "linear-gradient(135deg, #39ff14, #14b8a6)" },
  { label: "Solar",       value: "linear-gradient(135deg, #fff01f, #bf00ff)" },
];

const CELL_OPTIONS = [
  { label: "S", value: 6 },
  { label: "M", value: 8 },
  { label: "L", value: 10 },
];

const GAP_OPTIONS = [
  { label: "0", value: 0 },
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
];

const SHAPE_OPTIONS = [
  { label: "■", value: "square" },
  { label: "●", value: "round" },
];

// ─── Shared styles ────────────────────────────────────────────────────────────
const monoFont = "var(--font-jetbrains-mono), 'JetBrains Mono', monospace";

const labelStyle: React.CSSProperties = {
  fontFamily: monoFont,
  fontSize: 9,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "#555",
  display: "block",
};

function Divider() {
  return <div style={{ height: 1, backgroundColor: "#1c1c1c", margin: "20px 0" }} />;
}

function SectionLabel({ children }: { children: string }) {
  return <span style={{ ...labelStyle, marginBottom: 10, display: "block" }}>{children}</span>;
}

// ─── Slider ───────────────────────────────────────────────────────────────────
function SliderRow({
  label, value, min, max, step, display, onChange,
}: {
  label: string; value: number; min: number; max: number;
  step: number; display: string; onChange: (v: number) => void;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={labelStyle}>{label}</span>
        <span style={{ ...labelStyle, color: "#777" }}>{display}</span>
      </div>
      <Slider.Root value={value} min={min} max={max} step={step}
        onValueChange={(v) => onChange(Array.isArray(v) ? v[0] : v)}
      >
        <Slider.Control style={{ position: "relative", display: "flex", alignItems: "center", height: 16, cursor: "pointer" }}>
          <Slider.Track style={{ position: "relative", height: 2, width: "100%", backgroundColor: "#2a2a2a", borderRadius: 1 }}>
            <Slider.Indicator style={{ position: "absolute", height: "100%", backgroundColor: "#ffffff", borderRadius: 1 }} />
            <Slider.Thumb style={{
              width: 12, height: 12, borderRadius: "50%", backgroundColor: "#ffffff",
              border: "none", outline: "none", cursor: "pointer",
              position: "absolute", top: "50%", transform: "translate(-50%, -50%)",
              boxShadow: "0 0 0 2px rgba(255,255,255,0.1)",
            }} />
          </Slider.Track>
        </Slider.Control>
      </Slider.Root>
    </div>
  );
}

// ─── Segment buttons ──────────────────────────────────────────────────────────
function SegmentRow({
  label, options, value, onChange,
}: {
  label: string;
  options: { label: string; value: string | number }[];
  value: string | number;
  onChange: (v: string | number) => void;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <SectionLabel>{label}</SectionLabel>
      <div style={{ display: "flex", gap: 6 }}>
        {options.map((opt) => (
          <button
            key={String(opt.value)}
            onClick={() => onChange(opt.value)}
            style={{
              fontFamily: monoFont,
              fontSize: 9,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "5px 12px",
              borderRadius: 4,
              border: "1px solid",
              borderColor: value === opt.value ? "#ffffff" : "#252525",
              backgroundColor: value === opt.value ? "#1e1e1e" : "transparent",
              color: value === opt.value ? "#ffffff" : "#4a4a4a",
              cursor: "pointer",
              transition: "all 100ms",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Color swatch grid (always 2 rows of 8) ───────────────────────────────────
function SwatchGrid({
  swatches, active, onSelect, isGradient,
}: {
  swatches: { label: string; value: string }[];
  active: string;
  onSelect: (v: string) => void;
  isGradient?: boolean;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 5, marginBottom: 12 }}>
      {swatches.map((s) => {
        const isActive = active === s.value;
        return (
          <button
            key={s.value}
            onClick={() => onSelect(s.value)}
            title={s.label}
            style={{
              width: "100%",
              aspectRatio: "1",
              borderRadius: isGradient ? 3 : "50%",
              background: s.value,
              border: isActive ? "2px solid #fff" : "2px solid transparent",
              cursor: "pointer",
              padding: 0,
              outline: "none",
              flexShrink: 0,
              boxShadow: isActive ? "0 0 0 1px rgba(255,255,255,0.2)" : "none",
            }}
          />
        );
      })}
    </div>
  );
}

// ─── Tab button ───────────────────────────────────────────────────────────────
function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: monoFont,
        fontSize: 8,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        padding: "4px 10px",
        borderRadius: 3,
        border: "none",
        backgroundColor: active ? "#1e1e1e" : "transparent",
        color: active ? "#ffffff" : "#444",
        cursor: "pointer",
        transition: "all 100ms",
      }}
    >
      {children}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ControlPanel({
  controls, onChange,
}: {
  controls: Controls;
  onChange: (c: Controls) => void;
}) {
  const [colorTab, setColorTab] = useState<"basic" | "neon" | "gradient">("basic");
  const [hexInput, setHexInput] = useState(controls.color);

  const set = <K extends keyof Controls>(key: K, val: Controls[K]) =>
    onChange({ ...controls, [key]: val });

  const setColor = (value: string, mode: ColorMode) => {
    setHexInput(value.startsWith("#") ? value : controls.color);
    onChange({ ...controls, color: value, colorMode: mode });
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger
        style={{
          position: "fixed",
          bottom: 32,
          right: 32,
          fontFamily: monoFont,
          fontSize: 10,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          padding: "10px 22px",
          backgroundColor: "#ffffff",
          color: "#000000",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
          zIndex: 50,
          boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
        }}
      >
        Controls
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Backdrop
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.3)", zIndex: 100 }}
        />

        <Dialog.Popup
          style={{
            position: "fixed",
            top: 0, right: 0, bottom: 0,
            width: 288,
            backgroundColor: "#080808",
            borderLeft: "1px solid #1a1a1a",
            zIndex: 101,
            padding: "24px 20px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <span style={{ fontFamily: monoFont, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#ffffff" }}>
              Controls
            </span>
            <Dialog.Close
              style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 4, fontFamily: monoFont }}
            >
              ✕
            </Dialog.Close>
          </div>

          <Divider />

          {/* ── Color ── */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <SectionLabel>Color</SectionLabel>
              <div style={{ display: "flex", gap: 2 }}>
                <TabBtn active={colorTab === "basic"}    onClick={() => setColorTab("basic")}>Basic</TabBtn>
                <TabBtn active={colorTab === "neon"}     onClick={() => setColorTab("neon")}>Neon</TabBtn>
                <TabBtn active={colorTab === "gradient"} onClick={() => setColorTab("gradient")}>Grad</TabBtn>
              </div>
            </div>

            {colorTab === "basic" && (
              <SwatchGrid swatches={BASIC_COLORS} active={controls.color}
                onSelect={(v) => setColor(v as string, "solid")} />
            )}
            {colorTab === "neon" && (
              <SwatchGrid swatches={NEON_COLORS} active={controls.color}
                onSelect={(v) => setColor(v as string, "solid")} />
            )}
            {colorTab === "gradient" && (
              <SwatchGrid swatches={GRADIENTS} active={controls.color}
                onSelect={(v) => setColor(v as string, "gradient")} isGradient />
            )}

            {colorTab !== "gradient" && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                <input
                  type="color"
                  value={controls.colorMode === "solid" ? controls.color : "#ffffff"}
                  onChange={(e) => setColor(e.target.value, "solid")}
                  style={{
                    width: 26, height: 26,
                    border: "1px solid #252525", borderRadius: 4,
                    backgroundColor: "transparent", cursor: "pointer", padding: 2, flexShrink: 0,
                  }}
                />
                <input
                  type="text"
                  value={hexInput}
                  onChange={(e) => {
                    const v = e.target.value;
                    setHexInput(v);
                    if (/^#[0-9a-fA-F]{6}$/.test(v)) setColor(v, "solid");
                  }}
                  onBlur={() => setHexInput(controls.colorMode === "solid" ? controls.color : "#ffffff")}
                  placeholder="#ffffff"
                  style={{
                    fontFamily: monoFont, fontSize: 10, letterSpacing: "0.08em",
                    backgroundColor: "#111", border: "1px solid #252525", borderRadius: 4,
                    color: "#888", padding: "4px 8px", width: 80, outline: "none",
                  }}
                />
              </div>
            )}
          </div>

          <Divider />

          {/* ── Speed ── */}
          <SliderRow
            label="Speed" value={controls.speed} min={0.25} max={3} step={0.05}
            display={`${controls.speed.toFixed(2)}×`}
            onChange={(v) => set("speed", v)}
          />

          {/* ── Glow ── */}
          <SliderRow
            label="Glow" value={controls.glow} min={0} max={20} step={0.5}
            display={controls.glow === 0 ? "off" : `${controls.glow}px`}
            onChange={(v) => set("glow", v)}
          />

          {/* ── Opacity ── */}
          <SliderRow
            label="Opacity" value={controls.opacity} min={0.2} max={1} step={0.01}
            display={`${Math.round(controls.opacity * 100)}%`}
            onChange={(v) => set("opacity", v)}
          />

          <Divider />

          {/* ── Cell Size + Shape side by side ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div>
              <SectionLabel>Size</SectionLabel>
              <div style={{ display: "flex", gap: 5 }}>
                {CELL_OPTIONS.map((opt) => (
                  <button key={opt.value} onClick={() => set("cellSize", opt.value)}
                    style={{
                      fontFamily: monoFont, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase",
                      padding: "5px 0", width: 36, borderRadius: 4, border: "1px solid",
                      borderColor: controls.cellSize === opt.value ? "#ffffff" : "#252525",
                      backgroundColor: controls.cellSize === opt.value ? "#1e1e1e" : "transparent",
                      color: controls.cellSize === opt.value ? "#ffffff" : "#4a4a4a",
                      cursor: "pointer", transition: "all 100ms",
                    }}
                  >{opt.label}</button>
                ))}
              </div>
            </div>
            <div>
              <SectionLabel>Shape</SectionLabel>
              <div style={{ display: "flex", gap: 5 }}>
                {SHAPE_OPTIONS.map((opt) => (
                  <button key={opt.value} onClick={() => set("shape", opt.value as CellShape)}
                    style={{
                      fontFamily: monoFont, fontSize: 13, letterSpacing: 0,
                      padding: "4px 0", width: 36, borderRadius: 4, border: "1px solid",
                      borderColor: controls.shape === opt.value ? "#ffffff" : "#252525",
                      backgroundColor: controls.shape === opt.value ? "#1e1e1e" : "transparent",
                      color: controls.shape === opt.value ? "#ffffff" : "#4a4a4a",
                      cursor: "pointer", transition: "all 100ms",
                    }}
                  >{opt.label}</button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Gap ── */}
          <SegmentRow
            label="Gap"
            options={GAP_OPTIONS}
            value={controls.gap}
            onChange={(v) => set("gap", v as number)}
          />

          <div style={{ flex: 1 }} />
          <Divider />

          <button
            onClick={() => {
              setHexInput(DEFAULT_CONTROLS.color);
              setColorTab("basic");
              onChange(DEFAULT_CONTROLS);
            }}
            style={{
              fontFamily: monoFont, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase",
              padding: "8px 0", backgroundColor: "transparent", border: "1px solid #1e1e1e",
              borderRadius: 4, color: "#444", cursor: "pointer", width: "100%",
            }}
          >
            Reset
          </button>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
