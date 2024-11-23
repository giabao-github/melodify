"use client";

import useLoadImage from '@/hooks/useLoadImage';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import { GoKebabHorizontal } from "react-icons/go";
import { PiPlusCircleBold } from "react-icons/pi";
import { IoRadio, IoPersonOutline, IoShareOutline, IoRemoveCircleOutline } from "react-icons/io5";


const MediaItem = ({ data, onClick, type }) => {
  const imageUrl = useLoadImage(data);
  const [showOptions, setShowOptions] = useState(false);
  const optionsRef = useRef(null);
  const buttonRef = useRef(null);
  const genres = data.genre.split(',');

  const handleClick = () => {
    if (onClick) {
      return onClick(data.id);
    }
  }

  const handleOptionClick = (event) => {
    event.stopPropagation();
    setShowOptions(prev => !prev);
  }

  const handleOptionSelect = (option) => {
    setShowOptions(false);
  }

  const formatTime = (seconds) => {
    if (seconds < 0) seconds = 0;
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
    const handleClickOutside = (event) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target) && !buttonRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div>
      <div
        onClick={handleClick}
        className='flex items-center gap-x-3 cursor-pointer hover:bg-gradient-to-r from-purple-800 to-purple-500 w-full h-full px-3 py-2 rounded-md select-none'
      >
        <div className='relative rounded-md min-h-[48px] min-w-[48px] overflow-hidden'>
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
            className='flex flex-col gap-y-1 overflow-hidden'
          >
            <p className='text-white text-base font-medium truncate'>
              {data.title.length > 18 ? data.title.slice(0, 18) + "..." : data.title}
            </p>
            <div className={`flex justify-between min-w-[168px]`}>
              <p className='text-neutral-300 text-sm font-medium truncate'>
                {data.author.length > 16 ? data.author.slice(0, 16) + "..." : data.author}
              </p>
              <div ref={buttonRef}>
                <GoKebabHorizontal 
                  onClick={handleOptionClick}
                  size={24}
                  className='p-[2px] text-white hover:text-primaryAccent hover:bg-neutral-600/40 hover:stroke-1 cursor-pointer transition rounded-full' 
                />
              </div>
            </div>
          </div>
        )}
        {type === 'search' && (
          <div className='flex flex-row justify-between gap-y-1 overflow-hidden w-full'>
            <div className='flex flex-col'>
              <p className='text-white text-base font-medium truncate'>
                {data.title.length > 100 ? data.title.slice(0, 100) + "..." : data.title}
              </p>
              <div className={`flex justify-between min-w-96`}>
                <p className='text-neutral-300 text-sm font-medium truncate'>
                  {data.author.length > 80 ? data.author.slice(0, 80) + "..." : data.author}
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
                <PiPlusCircleBold
                  size={24}
                  className='p-[2px] text-white hover:text-primaryAccent hover:bg-neutral-600/40 hover:stroke-1 cursor-pointer transition rounded-full' 
                />
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
          <div className='flex flex-row gap-y-1 overflow-hidden'>
            <div className='flex flex-col max-w-fit'>
              <p className='text-white text-base font-medium truncate'>
                {data.title.length > 30 ? data.title.slice(0, 30) + "..." : data.title}
              </p>
              <div className={`flex justify-between`}>
                <p className='text-neutral-300 text-sm font-medium truncate'>
                  {data.author.length > 32 ? data.author.slice(0, 32) + "..." : data.author}
                </p>
              </div>
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
              Remove from Library
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