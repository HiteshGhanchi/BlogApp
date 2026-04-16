import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          THE <span className="logo-serif">CURATOR</span>
        </Link>
        <div className="navbar-links">
          <Link to="/" className="nav-link">Journal</Link>
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/login" className="nav-link nav-link-special">SignIn</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
