import { Movie } from "../types/Movie";

interface FetchMoviesResponse {
    movies: Movie[];
    totalNumMovies: number;
}

const API_URL = "http://localhost:5000/api/Movie"

export const fetchMovies = async (
    pageSize: Number,
    pageNum: Number,
    selectedGenres: string[]
): Promise<FetchMoviesResponse> => {
    try{
        const genreParams = selectedGenres
            .map((genre) => `genres=${encodeURIComponent(genre)}`)
            .join('&');

        const response = await fetch(
            `${API_URL}/GetMovies?pageSize=${pageSize}&pageNum=${pageNum}${selectedGenres.length ? `&${genreParams}` : ""}`
        );

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    return await response.json();
    } catch (error) {
        console.error("Error fetching movies:", error);
        throw error;
    }      
};

// Helper to get the auth token from localStorage
const getAuthToken = (): string | null => {
    return localStorage.getItem('authToken');
};

export const addMovie = async (movie: Movie): Promise<Movie> => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch (`${API_URL}/AddMovie`, {
            method : "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(movie),
        });

        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error adding movie:", error);
        throw error;
    }
};

export const updateMovie = async (show_id: string, updatedMovie: Movie): Promise<Movie> => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${API_URL}/UpdateMovie/${show_id}`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updatedMovie),
        });

        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error updating movie:", error);
        throw error;
    }
};

export const deleteMovie = async (show_id: string): Promise<void> => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${API_URL}/DeleteMovie/${show_id}`, {
            method: "DELETE",
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        console.error("Error deleting movie:", error);
        throw error;
    }
};