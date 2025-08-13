import React, { useState } from 'react';
import { AppContext } from './AppContext';
import apiClient from '../utils/axiosConfig';

const AppProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(
    localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
  );

  // Function to handle user login
  const loginUser = async (credentials) => {
    try {
      const response = await apiClient.post('/users/login', credentials);
      const { token, ...userData } = response.data;

      setToken(token);
      setUser(userData);

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Return the full user data on success
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login failed:', error.response.data.message);
      return { success: false, message: error.response.data.message };
    }
  };

  // Function to handle user registration
  const registerUser = async (userData) => {
    try {
      const response = await apiClient.post('/users/register', userData);
      const { token, ...newUserData } = response.data;

      setToken(token);
      setUser(newUserData);

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(newUserData));

      return { success: true, user: newUserData };
    } catch (error) {
      console.error('Registration failed:', error.response.data.message);
      return { success: false, message: error.response.data.message };
    }
  };

  const logoutUser = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AppContext.Provider value={{ token, user, loginUser, registerUser, logoutUser }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;