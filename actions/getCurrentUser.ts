import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

const getCurrentUser = async () => {
  const supabase = createServerComponentClient({
    cookies: cookies
  });

  const { data: { user } } = await supabase.auth.getUser();

  return user;
};

export default getCurrentUser;