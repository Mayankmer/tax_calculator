import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Header from './Header';
import TaxCalculator from './TaxCalculator';


// Import other components as needed

function App() {
  return (
    <Router>
      <div>
        <Header />
        <Routes>
          <Route path="/calculator" element={<TaxCalculator />} />
          {/* Add other routes here */}
          <Route path="/advice" element={<div>Advice Page</div>} />
          <Route path="/about" element={<div>About Us Page</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;