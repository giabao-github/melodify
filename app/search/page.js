import getSongsByAuthor from '../../actions/getSongsByAuthor';
import getSongsByTitle from '../../actions/getSongsByTitle';
import Search from './components/Search';

export const revalidate = 0;

const SearchPage = async ({ searchParams }) => {
  const resolvedSearchParams = await searchParams;
  const { title = '' } = resolvedSearchParams;
  const [songs, authors] = await Promise.all([
    getSongsByTitle(title),
    getSongsByAuthor(title),
  ]);

  return (
    <>
      <title>Melodify | Search</title>
      <Search songs={songs} authors={authors} />
    </>
  );
};

export default SearchPage;
