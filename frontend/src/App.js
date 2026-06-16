import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/HomePage";
import ArticleDetail from "./pages/ArticleDetail";
import Navbar from "./components/Navbar";
import AdminDashboard from "./pages/AdminDashboard";
import axios from "axios";

axios.defaults.baseURL = process.env.REACT_APP_API_URL;
axios.defaults.withCredentials = true;

// Inline page loader so we don't need Spinner.js dependency
const PageLoader = () => (
  <div style={{
    minHeight: "100vh",
    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", gap: "20px",
  }}>
    <div style={{ fontSize: "2.5rem" }}>🧠</div>
    <div style={{ display: "flex", gap: "8px" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: "10px", height: "10px", borderRadius: "50%",
          background: "#818cf8",
          animation: "bounce 1.2s ease-in-out infinite",
          animationDelay: `${i * 0.2}s`,
        }} />
      ))}
    </div>
    <style>{`
      @keyframes bounce {
        0%, 100% { transform: translateY(0); opacity: 0.4; }
        50% { transform: translateY(-10px); opacity: 1; }
      }
    `}</style>
  </div>
);

const AppWrapper = () => {
  // Seed from sessionStorage so returning users see content instantly
  const [user, setUser] = useState(() => {
    try {
      const cached = sessionStorage.getItem("tw_user");
      return cached ? JSON.parse(cached) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/login") {
      setLoading(false);
      return;
    }
    axios
      .get("/api/auth/me")
      .then((res) => {
        setUser(res.data);
        sessionStorage.setItem("tw_user", JSON.stringify(res.data));
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        sessionStorage.removeItem("tw_user");
        setLoading(false);
      });
  }, [location.pathname]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await axios.post("/api/auth/logout");
      sessionStorage.removeItem("tw_user");
      setUser(null);
      setLoggingOut(false);
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout failed:", err.message);
      setLoggingOut(false);
    }
  };

  // Only show loader on first ever load (no cached user)
  if (loading && !user) return <PageLoader />;

  return (
    <>
      {loggingOut && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(15,23,42,0.85)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <PageLoader />
        </div>
      )}

      {location.pathname !== "/login" && (
        <Navbar user={user} onLogout={handleLogout} />
      )}

      <Routes>
        <Route
          path="/"
          element={
            user ? (
              user.role === "admin" ? (
                <Navigate to="/admin" />
              ) : (
                <Home user={user} />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            user?.role === "admin" ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/article/:slug" element={<ArticleDetail user={user} />} />
      </Routes>
    </>
  );
};

const App = () => (
  <Router>
    <AppWrapper />
  </Router>
);

export default App;