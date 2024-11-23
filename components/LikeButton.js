"use client";

import useAuthModal from '@/hooks/useAuthModal';
import { useUser } from '@/hooks/useUser';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FaHeart, FaRegHeart } from "react-icons/fa6";

const LikeButton = ({ songId }) => {
  const router = useRouter();
  const { supabaseClient } = useSessionContext();

  const authModal = useAuthModal();
  const { user } = useUser();

  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const fetchData = async () => {
      const { data, error } = await supabaseClient
        .from('liked_songs')
        .select('*')
        .eq('user_id', user.id)
        .eq('song_id', songId)
        .single();
      
      if (!error && data) {
        setIsFavorite(true);
      }
    };

    fetchData();
  }, [songId, supabaseClient, user?.id]);

  const Icon = isFavorite ? FaHeart : FaRegHeart;

  const handleLike = async () => {
    if (!user) {
      return authModal.onOpen();
    }

    if (isFavorite) {
      const { error } = await supabaseClient
        .from('liked_songs')
        .delete()
        .eq('user_id', user?.id)
        .eq('song_id', songId);
      
      if (error) {
        toast.error(error.message);
      } else {
        setIsFavorite(false);
        toast.remove();
        toast.error('Removed from Favorite');
      }
    } else {
      const { error } = await supabaseClient
        .from('liked_songs')
        .insert({
          song_id: songId,
          user_id: user.id,
        });
      
      if (error) {
        toast.error(error.message);
      } else {
        setIsFavorite(true);
        toast.remove();
        toast.success('Added to Favorite');
      }
    }

    router.refresh();
  }

  return (
    <button onClick={handleLike} className='hover:opacity-75 transition'>
      <Icon color={isFavorite ? '#18FFFF' : 'white'} size={22} />
    </button>
  );
};

export default LikeButton;