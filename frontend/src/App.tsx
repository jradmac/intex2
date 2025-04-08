import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';

// Debug component to show when no routes match
const NotFoundDebug = () => {
  // Get all localStorage entries
  const localStorageEntries = Object.keys(localStorage).reduce((acc: Record<string, string>, key) => {
    const value = localStorage.getItem(key);
    if (value) {
      acc[key] = value;
    }
    return acc;
  }, {});

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="mb-6">Sorry, the page you are looking for does not exist.</p>
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">Debug Information</h2>
        <h3 className="text-lg font-bold mb-2">Local Storage</h3>
        <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
          {JSON.stringify(localStorageEntries, null, 2)}
        </pre>
      </div>
    </div>
  );
};

// Auth guard component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userDataStr = localStorage.getItem('userData');
    const isLoggedIn = Boolean(token && userDataStr);
    
    setIsAuthenticated(isLoggedIn);
  }, []);
  
  // Show loading while checking auth status
  if (isAuthenticated === null) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Render children if authenticated
  return <>{children}</>;
};

function App() {
  // Avoid checking login status during render
  // Using useState and useEffect instead
  const [authStatus, setAuthStatus] = useState<{
    isChecking: boolean;
    isLoggedIn: boolean;
  }>({
    isChecking: true,
    isLoggedIn: false
  });
  
  useEffect(() => {
    // Check auth status on component mount
    const token = localStorage.getItem('token');
    const userDataStr = localStorage.getItem('userData');
    const isLoggedIn = Boolean(token && userDataStr);
    
    setAuthStatus({
      isChecking: false,
      isLoggedIn
    });
    
    console.log('App: Auth status -', { isLoggedIn });
  }, []);

  // Show loading while checking auth status
  if (authStatus.isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <CartProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected routes */}
          <Route path="/home" element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } />
          
          {/* Root path redirects to login */}
          <Route path="/" element={
            <Navigate to="/login" replace />
          } />
          
          {/* Catch-all route for debugging */}
          <Route path="*" element={<NotFoundDebug />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;