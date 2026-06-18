import React, { useEffect, useState, useRef } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from "react-router-dom";
import Login          from "./pages/Login";
import Home           from "./pages/HomePage";
import ArticleDetail  from "./pages/ArticleDetail";
import Navbar         from "./components/Navbar";
import AdminDashboard from "./pages/AdminDashboard";
import axios from "axios";

axios.defaults.baseURL        = process.env.REACT_APP_API_URL;
axios.defaults.withCredentials = true;
axios.defaults.timeout         = 10000;
const getStorageKey = (base, userId) => userId ? `${base}_${userId}` : base;

const removeSplash = () => {
  const el = document.getElementById("tw-splash");
  if (el) { el.classList.add("hide"); setTimeout(() => el.remove(), 450); }
};

const AppWrapper = () => {
  const [user,       setUser]       = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("tw_user")); } catch { return null; }
  });
  const [authReady,  setAuthReady]  = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [darkMode,   setDarkMode]   = useState(() => localStorage.getItem("tw_dark") === "1");
  const location  = useLocation();
  const splashRef = useRef(false);

  useEffect(() => {
    if (!splashRef.current) { splashRef.current = true; removeSplash(); }
  }, []);

  useEffect(() => {
    if (location.pathname === "/login") { setAuthReady(true); return; }
    axios.get("/api/auth/me")
      .then(res  => { setUser(res.data); sessionStorage.setItem("tw_user", JSON.stringify(res.data)); })
      .catch(()  => { setUser(null); sessionStorage.removeItem("tw_user"); })
      .finally(() => setAuthReady(true));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);   

  useEffect(() => {
    if (!user?._id) return;
    const oldKey = "tw_bookmarks";
    const newKey = getStorageKey("tw_bookmarks", user._id);
    if (localStorage.getItem(oldKey) && !localStorage.getItem(newKey)) {
      localStorage.setItem(newKey, localStorage.getItem(oldKey));
    }
    localStorage.removeItem(oldKey); 
  }, [user?._id]);


  useEffect(() => {
    document.body.setAttribute("data-theme", darkMode ? "dark" : "light");
    document.body.style.background = darkMode ? "#0f172a" : "";
    localStorage.setItem("tw_dark", darkMode ? "1" : "0");
  }, [darkMode]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try { await axios.post("/api/auth/logout"); } catch {}
    sessionStorage.removeItem("tw_user");
    setUser(null); setLoggingOut(false);
    window.location.href = "/login";
  };

  return (
    <>
      {loggingOut && (
        <div style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(15,23,42,.9)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16}}>
          <span style={{fontSize:"2rem"}}>🧠</span>
          <div style={{display:"flex",gap:8}}>{[0,1,2].map(i=><span key={i} style={{width:10,height:10,borderRadius:"50%",background:"#818cf8",display:"inline-block",animation:"tw-b 1.2s ease-in-out infinite",animationDelay:`${i*.2}s`}}/>)}</div>
        </div>
      )}

      {location.pathname !== "/login" && (
        <Navbar user={user} onLogout={handleLogout} darkMode={darkMode} toggleDark={()=>setDarkMode(d=>!d)} />
      )}

      <Routes>
        <Route path="/"
          element={
            !authReady && !user
              ? <div style={{minHeight:"100vh"}}/>   // blank — splash still showing
              : user
                ? (user.role==="admin" ? <Navigate to="/admin"/> : <Home user={user} darkMode={darkMode}/>)
                : <Navigate to="/login"/>
          }
        />
        <Route path="/login"         element={<Login />} />
        <Route path="/admin"         element={user?.role==="admin" ? <AdminDashboard /> : <Navigate to="/login"/>} />
        <Route path="/article/:slug" element={<ArticleDetail user={user} darkMode={darkMode}/>} />
      </Routes>

      <style>{`@keyframes tw-b{0%,100%{transform:translateY(0);opacity:.4}50%{transform:translateY(-10px);opacity:1}}`}</style>
    </>
  );
};

const App = () => <Router><AppWrapper /></Router>;
export default App;