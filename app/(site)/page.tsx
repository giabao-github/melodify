import getPlaylistsByUserId from '../../actions/getPlaylistsByUserId';
import getSongs from '../../actions/getSongs';
import Header from '../components/Header';
import ListItem from '../components/ListItem';
import PageContent from './components/PageContent';
import { Geologica } from 'next/font/google';


export const revalidate = 0;

const geologica = Geologica({ subsets: ['latin', 'cyrillic', 'vietnamese', 'greek']});

export default async function Home() {
  const songs = await getSongs();

  return (
    <div className='bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto'>
      <Header>
        <div className='mb-2'>
          <h1 className='text-white text-3xl font-bold my-8'>
            Welcome back!
          </h1>
          <div className='grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 mt-4 text-xl rounded-md'>
            <ListItem
              image='/images/liked.png'
              name='Favorite Songs'
              href='favorite'
              alt='Favorite Playlist'
            />
          </div>
        </div>
      </Header>
      <div className='mt-2 mb-7 px-6'>
        <div className='flex justify-between items-center px-2 pt-5 pb-10'>
          <h1 className={`text-white text-4xl font-bold ${geologica.className}`}>Recommended For You</h1>
        </div>
        <PageContent songs={songs} />
      </div>
    </div>
  );
}
