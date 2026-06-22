"use client";

import React, { useState, useEffect } from 'react';
import { PixelButton } from '@/components/ui/PixelButton';

export function Header() {
  const [showBanner, setShowBanner] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const handleConnectWallet = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsConnected(true);
    setShowBanner(true);
    
    // Hide banner after a few seconds
    setTimeout(() => {
      setShowBanner(false);
    }, 4000);
  };

  return (
    <>
      <header className="w-full bg-[#000] border-b-8 border-mutagen-shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* Glowing Logo */}
            <h1 
              className="font-header text-2xl md:text-3xl text-mutagen-green" 
              style={{ textShadow: "0 0 10px #39FF14, 0 0 20px #39FF14" }}
            >
              MUTAGEN
            </h1>
          </div>
          <nav className="hidden lg:flex gap-8 font-bold text-white text-xl tracking-wider">
            <a href="#mechanism" className="hover:text-mutagen-green transition-colors">MECHANISM</a>
            <a href="#fairness" className="hover:text-mutagen-green transition-colors">AI & FAIRNESS</a>
            <a href="#dashboard" className="hover:text-mutagen-green transition-colors">LAB DASHBOARD</a>
            <a href="#integration" className="hover:text-mutagen-green transition-colors">INTEGRATION</a>
          </nav>
          
          {!isConnected ? (
            <PixelButton onClick={handleConnectWallet} className="px-6 py-3">
              <span className="mr-2">CONNECT WALLET</span>
              {/* Pixel Hand Cursor Icon */}
              <svg width="16" height="20" viewBox="0 0 16 20" fill="#000" className="svg-pixel">
                <rect x="6" y="0" width="2" height="4"/><rect x="8" y="2" width="2" height="2"/><rect x="10" y="4" width="2" height="2"/><rect x="12" y="6" width="2" height="6"/><rect x="14" y="8" width="2" height="6"/><rect x="12" y="14" width="2" height="2"/><rect x="10" y="16" width="2" height="2"/><rect x="6" y="18" width="4" height="2"/><rect x="4" y="16" width="2" height="2"/><rect x="2" y="14" width="2" height="2"/><rect x="0" y="10" width="2" height="4"/><rect x="2" y="8" width="2" height="2"/><rect x="4" y="6" width="2" height="2"/><rect x="6" y="4" width="2" height="2"/><rect x="6" y="6" width="2" height="12" fill="#fff"/><rect x="8" y="4" width="2" height="14" fill="#fff"/><rect x="10" y="6" width="2" height="10" fill="#fff"/><rect x="12" y="8" width="2" height="6" fill="#fff"/><rect x="2" y="10" width="2" height="4" fill="#fff"/><rect x="4" y="8" width="2" height="8" fill="#fff"/>
              </svg>
            </PixelButton>
          ) : (
            <div className="text-black bg-mutagen-green px-2 py-1 font-mono tracking-widest border-2 border-black inline-flex items-center justify-center font-bold text-sm">
              0x7A...F92
            </div>
          )}
        </div>
      </header>

      {/* Floating Banner */}
      {showBanner && (
        <div 
          className="fixed top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black border-4 border-mutagen-green p-6 z-[100] font-header text-center flex flex-col gap-4 items-center transition-opacity duration-500"
          style={{ boxShadow: "10px 10px 0 rgba(57,255,20,0.5)" }}
        >
          <h2 className="text-mutagen-green text-xl animate-pulse">WALLET CONNECTED</h2>
          <div className="text-white text-sm font-mono leading-loose text-left">
            Analyzing holdings...<br/>
            {'>'} Cosmics found: <span className="text-mutagen-green">TRUE</span><br/>
            {'>'} $LAB Balance: <span className="text-mutagen-green">5,420</span><br/>
          </div>
          <div className="bg-mutagen-green text-black px-4 py-2 mt-2">RESONANCE BONUS APPLIED</div>
        </div>
      )}
    </>
  );
}
