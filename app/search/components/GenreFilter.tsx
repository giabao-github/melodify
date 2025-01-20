"use client";

interface GenreFilterProps {
  genres: string[];
  selectedGenres: string[];
  setSelectedGenres: React.Dispatch<React.SetStateAction<string[]>>;
}

const GenreFilter: React.FC<GenreFilterProps> = ({ genres, selectedGenres, setSelectedGenres }) => {
  const handleGenreClick = (index: number) => {
    setSelectedGenres((prevSelectedGenres) =>
      prevSelectedGenres.map((selected, i) =>
        i === index ? (selected === genres[index] ? '' : genres[index]) : selected
      )
    );
  };

  return (
    <div className='my-2'>
      {genres.map((genre, index) => (
        <span
          key={index}
          onClick={() => handleGenreClick(index)}
          className={`mx-2 px-3 rounded-full font-medium cursor-pointer select-none border ${
            selectedGenres[index]
              ? 'bg-gradient-to-l from-rose-500 to-teal-500 border-opacity-5'
              : 'bg-neutral-700/50 border-white border-opacity-50'
          }`}
        >
          {genre.trim()}
        </span>
      ))}
    </div>
  );
};

export default GenreFilter;
