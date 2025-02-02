"use client";

import React, { useState } from 'react';
import SearchInput from '../../components/SearchInput';
import SearchContent from './SearchContent';
import Header from '../../components/Header'
import GenreFilter from './GenreFilter';
import { Song } from '../../../types';


interface SearchProps {
  title: Song[],
  authors: Song[]
}

const Search: React.FC<SearchProps> = ({ title, authors }) => {
  const genres = ['Indie', 'Electronic/Dance', 'Pop', 'Rock', 'HipHop', 'Rap', 'R&B/Soul', 'Instrumental'];
  
  const [selectedGenres, setSelectedGenres] = useState(
    Array(genres.length).fill(false)
  );

  const filteredSongs = title.filter((song) =>
    selectedGenres.every((isSelected, index) =>
      !isSelected || song.genre?.toLowerCase().includes(genres[index].toLowerCase())
    )
  );

  const filteredAuthors = authors.filter((author) =>
    selectedGenres.every((isSelected, index) =>
      !isSelected || author.genre?.toLowerCase().includes(genres[index].toLowerCase())
    )
  );

  const displaySongs = selectedGenres.some(Boolean) ? filteredSongs : title;
  const displayAuthors = selectedGenres.some(Boolean) ? filteredAuthors : authors;

  return (
    
    <div className='bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto'>
      <Header>
        <div className='mb-2 flex flex-col gap-y-6'>
          <h1 className='text-white text-4xl font-bold my-6 mx-4'>Search</h1>
          <SearchInput />
          <GenreFilter genres={genres} selectedGenres={selectedGenres} setSelectedGenres={setSelectedGenres} />
        </div>
      </Header>
      <SearchContent title={displaySongs} authors={displayAuthors} />
    </div>
  );
};

export default Search;
