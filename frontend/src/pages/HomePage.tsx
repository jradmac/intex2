import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MovieList from '../components/MovieLIst';
import { logout } from '../components/AuthAPI';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      // Redirect to login page after successful logout
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Failed to log out. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-800 to-blue-600 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold">CineNiche</h1>
              <p className="mt-2 text-blue-100">Discover your next favorite movie</p>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition duration-200 disabled:opacity-50"
            >
              {isLoggingOut ? 'Logging Out...' : 'Logout'}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <MovieList />
      </main>

      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} CineNiche. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;