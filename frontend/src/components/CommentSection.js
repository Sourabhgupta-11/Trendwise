import React, { useEffect, useState } from "react";
import axios from "axios";

const CommentModal = ({ articleId, user, onClose, isOpen }) => {
  const [comments, setComments] = useState([]);
  const [input,    setInput]    = useState("");
  const [posting,  setPosting]  = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !articleId) return;
    axios.get(`/api/comment/${articleId}`)
      .then(res  => setComments(res.data))
      .catch(err => console.error("Comments fetch:", err.message));
  }, [isOpen, articleId]);

  const postComment = async () => {
    if (!input.trim() || !user || posting) return;
    setPosting(true);
    try {
      const res = await axios.post("/api/comment", { articleId, userId: user._id, text: input.trim() });
      setComments(prev => [...prev, res.data]);
      setInput("");
    } catch (err) {
      console.error("Post comment:", err.message);
    } finally {
      setPosting(false);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); postComment(); }};

  if (!isOpen) return null;

  return (
    <div
      style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:1050,display:"flex",alignItems:"flex-end",justifyContent:"center"}}
      onClick={e=>{ if (e.target===e.currentTarget) onClose(); }}
    >
      <div style={{
        background:"#fff",borderRadius:"20px 20px 0 0",
        width:"100%",maxWidth:680,
        maxHeight:"80vh",display:"flex",flexDirection:"column",
        animation:"tw-slideup .3s ease",
      }}>
        {/* Header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 24px",borderBottom:"1px solid #f3f4f6"}}>
          <h5 style={{margin:0,fontWeight:700,color:"#111827"}}>💬 Comments ({comments.length})</h5>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:"1.3rem",cursor:"pointer",color:"#9ca3af",lineHeight:1}}>✕</button>
        </div>

        {/* List */}
        <div style={{overflowY:"auto",flexGrow:1,padding:"16px 24px"}}>
          {comments.length===0
            ? <p style={{color:"#9ca3af",textAlign:"center",marginTop:24}}>No comments yet — be the first!</p>
            : comments.map(c=>(
              <div key={c._id} style={{display:"flex",gap:12,marginBottom:18}}>
                <img
                  src={c.userId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.userId?.name||"U")}&background=4f46e5&color=fff`}
                  alt="avatar"
                  style={{width:38,height:38,borderRadius:"50%",objectFit:"cover",flexShrink:0}}
                />
                <div style={{flexGrow:1}}>
                  <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:4}}>
                    <span style={{fontWeight:600,fontSize:"0.88rem",color:"#111827"}}>{c.userId?.name||"Anonymous"}</span>
                    <span style={{fontSize:"0.75rem",color:"#9ca3af"}}>{new Date(c.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</span>
                  </div>
                  <div style={{background:"#f8fafc",borderRadius:"0 12px 12px 12px",padding:"10px 14px",fontSize:"0.88rem",color:"#374151",lineHeight:1.5}}>
                    {c.text}
                  </div>
                </div>
              </div>
            ))
          }
        </div>

        {/* Input */}
        {user ? (
          <div style={{padding:"14px 24px 20px",borderTop:"1px solid #f3f4f6"}}>
            <div style={{display:"flex",gap:10,alignItems:"flex-end"}}>
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4f46e5&color=fff`}
                alt="you"
                style={{width:36,height:36,borderRadius:"50%",objectFit:"cover",flexShrink:0}}
              />
              <textarea
                rows={2}
                value={input}
                onChange={e=>setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Write a comment… (Enter to post)"
                style={{
                  flexGrow:1,borderRadius:12,border:"1px solid #e5e7eb",padding:"10px 14px",
                  fontSize:"0.88rem",resize:"none",outline:"none",lineHeight:1.5,
                  transition:"border-color .2s",
                }}
                onFocus={e=>e.target.style.borderColor="#4f46e5"}
                onBlur={e=>e.target.style.borderColor="#e5e7eb"}
              />
              <button
                onClick={postComment}
                disabled={!input.trim()||posting}
                style={{
                  padding:"10px 18px",borderRadius:12,border:"none",
                  background: !input.trim()||posting ? "#e5e7eb" : "#4f46e5",
                  color: !input.trim()||posting ? "#9ca3af" : "#fff",
                  fontWeight:600,fontSize:"0.85rem",cursor: input.trim()&&!posting ? "pointer":"default",
                  flexShrink:0,transition:"all .2s",
                }}
              >
                {posting ? "…" : "Post"}
              </button>
            </div>
          </div>
        ) : (
          <div style={{padding:"16px 24px 20px",borderTop:"1px solid #f3f4f6",textAlign:"center"}}>
            <p style={{color:"#9ca3af",fontSize:"0.88rem",margin:0}}>
              <a href="/login" style={{color:"#4f46e5",fontWeight:600}}>Sign in</a> to leave a comment.
            </p>
          </div>
        )}
      </div>

      <style>{`@keyframes tw-slideup{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
    </div>
  );
};

export default CommentModal;