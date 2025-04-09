import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const OAuthSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Parse query parameters
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userId = params.get('userId');
    const email = params.get('email');
    const firstName = params.get('firstName');
    const lastName = params.get('lastName');
    const role = params.get('role');
    
    if (token) {
      // Store authentication data
      localStorage.setItem('authToken', token);
      
      const userData = {
        userId,
        email,
        firstName,
        lastName,
        role: role || 'User',
        profileCompleted: true,
      };
      
      localStorage.setItem('userData', JSON.stringify(userData));
      
      // Redirect to home page
      navigate('/home');
    } else {
      // No token found, redirect to login
      navigate('/login');
    }
  }, [navigate, location]);
  
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Completing authentication, please wait...</p>
    </div>
  );
};

export default OAuthSuccessPage;