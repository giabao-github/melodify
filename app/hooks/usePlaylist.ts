import { create } from 'zustand';

interface PlaylistModalStore {
  name: string;
  songs: number[];
  setName: (name: string) => void;
  setSongs: (songs: number[]) => void;
};

const usePlaylistModal = create<PlaylistModalStore>((set) => ({
  name: '',
  songs: [],
  setName: (value: string) => set({ name: value }),
  setSongs: (value: number[]) => set({ songs: value }),
}));

export default usePlaylistModal;