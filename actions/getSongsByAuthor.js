import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import getSongs from './getSongs';

const getSongsByAuthor = async (author) => {
  const cookieStore = await cookies();

  const supabase = createServerComponentClient({
    cookies: () => cookieStore
  });

  if (!author) {
    const allSongs = await getSongs();
    return allSongs;
  }

  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .ilike('author', `%${author}%`)
    .order('created_at', { ascending: false });

    if (error) {
      console.log("An error occurred: ", error);
    }

    return data || [];
};

export default getSongsByAuthor;