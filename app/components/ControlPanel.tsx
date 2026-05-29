"use client";

import { Dialog } from "@base-ui/react/dialog";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { HexColorPicker } from "react-colorful";
import { sounds } from "./sounds";

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

// ─── Color generation helpers ─────────────────────────────────────────────────
type Swatch = { label: string; value: string };
type GradientPreset = { label: string; s1: string; s2: string; value: string };

function hslToHex(h: number, s: number, l: number): string {
  const hh = ((h % 360) + 360) % 360;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + hh / 30) % 12;
    const c = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * Math.max(0, Math.min(1, c)))
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function randRange(lo: number, hi: number) {
  return lo + Math.random() * (hi - lo);
}

const SWATCH_COUNT = 16;

function generateBasicSwatches(): Swatch[] {
  const hueStart = Math.random() * 360;
  return Array.from({ length: SWATCH_COUNT }, (_, i) => {
    const h = (hueStart + (i * 360) / SWATCH_COUNT + randRange(-8, 8)) % 360;
    const s = randRange(0.55, 0.85);
    const l = randRange(0.4, 0.65);
    const hex = hslToHex(h, s, l);
    return { label: hex, value: hex };
  });
}

function generateNeonSwatches(): Swatch[] {
  const hueStart = Math.random() * 360;
  return Array.from({ length: SWATCH_COUNT }, (_, i) => {
    const h = (hueStart + (i * 360) / SWATCH_COUNT + randRange(-10, 10)) % 360;
    const s = randRange(0.9, 1);
    const l = randRange(0.5, 0.7);
    const hex = hslToHex(h, s, l);
    return { label: hex, value: hex };
  });
}

function generateGradientPresets(): GradientPreset[] {
  return Array.from({ length: SWATCH_COUNT }, () => {
    const h1 = Math.random() * 360;
    const h2 = h1 + randRange(60, 180);
    const s1 = randRange(0.7, 1), l1 = randRange(0.45, 0.65);
    const s2 = randRange(0.7, 1), l2 = randRange(0.45, 0.65);
    const c1 = hslToHex(h1, s1, l1);
    const c2 = hslToHex(h2, s2, l2);
    const value = `linear-gradient(135deg, ${c1}, ${c2})`;
    return { label: `${c1} → ${c2}`, s1: c1, s2: c2, value };
  });
}

