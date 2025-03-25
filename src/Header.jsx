import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="flex items-center justify-between p-0 bg-white shadow-md">
      {/* Logo on the left */}
      <div className="flex items-center">
        { <img src="src\assets\TaxEase.png" alt="Logo" className="h-20 w-20" /> }
      </div>

      {/* Navigation links on the right */}
      <nav className="flex space-x-4">
        <Link to="/calculator" className="text-gray-700 hover:text-blue-500">Calculator</Link>
        <Link to="/advice" className="text-gray-700 hover:text-blue-500">Advice</Link>
        <Link to="/about" className="text-gray-700 hover:text-blue-500">About Us</Link>
      </nav>

      {/* Login/Signup button on the extreme right */}
      <div className="mr-4">
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Login / Sign Up
        </button>
      </div>
    </header>
  );
};

export default Header;