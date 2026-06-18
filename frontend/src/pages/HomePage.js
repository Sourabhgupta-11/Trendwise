import React, { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import ArticleCard from "../components/ArticleCard";

const CATEGORIES = ["All","Tech","Sports","Politics","Entertainment","Business","Education","General"];

const SkeletonCard = () => (
  <div className="col-md-4 mb-4">
    <div style={{borderRadius:16,overflow:"hidden",boxShadow:"0 4px 15px rgba(0,0,0,.08)",background:"#fff"}}>
      <div style={{height:210,background:"linear-gradient(90deg,#e5e7eb 25%,#f3f4f6 50%,#e5e7eb 75%)",backgroundSize:"200% 100%",animation:"tw-shimmer 1.5s infinite"}}/>
      <div style={{padding:20}}>
        {[100,80,60].map(w=>(
          <div key={w} style={{height:14,background:"#e5e7eb",borderRadius:6,marginBottom:10,width:`${w}%`}}/>
        ))}
      </div>
    </div>
  </div>
);

const HomePage = ({ user }) => {
  const [articles, setArticles] = useState([]);
  const [filter,   setFilter]   = useState("All");
  const [loading,  setLoading]  = useState(true);
  const query = new URLSearchParams(useLocation().search).get("search");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    // Check sessionStorage cache (valid for 10 min)
    const cached = sessionStorage.getItem("tw_articles");
    const cachedAt = sessionStorage.getItem("tw_articles_at");
    if (cached && cachedAt && Date.now() - Number(cachedAt) < 600_000) {
      setArticles(JSON.parse(cached));
      setLoading(false);
      return;
    }
    axios.get("/api/article")
      .then(res => {
        if (cancelled) return;
        setArticles(res.data);
        sessionStorage.setItem("tw_articles", JSON.stringify(res.data));
        sessionStorage.setItem("tw_articles_at", String(Date.now()));
      })
      .catch(err => console.error("Fetch error:", err.message))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const displayed = useMemo(() => {
    let list = articles;
    if (query)          list = list.filter(a => a.title.toLowerCase().includes(query.toLowerCase()));
    if (filter !== "All") list = list.filter(a => a.category === filter);
    return list;
  }, [articles, query, filter]);

  const lastUpdated = articles[0]?.createdAt
    ? new Date(articles[0].createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})
    : null;

  return (
    <div style={{background:"linear-gradient(160deg,#f0f4ff 0%,#f8f9ff 60%,#eef2ff 100%)",minHeight:"100vh"}}>

      {/* ── Hero ── */}
      <div style={{
        background:"linear-gradient(135deg,#1a1a2e 0%,#16213e 55%,#0f3460 100%)",
        padding:"52px 20px 40px", textAlign:"center", color:"#fff",
      }}>
        <div style={{display:"inline-block",background:"rgba(99,102,241,.18)",border:"1px solid rgba(99,102,241,.4)",borderRadius:999,padding:"4px 16px",fontSize:"0.78rem",color:"#a5b4fc",marginBottom:14,fontWeight:600,letterSpacing:"0.4px"}}>
          ✦ AI-Powered · Updated Daily · India Trending
        </div>
        <h1 style={{fontWeight:800,fontSize:"clamp(1.8rem,5vw,2.8rem)",letterSpacing:"-1px",margin:"0 0 10px"}}>
          Stay Ahead with <span style={{color:"#818cf8"}}>TrendWise</span>
        </h1>
        <p style={{opacity:.7,fontSize:"1rem",maxWidth:480,margin:"0 auto 22px",lineHeight:1.6}}>
          Real trending topics from India — AI-written articles, updated every day.
        </p>
        {/* Stats row */}
        <div style={{display:"flex",justifyContent:"center",gap:32,flexWrap:"wrap"}}>
          {[
            {label:"Articles",  value: loading ? "—" : articles.length},
            {label:"Categories",value: 8},
            {label:"Updated",   value: lastUpdated || "—"},
          ].map(s=>(
            <div key={s.label} style={{textAlign:"center"}}>
              <div style={{fontSize:"1.4rem",fontWeight:800,color:"#818cf8"}}>{s.value}</div>
              <div style={{fontSize:"0.72rem",opacity:.5,marginTop:2}}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Category Filter ── */}
      <div style={{display:"flex",justifyContent:"center",gap:10,padding:"24px 16px 8px",flexWrap:"wrap"}}>
        {CATEGORIES.map(cat=>(
          <button key={cat} onClick={()=>setFilter(cat)} style={{
            padding:"7px 18px",borderRadius:999,border:"none",cursor:"pointer",
            fontWeight:600,fontSize:"0.82rem",transition:"all .2s",
            background: filter===cat ? "#4f46e5" : "#fff",
            color:       filter===cat ? "#fff"    : "#374151",
            boxShadow:   filter===cat ? "0 4px 14px rgba(79,70,229,.4)" : "0 2px 8px rgba(0,0,0,.07)",
            transform:   filter===cat ? "translateY(-1px)" : "none",
          }}>{cat}</button>
        ))}
      </div>

      {/* ── Grid ── */}
      <div className="container pb-5 pt-3">
        {query && (
          <p style={{color:"#6b7280",fontSize:"0.9rem",marginBottom:16}}>
            Results for "<strong>{query}</strong>" · {displayed.length} article{displayed.length!==1?"s":""}
          </p>
        )}
        <div className="row">
          {loading
            ? Array.from({length:6}).map((_,i)=><SkeletonCard key={i}/>)
            : displayed.length===0
            ? (
              <div style={{textAlign:"center",padding:"60px 20px"}}>
                <div style={{fontSize:"3rem",marginBottom:12}}>🔍</div>
                <p style={{color:"#9ca3af",fontSize:"1.05rem"}}>No articles in "{filter}" yet.</p>
                <button onClick={()=>setFilter("All")} style={{marginTop:12,padding:"8px 22px",borderRadius:999,border:"none",background:"#4f46e5",color:"#fff",fontWeight:600,cursor:"pointer"}}>
                  Show all
                </button>
              </div>
            )
            : displayed.map(article=>(
              <div key={article._id} className="col-md-4 mb-4">
                <ArticleCard article={article} user={user}/>
              </div>
            ))
          }
        </div>
      </div>

      <style>{`@keyframes tw-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );
};

export default HomePage;