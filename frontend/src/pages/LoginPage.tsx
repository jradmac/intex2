import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

// API URL - using HTTP for local development
const API_BASE_URL = 'http://localhost:5000/api';

// Password validation helper
const isValidPassword = (password: string): boolean => {
  return password.length >= 10;
};

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Check for existing login on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');
    
    // If already logged in, redirect to home
    if (token && userData) {
      console.log('LoginPage: User already logged in, redirecting to home');
      navigate('/home');
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Simple validation
    if (!isValidPassword(password)) {
      setError('Password must be at least 10 characters long');
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('LoginPage: Sending login request');
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password
      });
      
      // Save token and user data to localStorage
      localStorage.setItem('token', response.data.token);
      const userData = {
        userId: response.data.userId,
        email: response.data.email,
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        role: response.data.role || 'User',
        age: response.data.age,
        gender: response.data.gender,
        phone: response.data.phone,
        profileCompleted: true
      };
      
      localStorage.setItem('userData', JSON.stringify(userData));
      console.log('LoginPage: Login successful, saved user data');
      
      // Navigate to home page
      navigate('/home');
    } catch (err: any) {
      console.error('LoginPage: Login error', err);
      setError(err.response?.data?.message || 'Failed to login. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="py-6 px-8 border-b border-gray-200">
        <div className="text-gray-900 text-2xl font-bold">CineStream</div>
      </header>
      
      {/* Login Form */}
      <div className="flex-grow flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold mb-8 text-center text-gray-900">
            Sign in to your account
          </h1>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="email">
                Email
              </label>
              <input
                className="w-full border border-gray-300 rounded-md 
                          px-4 py-2 text-gray-900 placeholder-gray-500
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="password">
                Password
              </label>
              <input
                className="w-full border border-gray-300 rounded-md 
                          px-4 py-2 text-gray-900 placeholder-gray-500
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                id="password"
                type="password"
                placeholder="Enter your password (min. 10 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-4">
              <button
                className="w-full bg-blue-600 hover:bg-blue-700 transition 
                           text-white font-medium py-2 px-4 rounded-md focus:outline-none
                           focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                           disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
              
              <div className="text-center">
                <Link to="/register" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Don't have an account? Create one
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="py-4 text-center text-gray-500 text-sm border-t border-gray-200">
        <p>© 2023 CineStream. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LoginPage;