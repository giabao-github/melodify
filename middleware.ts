import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';

export const middleware = async (req: NextRequest) => {
  const res = NextResponse.next();
  const url = req.nextUrl;

  if (url.pathname === '/' || url.pathname === '/search' || url.pathname === '/generate' || url.pathname === '/favorite' || url.pathname === '/account') {
    const supabase = createMiddlewareClient({ req, res });
  
    await supabase.auth.getUser();
    return res;
  }
};