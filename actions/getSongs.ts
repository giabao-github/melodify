import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { Song } from '../types';


const calculateRelevance = (song: Song, topSong: Song) => {
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

const getSongs = async (): Promise<Song[]> => {
  const supabase = createServerComponentClient({
    cookies: cookies
  });

  const { data: topSongs, error: topSongsError } = await supabase
    .from('songs')
    .select('*')
    .order('play_count', { ascending: false })
    .limit(5);

  if (topSongsError) {
    console.error('Error fetching top song:', topSongsError);
    return [];
  }

  const randomIndex = Math.floor(Math.random() * topSongs.length);
  const targetSong = topSongs[randomIndex];

  if (!targetSong) {
    return [];
  }

  const { data: allSongs, error: allSongsError } = await supabase
    .from('songs')
    .select('*')
    .order('created_at', { ascending: false });

  if (allSongsError) {
    console.error('An error occurred: ', allSongsError);
    return [];
  }

  const sorted = allSongs.sort((a: Song, b: Song) => {
    const relevanceA = calculateRelevance(a, targetSong);
    const relevanceB = calculateRelevance(b, targetSong);
    return relevanceB - relevanceA;
  });
  console.log('target:',targetSong)

  return (sorted as Song[]) || [];
};

export default getSongs;