import { useEffect, useState } from "react";
import { Movie } from "../types/Movie";
import { fetchMovies, deleteMovie } from "../api/MovieAPI";
import Pagination from "../components/Pagination";
import EditMovieForm from "../components/EditMovieForm";
import NewMovieForm from "../components/NewMovieForm";
import AdminSearchBar from "../components/AdminSearchBar";
import { FaEdit, FaTrash } from "react-icons/fa"; // Icons for actions

type AdminSearchFilters = {
  title: string;
  genres: string[];
};

const AdminMoviesPage = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState<number>(5);
  const [pageNum, setPageNum] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [showForm, setShowForm] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);

  const [filters, setFilters] = useState<AdminSearchFilters>({
    title: "",
    genres: [],
  });

  useEffect(() => {
    const loadMovies = async () => {
      try {
        const data = await fetchMovies(pageSize, pageNum, filters.genres, filters.title);
        setMovies(data.movies);
        setTotalPages(Math.ceil(data.totalNumMovies / pageSize));
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, [pageSize, pageNum, filters]);

  const handleDelete = async (showId: string) => {
    if (!window.confirm("Are you sure you want to delete this movie?")) return;
    try {
      await deleteMovie(showId);
      setMovies((prev) => prev.filter((m) => m.show_id !== showId));
    } catch (error) {
      alert("Failed to delete movie, try again.");
    }
  };

  if (loading) return <p className="mt-5 text-center text-muted">Loading movies...</p>;
  if (error) return <p className="text-danger">Error: {error}</p>;

  return (
    <div className="p-4">
      {/* Header Bar */}
      <div className="bg-dark text-white d-flex justify-content-between align-items-center p-3 rounded shadow-sm">
        <div>
          <h4 className="m-0">Admin Dashboard</h4>
          
        </div>
        <div>
          <span className="me-3">Admin</span>
          <i className="bi bi-person-circle fs-4"></i>
        </div>
      </div>

      {/* Search and Add Button */}
      <div className="d-flex justify-content-between align-items-center mt-4 mb-3">
      
        <AdminSearchBar
          onSearch={(newFilters) => {
            setFilters(newFilters);
            setPageNum(1);
          }}
        />
      </div>

      {/* Add New Button */}
      {!showForm && (
        <div className="d-flex justify-content-end mb-4">
          <button className="btn btn-success shadow-sm" onClick={() => setShowForm(true)}>
            + Add Movie
          </button>
        </div>
      )}
      

      {showForm && (
        <NewMovieForm
          onSuccess={() => {
            setShowForm(false);
            fetchMovies(pageSize, pageNum, filters.genres, filters.title).then((data) => setMovies(data.movies));
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingMovie && (
        <EditMovieForm
          movie={editingMovie}
          onSuccess={() => {
            setEditingMovie(null);
            fetchMovies(pageSize, pageNum, filters.genres, filters.title).then((data) => setMovies(data.movies));
          }}
          onCancel={() => setEditingMovie(null)}
        />
      )}

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-hover table-bordered align-middle mt-2 shadow-sm">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Type</th>
              <th>Director</th>
              <th>Cast</th>
              <th>Year</th>
              <th>Rating</th>
              <th>Genres</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {movies.map((m) => (
              <tr key={m.show_id} className="align-middle">
                <td>{m.show_id}</td>
                <td>{m.title}</td>
                <td>{m.type}</td>
                <td>{m.director}</td>
                <td>{m.cast}</td>
                <td>{m.release_year}</td>
                <td>{m.rating}</td>
                <td>{m.genres}</td>
                <td className="text-center">
                  <button
                    className="btn btn-sm btn-light me-2 border"
                    title="Edit"
                    onClick={() => setEditingMovie(m)}
                  >
                    <FaEdit className="text-primary" />
                  </button>
                  <button
                    className="btn btn-sm btn-light border"
                    title="Delete"
                    onClick={() => handleDelete(m.show_id)}
                  >
                    <FaTrash className="text-danger" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <Pagination
          currentPage={pageNum}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={setPageNum}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPageNum(1);
          }}
        />
        <span className="text-muted">
          Showing {movies.length} of {pageSize * totalPages} results
        </span>
      </div>
    </div>
  );
};

export default AdminMoviesPage;
