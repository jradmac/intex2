import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { fetchMovies } from '../api/MovieAPI';
import { Movie } from '../types/Movie';

// Common movie genres with API mappings
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

// Mapping of additional terms that might appear in genre data
const GENRE_MAPPINGS: Record<string, string[]> = {
  'sci-fi': ['science fiction', 'scifi', 'science-fiction'],
  'action': ['action & adventure', 'action-adventure', 'action and adventure'],
  'comedy': ['romantic comedy', 'comedy-drama', 'sitcom'],
  'thriller': ['crime thriller', 'psychological thriller', 'mystery'],
  'horror': ['supernatural', 'slasher', 'monster'],
  'documentary': ['docuseries', 'documentary series', 'docu']
};

interface Props {
  onClose: () => void;
}

// Direct fetch function for debugging
const directFetchWithLogging = async (url: string) => {
  console.log('Making direct fetch to URL:', url);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error('Direct fetch failed with status:', response.status);
      return null;
    }
    const data = await response.json();
    console.log('Direct fetch succeeded with data count:', data.movies?.length || 0);
    return data;
  } catch (error) {
    console.error('Direct fetch error:', error);
    return null;
  }
};

const SearchOverlay: React.FC<Props> = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [debugMode, setDebugMode] = useState(false); // Toggle for debug features
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  // Function to test different API formats
  const testMultipleGenreFetches = async () => {
    if (!debugMode) return;
    
    setLoading(true);
    console.group('🔍 API FORMAT TESTS');
    
    try {
      // Test 1: Standard API call through fetchMovies
      console.log('TEST 1: Using fetchMovies API');
      const standardResult = await fetchMovies(50, 1, [selectedGenre], query);
      console.log('Results:', standardResult.movies.length);
      
      // Test 2: Direct fetch to API with alternative format
      const baseUrl = 'http://localhost:5000/api/Movie/GetMovies';
      const testUrl1 = `${baseUrl}?pageSize=50&pageNum=1&searchQuery=${encodeURIComponent(query)}&genre=${encodeURIComponent(selectedGenre)}`;
      console.log('TEST 2: Using "genre=" parameter');
      await directFetchWithLogging(testUrl1);
      
      // Test 3: Direct fetch with comma format
      const testUrl2 = `${baseUrl}?pageSize=50&pageNum=1&searchQuery=${encodeURIComponent(query)}&genres=${encodeURIComponent(selectedGenre)}`;
      console.log('TEST 3: Using "genres=" parameter');
      await directFetchWithLogging(testUrl2);
      
      // Test 4: Try with filter=genre
      const testUrl3 = `${baseUrl}?pageSize=50&pageNum=1&searchQuery=${encodeURIComponent(query)}&filter=genre:${encodeURIComponent(selectedGenre)}`;
      console.log('TEST 4: Using "filter=genre:" parameter');
      await directFetchWithLogging(testUrl3);
      
      // Test 5: Try with filterBy
      const testUrl4 = `${baseUrl}?pageSize=50&pageNum=1&searchQuery=${encodeURIComponent(query)}&filterBy=genre&filterValue=${encodeURIComponent(selectedGenre)}`;
      console.log('TEST 5: Using "filterBy=genre&filterValue=" parameter');
      await directFetchWithLogging(testUrl4);
      
    } catch (error) {
      console.error('Error in test fetch:', error);
    } finally {
      console.groupEnd();
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      console.log('🔍 Starting search with query:', query, 'and genre:', selectedGenre);
      
      // Log the URL that will be constructed
      const API_URL = "http://localhost:5000/api/Movie";
      const genresToSend = selectedGenre === 'all' ? [] : [selectedGenre];
      const genreParams = genresToSend
        .map((genre) => `genres=${encodeURIComponent(genre)}`)
        .join('&');
      
      const url = `${API_URL}/GetMovies?pageSize=50&pageNum=1&searchQuery=${encodeURIComponent(query)}${genresToSend.length ? `&${genreParams}` : ""}`;
      console.log('🌐 API URL that will be called:', url);
      
      // Standard approach with our API
      const data = await fetchMovies(50, 1, genresToSend, query);
      console.log('📊 API response data:', data);
      console.log('📈 Total movies returned:', data.movies.length);
      
      // If we're in debug mode, run our tests
      if (debugMode && selectedGenre !== 'all') {
        await testMultipleGenreFetches();
      }
      
      // Proceed with normal flow
      setResults(data.movies);

      // Reset scroll to top
      if (resultsRef.current) {
        resultsRef.current.scrollTop = 0;
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const genreValue = e.target.value;
    console.log('Genre changed to:', genreValue);
    setSelectedGenre(genreValue);
  };

  // Use effect to handle search when genre changes
  useEffect(() => {
    if (query) {
      console.log('useEffect triggering search after genre change');
      handleSearch();
    }
  }, [selectedGenre]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClickMovie = (id: string) => {
    onClose(); // Close overlay
    navigate(`/movies/${id}`);
  };

  // Toggle debug mode with Ctrl+Shift+D
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setDebugMode(prev => !prev);
        console.log('Debug mode toggled:', !debugMode);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [debugMode]);

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
        <GenreSelect value={selectedGenre} onChange={handleGenreChange}>
          {COMMON_GENRES.map(genre => (
            <option key={genre.value} value={genre.value}>
              {genre.display}
            </option>
          ))}
        </GenreSelect>
        
        {debugMode && (
          <DebugPanel>
            <DebugTitle>Debug Mode Active</DebugTitle>
            <DebugText>Current genre: {selectedGenre}</DebugText>
            <DebugButton onClick={testMultipleGenreFetches}>Test API Formats</DebugButton>
          </DebugPanel>
        )}
      </LeftPanel>
      <RightPanel ref={resultsRef}>
        {loading ? (
          <LoadingMessage>Searching movies...</LoadingMessage>
        ) : results.length > 0 ? (
          <>
            <ResultsHeader>
              <ResultsCount>{results.length} results found</ResultsCount>
              {selectedGenre !== 'all' && (
                <FilterTag>
                  Genre: {COMMON_GENRES.find(g => g.value === selectedGenre)?.display || selectedGenre}
                </FilterTag>
              )}
            </ResultsHeader>
            <ResultsGrid>
              {results.map((movie) => (
                <MovieCard key={movie.show_id} onClick={() => handleClickMovie(movie.show_id)}>
                  {movie.posterUrl ? (
                    <MoviePoster 
                      src={movie.posterUrl} 
                      alt={`${movie.title} poster`}
                      onError={(e) => {
                        e.currentTarget.onerror = null; // Prevent infinite error loops
                        e.currentTarget.src = '/placeholder-poster.jpg'; // Use a placeholder
                      }}
                    />
                  ) : (
                    <PosterStub>
                      <PosterTitle>{movie.title}</PosterTitle>
                    </PosterStub>
                  )}
                  <Title>{movie.title}</Title>
                  <Meta>
                    {movie.release_year} • {movie.rating}
                    {movie.genres && <GenreText>{movie.genres}</GenreText>}
                  </Meta>
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