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
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
  },
  manifest: '/site.webmanifest'
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
