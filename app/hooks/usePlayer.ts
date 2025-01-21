import { Song } from '../../types';
import { create } from 'zustand';

interface PlayerStore {
  song: Song | null, 
  songs: Song[];
  ids: string[];
  shuffledIds: string[];
  playedIds: string[];
  activeId?: string;
  setSong: (song: Song) => void;
  setSongs: (songs: Song[]) => void;
  setId: (id: string) => void;
  setIds: (ids: string[]) => void;
  setShuffledIds: (shuffledIds: string[]) => void;
  setPlayedIds: (playedIds: string[]) => void;
  reset: () => void;
};

const usePlayer = create<PlayerStore>((set) => ({
  song: null,
  songs: [],
  ids: [],
  shuffledIds: [],
  playedIds: [],
  activeId: undefined,
  setSong: (targetedSong: Song) => set({ song: targetedSong}),
  setSongs: (songList: Song[]) => set({ songs: songList }),
  setId: (id: string) => set({ activeId: id }),
  setIds: (ids: string[]) => set({ ids: ids }),
  setShuffledIds: (shuffledIds: string[]) => set({ shuffledIds: shuffledIds }),
  setPlayedIds: (playedIds: string[]) => set({ playedIds: playedIds }),
  reset: () => set({ ids: [], activeId: undefined })
}));

export default usePlayer;