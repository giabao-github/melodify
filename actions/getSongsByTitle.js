import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import getSongs from './getSongs';

const getSongsByTitle = async (title) => {
  const cookieStore = await cookies();

  const supabase = createServerComponentClient({
    cookies: () => cookieStore
  });

  if (!title) {
    const allSongs = await getSongs();
    return allSongs;
  }

  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .ilike('title', `%${title}%`)
    .order('created_at', { ascending: false });

    if (error) {
      console.log("An error occurred: ", error);
    }

    return data || [];
};

export default getSongsByTitle;