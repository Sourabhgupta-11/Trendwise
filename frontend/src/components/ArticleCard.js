import React, { useState } from "react";
import CommentModal from "./CommentSection"; 

const ArticleCard = ({ article, user }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div
        className="card h-100 border-0 shadow-sm"
        style={{
          transition: 'all 0.3s ease',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
          background: '#ffffff'
        }}
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
          <div className="d-flex align-items-center gap-2 mb-2">
            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
              🕒 {new Date(article.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </span>
          </div>
          <p className="card-text text-muted small">
            {article.meta.length > 100
              ? article.meta.slice(0, 100) + "..."
              : article.meta}
          </p>

          <div className="d-flex justify-content-between mt-auto">
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setShowModal(true)}
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
