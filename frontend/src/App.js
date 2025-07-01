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
import Spinner from "./components/Spinner";
import axios from "axios";
import AdminDashboard from "./pages/AdminDashboard";

axios.defaults.baseURL = process.env.REACT_APP_API_URL;
axios.defaults.withCredentials = true;

const AppWrapper = () => {
  const [user, setUser] = useState(null);
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
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, [location.pathname]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await axios.post("/api/auth/logout");
      setTimeout(() => {
        setUser(null);
        setLoggingOut(false);
        window.location.href = "/login";
      }, 1000);
    } catch (err) {
      console.error("Logout failed:", err.message);
      setLoggingOut(false);
    }
  };

  if (loading) return <p className="text-center mt-5">Loading...</p>;

  return (
    <>
      {loggingOut && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-light d-flex align-items-center justify-content-center"
          style={{ zIndex: 9999 }}
        >
          <Spinner />
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
