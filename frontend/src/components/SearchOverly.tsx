import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { fetchMovies } from '../api/MovieAPI';
import { Movie } from '../types/Movie';

interface Props {
  onClose: () => void;
}

const SearchOverlay: React.FC<Props> = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const handleSearch = async () => {
    try {
      const data = await fetchMovies(50, 1, [], query);
      setResults(data.movies);

      // Reset scroll to top
      if (resultsRef.current) {
        resultsRef.current.scrollTop = 0;
      }
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClickMovie = (id: string) => {
    onClose(); // Close overlay
    navigate(`/movies/${id}`);
  };

  return (
    <Overlay>
      <LeftPanel>
        <BackButton onClick={onClose}>← Back</BackButton>
        <SearchInput
          type="text"
          placeholder="Search for a movie..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <SearchBtn onClick={handleSearch}>Search</SearchBtn>
      </LeftPanel>
      <RightPanel ref={resultsRef}>
        {results.length > 0 ? (
          <ResultsGrid>
            {results.map((movie) => (
              <MovieCard key={movie.show_id} onClick={() => handleClickMovie(movie.show_id)}>
                <PosterStub />
                <Title>{movie.title}</Title>
                <Meta>{movie.release_year} • {movie.rating}</Meta>
              </MovieCard>
            ))}
          </ResultsGrid>
        ) : (
          <EmptyText>Start typing to search for movies...</EmptyText>
        )}
      </RightPanel>
    </Overlay>
  );
};

export default SearchOverlay;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #141414;
  color: white;
  display: flex;
  z-index: 9999;
`;

const LeftPanel = styled.div`
  width: 30%;
  padding: 40px 30px;
  background: #1a1a1a;
  display: flex;
  flex-direction: column;
  gap: 20px;
  border-right: 1px solid #333;
`;

const RightPanel = styled.div`
  flex: 1;
  padding: 40px;
  overflow-y: auto;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #ccc;
  font-size: 1rem;
  text-align: left;
  cursor: pointer;

  &:hover {
    color: white;
  }
`;

const SearchInput = styled.input`
  padding: 10px;
  font-size: 1rem;
  background: #222;
  color: white;
  border: 1px solid #444;
  border-radius: 4px;
`;

const SearchBtn = styled.button`
  background: #e50914;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;

  &:hover {
    background: #b20710;
  }
`;

const ResultsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
`;

const MovieCard = styled.div`
  width: 160px;
  cursor: pointer;

  &:hover {
    opacity: 0.85;
  }
`;

const PosterStub = styled.div`
  width: 100%;
  height: 240px;
  background: #333;
  border-radius: 6px;
`;

const Title = styled.h4`
  font-size: 1rem;
  margin: 8px 0 4px;
  color: #fff;
`;

const Meta = styled.p`
  font-size: 0.875rem;
  color: #aaa;
  margin: 0;
`;

const EmptyText = styled.p`
  color: #666;
  font-size: 1rem;
`;
