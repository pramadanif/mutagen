import type { Tier } from "./types";

const STORAGE_KEY = "mutagen-lab-sound";

let ctx: AudioContext | null = null;
let chargeOscillators: OscillatorNode[] = [];
let chargeGain: GainNode | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function isLabSoundEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(STORAGE_KEY) !== "off";
}

export function setLabSoundEnabled(enabled: boolean): void {
  sessionStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
  if (!enabled) stopChargeSound();
}

export function stopChargeSound(): void {
  const audio = ctx;
  const gain = chargeGain;
  const oscs = chargeOscillators;

  chargeOscillators = [];
  chargeGain = null;

  if (!audio || oscs.length === 0) return;

  const t = audio.currentTime;
  const stopAt = t + 0.14;

  if (gain) {
    gain.gain.cancelScheduledValues(t);
    gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.0001), t);
    gain.gain.exponentialRampToValueAtTime(0.0001, stopAt);
  }

  for (const osc of oscs) {
    try {
      osc.stop(stopAt);
    } catch {
      /* already stopped */
    }
  }
}

/** Soft reactor hum while tx signs — sine layers + gentle pulse, no harsh buzz */
export function playChargeSound(): void {
  if (!isLabSoundEnabled()) return;
  const audio = getAudioContext();
  if (!audio) return;

  stopChargeSound();

  const now = audio.currentTime;
  const master = audio.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.018, now + 0.5);

  const filter = audio.createBiquadFilter();
  filter.type = "lowpass";
  filter.Q.value = 0.6;
  filter.frequency.setValueAtTime(240, now);
  filter.frequency.exponentialRampToValueAtTime(420, now + 2.2);

  const tone = audio.createGain();
  tone.gain.value = 0.55;

  const oscA = audio.createOscillator();
  oscA.type = "sine";
  oscA.frequency.setValueAtTime(88, now);
  oscA.frequency.exponentialRampToValueAtTime(118, now + 2.2);

  const oscB = audio.createOscillator();
  oscB.type = "sine";
  oscB.frequency.setValueAtTime(90.5, now);
  oscB.frequency.exponentialRampToValueAtTime(121, now + 2.2);

  const lfo = audio.createOscillator();
  lfo.type = "sine";
  lfo.frequency.value = 1.8;

  const lfoDepth = audio.createGain();
  lfoDepth.gain.value = 0.22;

  const pulse = audio.createGain();
  pulse.gain.value = 0.78;

  oscA.connect(tone);
  oscB.connect(tone);
  lfo.connect(lfoDepth);
  lfoDepth.connect(pulse.gain);
  tone.connect(pulse);
  pulse.connect(master);
  master.connect(filter);
  filter.connect(audio.destination);

  oscA.start(now);
  oscB.start(now);
  lfo.start(now);

  chargeOscillators = [oscA, oscB, lfo];
  chargeGain = master;
}

export function playRumbleSound(): void {
  if (!isLabSoundEnabled()) return;
  const audio = getAudioContext();
  if (!audio) return;

  stopChargeSound();

  const bufferSize = audio.sampleRate * 0.25;
  const buffer = audio.createBuffer(1, bufferSize, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }

  const source = audio.createBufferSource();
  source.buffer = buffer;
  const filter = audio.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 400;
  const gain = audio.createGain();
  gain.gain.value = 0.12;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(audio.destination);
  source.start();
}

export function playFlashSound(): void {
  if (!isLabSoundEnabled()) return;
  const audio = getAudioContext();
  if (!audio) return;

  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(880, audio.currentTime);
  osc.frequency.exponentialRampToValueAtTime(120, audio.currentTime + 0.2);
  gain.gain.setValueAtTime(0.08, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.25);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start();
  osc.stop(audio.currentTime + 0.3);
}

const TIER_FREQ: Record<Tier, number[]> = {
  COMMON: [262, 330, 392],
  RARE: [330, 415, 494, 587],
  EPIC: [392, 494, 587, 698, 784],
  LEGENDARY: [523, 659, 784, 988, 1175, 1319],
};

export function playRevealSound(tier: Tier): void {
  if (!isLabSoundEnabled()) return;
  const audio = getAudioContext();
  if (!audio) return;

  stopChargeSound();

  const notes = TIER_FREQ[tier];
  notes.forEach((freq, i) => {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    const start = audio.currentTime + i * 0.09;
    osc.type = tier === "LEGENDARY" ? "square" : "triangle";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.07, start + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(start);
    osc.stop(start + 0.4);
  });
}

export function playErrorSound(): void {
  if (!isLabSoundEnabled()) return;
  const audio = getAudioContext();
  if (!audio) return;

  stopChargeSound();

  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(180, audio.currentTime);
  osc.frequency.exponentialRampToValueAtTime(90, audio.currentTime + 0.3);
  gain.gain.setValueAtTime(0.06, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.35);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start();
  osc.stop(audio.currentTime + 0.4);
}
