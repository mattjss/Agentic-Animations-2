"use client"

let _ac: AudioContext | null = null
let _lastSliderAt = 0

function getAC(): AudioContext {
  if (!_ac) _ac = new AudioContext()
  return _ac
}

function tone(
  freq: number,
  dur: number,
  type: OscillatorType = 'sine',
  vol = 0.09,
  when = 0,
  freqEnd?: number,
) {
  const ac = getAC()
  if (ac.state === 'suspended') ac.resume()
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.connect(gain)
  gain.connect(ac.destination)
  osc.type = type
  const t0 = ac.currentTime + when
  osc.frequency.setValueAtTime(freq, t0)
  if (freqEnd !== undefined) {
    osc.frequency.linearRampToValueAtTime(freqEnd, t0 + dur)
  }
  gain.gain.setValueAtTime(0, t0)
  gain.gain.linearRampToValueAtTime(vol, t0 + 0.005)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.start(t0)
  osc.stop(t0 + dur + 0.02)
}

export const sounds = {
  // Gallery card interactions
  cardHover:     () => tone(1568, 0.028, 'triangle', 0.012),
  downloadClick: () => { tone(784, 0.07, 'triangle', 0.09); tone(1175, 0.09, 'sine', 0.07, 0.06) },
  downloadDone:  () => {
    tone(784, 0.12, 'sine', 0.09)
    tone(988, 0.14, 'sine', 0.078, 0.10)
    tone(1175, 0.22, 'sine', 0.062, 0.20)
  },

  // Control panel open/close
  panelOpen:  () => tone(440, 0.14, 'sine', 0.065, 0, 660),
  panelClose: () => tone(660, 0.11, 'sine', 0.06, 0, 440),

  // In-panel interactions
  sectionToggle: () => tone(880, 0.038, 'triangle', 0.052),
  tabSwitch:     () => tone(740, 0.024, 'triangle', 0.03),
  swatchPick:    () => tone(659, 0.052, 'sine', 0.068),
  cellSelect:    () => tone(494, 0.044, 'triangle', 0.062),
  shuffle:       () => {
    tone(523, 0.028, 'square', 0.032)
    tone(659, 0.028, 'square', 0.026, 0.032)
    tone(784, 0.048, 'square', 0.022, 0.060)
  },
  reset: () => { tone(660, 0.06, 'sine', 0.065); tone(440, 0.1, 'sine', 0.06, 0.06) },
  sliderTick: () => {
    const now = Date.now()
    if (now - _lastSliderAt < 80) return
    _lastSliderAt = now
    tone(523, 0.013, 'square', 0.006)
  },
}
