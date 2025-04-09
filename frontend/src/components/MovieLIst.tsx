import React, { useEffect, useState } from 'react';
import { fetchMovies } from '../api/MovieAPI';
import { Movie } from '../types/Movie';
import SearchBar from './SearchBar';

const MovieList: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [totalMovies, setTotalMovies] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const getGenres = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/Movie/GetGenres');
        if (!response.ok) throw new Error('Failed to fetch genres');
        const genres = await response.json();
        setAvailableGenres(genres);
      } catch (err) {
        console.error('Error fetching genres:', err);
        setError('Failed to load genre filters');
      }
    };
    getGenres();
  }, []);

  useEffect(() => {
    const loadMovies = async () => {
      try {
        setLoading(true);
        const data = await fetchMovies(pageSize, currentPage, selectedGenres, searchQuery);
        setMovies(data.movies);
        setTotalMovies(data.totalNumMovies);
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
  }, [currentPage, pageSize, selectedGenres, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleGenreChange = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalMovies / pageSize);

  const handlePageChange = (page: number) => setCurrentPage(page);

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Movie List</h1>

      {/* 🔍 Search Bar */}
      <div className="mb-6">
        <SearchBar onSearch={handleSearch} />
      </div>

      {/* 🎯 Genre Filter */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Filter by Genre</h2>
        <div className="flex flex-wrap gap-2">
          {availableGenres.map(genre => (
            <button
              key={genre}
              onClick={() => handleGenreChange(genre)}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedGenres.includes(genre)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* 📏 Page Size */}
      <div className="mb-6">
        <label className="mr-2">Movies per page:</label>
        <select
          value={pageSize}
          onChange={handlePageSizeChange}
          className="border rounded p-1"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-6">{error}</div>}

      {loading ? (
        <div className="text-center py-10">
          <p>Loading movies...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {movies.length > 0 ? (
              movies.map(movie => (
                <div key={movie.show_id} className="border rounded-lg overflow-hidden shadow-lg">
                  <div className="bg-gray-200 h-48 flex items-center justify-center">
                    <span className="text-gray-500">{movie.title || 'No Title'}</span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1">{movie.title || 'Untitled'}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {movie.release_year} • {movie.rating || 'Not Rated'} • {movie.duration || 'N/A'}
                    </p>
                    {movie.genres && (
                      <div className="mb-2 flex flex-wrap gap-1">
                        {movie.genres.split(',').map((genre, i) => (
                          <span
                            key={i}
                            className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"
                          >
                            {genre.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-sm line-clamp-2 text-gray-700">
                      {movie.description || 'No description available.'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <p>No movies found. Try changing your filters.</p>
              </div>
            )}
          </div>

          {/* ⏩ Pagination */}
          <div className="mt-8 flex justify-between items-center">
            <div>Showing {movies.length} of {totalMovies} movies</div>
            <div className="flex space-x-1">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) pageNum = i + 1;
                else if (currentPage <= 3) pageNum = i + 1;
                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = currentPage - 2 + i;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-4 py-2 border rounded ${
                      currentPage === pageNum ? 'bg-blue-600 text-white' : ''
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MovieList;
