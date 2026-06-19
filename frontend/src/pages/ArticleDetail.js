import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import CommentModal from "../components/CommentSection";

const CAT_COLORS = {Tech:"#3b82f6",Sports:"#22c55e",Politics:"#f59e0b",Entertainment:"#ec4899",Business:"#8b5cf6",Education:"#14b8a6",General:"#6b7280"};

const ArticleDetail = ({ user, darkMode }) => {
  const { slug }       = useParams();
  const navigate       = useNavigate();
  const [article,      setArticle]      = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [imgError,     setImgError]     = useState(false);
  const [bookmarked,   setBookmarked]   = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const [showBackTop,  setShowBackTop]  = useState(false);
  const [copied,       setCopied]       = useState(false);
  const [relatedArticles, setRelated]   = useState([]);
  const bodyRef = useRef(null);

  const bg      = darkMode ? "#0f172a"  : "#f8fafc";
  const card    = darkMode ? "#1e293b"  : "#fff";
  const text    = darkMode ? "#f1f5f9"  : "#111827";
  const muted   = darkMode ? "#94a3b8"  : "#6b7280";
  const border  = darkMode ? "#334155"  : "#e5e7eb";

  // Fetch article
  useEffect(() => {
    window.scrollTo(0, 0);
    axios.get(`/api/article/${slug}`)
      .then(res => {
        setArticle(res.data);
        document.title = `${res.data.title} | TrendWise`;
        let m = document.querySelector("meta[name='description']");
        if (!m) { m = document.createElement("meta"); m.name = "description"; document.head.appendChild(m); }
        m.content = res.data.meta || "";
      })
      .catch(err => console.error(err.message));
  }, [slug]);

  // Check bookmark status from the user's bookmarks (loaded with the session)
  useEffect(() => {
    if (!article?._id) return;
    setBookmarked(Boolean(user?.bookmarks?.includes?.(article._id)));
  }, [article?._id, user]);

  // Fetch related articles from sessionStorage cache
  useEffect(() => {
    if (!article) return;
    try {
      const all = JSON.parse(sessionStorage.getItem("tw_articles") || "[]");
      const related = all
        .filter(a => a.slug !== slug && a.category === article.category)
        .slice(0, 3);
      setRelated(related);
    } catch {}
  }, [article, slug]);

  // Reading progress bar
  useEffect(() => {
    const onScroll = () => {
      const el  = bodyRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const scrolled = Math.max(0, -rect.top);
      setReadProgress(total > 0 ? Math.min(100, (scrolled / total) * 100) : 0);
      setShowBackTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [article]);

  const [bookmarkBusy, setBookmarkBusy] = useState(false);
  const toggleBookmark = async () => {
    if (!article) return;
    if (!user) { navigate("/login"); return; }
    if (bookmarkBusy) return;
    setBookmarkBusy(true);
    const prev = bookmarked;
    setBookmarked(!prev); // optimistic
    try {
      const res = await axios.post(`/api/article/${article._id}/bookmark`);
      setBookmarked(res.data.bookmarked);
      window.dispatchEvent(new CustomEvent("tw_bookmarks_changed", { detail: res.data.bookmarks }));
    } catch (err) {
      console.error("Bookmark error:", err.message);
      setBookmarked(prev); // revert
    } finally {
      setBookmarkBusy(false);
    }
  };

  const handleShare = async () => {
    const url   = window.location.href;
    const title = article?.title || "TrendWise";
    if (navigator.share) {
      try { await navigator.share({ title, url }); return; } catch {}
    }
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  // Loading state
  if (!article) return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16}}>
      <span style={{fontSize:"2rem"}}>🧠</span>
      <div style={{display:"flex",gap:8}}>
        {[0,1,2].map(i=><span key={i} style={{width:10,height:10,borderRadius:"50%",background:"#818cf8",display:"inline-block",animation:"tw-b 1.2s ease-in-out infinite",animationDelay:`${i*.2}s`}}/>)}
      </div>
      <style>{`@keyframes tw-b{0%,100%{transform:translateY(0);opacity:.4}50%{transform:translateY(-10px);opacity:1}}`}</style>
    </div>
  );

  const catColor    = CAT_COLORS[article.category] || "#6b7280";
  const formattedDate = new Date(article.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"});

  return (
    <div ref={bodyRef} style={{background:bg,minHeight:"100vh"}}>

      {/* ── Reading progress bar ── */}
      <div style={{position:"fixed",top:60,left:0,width:`${readProgress}%`,height:3,background:"linear-gradient(90deg,#4f46e5,#818cf8)",zIndex:999,transition:"width .1s linear",borderRadius:"0 999px 999px 0"}}/>

      {/* ── Hero Image ── */}
      {article.media?.[0] && (
        <div style={{width:"100%",height:"clamp(220px,42vw,440px)",overflow:"hidden",position:"relative"}}>
          <img
            src={imgError ? "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&q=80" : article.media[0]}
            alt={article.title} onError={()=>setImgError(true)}
            style={{width:"100%",height:"100%",objectFit:"cover"}}
          />
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(0,0,0,.2) 0%,rgba(0,0,0,.7) 100%)"}}/>

          {/* Back button */}
          <button onClick={()=>navigate(-1)}
            style={{position:"absolute",top:20,left:20,background:"rgba(0,0,0,.45)",backdropFilter:"blur(10px)",color:"#fff",border:"1px solid rgba(255,255,255,.25)",borderRadius:999,padding:"7px 16px",cursor:"pointer",fontWeight:600,fontSize:"0.84rem",transition:"all .2s"}}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(79,70,229,.7)"}
            onMouseLeave={e=>e.currentTarget.style.background="rgba(0,0,0,.45)"}>
            ← Back
          </button>

          {/* Action buttons top-right */}
          <div style={{position:"absolute",top:20,right:20,display:"flex",gap:8}}>
            <button onClick={toggleBookmark} title={bookmarked?"Remove bookmark":"Save"}
              style={{background:bookmarked?"#4f46e5":"rgba(0,0,0,.45)",backdropFilter:"blur(10px)",color:"#fff",border:`1px solid ${bookmarked?"#4f46e5":"rgba(255,255,255,.25)"}`,borderRadius:999,padding:"7px 14px",cursor:"pointer",fontWeight:600,fontSize:"0.84rem",transition:"all .2s"}}>
              {bookmarked ? "🔖 Saved" : "🏷️ Save"}
            </button>
            <button onClick={handleShare} title="Share"
              style={{background:"rgba(0,0,0,.45)",backdropFilter:"blur(10px)",color:"#fff",border:"1px solid rgba(255,255,255,.25)",borderRadius:999,padding:"7px 14px",cursor:"pointer",fontWeight:600,fontSize:"0.84rem",transition:"all .2s"}}>
              {copied ? "✅ Copied!" : "🔗 Share"}
            </button>
          </div>
        </div>
      )}

      {/* ── Content ── */}
      <div style={{maxWidth:820,margin:"0 auto",padding:"28px 20px 80px"}}>

        {/* Back (when no hero image) */}
        {!article.media?.[0] && (
          <button onClick={()=>navigate(-1)} style={{background:"none",border:"none",color:"#4f46e5",fontWeight:600,cursor:"pointer",fontSize:"0.9rem",marginBottom:20,padding:0}}>← Back</button>
        )}

        {/* ── Title card ── */}
        <div style={{background:card,borderRadius:18,padding:"28px 28px 22px",marginBottom:20,boxShadow:`0 4px 24px rgba(0,0,0,${darkMode?.2:.06})`}}>
          {/* Meta row */}
          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:14}}>
            <span style={{background:catColor,color:"#fff",fontSize:"0.7rem",fontWeight:700,padding:"3px 12px",borderRadius:999,textTransform:"uppercase",letterSpacing:"0.5px"}}>
              {article.category||"General"}
            </span>
            <span style={{fontSize:"0.78rem",color:muted}}>🕒 {formattedDate}</span>
            {article.readTime && <span style={{fontSize:"0.78rem",color:muted}}>⏱ {article.readTime} min read</span>}
            <span style={{fontSize:"0.7rem",color:"#6ee7b7",background:"rgba(110,231,183,.12)",border:"1px solid rgba(110,231,183,.3)",borderRadius:999,padding:"2px 10px",fontWeight:600}}>🤖 AI</span>
          </div>

          <h1 style={{fontWeight:800,fontSize:"clamp(1.4rem,4vw,2rem)",color:text,lineHeight:1.3,marginBottom:12}}>
            {article.title}
          </h1>
          <p style={{color:muted,fontSize:"1rem",lineHeight:1.65,margin:0}}>{article.meta}</p>

          {/* Action row (when no hero image) */}
          {!article.media?.[0] && (
            <div style={{display:"flex",gap:10,marginTop:18,flexWrap:"wrap"}}>
              <button onClick={toggleBookmark}
                style={{padding:"7px 16px",borderRadius:999,border:`1.5px solid ${bookmarked?"#4f46e5":border}`,background:bookmarked?"#4f46e5":"none",color:bookmarked?"#fff":muted,fontWeight:600,fontSize:"0.82rem",cursor:"pointer",transition:"all .2s"}}>
                {bookmarked?"🔖 Saved":"🏷️ Save"}
              </button>
              <button onClick={handleShare}
                style={{padding:"7px 16px",borderRadius:999,border:`1.5px solid ${border}`,background:"none",color:muted,fontWeight:600,fontSize:"0.82rem",cursor:"pointer"}}>
                {copied?"✅ Copied!":"🔗 Share"}
              </button>
            </div>
          )}
        </div>

        {/* ── Article body ── */}
        <div style={{background:card,borderRadius:18,padding:"32px 28px",boxShadow:`0 4px 24px rgba(0,0,0,${darkMode?.2:.06})`,marginBottom:20}}>
          <div className="tw-article-body" style={{color:text}} dangerouslySetInnerHTML={{__html:article.content}}/>
        </div>

        {/* ── Video ── */}
        {article.media?.[1] && (
          <div style={{background:card,borderRadius:18,padding:24,boxShadow:`0 4px 24px rgba(0,0,0,${darkMode?.2:.06})`,marginBottom:20}}>
            <h5 style={{fontWeight:700,color:text,marginBottom:16,fontSize:"1rem"}}>📺 Related Video</h5>
            <div className="ratio ratio-16x9" style={{borderRadius:12,overflow:"hidden"}}>
              <iframe src={article.media[1]} title="Related video" allowFullScreen loading="lazy"/>
            </div>
          </div>
        )}

        {/* ── Related Articles ── */}
        {relatedArticles.length > 0 && (
          <div style={{background:card,borderRadius:18,padding:24,boxShadow:`0 4px 24px rgba(0,0,0,${darkMode?.2:.06})`,marginBottom:20}}>
            <h5 style={{fontWeight:700,color:text,marginBottom:16,fontSize:"1rem"}}>🔗 More in {article.category}</h5>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {relatedArticles.map(a => (
                <a key={a._id} href={`/article/${a.slug}`} style={{display:"flex",gap:12,textDecoration:"none",padding:10,borderRadius:12,transition:"background .2s"}}
                  onMouseEnter={e=>e.currentTarget.style.background=darkMode?"#273548":"#f8fafc"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <img src={a.media?.[0]||""} alt={a.title} loading="lazy"
                    style={{width:70,height:52,objectFit:"cover",borderRadius:8,flexShrink:0,background:"#e5e7eb"}}
                    onError={e=>e.target.style.display="none"}/>
                  <div>
                    <div style={{fontWeight:600,fontSize:"0.87rem",color:text,lineHeight:1.4,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{a.title}</div>
                    <div style={{fontSize:"0.73rem",color:muted,marginTop:4}}>⏱ {a.readTime||3} min read</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* ── Comments ── */}
        <div style={{background:card,borderRadius:18,padding:20,boxShadow:`0 4px 24px rgba(0,0,0,${darkMode?.2:.06})`}}>
          <button onClick={()=>setShowComments(true)}
            style={{width:"100%",padding:13,border:"none",borderRadius:12,background:"#4f46e5",color:"#fff",fontWeight:700,fontSize:"0.95rem",cursor:"pointer",transition:"background .2s"}}
            onMouseEnter={e=>e.currentTarget.style.background="#4338ca"}
            onMouseLeave={e=>e.currentTarget.style.background="#4f46e5"}>
            💬 View & Add Comments
          </button>
        </div>
      </div>

      {/* ── Back to top ── */}
      {showBackTop && (
        <button onClick={()=>window.scrollTo({top:0,behavior:"smooth"})}
          style={{position:"fixed",bottom:28,right:24,width:44,height:44,borderRadius:"50%",background:"#4f46e5",color:"#fff",border:"none",cursor:"pointer",fontSize:"1.1rem",boxShadow:"0 4px 16px rgba(79,70,229,.5)",zIndex:998,transition:"all .2s",display:"flex",alignItems:"center",justifyContent:"center"}}
          onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px) scale(1.05)"}
          onMouseLeave={e=>e.currentTarget.style.transform="none"}
          title="Back to top">
          ↑
        </button>
      )}

      <CommentModal articleId={article._id} user={user} isOpen={showComments} onClose={()=>setShowComments(false)} darkMode={darkMode}/>

      <style>{`
        .tw-article-body{line-height:1.9;font-size:1.05rem}
        .tw-article-body h1,.tw-article-body h2,.tw-article-body h3{font-weight:700;margin-top:1.8rem;margin-bottom:.8rem;line-height:1.3}
        .tw-article-body h2{font-size:1.4rem}
        .tw-article-body h3{font-size:1.15rem}
        .tw-article-body p{margin-bottom:1.3rem}
        .tw-article-body img{max-width:100%;border-radius:12px;margin:16px 0}
        .tw-article-body a{color:#4f46e5;text-decoration:underline}
        .tw-article-body ul,.tw-article-body ol{padding-left:1.5rem;margin-bottom:1.2rem}
        .tw-article-body li{margin-bottom:.5rem;line-height:1.7}
        .tw-article-body blockquote{border-left:4px solid #4f46e5;margin:1.5rem 0;padding:.8rem 1.2rem;background:${darkMode?"rgba(79,70,229,.1)":"#f5f3ff"};border-radius:0 10px 10px 0;font-style:italic}
      `}</style>
    </div>
  );
};

export default ArticleDetail;