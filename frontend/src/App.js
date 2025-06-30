import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/HomePage';
import ArticleDetail from './pages/ArticleDetail';
import axios from 'axios';
import Navbar from './components/Navbar'

axios.defaults.baseURL = 'http://localhost:5050/api';
axios.defaults.withCredentials = true; // ⬅️ IMPORTANT for session cookies

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // to show a loading screen initially

  useEffect(() => {
    axios
      .get('/auth/me') // ⬅️ Now uses session cookie, not token
      .then((res) => {
        setUser(res.data);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center mt-5">Loading...</p>;

  return (
    <Router>
      {user && <Navbar user={user} />} 
      <Routes>
        <Route path="/" element={user ? <Home user={user} /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/article/:slug" element={<ArticleDetail user={user}/>} />
      </Routes>
    </Router>
  );
}

export default App;
