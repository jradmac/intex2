import { Movie } from "../types/Movie";

interface FetchMoviesResponse {
    movies: Movie[];
    totalNumMovies: number;
}

const API_URL = "https://localhost:5002/api/Movie/GetMovie"

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
            `${API_URL}?pageSize=${pageSize}&pageNum=${pageNum}${selectedGenres.length ? `&${genreParams}` : ""}`
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

export const addMovie = async (movie: Movie): Promise<Movie> => {
    try {
        const response = await fetch (`${API_URL}/AddMovie`, {
            method : "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(movie),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error("Error adding movie:", error);
        throw error;
    }
};

export const updateMovie = async (show_id: string, updatedMovie: Movie): Promise<Movie> => {
    try {
        const response = await fetch(`${API_URL}/UpdateMovie/${show_id}`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedMovie),
        });

        return await response.json();
    } catch (error) {
        console.error("Error updating movie:", error);
        throw error;
    }
};

export const deleteMovie = async (show_id: string): Promise<void> => {
    try {
        const response = await fetch(`${API_URL}/DeleteMovie/${show_id}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
    } catch (error) {
        console.error("Error deleting movie:", error);
        throw error;
    }
};