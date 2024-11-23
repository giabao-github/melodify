"use client";

import SongItem from '@/components/SongItem';
import useOnPlay from '@/hooks/useOnPlay';
import usePlayer from '@/hooks/usePlayer';
import useSong from '@/hooks/useSong';
import { useUser } from '@/hooks/useUser';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { BounceLoader } from 'react-spinners';


const PageContent = ({ songs }) => {
  const [targetSong, setTargetSong] = useState(null);
  const [sortedSongs, setSortedSongs] = useState(songs);
  const [counter, setCounter] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const onPlay = useOnPlay(sortedSongs);
  const { song, setSong } = useSong();
  const { user } = useUser();
  const { ids, setIds } = usePlayer();
  const supabaseClient = useSupabaseClient();

  const songExists = (song) => {
    const idSet = new Set(song.map(item => item.id));
    return songs.some(item => idSet.has(item.id));
  };

  const calculateRelevance = (song, topSong) => {
    let relevance = 0;

    // Helper function to calculate score based on matches
    const calculateMatchScore = (songField, topSongField, scorePerMatch) => {
      const songSet = new Set(songField.split(',').map(s => s.trim().toLowerCase()));
      const topSongSet = new Set(topSongField.split(',').map(s => s.trim().toLowerCase()));
      let matches = 0;
      for (const item of songSet) {
        if (topSongSet.has(item)) 
          matches++;
      }
      return matches * scorePerMatch;
    };

    // Calculate relevance for author
    relevance += calculateMatchScore(song.author, topSong.author, 30);
    // Calculate relevance for genre
    relevance += calculateMatchScore(song.genre, topSong.genre, 20);
    // Calculate relevance for album
    relevance += calculateMatchScore(song.album, topSong.album, 10);

    return relevance;
  }

  useEffect(() => {
    const fetchTopSongs = async () => {
      const { data: topSongs, error: topSongsError } = await supabaseClient
        .from('songs')
        .select('*')
        .eq('user_id', user.id)
        .order('play_count', { ascending: false })
        .limit(5);

      if (topSongsError) {
        console.error("Error fetching top song:", topSongsError);
        toast.remove();
        toast.error(topSongsError.message);
        return;
      }

      const randomIndex = Math.floor(Math.random() * topSongs.length);
      setTargetSong(topSongs[randomIndex]);
    }
    
    if (songs && user && !targetSong)
      fetchTopSongs();
  }, [songs, supabaseClient, targetSong, user]);

  useEffect(() => {
    if (!targetSong) return;

    const fetchAllSongs = async () => {
      const { data: allSongs, error: allSongsError } = await supabaseClient
        .from('songs')
        .select('*');

      if (allSongsError) {
        console.error("Error fetching all songs:", allSongsError);
        toast.remove();
        toast.error(allSongsError.message);
        return;
      }

      const sorted = allSongs.sort((a, b) => {
        const relevanceA = calculateRelevance(a, targetSong);
        const relevanceB = calculateRelevance(b, targetSong);
        return relevanceB - relevanceA;
      });
      setSortedSongs(sorted);
      const sortedIds = sorted.map(song => song.id);
      setIds(sortedIds);
      console.log("set ids")
      setLoading(false);
      setCounter(counter + 1);
    };
    fetchAllSongs();
    // console.log(`Target: ${targetSong.id}, ids: ${ids}`)

  }, [counter, ids, setIds, supabaseClient, targetSong]);

  if (songs.length === 0) {
    return (
      <div className='mt-40 text-neutral-400 text-xl shadow-lg flex justify-center'>
        No song recommendations for you. Let&apos;s start&nbsp;
        <Link className='hover:text-primaryAccent' href='/search'>browsing</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className='mt-40 text-xl flex justify-center items-center flex-col'>
        <BounceLoader color="#18FFFF" loading={true} size={50} className='animate-bounce' />
        <span className='mt-3 text-white'>Loading user data...</span>
      </div>
    );
  }
  else {
    console.log(`target: ${targetSong.title}, sorted songs: ${sortedSongs.map(song => ' ' + song.title)}`)
    return (
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 mt-4'>
        {sortedSongs.map((item) => (
          <SongItem
            onClick={(id) => onPlay(id)}
            onAdd={(data) => {
              song.push(data);
              if (JSON.stringify(song) !== '[]') {
                const existingIds = new Set(song.map(item => item.id));
                sortedSongs.forEach(item => {
                  if (!existingIds.has(item.id)) {
                    song.push(item);
                  }
                })
              }
            }}
            key={item.id}
            data={item}
          />
        ))}
      </div>
    );
  }
};

export default PageContent;