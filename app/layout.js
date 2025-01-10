import './globals.css';
import { headers } from 'next/headers';
import { Figtree, Nunito, Geologica } from 'next/font/google';
import SupabaseProvider from '../providers/SupabaseProvider';
import UserProvider from '../providers/UserProvider';
import ModalProvider from '../providers/ModalProvider';
import ToasterProvider from '../providers/ToasterProvider';
import getSongsByUserId from '../actions/getSongsByUserId';
import getCurrentUser from '../actions/getCurrentUser';
import Player from '../app/components/Player';
import ClientOnly from '../app/components/ClientOnly';
import Sidebar from '../app/components/Sidebar';
import Page404 from '../app/not-found.js';


const figtree = Figtree({ subsets: ['latin'] });
const nunito = Nunito({ subsets: ['latin', 'vietnamese'] });
const geologica = Geologica({ subsets: ['latin', 'cyrillic', 'vietnamese', 'greek']});

export const metadata = {
  description: 'Explore the world of music with a seamless experience.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png' },
    ],
  }
};

export const revalidate = 0;

export default async function RootLayout({ children }) {
  const userSongs = await getSongsByUserId();
  const user = await getCurrentUser();
  const allowedPaths = ['/', '/search', '/generate', '/favorite'];
  const headersList = await headers();
  const protocol = headersList.get('x-forwarded-proto') || 'http';
  const host = headersList.get('host');
  const referer = headersList.get('referer');
  const fullURL = `${protocol}://${host}${referer ? new URL(referer).pathname : ''}`;
  const urlObject = new URL(fullURL);

  if (!user) {
    return null;
  }

  if (!allowedPaths.includes(urlObject.pathname)) {
    return <Page404 />
  }

  return (
    <html lang='en'>
      <title>Melodify | Music For Everyone</title>
      <ClientOnly>
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
      </ClientOnly>
    </html>
  );
}


