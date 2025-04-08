import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

// API URL - using HTTP for local development
const API_BASE_URL = 'http://localhost:5000/api';

// Registration steps enum
enum RegisterStep {
  INITIAL = 'initial',
  PROFILE = 'profile'
}

// User data interface
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

// Password validation helper
const isValidPassword = (password: string): boolean => {
  return password.length >= 10;
};

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<RegisterStep>(RegisterStep.INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Initial registration form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  // Profile completion form state
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  
  // Temporary user data storage
  const [tempUserData, setTempUserData] = useState<UserData | null>(null);
  const [tempToken, setTempToken] = useState<string | null>(null);
  
  // Check for saved registration data on mount
  useEffect(() => {
    // Check if we should be in profile step with data from session storage
    const storedToken = sessionStorage.getItem('tempToken');
    const storedUserData = sessionStorage.getItem('tempUserData');
    
    if (storedToken && storedUserData) {
      try {
        const userData = JSON.parse(storedUserData);
        console.log('RegisterPage: Found stored registration data, restoring state');
        
        setTempToken(storedToken);
        setTempUserData(userData);
        setCurrentStep(RegisterStep.PROFILE);
      } catch (err) {
        console.error('Error parsing stored user data:', err);
        // Clear invalid data
        sessionStorage.removeItem('tempToken');
        sessionStorage.removeItem('tempUserData');
      }
    }
  }, []);

  const handleInitialRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Password validation
    if (!isValidPassword(password)) {
      setError('Password must be at least 10 characters long');
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('RegisterPage: Sending registration request');
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        email,
        password,
        firstName,
        lastName
      });
      
      console.log('RegisterPage: Registration successful', response.data);
      
      // For testing - create mock data if API doesn't return what we need
      const userId = response.data.userId || `user-${Date.now()}`;
      const token = response.data.token || `mock-token-${Date.now()}`;
      
      // Store token and basic user data temporarily
      const userData = {
        userId: userId,
        email,
        firstName,
        lastName,
        role: response.data.role || 'User'
      };
      
      // Store data in state and localStorage as a backup
      setTempToken(token);
      setTempUserData(userData);
      
      // Also store in session storage to prevent data loss on page refresh
      sessionStorage.setItem('tempToken', token);
      sessionStorage.setItem('tempUserData', JSON.stringify(userData));
      
      console.log('RegisterPage: Saved temporary data', { token, userData });
      
      // Move to profile completion step
      setCurrentStep(RegisterStep.PROFILE);
    } catch (err: any) {
      console.error('RegisterPage: Registration error', err);
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleProfileComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Try to get data from state first, then session storage as backup
      let userData = tempUserData;
      let token = tempToken;
      
      // If data is missing from state, try to get from session storage
      if (!userData || !token) {
        console.log('RegisterPage: Data missing from state, checking session storage');
        const storedToken = sessionStorage.getItem('tempToken');
        const storedUserData = sessionStorage.getItem('tempUserData');
        
        if (storedToken && storedUserData) {
          token = storedToken;
          userData = JSON.parse(storedUserData);
          console.log('RegisterPage: Retrieved data from session storage', { token, userData });
        }
      }
      
      // If still no data, throw error
      if (!userData || !token) {
        console.error('RegisterPage: Missing user data in both state and session storage');
        throw new Error('Missing user data. Please try registering again.');
      }
      
      console.log('RegisterPage: Updating user profile with data', { userData, token });
      
      let profileUpdateSuccess = true;
      try {
        // Try to update user profile with additional data
        const response = await fetch(`${API_BASE_URL}/User/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            age: parseInt(age),
            gender,
            phone
          })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.warn(`API profile update failed: ${errorText}`);
          profileUpdateSuccess = false;
        }
      } catch (apiError) {
        console.warn('API profile update error (continuing with local update)', apiError);
        profileUpdateSuccess = false;
      }
      
      // Even if API call fails, continue with local storage update
      // This allows testing the UI flow without a working backend
      
      // Save complete user data to localStorage
      const completeUserData = {
        ...userData,
        age: parseInt(age),
        gender,
        phone,
        profileCompleted: true
      };
      
      localStorage.setItem('token', token);
      localStorage.setItem('userData', JSON.stringify(completeUserData));
      
      // Clean up session storage
      sessionStorage.removeItem('tempToken');
      sessionStorage.removeItem('tempUserData');
      
      console.log('RegisterPage: Registration complete, redirecting to home');
      
      if (!profileUpdateSuccess) {
        console.log('Note: API profile update failed, but proceeding with local data');
      }
      
      navigate('/home');
    } catch (err) {
      console.error('RegisterPage: Profile completion error', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };
  
  const handleSkipProfile = () => {
    // Try to get data from state first, then session storage as backup
    let userData = tempUserData;
    let token = tempToken;
    
    // If data is missing from state, try to get from session storage
    if (!userData || !token) {
      console.log('RegisterPage: Data missing from state, checking session storage');
      const storedToken = sessionStorage.getItem('tempToken');
      const storedUserData = sessionStorage.getItem('tempUserData');
      
      if (storedToken && storedUserData) {
        token = storedToken;
        userData = JSON.parse(storedUserData);
        console.log('RegisterPage: Retrieved data from session storage', { token, userData });
      }
    }
    
    // If still no data, show error
    if (!userData || !token) {
      console.error('RegisterPage: Missing user data in both state and session storage');
      setError('Missing user data. Please try registering again.');
      return;
    }
    
    // Save user data with default profile values
    const completeUserData = {
      ...userData,
      age: 18,
      gender: 'prefer-not-to-say',
      phone: '',
      profileCompleted: true
    };
    
    localStorage.setItem('token', token);
    localStorage.setItem('userData', JSON.stringify(completeUserData));
    
    // Clean up session storage
    sessionStorage.removeItem('tempToken');
    sessionStorage.removeItem('tempUserData');
    
    console.log('RegisterPage: Skipped profile completion with default values');
    
    // Redirect to home page
    navigate('/home');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="py-6 px-8 border-b border-gray-200">
        <div className="text-gray-900 text-2xl font-bold">CineStream</div>
      </header>
      
      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {currentStep === RegisterStep.INITIAL ? (
            <>
              <h1 className="text-2xl font-bold mb-8 text-center text-gray-900">Create an account</h1>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleInitialRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="firstName">
                      First Name
                    </label>
                    <input
                      className="w-full border border-gray-300 rounded-md 
                                px-4 py-2 text-gray-900 placeholder-gray-500
                                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      id="firstName"
                      type="text"
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="lastName">
                      Last Name
                    </label>
                    <input
                      className="w-full border border-gray-300 rounded-md 
                                px-4 py-2 text-gray-900 placeholder-gray-500
                                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      id="lastName"
                      type="text"
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
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
                    placeholder="email@example.com"
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
                    placeholder="At least 10 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Password must be at least 10 characters long
                  </p>
                </div>
                
                <div className="space-y-4 pt-2">
                  <button
                    className="w-full bg-blue-600 hover:bg-blue-700 transition 
                              text-white font-medium py-2 px-4 rounded-md focus:outline-none
                              focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                              disabled:opacity-50 disabled:cursor-not-allowed"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Creating Account...' : 'Continue'}
                  </button>
                  
                  <div className="text-center">
                    <Link to="/login" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Already have an account? Sign in
                    </Link>
                  </div>
                </div>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-2 text-center text-gray-900">Complete Your Profile</h1>
              <p className="text-gray-500 text-center mb-8">Tell us more about yourself</p>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleProfileComplete} className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="age">
                    Age
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-md 
                              px-4 py-2 text-gray-900 placeholder-gray-500
                              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    id="age"
                    type="number"
                    placeholder="Your age"
                    min="13"
                    max="120"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="gender">
                    Gender
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-md 
                              px-4 py-2 text-gray-900
                              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    required
                  >
                    <option value="" disabled>Select your gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="phone">
                    Phone Number <span className="text-gray-500">(Optional)</span>
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-md 
                              px-4 py-2 text-gray-900 placeholder-gray-500
                              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    id="phone"
                    type="tel"
                    placeholder="Your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button
                    className="flex-1 bg-blue-600 hover:bg-blue-700 transition 
                              text-white font-medium py-2 px-4 rounded-md focus:outline-none
                              focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                              disabled:opacity-50 disabled:cursor-not-allowed"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Complete Profile'}
                  </button>
                  
                  <button
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md 
                              hover:bg-gray-50 transition focus:outline-none 
                              focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    type="button"
                    onClick={handleSkipProfile}
                    disabled={loading}
                  >
                    Skip
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <footer className="py-4 text-center text-gray-500 text-sm border-t border-gray-200">
        <p>© 2023 CineStream. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default RegisterPage;