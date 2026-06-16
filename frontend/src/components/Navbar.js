import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = ({ user, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/?search=${encodeURIComponent(searchVal.trim())}`);
    } else {
      navigate("/");
    }
    setMenuOpen(false);
  };

  return (
    <>
      <style>{`
        .tw-search::placeholder { color: rgba(255,255,255,0.4) !important; }
        .tw-search { color: #f9fafb !important; }
        .tw-search:focus { outline: none; border-color: rgba(129,140,248,0.6) !important; background: rgba(255,255,255,0.1) !important; }
        .tw-nav-link { color: #d1d5db !important; text-decoration: none; font-size: 0.95rem; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06); display: block; }
        .tw-nav-link:hover { color: #818cf8 !important; }
        .tw-hamburger { background: none; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; padding: 6px 10px; cursor: pointer; color: #f9fafb; font-size: 1.1rem; }
        .tw-mobile-menu { background: #16213e; border-top: 1px solid rgba(255,255,255,0.07); padding: 12px 20px 20px; }
        @media (min-width: 768px) { .tw-hamburger { display: none !important; } .tw-mobile-menu { display: none !important; } }
        @media (max-width: 767px) { .tw-desktop-right { display: none !important; } }
      `}</style>

      {/* Main navbar bar */}
      <nav style={{
        background: "#1a1a2e",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        padding: "0 20px",
        height: "60px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        width: "100%",
        boxSizing: "border-box",
      }}>

        {/* Logo */}
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          <span style={{ fontSize: "1.25rem" }}>🧠</span>
          <span style={{ fontWeight: 800, fontSize: "1.15rem", color: "#818cf8", letterSpacing: "-0.3px" }}>
            TrendWise
          </span>
          <span style={{
            fontSize: "0.65rem", fontWeight: 600, color: "#6ee7b7",
            background: "rgba(110,231,183,0.12)", border: "1px solid rgba(110,231,183,0.3)",
            borderRadius: "999px", padding: "2px 7px",
          }}>
            AI
          </span>
        </Link>

        {/* Desktop right side */}
        <div className="tw-desktop-right" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <form onSubmit={handleSearch} style={{ display: "flex" }}>
            <input
              type="search"
              className="tw-search"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Search articles..."
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "999px",
                padding: "7px 18px",
                fontSize: "0.85rem",
                width: "210px",
                transition: "all 0.2s",
              }}
            />
          </form>

          {user ? (
            <div className="dropdown">
              <button
                className="btn border-0 dropdown-toggle d-flex align-items-center gap-2 p-0"
                type="button"
                data-bs-toggle="dropdown"
                style={{ background: "none" }}
              >
                <img
                  src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4f46e5&color=fff`}
                  alt="Profile"
                  style={{ width: "34px", height: "34px", borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(129,140,248,0.5)" }}
                />
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#e5e7eb" }}>
                  {user.name.split(" ")[0]}
                </span>
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow" style={{ border: "none", borderRadius: "12px", padding: "8px", minWidth: "200px" }}>
                <li className="px-3 py-2">
                  <strong style={{ fontSize: "0.9rem" }}>{user.name}</strong><br />
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

        {/* Mobile: avatar + hamburger */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {user && (
            <img
              src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4f46e5&color=fff`}
              alt="Profile"
              style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(129,140,248,0.5)" }}
            />
          )}
          <button
            className="tw-hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="tw-mobile-menu">
          {/* Search */}
          <form onSubmit={handleSearch} style={{ marginBottom: "14px" }}>
            <input
              type="search"
              className="tw-search"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Search articles..."
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "10px",
                padding: "10px 16px",
                fontSize: "0.9rem",
                boxSizing: "border-box",
              }}
            />
          </form>

          {user ? (
            <>
              <div style={{ padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: "8px" }}>
                <div style={{ fontWeight: 700, color: "#f9fafb", fontSize: "0.9rem" }}>{user.name}</div>
                <div style={{ color: "#9ca3af", fontSize: "0.8rem" }}>{user.email}</div>
              </div>
              <button
                onClick={() => { setMenuOpen(false); onLogout(); }}
                style={{
                  width: "100%", padding: "11px", border: "none",
                  borderRadius: "10px", background: "rgba(239,68,68,0.12)",
                  color: "#f87171", fontWeight: 600, fontSize: "0.9rem",
                  cursor: "pointer", textAlign: "left",
                }}
              >
                🚪 Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              style={{
                display: "block", width: "100%", padding: "11px",
                background: "#4f46e5", color: "#fff", borderRadius: "10px",
                textDecoration: "none", fontWeight: 600, textAlign: "center",
                fontSize: "0.9rem",
              }}
            >
              Sign In with Google
            </Link>
          )}
        </div>
      )}
    </>
  );
};

export default Navbar;