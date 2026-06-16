import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const ArticleDetail = ({ user }) => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);

  axios.defaults.baseURL = process.env.REACT_APP_API_URL;
  axios.defaults.withCredentials = true;

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await axios.get(`/api/article/${slug}`);
        setArticle(res.data);
        document.title = res.data.title + " | TrendWise";
        const metaTag = document.querySelector("meta[name='description']");
        if (metaTag) {
          metaTag.setAttribute("content", res.data.meta);
        } else {
          const m = document.createElement("meta");
          m.name = "description";
          m.content = res.data.meta;
          document.head.appendChild(m);
        }
      } catch (err) {
        console.error("Error fetching article:", err.message);
      }
    };
    fetchArticle();
  }, [slug]);

  if (!article) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "12px" }}>⏳</div>
          <p style={{ color: "#9ca3af" }}>Loading article...</p>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(article.createdAt).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh" }}>
      {/* Hero image */}
      {article.media?.[0] && (
        <div style={{ width: "100%", height: "420px", overflow: "hidden", position: "relative" }}>
          <img
            src={article.media[0]}
            alt={article.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&q=80"; }}
          />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.7) 100%)",
          }} />
        </div>
      )}

      {/* Content */}
      <div style={{ maxWidth: "780px", margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Back link */}
        <a href="/" style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          color: "#4f46e5", textDecoration: "none", fontWeight: 600,
          fontSize: "0.9rem", marginBottom: "28px",
        }}>
          ← Back to Home
        </a>

        {/* Title block */}
        <div style={{
          background: "#fff", borderRadius: "16px",
          padding: "32px", marginBottom: "28px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        }}>
          <h1 style={{ fontWeight: 800, fontSize: "clamp(1.5rem, 4vw, 2.2rem)", color: "#111827", lineHeight: "1.3", marginBottom: "14px" }}>
            {article.title}
          </h1>
          <p style={{ color: "#6b7280", fontSize: "1rem", lineHeight: "1.6", marginBottom: "16px" }}>
            {article.meta}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              fontSize: "0.8rem", color: "#6ee7b7",
              background: "rgba(110,231,183,0.12)", border: "1px solid rgba(110,231,183,0.3)",
              borderRadius: "999px", padding: "3px 12px", fontWeight: 600,
            }}>
              🤖 AI Generated
            </span>
            <span style={{ fontSize: "0.82rem", color: "#9ca3af" }}>
              🕒 {formattedDate}
            </span>
          </div>
        </div>

        {/* Article body */}
        <div style={{
          background: "#fff", borderRadius: "16px",
          padding: "36px 32px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          marginBottom: "32px",
        }}>
          <div
            className="article-body"
            style={{ lineHeight: "1.95", fontSize: "1.05rem", color: "#1f2937" }}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>

        {/* Video */}
        {article.media?.[1] && (
          <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
            <h5 style={{ fontWeight: 700, color: "#111827", marginBottom: "16px" }}>📺 Related Video</h5>
            <div className="ratio ratio-16x9" style={{ borderRadius: "12px", overflow: "hidden" }}>
              <iframe src={article.media[1]} title="Related video" allowFullScreen />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleDetail;