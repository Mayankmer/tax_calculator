import React from 'react';

const Header = () => {
  return (
    <header className="flex items-center justify-between p-4 bg-white shadow-md">
      {/* Logo on the left */}
      <div className="flex items-center">
        <h1 className=''>TaxEase</h1>
        {/* <img src="src\assets\TaxEase.png" alt="Logo" className="h-10" /> */}
      </div>

      {/* Navigation links on the right */}
      <nav className="flex space-x-4">
        <a href="/calculator" className="text-gray-700 hover:text-blue-500">Calculator</a>
        <a href="/advice" className="text-gray-700 hover:text-blue-500">Advice</a>
        <a href="/about" className="text-gray-700 hover:text-blue-500">About Us</a>
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