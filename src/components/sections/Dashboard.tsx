"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

export function Dashboard() {
  const [histHeights, setHistHeights] = useState([20, 45, 80, 60, 50, 30, 15]);
  const [gaugeRotation, setGaugeRotation] = useState(10);
  const [gaugeLogs, setGaugeLogs] = useState<{ text: string; isError: boolean; id: number }[]>([]);
  const [hubData, setHubData] = useState({ bond: "0.00", prop: 12, ibc: "+0.00" });
  const [wavePath, setWavePath] = useState("M0 25 Q 10 5, 20 25 T 40 25 T 60 25 T 80 25 T 100 25 T 120 25 T 140 25 T 160 25 T 180 25 T 200 25");
  const idCounter = useRef(0);

  // Histogram Animation
  useEffect(() => {
    const interval = setInterval(() => {
      setHistHeights(prev => prev.map(h => {
        let newH = h + (Math.random() * 40 - 20);
        if (newH > 95) newH = 95;
        if (newH < 10) newH = 10;
        return newH;
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Gauge & Log Animation
  useEffect(() => {
    const interval = setInterval(() => {
      setGaugeRotation(prev => {
        let targetRotation = (Math.random() * 160) - 80; 
        const nextRot = prev + (targetRotation - prev) * 0.3;
        
        let statusMsg = "";
        let isError = false;
        let val = Math.abs(nextRot);
        
        if (nextRot > 50 || nextRot < -50) {
          isError = true;
          statusMsg = `[ALERT] Index deviance: ${val.toFixed(1)}%`;
        } else {
          statusMsg = `[OK] Index stable at ${val.toFixed(1)}%`;
        }

        setGaugeLogs(logs => {
          const newLogs = [...logs, { text: statusMsg, isError, id: ++idCounter.current }];
          if (newLogs.length > 5) return newLogs.slice(-5);
          return newLogs;
        });

        return nextRot;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Hub Pulse Animation
  useEffect(() => {
    const interval = setInterval(() => {
      const bondVal = (Math.random() * 0.5 + 0.1).toFixed(3);
      const ibcValFloat = (Math.random() * 5 - 2);
      const ibcVal = (ibcValFloat > 0 ? '+' : '') + ibcValFloat.toFixed(2);
      
      setHubData(prev => ({
        bond: bondVal,
        prop: Math.random() > 0.7 ? prev.prop + 1 : prev.prop,
        ibc: ibcVal
      }));

      const waveComplexity = Math.floor(Math.random() * 3) + 1;
      let newPath = "M0 25";
      for(let i=10; i<=200; i+=10) {
          let yOffset = (i % (20 * waveComplexity) === 0) ? 25 : (Math.random() > 0.5 ? 5 : 45);
          newPath += ` T ${i} ${yOffset}`;
      }
      setWavePath(newPath);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="dashboard" className="w-full relative font-pixel mt-12">
      <div className="w-full">
        
        {/* Header */}
        <div className="flex items-end mb-2">
          <h2 className="font-header text-3xl font-bold">Lab Dashboard</h2>
          <span className="text-xl ml-2 font-bold mb-1">(Visual Proof)</span>
        </div>
        <p className="text-sm mb-4 leading-relaxed max-w-2xl">
          Every fairness claim maps to something on screen. Silver bars = Monte Carlo
          pre-seed (1000+ pulls). Green overlay = your real pulls. Gauge + log = Auditor actions.
        </p>
        <div className="w-full h-1 bg-black border-t-2 border-black mb-6"></div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Panel 1: Histogram */}
          <div className="bg-[#F8F9FA] border-4 border-black p-6 flex flex-col items-center relative shadow-[inset_0_0_20px_rgba(0,0,0,0.02)]">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_#000_1px,_transparent_1px)] bg-[size:10px_10px]"></div>
            <h3 className="font-bold text-lg text-center mb-6 z-10 leading-tight">Real-Time Payout<br/>Histogram</h3>
            
            {/* Histogram Graph */}
            <div className="w-full h-40 border-l-4 border-b-4 border-black flex items-end justify-between pb-1 px-2 relative z-10">
              <div className="absolute top-[25%] left-0 w-full h-[1px] bg-black opacity-20"></div>
              <div className="absolute top-[50%] left-0 w-full h-[1px] bg-black opacity-20"></div>
              <div className="absolute top-[75%] left-0 w-full h-[1px] bg-black opacity-20"></div>
              
              {histHeights.map((h, i) => (
                <div key={i} className="w-6 bg-[#C0C0C0] border-2 border-black transition-all duration-700 ease-in-out relative group" style={{ height: `${h}%` }}>
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-1 hidden group-hover:block z-20">
                    {Math.round(h)}%
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-center mt-6 font-bold z-10">Pre-seeded with Monte Carlo<br/>simulation for fairness proof.</p>
          </div>

          {/* Panel 2: Gauge & Log */}
          <div className="bg-[#F8F9FA] border-4 border-black p-6 flex flex-col items-center relative shadow-[inset_0_0_20px_rgba(0,0,0,0.02)]">
            <h3 className="font-bold text-lg text-center mb-6 leading-tight">Zero-Sum Index Gauge<br/>+ Intervention Log.</h3>
            
            {/* Physical Gauge Design */}
            <div className="relative w-40 mb-6 flex justify-center">
              <Image 
                src="/speedometer.png" 
                alt="Zero-Sum Index Gauge" 
                width={160} 
                height={160} 
                className="w-full h-auto [image-rendering:pixelated] object-contain" 
              />
            </div>

            {/* Mini Terminal inside panel */}
            <div className="w-full h-24 bg-black border-4 border-[#333] p-2 mt-auto overflow-hidden">
              <div className="font-mono text-xs leading-tight flex flex-col gap-1 justify-end h-full">
                {gaugeLogs.map(log => (
                  <div key={log.id} className={log.isError ? "text-[#FF5F56]" : "text-[#27C93F]"}>{log.text}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Panel 3: Hub Pulse */}
          <div className="bg-[#F8F9FA] border-4 border-black p-6 flex flex-col relative shadow-[inset_0_0_20px_rgba(0,0,0,0.02)]">
             <div className="absolute inset-0 opacity-5 bg-[linear-gradient(0deg,_transparent_24%,_#000_25%,_#000_26%,_transparent_27%,_transparent_74%,_#000_75%,_#000_76%,_transparent_77%,_transparent),_linear-gradient(90deg,_transparent_24%,_#000_25%,_#000_26%,_transparent_27%,_transparent_74%,_#000_75%,_#000_76%,_transparent_77%,_transparent)] bg-[size:40px_40px]"></div>
            
            <h3 className="font-bold text-lg text-center mb-6 z-10 leading-tight">Hub Pulse.</h3>
            
            <div className="flex justify-between text-sm font-bold mb-6 z-10">
              <div className="leading-relaxed">
                Hub Values:<br/>
                Bonded Ratio Δ,<br/>
                Active Proposals,
              </div>
              <div className="text-right leading-relaxed text-[#27C93F]">
                Radioactive Δ<br/>
                Active<br/>
                IBC Volume Δ.
              </div>
            </div>

            <div className="text-sm font-bold mb-4 z-10 leading-relaxed">
              Live Hub Data:<br/>
              Bonded Ratio Δ,<br/>
              Active Proposals,<br/>
              IBC Volume Δ.
            </div>
            
            {/* Bottom Graphic: Scientist monitoring lines */}
            <div className="mt-auto flex justify-between items-end relative h-24 z-10">
              <div className="w-1/2 h-full flex items-center overflow-hidden relative">
                <svg className="w-[200%] h-16 opacity-50" viewBox="0 0 200 50">
                  <path d={wavePath} fill="none" stroke="#27C93F" strokeWidth="2" style={{ animation: 'scrollWave 2s linear infinite' }}/>
                  <path d="M0 40 Q 20 40, 40 40 T 80 40 T 120 40 T 160 40 T 200 40" fill="none" stroke="#FFBD2E" strokeWidth="1" style={{ animation: 'scrollWave 3s linear infinite' }}/>
                  <path d="M0 10 Q 30 10, 60 10 T 120 10 T 180 10 T 200 10" fill="none" stroke="#FF5F56" strokeWidth="1" style={{ animation: 'scrollWave 4s linear infinite' }}/>
                </svg>
                <style>{`
                  @keyframes scrollWave { from { transform: translateX(0); } to { transform: translateX(-50%); } }
                `}</style>
              </div>

              <Image 
                src="/antena.png" 
                alt="Hub Pulse Data Receiver" 
                width={80} 
                height={96} 
                className="w-20 h-24 [image-rendering:pixelated] object-contain" 
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
