import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const getCurrentUser = async () => {
  const cookieStore = await cookies();

  const supabase = createServerComponentClient({
    cookies: () => cookieStore
  });

  const { data: { user } } = await supabase.auth.getUser();

  return user;
};

export default getCurrentUser;