import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// General Pages
import Home from './pages/General/Home';
import About from './pages/General/About';
import Contact from './pages/General/Contact';
import Login from './pages/General/Login';
import Register from './pages/General/Register';
import NotFound from './pages/General/NotFound';

// Resident Pages
import ResidentDashboard from './pages/Resident/Dashboard';
import SubmitComplaint from './pages/Resident/SubmitComplaint';
import ComplaintHistory from './pages/Resident/ComplaintHistory';
import Notifications from './pages/Resident/Notifications';
import ResidentProfile from './pages/Resident/Profile';

// Worker Pages
import WorkerDashboard from './pages/Worker/Dashboard';
import AssignedComplaints from './pages/Worker/AssignedComplaints';
import UpdateComplaint from './pages/Worker/UpdateComplaint';
import WorkerProfile from './pages/Worker/Profile';

// Admin Pages
import AdminDashboard from './pages/Admin/Dashboard';
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
    <div className="mx-4 sm:mx-[10%] flex flex-col min-h-screen">
      <ToastContainer />
      <Navbar />

      <div className="flex-grow">
        <Routes>
          {/* General Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<NotFound />} />

          {/* Resident Routes */}
          <Route path="/resident/dashboard" element={<ResidentDashboard />} />
          <Route path="/resident/submit-complaint" element={<SubmitComplaint />} />
          <Route path="/resident/complaints" element={<ComplaintHistory />} />
          <Route path="/resident/notifications" element={<Notifications />} />
          <Route path="/resident/profile" element={<ResidentProfile />} />

          {/* Worker Routes */}
          <Route path="/worker/dashboard" element={<WorkerDashboard />} />
          <Route path="/worker/assigned" element={<AssignedComplaints />} />
          <Route path="/worker/update/:id" element={<UpdateComplaint />} />
          <Route path="/worker/profile" element={<WorkerProfile />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/assign" element={<AssignComplaints />} />
          <Route path="/admin/complaints" element={<ViewAllComplaints />} />
          <Route path="/admin/categories" element={<ManageCategories />} />
          <Route path="/admin/logs" element={<ViewLogs />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
};

export default App;
