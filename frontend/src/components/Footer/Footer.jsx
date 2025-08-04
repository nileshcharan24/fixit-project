import React from 'react';
import { NavLink } from 'react-router-dom';
import { assets } from '../../assets/assets';

const Footer = () => {
  return (
    <footer className="w-full bg-gray-100 border-t border-gray-300 px-6 py-6">
      <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">

        {/* Left: Logo + App Name */}
        <div className="flex items-center gap-2 cursor-pointer">
          <img src={assets.logo} alt="FixIt Logo" className="w-8 h-8 object-contain" />
          <span className="text-base font-semibold text-blue-700">FixIt</span>
        </div>

        {/* Center: Navigation Links */}
        <div className="flex gap-6 text-sm text-gray-600">
          <NavLink to="/" className={({ isActive }) => isActive ? 'text-blue-600 font-medium' : ''}>Home</NavLink>
          <NavLink to="/about" className={({ isActive }) => isActive ? 'text-blue-600 font-medium' : ''}>About</NavLink>
          <NavLink to="/contact" className={({ isActive }) => isActive ? 'text-blue-600 font-medium' : ''}>Contact</NavLink>
        </div>

        {/* Right: Placeholder text / contact / socials */}
        <div className="text-sm text-gray-500 text-center md:text-right">
          © {new Date().getFullYear()} FixIt. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
