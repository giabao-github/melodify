"use client";

import React, { useEffect, useState } from 'react';
import useLyricsModal from '../hooks/useLyricsModal';
import InteractiveModal from './InteractiveModal';
import { Song } from '../../types';


interface LyricsModalProps {
  song: Song;
}

const LyricsModal: React.FC<LyricsModalProps> = ({ song }) => {
  const { onClose, isOpen } = useLyricsModal();
  const [lyrics, setLyrics] = useState(song?.lyrics);
  const [empty, setEmpty] = useState(true);

  const onChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  }

  useEffect(() => {
    if (isOpen) {
      setLyrics(song?.lyrics);
      if (!song?.title || !song?.author) {
        setEmpty(true);
        setLyrics('♪\u00A0\u00A0Lyrics is loading...');
      } else {
        setEmpty(false);
      }
      if (song?.lyrics === '') {
        setEmpty(true);
        setLyrics('♪\u00A0\u00A0Enjoy instrumental music...');
      } else {
        setEmpty(false);
      }
    }
  }, [isOpen, song?.title, song?.author, song?.lyrics])


  return (
    <InteractiveModal
      title={song?.title}
      description={song?.author}
      isOpen={isOpen}
      onChange={onChange}
    >
      <div className={`h-[61vh] max-h-[95vh] overflow-y-auto p-4 text-2xl font-bold tracking-wider leading-normal whitespace-pre-wrap flex justify-center ${empty ? 'items-center' : ''}`}>
        {lyrics}
      </div>
    </InteractiveModal>
  );
}

export default LyricsModal;
