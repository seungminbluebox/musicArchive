import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AudioProvider } from "@/context/AudioContext";
import GlobalProgressBar from "@/components/GlobalProgressBar";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Music Archive",
  description: "A curated digital music collection",
  icons: {
    icon: "/favicon.ico",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} bg-[#0a0a0c] text-white min-h-screen selection:bg-neutral-800`}
      >
        <AudioProvider>
          <GlobalProgressBar />
          <main className="relative z-10">{children}</main>

          {/* Background Elements */}
          <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
            <svg className="absolute inset-0 w-full h-full opacity-30 mix-blend-overlay">
              <filter id="noiseFilter">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.65"
                  numOctaves="3"
                  stitchTiles="stitch"
                />
              </filter>
              <rect width="100%" height="100%" filter="url(#noiseFilter)" />
            </svg>
          </div>
        </AudioProvider>
      </body>
    </html>
  );
}
