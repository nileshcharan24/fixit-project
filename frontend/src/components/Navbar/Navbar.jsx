import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { assets } from '../../assets/assets';
import { AppContext } from '../../contexts/AppContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { token, setToken, userData } = useContext(AppContext);

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    navigate('/login');
  };

  return (
    // Add 'fixed top-0 z-50' to make the navbar stick to the top
    // 'w-full' ensures it spans the entire width even when fixed.
    // 'z-50' ensures it stays above other content.
    <nav className="w-full bg-white border-b border-gray-200 shadow-md py-3 px-6 fixed top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 flex-wrap">
        
        <div className="flex items-center gap-2 cursor-pointer flex-shrink-0" onClick={() => navigate('/')}>
          <img src={assets.logo} alt="FixIt Logo" className="w-10 h-10 object-contain" />
          <span className="text-lg font-bold text-blue-700 whitespace-nowrap">FixIt</span>
        </div>

        <div className="flex-1 flex justify-center gap-6 text-gray-700 text-sm whitespace-nowrap hidden md:flex">
          <NavLink to="/" className={({ isActive }) => isActive ? 'font-semibold text-blue-600' : 'hover:text-blue-500 transition-colors'}>Home</NavLink>
          <NavLink to="/about" className={({ isActive }) => isActive ? 'font-semibold text-blue-600' : 'hover:text-blue-500 transition-colors'}>About</NavLink>
          <NavLink to="/contact" className={({ isActive }) => isActive ? 'font-semibold text-blue-600' : 'hover:text-blue-500 transition-colors'}>Contact</NavLink>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0 text-sm ml-auto">
          {token && userData ? (
            <div className="flex items-center gap-3">
              <div className="bg-gray-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
                {userData.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <button onClick={logout} className="text-red-600 border border-red-600 px-3 py-1 rounded hover:bg-red-50 transition-colors">Logout</button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => navigate('/login')} className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition-colors">Login</button>
              <button onClick={() => navigate('/register')} className="border border-blue-600 text-blue-600 px-4 py-1 rounded hover:bg-blue-50 transition-colors">Register</button>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;