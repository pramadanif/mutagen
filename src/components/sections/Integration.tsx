"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { PixelButton } from '@/components/ui/PixelButton';

export function Integration() {
  const [logs, setLogs] = useState<{ text: React.ReactNode; id: number }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const idCounter = useRef(2000);
  
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
        const newLogs = [...prev, { id: ++idCounter.current, text: newLogText }];
        if (newLogs.length > 30) return newLogs.slice(-30);
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
    <section id="integration" className="w-full relative font-pixel">
      
      {/* Top Box: Integration */}
      <div className="w-full bg-[#F5F2EB] border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,1)] mb-8">
        <div className="p-4 border-b-4 border-black flex items-center bg-[#F5F2EB]">
          <h2 className="font-header text-xl font-bold">Integration</h2>
          <span className="text-sm ml-2 font-bold">(Odin & Scientists)</span>
        </div>
        
        <div className="flex flex-col md:flex-row items-stretch divide-y-4 md:divide-y-0 md:divide-x-4 divide-black">
          {/* Odin */}
          <div className="flex-1 flex items-start gap-4 p-6">
             {/* Icon */}
             <div className="w-24 border-4 border-black flex flex-col flex-shrink-0 bg-white shadow-[4px_4px_0_#000] relative mt-1">
               <div className="h-4 bg-[#EAE4D5] border-b-4 border-black flex items-center px-1 gap-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-[#FF5F56] border border-black"></div>
                 <div className="w-1.5 h-1.5 rounded-full bg-[#FFBD2E] border border-black"></div>
                 <div className="w-1.5 h-1.5 rounded-full bg-[#27C93F] border border-black"></div>
               </div>
               <div className="flex-grow flex items-center justify-center p-2 bg-black">
                 <svg viewBox="0 0 100 100" className="w-12 h-12">
                   <path d="M 10 50 Q 50 10 90 50 Q 50 90 10 50 Z" fill="#FFF" stroke="#FFF" strokeWidth="4"/>
                   <circle cx="50" cy="50" r="15" fill="#4169e1"/>
                   <circle cx="50" cy="50" r="6" fill="#000"/>
                 </svg>
               </div>
               <div className="absolute -bottom-3 -right-3 bg-[#EAE4D5] border-2 border-black w-8 h-10 flex items-center justify-center shadow-[2px_2px_0_#000]">
                 <svg viewBox="0 0 24 24" className="w-5 h-5">
                   <path d="M 4 12 Q 12 4 20 12 Q 12 20 4 12 Z" fill="none" stroke="#000" strokeWidth="2"/>
                   <circle cx="12" cy="12" r="3" fill="#000"/>
                 </svg>
               </div>
             </div>
             
             {/* Text */}
             <div className="text-black ml-2">
               <h3 className="font-header text-base mb-2">Odin Scan</h3>
               <p className="text-sm font-bold leading-relaxed mb-3">Odin Scan watches our code.<br/>Our Auditor watches our economy.<br/>Same philosophy.</p>
               <span className="text-xs font-bold underline cursor-pointer hover:text-blue-600">Learn more about Odin repo.</span>
             </div>
          </div>
          
          {/* Scientists */}
          <div className="flex-1 flex items-start gap-4 p-6">
             {/* Avatar: Mad Scientist + Coin */}
             <div className="flex items-center gap-2 flex-shrink-0 mt-1">
               <div className="relative w-16 h-20">
                 <Image src="/mad scientist.png" alt="Scientist" fill className="[image-rendering:pixelated] object-contain" />
               </div>
               <div className="w-10 h-10 bg-[#888] rounded-full border-2 border-black flex items-center justify-center shadow-[inset_-2px_-2px_0_rgba(0,0,0,0.5)]">
                 <div className="w-7 h-7 rounded-full border border-[#555] flex items-center justify-center bg-[#666]">
                   <span className="text-white font-header text-sm">$</span>
                 </div>
               </div>
             </div>
             
             {/* Text */}
             <div className="text-black">
               <h3 className="font-header text-base mb-2">Mad Scientists & $LAB.</h3>
               <p className="text-sm font-bold leading-relaxed">
                 Resonance Bonus:<br/>
                 Stake Hub, hold Cosmics/ $LAB<br/>for improved odds.<br/>Use $LAB for bonding utility.
               </p>
             </div>
          </div>
        </div>
      </div>

      {/* Lab Notebook */}
      <div className="w-full max-w-4xl mx-auto mt-8 bg-[#EAE4D5] border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,1)] flex flex-col h-[500px]">
        <div className="p-3 border-b-4 border-black bg-[#EAE4D5]">
          <h2 className="font-header text-lg font-bold">Experiment Lab Notebook</h2>
        </div>
        
        <div className="bg-white border-b-4 border-black flex-grow p-4 custom-scroll overflow-y-auto font-mono text-xs leading-loose text-black font-bold relative m-4 shadow-[4px_4px_0_#000]">
          <div className="flex flex-col gap-2">
            {logs.map((log) => (
              <div key={log.id} className="border-b border-gray-100 pb-2">
                {log.text}
              </div>
            ))}
            <div className="text-gray-400">...</div>
          </div>
        </div>
      </div>
    </section>
  );
}
