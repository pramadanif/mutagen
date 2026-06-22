import React from 'react';
import Image from 'next/image';
import { MUTATION_IMAGES } from '@/lib/assets';
import { MutationTierShowcase } from '@/components/ui/MutationTierShowcase';

const LOOT_ROWS = [
  { tier: 'COMMON' as const, label: 'COMMON', bars: '+++++---' },
  { tier: 'RARE' as const, label: 'RARE', bars: '+++-----' },
  { tier: 'LEGENDARY' as const, label: 'LEGENDARY', bars: '++------' },
];

export function Mechanism() {
  return (
    <section id="mechanism" className="w-full bg-transparent border-b-4 border-black py-16 overflow-x-auto relative font-pixel">
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <h2 className="text-4xl font-bold font-header text-black">MECHANISM</h2>
        <p className="text-lg font-bold text-black mt-2 mb-3">(The Cycle)</p>
        <p className="text-base max-w-3xl leading-relaxed mb-4">
          Four steps. Hub data feeds step 3 — loot odds rescale before every pull. Follow arrows:
          bond tokens → trigger exposure → odds shift from Regime Score → mint Mutation NFT.
        </p>
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <span className="bg-[#D0F0C0] border-2 border-black px-2 py-1">① Bond</span>
          <span className="bg-[#FFF3CD] border-2 border-black px-2 py-1">② Trigger</span>
          <span className="bg-[#E6E6FA] border-2 border-black px-2 py-1">③ Odds Rescale ← Hub</span>
          <span className="bg-[#F59E0B] border-2 border-black px-2 py-1">④ Mint NFT</span>
        </div>
      </div>
      <div className="w-[1300px] mx-auto relative h-[900px] shrink-0">
        {/* SVG Arrows Layer */}
        <svg viewBox="0 0 1300 900" className="absolute inset-0 w-full h-full z-0 pointer-events-none">
           {/* Define Arrow Styles */}
           <g fill="#D1CBB8" stroke="#000" strokeWidth="4">
             {/* 1 -> 2 */}
             <path d="M 330 310 L 390 310 L 390 300 L 410 320 L 390 340 L 390 330 L 330 330 Z" />
             {/* 2 -> 3 */}
             <path d="M 630 310 L 660 310 L 660 300 L 680 320 L 660 340 L 660 330 L 630 330 Z" />
             {/* 1 -> Incubator */}
             <path d="M 190 380 L 190 660 L 310 660 L 310 650 L 330 670 L 310 690 L 310 680 L 210 680 L 210 380 Z" />
             {/* Incubator -> 4 */}
             <path d="M 630 660 L 710 660 L 710 650 L 730 670 L 710 690 L 710 680 L 630 680 Z" />
             {/* 4 -> 3 */}
             <path d="M 790 560 L 790 470 L 780 470 L 800 450 L 820 470 L 810 470 L 810 560 Z" />
           </g>

           {/* Arrow Decors */}
           <g fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
             <path d="M 340 315 L 345 320 L 340 325 M 360 315 L 365 320 L 360 325 M 380 315 L 385 320 L 380 325" />
             <path d="M 640 315 L 645 320 L 640 325 M 655 315 L 660 320 L 655 325" />
             <path d="M 195 430 L 200 435 L 205 430 M 195 480 L 200 485 L 205 480 M 195 530 L 200 535 L 205 530 M 240 665 L 245 670 L 240 675 M 270 665 L 275 670 L 270 675" />
             <path d="M 650 665 L 655 670 L 650 675 M 680 665 L 685 670 L 680 675" />
             <path d="M 795 530 L 800 525 L 805 530 M 795 500 L 800 495 L 805 500" />
           </g>

           {/* Data Lines 3 -> Atom */}
           <g stroke="#888" strokeWidth="2" strokeDasharray="6 6" className="data-line-right">
             <path d="M 1080 230 L 1120 230" />
             <path d="M 1080 260 L 1120 260" />
             <path d="M 1080 290 L 1120 290" />
           </g>
        </svg>

        {/* Node 1: Bond */}
        <div className="absolute z-10 flex flex-col items-center w-64" style={{ left: '200px', top: '250px', transform: 'translate(-50%, -50%)' }}>
          <Image src="/pouringlab.png" alt="Bond" width={160} height={180} className="[image-rendering:pixelated] object-contain rotate-[-10deg] mb-6" />
          <div className="bg-[#EAE4D5] border-4 border-black px-4 py-3 text-center text-lg font-bold shadow-[4px_4px_0_#000] w-full text-black">
            <span className="bg-black text-white w-6 h-6 inline-flex items-center justify-center rounded-full mr-2 text-sm">1</span>
            Bond Testnet<br/>Token / $LAB
          </div>
        </div>

        {/* Node 2: Trigger */}
        <div className="absolute z-10 flex flex-col items-center w-64" style={{ left: '520px', top: '250px', transform: 'translate(-50%, -50%)' }}>
          <Image src="/scientist pull lever.png" alt="Trigger" width={180} height={200} className="[image-rendering:pixelated] object-contain mb-4" />
          <div className="text-center text-lg font-bold w-full text-black">
            <span className="bg-black text-white w-6 h-6 inline-flex items-center justify-center rounded-full mr-2 text-sm">2</span>
            Trigger Mutagen<br/>Exposure
          </div>
        </div>

        {/* Node 3: Loot Table */}
        <div className="absolute z-10 flex flex-col items-center" style={{ left: '880px', top: '260px', transform: 'translate(-50%, -50%)' }}>
          <div className="bg-[#EAE4D5] border-4 border-black p-5 w-[380px] shadow-[4px_4px_0_#000]">
            <div className="flex items-center mb-6 border-b-4 border-black pb-3 text-black">
              <span className="bg-black text-white w-6 h-6 inline-flex items-center justify-center rounded-full mr-2 text-sm">3</span>
              <h3 className="font-bold text-xl leading-tight">Loot Table Odds<br/>Rescaled</h3>
            </div>
            <div className="text-base font-mono space-y-2 bg-[#D1CBB8] p-4 border-2 border-[rgba(0,0,0,0.2)] shadow-inner text-black">
              {LOOT_ROWS.map((row) => (
                <div key={row.tier} className="flex items-center gap-2 border-b border-dashed border-gray-500 pb-2">
                  <div className="w-8 h-8 shrink-0 bg-white border border-black p-0.5">
                    <Image
                      src={MUTATION_IMAGES[row.tier]}
                      alt={row.label}
                      width={28}
                      height={28}
                      className="[image-rendering:pixelated] object-contain w-full h-auto"
                    />
                  </div>
                  <span className="flex-1 text-sm font-bold">{row.label}</span>
                  <span className="text-green-600 font-bold text-xs">{row.bars}</span>
                </div>
              ))}
              <p className="text-[10px] mt-2 opacity-70">Weights shift with Regime Score (CALM → TURBULENT)</p>
            </div>
          </div>
        </div>

        {/* Atom */}
        <div className="absolute z-10 flex flex-col items-center" style={{ left: '1180px', top: '260px', transform: 'translate(-50%, -50%)' }}>
          <div className="w-32 h-32 rounded-full border-4 border-[#2c1d45] bg-[#1a1130] flex items-center justify-center mb-4 shadow-[4px_4px_0_#000]">
            <svg viewBox="0 0 100 100" className="w-28 h-28 animate-spin" style={{ animationDuration: '10s' }}>
              <ellipse cx="50" cy="50" rx="40" ry="12" fill="none" stroke="#8a2be2" strokeWidth="2" transform="rotate(30 50 50)" />
              <ellipse cx="50" cy="50" rx="40" ry="12" fill="none" stroke="#4169e1" strokeWidth="2" transform="rotate(-30 50 50)" />
              <ellipse cx="50" cy="50" rx="40" ry="12" fill="none" stroke="#9370db" strokeWidth="2" transform="rotate(90 50 50)" />
              <circle cx="50" cy="50" r="6" fill="#FFF" />
            </svg>
          </div>
          <div className="text-center font-bold text-sm w-max text-black">
            Volatility<br/>Regime Score<br/>(0-100)
          </div>
        </div>

        {/* Incubator */}
        <div className="absolute z-10 flex flex-col items-center" style={{ left: '480px', top: '650px', transform: 'translate(-50%, -50%)' }}>
          <Image src="/labtube.png" alt="Incubator" width={280} height={320} className="[image-rendering:pixelated] object-contain" />
        </div>

        {/* Node 4: Mint NFT */}
        <div className="absolute z-10 flex flex-col items-center" style={{ left: '800px', top: '650px', transform: 'translate(-50%, -50%)' }}>
          <div className="text-center text-lg font-bold w-max mb-4 text-black">
            <span className="bg-black text-white w-6 h-6 inline-flex items-center justify-center rounded-full mr-2 text-sm">4</span>
            Mint Mutation NFT
          </div>
          <MutationTierShowcase size="sm" />
        </div>

        {/* Antenna (Scientist) */}
        <div className="absolute z-10 flex flex-col items-center" style={{ left: '1100px', top: '650px', transform: 'translate(-50%, -50%)' }}>
          <div className="text-center text-sm font-bold w-max mb-4 text-black">
            Specialized<br/>data-antenna
          </div>
          <Image src="/antena.png" alt="Antenna" width={160} height={180} className="[image-rendering:pixelated] object-contain" />
        </div>

      </div>
    </section>
  );
}
