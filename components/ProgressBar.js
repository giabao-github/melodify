"use client";

import React, { useRef, useState } from 'react';
import Slider from './Slider';
import useProgressBar from '@/hooks/useProgressBar';


const ProgressBar = ({ sound }) => {
  const { progressBarDuration, playedDuration, speed, setProgressBarDuration, setPlayedDuration } = useProgressBar();

  const handleProgressBarClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const newProgress = Math.max(0, Math.min(1, clickPosition / rect.width));
    const newTime = newProgress * progressBarDuration;

    if (sound && typeof sound.seek === 'function') {
      sound.seek(newTime);
      setPlayedDuration(newTime);
    }
  }

  return (
    <div onClick={handleProgressBarClick}>
      <Slider
        label=''
        onChange={(value) => setPlayedDuration(value * progressBarDuration)}
        value={(playedDuration) / progressBarDuration}
        thick='h-2'
        isRounded='rounded-full'
        background='bg-neutral-600'
        foreground='bg-primaryAccent'
        className='h-full'
      />
    </div>
  );
};

export default ProgressBar;