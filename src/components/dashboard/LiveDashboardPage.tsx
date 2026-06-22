"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { ASSETS } from "@/lib/assets";
import { getExperiments, getHubPulse, getInterventionLogs } from "@/lib/experiment-store";
import { getRegimeColor } from "@/lib/loot-table";
import { useStoreRefresh, usePrefersReducedMotion } from "@/lib/hooks";
import { HubPulsePanel } from "@/components/lab/HubPulsePanel";

const BUCKETS = 12;

function generateMonteCarloHistogram(count: number): number[] {
  const buckets = new Array(BUCKETS).fill(0);
  for (let i = 0; i < count; i++) {
    const payout = Math.pow(Math.random(), 1.8) * 100;
    const bucket = Math.min(BUCKETS - 1, Math.floor(payout / (100 / BUCKETS)));
    buckets[bucket]++;
  }
  const max = Math.max(...buckets);
  return buckets.map((b) => (b / max) * 100);
}

export function LiveDashboardPage() {
  useStoreRefresh();
  const reducedMotion = usePrefersReducedMotion();

  const [monteCarlo] = useState<number[]>(() =>
    generateMonteCarloHistogram(1000)
  );
  const [animated, setAnimated] = useState(false);
  const [wavePath, setWavePath] = useState(
    "M0 25 Q 10 5, 20 25 T 40 25 T 60 25 T 80 25 T 100 25 T 120 25 T 140 25 T 160 25 T 180 25 T 200 25"
  );

  const experiments = getExperiments();
  const hubPulse = getHubPulse();
  const interventionLogs = getInterventionLogs();

  const realOverlay = useMemo(() => {
    const buckets = new Array(BUCKETS).fill(0);
    experiments.forEach((exp) => {
      const payout = exp.exposureScore * exp.bondAmount;
      const bucket = Math.min(BUCKETS - 1, Math.floor((payout / 500) * BUCKETS));
      buckets[bucket]++;
    });
    const max = Math.max(...buckets, 1);
    return buckets.map((b) => (b / max) * 100);
  }, [experiments]);

  useEffect(() => {
    if (reducedMotion) return;
    const t = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(t);
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;
    const interval = setInterval(() => {
      let newPath = "M0 25";
      for (let i = 10; i <= 200; i += 10) {
        const yOffset = Math.random() > 0.5 ? 5 : 45;
        newPath += ` T ${i} ${yOffset}`;
      }
      setWavePath(newPath);
    }, 2000);
    return () => clearInterval(interval);
  }, [reducedMotion]);

  const zeroSumIndex = 0.38;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 font-pixel">
      <div className="mb-6">
        <h1 className="font-header text-2xl md:text-3xl">Live Dashboard</h1>
        <p className="text-lg mt-2">Real-time payout distribution and Hub signals.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel 1: Payout Histogram */}
        <div className="bg-[#F8F9FA] border-4 border-black p-6 flex flex-col shadow-[8px_8px_0_rgba(0,0,0,1)]">
          <h3 className="font-header text-sm mb-6 text-center">Payout Histogram</h3>
          <div className="w-full h-48 border-l-4 border-b-4 border-black flex items-end justify-between pb-1 px-1 relative">
            {[...Array(4)].map((_, i) => (
              <div
                key={`grid-${i}`}
                className="absolute left-0 w-full h-px bg-black opacity-20"
                style={{ bottom: `${(i + 1) * 25}%` }}
              />
            ))}
            {monteCarlo.map((h, i) => {
              const realH = realOverlay[i];
              const displayH = reducedMotion || animated ? h : 5;
              return (
                <div key={`bar-${i}`} className="flex-1 mx-px relative flex items-end justify-center h-full">
                  <div
                    className="w-full bg-[#C0C0C0] border-2 border-black transition-all duration-1000 ease-out"
                    style={{ height: `${displayH}%` }}
                  />
                  {realH > 0 && (
                    <div
                      className="absolute bottom-0 w-full bg-mutagen-green/70 border-2 border-black transition-all duration-500"
                      style={{ height: `${realH}%` }}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-sm text-center mt-4 font-bold">
            Silver = Monte Carlo (1000 pulls). Green = real pulls.
          </p>
        </div>

        {/* Panel 2: Zero-Sum Index */}
        <div className="bg-[#F8F9FA] border-4 border-black p-6 flex flex-col shadow-[8px_8px_0_rgba(0,0,0,1)]">
          <h3 className="font-header text-sm mb-4 text-center">Zero-Sum Index</h3>
          <div className="flex justify-center mb-4">
            <Image
              src={ASSETS.speedometer}
              alt="Gauge"
              width={160}
              height={160}
              className="[image-rendering:pixelated] object-contain"
            />
          </div>
          <div className="text-center font-header text-2xl mb-4">
            {zeroSumIndex.toFixed(2)}
          </div>
          <div className="flex-1 min-h-32 bg-black border-4 border-[#333] p-2 overflow-y-auto custom-scroll">
            <div className="font-mono text-xs leading-relaxed flex flex-col gap-1">
              {interventionLogs.map((log) => (
                <div
                  key={log.id}
                  className={log.isError ? "text-[#FF5F56]" : "text-[#27C93F]"}
                >
                  [{new Date().toLocaleTimeString()}] {log.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panel 3: Hub Pulse */}
        <div className="bg-[#F8F9FA] border-4 border-black p-6 flex flex-col shadow-[8px_8px_0_rgba(0,0,0,1)] relative">
          <h3 className="font-header text-sm mb-4 text-center">Hub Pulse</h3>
          <HubPulsePanel data={hubPulse} showRegime />

          <div className="mt-4 h-20 overflow-hidden relative">
            <svg className="w-full h-16 opacity-60" viewBox="0 0 200 50">
              <path
                d={wavePath}
                fill="none"
                stroke="#27C93F"
                strokeWidth="2"
                className={reducedMotion ? "" : "animate-scroll-wave"}
              />
            </svg>
          </div>

          <div
            className="mt-4 text-center font-header text-5xl"
            style={{ color: getRegimeColor(hubPulse.regimeScore) }}
          >
            {hubPulse.regimeScore}
          </div>
        </div>
      </div>
    </div>
  );
}