const CELL_OPTIONS = [
  { label: "XS", sub: "12×12", value: 4  },
  { label: "S",  sub: "18×18", value: 6  },
  { label: "M",  sub: "24×24", value: 8  },
  { label: "L",  sub: "30×30", value: 10 },
  { label: "XL", sub: "36×36", value: 12 },
];

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
    <div className="cp-swatch-grid" style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 4 }}>
      {swatches.map((s) => (
        <button key={s.value} className="cp-swatch" onClick={() => { sounds.swatchPick(); onSelect(s.value) }} title={s.label}
          style={{
            width: "100%", aspectRatio: "1", borderRadius: 3,
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
    <button className="cp-tab-btn" onClick={() => { if (!active) sounds.tabSwitch(); onClick() }}
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

// ─── Compact color + hex row with popover picker ─────────────────────────────
function PickerRow({ value, hex, onPicker, onHex, onBlur }: {
  value: string; hex: string;
  onPicker: (v: string) => void;
  onHex: (v: string) => void;
  onBlur: () => void;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        popRef.current && !popRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleToggle = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 6, left: rect.left });
    }
    setOpen((v) => !v);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <button
        ref={btnRef}
        type="button"
        onClick={handleToggle}
        style={{ width: 24, height: 24, border: "1px solid #3d3d3d", borderRadius: 3, backgroundColor: value, cursor: "pointer", padding: 0, flexShrink: 0 }}
        aria-label="Pick color"
      />
      <input type="text" className="cp-picker-hex" value={hex} onChange={(e) => onHex(e.target.value)} onBlur={onBlur} placeholder="#ffffff"
        style={{ fontFamily: monoFont, fontSize: 10, letterSpacing: "0.06em", backgroundColor: "#111", border: "1px solid #3d3d3d", borderRadius: 3, color: "#aaa", padding: "3px 7px", width: "100%", outline: "none" }}
      />
      {open && createPortal(
        <div ref={popRef} className="cp-color-popover" style={{ top: pos.top, left: pos.left }}>
          <HexColorPicker color={value} onChange={onPicker} />
        </div>,
        document.body
      )}
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

  const [openColor, setOpenColor] = useState(true);
  const [openMotion, setOpenMotion] = useState(false);
  const [openSize, setOpenSize] = useState(false);
  const [gradientPresetsShown, setGradientPresetsShown] = useState<GradientPreset[]>(
    generateGradientPresets,
  );
  const [basicSwatchesShown, setBasicSwatchesShown] = useState(generateBasicSwatches);
  const [neonSwatchesShown, setNeonSwatchesShown] = useState(generateNeonSwatches);

  const buildGrad = (s1: string, s2: string, dir: string) =>
    `linear-gradient(${dir}, ${s1}, ${s2})`;

  const applyGrad = (s1: string, s2: string, dir: string) =>
    onChange({ ...controls, color: buildGrad(s1, s2, dir), colorMode: "gradient" });

  const goToGradientTab = () => {
    setColorTab("gradient");
    setGradientPresetsShown(generateGradientPresets());
  };

  const applyPreset = (g: GradientPreset) => {
    setGradStop1(g.s1);
    setHex1(g.s1);
    setGradStop2(g.s2);
    setHex2(g.s2);
    applyGrad(g.s1, g.s2, GRAD_ANGLE);
  };

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
    <Dialog.Root
      onOpenChange={(open) => {
        if (open) sounds.panelOpen(); else sounds.panelClose();
        if (open && colorTab === "gradient") setGradientPresetsShown(generateGradientPresets());
      }}
    >
      <Dialog.Trigger className="cp-collapsed-dock">
        <div className="cp-collapsed-dock-head">
          <span style={{ fontFamily: monoFont, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#ffffff" }}>
            Controls
          </span>
          <svg className="cp-collapsed-dock-chevron" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M7 4v6M4 7l3-3 3 3" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="cp-collapsed-dock-strip">
          <span className="cp-color-dot" style={{ background: controls.color }} />
          <span className="cp-collapsed-dock-status">
            {`${controls.speed.toFixed(2)}× · ${cellLabel} · ${colorSummary.toUpperCase()}`}
          </span>
          <span className="cp-collapsed-dock-expand">Expand</span>
        </div>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Popup
          className="cp-panel cp-popup"
          style={{
            position: "fixed", top: 24, right: 16,
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontFamily: monoFont, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#ffffff" }}>
              Controls
            </span>
            <Dialog.Close className="cp-minimize-btn" aria-label="Collapse panel" style={{ width: 14, height: 14 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M7 4v6M4 7l3 3 3-3" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Dialog.Close>
          </div>

          <div className="cp-panel-body">
              <CollapseSection title="Color" expanded={openColor} onToggle={() => { sounds.sectionToggle(); setOpenColor((v) => !v) }}>
                <div style={{ marginBottom: 4 }}>
                  <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ display: "flex", gap: 1 }}>
                      <TabBtn active={colorTab === "basic"} onClick={() => setColorTab("basic")}>Basic</TabBtn>
                      <TabBtn active={colorTab === "neon"} onClick={() => setColorTab("neon")}>Neon</TabBtn>
                      <TabBtn active={colorTab === "gradient"} onClick={goToGradientTab}>Grad</TabBtn>
                    </div>
                  </div>

                  {colorTab !== "gradient" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          onClick={() => {
                            sounds.shuffle()
                            colorTab === "basic"
                              ? setBasicSwatchesShown(generateBasicSwatches())
                              : setNeonSwatchesShown(generateNeonSwatches())
                          }}
                          style={{
                            fontFamily: monoFont, fontSize: 8, letterSpacing: "0.1em",
                            textTransform: "uppercase", padding: "4px 10px", borderRadius: 4,
                            border: "1px solid #454545", backgroundColor: "#141414",
                            color: "#ccc", cursor: "pointer",
                          }}
                        >
                          Shuffle
                        </button>
                      </div>
                      <SwatchGrid
                        swatches={colorTab === "basic" ? basicSwatchesShown : neonSwatchesShown}
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
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          onClick={() => { sounds.shuffle(); setGradientPresetsShown(generateGradientPresets()) }}
                          style={{
                            fontFamily: monoFont, fontSize: 8, letterSpacing: "0.1em",
                            textTransform: "uppercase", padding: "4px 10px", borderRadius: 4,
                            border: "1px solid #454545", backgroundColor: "#141414",
                            color: "#ccc", cursor: "pointer",
                          }}
                        >
                          Shuffle
                        </button>
                      </div>
                      <div className="cp-grad-grid" style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 4 }}>
                        {gradientPresetsShown.map((g) => (
                          <button key={g.value} type="button" onClick={() => { sounds.swatchPick(); applyPreset(g) }}
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

              <CollapseSection title="Motion" expanded={openMotion} onToggle={() => { sounds.sectionToggle(); setOpenMotion((v) => !v) }}>
                <SliderRow label="Speed" value={controls.speed} min={0.25} max={3} step={0.05}
                  display={`${controls.speed.toFixed(2)}×`} onChange={(v) => { sounds.sliderTick(); set("speed", v) }} />
                <SliderRow label="Glow" value={controls.glow} min={0} max={3} step={0.1}
                  display={controls.glow === 0 ? "off" : `${controls.glow}px`} onChange={(v) => { sounds.sliderTick(); set("glow", v) }} />
                <SliderRow label="Opacity" value={controls.opacity} min={0.5} max={1} step={0.1}
                  display={`${Math.round(controls.opacity * 100)}%`} onChange={(v) => { sounds.sliderTick(); set("opacity", v) }} />
              </CollapseSection>

              <CollapseSection title="Cell size" expanded={openSize} onToggle={() => { sounds.sectionToggle(); setOpenSize((v) => !v) }}>
                <div style={{ display: "flex", gap: 5, marginBottom: 4 }}>
                  {CELL_OPTIONS.map((opt) => (
                    <button key={opt.value} className="cp-cell-btn" onClick={() => { sounds.cellSelect(); set("cellSize", opt.value) }}
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

          {/* ── Reset ── */}
          <button className="cp-reset"
            onClick={() => {
              sounds.reset();
              setHexInput(DEFAULT_CONTROLS.color);
              setColorTab("basic");
              setGradStop1("#00f5ff"); setHex1("#00f5ff");
              setGradStop2("#bf00ff"); setHex2("#bf00ff");
              setBasicSwatchesShown(generateBasicSwatches());
              setNeonSwatchesShown(generateNeonSwatches());
              setGradientPresetsShown(generateGradientPresets());
              onChange(DEFAULT_CONTROLS);
            }}
            style={{
              marginTop: 24,
              fontFamily: monoFont, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase",
              padding: "7px 0", backgroundColor: "transparent", border: "1px solid #3d3d3d",
              borderRadius: 4, color: "#888", cursor: "pointer", width: "100%",
            }}
          >
            Reset
          </button>
            </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
