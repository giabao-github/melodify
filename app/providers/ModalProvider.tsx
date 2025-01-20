"use client";

import AuthModal from '../components/AuthModal';
import UploadModal from '../components/UploadModal';
import OptionsModal from '../components/OptionsModal';
import React, { useEffect, useState } from 'react';
import useLyricsModal from '../hooks/useLyricsModal';
import LyricsModal from '../components/LyricsModal';
import SubscribeModal from '../components/SubscribeModal';
import { ProductWithPrice } from '../../types';


interface ModalProviderProps {
  products: ProductWithPrice[];
}

const ModalProvider: React.FC<ModalProviderProps> = ({ products }) => {
  const [isMounted, setIsMounted] = useState(false);
  const { song } = useLyricsModal();

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
      <SubscribeModal products={products} />
    </>
  );
}

export default ModalProvider;