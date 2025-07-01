// src/components/Navbar.js
import React from "react";
import { Link } from "react-router-dom";

const Navbar = ({ user, onLogout }) => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm px-4">
      <Link className="navbar-brand fw-bold" to="/">
        🧠 TrendWise
      </Link>

      <div className="ms-auto d-flex align-items-center">
        {/* Search bar (optional) */}
        <form className="d-none d-md-flex me-3">
          <input
            type="search"
            className="form-control"
            placeholder="Search articles..."
            name="search"
          />
        </form>

        {user ? (
          <div className="dropdown">
            <button
              className="btn border-0 dropdown-toggle d-flex align-items-center"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
                alt="Profile"
                className="rounded-circle"
                style={{ width: "36px", height: "36px", objectFit: "cover" }}
              />
            </button>
            <ul className="dropdown-menu dropdown-menu-end shadow">
              <li className="px-3 py-2">
                <strong>{user.name}</strong>
                <br />
                <small className="text-muted">{user.email}</small>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <button className="dropdown-item text-danger" onClick={onLogout}>
                  🚪 Logout
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <Link to="/login" className="btn btn-outline-primary">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
