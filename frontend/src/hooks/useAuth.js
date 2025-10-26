// hooks/useAuth.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { setCurrentUser, setIsAuthenticated } = useAuthContext();

  // Login function
  const login = async (credentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Make actual API call to backend
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      console.log('Login successful with:', credentials);
      
      // Store user data from response
      const userData = data.user;
      
      // Update context
      setCurrentUser(userData);
      setIsAuthenticated(true);
      
      // Store the token and user data in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('isLoggedIn', true);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Redirect to the dashboard or home page
      setTimeout(() => {
        setIsLoading(false);
        navigate('/');
      }, 1000);
      
      return true;
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
      setIsLoading(false);
      return false;
    }
  };

  // Register function
  const register = async (userData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Make actual API call to backend
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      console.log('Registration successful with:', userData);
      
      // Redirect to login page after successful registration
      setTimeout(() => {
        setIsLoading(false);
        navigate('/login', { state: { registered: true } });
      }, 1000);
      
      return true;
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      setIsLoading(false);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    // Update context
    setCurrentUser(null);
    setIsAuthenticated(false);
    
    // Remove token and user data from storage
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    
    // Redirect to login page
    navigate('/login');
  };

  // Link user profile with auth user
  const linkUserProfile = async (profileId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await fetch('http://localhost:5000/api/auth/link-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ profileId }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to link profile');
      }
      
      // Update user in context and localStorage
      setCurrentUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      return true;
    } catch (err) {
      setError(err.message || 'Failed to link profile');
      setIsLoading(false);
      return false;
    }
  };

  return {
    isLoading,
    error,
    login,
    register,
    logout,
    linkUserProfile,
    setError
  };
};

export default useAuth;
