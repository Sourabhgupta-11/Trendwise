import React, { useState } from "react";
import CommentModal from "./CommentSection";

const ArticleCard = ({ article, user }) => {
  const [showModal, setShowModal] = useState(false);
  const [hovered, setHovered] = useState(false);

  const formattedDate = article.createdAt
    ? new Date(article.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      })
    : "";

  return (
    <>
      <div
        className="card h-100 border-0"
        style={{
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: hovered
            ? "0 16px 40px rgba(79,70,229,0.18)"
            : "0 4px 15px rgba(0,0,0,0.08)",
          transform: hovered ? "translateY(-5px)" : "translateY(0)",
          transition: "all 0.3s ease",
          background: "#fff",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Image */}
        <div style={{ height: "210px", overflow: "hidden", position: "relative" }}>
          <img
            src={article.media[0]}
            alt={article.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: hovered ? "scale(1.05)" : "scale(1)",
              transition: "transform 0.4s ease",
            }}
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80";
            }}
          />
          {/* Date badge */}
          <div style={{
            position: "absolute", top: "12px", right: "12px",
            background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)",
            color: "#fff", fontSize: "0.72rem", fontWeight: 600,
            padding: "4px 10px", borderRadius: "999px",
          }}>
            {formattedDate}
          </div>
        </div>

        {/* Body */}
        <div className="card-body d-flex flex-column" style={{ padding: "20px" }}>
          <h5 style={{
            fontWeight: 700, fontSize: "1rem", lineHeight: "1.45",
            color: "#111827", marginBottom: "10px",
            display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {article.title}
          </h5>
          <p style={{
            fontSize: "0.85rem", color: "#6b7280", lineHeight: "1.55",
            marginBottom: "16px", flexGrow: 1,
            display: "-webkit-box", WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {article.meta}
          </p>

          <div className="d-flex justify-content-between align-items-center mt-auto">
            <button
              onClick={() => setShowModal(true)}
              style={{
                background: "none", border: "1px solid #e5e7eb",
                borderRadius: "8px", padding: "7px 14px",
                fontSize: "0.82rem", color: "#6b7280",
                cursor: "pointer", transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.target.style.borderColor = "#4f46e5"; e.target.style.color = "#4f46e5"; }}
              onMouseLeave={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.color = "#6b7280"; }}
            >
              💬 Comments
            </button>
            
            <a
              href={`/article/${article.slug}`}
              style={{
                background: "#4f46e5", color: "#fff",
                borderRadius: "8px", padding: "7px 16px",
                fontSize: "0.82rem", fontWeight: 600,
                textDecoration: "none", transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.target.style.background = "#4338ca"; }}
              onMouseLeave={(e) => { e.target.style.background = "#4f46e5"; }}
            >
              Read More →
            </a>
          </div>
        </div>
      </div>

      <CommentModal
        articleId={article._id}
        user={user}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
};

export default ArticleCard;