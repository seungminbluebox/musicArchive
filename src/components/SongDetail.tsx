"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Play as PlayIcon,
  Pause as PauseIcon,
  ChevronLeft as BackIcon,
  ArrowUp as UpIcon,
  Music as MusicIcon,
} from "lucide-react";

import { useAudio } from "@/context/AudioContext";
import { Song, Track } from "@/types/song";

export default function SongDetail({ song }: { song: Song }) {
  const { currentSong, isPlaying, playSong, pauseAudio, progress, duration } =
    useAudio();
  const [isRotating, setIsRotating] = useState(false);
  const [activeTrack, setActiveTrack] = useState<Track | null>(
    song.tracks?.[0] || null,
  );
  const [showTag, setShowTag] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Function to format seconds to mm:ss
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // 1. Scroll Progress Tracking
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Smooth spring for scroll progress to give "physical weight"
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // 2. Parallax & Transform Values (Subtle movement)
  const heroOpacity = useTransform(smoothProgress, [0, 0.15], [1, 0]);
  const heroY = useTransform(smoothProgress, [0, 0.15], [0, -50]);

  // Mesh Gradient intensity/position change
  const meshOpacity = useTransform(smoothProgress, [0, 1], [0.4, 0.2]);

  // Log (Stagger/Typing feel)
  const logOpacity = useTransform(smoothProgress, [0.3, 0.5], [0, 1]);
  const logY = useTransform(smoothProgress, [0.3, 0.5], [30, 0]);

  // Track switching logic based on single song or tracks array
  const currentDisplayTitle = activeTrack?.title || song.title;
  const currentDisplayLyrics =
    activeTrack?.highlightLyrics || song.highlightLyrics;
  const currentAudioSrc = activeTrack?.audioSrc || song.audioSrc;

  // Sync with Audio Provider
  useEffect(() => {
    // If tracks exist and we have a current song in provider, sync active track
    if (song.tracks && currentSong) {
      const match = song.tracks.find(
        (t) => t.audioSrc === currentSong.audioSrc,
      );
      if (match) setActiveTrack(match);
    }
  }, [currentSong, song.tracks]);

  useEffect(() => {
    // 자동 재생 로직: 앨범(tracks)이든 싱글이든 해당 페이지 진입 시 첫 곡 재생
    if (currentSong?.id !== song.id) {
      if (song.tracks && song.tracks.length > 0) {
        const firstTrack = song.tracks[0];
        playSong({
          ...song,
          title: firstTrack.title,
          audioSrc: firstTrack.audioSrc,
          highlightLyrics: firstTrack.highlightLyrics,
        });
        setActiveTrack(firstTrack);
      } else {
        playSong(song);
      }
    }
  }, [song, playSong, currentSong?.id]);

  useEffect(() => {
    setIsRotating(isPlaying && currentSong?.id === song.id);
  }, [isPlaying, currentSong, song.id]);

  // Handle auto-playing next track when current one ends
  useEffect(() => {
    if (!isPlaying && progress === 0 && song.tracks && activeTrack) {
      const currentIndex = song.tracks.findIndex(
        (t) => t.audioSrc === activeTrack.audioSrc,
      );

      if (currentIndex !== -1 && currentIndex < song.tracks.length - 1) {
        const nextTrack = song.tracks[currentIndex + 1];
        playSong({
          ...song,
          title: nextTrack.title,
          audioSrc: nextTrack.audioSrc,
          highlightLyrics: nextTrack.highlightLyrics,
        });
        setActiveTrack(nextTrack);
      }
    }
  }, [isPlaying, progress, song.tracks, activeTrack, song, playSong]);

  const handleTogglePlay = async (trackOverride?: Track) => {
    const trackToPlay = trackOverride || activeTrack;

    // 앨범 내 다른 트랙을 클릭했는지 확인
    const isDifferentTrack =
      trackOverride && currentSong?.audioSrc !== trackOverride.audioSrc;

    if (
      !isDifferentTrack &&
      isPlaying &&
      (currentSong?.audioSrc === trackToPlay?.audioSrc ||
        currentSong?.id === song.id)
    ) {
      // 앨범 내 리스트 버튼 클릭 시 중지 기능 제거 (재생 중인 곡을 다시 누르면 아무 동작 안 함)
      if (trackOverride) return;

      // 메인 재생 버튼(하단 큰 버튼) 클릭 시에만 일시 정지 허용
      await pauseAudio();
    } else {
      if (trackOverride && song.tracks) {
        // 앨범 내 특정 트랙 실행
        playSong({
          ...song,
          title: trackOverride.title,
          audioSrc: trackOverride.audioSrc,
          highlightLyrics: trackOverride.highlightLyrics,
        });
        setActiveTrack(trackOverride);
      } else if (!trackOverride && activeTrack && song.tracks) {
        // 메인 재생 버튼 클릭 시 현재 활성화된 트랙 재생
        playSong({
          ...song,
          title: activeTrack.title,
          audioSrc: activeTrack.audioSrc,
          highlightLyrics: activeTrack.highlightLyrics,
        });
      } else {
        // 싱글 곡 재생
        playSong(song);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen transition-colors duration-1000"
      style={{ backgroundColor: song.themeBase }}
    >
      {/* 1. STICKY BACKGROUND & MESH */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full blur-[150px]"
          style={{ background: song.themeSub, opacity: meshOpacity }}
        />
        <motion.div
          className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full blur-[120px]"
          style={{ background: song.themeAccent, opacity: meshOpacity }}
        />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      {/* 2. FIXED HEADER/NAVIGATION */}
      <div className="fixed top-8 left-8 z-50 flex flex-col gap-6">
        <Link href="/" className="flex items-center gap-4 group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-purple-600 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
          <h1 className="text-xl font-black uppercase tracking-tighter text-white/50 group-hover:text-white transition-colors">
            Music<span className="text-neutral-500">Archive</span>
          </h1>
        </Link>
      </div>

      {/* 3. HERO SECTION (LP & PLAYER) */}
      <section className="relative h-screen w-full flex items-center justify-center z-20">
        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="w-full max-w-6xl flex flex-col items-center px-8"
        >
          {/* LP Visuals - Centered and Elegant */}
          <div className="relative w-72 md:w-96 aspect-square mb-12 flex items-center justify-center">
            <motion.div
              className="absolute w-[95%] aspect-square rounded-full bg-[#0a0a0a] shadow-[0_0_50px_rgba(0,0,0,0.5)] flex items-center justify-center border-[1px] border-white/5"
              animate={{
                x: isPlaying && currentSong?.id === song.id ? "53%" : "0%",
                rotate: isPlaying && currentSong?.id === song.id ? 360 : 0,
              }}
              transition={{
                rotate: {
                  repeat: Infinity,
                  duration: 8,
                  ease: "linear",
                },
                x: { type: "spring", stiffness: 40, damping: 25 },
              }}
            >
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute inset-0 rounded-full border-[0.1px] border-white/5"
                  style={{ margin: `${(i + 1) * 2.5}%` }}
                />
              ))}
              <div className="w-1/2 h-1/2 rounded-full overflow-hidden border-[12px] border-black relative shadow-[0_0_15px_rgba(0,0,0,0.8)]">
                {song.images?.[0] && (
                  <Image
                    src={song.images[0]}
                    alt="Label"
                    fill
                    className="object-cover opacity-90"
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-black shadow-inner" />{" "}
                  {/* Standard Spindle Hole */}
                </div>
              </div>
            </motion.div>

            <motion.div
              layoutId={`image-${song.id}`}
              className="relative w-full aspect-square bg-neutral-900 shadow-2xl z-20 rounded-sm cursor-pointer group/cover"
              onClick={() => setShowTag(!showTag)}
            >
              <div className="relative w-full h-full overflow-hidden rounded-sm">
                {song.images?.[0] && (
                  <Image
                    src={song.images[0]}
                    alt={song.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover/cover:scale-105"
                    priority
                  />
                )}
              </div>

              {/* LP Paper Tag (Physical Texture Feel) */}
              <motion.div
                initial={{ opacity: 0, x: -40, rotate: -5 }}
                animate={{
                  opacity: showTag ? 1 : 0,
                  x: showTag ? -30 : -40,
                  rotate: showTag ? -2 : -5,
                }}
                className="absolute top-10 -left-16 z-30 pointer-events-none origin-right"
              >
                <div
                  className="relative p-5 shadow-[5px_5px_20px_rgba(0,0,0,0.4)] min-w-[140px] before:absolute before:inset-0 before:bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] before:opacity-10"
                  style={{
                    backgroundColor: song.themeSub,
                    color: song.themeText,
                    border: `1px solid ${song.themeAccent}44`,
                  }}
                >
                  {/* String/Hole Visual */}
                  <div
                    className="absolute top-1/2 -right-1 w-2 h-2 rounded-full shadow-inner"
                    style={{ backgroundColor: `${song.themeText}22` }}
                  />

                  <div className="relative z-10 font-mono space-y-4">
                    <div
                      className="border-b pb-1"
                      style={{ borderBottomColor: `${song.themeText}22` }}
                    >
                      <span
                        className="text-[7px] block uppercase leading-none mb-1 opacity-50"
                        style={{ color: song.themeText }}
                      >
                        Catalog No.
                      </span>
                      <span className="text-[10px] font-bold tracking-tighter">
                        {song.id.toUpperCase()}
                        {activeTrack && (
                          <span className="opacity-50">
                            -
                            {(
                              song.tracks?.findIndex(
                                (t) => t.id === activeTrack.id,
                              ) ?? 0 + 1
                            )
                              .toString()
                              .padStart(2, "0")}
                          </span>
                        )}
                      </span>
                    </div>

                    <div>
                      <span
                        className="text-[7px] block uppercase leading-none mb-1 opacity-50"
                        style={{ color: song.themeText }}
                      >
                        Release Date
                      </span>
                      <span className="text-[10px] font-bold tracking-widest">
                        {song.releaseDate ||
                          new Date(song.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div>
                      <span
                        className="text-[7px] block uppercase leading-none mb-1 opacity-50"
                        style={{ color: song.themeText }}
                      >
                        Length
                      </span>
                      <span
                        className="text-[11px] font-black border px-1.5 py-0.5 inline-block mt-1"
                        style={{
                          borderColor: song.themeText,
                          backgroundColor: `${song.themeAccent}33`,
                        }}
                      >
                        {currentSong?.audioSrc ===
                        (activeTrack?.audioSrc || song.audioSrc)
                          ? formatTime(duration)
                          : song.duration || "--:--"}
                      </span>
                    </div>

                    <div className="pt-2">
                      <div
                        className="w-full h-4 opacity-30"
                        style={{
                          background: `repeating-linear-gradient(90deg, ${song.themeText}, ${song.themeText} 1px, transparent 1px, transparent 3px)`,
                        }}
                      />
                      <span
                        className="text-[6px] uppercase mt-1 block opacity-40"
                        style={{ color: song.themeText }}
                      >
                        Archived Object
                      </span>
                    </div>
                  </div>

                  {/* Red "Checked" Stamp Effect */}
                  <div
                    className="absolute -bottom-2 -right-2 w-10 h-10 border-2 rounded-full flex items-center justify-center rotate-12 font-black text-[8px] uppercase opacity-60"
                    style={{
                      borderColor: song.themeAccent,
                      color: song.themeAccent,
                      filter: "drop-shadow(0 0 2px rgba(0,0,0,0.5))",
                    }}
                  >
                    Verified
                  </div>
                </div>
              </motion.div>

              {/* Interaction Hint */}
              <div className="absolute bottom-4 right-4 opacity-0 group-hover/cover:opacity-100 transition-opacity bg-black/40 backdrop-blur-md px-2 py-1 rounded-sm border border-white/10 text-[8px] font-mono text-white/80 tracking-tighter">
                TOUCH TO INSPECT
              </div>
            </motion.div>
          </div>

          {/* Minimal Player Controls */}
          <div className="text-center w-full max-w-md">
            <h1 className="text-5xl font-light tracking-[0.2em] text-white uppercase mb-2 flex flex-col items-center gap-2">
              <span>{currentDisplayTitle.split(" (feat.")[0]}</span>
              {currentDisplayTitle.includes(" (feat.") && (
                <span className="text-[10px] font-mono text-white/30 tracking-[0.4em] lowercase italic">
                  feat.{" "}
                  {currentDisplayTitle.split(" (feat.")[1].replace(")", "")}
                </span>
              )}
            </h1>
            <p className="text-sm font-mono text-white/40 tracking-[0.3em] uppercase mb-8">
              {song.artist}
            </p>

            {/* Album Tracklist Integration */}
            {song.tracks && song.tracks.length > 1 && (
              <div className="mb-12 flex flex-col gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                {song.tracks.map((track) => {
                  const isActive = currentSong?.audioSrc === track.audioSrc;
                  return (
                    <button
                      key={track.id}
                      onClick={() => handleTogglePlay(track)}
                      className={`flex items-center justify-between px-6 py-3 rounded-full border transition-all duration-300 group/track ${
                        isActive
                          ? "bg-white/20 border-white text-white"
                          : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <MusicIcon
                          size={12}
                          className={
                            isActive
                              ? "animate-pulse"
                              : "opacity-0 group-hover/track:opacity-50"
                          }
                        />
                        <span className="text-[10px] font-mono uppercase tracking-widest flex items-center gap-2">
                          {track.title}
                          {(track.isTitle === "true" ||
                            track.isTitle === true) && (
                            <span className="px-1.5 py-0.5 rounded-sm bg-white/20 text-[7px] font-bold tracking-normal border border-white/20">
                              TITLE
                            </span>
                          )}
                        </span>
                      </div>
                      {isActive && isPlaying ? (
                        <div className="flex gap-1 h-3 items-end">
                          <motion.div
                            animate={{ height: [4, 12, 6] }}
                            transition={{ repeat: Infinity, duration: 0.5 }}
                            className="w-[2px] bg-white"
                          />
                          <motion.div
                            animate={{ height: [8, 4, 10] }}
                            transition={{ repeat: Infinity, duration: 0.6 }}
                            className="w-[2px] bg-white"
                          />
                          <motion.div
                            animate={{ height: [6, 10, 4] }}
                            transition={{ repeat: Infinity, duration: 0.7 }}
                            className="w-[2px] bg-white"
                          />
                        </div>
                      ) : (
                        <PlayIcon
                          size={12}
                          fill="currentColor"
                          className="opacity-0 group-hover/track:opacity-100 transition-opacity"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            <button
              onClick={() => handleTogglePlay()}
              className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-2xl border border-white/40 text-white hover:bg-white hover:text-black hover:border-white transition-all duration-500 flex items-center justify-center group mx-auto shadow-[0_0_40px_rgba(0,0,0,0.3)] hover:shadow-[0_0_50px_rgba(255,255,255,0.2)]"
              aria-label={
                isPlaying &&
                (currentSong?.audioSrc === currentAudioSrc ||
                  currentSong?.id === song.id)
                  ? "Pause"
                  : "Play"
              }
            >
              {isPlaying &&
              (currentSong?.audioSrc === currentAudioSrc ||
                currentSong?.id === song.id) ? (
                <PauseIcon size={32} fill="currentColor" />
              ) : (
                <PlayIcon size={32} fill="currentColor" className="ml-1" />
              )}
            </button>
          </div>
        </motion.div>
      </section>

      {/* 4. SCROLLABLE CONTENT AREA (The "Shininryu" style) */}
      <div className="relative z-30 container mx-auto max-w-4xl px-8 pb-40">
        <div className="flex flex-col gap-32 pt-20">
          {/* 1. Dynamic Feature Images grid (TOP) */}
          <div className="relative w-full min-h-[60vh] py-10">
            {song.images.slice(1).map((img, index) => {
              // Create unique positions/styles based on index + song.id
              const seed = (song.id.charCodeAt(0) + index) * 137;

              // Define some high-end layout styles to cycle through
              const layouts = [
                "w-full md:w-3/5 mx-auto", // Center focused
                "w-full md:w-2/5 ml-auto", // Right aligned
                "w-full md:w-2/5 mr-auto", // Left aligned
                "w-full md:w-1/2 mx-auto rotate-2", // Slight tilt
                "w-full md:w-3/4 mr-auto -rotate-1", // Large tilt
              ];

              const layoutClass = layouts[seed % layouts.length];
              const zIndex = 10 + index;
              const yOffset = (seed % 100) - 50; // -50px to 50px jitter
              const isVideo = img.toLowerCase().match(/\.(mp4|webm|ogg|mov)$/);

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{
                    duration: 1.2,
                    delay: index * 0.1,
                    ease: [0.215, 0.61, 0.355, 1],
                  }}
                  className={`relative aspect-[4/5] overflow-hidden shadow-2xl mb-24 transition-transform duration-700 hover:scale-[1.02] ${layoutClass}`}
                  style={{ zIndex, marginTop: `${yOffset}px` }}
                >
                  {isVideo ? (
                    <video
                      src={img}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Image
                      src={img}
                      alt={`Detail ${index}`}
                      fill
                      className="object-cover"
                    />
                  )}
                  {/* Subtle glass overlay for texture */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                </motion.div>
              );
            })}
          </div>

          {/* 2. Highlighted Lyrics (MIDDLE) - Only shows if content exists */}
          {currentDisplayLyrics && currentDisplayLyrics.trim() !== "" && (
            <div className="flex flex-col items-center py-24 relative group">
              {/* Minimalist Accents: Top and Bottom floating lines */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] group-hover:w-24 transition-all duration-1000 ease-out"
                style={{ backgroundColor: `${song.themeText}33` }}
              />
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[3px] group-hover:w-24 transition-all duration-1000 ease-out"
                style={{ backgroundColor: `${song.themeText}33` }}
              />

              <h2
                className="text-4xl md:text-5xl font-light text-center leading-relaxed tracking-tight max-w-2xl whitespace-pre-wrap drop-shadow-xl selection:bg-white selection:text-black mb-8"
                style={{ color: song.themeText }}
              >
                {currentDisplayLyrics}
              </h2>

              <motion.div
                initial={{ opacity: 0.3 }}
                whileInView={{ opacity: 0.6 }}
                className="flex items-center gap-3 text-xs font-mono tracking-[0.2em] uppercase"
                style={{ color: song.themeText }}
              >
                <div
                  className="w-4 h-[1px]"
                  style={{ backgroundColor: `${song.themeText}33` }}
                />
                <span className="flex items-center gap-1.5">
                  <span className="uppercase opacity-70">
                    {currentDisplayTitle.split(" (feat.")[0]}
                  </span>
                  {currentDisplayTitle.includes(" (feat.") && (
                    <span className="text-[8px] opacity-40 lowercase italic">
                      feat.{" "}
                      {currentDisplayTitle.split(" (feat.")[1].replace(")", "")}
                    </span>
                  )}
                  <span className="mx-1 opacity-20">—</span>
                  <span className="uppercase opacity-70">{song.artist}</span>
                </span>
                <div
                  className="w-4 h-[1px]"
                  style={{ backgroundColor: `${song.themeText}33` }}
                />
              </motion.div>
            </div>
          )}

          {/* 3. Credits & Info Row (BOTTOM) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 mb-20 items-start border-t border-white/5 pt-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-8 text-xs font-mono text-white/40 leading-relaxed uppercase tracking-widest"
            >
              <div>
                <span className="text-white/80 block mb-1">Lyrics by</span>
                {activeTrack?.lyricsBy || song.lyricsBy || song.artist}
              </div>

              <div>
                <span className="text-white/80 block mb-1">Theme Palette</span>
                <div className="flex flex-col gap-2 mt-3">
                  {[
                    { label: "Base", color: song.themeBase },
                    { label: "Sub", color: song.themeSub },
                    { label: "Accent", color: song.themeAccent },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <div className="relative group/color">
                        <div
                          className="w-12 h-3 rounded-sm border border-white/20 shadow-[0_0_10px_rgba(0,0,0,0.3)] transition-all group-hover/color:w-16 group-hover/color:brightness-110"
                          style={{ backgroundColor: item.color }}
                        />
                      </div>
                      <span className="text-[9px] text-white/40 font-mono tracking-tighter">
                        {item.color.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Log / Curator Note */}
            {song.log && song.log.trim() !== "" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="text-lg text-white/70 leading-relaxed font-serif italic whitespace-pre-wrap border-l border-white/10 pl-12"
              >
                "{song.log}"
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* TOP SCROLL BUTTON */}
      <motion.button
        className="fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/50 hover:text-white hover:border-white/50 transition-all hover:scale-110 active:scale-95 group"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: scrollYProgress.get() > 0.1 ? 1 : 0,
          y: scrollYProgress.get() > 0.1 ? 0 : 20,
        }}
        style={{ opacity: useTransform(smoothProgress, [0, 0.1], [0, 1]) }}
      >
        <UpIcon
          size={20}
          className="group-hover:-translate-y-1 transition-transform"
        />
      </motion.button>
    </div>
  );
}
