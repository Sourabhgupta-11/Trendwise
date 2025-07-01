import React, { useState } from "react";
import CommentSection from "./CommentSection";

const ArticleCard = ({ article, user }) => {
  const [showComments, setShowComments] = useState(false);

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  return (
    <div
      className="card h-100 border-0 shadow-sm"
      style={{ transition: "transform 0.3s", borderRadius: "12px" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
      }}
    >
      <div style={{ height: "220px", overflow: "hidden" }}>
        <img
          src={article.media[0]}
          alt={article.title}
          className="w-100 h-100"
          style={{
            objectFit: "cover",
            borderTopLeftRadius: "12px",
            borderTopRightRadius: "12px",
          }}
        />
      </div>
      <div className="card-body d-flex flex-column">
        <h5 className="card-title fw-semibold">{article.title}</h5>
        <p className="card-text text-muted small">
          {article.meta.length > 100
            ? article.meta.slice(0, 100) + "..."
            : article.meta}
        </p>

        <div className="d-flex justify-content-between mt-auto">
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={toggleComments}
          >
            💬 Comments
          </button>
          <a
            href={`/article/${article.slug}`}
            className="btn btn-sm btn-outline-primary"
          >
            Read More →
          </a>
        </div>

        {showComments && <CommentSection articleId={article._id} user={user} />}
      </div>
    </div>
  );
};

export default ArticleCard;
