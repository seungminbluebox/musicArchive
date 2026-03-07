"use client";

import { motion } from "framer-motion";
import { useAudio } from "@/context/AudioContext";

export default function GlobalProgressBar() {
  const { progress, currentSong } = useAudio();

  if (!currentSong) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-[3px] z-[100] bg-white/5 pointer-events-none">
      <motion.div
        className="h-full shadow-[0_0_15px_rgba(255,255,255,0.4)]"
        style={{
          backgroundColor: currentSong.themeAccent || "#e63946",
        }}
        initial={false}
        animate={{ width: `${progress}%` }}
        transition={{ type: "tween", ease: "linear" }}
      />
    </div>
  );
}
