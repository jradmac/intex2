import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { fetchMovies } from '../api/MovieAPI';
import { Movie } from '../types/Movie';
import MovieDetailsModal from './MovieDetailsModal';

const COMMON_GENRES = [
  { display: 'All Genres', value: 'all' },
  { display: 'Action', value: 'action' },
  { display: 'Comedy', value: 'comedy' },
  { display: 'Drama', value: 'drama' },
  { display: 'Thriller', value: 'thriller' },
  { display: 'Horror', value: 'horror' },
  { display: 'Romance', value: 'romance' },
  { display: 'Animation', value: 'animation' },
  { display: 'Adventure', value: 'adventure' },
  { display: 'Sci-Fi', value: 'sci-fi' },
  { display: 'Documentary', value: 'documentary' }
];

interface Props {
  onClose: () => void;
}

const SearchOverlay: React.FC<Props> = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  const handleSearch = async () => {
    try {
      setLoading(true);
      const genresToSend = selectedGenre === 'all' ? [] : [selectedGenre];
      const data = await fetchMovies(50, 1, genresToSend, query);
      setResults(data.movies);
      if (resultsRef.current) resultsRef.current.scrollTop = 0;
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClickMovie = (id: string) => {
    const movie = results.find(m => m.show_id === id);
    if (movie) setSelectedMovie(movie);
  };

  useEffect(() => {
    if (query) handleSearch();
  }, [selectedGenre]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
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

        <FilterLabel>Filter by Genre:</FilterLabel>
        <GenreSelect value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)}>
          {COMMON_GENRES.map(genre => (
            <option key={genre.value} value={genre.value}>
              {genre.display}
            </option>
          ))}
        </GenreSelect>
      </LeftPanel>

      <RightPanel ref={resultsRef}>
        {loading ? (
          <LoadingMessage>Searching movies...</LoadingMessage>
        ) : results.length > 0 ? (
          <>
            <ResultsHeader>
              <ResultsCount>{results.length} results found</ResultsCount>
            </ResultsHeader>
            <ResultsGrid>
              {results.map((movie) => (
                <MovieCard key={movie.show_id} onClick={() => handleClickMovie(movie.show_id)}>
                  {movie.posterUrl ? (
                    <MoviePoster 
                      src={movie.posterUrl} 
                      alt={`${movie.title} poster`}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/placeholder-poster.jpg';
                      }}
                    />
                  ) : (
                    <PosterStub>
                      <PosterTitle>{movie.title}</PosterTitle>
                    </PosterStub>
                  )}
                  <Title>{movie.title}</Title>
                  <Meta>{movie.release_year} • {movie.rating}</Meta>
                  {movie.genres && <GenreText>{movie.genres}</GenreText>}
                </MovieCard>
              ))}
            </ResultsGrid>
          </>
        ) : (
          <EmptyText>
            {query ? 'No movies found. Try different search terms or genre.' : 'Start typing to search for movies...'}
          </EmptyText>
        )}
      </RightPanel>

      {selectedMovie && (
        <MovieDetailsModal
          movie={{
            show_id: selectedMovie.show_id,
            title: selectedMovie.title || '',
            type: selectedMovie.type || '',
            posterUrl: selectedMovie.posterUrl,
            director: selectedMovie.director,
            cast: selectedMovie.cast,
            description: selectedMovie.description,
            rating: selectedMovie.rating,
            duration: selectedMovie.duration,
            releaseYear: selectedMovie.release_year,
            country: selectedMovie.country,
            genre: selectedMovie.genres || '',
            recommendation_type: 'content',
            demographic_segment: '',
            gender: '',
            age_group: '',
            created_at: new Date().toISOString(),
          }}
          onClose={() => setSelectedMovie(null)}
          onSelectMovie={(m) =>
            setSelectedMovie({
              show_id: m.show_id,
              title: m.title,
              type: m.type,
              posterUrl: m.posterUrl,
              director: m.director,
              cast: m.cast,
              description: m.description,
              rating: m.rating,
              duration: m.duration,
              release_year: m.releaseYear,
              country: m.country,
              genres: m.genre,
            })
          }
          
  />
)}

    </Overlay>
  );
};

export default SearchOverlay;

// Original styled components...

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
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
`;

const PosterTitle = styled.div`
  color: #666;
  text-align: center;
  font-size: 0.9rem;
`;

const MoviePoster = styled.img`
  width: 100%;
  height: 240px;
  object-fit: cover;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
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

const FilterLabel = styled.label`
  margin-top: 10px;
  color: #aaa;
  font-size: 0.9rem;
`;

const GenreSelect = styled.select`
  padding: 8px;
  background: #222;
  color: white;
  border: 1px solid #444;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #e50914;
  }
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const ResultsCount = styled.div`
  color: #aaa;
  font-size: 0.9rem;
`;

const FilterTag = styled.div`
  background-color: #e50914;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  display: inline-block;
`;

const GenreText = styled.div`
  font-size: 0.8rem;
  color: #aaa;
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LoadingMessage = styled.div`
  color: #aaa;
  text-align: center;
  padding: 20px;
`;

// Debug components
const DebugPanel = styled.div`
  margin-top: 20px;
  background: #333;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #555;
`;

const DebugTitle = styled.h4`
  color: #e50914;
  margin: 0 0 10px 0;
  font-size: 0.9rem;
`;

const DebugText = styled.div`
  color: #aaa;
  font-size: 0.8rem;
  margin-bottom: 10px;
`;

const DebugButton = styled.button`
  background: #444;
  color: white;
  border: none;
  padding: 5px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  
  &:hover {
    background: #555;
  }
`;