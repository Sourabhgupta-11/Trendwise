import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import CommentModal from "../components/CommentSection";

const ArticleDetail = ({ user }) => {
  const { slug }    = useParams();
  const navigate    = useNavigate();
  const [article,   setArticle]   = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [imgError,  setImgError]  = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    axios.get(`/api/article/${slug}`)
      .then(res => {
        setArticle(res.data);
        document.title = `${res.data.title} | TrendWise`;
        let m = document.querySelector("meta[name='description']");
        if (!m) { m = document.createElement("meta"); m.name="description"; document.head.appendChild(m); }
        m.content = res.data.meta || "";
      })
      .catch(err => console.error("Error:", err.message));
  }, [slug]);

  if (!article) return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16}}>
      <span style={{fontSize:"2rem"}}>🧠</span>
      <div style={{display:"flex",gap:8}}>
        {[0,1,2].map(i=>(
          <span key={i} style={{width:10,height:10,borderRadius:"50%",background:"#818cf8",display:"inline-block",animation:"tw-bounce 1.2s ease-in-out infinite",animationDelay:`${i*.2}s`}}/>
        ))}
      </div>
      <style>{`@keyframes tw-bounce{0%,100%{transform:translateY(0);opacity:.4}50%{transform:translateY(-10px);opacity:1}}`}</style>
    </div>
  );

  const CATEGORY_COLORS = {
    Tech:"#3b82f6",Sports:"#22c55e",Politics:"#f59e0b",
    Entertainment:"#ec4899",Business:"#8b5cf6",Education:"#14b8a6",General:"#6b7280",
  };
  const catColor = CATEGORY_COLORS[article.category] || "#6b7280";
  const formattedDate = new Date(article.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"});

  return (
    <div style={{background:"#f8fafc",minHeight:"100vh"}}>

      {/* ── Hero Image ── */}
      {article.media?.[0] && (
        <div style={{width:"100%",height:"420px",overflow:"hidden",position:"relative"}}>
          <img
            src={imgError ? "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&q=80" : article.media[0]}
            alt={article.title}
            onError={()=>setImgError(true)}
            style={{width:"100%",height:"100%",objectFit:"cover"}}
          />
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent 30%,rgba(0,0,0,.65) 100%)"}}/>
          {/* Back btn on image */}
          <button
            onClick={()=>navigate(-1)}
            style={{
              position:"absolute",top:20,left:20,
              background:"rgba(0,0,0,.45)",backdropFilter:"blur(8px)",
              color:"#fff",border:"1px solid rgba(255,255,255,.25)",
              borderRadius:999,padding:"7px 16px",cursor:"pointer",fontWeight:600,fontSize:"0.85rem",
            }}
          >
            ← Back
          </button>
        </div>
      )}

      {/* ── Content ── */}
      <div style={{maxWidth:800,margin:"0 auto",padding:"32px 20px 80px"}}>

        {/* Back (when no image) */}
        {!article.media?.[0] && (
          <button onClick={()=>navigate(-1)} style={{background:"none",border:"none",color:"#4f46e5",fontWeight:600,cursor:"pointer",fontSize:"0.9rem",marginBottom:20,padding:0}}>
            ← Back
          </button>
        )}

        {/* Title card */}
        <div style={{background:"#fff",borderRadius:16,padding:"28px 28px 24px",marginBottom:24,boxShadow:"0 4px 20px rgba(0,0,0,.06)"}}>
          {/* Category + date */}
          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:14}}>
            <span style={{background:catColor,color:"#fff",fontSize:"0.72rem",fontWeight:700,padding:"3px 12px",borderRadius:999,textTransform:"uppercase"}}>
              {article.category||"General"}
            </span>
            <span style={{fontSize:"0.8rem",color:"#9ca3af"}}>🕒 {formattedDate}</span>
            {article.readTime && <span style={{fontSize:"0.8rem",color:"#9ca3af"}}>⏱ {article.readTime} min read</span>}
            <span style={{fontSize:"0.72rem",color:"#6ee7b7",background:"rgba(110,231,183,.12)",border:"1px solid rgba(110,231,183,.3)",borderRadius:999,padding:"3px 10px",fontWeight:600}}>🤖 AI</span>
          </div>
          <h1 style={{fontWeight:800,fontSize:"clamp(1.4rem,4vw,2rem)",color:"#111827",lineHeight:1.3,marginBottom:12}}>
            {article.title}
          </h1>
          <p style={{color:"#6b7280",fontSize:"1rem",lineHeight:1.65,margin:0}}>
            {article.meta}
          </p>
        </div>

        {/* Article body */}
        <div style={{background:"#fff",borderRadius:16,padding:"32px 28px",boxShadow:"0 4px 20px rgba(0,0,0,.06)",marginBottom:24}}>
          <div
            className="tw-article-body"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>

        {/* Video */}
        {article.media?.[1] && (
          <div style={{background:"#fff",borderRadius:16,padding:24,boxShadow:"0 4px 20px rgba(0,0,0,.06)",marginBottom:24}}>
            <h5 style={{fontWeight:700,color:"#111827",marginBottom:16}}>📺 Related Video</h5>
            <div className="ratio ratio-16x9" style={{borderRadius:12,overflow:"hidden"}}>
              <iframe src={article.media[1]} title="Related video" allowFullScreen loading="lazy"/>
            </div>
          </div>
        )}

        {/* Comments toggle */}
        <div style={{background:"#fff",borderRadius:16,padding:20,boxShadow:"0 4px 20px rgba(0,0,0,.06)"}}>
          <button
            onClick={()=>setShowComments(true)}
            style={{width:"100%",padding:12,border:"none",borderRadius:10,background:"#4f46e5",color:"#fff",fontWeight:700,fontSize:"0.95rem",cursor:"pointer"}}
          >
            💬 View & Add Comments
          </button>
        </div>
      </div>

      <CommentModal articleId={article._id} user={user} isOpen={showComments} onClose={()=>setShowComments(false)}/>

      <style>{`
        .tw-article-body{line-height:1.9;font-size:1.05rem;color:#1f2937}
        .tw-article-body h1,.tw-article-body h2,.tw-article-body h3{color:#111827;font-weight:700;margin-top:1.8rem;margin-bottom:.8rem;line-height:1.3}
        .tw-article-body h2{font-size:1.4rem}
        .tw-article-body h3{font-size:1.15rem}
        .tw-article-body p{margin-bottom:1.3rem}
        .tw-article-body img{max-width:100%;border-radius:12px;margin:16px 0}
        .tw-article-body a{color:#4f46e5;text-decoration:underline}
        .tw-article-body ul,.tw-article-body ol{padding-left:1.5rem;margin-bottom:1.2rem}
        .tw-article-body li{margin-bottom:.5rem;line-height:1.7}
        .tw-article-body blockquote{border-left:4px solid #4f46e5;margin:1.5rem 0;padding:.8rem 1.2rem;background:#f5f3ff;border-radius:0 10px 10px 0;font-style:italic;color:#4b5563}
      `}</style>
    </div>
  );
};

export default ArticleDetail;