"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { BounceLoader } from 'react-spinners';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Playlist, Song } from '../../../types';
import SongItem from '../../components/SongItem';
import useOnPlay from '../../hooks/useOnPlay';
import usePlayer from '../../hooks/usePlayer';
import { useUser } from '../../hooks/useUser';


interface PageContentProps {
  songs: Song[];
  playlists: Playlist[];
}

const PageContent: React.FC<PageContentProps> = ({ songs, playlists }) => {
  const [targetSong, setTargetSong] = useState(null);
  const [noData, setNoData] = useState(false);
  const [sortedSongs, setSortedSongs] = useState<Song[]>(songs);
  const [loading, setLoading] = useState(false);
  
  const onPlay = useOnPlay(sortedSongs);
  const { user } = useUser();
  const { setIds } = usePlayer();
  const supabaseClient = useSupabaseClient();


  const calculateRelevance = (song: any, topSong: any) => {
    let relevance = 0;

    // Helper function to calculate score based on matches
    const calculateMatchScore = (songField: string, topSongField: string, scorePerMatch: number) => {
      const songSet = new Set(songField.split(',').map(s => s.trim().toLowerCase()));
      const topSongSet = new Set(topSongField.split(',').map(s => s.trim().toLowerCase()));
      let matches = 0;
      for (const item of songSet) {
        if (topSongSet.has(item)) {
          matches++;
        }
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

  // useEffect(() => {
  //   const fetchTopSongs = async () => {
  //     const { data: topSongs, error: topSongsError } = await supabaseClient
  //       .from('songs')
  //       .select('*')
  //       .eq('user_id', user?.id)
  //       .order('play_count', { ascending: false })
  //       .limit(5);

  //     if (topSongsError) {
  //       console.error('Error fetching top song:', topSongsError);
  //       toast.remove();
  //       toast.error(topSongsError.message);
  //       return;
  //     }

  //     if (topSongs.length === 0) {
  //       setNoData(true);
  //       return;
  //     }

  //     const randomIndex = Math.floor(Math.random() * topSongs.length);
  //     setTargetSong(topSongs[randomIndex]);
  //   }
    
  //   if (songs && user && !targetSong && !noData) {
  //     fetchTopSongs();
  //   } else {
  //     setLoading(false);
  //   }
  // }, [noData, songs, supabaseClient, targetSong, user]);

  // useEffect(() => {
  //   if (!targetSong) {
  //     return;
  //   }

  //   const fetchAllSongs = async () => {
  //     const { data: allSongs, error: allSongsError } = await supabaseClient
  //       .from('songs')
  //       .select('*')
  //       .eq('user_id', user?.id);

  //     if (allSongsError) {
  //       console.error('Error fetching all songs:', allSongsError);
  //       toast.remove();
  //       toast.error(allSongsError.message);
  //       return;
  //     }

  //     const sorted = allSongs.sort((a, b) => {
  //       const relevanceA = calculateRelevance(a, targetSong);
  //       const relevanceB = calculateRelevance(b, targetSong);
  //       return relevanceB - relevanceA;
  //     });
  //     setSortedSongs(sorted);
  //     const sortedIds = sorted.map(song => song.id);
  //     setIds(sortedIds);
  //     setLoading(false);
  //   };

  //   if (user && targetSong) {
  //     fetchAllSongs();
  //   }
  // }, [supabaseClient, targetSong, user]);

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
        <BounceLoader color='#18FFFF' loading={true} size={50} className='animate-bounce' />
      </div>
    );
  }
  else {
    return (
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 mt-4'>
        {sortedSongs.map((item) => (
          <SongItem
            onClick={(id: string) => onPlay(id)}
            key={item.id}
            data={item}
            songs={songs}
          />
        ))}
      </div>
    );
  }
};

export default PageContent;