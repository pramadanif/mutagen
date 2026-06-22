"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

const auditorLogsData = [
  "Slope Adjusted - 0.01 fee increase",
  "Analyzing pool K volatility...",
  "Slope Adjusted - 0.02 fee increase",
  "Zero-Sum index check: Nominal.",
  "Slope Adjusted - 0.01 fee increase",
  "WARNING: Imbalance detected.",
  "Threshold met. Hard-cap intervention.",
  "Resetting baseline parameters..."
];

export function Fairness() {
  const [logs, setLogs] = useState<{ text: string; isError: boolean; id: number }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const idCounter = useRef(0);
  
  useEffect(() => {
    let logIndex = 0;
    const interval = setInterval(() => {
      const logLine = auditorLogsData[logIndex % auditorLogsData.length];
      const isError = logLine.includes("WARNING") || logLine.includes("Threshold") || logLine.includes("intervention");
      setLogs(prev => {
        const newLogs = [...prev, { text: `> ${logLine}`, isError, id: ++idCounter.current }];
        if (newLogs.length > 10) return newLogs.slice(-10);
        return newLogs;
      });
      
      logIndex++;
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <section id="fairness" className="w-full relative font-pixel">
      <div className="w-full">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-2 gap-2">
          <div>
            <h2 className="font-header text-3xl font-bold">AI & FAIRNESS</h2>
            <span className="text-xl font-bold">(The Sentinels)</span>
          </div>
          <span className="text-xs font-bold bg-black text-mutagen-green px-3 py-1 border-2 border-mutagen-green">
            NO FREEFORM AI · DETERMINISTIC ON TRIGGER
          </span>
        </div>
        <p className="text-sm mb-6 leading-relaxed max-w-3xl">
          Two load-bearing AI components — neither generates text. Regime Classifier reshapes odds
          from Hub data. Auditor caps payout concentration (Gini) with one bounded action per check.
        </p>
        <div className="w-full h-1 bg-black border-t-2 border-black mb-6"></div>
        
        {/* Sentinels Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Sentinel 1: AI Classifier */}
          <div className="flex flex-row gap-6">
            {/* Avatar */}
            <div className="w-40 h-40 flex-shrink-0 bg-[#CFCAB9] border-4 border-black rounded-lg overflow-hidden flex items-center justify-center p-2 shadow-[4px_4px_0_rgba(0,0,0,0.2)]">
              <Image 
                src="/robot.png" 
                alt="AI Classifier" 
                width={140} 
                height={140} 
                className="w-full h-full [image-rendering:pixelated] object-contain" 
              />
            </div>
            
            {/* Content */}
            <div className="flex flex-col flex-grow text-black">
              <h3 className="font-bold text-xl leading-tight mb-2">AI-Powered Volatility<br/>Regime Classifier:</h3>
              <p className="text-base leading-tight mb-2">Ingests 3 Hub signals → outputs Score 0–100.</p>
              <ul className="text-sm leading-tight mb-4 space-y-1 list-disc pl-4">
                <li>Bonded ratio Δ (x/staking)</li>
                <li>Gov activity Δ (x/gov)</li>
                <li>IBC volume Δ (relayer)</li>
              </ul>
              
              <div className="flex items-center gap-4">
                <div className="text-right text-sm font-bold leading-tight">Rule-based.<br/>Logged JSON.<br/>Auditable.</div>
                
                {/* Mini Mac Window */}
                <div className="w-28 h-20 bg-black border-2 border-black rounded-sm relative shadow-md flex flex-col overflow-hidden">
                  <div className="h-4 bg-[#EAE4D5] border-b-2 border-black flex items-center px-1 gap-1">
                    <div className="w-2 h-2 rounded-full bg-[#FF5F56] border border-black"></div>
                    <div className="w-2 h-2 rounded-full bg-[#FFBD2E] border border-black"></div>
                    <div className="w-2 h-2 rounded-full bg-[#27C93F] border border-black"></div>
                  </div>
                  <div className="flex-grow bg-black p-1 text-[8px] font-mono leading-[1.2] text-green-500">
                    <div className="text-pink-500">import mutagen</div>
                    <div className="text-yellow-400">def check():</div>
                    <div className="pl-2">if score {'>'} max:</div>
                    <div className="pl-4 text-red-500">adjust()</div>
                  </div>
                  {/* Magnifying Glass Overlay */}
                  <svg className="absolute -bottom-1 -right-1 w-12 h-12" viewBox="0 0 24 24">
                    <circle cx="10" cy="10" r="7" fill="#888" stroke="#000" strokeWidth="2" />
                    <circle cx="10" cy="10" r="5" fill="#a0d8ef" opacity="0.6" />
                    <line x1="14" y1="14" x2="22" y2="22" stroke="#000" strokeWidth="4" strokeLinecap="round" />
                    <line x1="15" y1="15" x2="21" y2="21" stroke="#666" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Sentinel 2: The Auditor */}
          <div className="flex flex-row gap-6">
            {/* Avatar */}
            <div className="w-40 h-40 flex-shrink-0 bg-[#CFCAB9] border-4 border-black rounded-lg overflow-hidden flex items-center justify-center p-2 shadow-[4px_4px_0_rgba(0,0,0,0.2)]">
              <Image 
                src="/auditor.png" 
                alt="The Auditor" 
                width={140} 
                height={140} 
                className="w-full h-full [image-rendering:pixelated] object-contain" 
              />
            </div>
            
            {/* Content */}
            <div className="flex flex-col flex-grow text-black">
              <h3 className="font-bold text-xl leading-tight mb-2">The Auditor:</h3>
              <p className="text-base leading-tight mb-2">Zero-Sum Index (Gini) every K pulls.</p>
              <p className="text-sm leading-tight mb-4">
                If Gini &gt; 0.6 → one action: fee +0.005 OR cap −2%. Hard cumulative caps. Every
                intervention logged to Dashboard.
              </p>
              
              {/* Auditor Log Terminal */}
              <div ref={scrollRef} className="w-full h-24 bg-[#111] border-4 border-[#333] p-2 custom-scroll overflow-y-auto">
                <div className="font-mono text-xs leading-tight flex flex-col gap-1">
                  {logs.map((log) => (
                    <div key={log.id} className={log.isError ? "text-[#FF5F56]" : "text-[#27C93F]"}>
                      {log.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
