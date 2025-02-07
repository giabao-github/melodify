"use client";

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { GoKebabHorizontal } from 'react-icons/go';
import { PiPlusCircleBold } from 'react-icons/pi';
import { IoRadio, IoPersonOutline, IoShareOutline, IoRemoveCircleOutline } from 'react-icons/io5';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Playlist, Song } from '../../types';
import usePlayer from '../hooks/usePlayer';
import useLoadImage from '../hooks/useLoadImage';
import { useUser } from '../hooks/useUser';
import usePlaylist from '../hooks/usePlaylist';
import AddToPlaylistModal from './AddPlaylistModal';
import useOptionsModal from '../hooks/useOptionsModal';


interface MediaItemProps {
  data: Song;
  activeSong?: Song;
  songs: Song[];
  selectedPlaylist?: Playlist | null;
  onClick?: (id: string) => void;
  type?: string;
}

const MediaItem: React.FC<MediaItemProps> = ({ data, activeSong, songs, selectedPlaylist, onClick, type }) => {
  const { user } = useUser();
  const { setIds, setId } = usePlayer();
  const supabaseClient = useSupabaseClient();
  const player = usePlayer();
  const playlist = usePlaylist();
  const imageUrl = useLoadImage(data);
  const optionsModal = useOptionsModal();
  const { playlists, setExistId, setSelectedPlaylist } = usePlaylist();
  const [isOpen, setIsOpen] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const addRef = useRef<HTMLDivElement | null>(null);
  const optionsRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const genres = data.genre.split(',');

  const handleClick = () => {
    if (type === 'library') {
      setIds(playlist.activePlaylist?.songs?.map(String) || []);
    }
    if (onClick) {
      setId(data.id);
      return onClick(data.id);
    }
    return player.setId(data.id);
  }

  const handleOptionClick = (event: React.MouseEvent<SVGElement>) => {
    event.stopPropagation();
    setShowOptions(prev => !prev);
  }

  const handleOptionSelect = async (option: string) => {
    setShowOptions(false);
    if (option === 'remove') {
      const { data: removedData, error } = await supabaseClient
        .from('playlists')
        .select('songs')
        .eq('user_id', user?.id)
        .eq('id', playlist.activePlaylist?.id)
        .single();

      if (error) {
        toast.remove();
        toast.error('Failed to fetch playlist data');
        return;
      }

      let currentSongs: string[] = removedData?.songs || [];

      if (currentSongs.includes(data.id)) {
        const updatedSongs = currentSongs.filter(songId => songId !== data.id);

        const { data: updatedData, error } = await supabaseClient
          .from('playlists')
          .update({ songs: updatedSongs })
          .eq('user_id', user?.id)
          .eq('id', playlist.activePlaylist?.id)
          .select();

        if (error) {
          toast.remove();
          return toast.error(`Failed to remove ${data.title} from ${playlist.activePlaylist?.name}`);
        } 

          playlist.setActivePlaylist(updatedData[0]);
          const updatedPlaylists = playlists.map(playlist => playlist.id === updatedData[0].id ? updatedData[0] : playlist);
          playlist.setPlaylists(updatedPlaylists);

          toast.remove();
          return toast.success(`Removed ${data.title} from ${playlist.activePlaylist?.name}`);
      } else {
        toast.remove();
        return toast.error(`${data.title} does not exist in ${playlist.activePlaylist?.name}`);
      }
    }
  }

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

  const formatTime = (seconds: number) => {
    seconds = Math.max(seconds, 0);
    const flooredSeconds = Math.floor(seconds);
    const hours = Math.floor(flooredSeconds / 3600);
    const minutes = Math.floor((flooredSeconds % 3600) / 60);
    const secs = flooredSeconds % 60;

    if (hours > 0) {
      return [
        hours.toString().padStart(2, '0'),
        minutes.toString().padStart(2, '0'),
        secs.toString().padStart(2, '0')
      ].join(':');
    } else {
      return [
        minutes.toString().padStart(2, '0'),
        secs.toString().padStart(2, '0')
      ].join(':');
    }
  }

  // Close the option box when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        optionsRef.current && !optionsRef.current.contains(event.target as Node) && 
        buttonRef.current && !buttonRef.current.contains(event.target as Node)
      ) {
        setShowOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div>
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
        onClick={handleClick}
        className={`flex items-center gap-x-3 cursor-pointer ${activeSong && activeSong.id === data.id ? 'bg-gradient-to-r from-purple-800 to-purple-500' : ''} hover:bg-gradient-to-r from-purple-800 to-purple-500 w-full h-full px-2 rounded-md select-none`}
      >
        <div className='relative rounded-md min-h-[56px] min-w-[56px] overflow-hidden'>
          <Image
            className='object-cover'
            src={imageUrl || '/images/liked.png'}
            fill
            sizes='auto auto'
            priority
            alt={data.title || ''}
          />
        </div>

        {type === 'library' && (
          <div
            title={`${data.title} - ${data.author}`} 
            className='flex flex-col justify-center gap-y-1 overflow-hidden py-2'
          >
            <p className='text-white text-base font-medium truncate'>
              {data.title.length > 20 ? data.title.slice(0, 20) + '...' : data.title}
            </p>
            <div className={`flex justify-between min-w-[186px]`}>
              <p className='text-neutral-300 text-sm font-medium truncate'>
                {data.author.length > 20 ? data.author.slice(0, 20) + '...' : data.author}
              </p>
              <div ref={buttonRef}>
                <GoKebabHorizontal 
                  onClick={handleOptionClick}
                  size={24}
                  className='text-white hover:text-primaryAccent cursor-pointer transition' 
                />
              </div>
            </div>
          </div>
        )}
        {type === 'search' && (
          <div className='flex flex-row justify-between gap-y-1 overflow-hidden w-full py-3'>
            <div className='flex flex-col'>
              <p className='text-white text-base font-medium truncate'>
                {data.title.length > 100 ? data.title.slice(0, 100) + '...' : data.title}
              </p>
              <div className={`flex justify-between min-w-96`}>
                <p className='text-neutral-300 text-sm font-medium truncate'>
                  {data.author.length > 80 ? data.author.slice(0, 80) + '...' : data.author}
                </p>
              </div>
            </div>
            <div className='mt-[10px]'>
              <div className='flex flex-row justify-center items-center'>
                <div className='mx-20'>
                  {genres.map((genre, index) => (
                    <span
                      key={index}
                      className='mx-2 px-3 rounded-full font-medium border-white border bg-neutral-700/50'
                    >
                      {genre.trim()}
                    </span>
                  ))}
                </div>
                <div 
                  ref={addRef}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleAddToPlaylist();
                  }}
                >
                  <PiPlusCircleBold
                    size={24}
                    className='p-[2px] text-white hover:text-primaryAccent hover:bg-neutral-600/40 hover:stroke-1 cursor-pointer transition rounded-full' 
                  />
                </div>
                <span className='mx-20'>{formatTime(data.duration)}</span>
                <div ref={buttonRef}>
                  <GoKebabHorizontal 
                    onClick={handleOptionClick}
                    size={24}
                    className='p-[2px] mr-8 text-white hover:text-primaryAccent hover:bg-neutral-600/40 hover:stroke-1 cursor-pointer transition rounded-full' 
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        {type === 'player' && (
          <div className='flex flex-row gap-y-1 overflow-hidden py-3'>
            <div className='flex flex-col max-w-fit'>
              <p className='text-white text-base font-medium truncate'>
                {data.title.length > 24 ? data.title.slice(0, 24) + '...' : data.title}
              </p>
              <div className={`flex justify-between`}>
                <p className='text-neutral-300 text-sm font-medium truncate'>
                  {data.author.length > 26 ? data.author.slice(0, 26) + '...' : data.author}
                </p>
              </div>
            </div>
          </div>
        )}
        {type === 'playlist' && (
          <div
            title={`${data.title} - ${data.author}`} 
            className='flex flex-col gap-y-1 overflow-hidden py-3'
          >
            <p className='text-white text-base font-medium truncate'>
              {data.title.length > 150 ? data.title.slice(0, 150) + '...' : data.title}
            </p>
            <div className={`flex justify-between min-w-[200px]`}>
              <p className='text-neutral-300 text-sm font-medium truncate'>
                {data.author.length > 150 ? data.author.slice(0, 150) + '...' : data.author}
              </p>
            </div>
          </div>
        )}
      </div>
      {showOptions && type === 'library' && (
        <div ref={optionsRef} className='relative'>
          <div className='flex flex-col absolute right-0 bg-neutral-800 text-white text-sm font-normal rounded-md shadow-lg p-2 w-52 z-10'>
            <p
              onClick={() => handleOptionSelect('remove')}
              className='hover:bg-neutral-700 p-2 rounded cursor-pointer flex flex-row items-center'
            >
              <IoRemoveCircleOutline className='mr-3' />
              Remove from Playlist
            </p>
            <p
              onClick={() => handleOptionSelect('song')}
              className='hover:bg-neutral-700 p-2 rounded cursor-pointer flex flex-row items-center'
            >
              <IoRadio className='mr-3' />
              View song
            </p>
            <p
              onClick={() => handleOptionSelect('artist')}
              className='hover:bg-neutral-700 p-2 rounded cursor-pointer flex flex-row items-center'
            >
              <IoPersonOutline className='mr-3' />
              View artist
            </p>
            <p
              onClick={() => handleOptionSelect('share')}
              className='hover:bg-neutral-700 p-2 rounded cursor-pointer flex flex-row items-center'
            >
              <IoShareOutline className='mr-3' />
              Share
            </p>
          </div>
        </div>
      )}
      {showOptions && type === 'search' && (
        <div ref={optionsRef} className='relative'>
          <div className='flex flex-col absolute right-16 -top-3 bg-neutral-800 text-white text-sm font-normal rounded-md shadow-lg p-2 w-36 z-10'>
            <p
              onClick={() => handleOptionSelect('song')}
              className='hover:bg-neutral-700 p-2 rounded cursor-pointer flex flex-row items-center'
            >
              <IoRadio className='mr-3' />
              View song
            </p>
            <p
              onClick={() => handleOptionSelect('artist')}
              className='hover:bg-neutral-700 p-2 rounded cursor-pointer flex flex-row items-center'
            >
              <IoPersonOutline className='mr-3' />
              View artist
            </p>
            <p
              onClick={() => handleOptionSelect('share')}
              className='hover:bg-neutral-700 p-2 rounded cursor-pointer flex flex-row items-center'
            >
              <IoShareOutline className='mr-3' />
              Share
            </p>
          </div>
        </div>
      )}
    </div>
    
  );
};

export default MediaItem;