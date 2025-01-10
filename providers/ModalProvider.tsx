"use client";

import AuthModal from "../app/components/AuthModal";
import UploadModal from "../app/components/UploadModal";
import OptionsModal from "../app/components/OptionsModal";
import React, { useEffect, useState } from "react";
import useLyricsModal from "../app/hooks/useLyricsModal";
import LyricsModal from "../app/components/LyricsModal";


const ModalProvider = () => {
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
    </>
  );
}

export default ModalProvider;