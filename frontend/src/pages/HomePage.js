import React, { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import ArticleCard from "../components/ArticleCard";

const CATEGORIES = ["All","Tech","Sports","Politics","Entertainment","Business","Education","General"];

const CAT_ICONS = {All:"🌐",Tech:"💻",Sports:"🏏",Politics:"🏛️",Entertainment:"🎬",Business:"📈",Education:"🎓",General:"📰"};

const SkeletonCard = ({dark}) => (
  <div className="col-md-4 mb-4">
    <div style={{borderRadius:16,overflow:"hidden",boxShadow:"0 4px 15px rgba(0,0,0,.08)",background:dark?"#1e293b":"#fff"}}>
      <div style={{height:210,background:dark?"linear-gradient(90deg,#1e293b 25%,#273548 50%,#1e293b 75%)":"linear-gradient(90deg,#e5e7eb 25%,#f3f4f6 50%,#e5e7eb 75%)",backgroundSize:"200% 100%",animation:"tw-shimmer 1.5s infinite"}}/>
      <div style={{padding:20}}>{[100,80,60].map(w=><div key={w} style={{height:14,background:dark?"#273548":"#e5e7eb",borderRadius:6,marginBottom:10,width:`${w}%`}}/>)}</div>
    </div>
  </div>
);

const HomePage = ({ user, darkMode }) => {
  const [articles, setArticles] = useState([]);
  const [filter,   setFilter]   = useState("All");
  const [loading,  setLoading]  = useState(true);
  const [view,     setView]     = useState("grid"); // "grid" | "list"
  const location = useLocation();
  const query      = new URLSearchParams(location.search).get("search");
  const bookmarks  = new URLSearchParams(location.search).get("bookmarks");

  const bg   = darkMode ? "#0f172a" : "linear-gradient(160deg,#f0f4ff,#f8f9ff,#eef2ff)";

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const cached   = sessionStorage.getItem("tw_articles");
    const cachedAt = sessionStorage.getItem("tw_articles_at");
    if (cached && cachedAt && Date.now()-Number(cachedAt) < 600_000) {
      setArticles(JSON.parse(cached)); setLoading(false); return;
    }
    axios.get("/api/article")
      .then(res => {
        if (cancelled) return;
        setArticles(res.data);
        sessionStorage.setItem("tw_articles", JSON.stringify(res.data));
        sessionStorage.setItem("tw_articles_at", String(Date.now()));
      })
      .catch(err => console.error(err.message))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const displayed = useMemo(() => {
    let list = articles;
    if (bookmarks) {
      const ids = user?.bookmarks || [];
      list = list.filter(a => ids.includes(a._id));
    }
    if (query)          list = list.filter(a => a.title.toLowerCase().includes(query.toLowerCase()));
    if (filter !== "All") list = list.filter(a => a.category === filter);
    return list;
  }, [articles, query, filter, bookmarks, user]);

  const lastUpdated = articles[0]?.createdAt
    ? new Date(articles[0].createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})
    : null;

  const featuredArticle = articles[0];

  return (
    <div style={{background:bg,minHeight:"100vh"}}>

      {/* ── Hero ── */}
      {!bookmarks && !query && (
        <div style={{background:"linear-gradient(135deg,#1a1a2e 0%,#16213e 55%,#0f3460 100%)",padding:"48px 20px 36px",textAlign:"center",color:"#fff"}}>
          <div style={{display:"inline-block",background:"rgba(99,102,241,.18)",border:"1px solid rgba(99,102,241,.4)",borderRadius:999,padding:"4px 16px",fontSize:"0.78rem",color:"#a5b4fc",marginBottom:14,fontWeight:600,letterSpacing:"0.4px"}}>
            ✦ AI-Powered · Updated Daily · India Trending
          </div>
          <h1 style={{fontWeight:800,fontSize:"clamp(1.8rem,5vw,2.8rem)",letterSpacing:"-1px",margin:"0 0 10px"}}>
            Stay Ahead with <span style={{color:"#818cf8"}}>TrendWise</span>
          </h1>
          <p style={{opacity:.7,fontSize:"1rem",maxWidth:480,margin:"0 auto 22px",lineHeight:1.6}}>
            Real trending topics from India — AI-written articles, every day.
          </p>
          <div style={{display:"flex",justifyContent:"center",gap:32,flexWrap:"wrap"}}>
            {[{label:"Articles",value:loading?"—":articles.length},{label:"Categories",value:8},{label:"Updated",value:lastUpdated||"—"}].map(s=>(
              <div key={s.label} style={{textAlign:"center"}}>
                <div style={{fontSize:"1.4rem",fontWeight:800,color:"#818cf8"}}>{s.value}</div>
                <div style={{fontSize:"0.72rem",opacity:.5,marginTop:2}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Featured (first article) — only on main view ── */}
      {!loading && !query && !bookmarks && featuredArticle && filter==="All" && (
        <div style={{maxWidth:1100,margin:"0 auto",padding:"28px 16px 0"}}>
          <div style={{position:"relative",borderRadius:20,overflow:"hidden",boxShadow:"0 8px 40px rgba(0,0,0,.15)",cursor:"pointer"}}
            onClick={()=>window.location.href=`/article/${featuredArticle.slug}`}>
            <img src={featuredArticle.media?.[0]||""} alt={featuredArticle.title} loading="lazy"
              style={{width:"100%",height:"clamp(200px,40vw,380px)",objectFit:"cover",display:"block"}}/>
            <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,.85) 0%,transparent 55%)"}}/>
            <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"24px 28px"}}>
              <span style={{background:"#4f46e5",color:"#fff",fontSize:"0.7rem",fontWeight:700,padding:"3px 10px",borderRadius:999,textTransform:"uppercase",marginBottom:10,display:"inline-block"}}>
                🔥 Featured · {featuredArticle.category}
              </span>
              <h2 style={{color:"#fff",fontWeight:800,fontSize:"clamp(1.1rem,3vw,1.6rem)",margin:"8px 0 6px",lineHeight:1.3}}>{featuredArticle.title}</h2>
              <p style={{color:"rgba(255,255,255,.75)",fontSize:"0.85rem",margin:0,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>
                {featuredArticle.meta}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Toolbar: categories + view toggle ── */}
      <div style={{maxWidth:1100,margin:"0 auto",padding:"20px 16px 4px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {CATEGORIES.map(cat=>(
              <button key={cat} onClick={()=>setFilter(cat)} style={{
                padding:"7px 16px",borderRadius:999,border:"none",cursor:"pointer",fontWeight:600,fontSize:"0.8rem",transition:"all .2s",
                background: filter===cat ? "#4f46e5" : (darkMode?"#1e293b":"#fff"),
                color:       filter===cat ? "#fff"    : (darkMode?"#94a3b8":"#374151"),
                boxShadow:   filter===cat ? "0 4px 14px rgba(79,70,229,.4)" : `0 2px 6px rgba(0,0,0,${darkMode?.12:.07})`,
                transform:   filter===cat ? "translateY(-1px)" : "none",
              }}>
                {CAT_ICONS[cat]} {cat}
              </button>
            ))}
          </div>
          {/* View toggle */}
          <div style={{display:"flex",gap:4,background:darkMode?"#1e293b":"#fff",borderRadius:10,padding:4,boxShadow:"0 2px 8px rgba(0,0,0,.07)"}}>
            {[{v:"grid",icon:"⊞"},{v:"list",icon:"☰"}].map(({v,icon})=>(
              <button key={v} onClick={()=>setView(v)} style={{border:"none",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontWeight:600,fontSize:"0.9rem",background:view===v?"#4f46e5":"none",color:view===v?"#fff":(darkMode?"#9ca3af":"#6b7280"),transition:"all .2s"}}>
                {icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Page title when in search/bookmark mode ── */}
      {(query || bookmarks) && (
        <div style={{maxWidth:1100,margin:"0 auto",padding:"24px 16px 0"}}>
          <h2 style={{fontWeight:700,color:darkMode?"#f1f5f9":"#111827",fontSize:"1.3rem"}}>
            {bookmarks ? "🔖 Saved Articles" : `🔍 Results for "${query}"`}
            <span style={{fontWeight:400,fontSize:"0.9rem",color:"#9ca3af",marginLeft:8}}>· {displayed.length} article{displayed.length!==1?"s":""}</span>
          </h2>
        </div>
      )}

      {/* ── Grid / List ── */}
      <div style={{maxWidth:1100,margin:"0 auto",padding:"16px 16px 60px"}}>
        {loading ? (
          <div className="row">{Array.from({length:6}).map((_,i)=><SkeletonCard key={i} dark={darkMode}/>)}</div>
        ) : displayed.length===0 ? (
          <div style={{textAlign:"center",padding:"60px 20px"}}>
            <div style={{fontSize:"3rem",marginBottom:12}}>{bookmarks?"🔖":"🔍"}</div>
            <p style={{color:"#9ca3af",fontSize:"1.05rem"}}>{bookmarks?"No saved articles yet — bookmark articles to see them here.":filter!=="All"?`No articles in "${filter}" yet.`:"No results found."}</p>
            <button onClick={()=>setFilter("All")} style={{marginTop:12,padding:"8px 22px",borderRadius:999,border:"none",background:"#4f46e5",color:"#fff",fontWeight:600,cursor:"pointer"}}>
              Show all
            </button>
          </div>
        ) : view==="grid" ? (
          <div className="row">
            {/* Skip featured article in grid (already shown above) */}
            {displayed.filter((a,i)=>!(i===0&&filter==="All"&&!query&&!bookmarks)).map(a=>(
              <div key={a._id} className="col-md-4 mb-4">
                <ArticleCard article={a} user={user} darkMode={darkMode}/>
              </div>
            ))}
          </div>
        ) : (
          // List view
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {displayed.map(a=>(
              <a key={a._id} href={`/article/${a.slug}`} style={{textDecoration:"none"}}>
                <div style={{display:"flex",gap:16,background:darkMode?"#1e293b":"#fff",borderRadius:14,overflow:"hidden",boxShadow:"0 2px 10px rgba(0,0,0,.07)",transition:"all .2s",padding:0}}
                  onMouseEnter={e=>e.currentTarget.style.boxShadow="0 6px 24px rgba(79,70,229,.18)"}
                  onMouseLeave={e=>e.currentTarget.style.boxShadow="0 2px 10px rgba(0,0,0,.07)"}>
                  <img src={a.media?.[0]||""} alt={a.title} loading="lazy" style={{width:130,height:90,objectFit:"cover",flexShrink:0}}/>
                  <div style={{padding:"12px 16px 12px 0",flexGrow:1}}>
                    <span style={{fontSize:"0.7rem",fontWeight:700,color:"#4f46e5",textTransform:"uppercase",letterSpacing:"0.5px"}}>{a.category}</span>
                    <div style={{fontWeight:700,fontSize:"0.95rem",color:darkMode?"#f1f5f9":"#111827",lineHeight:1.4,margin:"4px 0 6px",overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{a.title}</div>
                    <div style={{fontSize:"0.75rem",color:"#9ca3af"}}>⏱ {a.readTime||3} min · {new Date(a.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes tw-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );
};

export default HomePage;