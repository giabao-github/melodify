"use client";

import { Song } from '../../types';
import useOnPlay from '../hooks/useOnPlay';
import usePlaylistModal from '../hooks/usePlaylistModal';
import MediaItem from './MediaItem';


interface PlaylistModalProps {
  songs: Song[];
  activeSong?: Song;
}

const PlaylistModal: React.FC<PlaylistModalProps> = ({ songs, activeSong }) => {
  const { isOpen } = usePlaylistModal();
  const onPlay = useOnPlay(songs);

  if (isOpen) {
    return (
      <div className='bg-neutral-700 absolute top-0 left-0 z-10 h-[calc(100vh-100px)] w-1/3 overflow-y-auto font-bold text-lg flex flex-col pb-6'>
        <p className='my-6 px-8 text-semibold text-3xl'>Playlist</p>
        <div className='px-4 flex flex-col gap-y-1'>
          {
            songs.map((item) => (
              <MediaItem
                onClick={(id: string) => onPlay(id)}
                key={item.id}
                data={item}
                activeSong={activeSong}
                type='playlist'
              />
            ))
          }
        </div>
      </div>
    );
  }
}

export default PlaylistModal;
