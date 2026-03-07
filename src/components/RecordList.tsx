"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Song } from "@/types/song";

export default function RecordList({ songs }: { songs: Song[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 p-8 max-w-7xl mx-auto">
      {songs.map((song: Song) => (
        <Link key={song.id} href={`/songs/${song.id}`}>
          <motion.div
            className="flex flex-col group cursor-pointer"
            whileHover={{ y: -10 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="relative w-full aspect-square bg-neutral-200 shadow-xl overflow-hidden rounded-sm transition-shadow group-hover:shadow-2xl">
              <motion.div
                layoutId={`image-${song.id}`}
                className="w-full h-full relative"
              >
                {song.images && song.images.length > 0 ? (
                  <Image
                    src={song.images[0]}
                    alt={song.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-neutral-800 flex items-center justify-center text-neutral-400">
                    LP Cover
                  </div>
                )}
              </motion.div>
              <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 text-white text-[10px] font-mono rounded backdrop-blur-sm">
                01
              </div>
            </div>
            <div
              className="mt-4 border-l-2 pl-3"
              style={{ borderLeftColor: song.themeAccent }}
            >
              <h3 className="text-lg font-bold leading-none mb-1 text-white">
                {song.title}
              </h3>
              <p className="text-sm text-neutral-400 font-mono uppercase tracking-widest">
                {song.artist}
              </p>
            </div>
          </motion.div>
        </Link>
      ))}
    </div>
  );
}
