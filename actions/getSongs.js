import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const getSongs = async () => {
  const cookieStore = await cookies();

  const supabase = createServerComponentClient({
    cookies: () => cookieStore
  });

  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .order('created_at', { ascending: false });

    if (error) {
      console.log("An error occurred: ", error);
    }

    return data || [];
};

export default getSongs;