import React from 'react';
import getLikedSongs from '../../actions/getLikedSongs';
import Header from '../components/Header';
import Image from 'next/image';
import { RiPlayListFill } from "react-icons/ri";
import FavoriteContent from './components/FavoriteContent';

export const revalidate = 0;

const Favorite = async () => {
  const songs = await getLikedSongs();
  return (
    <div className='bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto'>
      <title>Melodify | Favorite Songs</title>
      <Header>
        <div className='mt-20'>
          <div className='flex flex-col md:flex-row items-center gap-x-5'>
            <div className='relative h-32 w-32 lg:h-44 lg:w-44'>
              <Image
                fill
                sizes='auto auto'
                alt='Favorite Playlist'
                className='object-cover rounded-lg'
                src='/images/liked.png'
              />
            </div>
            <div className='flex flex-col gap-y-6 mt-4 md:mt-0'>
              <p className='hidden md:flex md:flex-row md:items-center font-semibold text-lg ml-1'>
                <RiPlayListFill className='mr-2' />
                Playlist
              </p>
              <h1 className='text-white text-4xl sm:text-5xl lg:text-6xl font-bold'>Favorite Songs</h1>
            </div>
          </div>
        </div>
      </Header>
      <FavoriteContent songs={songs}/>
    </div>
  );
};

export default Favorite;