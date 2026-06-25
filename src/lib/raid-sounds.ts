/**
 * raid-sounds.ts — Raid Boss sound effects
 *
 * Extends the lab-sounds.ts pattern. Reuses the same AudioContext and
 * isLabSoundEnabled() gate so the 🔊 SFX toggle on The Lab also silences
 * Raid sounds — no second audio system needed.
 */

import { isLabSoundEnabled } from "./lab-sounds";

const STORAGE_KEY = "mutagen-lab-sound"; // same key as lab-sounds.ts
void STORAGE_KEY; // referenced via isLabSoundEnabled()

let raidCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!raidCtx) raidCtx = new AudioContext();
  if (raidCtx.state === "suspended") void raidCtx.resume();
  return raidCtx;
}

/** Short percussive attack strike — fires on every successful AttackBoss tx. */
export function playAttackHitSound(): void {
  if (!isLabSoundEnabled()) return;
  const audio = getCtx();
  if (!audio) return;

  const now = audio.currentTime;

  // Noise burst (impact body)
  const bufSize = Math.floor(audio.sampleRate * 0.08);
  const buf = audio.createBuffer(1, bufSize, audio.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufSize, 2);
  }
  const src = audio.createBufferSource();
  src.buffer = buf;
  const noiseFilter = audio.createBiquadFilter();
  noiseFilter.type = "bandpass";
  noiseFilter.frequency.value = 1200;
  noiseFilter.Q.value = 0.8;
  const noiseGain = audio.createGain();
  noiseGain.gain.setValueAtTime(0.18, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
  src.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(audio.destination);
  src.start(now);

  // Tonal punch (body resonance)
  const osc = audio.createOscillator();
  const oscGain = audio.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(280, now);
  osc.frequency.exponentialRampToValueAtTime(60, now + 0.1);
  oscGain.gain.setValueAtTime(0.12, now);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
  osc.connect(oscGain);
  oscGain.connect(audio.destination);
  osc.start(now);
  osc.stop(now + 0.18);
}

/** Heavy low thud — the boss reacting to being hit. */
export function playBossHitReactionSound(): void {
  if (!isLabSoundEnabled()) return;
  const audio = getCtx();
  if (!audio) return;

  const now = audio.currentTime;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(80, now);
  osc.frequency.exponentialRampToValueAtTime(30, now + 0.25);
  gain.gain.setValueAtTime(0.22, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(now);
  osc.stop(now + 0.35);
}

/** Victory fanfare — fires when Boss HP hits 0. */
export function playBossDefeatedSound(): void {
  if (!isLabSoundEnabled()) return;
  const audio = getCtx();
  if (!audio) return;

  const now = audio.currentTime;
  // Ascending arpeggio (5 notes) + final chord
  const notes = [262, 330, 392, 523, 659, 784];
  notes.forEach((freq, i) => {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    const start = now + i * 0.11;
    osc.type = i === notes.length - 1 ? "square" : "triangle";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.1, start + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.45);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(start);
    osc.stop(start + 0.5);
  });

  // Explosion noise burst at the moment of defeat
  const bufSize = Math.floor(audio.sampleRate * 0.35);
  const buf = audio.createBuffer(1, bufSize, audio.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufSize, 1.5);
  }
  const noiseSrc = audio.createBufferSource();
  noiseSrc.buffer = buf;
  const noiseGain = audio.createGain();
  noiseGain.gain.setValueAtTime(0.14, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
  noiseSrc.connect(noiseGain);
  noiseGain.connect(audio.destination);
  noiseSrc.start(now);
}

/** Synthesis "level up" — fires on successful MergeSpecimen. */
export function playMergeCompleteSound(): void {
  if (!isLabSoundEnabled()) return;
  const audio = getCtx();
  if (!audio) return;

  const now = audio.currentTime;
  // Rising major arpeggio
  const notes = [392, 494, 587, 784];
  notes.forEach((freq, i) => {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    const start = now + i * 0.08;
    osc.type = "triangle";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.08, start + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(start);
    osc.stop(start + 0.35);
  });
}

/** Cooldown ticking — optional tick sound for "attack ready" moment. */
export function playReadySound(): void {
  if (!isLabSoundEnabled()) return;
  const audio = getCtx();
  if (!audio) return;

  const now = audio.currentTime;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = "sine";
  osc.frequency.value = 880;
  gain.gain.setValueAtTime(0.04, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(now);
  osc.stop(now + 0.12);
}
