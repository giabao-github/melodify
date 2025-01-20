"use client";

import useLoadImage from '../hooks/useLoadImage';
import Image from 'next/image';
import React from 'react';
import PlayButton from './PlayButton';
import AddButton from './AddButton';
import useOptionsModal from '../hooks/useOptionsModal';
import { useUser } from '../hooks/useUser';
import { Song } from '../../types';


interface SongItemProps {
  data: Song;
  onClick: (id: string) => void;
  onAdd: (song: Song) => void;
}

const SongItem: React.FC<SongItemProps> = ({ data, onClick, onAdd }) => {
  const imagePath = useLoadImage(data);
  const optionsModal = useOptionsModal();
  const { user } = useUser();
  const artists = data.author.split(',');

  const handleAddToPlaylist = () => {
    if (!user) {
      return optionsModal.onOpen();
    }
    onAdd(data);
  };

  return (
    <div
      className='w-64 relative group flex flex-col items-center justify-center rounded-md overflow-hidden gap-x-4 bg-neutral-400/5 cursor-pointer hover:bg-neutral-400/15 transition p-3'
    >
      <div className='relative aspect-square w-full h-full rounded-md overflow-hidden'>
        <Image
          className='object-cover'
          src={imagePath || '/images/liked.png'}
          fill
          sizes="(max-width: 768px) 100vw, 
                (max-width: 1200px) 50vw, 
                33vw" 
          priority
          alt={data.title}
        />
      </div>
      <div className='flex flex-col items-start h-1/3 w-full pt-4 px-1 gap-y-1'>
        <p
          onClick={() => onClick(data.id)} 
          className='font-semibold w-full text-lg hover:underline'
        >
          {data.title}
        </p>
        <p className="text-neutral-400 w-full text-sm">
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
      <div className='absolute bottom-24 left-5' onClick={handleAddToPlaylist}>
        <AddButton />
      </div>
    </div>
  );
};

export default SongItem;