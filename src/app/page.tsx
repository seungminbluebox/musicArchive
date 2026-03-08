import { getSongs } from "@/lib/songs";
import RecordList from "@/components/RecordList";
import Image from "next/image";

export default function Home() {
  const songs = getSongs();

  return (
    <main className="min-h-screen bg-black text-white px-8">
      <header className="py-9 flex flex-col md:flex-row justify-between items-center border-b border-neutral-800/50">
        <a className="flex items-center gap-4 group" href="/">
          <div className="relative w-8 h-8 group-hover:scale-110 transition-transform duration-300">
            <Image
              src="/icon.png"
              alt="MusicArchive Logo"
              fill
              className="object-contain"
            />
          </div>
          <h1 className="text-xl font-black uppercase tracking-tighter group-hover:text-neutral-300 transition-colors">
            Music<span className="text-neutral-500">Archive</span>
          </h1>
        </a>
        <p className="font-mono text-[10px] uppercase text-neutral-600 mt-6 md:mt-0 tracking-[0.3em]">
          Digital Record Bar / Archived: {songs.length}
        </p>
      </header>
      <RecordList songs={songs} />
      <footer className="py-20 text-center text-neutral-700 text-xs font-mono uppercase tracking-widest">
        seungmin music archive © 2026
      </footer>
    </main>
  );
}
