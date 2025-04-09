import React, { useEffect, useState } from 'react';

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
      genres: selectedGenres
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

      {/* Genre Toggle */}
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Genres</label>
        <button
          type="button"
          onClick={() => setShowGenres(prev => !prev)}
          className="text-blue-600 text-sm underline"
        >
          {showGenres ? 'Hide Genre Options ▲' : 'Show Genre Options ▼'}
        </button>

        {showGenres && (
          <div className="flex flex-wrap gap-1 mt-2 max-w-lg">
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
        )}
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
