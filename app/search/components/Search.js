"use client";

import React, { useState } from "react";
import Header from "../../components/Header";
import SearchInput from "../../components/SearchInput";
import SearchContent from "./SearchContent";
import GenreFilter from "./GenreFilter";

const Search = ({ songs, authors }) => {
  const genres = ["Indie", "Electronic/Dance", "Pop", "Rock", "HipHop", "Rap", "R&B/Soul", "Instrumental"];
  
  const [selectedGenres, setSelectedGenres] = useState(
    Array(genres.length).fill(false)
  );

  const filteredSongs = songs.filter((song) =>
    selectedGenres.every((isSelected, index) =>
      !isSelected || song.genre?.toLowerCase().includes(genres[index].toLowerCase())
    )
  );

  const filteredAuthors = authors.filter((author) =>
    selectedGenres.every((isSelected, index) =>
      !isSelected || author.genre?.toLowerCase().includes(genres[index].toLowerCase())
    )
  );

  const displaySongs = selectedGenres.some(Boolean) ? filteredSongs : songs;
  const displayAuthors = selectedGenres.some(Boolean) ? filteredAuthors : authors;

  return (
    <div className="bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto">
      <Header>
        <div className="mb-2 flex flex-col gap-y-6">
          <h1 className="text-white text-4xl font-bold my-4 mx-4">Search</h1>
          <SearchInput />
          <GenreFilter genres={genres} selectedGenres={selectedGenres} setSelectedGenres={setSelectedGenres} />
        </div>
      </Header>
      <SearchContent songs={displaySongs} authors={displayAuthors} />
    </div>
  );
};

export default Search;
