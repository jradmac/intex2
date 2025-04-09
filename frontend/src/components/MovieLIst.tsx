import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { fetchMovies } from '../api/MovieAPI';
import { Movie } from '../types/Movie';

const MovieList: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMovies = async () => {
      try {
        const data = await fetchMovies(100, 1, [], ''); // fetch all (or increase limit)
        setMovies(data.movies);
        setError(null);
      } catch (err) {
        console.error('Error fetching movies:', err);
        setError('Failed to load movies. Please try again later.');
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, []);

  const getMoviesGroupedByGenre = () => {
    const genreMap: { [genre: string]: Movie[] } = {};

    movies.forEach(movie => {
      const genres = movie.genres?.split(',').map(g => g.trim()) || ['Other'];
      genres.forEach(genre => {
        if (!genreMap[genre]) {
          genreMap[genre] = [];
        }
        genreMap[genre].push(movie);
      });
    });

    return genreMap;
  };

  if (loading) return <Text>Loading movies...</Text>;
  if (error) return <Text>{error}</Text>;

  const groupedMovies = getMoviesGroupedByGenre();

  return (
    <Wrapper>
      {Object.entries(groupedMovies).map(([genre, movies]) => (
        <GenreSection key={genre}>
          <GenreTitle>{genre}</GenreTitle>
          <MovieGrid>
            {movies.map(movie => (
              <MovieCard key={movie.show_id}>
                <Poster />
                <MovieInfo>
                  <MovieTitle>{movie.title || 'Untitled'}</MovieTitle>
                  <MovieMeta>{movie.release_year}</MovieMeta>
                  <MovieMeta>{movie.rating} • {movie.duration}</MovieMeta>
                </MovieInfo>
              </MovieCard>
            ))}
          </MovieGrid>
        </GenreSection>
      ))}
    </Wrapper>
  );
};

export default MovieList;

// ==================== Styled Components ====================
const Wrapper = styled.div`
  padding: 40px 60px;
  background-color: #141414;
`;

const GenreSection = styled.section`
  margin-bottom: 60px;
`;

const GenreTitle = styled.h2`
  color: white;
  font-size: 1.8rem;
  margin-bottom: 20px;
`;

const MovieGrid = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 20px;
  padding-bottom: 10px;

  &::-webkit-scrollbar {
    height: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }
`;

const MovieCard = styled.div`
  min-width: 160px;
  max-width: 160px;
  background: #222;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
`;

const Poster = styled.div`
  background-color: #333;
  height: 240px;
`;

const MovieInfo = styled.div`
  padding: 10px;
`;

const MovieTitle = styled.h4`
  font-size: 1rem;
  margin: 0 0 4px;
  color: #fff;
`;

const MovieMeta = styled.p`
  font-size: 0.875rem;
  color: #aaa;
  margin: 0;
`;

const Text = styled.p`
  color: #ccc;
  text-align: center;
  padding: 2rem;
`;
