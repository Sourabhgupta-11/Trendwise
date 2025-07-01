import React, { useEffect, useState } from "react";
import axios from "axios";

const CommentModal = ({ articleId, user, onClose, isOpen }) => {
  const [comments, setComments] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => (document.body.style.overflow = "auto");
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !articleId) return;

    const fetchComments = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5050/api/comment/${articleId}`
        );
        setComments(res.data);
      } catch (err) {
        console.error("Failed to fetch comments:", err.message);
      }
    };

    fetchComments();
  }, [isOpen, articleId]);

  const postComment = async () => {
    if (!input.trim() || !user) return;

    try {
      const res = await axios.post("http://localhost:5050/api/comment", {
        articleId,
        userId: user._id,
        text: input.trim(),
      });
      setComments((prev) => [...prev, res.data]);
      setInput("");
    } catch (err) {
      console.error("Failed to post comment:", err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      role="dialog"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        overflow: "hidden",
      }}
    >
      <div
        className="modal-dialog modal-dialog-scrollable modal-lg"
        role="document"
      >
        <div className="modal-content">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">💬 Comments</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>

            <div className="modal-body">
              {comments.length > 0 ? (
                comments.map((c) => (
                  <div key={c._id} className="d-flex align-items-start mb-3">
                    <img
                      src={
                        c.userId?.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          c.userId?.name || "User"
                        )}&background=random`
                      }
                      alt="avatar"
                      className="rounded-circle me-2"
                      style={{
                        width: "40px",
                        height: "40px",
                        objectFit: "cover",
                      }}
                    />
                    <div className="flex-grow-1">
                      <div className="fw-semibold">
                        {c.userId?.name || "Anonymous"}
                      </div>
                      <div className="small text-muted mb-1">
                        {new Date(c.createdAt).toLocaleString()}
                      </div>
                      <div className="bg-light rounded p-2">{c.text}</div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted">No comments yet.</p>
              )}
            </div>

            {user && (
              <div className="modal-footer d-block">
                <textarea
                  className="form-control mb-2"
                  rows="2"
                  placeholder="Write a comment..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <button className="btn btn-primary" onClick={postComment}>
                  Post
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;
