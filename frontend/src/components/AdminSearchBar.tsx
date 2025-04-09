import React, { useEffect, useState } from 'react';

type SearchFilters = {
  title: string;
  director: string;
  genres: string[];
  ratings: string[];
  minYear: number | null;
  maxYear: number | null;
};

type Props = {
  onSearch: (filters: SearchFilters) => void;
};

const AdminSearchBar: React.FC<Props> = ({ onSearch }) => {
  const [title, setTitle] = useState('');
  const [director, setDirector] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<string[]>([]);
  const [minYear, setMinYear] = useState<number | null>(null);
  const [maxYear, setMaxYear] = useState<number | null>(null);
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);

  // 🧠 Hardcoded ratings found in your database
  const availableRatings = ["G", "PG", "PG-13", "R", "NC-17", "TV-Y", "TV-Y7", "TV-G", "TV-PG", "TV-14", "TV-MA"];

  // 🔁 Fetch genres
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/Movie/GetGenres");
        const data = await response.json();
        setAvailableGenres(data);
      } catch (error) {
        console.error("Error fetching genres:", error);
      }
    };

    fetchGenres();
  }, []);

  const toggleSelection = (value: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (list.includes(value)) {
      setList(list.filter(v => v !== value));
    } else {
      setList([...list, value]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      title: title.trim(),
      director: director.trim(),
      genres: selectedGenres,
      ratings: selectedRatings,
      minYear,
      maxYear
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end mb-6 border p-4 rounded shadow">
      {/* Title */}
      <div className="flex flex-col">
        <label className="text-sm font-medium">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border rounded px-2 py-1 w-40"
        />
      </div>

      {/* Director */}
      <div className="flex flex-col">
        <label className="text-sm font-medium">Director</label>
        <input
          type="text"
          value={director}
          onChange={(e) => setDirector(e.target.value)}
          className="border rounded px-2 py-1 w-40"
        />
      </div>

      {/* Genres */}
      <div className="flex flex-col max-w-sm">
        <label className="text-sm font-medium">Genres</label>
        <div className="flex flex-wrap gap-1">
          {availableGenres.map((genre) => (
            <button
              key={genre}
              type="button"
              onClick={() => toggleSelection(genre, selectedGenres, setSelectedGenres)}
              className={`px-2 py-1 text-xs rounded-full border ${
                selectedGenres.includes(genre) ? 'bg-blue-600 text-white' : 'bg-gray-100'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Ratings */}
      <div className="flex flex-col max-w-sm">
        <label className="text-sm font-medium">Ratings</label>
        <div className="flex flex-wrap gap-1">
          {availableRatings.map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => toggleSelection(rating, selectedRatings, setSelectedRatings)}
              className={`px-2 py-1 text-xs rounded-full border ${
                selectedRatings.includes(rating) ? 'bg-green-600 text-white' : 'bg-gray-100'
              }`}
            >
              {rating}
            </button>
          ))}
        </div>
      </div>

      {/* Year Range */}
      <div className="flex flex-col">
        <label className="text-sm font-medium">Release Year</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minYear ?? ''}
            onChange={(e) => setMinYear(e.target.value ? parseInt(e.target.value) : null)}
            className="border rounded px-2 py-1 w-20"
          />
          <input
            type="number"
            placeholder="Max"
            value={maxYear ?? ''}
            onChange={(e) => setMaxYear(e.target.value ? parseInt(e.target.value) : null)}
            className="border rounded px-2 py-1 w-20"
          />
        </div>
      </div>

      {/* Search Button */}
      <div>
        <button type="submit" className="bg-blue-700 text-white px-4 py-2 rounded">
          Search
        </button>
      </div>
    </form>
  );
};

export default AdminSearchBar;
