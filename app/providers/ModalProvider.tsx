"use client";

import AuthModal from '../components/AuthModal';
import UploadModal from '../components/UploadModal';
import OptionsModal from '../components/OptionsModal';
import React, { useEffect, useState } from 'react';
import useLyricsModal from '../hooks/useLyricsModal';
import LyricsModal from '../components/LyricsModal';
import SubscribeModal from '../components/SubscribeModal';
import { ProductWithPrice } from '../../types';
import usePlayer from '../hooks/usePlayer';
import PlaylistModal from '../components/PlaylistModal';


interface ModalProviderProps {
  products: ProductWithPrice[];
}

const ModalProvider: React.FC<ModalProviderProps> = ({ products }) => {
  const [isMounted, setIsMounted] = useState(false);
  const { song } = useLyricsModal();
  const { songs, activeId } = usePlayer();
  const activeSong = songs.find((song) => song.id === activeId);

  useEffect(() => {
    setIsMounted(true); 
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <OptionsModal />
      <AuthModal />
      <UploadModal />
      <LyricsModal song={song} />
      <PlaylistModal songs={songs} activeSong={activeSong} />
      <SubscribeModal products={products} />
    </>
  );
}

export default ModalProvider;