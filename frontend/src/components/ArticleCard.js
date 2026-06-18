import React, { useState, useEffect } from "react";
import CommentModal from "./CommentSection";

const CAT_COLORS = {Tech:"#3b82f6",Sports:"#22c55e",Politics:"#f59e0b",Entertainment:"#ec4899",Business:"#8b5cf6",Education:"#14b8a6",General:"#6b7280"};

const ArticleCard = ({ article, user, darkMode }) => {
  const [showModal, setShowModal] = useState(false);
  const [hovered,   setHovered]   = useState(false);
  const [imgError,  setImgError]  = useState(false);
  const [bookmarked,setBookmarked]= useState(false);

  useEffect(() => {
    try {
      const ids = JSON.parse(localStorage.getItem(`tw_bookmarks_${user?._id || "guest"}`) || "[]");
      setBookmarked(ids.includes(article._id));
    } catch {}
  }, [article._id, user?._id]);

  const toggleBookmark = (e) => {
    e.preventDefault(); e.stopPropagation();
    try {
      const ids  = JSON.parse(localStorage.getItem(`tw_bookmarks_${user?._id || "guest"}`) || "[]");
      const next = ids.includes(article._id) ? ids.filter(i=>i!==article._id) : [...ids, article._id];
      localStorage.getItem(`tw_bookmarks_${user?._id || "guest"}`, JSON.stringify(next));
      setBookmarked(!bookmarked);
      window.dispatchEvent(new Event("tw_bookmarks_changed"));
    } catch {}
  };

  const date     = article.createdAt ? new Date(article.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short"}) : "";
  const catColor = CAT_COLORS[article.category] || "#6b7280";
  const cardBg   = darkMode ? "#1e293b" : "#fff";
  const titleCol = darkMode ? "#f1f5f9" : "#111827";
  const metaCol  = darkMode ? "#94a3b8" : "#6b7280";

  return (
    <>
      <div style={{borderRadius:16,overflow:"hidden",background:cardBg,height:"100%",display:"flex",flexDirection:"column",
        border: darkMode ? "1px solid rgba(255,255,255,0.1)" : "none",
        boxShadow: hovered ? "0 16px 40px rgba(79,70,229,.18)" : `0 4px 15px rgba(0,0,0,${darkMode?.14:.07})`,
        transform: hovered ? "translateY(-5px)" : "translateY(0)", transition:"all .3s ease"}}
        onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}>

        {/* Image */}
        <div style={{height:210,overflow:"hidden",position:"relative",flexShrink:0}}>
          <img
            src={imgError||!article.media?.[0] ? "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80" : article.media[0]}
            alt={article.title} loading="lazy" onError={()=>setImgError(true)}
            style={{width:"100%",height:"100%",objectFit:"cover",transform:hovered?"scale(1.06)":"scale(1)",transition:"transform .4s ease"}}
          />
          {/* Category badge */}
          <span style={{position:"absolute",top:12,left:12,background:catColor,color:"#fff",fontSize:"0.68rem",fontWeight:700,padding:"3px 10px",borderRadius:999,textTransform:"uppercase",letterSpacing:"0.5px"}}>
            {article.category||"General"}
          </span>
          {/* Bookmark button */}
          <button onClick={toggleBookmark} title={bookmarked?"Remove bookmark":"Save article"}
            style={{position:"absolute",top:10,right:10,background:bookmarked?"#4f46e5":"rgba(0,0,0,.45)",backdropFilter:"blur(6px)",border:"none",borderRadius:"50%",width:32,height:32,cursor:"pointer",fontSize:"0.85rem",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s",color:"#fff"}}>
            {bookmarked ? "🔖" : "🏷️"}
          </button>
          {/* Date */}
          <span style={{position:"absolute",bottom:10,right:10,background:"rgba(0,0,0,.55)",backdropFilter:"blur(6px)",color:"#fff",fontSize:"0.7rem",fontWeight:600,padding:"3px 10px",borderRadius:999}}>
            {date}
          </span>
        </div>

        {/* Body */}
        <div style={{padding:"16px 18px",display:"flex",flexDirection:"column",flexGrow:1}}>
          <h5 style={{fontWeight:700,fontSize:"0.96rem",lineHeight:1.45,color:titleCol,marginBottom:8,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>
            {article.title}
          </h5>
          <p style={{fontSize:"0.82rem",color:metaCol,lineHeight:1.55,marginBottom:12,flexGrow:1,display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden"}}>
            {article.meta}
          </p>
          {article.readTime && (
            <div style={{fontSize:"0.73rem",color:"#9ca3af",marginBottom:12}}>⏱ {article.readTime} min read</div>
          )}

          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"auto",gap:8}}>
            <button onClick={()=>setShowModal(true)}
              style={{background:"none",border:`1px solid ${darkMode?"#334155":"#e5e7eb"}`,borderRadius:8,padding:"6px 12px",fontSize:"0.78rem",color:metaCol,cursor:"pointer",transition:"all .2s",flexShrink:0}}
              onMouseEnter={e=>{e.target.style.borderColor="#4f46e5";e.target.style.color="#4f46e5"}}
              onMouseLeave={e=>{e.target.style.borderColor=darkMode?"#334155":"#e5e7eb";e.target.style.color=metaCol}}>
              💬 Comments
            </button>
            <a href={`/article/${article.slug}`}
              style={{background:"#4f46e5",color:"#fff",borderRadius:8,padding:"6px 16px",fontSize:"0.78rem",fontWeight:600,textDecoration:"none",transition:"background .2s",flexShrink:0}}
              onMouseEnter={e=>e.target.style.background="#4338ca"} onMouseLeave={e=>e.target.style.background="#4f46e5"}>
              Read →
            </a>
          </div>
        </div>
      </div>

      <CommentModal articleId={article._id} user={user} isOpen={showModal} onClose={()=>setShowModal(false)} darkMode={darkMode}/>
    </>
  );
};

export default ArticleCard;