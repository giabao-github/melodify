import { create } from "zustand";

interface PlayerSettingsStore {
  volume: number;
  loop: boolean;
  shuffle: boolean;
  speed: number;
  setVolume: (volume: number) => void;
  setLoop: (loop: boolean) => void;
  setShuffle: (shuffle: boolean) => void;
  setSpeed: (speed: number) => void;
};

const usePlayerSettings = create<PlayerSettingsStore>((set) => ({
  volume: 0.5,
  loop: false,
  shuffle: false,
  speed: 1,
  setVolume: (volume: number) => set({ volume: volume }),
  setLoop: (loop: boolean) => set({ loop: loop }),
  setShuffle: (shuffle: boolean) => set({ shuffle: shuffle }),
  setSpeed: (speed: number) => set({ speed: speed }),
}));

export default usePlayerSettings;