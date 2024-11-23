import { create } from 'zustand';

interface LyricsModalStore {
  song: any;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  setSong: (song: any) => void;
};

const useLyricsModal = create<LyricsModalStore>((set) => ({
  song: undefined,
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
  setSong: (value) => set({ song: value }),
}));

export default useLyricsModal;