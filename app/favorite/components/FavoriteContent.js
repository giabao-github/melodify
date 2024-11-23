"use client";

import LikeButton from '@/components/LikeButton';
import MediaItem from '@/components/MediaItem';
import useOnPlay from '@/hooks/useOnPlay';
import { useUser } from '@/hooks/useUser';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

const FavoriteContent = ({ songs }) => {
  const router =  useRouter();
  const { isLoading, user } = useUser();

  const onPlay = useOnPlay(songs);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/');
    }
  }, [isLoading, router, user]);

  if (songs.length === 0) {
    return (
      <div className='mt-40 text-neutral-400 text-xl flex justify-center'>
        No favorite songs.
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