"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  ReactNode,
} from "react";
import { Song } from "@/types/song";

interface AudioContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  progress: number;
  duration: number; // New field for raw duration in seconds
  playSong: (song: Song) => Promise<void>;
  pauseAudio: () => Promise<void>;
  resumeAudio: () => Promise<void>;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const AudioContext = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioObjectRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  const TARGET_VOLUME = 0.3;

  // Initialize Audio object only once on the client side
  useEffect(() => {
    if (typeof window !== "undefined" && !audioObjectRef.current) {
      const audio = new Audio();
      audio.volume = TARGET_VOLUME;
      audioObjectRef.current = audio;

      const updateProgress = () => {
        if (audio.duration) {
          setProgress((audio.currentTime / audio.duration) * 100);
        }
      };

      const handleLoadedMetadata = () => {
        if (audio.duration) {
          setDuration(audio.duration);
        }
      };

      const handleEnded = () => {
        setIsPlaying(false);
        setProgress(0);
      };

      audio.addEventListener("timeupdate", updateProgress);
      audio.addEventListener("loadedmetadata", handleLoadedMetadata);
      audio.addEventListener("ended", handleEnded);

      return () => {
        audio.removeEventListener("timeupdate", updateProgress);
        audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
        audio.removeEventListener("ended", handleEnded);
      };
    }
  }, []);

  const safePlay = async (audio: HTMLAudioElement) => {
    try {
      playPromiseRef.current = audio.play();
      await playPromiseRef.current;
      playPromiseRef.current = null;
    } catch (error: any) {
      if (error.name === "NotAllowedError") {
        console.warn("Autoplay blocked: Waiting for user interaction");
      } else if (error.name !== "AbortError") {
        console.error("Playback error:", error);
      }
      playPromiseRef.current = null;
      setIsPlaying(false); // Playback failed, sync state
    }
  };

  const safePause = async (audio: HTMLAudioElement) => {
    if (playPromiseRef.current) {
      try {
        await playPromiseRef.current;
      } catch (e) {}
    }
    audio.pause();
  };

  const fadeIn = (audio: HTMLAudioElement) => {
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

    audio.volume = 0;
    safePlay(audio);

    let vol = 0;
    fadeIntervalRef.current = setInterval(() => {
      if (vol < TARGET_VOLUME) {
        vol += 0.015;
        audio.volume = Math.min(vol, TARGET_VOLUME);
      } else {
        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      }
    }, 25);
  };

  const fadeOutAndChange = (newSong: Song) => {
    if (!audioObjectRef.current) return;

    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

    let vol = audioObjectRef.current.volume;
    fadeIntervalRef.current = setInterval(async () => {
      if (vol > 0.015) {
        vol -= 0.015;
        if (audioObjectRef.current)
          audioObjectRef.current.volume = Math.max(0, vol);
      } else {
        clearInterval(fadeIntervalRef.current as NodeJS.Timeout);
        if (audioObjectRef.current) {
          await safePause(audioObjectRef.current);
          audioObjectRef.current.src = newSong.audioSrc;
          setCurrentSong(newSong);
          fadeIn(audioObjectRef.current);
          setIsPlaying(true);
        }
      }
    }, 25);
  };

  const playSong = async (song: Song) => {
    // 1. If same song is PASSED (not just mounted)
    // 앨범 내 트랙 전환을 위해 audioSrc까지 체크합니다.
    if (
      currentSong?.id === song.id &&
      currentSong?.audioSrc === song.audioSrc
    ) {
      if (!isPlaying && audioObjectRef.current) {
        await safePlay(audioObjectRef.current);
        setIsPlaying(true);
      }
      return;
    }

    // 2. Different track or song logic
    if (audioObjectRef.current) {
      if (isPlaying) {
        fadeOutAndChange(song);
      } else {
        audioObjectRef.current.src = song.audioSrc;
        setCurrentSong(song);
        fadeIn(audioObjectRef.current);
        setIsPlaying(true);
      }
    }
  };

  const pauseAudio = async () => {
    // IMPORTANT: Clear any running fade intervals when manually pausing
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }

    if (audioObjectRef.current && isPlaying) {
      await safePause(audioObjectRef.current);
      setIsPlaying(false);
    }
  };

  const resumeAudio = async () => {
    if (audioObjectRef.current && !isPlaying && currentSong) {
      await safePlay(audioObjectRef.current);
      setIsPlaying(true);
    }
  };

  return (
    <AudioContext.Provider
      value={{
        currentSong,
        isPlaying,
        progress,
        duration,
        playSong,
        pauseAudio,
        resumeAudio,
        audioRef: audioObjectRef,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}
