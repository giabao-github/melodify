import { create } from 'zustand';

interface SongStore {
  song: [],
  setSong: (song: []) => void,
};

const useSong = create<SongStore>((set) => {
  // Initialize the song state
  let initialSongs: [] = [];

  // Check if we are in the browser environment
  if (typeof window !== 'undefined') {
    // Retrieve initial state from local storage
    const storedSongs = localStorage.getItem('songs');
    initialSongs = storedSongs ? JSON.parse(storedSongs) : [];
  }

  return {
    song: initialSongs,
    setSong: (value) => {
      set({ song: value });
      // Persist the song state to local storage
      if (typeof window !== 'undefined') {
        localStorage.setItem('songs', JSON.stringify(value));
      }
    },
  };
});

export default useSong;
