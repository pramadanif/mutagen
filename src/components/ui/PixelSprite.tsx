"use client";

import { useEffect, useRef } from "react";

interface PixelSpriteProps {
  src: string;
  /** Width of one frame in pixels */
  frameW: number;
  /** Height of one frame in pixels */
  frameH: number;
  /** Total number of frames in the sprite sheet (horizontal strip) */
  totalFrames: number;
  /** Frames per second */
  fps?: number;
  /** Scale factor applied via CSS (nearest-neighbor). Optional. */
  scale?: number;
  className?: string;
  /** Row index (0-based) for vertical sprite sheets */
  row?: number;
  /** Number of frames in this animation row (defaults to totalFrames) */
  rowFrames?: number;
  /** Optional vertical offset in pixels (for sprites not starting at y=0) */
  offsetY?: number;
  /** Optional inline styles */
  style?: React.CSSProperties;
}

/**
 * Canvas-based pixel sprite animator.
 * Renders a horizontal strip sprite sheet at the given fps.
 * CSS image-rendering: pixelated is enforced — no blur, ever.
 */
export function PixelSprite({
  src,
  frameW,
  frameH,
  totalFrames,
  fps = 8,
  scale,
  className = "",
  row = 0,
  rowFrames,
  offsetY = 0,
  style,
}: PixelSpriteProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const rafRef = useRef<number>(0);
  const lastRef = useRef(0);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const frames = rowFrames ?? totalFrames;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Disable smoothing
    ctx.imageSmoothingEnabled = false;

    const img = new Image();
    img.src = src;
    imgRef.current = img;

    const interval = 1000 / fps;

    const draw = (now: number) => {
      if (now - lastRef.current >= interval) {
        lastRef.current = now;
        frameRef.current = (frameRef.current + 1) % frames;

        ctx.clearRect(0, 0, frameW, frameH);
        ctx.drawImage(
          img,
          frameRef.current * frameW, // sx: horizontal frame offset
          (row * frameH) + offsetY,  // sy: vertical row offset + custom offset
          frameW,
          frameH,
          0,
          0,
          frameW,
          frameH
        );
      }
      rafRef.current = requestAnimationFrame(draw);
    };

    img.onload = () => {
      // Draw first frame immediately
      ctx.drawImage(img, 0, (row * frameH) + offsetY, frameW, frameH, 0, 0, frameW, frameH);
      rafRef.current = requestAnimationFrame(draw);
    };

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [src, frameW, frameH, fps, frames, row]);

  return (
    <canvas
      ref={canvasRef}
      width={frameW}
      height={frameH}
      className={className}
      style={{
        ...(scale ? { width: frameW * scale, height: frameH * scale } : {}),
        imageRendering: "pixelated",
        ...style,
      }}
    />
  );
}
