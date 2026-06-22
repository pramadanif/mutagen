"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { PixelButton } from '@/components/ui/PixelButton';

export function Integration() {
  const [logs, setLogs] = useState<{ text: React.ReactNode; id: number }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Initial logs
    setLogs([
      { id: 1001, text: <span className="text-[#666]">Exp #1001: Bonded [100LAB], Exposure [0.5], Outcome [COMMON M1]</span> },
      { id: 1002, text: <span className="text-[#666]">Exp #1002: Bonded [200LAB], Exposure [0.6], Outcome [COMMON M1]</span> },
      { id: 1003, text: <span>Exp #1003: Bonded [500LAB], Exposure [0.9], Outcome <span className="bg-[#E6E6FA] border border-black px-1 font-bold text-[#8A2BE2]">[EPIC M3]</span></span> },
      { id: 1004, text: <span className="text-[#666]">Exp #1004: Bonded [100LAB], Exposure [0.5], Outcome [COMMON M1]</span> },
      { id: 1005, text: <span>Exp #1005: Bonded [300LAB], Exposure [0.7], Outcome <span className="bg-[#D0F0C0] border border-black px-1 font-bold text-[#228B22]">[RARE M2]</span></span> },
    ]);
  }, []);

  useEffect(() => {
    let expCount = 1006;
    const interval = setInterval(() => {
      const bondAmts = ['100LAB', '250LAB', '500LAB', '10ATOM'];
      const amt = bondAmts[Math.floor(Math.random() * bondAmts.length)];
      const exp = (Math.random() * 0.8 + 0.1).toFixed(2);
      
      const outcomes = [
          <span key="1" className="text-[#666]">[COMMON M1]</span>,
          <span key="2" className="text-[#666]">[COMMON M1]</span>,
          <span key="3" className="text-[#666]">[COMMON M1]</span>,
          <span key="4" className="text-[#666]">[COMMON M1]</span>,
          <span key="5" className="bg-[#D0F0C0] border border-black px-1 font-bold text-[#228B22]">[RARE M2]</span>,
          <span key="6" className="bg-[#D0F0C0] border border-black px-1 font-bold text-[#228B22]">[RARE M2]</span>,
          <span key="7" className="bg-[#E6E6FA] border border-black px-1 font-bold text-[#8A2BE2]">[EPIC M3]</span>
      ];
      const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
      
      const newLogText = <span>Exp #{expCount}: Bonded [{amt}], Exposure [{exp}], Outcome {outcome}</span>;
      
      setLogs(prev => {
        const newLogs = [...prev, { id: expCount, text: newLogText }];
        if (newLogs.length > 30) return newLogs.slice(newLogs.length - 30);
        return newLogs;
      });
      
      expCount++;
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <>
      <section id="integration" className="w-full">
        <div className="section-header">Integration (Odin & Scientists)</div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Odin Panel */}
          <a href="#" className="bg-white border-4 border-black p-6 shadow-pixel flex items-center gap-6 group hover:-translate-y-1 hover:shadow-[6px_6px_0_#B6B09F] transition-all cursor-pointer">
            <div className="w-24 h-24 border-4 border-black flex flex-col flex-shrink-0 bg-white">
              <div className="h-6 bg-[#DDD] border-b-4 border-black flex items-center px-2 gap-1">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-black"></div>
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-black"></div>
                <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-black"></div>
              </div>
              <div className="flex-grow flex items-center justify-center relative overflow-hidden bg-[#F0F0F0]">
                <svg viewBox="0 0 100 100" className="w-16 h-16 group-hover:scale-110 transition-transform">
                  <path d="M 10 50 Q 50 10 90 50 Q 50 90 10 50 Z" fill="#FFF" stroke="#000" strokeWidth="4"/>
                  <circle cx="50" cy="50" r="15" fill="#4169e1" stroke="#000" strokeWidth="2"/>
                  <circle cx="50" cy="50" r="6" fill="#000"/>
                  <circle cx="53" cy="47" r="2" fill="#FFF"/>
                </svg>
                <div className="absolute bottom-1 right-1 bg-white border border-black px-1 text-[8px] font-mono font-bold shadow-[1px_1px_0_#000]">
                  &lt;/&gt;
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-header text-lg mb-2 group-hover:text-mutagen-green transition-colors">Odin Scan</h3>
              <p className="text-lg leading-tight mb-2">Odin Scan watches our code.<br/>Our Auditor watches our economy.<br/>Same philosophy.</p>
              <span className="text-sm font-bold underline">Learn more about Odin repo.</span>
            </div>
          </a>

          {/* Resonance Panel */}
          <div className="bg-[#EAE4D5] border-4 border-black p-6 shadow-pixel flex items-center gap-6">
            <div className="flex items-center gap-0 flex-shrink-0 relative">
              <div className="w-20 h-20 bg-white border-4 border-black flex items-center justify-center z-10 shadow-[4px_4px_0_rgba(0,0,0,0.2)]">
                 <svg viewBox="0 0 100 100" className="w-16 h-16 svg-pixel">
                  <path d="M 20 50 Q 10 20 50 10 Q 90 20 80 50" fill="none" stroke="#ccc" strokeWidth="12" strokeLinecap="square"/>
                  <rect x="30" y="30" width="40" height="40" fill="#FAD6B1" stroke="#000" strokeWidth="4"/>
                  <rect x="25" y="45" width="50" height="15" fill="#222" stroke="#000" strokeWidth="4"/>
                  <rect x="35" y="48" width="10" height="8" fill="#39FF14"/>
                  <rect x="55" y="48" width="10" height="8" fill="#39FF14"/>
                  <rect x="40" y="70" width="20" height="5" fill="#FFF" stroke="#000" strokeWidth="2"/>
                 </svg>
              </div>
              <div className="w-16 h-16 bg-[#555] rounded-full border-4 border-black flex items-center justify-center -ml-6 z-0 shadow-[4px_4px_0_#000] relative">
                <div className="w-10 h-10 rounded-full border-2 border-[#777] flex items-center justify-center">
                  <span className="text-white font-header text-xl">$</span>
                </div>
                <div className="absolute top-2 left-2 w-3 h-3 bg-white opacity-30 rounded-full"></div>
              </div>
            </div>
            <div>
              <h3 className="font-header text-lg mb-2">Mad Scientists & $LAB.</h3>
              <p className="text-lg leading-tight">
                <span className="text-mutagen-green bg-black px-2 py-1 font-bold inline-block mb-1 shadow-[2px_2px_0_#39FF14]">Resonance Bonus:</span><br/>
                Stake Hub, hold Cosmics/ $LAB<br/>for improved odds.<br/>Use $LAB for bonding utility.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 w-full">
        {/* Lab Notebook */}
        <section className="w-full flex flex-col h-[400px]">
          <div className="bg-[#D1CBB8] border-4 border-b-0 border-black px-6 py-3 inline-block w-max self-start rounded-t-lg relative z-10 shadow-[4px_0_0_#000]">
            <h2 className="font-header text-sm">Experiment Lab Notebook</h2>
          </div>
          <div className="bg-[#EAE4D5] border-4 border-black flex-grow p-2 shadow-[8px_8px_0_#B6B09F] relative z-0">
            <div ref={scrollRef} className="bg-white border-2 border-black w-full h-full p-4 custom-scroll overflow-y-auto font-mono text-base leading-relaxed relative">
              <div className="absolute inset-0 bg-[linear-gradient(transparent_27px,_#A0C0D0_28px)] bg-[size:100%_28px] pointer-events-none opacity-50"></div>
              <div className="absolute left-10 top-0 bottom-0 w-[2px] bg-red-400 opacity-50 pointer-events-none"></div>
              
              <div className="flex flex-col gap-3 pl-12 pt-1 relative z-10">
                {logs.map((log, index) => {
                  const isNew = index === logs.length - 1 && logs.length > 5;
                  return (
                    <div key={log.id} className={isNew ? "animate-[pulse_1s_ease-in-out_1] bg-yellow-100" : ""}>
                      {log.text}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Giant CTA Panel */}
        <section className="w-full h-[400px] bg-[#EAE4D5] border-8 border-black shadow-[12px_12px_0_#000] flex flex-col items-center justify-center p-8 text-center relative overflow-hidden group">
          <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-1000">
            <svg width="100%" height="100%">
              <pattern id="checker" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <rect width="20" height="20" fill="#000" />
                <rect x="20" y="20" width="20" height="20" fill="#000" />
              </pattern>
              <rect x="0" y="0" width="100%" height="100%" fill="url(#checker)" />
            </svg>
          </div>

          <h2 className="font-header text-xl md:text-2xl mb-8 z-10 leading-relaxed bg-white border-4 border-black px-4 py-2 transform -rotate-2">
            Join the Experiment.<br/>Reshape the Gacha.
          </h2>
          
          <div className="flex items-end justify-center h-40 mb-8 z-10 border-b-4 border-black w-full pb-2">
            <Image 
              src="/4peopleinalab.png" 
              alt="Group of Adventurers and Scientists" 
              width={400} 
              height={160} 
              className="h-full w-auto [image-rendering:pixelated] object-contain" 
            />
          </div>

          <PixelButton className="px-8 py-5 text-xl z-10 w-3/4 shadow-[8px_8px_0_#000] hover:shadow-[4px_4px_0_#000]">
            CONNECT WALLET & EXPERIMENT
          </PixelButton>
          <p className="text-sm mt-4 z-10 font-bold bg-[#EAE4D5] px-2">Testnet token enables 3 advanced adventures,<br/>operation and the evident animations.</p>
        </section>
      </div>
    </>
  );
}
