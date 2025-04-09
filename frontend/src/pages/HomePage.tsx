import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface UserData {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  age?: number;
  gender?: string;
  phone?: string;
  profileCompleted?: boolean;
}

// Movie interface for the API data
interface Movie {
  id: string;
  title: string;
  genre: string;
  year: number;
  posterUrl: string;
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userDataStr = localStorage.getItem('userData');
    
    if (!token || !userDataStr) {
      console.log('HomePage: No auth data found, redirecting to login');
      navigate('/login');
      return;
    }
    
    try {
      const parsedUserData = JSON.parse(userDataStr);
      setUserData(parsedUserData);
      
      // After confirming the user is logged in, fetch movies
      fetchMovies(token);
    } catch (error) {
      console.error('HomePage: Error parsing user data', error);
      localStorage.clear();
      navigate('/login');
    }
  }, [navigate]);

  // Function to fetch movies from the API
  const fetchMovies = async (token: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/Movie/GetMovies', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      console.log('API response:', data);
      
      // Check if the response is an array
      if (Array.isArray(data)) {
        setMovies(data);
      } 
      // Check if the response has a data property that is an array
      else if (data && Array.isArray(data.data)) {
        setMovies(data.data);
      }
      // Check if the response has a result property that is an array
      else if (data && Array.isArray(data.result)) {
        setMovies(data.result);
      }
      // Handle other possible response structures
      else if (typeof data === 'object') {
        // Extract the first array property we find
        const arrayProperty = Object.keys(data).find(key => Array.isArray(data[key]));
        if (arrayProperty) {
          setMovies(data[arrayProperty]);
        } else {
          console.error('Unexpected API response format:', data);
          setFetchError('API returned data in an unexpected format');
          setMovies([]);
        }
      } else {
        console.error('Unexpected API response format:', data);
        setFetchError('API returned data in an unexpected format');
        setMovies([]);
      }
      
      setFetchError(null);
    } catch (error) {
      console.error('Error fetching movies:', error);
      setFetchError('Failed to load movies. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // This function will be implemented later to add a new movie to the list
  const handleAddMovie = () => {
    // For now, we're just logging a message
    console.log('Add movie functionality will be implemented later');
    
    // We'll implement the actual movie adding logic here in the future
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl font-bold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Movie Explorer</h1>
          
          <div className="flex items-center space-x-4">
            {userData && (
              <span className="text-gray-600">
                Welcome, {userData.firstName}!
              </span>
            )}
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Your Profile</h2>
          {userData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500 font-medium">Name</p>
                <p>{userData.firstName} {userData.lastName}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Email</p>
                <p>{userData.email}</p>
              </div>
              {userData.age && (
                <div>
                  <p className="text-gray-500 font-medium">Age</p>
                  <p>{userData.age}</p>
                </div>
              )}
              {userData.gender && (
                <div>
                  <p className="text-gray-500 font-medium">Gender</p>
                  <p>{userData.gender}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Featured Movies</h2>
            <button 
              onClick={handleAddMovie}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Add Movie
            </button>
          </div>
          
          {fetchError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {fetchError}
            </div>
          )}
          
          {(!movies || movies.length === 0) && !fetchError ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No movies available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.isArray(movies) && movies.map(movie => (
                <div key={movie.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <img 
                    src={movie.posterUrl || "https://via.placeholder.com/150x225"} 
                    alt={`${movie.title} poster`}
                    className="w-full h-60 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1">{movie.title}</h3>
                    <p className="text-gray-600 text-sm">{movie.genre}</p>
                    <p className="text-gray-600 text-sm">{movie.year}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <footer className="bg-gray-800 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center">© 2023 Movie Explorer. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;