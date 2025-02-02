import { create } from 'zustand';
import { Playlist } from '../../types';

interface PlaylistModalStore {
  existId: string;
  activePlaylist: Playlist | null;
  selectedPlaylist: Playlist | null;
  playlists: Playlist[];
  isCreateOpen: boolean;
  setExistId: (existId: string) => void;
  setSelectedPlaylist: (value: Playlist | null) => void;
  setActivePlaylist: (value: Playlist | null) => void;
  setPlaylists: (value: Playlist[]) => void;
  setIsCreateOpen: (value: boolean) => void;
};

const usePlaylistModal = create<PlaylistModalStore>((set) => ({
  existId: '',
  activePlaylist: null,
  selectedPlaylist: null,
  playlists: [],
  isCreateOpen: false,
  setExistId: (value: string) => set({ existId: value }),
  setActivePlaylist: (value: Playlist | null) => set({ activePlaylist: value }),
  setSelectedPlaylist: (value: Playlist | null) => set({ selectedPlaylist: value }),
  setPlaylists: (value: Playlist[]) => set({ playlists: value }),
  setIsCreateOpen: (value: boolean) => set({ isCreateOpen: value }),
}));

export default usePlaylistModal;