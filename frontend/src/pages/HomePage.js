import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import ArticleCard from "../components/ArticleCard";

const categories = ["All", "Tech", "Sports", "Politics", "Entertainment", "Business", "Education", "General"];

const SkeletonCard = () => (
  <div className="col-md-4 mb-4">
    <div className="card border-0 h-100" style={{ borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 15px rgba(0,0,0,0.08)" }}>
      <div style={{ height: "220px", background: "linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
      <div className="card-body">
        <div style={{ height: "20px", background: "#e5e7eb", borderRadius: "6px", marginBottom: "10px" }} />
        <div style={{ height: "14px", background: "#f3f4f6", borderRadius: "6px", marginBottom: "6px" }} />
        <div style={{ height: "14px", background: "#f3f4f6", borderRadius: "6px", width: "70%" }} />
      </div>
    </div>
  </div>
);

const HomePage = ({ user }) => {
  const [articles, setArticles] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const query = new URLSearchParams(useLocation().search).get("search");

  axios.defaults.baseURL = process.env.REACT_APP_API_URL;
  axios.defaults.withCredentials = true;

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/article");
        let data = res.data;
        if (query) {
          data = data.filter((a) =>
            a.title.toLowerCase().includes(query.toLowerCase())
          );
        }
        setArticles(data);
      } catch (err) {
        console.error("Error fetching articles:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [query]);

  const filtered = articles.filter((a) => {
    if (filter === "All") return true;
    return a.category === filter;
  });

  const lastUpdated =
    articles.length > 0
      ? new Date(articles[0]?.createdAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : null;

  return (
    <div style={{ background: "linear-gradient(135deg, #f8f9ff 0%, #eef2ff 100%)", minHeight: "100vh" }}>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        padding: "52px 20px 36px",
        textAlign: "center",
        color: "white",
      }}>
        <div style={{
          display: "inline-block",
          background: "rgba(99,102,241,0.2)",
          border: "1px solid rgba(99,102,241,0.4)",
          borderRadius: "999px",
          padding: "4px 16px",
          fontSize: "0.78rem",
          color: "#a5b4fc",
          marginBottom: "14px",
          letterSpacing: "0.5px",
          fontWeight: 600,
        }}>
          ✦ AI-Powered · Updated Daily · India Trending
        </div>

        <h1 style={{
          fontWeight: 800,
          fontSize: "clamp(1.8rem, 5vw, 2.8rem)",
          letterSpacing: "-1px",
          margin: "0 0 10px",
        }}>
          Stay Ahead with <span style={{ color: "#818cf8" }}>TrendWise</span>
        </h1>

        <p style={{
          opacity: 0.7,
          fontSize: "1rem",
          maxWidth: "480px",
          margin: "0 auto 20px",
          lineHeight: "1.6",
        }}>
          Trending topics curated by AI — real events, real articles, zero fluff.
        </p>

        {/* Stats row */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "32px",
          flexWrap: "wrap",
          marginBottom: "8px",
        }}>
          {[
            { label: "Articles", value: articles.length || "—" },
            { label: "Topics Today", value: articles.length > 0 ? "10" : "—" },
            { label: "Last Updated", value: lastUpdated || "—" },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#818cf8" }}>
                {stat.value}
              </div>
              <div style={{ fontSize: "0.75rem", opacity: 0.5, marginTop: "2px" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div style={{ display: "flex", justifyContent: "center", gap: "10px", padding: "28px 20px 16px", flexWrap: "wrap" }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            style={{
              padding: "8px 22px",
              borderRadius: "999px",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.85rem",
              background: filter === cat ? "#4f46e5" : "#fff",
              color: filter === cat ? "#fff" : "#374151",
              boxShadow: filter === cat
                ? "0 4px 14px rgba(79,70,229,0.4)"
                : "0 2px 8px rgba(0,0,0,0.08)",
              transform: filter === cat ? "translateY(-1px)" : "none",
              transition: "all 0.2s ease",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Article Grid */}
      <div className="container pb-5">
        <div className="row">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : filtered.length === 0
            ? (
              <div className="text-center py-5">
                <p style={{ color: "#9ca3af", fontSize: "1.1rem" }}> No articles in "{filter}" yet — check back after the next daily update.</p>
                <button onClick={() => setFilter("All")} style={{ marginTop: "12px", padding: "8px 22px", borderRadius: "999px", border: "none", background: "#4f46e5", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
                  Show all
                </button>
              </div>
            )
            : filtered.map((article) => (
              <div key={article._id} className="col-md-4 mb-4">
                <ArticleCard article={article} user={user} />
              </div>
            ))}
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

export default HomePage;