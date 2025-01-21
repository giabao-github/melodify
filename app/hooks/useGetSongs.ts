import { Song } from '../../types';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

const useGetSongs = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [songs, setSongs] = useState<Song[]>([]);
  const { supabaseClient } = useSessionContext();

  useEffect(() => {
    setIsLoading(true);

    const fetchSong = async () => {
      const { data, error } = await supabaseClient
        .from('songs')
        .select('*')
      
      if (error) {
        setIsLoading(false);
        toast.remove();
        return toast.error(error.message);
      }

      setSongs(data as Song[]);
      setIsLoading(false);
    }

    fetchSong();
  }, [supabaseClient]);

  return useMemo(() => ({
    isLoading,
    songs
  }), [isLoading, songs]);
};

export default useGetSongs;