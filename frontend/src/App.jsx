import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import ProtectedRoute
import ProtectedRoute from './components/Shared/ProtectedRoute';

// Import the new unified Dashboard
import Dashboard from './pages/Dashboard';

// General Pages
import Home from './pages/General/Home';
import About from './pages/General/About';
import Contact from './pages-General/Contact';
import Login from './pages/General/Login';
import Register from './pages/General/Register';
import NotFound from './pages/General/NotFound';

// Resident Pages
import SubmitComplaint from './pages/Resident/SubmitComplaint';
import ComplaintHistory from './pages/Resident/ComplaintHistory';
import Notifications from './pages/Resident/Notifications';
import ResidentProfile from './pages/Resident/Profile';

// Worker Pages
import AssignedComplaints from './pages/Worker/AssignedComplaints';
import UpdateComplaint from './pages/Worker/UpdateComplaint';
import WorkerProfile from './pages-Worker/Profile';

// Admin Pages
import ManageUsers from './pages/Admin/ManageUsers';
import AssignComplaints from './pages/Admin/AssignComplaints';
import ViewAllComplaints from './pages/Admin/ViewAllComplaints';
import ManageCategories from './pages/Admin/ManageCategories';
import ViewLogs from './pages/Admin/ViewLogs';

// Components
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';

const App = () => {
  return (
    <>
      <Navbar />
      <div className="mx-4 sm:mx-[10%] flex flex-col min-h-screen pt-20">
        <ToastContainer />

        <div className="flex-grow">
          <Routes>
            {/* --- Public General Routes --- */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* --- Unified, Protected Dashboard Route --- */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />

            {/* --- Other Protected Routes --- */}
            
            {/* Resident Routes */}
            <Route path="/resident/submit-complaint" element={<ProtectedRoute><SubmitComplaint /></ProtectedRoute>} />
            <Route path="/resident/complaints" element={<ProtectedRoute><ComplaintHistory /></ProtectedRoute>} />
            <Route path="/resident/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/resident/profile" element={<ProtectedRoute><ResidentProfile /></ProtectedRoute>} />

            {/* Worker Routes */}
            <Route path="/worker/assigned" element={<ProtectedRoute><AssignedComplaints /></ProtectedRoute>} />
            <Route path="/worker/update/:id" element={<ProtectedRoute><UpdateComplaint /></ProtectedRoute>} />
            <Route path="/worker/profile" element={<ProtectedRoute><WorkerProfile /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/admin/users" element={<ProtectedRoute><ManageUsers /></ProtectedRoute>} />
            <Route path="/admin/assign" element={<ProtectedRoute><AssignComplaints /></ProtectedRoute>} />
            <Route path="/admin/complaints" element={<ProtectedRoute><ViewAllComplaints /></ProtectedRoute>} />
            <Route path="/admin/categories" element={<ProtectedRoute><ManageCategories /></ProtectedRoute>} />
            <Route path="/admin/logs" element={<ProtectedRoute><ViewLogs /></ProtectedRoute>} />

            {/* --- Fallback Route --- */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>

      </div>
      <Footer />
    </>
  );
};

export default App;