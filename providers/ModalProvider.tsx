"use client";

import AuthModal from "@/components/AuthModal";
import UploadModal from "@/components/UploadModal";
import OptionsModal from "@/components/OptionsModal";
import React, { Suspense, useEffect, useState } from "react";
import useLyricsModal from "@/hooks/useLyricsModal";
import LyricsModal from "@/components/LyricsModal";


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