import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

const getPlaylistsByUserId = async () => {
  const supabase = createServerComponentClient({
    cookies: cookies
  });

  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    return [];
  } 

  const { data, error } = await supabase
    .from('playlists')
    .select('*')
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: false });

    if (error) {
      console.log('An unexpected error: ', error.message);
    }

    return (data as any) || [];
};

export default getPlaylistsByUserId;