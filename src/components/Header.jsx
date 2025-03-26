import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <header className="header">
            <div className="header-content">
                <Link to="/" className="logo">
                    TaxEase
                </Link>
                <nav className="nav-links">
                    {user ? (
                        <>
                            <Link to="/calculator" className="nav-button">Calculator</Link>
                            <Link to="/history" className="nav-button">History</Link>
                            <span className="welcome-text">Welcome, {user.username}</span>
                            <button onClick={handleLogout} className="logout-button">
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className="login-button">
                            Login / Sign Up
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;