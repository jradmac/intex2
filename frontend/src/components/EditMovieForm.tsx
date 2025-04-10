import { useEffect, useState } from "react";
import { Movie } from "../types/Movie";
import { updateMovie } from "../api/MovieAPI";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

interface EditMovieFormProps {
  movie: Movie;
  onSuccess: () => void;
  onCancel: () => void;
}

const EditMovieForm = ({ movie, onSuccess, onCancel }: EditMovieFormProps) => {
  const [formData, setFormData] = useState<Movie>({ ...movie });
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
    await updateMovie(movie.show_id, formData);
    onSuccess();
  };

  return (
    <div className="card shadow-sm p-4 mt-4 mb-5">
      <h4 className="mb-3">Edit Movie</h4>
      <form onSubmit={handleSubmit} className="row g-3">
        {[
          { label: "Title", name: "title" },
          { label: "Type", name: "type" },
          { label: "Director", name: "director" },
          { label: "Cast", name: "cast" },
          { label: "Country", name: "country" },
          { label: "Release Year", name: "release_year", type: "number" },
          { label: "Rating", name: "rating" },
          { label: "Duration", name: "duration" },
        ].map(({ label, name, type }) => (
          <div className="col-md-6" key={name}>
            <label className="form-label">{label}</label>
            <input
              type={type || "text"}
              name={name}
              value={(formData as any)[name] || ""}
              onChange={handleChange}
              className="form-control"
            />
          </div>
        ))}

        {/* Description */}
        <div className="col-12">
          <label className="form-label">Description</label>
          <textarea
            name="description"
            value={formData.description || ""}
            onChange={handleChange}
            className="form-control"
            rows={3}
          />
        </div>

        {/* Genre Dropdown */}
        <div className="col-12">
          <label className="form-label">Genres</label>
          <div className="mb-2">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {isDropdownOpen ? "Hide Genres" : "Select Genres"}{" "}
              {isDropdownOpen ? <FaChevronUp /> : <FaChevronDown />}
            </button>
          </div>

          {isDropdownOpen && (
            <div className="border p-3 rounded bg-light mb-2">
              <div className="d-flex flex-wrap gap-2">
                {genreOptions.map((genre) => (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => handleGenreToggle(genre)}
                    className={`badge rounded-pill px-3 py-2 border ${
                      (formData.genres || "").split(',').map(g => g.trim()).includes(genre)
                        ? 'bg-primary text-white'
                        : 'bg-light text-dark'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>

              <div className="mt-3 d-flex gap-2 align-items-center">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Add new genre"
                  value={newGenre}
                  onChange={(e) => setNewGenre(e.target.value)}
                />
                <button type="button" className="btn btn-sm btn-secondary" onClick={handleAddNewGenre}>
                  Add
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="col-12 d-flex justify-content-end gap-2">
          <button type="submit" className="btn btn-success">
            Update Movie
          </button>
          <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditMovieForm;
