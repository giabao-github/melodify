import getSongsByAuthor from "../../actions/getSongsByAuthor";
import getSongsByTitle from "../../actions/getSongsByTitle";
import Search from "./components/Search";

export const revalidate = 0;

const SearchPage = async ({ searchParams }) => {
  const songs = await getSongsByTitle(searchParams.title);
  const authors = await getSongsByAuthor(searchParams.title);

  return (
    <Search songs={songs} authors={authors} />
  );
};

export default SearchPage;
