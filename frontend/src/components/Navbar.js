import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/?search=${query}`);
  };

  return (
    <nav className="navbar bg-dark text-white p-3">
      <div className="container-fluid">
        <span className="navbar-brand text-white">TrendWise</span>
        <form onSubmit={handleSearch} className="d-flex">
          <input
            type="text"
            className="form-control me-2"
            placeholder="Search articles..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="btn btn-primary">Search</button>
        </form>
      </div>
    </nav>
  );
};

export default Navbar;
