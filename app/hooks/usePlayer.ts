import { Song } from "../../types";
import { create } from "zustand";

interface PlayerStore {
  song: Song | null, 
  songs: Song[];
  ids: string[];
  activeId?: string;
  setSong: (song: Song) => void;
  setSongs: (songs: Song[]) => void;
  setId: (id: string) => void;
  setIds: (ids: string[]) => void;
  reset: () => void;
};

const usePlayer = create<PlayerStore>((set) => ({
  song: null,
  songs: [],
  ids: [],
  activeId: undefined,
  setSong: (targetedSong: Song) => set({ song: targetedSong}),
  setSongs: (songList: Song[]) => set({ songs: songList }),
  setId: (id: string) => set({ activeId: id }),
  setIds: (ids: string[]) => set({ ids: ids }),
  reset: () => set({ ids: [], activeId: undefined })
}));

export default usePlayer;