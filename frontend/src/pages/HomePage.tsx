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

// Movie interface for the dummy data
interface Movie {
  id: string;
  title: string;
  genre: string;
  year: number;
  posterUrl: string;
}

// Dummy movie data to display on the home page
const DUMMY_MOVIES: Movie[] = [
  {
    id: "1",
    title: "The Shawshank Redemption",
    genre: "Drama",
    year: 1994,
    posterUrl: "https://via.placeholder.com/150x225"
  },
  {
    id: "2",
    title: "The Godfather",
    genre: "Crime, Drama",
    year: 1972,
    posterUrl: "https://via.placeholder.com/150x225"
  },
  {
    id: "3",
    title: "Pulp Fiction",
    genre: "Crime, Drama",
    year: 1994,
    posterUrl: "https://via.placeholder.com/150x225"
  },
  {
    id: "4",
    title: "The Dark Knight",
    genre: "Action, Crime, Drama",
    year: 2008,
    posterUrl: "https://via.placeholder.com/150x225"
  }
];

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Define movies state - we'll use setMovies later when implementing 
  // movie adding/filtering functionality
  const [movies, /* setMovies */] = useState<Movie[]>(DUMMY_MOVIES);

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
    } catch (error) {
      console.error('HomePage: Error parsing user data', error);
      localStorage.clear();
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // This function will be implemented later to add a new movie to the list
  const handleAddMovie = () => {
    // For now, we're just logging a message
    console.log('Add movie functionality will be implemented later');
    
    // We'll uncomment and complete this implementation when ready:
    // const newMovie = {
    //   id: `${Date.now()}`,
    //   title: "New Movie",
    //   genre: "TBD",
    //   year: 2023,
    //   posterUrl: "https://via.placeholder.com/150x225"
    // };
    // When we're ready to implement this feature, we'll:
    // 1. Uncomment the setMovies variable in the useState declaration
    // 2. Implement the actual movie adding logic here
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {movies.map(movie => (
              <div key={movie.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <img 
                  src={movie.posterUrl} 
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