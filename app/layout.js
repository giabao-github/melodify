import Sidebar from "@/components/Sidebar";
import "./globals.css";
import { Figtree, Nunito, Geologica } from "next/font/google";
import SupabaseProvider from '@/providers/SupabaseProvider';
import UserProvider from '@/providers/UserProvider';
import ModalProvider from '@/providers/ModalProvider';
import ToasterProvider from '@/providers/ToasterProvider';
import getSongsByUserId from '@/actions/getSongsByUserId';
import Player from '@/components/Player';
import { headers } from "next/headers";
import Box from "@/components/Box";
import Image from "next/image";
import Link from "next/link";
import Page404 from "./not-found";
import toast from "react-hot-toast";


const figtree = Figtree({ subsets: ["latin"] });
const nunito = Nunito({ subsets: ["latin", "vietnamese"] });
const geologica = Geologica({ subsets: ["latin", "cyrillic", "vietnamese", "greek"]});

export const metadata = {
  description: "Explore the world of music with a seamless experience.",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png' },
    ],
  }
};

export const revalidate = 0;

export default async function RootLayout({ children }) {
  const headersList = headers();
  const protocol = headersList.get("x-forwarded-proto") || "http";
  const host = headersList.get("host");
  const referer = headersList.get("referer");

  // Reconstruct the full URL
  const fullURL = `${protocol}://${host}${referer ? new URL(referer).pathname : ""}`;

  // Parse the URL and strip the query parameters
  const urlObject = new URL(fullURL);
  const cleanURL = `${protocol}://${host}${urlObject.pathname}`;
  console.log("url:", cleanURL);
  
  // Check if the clean URL is one of the allowed routes
  const allowedURLs = [
    'http://localhost:3000/',
    'http://localhost:3000/search',
    'http://localhost:3000/generate',
    'http://localhost:3000/favorite'
  ];

  if (allowedURLs.includes(cleanURL)) {
    const userSongs = await getSongsByUserId();
    try {
      return (
        <html lang="en">
          <title>Melodify | Music For Everyone</title>
          <body className={`${figtree.className} ${nunito.className}`}>
            <ToasterProvider />
            <SupabaseProvider>
              <UserProvider>
                <ModalProvider />
                <Sidebar songs={userSongs}>
                  {children}
                </Sidebar>
                <Player />
              </UserProvider>
            </SupabaseProvider>
          </body>
        </html>
      );
    } catch (error) {
      console.log(error);
      toast.remove();
      toast.error(error);
      return (
        <Page404 pageTitle='Melodify | Page Not Found' title='Something went wrong.' description='We were unable to find the page you were looking for.' />
      );
    }
  }
  return (
    <Page404 pageTitle='Melodify | Page Not Found' title='Page not found.' description='We were unable to find the page you were looking for.' />
  );

}

