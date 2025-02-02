"use client";

import { TbPlaylistAdd } from 'react-icons/tb';
import { PiPlaylistBold } from 'react-icons/pi';

import { Playlist, Song } from '../../types';
import { useUser } from '../hooks/useUser';
import PlaylistContent from './PlaylistContent';
import useAuthModal from '../hooks/useAuthModal';
import usePlaylist from '../hooks/usePlaylist';


interface LibraryProps {
  songs: Song[];
  playlists: Playlist[];
}

const Library: React.FC<LibraryProps> = ({ songs, playlists }) => {
  const authModal = useAuthModal();
  const playlist = usePlaylist();
  const { user } = useUser();

  const onClick = () => {
    if (!user) {
      return authModal.onOpen();
    }
    playlist.setIsCreateOpen(true);
  }

  return (
    <div className='flex flex-col gap-y-2'>
      <div className='sticky top-0 bg-neutral-900 z-[1] flex items-center justify-between px-5 py-6'>
        <div 
          title='Your Library'
          className='inline-flex items-center gap-x-2 cursor-default'
        >
          <PiPlaylistBold className='text-white transition' size={26} />
          <p className='text-white font-bold text-lg select-none'>Your Library</p>
        </div>
        <TbPlaylistAdd 
          title='Create a playlist'
          onClick={onClick}
          size={34}
          strokeWidth='2px'
          className='p-1 text-white hover:text-primaryAccent hover:bg-neutral-700 hover:stroke-2 cursor-pointer transition rounded-full' 
        />
      </div>
      <PlaylistContent songs={songs} playlists={playlists} />
    </div>
  )
}

export default Library;
