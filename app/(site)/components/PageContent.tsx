"use client";

import Link from 'next/link';
import { Song } from '../../../types';
import SongItem from '../../components/SongItem';
import useOnPlay from '../../hooks/useOnPlay';


interface PageContentProps {
  songs: Song[];
}

const PageContent: React.FC<PageContentProps> = ({ songs }) => {
  const onPlay = useOnPlay(songs);


  if (songs.length === 0) {
    return (
      <div className='mt-40 text-neutral-400 text-xl shadow-lg flex justify-center'>
        No song recommendations for you. Let&apos;s start&nbsp;
        <Link className='hover:text-primaryAccent' href='/search'>browsing</Link>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 auto-rows-fr gap-4 mt-4'>
      {songs.map((item) => (
        <SongItem
          onClick={(id: string) => onPlay(id)}
          key={item.id}
          data={item}
          songs={songs}
        />
      ))}
    </div>
  );
};

export default PageContent;