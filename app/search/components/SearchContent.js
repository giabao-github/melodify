"use client";

import LikeButton from '@/components/LikeButton';
import MediaItem from '@/components/MediaItem';
import useOnPlay from '@/hooks/useOnPlay';
import React from 'react';
import { PiSmileySad } from "react-icons/pi";


const SearchContent = ({ songs, authors }) => {
  const onPlay = useOnPlay(songs);
  const onAuthor = useOnPlay(authors);

  if (songs.length === 0 && authors.length === 0) {
    return (
      <div className='h-3/5 text-white text-xl flex justify-center items-center'>
        <PiSmileySad size={28} />&nbsp;&nbsp;
        No songs found.
      </div>
    );
  }
  
  return (
    <div className='flex flex-col gap-y-2 w-full px-6'>
      {songs.map(song => (
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
      {(songs.length === 0) && authors.map(author => (
        <div
          key={author.id}
          className='flex items-center gap-x-4 w-full'
        >
          <div className='flex-1'>
            <MediaItem
              onClick={(id) => onAuthor(id)}
              data={author}
              type='search'
            />
          </div>
          <LikeButton songId={author.id} />
        </div>
      ))}
    </div>
  );
};

export default SearchContent;