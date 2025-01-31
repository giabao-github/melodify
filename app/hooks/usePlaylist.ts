import { create } from 'zustand';
import { Playlist } from '../../types';

interface PlaylistModalStore {
  selectedPlaylist: Playlist | null;
  playlists: Playlist[];
  isCreateOpen: boolean;
  setSelectedPlaylist: (value: Playlist) => void;
  setPlaylists: (value: Playlist[]) => void;
  setIsCreateOpen: (value: boolean) => void;
};

const usePlaylistModal = create<PlaylistModalStore>((set) => ({
  selectedPlaylist: null,
  playlists: [],
  isCreateOpen: false,
  setSelectedPlaylist: (value: Playlist) => set({ selectedPlaylist: value }),
  setPlaylists: (value: Playlist[]) => set({ playlists: value }),
  setIsCreateOpen: (value: boolean) => set({ isCreateOpen: value }),
}));

export default usePlaylistModal;