"use client";

import useGetSongById from '../hooks/useGetSongById';
import useLoadSongUrl from '../hooks/useLoadSongUrl';
import usePlayer from '../hooks/usePlayer';
import React from 'react';
import PlayerContent from './PlayerContent';
import ProgressBar from './ProgressBar';
import useProgressBar from '../hooks/useProgressBar';

const Player = () => {
  const player = usePlayer();
  const { song } = useGetSongById(player.activeId);
  const { sound } = useProgressBar();

  const songUrl = useLoadSongUrl(song);

  if (!song || !songUrl || !player.activeId) {
    return null;
  }

  return (
    <div>
      <title>{`Melodify | ${song.title} - ${song.author}`}</title>
      <ProgressBar sound={sound} /> 
      <div className='fixed bottom-0 bg-transparent w-full py-2 px-4 h-[84px]'>
        <PlayerContent
          key={songUrl}
          song={song}
          songUrl={songUrl}
        />
      </div>
    </div>
  );
};

export default Player;
