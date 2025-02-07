"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import useLoadImage from '../hooks/useLoadImage';
import useOptionsModal from '../hooks/useOptionsModal';
import { useUser } from '../hooks/useUser';
import usePlaylist from '../hooks/usePlaylist';
import { Song } from '../../types';
import PlayButton from './PlayButton';
import AddButton from './AddButton';
import AddToPlaylistModal from './AddPlaylistModal';


interface SongItemProps {
  data: Song;
  songs: Song[];
  onClick: (id: string) => void;
}

const SongItem: React.FC<SongItemProps> = ({ data, songs, onClick }) => {
  const imagePath = useLoadImage(data);
  const optionsModal = useOptionsModal();
  const { user } = useUser();
  const { playlists, setExistId, setSelectedPlaylist } = usePlaylist();
  const supabaseClient = useSupabaseClient();
  const artists = data.author.split(',');
  const [isOpen, setIsOpen] = useState(false);


  const handleAddToPlaylist = async () => {
    if (!user) {
      optionsModal.setTitle('Login required');
      optionsModal.setDescription('You need to login first in order to create your own playlists');
      return optionsModal.onOpen();
    }
    setIsOpen(true);
    for (const singlePlaylist of playlists) {
      const { data: playlistData } = await supabaseClient
      .from('playlists')
      .select('songs')
      .eq('user_id', user?.id)
      .eq('id', singlePlaylist.id)
      .single();

      let currentSongs: string[] = playlistData?.songs || [];

      // Check if the song is already in the playlist
      if (currentSongs.includes(data.id)) {
        setExistId(data.id);
        return;
      } else {
        setExistId('');
      }
    }
  }

  return (
    <>
      {isOpen && (
        <AddToPlaylistModal 
          isOpen={isOpen}
          onClose={() => {
            setIsOpen(false);
            setSelectedPlaylist(null);
          }}
          selectedSong={data}
          songs={songs}
        />
      )}
      <div
        className='w-64 md:w-56 relative group flex flex-col items-center justify-center rounded-md select-none overflow-hidden gap-x-4 bg-neutral-400/5 cursor-pointer hover:bg-neutral-400/15 transition p-3'
      >
        <div className='relative aspect-square w-full h-full rounded-md overflow-hidden'>
          <Image
            className='object-cover'
            src={imagePath || '/images/liked.png'}
            fill
            sizes='(max-width: 768px) 100vw, 
                  (max-width: 1200px) 50vw, 
                  33vw' 
            priority
            alt={data.title}
          />
        </div>
        <div className='flex flex-col items-start flex-grow w-full pt-4 px-1 gap-y-1'>
          <p
            onClick={() => onClick(data.id)} 
            className='font-semibold w-full 2xl:text-lg md:text-base hover:underline'
          >
            {data.title}
          </p>
          <p className='text-neutral-400 w-full 2xl:text-sm md:text-xs'>
            {artists.map((artist, index) => (
              <React.Fragment key={index}>
                <a
                  href={`/search?title=${artist.trim().replace(/\s+/g, '%20')}`}
                  className='hover:underline cursor-pointer'
                >
                  {artist.trim()}
                </a>
                {index < artists.length - 1 && <span>, </span>}
              </React.Fragment>
            ))}
          </p>
        </div>
        <div 
          onClick={() => onClick(data.id)}
          className='absolute bottom-24 right-5'
        >
          <PlayButton />
        </div>
        <div 
          onClick={handleAddToPlaylist}
          className='absolute bottom-24 left-5'
        >
          <AddButton />
        </div>
      </div>
    </>
  );
};

export default SongItem;