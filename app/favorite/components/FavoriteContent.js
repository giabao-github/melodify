"use client";

import LikeButton from '../../components/LikeButton';
import MediaItem from '../../components/MediaItem';
import useOnPlay from '../../hooks/useOnPlay';
import { useUser } from '../../hooks/useUser';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import useOptionsModal from '../../hooks/useOptionsModal';

const FavoriteContent = ({ songs }) => {
  const router =  useRouter();
  const { isLoading, user } = useUser();
  const { onOpen, setTitle, setDescription } = useOptionsModal();

  const onPlay = useOnPlay(songs);

  const handleLogin = () => {
    setTitle('Choose an authentication option');
    setDescription('Only authenticated users are allowed to create favorite playlists');
    onOpen();
  }

  if (!isLoading && !user) {
    return (
      <div className='h-[63.58%] flex justify-center items-center'>
        <div className='text-neutral-400 text-xl'>
          <span
            onClick={() => handleLogin()} 
            className='cursor-pointer hover:underline text-button'
          >
            Log in
          </span>
          &nbsp;to listen to your favorite songs.
        </div>
      </div>
    );
  }

  if (songs.length === 0) {
    return (
      <div className='h-[63.58%] flex justify-center items-center'>
        <div className='text-neutral-400 text-xl'>
          No favorite songs.
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-y-4 w-full p-6'>
      {songs.map((song) => (
        <div
          key={song.id}
          className='flex items-center gap-x-4 w-full'
        >
          <div className='flex-1'>
            <MediaItem
              onClick={(id) => onPlay(id)}
              data={song}
              type='search'
            />
          </div>
          <LikeButton songId={song.id} />
        </div>
      ))}
    </div>
  );
};

export default FavoriteContent;