import { useEffect, useState } from "react";
import { Movie } from "../types/Movie";
import { addMovie } from "../api/MovieAPI";
// import "./GenreDropdown.css";

interface NewMovieFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const NewMovieForm = ({ onSuccess, onCancel }: NewMovieFormProps) => {
  const [formData, setFormData] = useState<Movie>({
    show_id: `new-${Date.now()}`,
    title: "",
    type: "Movie",
    director: "",
    cast: "",
    country: "",
    release_year: new Date().getFullYear(),
    rating: "PG-13",
    duration: "",
    description: "",
    genres: "",
    posterUrl: ""  // Add this line
  });

  const [genreOptions, setGenreOptions] = useState<string[]>([]);
  const [newGenre, setNewGenre] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch("https://localhost:5002/api/Movie/GetGenres");
        const data = await response.json();
        setGenreOptions(data.filter((genre: string) => genre.trim() !== ""));
      } catch (err) {
        console.error("Failed to fetch genres:", err);
      }
    };

    fetchGenres();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenreToggle = (genre: string) => {
    const currentGenres = formData.genres?.split(',').map(g => g.trim()) || [];

    const updatedGenres = currentGenres.includes(genre)
      ? currentGenres.filter(g => g !== genre)
      : [...currentGenres, genre];

    setFormData({ ...formData, genres: updatedGenres.join(', ') });
  };

  const handleAddNewGenre = () => {
    const trimmed = newGenre.trim();
    if (!trimmed) return;

    if (!genreOptions.includes(trimmed)) {
      setGenreOptions([...genreOptions, trimmed]);
    }

    const currentGenres = formData.genres?.split(',').map(g => g.trim()) || [];
    if (!currentGenres.includes(trimmed)) {
      currentGenres.push(trimmed);
      setFormData({ ...formData, genres: currentGenres.join(', ') });
    }

    setNewGenre("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addMovie(formData);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add New Movie</h2>

      <label>Title:
        <input type="text" name="title" value={formData.title} onChange={handleChange} />
      </label>

      <label>Type:
        <input type="text" name="type" value={formData.type} onChange={handleChange} />
      </label>

      <label>Director:
        <input type="text" name="director" value={formData.director} onChange={handleChange} />
      </label>

      <label>Cast:
        <input type="text" name="cast" value={formData.cast} onChange={handleChange} />
      </label>

      <label>Country:
        <input type="text" name="country" value={formData.country} onChange={handleChange} />
      </label>

      <label>Release Year:
        <input type="number" name="release_year" value={formData.release_year} onChange={handleChange} />
      </label>

      <label>Rating:
        <input type="text" name="rating" value={formData.rating} onChange={handleChange} />
      </label>

      <label>Duration:
        <input type="text" name="duration" value={formData.duration} onChange={handleChange} />
      </label>

      <label>Description:
        <textarea name="description" value={formData.description} onChange={handleChange} />
      </label>

      <div className="genre-dropdown-container">
        <label>Genres:</label>
        <div className="genre-dropdown">
          <button
            type="button"
            className="genre-dropdown-toggle"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {formData.genres || "Select genres..."}
          </button>

          {isDropdownOpen && (
            <div className="genre-dropdown-menu">
              {genreOptions.map((genre) => (
                <label key={genre} className="genre-option">
                  <input
                    type="checkbox"
                    checked={(formData.genres || "").split(',').map(g => g.trim()).includes(genre)}
                    onChange={() => handleGenreToggle(genre)}
                  />
                  {genre}
                </label>
              ))}

              <div className="genre-add">
                <input
                  type="text"
                  placeholder="Add new genre"
                  value={newGenre}
                  onChange={(e) => setNewGenre(e.target.value)}
                />
                <button type="button" onClick={handleAddNewGenre}>Add</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <button type="submit">Add Movie</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  );
};

export default NewMovieForm;
