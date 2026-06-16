import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = ({ user, onLogout }) => {
  const [searchVal, setSearchVal] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/?search=${encodeURIComponent(searchVal.trim())}`);
    } else {
      navigate("/");
    }
  };

  return (
    <>
    <style>{`
      .tw-search::placeholder { color: rgba(255,255,255,0.4) !important; }
      .tw-search { color: #f9fafb !important; }
    `}</style>
    <nav style={{
      background: "#1a1a2e",
      borderBottom: "1px solid rgba(255,255,255,0.07)",
      padding: "0 28px",
      height: "64px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 1000,
    }}>
      {/* Logo */}
      <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "1.3rem" }}>🧠</span>
        <span style={{ fontWeight: 800, fontSize: "1.2rem", color: "#818cf8", letterSpacing: "-0.3px" }}>
          TrendWise
        </span>
        <span style={{
          fontSize: "0.68rem", fontWeight: 600, color: "#6ee7b7",
          background: "rgba(110,231,183,0.12)", border: "1px solid rgba(110,231,183,0.3)",
          borderRadius: "999px", padding: "2px 8px", marginLeft: "4px",
        }}>
          AI
        </span>
      </Link>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {/* Search */}
        <form onSubmit={handleSearch} style={{ display: "flex", alignItems: "center" }}>
          <input
            className="tw-search"
            type="search"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search articles..."
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "999px",
              padding: "7px 18px",
              color: "#f9fafb",
              fontSize: "0.85rem",
              outline: "none",
              width: "220px",
              transition: "all 0.2s",
            }}
            onFocus={(e) => { e.target.style.borderColor = "rgba(129,140,248,0.6)"; e.target.style.background = "rgba(255,255,255,0.1)"; }}
            onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; e.target.style.background = "rgba(255,255,255,0.07)"; }}
          />
        </form>

        {/* User */}
        {user ? (
          <div className="dropdown">
            <button
              className="btn border-0 dropdown-toggle d-flex align-items-center gap-2 p-0"
              type="button"
              data-bs-toggle="dropdown"
              style={{ background: "none", color: "#f9fafb" }}
            >
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4f46e5&color=fff`}
                alt="Profile"
                style={{ width: "34px", height: "34px", borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(129,140,248,0.5)" }}
              />
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#e5e7eb" }}>{user.name.split(" ")[0]}</span>
            </button>
            <ul className="dropdown-menu dropdown-menu-end shadow" style={{ border: "none", borderRadius: "12px", padding: "8px", minWidth: "200px" }}>
              <li className="px-3 py-2">
                <strong style={{ fontSize: "0.9rem" }}>{user.name}</strong>
                <br />
                <small className="text-muted">{user.email}</small>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <button className="dropdown-item text-danger" style={{ borderRadius: "8px" }} onClick={onLogout}>
                  🚪 Logout
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <Link to="/login" style={{
            background: "#4f46e5", color: "#fff",
            padding: "8px 20px", borderRadius: "999px",
            textDecoration: "none", fontWeight: 600, fontSize: "0.85rem",
          }}>
            Sign In
          </Link>
        )}
      </div>
    </nav>
    </>
  );
};

export default Navbar;