import getSongsByAuthor from '../../actions/getSongsByAuthor';
import getSongsByTitle from '../../actions/getSongsByTitle';
import Search from './components/Search';


export const revalidate = 0;

interface SearchProps {
  searchParams: {
    title: string;
  }
}

const SearchPage = async ({ searchParams }: SearchProps) => {
  const resolvedSearchParams = await searchParams;
  const { title = '' } = resolvedSearchParams;
  const [songs, authors] = await Promise.all([
    getSongsByTitle(title),
    getSongsByAuthor(title),
  ]);

  return (
    <>
      <title>Melodify | Search</title>
      <Search title={songs} authors={authors} />
    </>
  );
};

export default SearchPage;
