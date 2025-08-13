import React, { useContext } from 'react';
import { AppContext } from '../contexts/AppContext';

// Import the specific dashboard components
import ResidentDashboard from './Resident/Dashboard';
import WorkerDashboard from './Worker/Dashboard';
import AdminDashboard from './Admin/Dashboard';

const Dashboard = () => {
  const { user } = useContext(AppContext);

  // If user data is still loading or not available, show a loading message
  if (!user) {
    return <div>Loading...</div>;
  }

  // Conditionally render the correct dashboard based on the user's role
  switch (user.role) {
    case 'resident':
      return <ResidentDashboard />;
    case 'worker':
      return <WorkerDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      // You can redirect to a login or error page as a fallback
      return <div>Invalid user role.</div>;
  }
};

export default Dashboard;