import React, { useEffect, useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

type SearchFilters = {
  title: string;
  genres: string[];
};

type Props = {
  onSearch: (filters: SearchFilters) => void;
};

const AdminSearchBar: React.FC<Props> = ({ onSearch }) => {
  const [title, setTitle] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  const [showGenres, setShowGenres] = useState(false);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/Movie/GetGenres");
        const data = await response.json();
        setAvailableGenres(data.filter((genre: string) => genre.trim() !== ""));
      } catch (error) {
        console.error("Error fetching genres:", error);
      }
    };

    fetchGenres();
  }, []);

  const toggleSelection = (value: string) => {
    setSelectedGenres((prev) =>
      prev.includes(value) ? prev.filter((g) => g !== value) : [...prev, value]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ title: title.trim(), genres: selectedGenres });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-sm border border-gray-200 rounded p-4 w-100 d-flex flex-column gap-3"
    >
      {/* Title Filter */}
      <div className="d-flex flex-column flex-md-row gap-3 align-items-center">
        <div className="flex-grow-1">
          <label className="form-label fw-medium mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="form-control"
            placeholder="Search by title..."
          />
        </div>

        {/* Genre Toggle Button */}
        <div className="d-flex flex-column">
          <label className="form-label fw-medium mb-1">Genres</label>
          <button
            type="button"
            onClick={() => setShowGenres((prev) => !prev)}
            className="btn btn-outline-primary btn-sm d-flex align-items-center"
          >
            {showGenres ? (
              <>
                Hide Genres <FaChevronUp className="ms-2" />
              </>
            ) : (
              <>
                Show Genres <FaChevronDown className="ms-2" />
              </>
            )}
          </button>
        </div>

        {/* Submit Button */}
        <div className="mt-2 mt-md-4">
          <button type="submit" className="btn btn-success">
            Search
          </button>
        </div>
      </div>

      {/* Genre Selection */}
      {showGenres && (
        <div className="d-flex flex-wrap gap-2 mt-3">
          {availableGenres.map((genre) => (
            <button
              key={genre}
              type="button"
              onClick={() => toggleSelection(genre)}
              className={`badge rounded-pill px-3 py-2 border ${
                selectedGenres.includes(genre)
                  ? 'bg-primary text-white'
                  : 'bg-light text-dark'
              }`}
              style={{ cursor: 'pointer' }}
            >
              {genre}
            </button>
          ))}
        </div>
      )}
    </form>
  );
};

export default AdminSearchBar;
