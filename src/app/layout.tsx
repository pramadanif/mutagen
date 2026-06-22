import type { Metadata } from "next";
import { VT323, Press_Start_2P } from "next/font/google";
import { WalletProvider } from "@/components/providers/WalletProvider";
import { RelayerSync } from "@/components/providers/RelayerSync";
import "./globals.css";

const vt323 = VT323({
  variable: "--font-vt323",
  subsets: ["latin"],
  weight: "400",
});

const pressStart2P = Press_Start_2P({
  variable: "--font-press-start-2p",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "MUTAGEN | The Chain-Driven Gacha",
  description: "The Chain-Driven Gacha, Reshaped by the Hub.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${vt323.variable} ${pressStart2P.variable} font-pixel text-2xl flex flex-col items-center antialiased`}
      >
        <WalletProvider>
          <RelayerSync>{children}</RelayerSync>
        </WalletProvider>
      </body>
    </html>
  );
}
