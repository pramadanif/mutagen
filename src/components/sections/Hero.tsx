import React from 'react';
import Image from 'next/image';
import { PixelButton } from '@/components/ui/PixelButton';
import { WordTypewriter } from '@/components/ui/WordTypewriter';

export function Hero() {
  return (
    <section id="hero" className="w-full relative overflow-hidden border-b-4 border-black bg-[#EAE4D5]">
      {/* Background Wall Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none flex flex-col">
         <div className="w-full h-[25%] border-b border-black/20"></div>
         <div className="w-full flex-grow flex justify-between">
           <div className="w-1/4 h-full border-r border-black/20"></div>
           <div className="w-2/4 h-full border-r border-black/20"></div>
           <div className="w-1/4 h-full"></div>
         </div>
      </div>

      {/* Floor */}
      <div className="absolute bottom-0 left-0 w-full h-16 bg-[#C0C0C0] border-t-4 border-black z-0"></div>

      <div className="relative z-10 w-full px-4 md:px-12 lg:px-24 pt-12 pb-16 flex flex-col lg:flex-row items-end justify-between gap-4 min-h-[550px]">
        
        {/* Left Column: Text, Button & Test Tubes */}
        <div className="flex flex-col justify-between h-full w-full lg:w-1/4 z-10 self-stretch">
          {/* Top text part */}
          <div className="pt-2">
            <h2 className="font-header text-2xl text-black mb-12">The Incubator</h2>
            
            <h2 className="font-header text-[1.1rem] leading-relaxed mb-4 text-black h-[120px]">
              <WordTypewriter 
                texts={[
                  "MUTAGEN:\nThe Chain-Driven Gacha,\nReshaped by the Hub.",
                  "BOND ATOM.\nTRIGGER EXPOSURE.\nCLAIM YOUR NFT.",
                  "FAIRNESS VIA AUDITOR.\nVOLATILITY VIA HUB.\n100% ON-CHAIN."
                ]}
              />
            </h2>
            <PixelButton className="px-4 py-3 w-[95%] text-[0.65rem] !bg-[#98fb98] hover:!bg-[#7cfc00]">
              INITIATE MUTAGEN EXPOSURE
            </PixelButton>
          </div>

          {/* Test Tubes at the bottom */}
          <div className="w-full flex justify-start items-end mt-8 pl-4">
            <Image 
              src="/bottlelab.png" 
              alt="Test Tube Rack" 
              width={180} 
              height={120} 
              className="[image-rendering:pixelated] object-contain" 
            />
          </div>
        </div>

        {/* Center: Giant Incubator */}
        <div className="w-full lg:w-2/4 flex flex-col justify-end items-center relative z-10">
          <div className="relative flex justify-center items-end">
            <Image 
              src="/labtube.png" 
              alt="Central Incubator Tank" 
              width={420} 
              height={480} 
              className="[image-rendering:pixelated] object-contain" 
            />
            {/* Center Button overlapping bottom of incubator */}
            <div className="absolute bottom-4 w-max">
               <PixelButton className="px-6 py-2 text-[0.7rem] animate-pulse !bg-[#98fb98] hover:!bg-[#7cfc00]">
                 INITIATE MUTAGEN EXPOSURE
               </PixelButton>
            </div>
          </div>
        </div>

        {/* Right: Pixel Scientist */}
        <div className="w-full lg:w-1/4 flex justify-end items-end relative z-10">
          <Image 
            src="/mad scientist.png" 
            alt="Mad Scientist" 
            width={260} 
            height={320} 
            className="[image-rendering:pixelated] object-contain" 
          />
        </div>
      </div>
    </section>
  );
}
