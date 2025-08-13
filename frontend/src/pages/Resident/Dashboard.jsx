import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../../contexts/AppContext';

const ResidentDashboard = () => {
  const { user } = useContext(AppContext);

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        Welcome, {user?.name}!
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        This is your dashboard. From here you can manage your complaints.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card for Submitting a New Complaint */}
        <Link 
          to="/resident/submit-complaint" 
          className="bg-blue-500 text-white p-6 rounded-lg shadow-lg hover:bg-blue-600 transition-colors duration-300"
        >
          <h2 className="text-xl font-semibold mb-2">Submit a New Complaint</h2>
          <p>Have an issue? Let us know, and we'll get it fixed.</p>
        </Link>

        {/* Card for Viewing Complaint History */}
        <Link 
          to="/resident/complaints" 
          className="bg-gray-700 text-white p-6 rounded-lg shadow-lg hover:bg-gray-800 transition-colors duration-300"
        >
          <h2 className="text-xl font-semibold mb-2">View Complaint History</h2>
          <p>Check the status of your past and current complaints.</p>
        </Link>
      </div>
    </div>
  );
};

export default ResidentDashboard;