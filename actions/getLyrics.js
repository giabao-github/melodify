import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const getLyrics = async (title, author) => {
  const cookieStore = await cookies();

  const supabase = createServerComponentClient({
    cookies: () => cookieStore
  });

  if (!title && !author) {
    return '♪ Lyrics for this song is not available yet!';
  }

  const { data, error } = await supabase
    .from('songs')
    .select('lyrics')
    .ilike('title', `%${title || ''}%`)
    .ilike('author', `%${author || ''}%`)
    .order('created_at', { ascending: false });

    if (error) {
      console.log("An error occurred while retrieving song lyrics: ", error);
      return '♪ Error while retrieving lyrics!';
    }

    if (data === '') {
      return '♪ Enjoy instrumental music...';
    }

    return data[0]?.lyrics || '♪ Lyrics is not found!';
};

export default getLyrics;
