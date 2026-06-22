"use client";

import React from 'react';
import Image from 'next/image';

export function FooterCTA() {
  return (
    <section className="w-full relative font-pixel overflow-hidden bg-[#EAE4D5] border-t-8 border-black py-20 mt-16 shadow-[0_16px_0_#B6B09F] z-10">
      
      {/* Background Pacman Animation */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <style>
            {`
              @keyframes movePacmanRight {
                0% { transform: translateX(-200px); }
                100% { transform: translateX(120vw); }
              }
              @keyframes movePacmanLeft {
                0% { transform: translateX(120vw) scaleX(-1); }
                100% { transform: translateX(-200px) scaleX(-1); }
              }
              .pacman-right-1 { animation: movePacmanRight 15s linear infinite; }
              .pacman-left-1 { animation: movePacmanLeft 22s linear infinite 5s; }
            `}
          </style>
          
          {/* Static dots grid */}
          <pattern id="pacdots" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
             <rect x="28" y="28" width="4" height="4" fill="#000" />
          </pattern>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#pacdots)" opacity="0.3" />

          {/* Top Track (Right bound) */}
          <g className="pacman-right-1">
             <svg y="10%" width="80" height="80" viewBox="0 0 100 100" className="overflow-visible">
               <path d="M 50 50 L 100 20 A 45 45 0 1 1 100 80 Z" fill="#FFBD2E" stroke="#000" strokeWidth="6">
                 <animate attributeName="d" values="M 50 50 L 100 20 A 45 45 0 1 1 100 80 Z; M 50 50 L 100 48 A 45 45 0 1 1 100 52 Z; M 50 50 L 100 20 A 45 45 0 1 1 100 80 Z" dur="0.4s" repeatCount="indefinite" />
               </path>
             </svg>
             <svg x="-90" y="10%" width="80" height="80" viewBox="0 0 100 100" className="overflow-visible">
               <path d="M 20 90 L 20 50 A 30 30 0 0 1 80 50 L 80 90 L 70 80 L 60 90 L 50 80 L 40 90 L 30 80 Z" fill="#FF5F56" stroke="#000" strokeWidth="6" />
               <circle cx="35" cy="40" r="10" fill="#FFF" stroke="#000" strokeWidth="3"/>
               <circle cx="65" cy="40" r="10" fill="#FFF" stroke="#000" strokeWidth="3"/>
               <circle cx="40" cy="40" r="4" fill="#000"/>
               <circle cx="70" cy="40" r="4" fill="#000"/>
             </svg>
          </g>

          {/* Bottom Track (Left bound) */}
          <g className="pacman-left-1">
             <svg y="75%" width="120" height="120" viewBox="0 0 100 100" className="overflow-visible">
               <path d="M 50 50 L 100 20 A 45 45 0 1 1 100 80 Z" fill="#FFBD2E" stroke="#000" strokeWidth="5">
                 <animate attributeName="d" values="M 50 50 L 100 20 A 45 45 0 1 1 100 80 Z; M 50 50 L 100 48 A 45 45 0 1 1 100 52 Z; M 50 50 L 100 20 A 45 45 0 1 1 100 80 Z" dur="0.3s" repeatCount="indefinite" />
               </path>
             </svg>
             <svg x="-100" y="75%" width="120" height="120" viewBox="0 0 100 100" className="overflow-visible">
               <path d="M 20 90 L 20 50 A 30 30 0 0 1 80 50 L 80 90 L 70 80 L 60 90 L 50 80 L 40 90 L 30 80 Z" fill="#39FF14" stroke="#000" strokeWidth="5" />
               <circle cx="35" cy="40" r="10" fill="#FFF" stroke="#000" strokeWidth="3"/>
               <circle cx="65" cy="40" r="10" fill="#FFF" stroke="#000" strokeWidth="3"/>
               <circle cx="30" cy="40" r="4" fill="#000"/>
               <circle cx="60" cy="40" r="4" fill="#000"/>
             </svg>
          </g>

        </svg>
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto flex flex-col items-center justify-center text-center px-4">
        
        {/* Title */}
        <h2 className="font-header text-4xl md:text-6xl lg:text-7xl mb-16 leading-tight text-black bg-[#F5F2EB] border-8 border-black px-12 py-6 shadow-[16px_16px_0_#000] transform -rotate-2 hover:rotate-0 transition-transform duration-300">
          Join the Experiment.<br/>Reshape the Gacha.
        </h2>
        
        {/* Giant Image Container */}
        <div className="flex items-end justify-center w-full max-w-[1200px] h-[300px] md:h-[400px] lg:h-[500px] mb-12 border-b-8 border-black pb-4 relative group cursor-pointer">
          <Image 
            src="/4peopleinalab.png" 
            alt="Group of Adventurers and Scientists" 
            fill
            className="[image-rendering:pixelated] object-contain object-bottom group-hover:scale-105 transition-transform duration-500 origin-bottom" 
          />
        </div>

        {/* Call To Action Button */}
        <div className="relative w-full max-w-4xl z-10 mb-8 group cursor-pointer">
          <div className="absolute top-3 left-4 w-full h-full bg-white border-4 border-black group-hover:top-1 group-hover:left-1 transition-all duration-200 shadow-[8px_8px_0_#B6B09F]"></div>
          <button className="relative w-full py-8 text-3xl md:text-5xl font-header bg-[#39FF14] text-black border-4 border-black group-hover:-translate-y-1 group-hover:-translate-x-1 transition-transform duration-200">
            CONNECT WALLET & EXPERIMENT
          </button>
        </div>

        {/* Small text block */}
        <p className="text-sm md:text-xl z-10 font-bold text-black bg-white px-6 py-2 border-2 border-black">
          Testnet token enables 3 advanced adventures,<br/>operation and the evident animations.
        </p>

      </div>
    </section>
  );
}
