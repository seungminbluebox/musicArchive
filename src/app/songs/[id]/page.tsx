import { getSongs } from "@/lib/songs";
import SongDetail from "@/components/SongDetail";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  const songs = getSongs();
  return songs.map((song) => ({
    id: song.id,
  }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const songs = getSongs();
  const song = songs.find((s) => s.id === id);

  if (!song) {
    notFound();
  }

  return <SongDetail song={song} />;
}
