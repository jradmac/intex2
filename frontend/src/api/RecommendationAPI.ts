// File: /frontend/src/api/RecommendationAPI.ts
export interface MovieRecommendation {
    demographic_segment: string;
    gender: string;
    age_group: string;
    genre: string;
    recommendation_type: string;
    show_id: string;
    title: string;
    type: string;
    created_at: string;
    
    // Additional fields from Movies table
    posterUrl?: string;
    director?: string;
    cast?: string;
    description?: string;
    rating?: string;
    duration?: string;
    releaseYear?: number;
    country?: string;
  }
  
  interface RecommendationResponse {
    message: string;
    recommendations: MovieRecommendation[];
  }
  
  interface AllRecommendationsResponse {
    message: string;
    recommendations: Record<string, MovieRecommendation[]>;
  }
  
  const API_URL = "http://localhost:5000/api/Recommendation";
  
  // Helper to get the auth token from localStorage
  const getAuthToken = (): string | null => {
    return localStorage.getItem('authToken');
  };
  
  // Get personalized recommendations based on user demographics
  export const fetchPersonalizedRecommendations = async (limit: number = 10): Promise<MovieRecommendation[]> => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }
  
      const response = await fetch(`${API_URL}/forYou?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
      }
  
      const data: RecommendationResponse = await response.json();
      return data.recommendations;
    } catch (error) {
      console.error("Error fetching personalized recommendations:", error);
      throw error;
    }
  };
  
  // Get recommendations by genre
  export const fetchGenreRecommendations = async (genre: string, limit: number = 10): Promise<MovieRecommendation[]> => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }
  
      const response = await fetch(`${API_URL}/byGenre/${genre}?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
      }
  
      const data: RecommendationResponse = await response.json();
      return data.recommendations;
    } catch (error) {
      console.error(`Error fetching recommendations for genre ${genre}:`, error);
      throw error;
    }
  };
  
  // Get all recommendations by category
  export const fetchAllRecommendations = async (limit: number = 10): Promise<Record<string, MovieRecommendation[]>> => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }
  
      const response = await fetch(`${API_URL}/all?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
      }
  
      const data: AllRecommendationsResponse = await response.json();
      return data.recommendations;
    } catch (error) {
      console.error("Error fetching all recommendations:", error);
      throw error;
    }
  };