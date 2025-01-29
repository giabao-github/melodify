import './globals.css';
import { Figtree, Nunito } from 'next/font/google';
import SupabaseProvider from './providers/SupabaseProvider';
import UserProvider from './providers/UserProvider';
import ModalProvider from './providers/ModalProvider';
import ToasterProvider from './providers/ToasterProvider';
import getSongsByUserId from '../actions/getSongsByUserId';
import Player from './components/Player';
import ClientOnly from './components/ClientOnly';
import Sidebar from './components/Sidebar';
import getActiveProducts from '../actions/getActiveProducts';
import getPlaylistsByUserId from '../actions/getPlaylistsByUserId';


const figtree = Figtree({ subsets: ['latin'] });
const nunito = Nunito({ subsets: ['latin', 'vietnamese'] });

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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const userSongs = await getSongsByUserId();
  const userPlaylists = await getPlaylistsByUserId();
  const products = await getActiveProducts();

  return (
    <html lang='en'>
      <title>Melodify | Music For Everyone</title>
      <ClientOnly>
        <body className={`${figtree.className} ${nunito.className}`}>
          <ToasterProvider />
          <SupabaseProvider>
            <UserProvider>
              <ModalProvider products={products} />
              <Sidebar songs={userSongs} playlists={userPlaylists}>
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


