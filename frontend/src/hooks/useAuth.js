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
      // Here you would make the actual API call to your backend
      // Replace this with your API endpoint
      // const response = await fetch('/api/login', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(credentials),
      // });
      
      // const data = await response.json();
      
      // if (!response.ok) {
      //   throw new Error(data.message || 'Login failed');
      // }
      
      // Simulate successful login for now
      console.log('Login successful with:', credentials);
      
      // Store user data
      const userData = { username: credentials.username };
      
      // Update context
      setCurrentUser(userData);
      setIsAuthenticated(true);
      
      // Store the token in localStorage or session storage
      // localStorage.setItem('token', data.token);
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
      // Here you would make the actual API call to your backend
      // Replace this with your API endpoint
      // const response = await fetch('/api/register', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(userData),
      // });
      
      // const data = await response.json();
      
      // if (!response.ok) {
      //   throw new Error(data.message || 'Registration failed');
      // }
      
      // Simulate successful registration for now
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

  return {
    isLoading,
    error,
    login,
    register,
    logout,
    setError
  };
};

export default useAuth;
