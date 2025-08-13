import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AppContext } from '../../contexts/AppContext';

const ProtectedRoute = ({ children }) => {
  const { token } = useContext(AppContext);

  if (!token) {
    // If there is no token, redirect the user to the login page
    return <Navigate to="/login" />;
  }

  // If a token exists, render the child components (the protected page)
  return children;
};

export default ProtectedRoute;