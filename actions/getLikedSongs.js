import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const getLikedSongs = async () => {
  const cookieStore = await cookies();

  const supabase = createServerComponentClient({
    cookies: () => cookieStore
  });

  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('liked_songs')
    .select('*, songs(*)')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false });

    if (error) {
      console.log("An error occurred: ", error);
      return [];
    }

    if (!data) {
      return [];
    }

    return data.map((item) => ({
      ...item.songs
    }));
};

export default getLikedSongs;