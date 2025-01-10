import { create } from 'zustand';

interface ProgressBarStore {
  sound: any,
  progressBarDuration: number,
  playedDuration: number,
  setSound: (sound: any) => void,
  setProgressBarDuration: (progressBarDuration: number) => void,
  setPlayedDuration: (playedDuration: number) => void,
};

const useProgressBar = create<ProgressBarStore>((set) => ({
  progressBarDuration: 0,
  playedDuration: 0,
  sound: undefined,
  setSound: (value) => set({ sound: value }),
  setProgressBarDuration: (value) => set({ progressBarDuration: value }),
  setPlayedDuration: (value) => set({ playedDuration: value }),
}));

export default useProgressBar;