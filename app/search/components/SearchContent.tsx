"use client";

import { Song } from '../../../types';
import LikeButton from '../../components/LikeButton';
import MediaItem from '../../components/MediaItem';
import useOnPlay from '../../hooks/useOnPlay';
import React from 'react';
import { PiSmileySad } from "react-icons/pi";


interface SearchContentProps {
  title: Song[],
  authors: Song[]
}

const SearchContent: React.FC<SearchContentProps> = ({ title, authors }) => {
  const onPlay = useOnPlay(title);
  const onAuthor = useOnPlay(authors);

  if (title.length === 0 && authors.length === 0) {
    return (
      <div className='h-3/5 text-white text-xl flex justify-center items-center'>
        <PiSmileySad size={28} />&nbsp;&nbsp;
        No songs found.
      </div>
    );
  }
  
  return (
    <div className='flex flex-col gap-y-2 w-full px-6'>
      {title.map(song => (
        <div
          key={song.id}
          className='flex items-center gap-x-4 w-full'
        >
          <div className='flex-1'>
            <MediaItem
              onClick={(id) => onPlay(id)}
              data={song}
              songs={title}
              type='search'
            />
          </div>
          <LikeButton songId={song.id} />
        </div>
      ))}
      {(title.length === 0) && authors.map(author => (
        <div
          key={author.id}
          className='flex items-center gap-x-4 w-full'
        >
          <div className='flex-1'>
            <MediaItem
              onClick={(id) => onAuthor(id)}
              data={author}
              songs={authors}
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