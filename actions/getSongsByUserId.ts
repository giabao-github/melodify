import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

const getSongsByUserId = async () => {
  const supabase = createServerComponentClient({
    cookies: cookies
  });

  const { error: userError } = await supabase.auth.getUser();

  if (userError) {
    return [];
  } 

  const { data, error } = await supabase
    .from('songs')
    .select('*');

    if (error) {
      console.log('An unexpected error: ', error.message);
    }

    return (data as any) || [];
};

export default getSongsByUserId;