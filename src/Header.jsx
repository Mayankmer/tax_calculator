import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="flex items-center justify-between p-4 bg-white shadow-md">
      {/* Logo on the left */}
      <div className="flex items-center">
        <h1>TaxEase</h1>
        {/* <img src="/path/to/logo.png" alt="Logo" className="h-10" /> */}
      </div>

      {/* Navigation links on the right */}
      <nav className="flex space-x-4">
        <Link to="/calculator" className="text-gray-700 hover:text-blue-500">Calculator</Link>
        <Link to="/advice" className="text-gray-700 hover:text-blue-500">Advice</Link>
        <Link to="/about" className="text-gray-700 hover:text-blue-500">About Us</Link>
      </nav>

      {/* Login/Signup button on the extreme right */}
      <div>
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Login / Sign Up
        </button>
      </div>
    </header>
  );
};

export default Header;