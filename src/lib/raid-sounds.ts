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

/** Dramatic cinematic attack strike — fires on every successful AttackBoss tx. */
export function playAttackHitSound(): void {
  if (!isLabSoundEnabled()) return;
  const audio = getCtx();
  if (!audio) return;

  const now = audio.currentTime;

  // 1. Huge Sub-Bass Drop (Cinematic impact)
  const subOsc = audio.createOscillator();
  const subGain = audio.createGain();
  subOsc.type = "sine";
  subOsc.frequency.setValueAtTime(150, now);
  subOsc.frequency.exponentialRampToValueAtTime(20, now + 1.0); // Deep drop
  subGain.gain.setValueAtTime(0.8, now);
  subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
  subOsc.connect(subGain);
  subGain.connect(audio.destination);
  subOsc.start(now);
  subOsc.stop(now + 1.5);

  // 2. High-pitched dramatic metallic strike
  const strikeOsc = audio.createOscillator();
  const strikeGain = audio.createGain();
  strikeOsc.type = "square";
  strikeOsc.frequency.setValueAtTime(800, now);
  strikeOsc.frequency.exponentialRampToValueAtTime(100, now + 0.3);
  strikeGain.gain.setValueAtTime(0.15, now);
  strikeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
  strikeOsc.connect(strikeGain);
  strikeGain.connect(audio.destination);
  strikeOsc.start(now);
  strikeOsc.stop(now + 0.6);

  // 3. Noise burst (The smash)
  const bufSize = Math.floor(audio.sampleRate * 0.5);
  const buf = audio.createBuffer(1, bufSize, audio.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufSize, 3);
  }
  const noiseSrc = audio.createBufferSource();
  noiseSrc.buffer = buf;
  const noiseFilter = audio.createBiquadFilter();
  noiseFilter.type = "bandpass";
  noiseFilter.frequency.value = 800;
  noiseFilter.Q.value = 0.5;
  const noiseGain = audio.createGain();
  noiseGain.gain.setValueAtTime(0.6, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
  noiseSrc.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(audio.destination);
  noiseSrc.start(now);
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
  osc.frequency.setValueAtTime(60, now);
  osc.frequency.exponentialRampToValueAtTime(20, now + 0.4);
  gain.gain.setValueAtTime(0.5, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
  
  // Distortion for growl
  const waveShaper = audio.createWaveShaper();
  const curve = new Float32Array(400);
  for (let i = 0; i < 400; ++i) {
    const x = (i * 2) / 400 - 1;
    curve[i] = ((3 + 20) * x * 20 * (Math.PI / 180)) / (Math.PI + 20 * Math.abs(x));
  }
  waveShaper.curve = curve;
  
  osc.connect(waveShaper);
  waveShaper.connect(gain);
  gain.connect(audio.destination);
  osc.start(now);
  osc.stop(now + 0.6);
}

/** Victory fanfare — fires when Boss HP hits 0. */
export function playBossDefeatedSound(): void {
  if (!isLabSoundEnabled()) return;
  const audio = getCtx();
  if (!audio) return;

  const now = audio.currentTime;
  // Epic triumphant chord progression
  const chords = [
    { time: 0, notes: [261.63, 329.63, 392.00] }, // C Major
    { time: 0.6, notes: [349.23, 440.00, 523.25] }, // F Major
    { time: 1.2, notes: [392.00, 493.88, 587.33] }, // G Major
    { time: 1.8, notes: [523.25, 659.25, 783.99, 1046.50] } // High C Major Boom
  ];

  chords.forEach(chord => {
    chord.notes.forEach(freq => {
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      const start = now + chord.time;
      osc.type = "sawtooth";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(0.05, start + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, start + (chord.time === 1.8 ? 3.0 : 0.6));
      osc.connect(gain);
      gain.connect(audio.destination);
      osc.start(start);
      osc.stop(start + (chord.time === 1.8 ? 3.5 : 0.7));
    });
  });
}

/** Epic Cinematic "BWAAAAH" — fires on successful MergeSpecimen. */
export function playMergeCompleteSound(): void {
  if (!isLabSoundEnabled()) return;
  const audio = getCtx();
  if (!audio) return;

  const now = audio.currentTime;
  // Massive power chord (C2, C3, G3, C4, G4)
  const chord = [65.41, 130.81, 196.00, 261.63, 392.00]; 
  chord.forEach((freq, i) => {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    // Thick brassy tone
    osc.type = i % 2 === 0 ? "sawtooth" : "square";
    // Slight detune for massive thickness
    osc.detune.value = (Math.random() - 0.5) * 15;
    osc.frequency.value = freq;
    
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.1); // Strong immediate attack
    gain.gain.exponentialRampToValueAtTime(0.001, now + 3.5); // Long dramatic tail
    
    // Brassy filter sweep (opens up then slowly closes)
    const filter = audio.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(300, now);
    filter.frequency.exponentialRampToValueAtTime(4000, now + 0.15);
    filter.frequency.exponentialRampToValueAtTime(100, now + 3.5);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audio.destination);
    osc.start(now);
    osc.stop(now + 4.0);
  });
  
  // Distorted noise layer for gritty cinematic impact texture
  const bufSize = Math.floor(audio.sampleRate * 2.0);
  const buf = audio.createBuffer(1, bufSize, audio.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufSize, 2);
  }
  const noiseSrc = audio.createBufferSource();
  noiseSrc.buffer = buf;
  const noiseFilter = audio.createBiquadFilter();
  noiseFilter.type = "lowpass";
  noiseFilter.frequency.value = 600;
  const noiseGain = audio.createGain();
  noiseGain.gain.setValueAtTime(0.5, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
  noiseSrc.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(audio.destination);
  noiseSrc.start(now);
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
