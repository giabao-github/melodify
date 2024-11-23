import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server"

export const middleware = async (req) => {
  const res = NextResponse.next();
  const url = req.nextUrl;

  if (url.pathname === '/' || url.pathname === '/search' || url.pathname === '/generate' || url.pathname === '/favorite') {
    const supabase = createMiddlewareClient({ req, res });
  
    await supabase.auth.getUser();
    return res;
  }
};