/**
 * bgm.ts — In-Game Background Music Player
 */

import { isLabSoundEnabled } from "./lab-sounds";

let bgmAudio: HTMLAudioElement | null = null;
let isPlaying = false;
let playbackTimeout: any = null;

function getAudio(): HTMLAudioElement {
  if (typeof window === "undefined") return null as any;
  if (!bgmAudio) {
    bgmAudio = new Audio("/bgm.mp3");
    bgmAudio.loop = true;
    bgmAudio.volume = 0.3; // slightly quieter so it doesn't overpower SFX
  }
  return bgmAudio;
}

export function playBGM(): void {
  if (typeof window !== "undefined") {
    clearTimeout(playbackTimeout);
  }
  if (typeof window === "undefined" || !isLabSoundEnabled() || isPlaying) return;
  const audio = getAudio();
  if (audio) {
    audio.play().then(() => {
      isPlaying = true;
    }).catch((err) => {
      console.warn("BGM autoplay blocked:", err);
    });
  }
}

export function stopBGM(force = false): void {
  if (!isPlaying) return;
  
  if (force) {
    if (typeof window !== "undefined") clearTimeout(playbackTimeout);
    const audio = getAudio();
    if (audio) {
      audio.pause();
      isPlaying = false;
    }
  } else {
    // 100ms grace period so it doesn't stop during client-side navigation
    if (typeof window !== "undefined") {
      playbackTimeout = setTimeout(() => {
        const audio = getAudio();
        if (audio) {
          audio.pause();
          isPlaying = false;
        }
      }, 100);
    }
  }
}

export function toggleBGM(): void {
  if (isPlaying) {
    stopBGM(true);
  } else {
    playBGM();
  }
}
