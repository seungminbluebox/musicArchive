import { Song } from "@/types/song";

export function getSongs(): Song[] {
  const data = require("../../data/songs.json");
  return data.sort((a: any, b: any) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
