"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useChain } from "@cosmos-kit/react";
import { PixelButton } from "@/components/ui/PixelButton";

const NAV_LINKS = [
  { href: "/lab", label: "THE LAB" },
  { href: "/dashboard", label: "DASHBOARD" },
  { href: "/notebook", label: "NOTEBOOK" },
  { href: "/mutations", label: "MUTATIONS" },
  { href: "/how-it-works", label: "HOW IT WORKS" },
];

export function Header() {
  const pathname = usePathname();
  const { address, walletRepo, disconnect, isWalletConnected, getOfflineSigner } =
    useChain("cosmoshub-testnet");
  const [showBanner, setShowBanner] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [connectError, setConnectError] = useState("");

  const handleConnect = async (e: React.MouseEvent) => {
    e.preventDefault();
    setConnectError("");
    try {
      if (isWalletConnected) {
        await disconnect();
        return;
      }

      if (typeof window !== "undefined" && !("keplr" in window)) {
        setConnectError("Install Keplr extension first.");
        window.open("https://www.keplr.app/download", "_blank", "noopener,noreferrer");
        return;
      }

      await walletRepo.connect("keplr-extension", true);
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 4000);
    } catch {
      setConnectError("Keplr connection rejected or failed.");
    }
  };

  const shortAddr = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  return (
    <>
      <header className="w-full bg-[#000] border-b-8 border-mutagen-shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center gap-4">
          <Link href="/" className="shrink-0 relative">
            {/* Base glowing text */}
            <h1
              className="font-header text-xl md:text-2xl text-mutagen-green"
              style={{ textShadow: "0 0 10px #39FF14, 0 0 20px #39FF14" }}
            >
              MUTAGEN
            </h1>
            {/* Shining overlay text */}
            <h1
              className="font-header text-xl md:text-2xl absolute top-0 left-0 pointer-events-none animate-shine-text"
              style={{
                background: "linear-gradient(120deg, transparent 30%, rgba(255, 255, 255, 0.9) 50%, transparent 70%)",
                backgroundSize: "200% 100%",
                WebkitBackgroundClip: "text",
                color: "transparent"
              }}
            >
              MUTAGEN
            </h1>
          </Link>

          <nav className="hidden xl:flex gap-6 font-bold text-white text-base tracking-wider">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`hover:text-mutagen-green transition-colors ${
                  pathname === link.href ? "text-mutagen-green" : ""
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="xl:hidden text-white font-header text-xs border-2 border-white px-2 py-1"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              MENU
            </button>

            {!isWalletConnected ? (
              <PixelButton onClick={handleConnect} className="px-4 py-2 text-[0.65rem]">
                CONNECT
              </PixelButton>
            ) : (
              <button
                type="button"
                onClick={handleConnect}
                className="text-black bg-mutagen-green px-2 py-1 font-mono tracking-widest border-2 border-black font-bold text-xs hover:bg-[#5cff42]"
              >
                {shortAddr}
              </button>
            )}
          </div>
        </div>

        {mobileOpen && (
          <nav className="xl:hidden border-t-4 border-mutagen-shadow px-4 py-3 flex flex-col gap-3 bg-black">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`font-bold text-white text-lg ${
                  pathname === link.href ? "text-mutagen-green" : ""
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="font-bold text-white text-lg opacity-60"
            >
              HOME
            </Link>
          </nav>
        )}
      </header>

      {connectError && (
        <div className="fixed top-20 right-4 z-[100] bg-black border-2 border-mutagen-red text-mutagen-red px-3 py-2 text-sm font-bold max-w-xs">
          {connectError}
        </div>
      )}

      {showBanner && isWalletConnected && (
        <div
          className="fixed top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black border-4 border-mutagen-green p-6 z-[100] font-header text-center flex flex-col gap-4 items-center"
          style={{ boxShadow: "10px 10px 0 rgba(57,255,20,0.5)" }}
        >
          <h2 className="text-mutagen-green text-xl animate-pulse">WALLET CONNECTED</h2>
          <div className="text-white text-sm font-mono leading-loose">
            Address: {shortAddr}
          </div>
        </div>
      )}
    </>
  );
}
