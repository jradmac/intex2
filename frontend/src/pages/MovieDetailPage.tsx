import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMovieById } from '../api/MovieAPI';
import { Movie } from '../types/Movie';

const MovieDetailPage: React.FC = () => {
  const { show_id } = useParams<{ show_id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const navigate = useNavigate();

  console.log("show_id:", show_id); // ✅ Safe logging (outside hook)

  useEffect(() => {
    if (show_id) {
      console.log("Fetching movie:", show_id);
      getMovieById(show_id)
        .then(data => {
          console.log("Fetched movie:", data);
          setMovie(data);
        })
        .catch(error => {
          console.error("Fetch error:", error);
        });
    }
  }, [show_id]);

  if (!movie) return <p style={{ color: 'white', padding: '2rem' }}>Loading movie...</p>;

  return (
    <div style={{ padding: '2rem', color: 'white' }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>← Back</button>
      <h1>{movie.title}</h1>
      <p><strong>Year:</strong> {movie.release_year}</p>
      <p><strong>Director:</strong> {movie.director}</p>
      <p><strong>Genres:</strong> {movie.genres}</p>
      <p><strong>Rating:</strong> {movie.rating}</p>
      <p><strong>Duration:</strong> {movie.duration}</p>
      <p><strong>Description:</strong> {movie.description}</p>
    </div>
  );
};

export default MovieDetailPage;
