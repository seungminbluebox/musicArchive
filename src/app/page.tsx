import { getSongs } from "@/lib/songs";
import RecordList from "@/components/RecordList";

export default function Home() {
  const songs = getSongs();

  return (
    <main className="min-h-screen bg-black text-white px-8">
      <header className="py-9 flex flex-col md:flex-row justify-between items-center border-b border-neutral-800/50">
        <a className="flex items-center gap-4" href="/">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-purple-600 animate-pulse"></div>
          <h1 className="text-xl font-black uppercase tracking-tighter">
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
