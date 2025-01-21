"use client";

import { PiPlaylistBold } from 'react-icons/pi';
import { GoPlus } from 'react-icons/go';

import { Song } from '../../types';
import { useUser } from '../hooks/useUser';
import useUploadModal from '../hooks/useUploadModal';
import useOptionsModal from '../hooks/useOptionsModal';
import useSubscribeModal from '../hooks/useSubscribeModal';
import MediaItem from './MediaItem';
import useOnPlay from '../hooks/useOnPlay';
import usePlaylistModal from '../hooks/usePlaylistModal';
import useLyricsModal from '../hooks/useLyricsModal';


interface LibraryProps {
  songs: Song[];
}

const Library: React.FC<LibraryProps> = ({ songs }) => {
  const subscribeModal = useSubscribeModal();
  const lyricsModal = useLyricsModal();
  const playlistModal = usePlaylistModal();
  const optionsModal = useOptionsModal();
  const uploadModal = useUploadModal();
  const { user, subscription } = useUser();

  const onPlay = useOnPlay(songs);

  const onClick = () => {
    if (!user) {
      optionsModal.setTitle('Login required');
      optionsModal.setDescription('You need to login first in order to create your own playlists');
      lyricsModal.onClose();
      playlistModal.onClose();
      return optionsModal.onOpen();
    }

    if (!subscription) {
      lyricsModal.onClose();
      playlistModal.onClose();
      return subscribeModal.onOpen();
    }

    return uploadModal.onOpen();
  };

  return (
    <div className='flex flex-col'>
      <div className='flex items-center justify-between px-5 pt-4'>
        <div className='inline-flex items-center gap-x-2 cursor-pointer group'>
          <PiPlaylistBold className='text-white group-hover:text-primaryAccent transition' size={26} />
          <p className='text-white font-bold text-lg group-hover:text-primaryAccent transition'>Your Library</p>
        </div>
        <GoPlus 
          onClick={onClick}
          size={28}
          strokeWidth='1px'
          className='p-1 text-white hover:text-primaryAccent hover:bg-neutral-700 hover:stroke-2 cursor-pointer transition rounded-full' 
        />
      </div>
      <div className='flex flex-col gap-y-2 mt-6 px-3 font-bold text-lg'>
        {
          songs.map((item) => (
            <MediaItem
              onClick={(id: string) => onPlay(id)}
              key={item.id}
              data={item}
              type='library'
            />
          ))
        }
      </div>
    </div>
  )
}

export default Library;
