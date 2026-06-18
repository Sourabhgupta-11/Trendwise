import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = ({ user, onLogout, darkMode, toggleDark }) => {
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [searchVal,  setSearchVal]  = useState("");
  const [isMobile,   setIsMobile]   = useState(window.innerWidth < 768);
  const [bookmarks,  setBookmarks]  = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const onResize = () => { setIsMobile(window.innerWidth < 768); if (window.innerWidth >= 768) setMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    try { setBookmarks(JSON.parse(localStorage.getItem(`tw_bookmarks_${user?._id || "guest"}`) || "[]").length); } catch {}
  }, [user?._id]);

  useEffect(() => {
    const onStorage = () => { try { setBookmarks(JSON.parse(localStorage.getItem(`tw_bookmarks_${user?._id || "guest"}`) || "[]").length); } catch {} };
    window.addEventListener("storage", onStorage);
    window.addEventListener("tw_bookmarks_changed", onStorage);
    return () => { window.removeEventListener("storage", onStorage); window.removeEventListener("tw_bookmarks_changed", onStorage); };
  }, [user?._id]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchVal.trim()) navigate(`/?search=${encodeURIComponent(searchVal.trim())}`);
    else navigate("/");
    setMenuOpen(false);
  };

  const bg    = darkMode ? "#0f172a" : "#1a1a2e";
  const border = "1px solid rgba(255,255,255,0.07)";

  return (
    <>
      <style>{`
        .tw-s::placeholder{color:rgba(255,255,255,.38)!important}
        .tw-s{color:#f9fafb!important}
        .tw-s:focus{outline:none;border-color:rgba(129,140,248,.6)!important;background:rgba(255,255,255,.1)!important}
        .tw-navlink{color:#d1d5db;text-decoration:none;font-size:.88rem;font-weight:500;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.06);display:block;transition:color .15s}
        .tw-navlink:hover{color:#818cf8}
      `}</style>

      <nav style={{background:bg,borderBottom:border,padding:"0 20px",height:60,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:1000,width:"100%",boxSizing:"border-box"}}>

        {/* Logo */}
        <Link to="/" style={{textDecoration:"none",display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
          <span style={{fontSize:"1.25rem"}}>🧠</span>
          <span style={{fontWeight:800,fontSize:"1.15rem",color:"#818cf8",letterSpacing:"-0.3px"}}>TrendWise</span>
          <span style={{fontSize:"0.62rem",fontWeight:700,color:"#6ee7b7",background:"rgba(110,231,183,.12)",border:"1px solid rgba(110,231,183,.3)",borderRadius:999,padding:"2px 7px"}}>AI</span>
        </Link>

        {/* Desktop */}
        {!isMobile && (
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <form onSubmit={handleSearch} style={{display:"flex"}}>
              <input type="search" className="tw-s" value={searchVal} onChange={e=>setSearchVal(e.target.value)}
                placeholder="Search articles…"
                style={{background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.12)",borderRadius:999,padding:"7px 18px",fontSize:"0.84rem",width:210,transition:"all .2s"}}
              />
            </form>

            {/* Bookmarks */}
            <Link to="/?bookmarks=1" title="Saved articles" style={{textDecoration:"none",position:"relative",color:"#d1d5db",fontSize:"1.15rem"}}>
              🔖
              {bookmarks > 0 && <span style={{position:"absolute",top:-6,right:-6,background:"#4f46e5",color:"#fff",fontSize:"0.6rem",fontWeight:700,borderRadius:999,padding:"1px 5px",minWidth:16,textAlign:"center"}}>{bookmarks}</span>}
            </Link>

            {/* Dark mode */}
            <button onClick={toggleDark} title="Toggle dark mode"
              style={{background:"none",border:"1px solid rgba(255,255,255,.15)",borderRadius:999,padding:"5px 11px",cursor:"pointer",fontSize:"1rem",color:"#d1d5db",transition:"all .2s"}}
            >
              {darkMode ? "☀️" : "🌙"}
            </button>

            {user ? (
              <div className="dropdown">
                <button className="btn border-0 dropdown-toggle d-flex align-items-center gap-2 p-0" type="button" data-bs-toggle="dropdown" style={{background:"none"}}>
                  <img src={user.avatar||`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4f46e5&color=fff`} alt="Profile"
                    style={{width:34,height:34,borderRadius:"50%",objectFit:"cover",border:"2px solid rgba(129,140,248,.5)"}}/>
                  <span style={{fontSize:"0.84rem",fontWeight:600,color:"#e5e7eb"}}>{user.name.split(" ")[0]}</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow" style={{border:"none",borderRadius:12,padding:8,minWidth:200}}>
                  <li className="px-3 py-2">
                    <strong style={{fontSize:"0.9rem"}}>{user.name}</strong><br/>
                    <small className="text-muted">{user.email}</small>
                  </li>
                  <li><hr className="dropdown-divider"/></li>
                  <li><button className="dropdown-item text-danger" style={{borderRadius:8}} onClick={onLogout}>🚪 Logout</button></li>
                </ul>
              </div>
            ) : (
              <Link to="/login" style={{background:"#4f46e5",color:"#fff",padding:"8px 20px",borderRadius:999,textDecoration:"none",fontWeight:600,fontSize:"0.84rem"}}>Sign In</Link>
            )}
          </div>
        )}

        {/* Mobile icons */}
        {isMobile && (
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <button onClick={toggleDark} style={{background:"none",border:"none",fontSize:"1.1rem",cursor:"pointer",color:"#d1d5db",padding:4}}>{darkMode?"☀️":"🌙"}</button>
            {user && <img src={user.avatar||`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4f46e5&color=fff`} alt="profile" style={{width:32,height:32,borderRadius:"50%",objectFit:"cover",border:"2px solid rgba(129,140,248,.5)"}}/>}
            <button onClick={()=>setMenuOpen(o=>!o)} style={{background:"none",border:"1px solid rgba(255,255,255,.2)",borderRadius:8,padding:"6px 10px",cursor:"pointer",color:"#f9fafb",fontSize:"1.1rem"}}>{menuOpen?"✕":"☰"}</button>
          </div>
        )}
      </nav>

      {/* Mobile menu */}
      {isMobile && menuOpen && (
        <div style={{background:darkMode?"#0f172a":"#16213e",borderBottom:border,padding:"12px 20px 20px"}}>
          <form onSubmit={handleSearch} style={{marginBottom:14}}>
            <input type="search" className="tw-s" value={searchVal} onChange={e=>setSearchVal(e.target.value)} placeholder="Search articles…"
              style={{width:"100%",background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.15)",borderRadius:10,padding:"10px 16px",fontSize:"0.9rem",boxSizing:"border-box"}}
            />
          </form>
          <Link to="/?bookmarks=1" onClick={()=>setMenuOpen(false)} className="tw-navlink">🔖 Saved Articles {bookmarks>0&&`(${bookmarks})`}</Link>
          {user ? (
            <>
              <div style={{padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,.06)",marginBottom:8}}>
                <div style={{fontWeight:700,color:"#f9fafb",fontSize:"0.9rem"}}>{user.name}</div>
                <div style={{color:"#9ca3af",fontSize:"0.8rem"}}>{user.email}</div>
              </div>
              <button onClick={()=>{setMenuOpen(false);onLogout();}} style={{width:"100%",padding:11,border:"none",borderRadius:10,background:"rgba(239,68,68,.12)",color:"#f87171",fontWeight:600,fontSize:"0.9rem",cursor:"pointer",textAlign:"left"}}>🚪 Logout</button>
            </>
          ) : (
            <Link to="/login" onClick={()=>setMenuOpen(false)} style={{display:"block",padding:11,background:"#4f46e5",color:"#fff",borderRadius:10,textDecoration:"none",fontWeight:600,textAlign:"center",fontSize:"0.9rem"}}>Sign In with Google</Link>
          )}
        </div>
      )}
    </>
  );
};

export default Navbar;