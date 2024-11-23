import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const getSongsByUserId = async () => {
  const supabase = createServerComponentClient({
    cookies: cookies
  });

  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    console.log('User error occurred: ', userError.message);
    return [];
  } 

  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: false });

    if (error) {
      console.log('An unexpected error: ', error.message);
    }

    return data || [];
};

export default getSongsByUserId;