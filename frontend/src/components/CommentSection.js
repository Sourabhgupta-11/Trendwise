import React, { useEffect, useState } from "react";
import axios from "axios";

const CommentSection = ({ articleId, user }) => {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`http://localhost:5050/api/comment/${articleId}`);
        setComments(res.data);
      } catch (err) {
        console.error("Error loading comments:", err.message);
      }
    };
    fetch();
  }, [articleId]);

  const postComment = async () => {
    if (!text.trim() || !user) return;
    try {
      const res = await axios.post("http://localhost:5050/api/comment", {
        articleId,
        userId: user._id,
        text,
      });
      setComments([...comments, res.data]);
      setText("");
    } catch (err) {
      console.error("Failed to post comment:", err.message);
    }
  };

  return (
    <div className="mt-3">
      <div
        className="bg-light p-2 rounded"
        style={{ maxHeight: "180px", overflowY: "auto" }}
      >
        {comments.length > 0 ? (
          comments.map((c) => (
            <div key={c._id} className="mb-2 border-bottom pb-1">
              <strong>{c.userId?.name || "Anonymous"}</strong>
              <p className="mb-1 small">{c.text}</p>
              <small className="text-muted">
                {new Date(c.createdAt).toLocaleString()}
              </small>
            </div>
          ))
        ) : (
          <p className="text-muted small">No comments yet.</p>
        )}
      </div>

      {user && (
        <div className="mt-2">
          <textarea
            rows="2"
            className="form-control form-control-sm"
            placeholder="Write a comment..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button className="btn btn-primary btn-sm mt-1" onClick={postComment}>
            Post
          </button>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
