"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export function FooterCTA() {
  return (
    <section className="w-full relative font-pixel overflow-hidden bg-[#EAE4D5] border-t-8 border-black py-20 mt-16 shadow-[0_16px_0_#B6B09F] z-10">
      
      {/* Background Floating Pixel Art Animation */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 overflow-hidden">
        <style>
          {`
            @keyframes floatRight {
              0% { transform: translateX(-300px); }
              100% { transform: translateX(120vw); }
            }
            @keyframes floatLeft {
              0% { transform: translateX(120vw); }
              100% { transform: translateX(-300px); }
            }
            @keyframes bobbing {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-30px); }
            }
            .animate-float-right-1 { animation: floatRight 20s linear infinite; }
            .animate-float-right-2 { animation: floatRight 25s linear infinite 10s; }
            .animate-float-left-1 { animation: floatLeft 18s linear infinite 5s; }
            .animate-float-left-2 { animation: floatLeft 22s linear infinite 15s; }
            .animate-bob { animation: bobbing 3s ease-in-out infinite; }
            .animate-bob-slow { animation: bobbing 4s ease-in-out infinite 1s; }
          `}
        </style>

        {/* Floating Mutagen moving right */}
        <div className="absolute top-[10%] left-0 animate-float-right-1">
          <div className="animate-bob">
            <Image src="/mutagen.png" alt="mutagen" width={150} height={150} className="[image-rendering:pixelated] opacity-60" />
          </div>
        </div>

        {/* Floating Robot moving left */}
        <div className="absolute top-[65%] right-0 animate-float-left-1">
          <div className="animate-bob-slow">
            <Image src="/robot.png" alt="robot" width={180} height={180} className="[image-rendering:pixelated] opacity-60 scale-x-[-1]" />
          </div>
        </div>

        {/* Floating Auditor moving right */}
        <div className="absolute top-[40%] left-0 animate-float-right-2">
          <div className="animate-bob-slow">
            <Image src="/auditor.png" alt="auditor" width={160} height={160} className="[image-rendering:pixelated] opacity-50" />
          </div>
        </div>

        {/* Floating Test Tubes moving left */}
        <div className="absolute top-[20%] right-0 animate-float-left-2">
          <div className="animate-bob">
            <Image src="/bottlelab.png" alt="bottles" width={120} height={120} className="[image-rendering:pixelated] opacity-60" />
          </div>
        </div>
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
        <Link href="/lab" className="relative w-full max-w-4xl z-10 mb-8 group block">
          <div className="absolute top-3 left-4 w-full h-full bg-white border-4 border-black group-hover:top-1 group-hover:left-1 transition-all duration-200 shadow-[8px_8px_0_#B6B09F]"></div>
          <span className="relative block w-full py-8 text-center text-3xl md:text-5xl font-header bg-[#39FF14] text-black border-4 border-black group-hover:-translate-y-1 group-hover:-translate-x-1 transition-transform duration-200">
            CONNECT WALLET & EXPERIMENT
          </span>
        </Link>

        <p className="text-sm md:text-base z-10 font-bold text-black bg-white px-6 py-2 border-2 border-black text-center">
          Bond ATOM in The Lab → trigger exposure → see your pull on the Dashboard.
        </p>

      </div>
    </section>
  );
}
