import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { Song } from '../types';


const calculateRelevance = (song: Song, topSong: Song) => {
  let relevance = 0;

  // Helper function to calculate score based on matches
  const calculateMatchScore = (songField: string, topSongField: string, scorePerMatch: number) => {
    if (!songField || !topSongField) {
      return 0;
    }

    const songSet = new Set(songField.toLowerCase().split(',').map(s => s.trim()));
    const topSongSet = new Set(topSongField.toLowerCase().split(',').map(s => s.trim()));

    const matches = [...songSet].filter(item => topSongSet.has(item)).length;

    return matches * scorePerMatch;
  };

  relevance += calculateMatchScore(song.author || '', topSong.author || '', 30);
  relevance += calculateMatchScore(song.genre || '', topSong.genre || '', 20);
  relevance += calculateMatchScore(song.album || '', topSong.album || '', 10);

  return relevance;
}

let sessionCache: { [userId: string]: { targetSongId: number | null, expiry: number } } = {};

const getSongs = async (): Promise<Song[]> => {
  const supabase = createServerComponentClient({
    cookies: cookies,
  });

  const { data: user, error: userError } = await supabase.auth.getUser();

  if (userError || !user.user) {
    console.error('Error fetching user:', userError);
    return [];
  }

  const userId = user.user.id;
  const currentTime = Date.now();
  const cacheExpiryTime = 5000;

  // Check if cache is valid
  if (sessionCache[userId] && sessionCache[userId].expiry > currentTime) {
    const cachedTargetSongId = sessionCache[userId].targetSongId;
    const { data: allSongs, error: allSongsError } = await supabase
      .from('songs')
      .select('*')
      .order('created_at', { ascending: false });

    if (allSongsError) {
      console.error('Error fetching all songs:', allSongsError);
      return [];
    }

    const targetSong = allSongs.find(song => song.id === cachedTargetSongId);

    if (!targetSong) {
      return allSongs;
    }

    const sorted = allSongs.sort((a: Song, b: Song) => {
      const relevanceA = calculateRelevance(a, targetSong);
      const relevanceB = calculateRelevance(b, targetSong);
      return relevanceB - relevanceA;
    });

    return (sorted as Song[]) || [];
  }

  // Fetch new target song
  const { data: topSongs, error: topSongsError } = await supabase
    .from('songs')
    .select('*')
    .order('play_count', { ascending: false })
    .limit(5);

  if (topSongsError) {
    console.error('Error fetching top songs:', topSongsError);
    return [];
  }

  const { data: likedSongs, error: likedSongsError } = await supabase
    .from('liked_songs')
    .select('*')
    .eq('user_id', userId);

  if (likedSongsError) {
    console.error('Error fetching liked songs:', likedSongsError);
    return [];
  }

  const topIndex = Math.floor(Math.random() * topSongs.length);
  const likeIndex = Math.floor(Math.random() * likedSongs.length);

  const { data: allSongs, error: allSongsError } = await supabase
    .from('songs')
    .select('*')
    .order('created_at', { ascending: false });

  if (allSongsError) {
    console.error('Error fetching all songs:', allSongsError);
    return [];
  }

  const likedSongId = likedSongs[likeIndex]?.song_id;
  const likedSong = allSongs.find(song => song.id === likedSongId);
  const targetSong = likedSong || topSongs[topIndex];

  // Update the cache with new target song and expiry time
  sessionCache[userId] = {
    targetSongId: targetSong ? targetSong.id : null,
    expiry: currentTime + cacheExpiryTime,
  };

  if (!targetSong) {
    return allSongs;
  }

  const sorted = allSongs.sort((a: Song, b: Song) => {
    const relevanceA = calculateRelevance(a, targetSong);
    const relevanceB = calculateRelevance(b, targetSong);
    return relevanceB - relevanceA;
  });

  return (sorted as Song[]) || [];
};


export default getSongs;