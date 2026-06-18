import React, { useState } from "react";
import CommentModal from "./CommentSection";

const ArticleCard = ({ article, user }) => {
  const [showModal, setShowModal] = useState(false);
  const [hovered,   setHovered]   = useState(false);
  const [imgError,  setImgError]  = useState(false);

  const date = article.createdAt
    ? new Date(article.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short"})
    : "";

  const CATEGORY_COLORS = {
    Tech:"#3b82f6", Sports:"#22c55e", Politics:"#f59e0b",
    Entertainment:"#ec4899", Business:"#8b5cf6", Education:"#14b8a6", General:"#6b7280",
  };
  const catColor = CATEGORY_COLORS[article.category] || "#6b7280";

  return (
    <>
      <div
        style={{
          borderRadius:16, overflow:"hidden", background:"#fff", height:"100%", display:"flex", flexDirection:"column",
          boxShadow: hovered ? "0 16px 40px rgba(79,70,229,.18)" : "0 4px 15px rgba(0,0,0,.07)",
          transform: hovered ? "translateY(-5px)" : "translateY(0)",
          transition:"all .3s ease",
        }}
        onMouseEnter={()=>setHovered(true)}
        onMouseLeave={()=>setHovered(false)}
      >
        {/* Image */}
        <div style={{height:210,overflow:"hidden",position:"relative",flexShrink:0}}>
          <img
            src={imgError || !article.media?.[0]
              ? "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80"
              : article.media[0]}
            alt={article.title}
            loading="lazy"
            onError={()=>setImgError(true)}
            style={{
              width:"100%",height:"100%",objectFit:"cover",
              transform: hovered ? "scale(1.06)" : "scale(1)",
              transition:"transform .4s ease",
            }}
          />
          {/* Category badge */}
          <span style={{
            position:"absolute",top:12,left:12,
            background: catColor, color:"#fff",
            fontSize:"0.7rem",fontWeight:700,padding:"3px 10px",borderRadius:999,
            textTransform:"uppercase",letterSpacing:"0.5px",
          }}>
            {article.category || "General"}
          </span>
          {/* Date badge */}
          <span style={{
            position:"absolute",top:12,right:12,
            background:"rgba(0,0,0,.55)",backdropFilter:"blur(6px)",
            color:"#fff",fontSize:"0.72rem",fontWeight:600,
            padding:"3px 10px",borderRadius:999,
          }}>
            {date}
          </span>
        </div>

        {/* Body */}
        <div style={{padding:"18px 20px",display:"flex",flexDirection:"column",flexGrow:1}}>
          <h5 style={{
            fontWeight:700,fontSize:"0.98rem",lineHeight:1.45,color:"#111827",marginBottom:8,
            display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden",
          }}>
            {article.title}
          </h5>
          <p style={{
            fontSize:"0.83rem",color:"#6b7280",lineHeight:1.55,marginBottom:14,flexGrow:1,
            display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden",
          }}>
            {article.meta}
          </p>

          {/* Read time */}
          {article.readTime && (
            <div style={{fontSize:"0.75rem",color:"#9ca3af",marginBottom:12}}>
              ⏱ {article.readTime} min read
            </div>
          )}

          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"auto"}}>
            <button
              onClick={()=>setShowModal(true)}
              style={{
                background:"none",border:"1px solid #e5e7eb",borderRadius:8,
                padding:"6px 13px",fontSize:"0.8rem",color:"#6b7280",cursor:"pointer",transition:"all .2s",
              }}
              onMouseEnter={e=>{e.target.style.borderColor="#4f46e5";e.target.style.color="#4f46e5";}}
              onMouseLeave={e=>{e.target.style.borderColor="#e5e7eb";e.target.style.color="#6b7280";}}
            >
              💬 Comments
            </button>
            <a
              href={`/article/${article.slug}`}
              style={{
                background:"#4f46e5",color:"#fff",borderRadius:8,
                padding:"6px 16px",fontSize:"0.8rem",fontWeight:600,
                textDecoration:"none",transition:"background .2s",
              }}
              onMouseEnter={e=>e.target.style.background="#4338ca"}
              onMouseLeave={e=>e.target.style.background="#4f46e5"}
            >
              Read →
            </a>
          </div>
        </div>
      </div>

      <CommentModal articleId={article._id} user={user} isOpen={showModal} onClose={()=>setShowModal(false)}/>
    </>
  );
};

export default ArticleCard;