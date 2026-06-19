import React, { useEffect, useState } from "react";
import axios from "axios";

const CommentModal = ({ articleId, user, onClose, isOpen, darkMode }) => {
  const [comments, setComments] = useState([]);
  const [input,    setInput]    = useState("");
  const [posting,  setPosting]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [likingId, setLikingId] = useState(null); // prevent double-click spam per comment

  const bg      = darkMode ? "#0f172a" : "#fff";
  const surface = darkMode ? "#1e293b" : "#f8fafc";
  const border  = darkMode ? "#334155" : "#f1f5f9";
  const text    = darkMode ? "#f1f5f9" : "#111827";
  const muted   = darkMode ? "#94a3b8" : "#9ca3af";
  const bubble  = darkMode ? "#273548" : "#f1f5f9";

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !articleId) return;
    setLoading(true);
    axios.get(`/api/comment/${articleId}`)
      .then(res => setComments(res.data))
      .catch(err => console.error("Comments fetch:", err.message))
      .finally(() => setLoading(false));
  }, [isOpen, articleId]);

  const postComment = async () => {
    if (!input.trim() || !user || posting) return;
    setPosting(true);
    try {
      const res = await axios.post("/api/comment", { articleId, text: input.trim() });
      setComments(prev => [...prev, res.data]);
      setInput("");
    } catch (err) {
      console.error("Post comment:", err.message);
    } finally {
      setPosting(false);
    }
  };

  const toggleLike = async (commentId) => {
    if (!user || likingId === commentId) return;
    setLikingId(commentId);
    // optimistic update
    setComments(prev => prev.map(c => c._id === commentId
      ? { ...c, likedByMe: !c.likedByMe, likeCount: c.likeCount + (c.likedByMe ? -1 : 1) }
      : c
    ));
    try {
      const res = await axios.post(`/api/comment/${commentId}/like`);
      setComments(prev => prev.map(c => c._id === commentId
        ? { ...c, likedByMe: res.data.likedByMe, likeCount: res.data.likeCount }
        : c
      ));
    } catch (err) {
      console.error("Like error:", err.message);
      // revert on failure
      setComments(prev => prev.map(c => c._id === commentId
        ? { ...c, likedByMe: !c.likedByMe, likeCount: c.likeCount + (c.likedByMe ? -1 : 1) }
        : c
      ));
    } finally {
      setLikingId(null);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); postComment(); } };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return `${d}d ago`;
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:1050,display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(3px)"}}
    >
      <div style={{background:bg,borderRadius:"24px 24px 0 0",width:"100%",maxWidth:700,maxHeight:"82vh",display:"flex",flexDirection:"column",animation:"tw-slideup .28s cubic-bezier(.4,0,.2,1)",boxShadow:"0 -10px 60px rgba(0,0,0,.25)"}}>

        {/* ── Header ── */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 24px 16px",borderBottom:`1px solid ${border}`,flexShrink:0}}>
          <div>
            <h5 style={{margin:0,fontWeight:800,color:text,fontSize:"1.05rem"}}>💬 Comments</h5>
            <p style={{margin:0,fontSize:"0.78rem",color:muted,marginTop:2}}>
              {loading ? "Loading…" : `${comments.length} comment${comments.length!==1?"s":""}`}
            </p>
          </div>
          <button onClick={onClose}
            style={{background:darkMode?"#1e293b":"#f3f4f6",border:"none",borderRadius:"50%",width:34,height:34,cursor:"pointer",fontSize:"1rem",color:muted,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s"}}
            onMouseEnter={e=>e.currentTarget.style.background=darkMode?"#273548":"#e5e7eb"}
            onMouseLeave={e=>e.currentTarget.style.background=darkMode?"#1e293b":"#f3f4f6"}>
            ✕
          </button>
        </div>

        {/* ── Comment list ── */}
        <div style={{overflowY:"auto",flexGrow:1,padding:"16px 24px"}}>
          {loading ? (
            Array.from({length:3}).map((_,i) => (
              <div key={i} style={{display:"flex",gap:12,marginBottom:20}}>
                <div style={{width:40,height:40,borderRadius:"50%",background:darkMode?"#273548":"#e5e7eb",flexShrink:0}}/>
                <div style={{flexGrow:1}}>
                  <div style={{height:12,width:"30%",background:darkMode?"#273548":"#e5e7eb",borderRadius:6,marginBottom:8}}/>
                  <div style={{height:40,background:darkMode?"#273548":"#e5e7eb",borderRadius:10}}/>
                </div>
              </div>
            ))
          ) : comments.length === 0 ? (
            <div style={{textAlign:"center",padding:"40px 20px"}}>
              <div style={{fontSize:"2.5rem",marginBottom:12}}>💬</div>
              <p style={{color:muted,fontWeight:600,marginBottom:4}}>No comments yet</p>
              <p style={{color:muted,fontSize:"0.85rem"}}>Be the first to share your thoughts!</p>
            </div>
          ) : (
            comments.map((c, idx) => {
              const initials = (c.userId?.name || "U").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
              return (
                <div key={c._id || idx} style={{display:"flex",gap:12,marginBottom:20,animation:"tw-fadein .3s ease"}}>
                  {c.userId?.avatar ? (
                    <img src={c.userId.avatar} alt={c.userId.name}
                      style={{width:40,height:40,borderRadius:"50%",objectFit:"cover",flexShrink:0,border:`2px solid ${darkMode?"#334155":"#e5e7eb"}`}}/>
                  ) : (
                    <div style={{width:40,height:40,borderRadius:"50%",background:"linear-gradient(135deg,#4f46e5,#818cf8)",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:"0.85rem"}}>
                      {initials}
                    </div>
                  )}

                  <div style={{flexGrow:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,flexWrap:"wrap"}}>
                      <span style={{fontWeight:700,fontSize:"0.88rem",color:text}}>{c.userId?.name||"Anonymous"}</span>
                      <span style={{fontSize:"0.72rem",color:muted,background:darkMode?"#1e293b":"#f3f4f6",padding:"2px 8px",borderRadius:999}}>{timeAgo(c.createdAt)}</span>
                    </div>

                    <div style={{background:bubble,borderRadius:"4px 14px 14px 14px",padding:"10px 14px",fontSize:"0.88rem",color:text,lineHeight:1.55,wordBreak:"break-word"}}>
                      {c.text}
                    </div>

                    <div style={{display:"flex",alignItems:"center",gap:12,marginTop:6}}>
                      <button onClick={()=>toggleLike(c._id)} disabled={!user}
                        style={{background:"none",border:"none",cursor:user?"pointer":"default",fontSize:"0.78rem",color:c.likedByMe?"#4f46e5":muted,fontWeight:600,padding:0,transition:"color .15s",display:"flex",alignItems:"center",gap:5}}
                        title={!user ? "Sign in to like" : (c.likedByMe?"Unlike":"Like")}>
                        <span>👍</span>
                        <span>{c.likedByMe?"Liked":"Like"}</span>
                        {c.likeCount > 0 && (
                          <span style={{background:darkMode?"#1e293b":"#f3f4f6",color:c.likedByMe?"#4f46e5":muted,padding:"1px 7px",borderRadius:999,fontSize:"0.7rem",fontWeight:700}}>
                            {c.likeCount}
                          </span>
                        )}
                      </button>
                      <span style={{width:3,height:3,borderRadius:"50%",background:muted,display:"inline-block"}}/>
                      <span style={{fontSize:"0.75rem",color:muted}}>
                        {new Date(c.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── Input ── */}
        <div style={{borderTop:`1px solid ${border}`,padding:"14px 20px 20px",flexShrink:0,background:bg}}>
          {user ? (
            <div style={{display:"flex",gap:10,alignItems:"flex-end"}}>
              {user.avatar ? (
                <img src={user.avatar} alt="you" style={{width:36,height:36,borderRadius:"50%",objectFit:"cover",flexShrink:0,border:"2px solid rgba(79,70,229,.4)"}}/>
              ) : (
                <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#4f46e5,#818cf8)",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:"0.8rem"}}>
                  {user.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
                </div>
              )}

              <div style={{flexGrow:1,display:"flex",alignItems:"flex-end",gap:8,
                  border:`1.5px solid ${input.trim()?"#4f46e5":(darkMode?"#334155":"#e5e7eb")}`,
                  borderRadius:14,background:surface,padding:"6px 8px 6px 14px",transition:"border-color .2s"}}>
                <textarea
                  rows={1}
                  value={input}
                  onChange={e=>setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Share your thoughts… (Enter to post)"
                  style={{
                    flexGrow:1, border:"none", outline:"none", resize:"none",
                    background:"transparent", color:text,
                    fontSize:"0.88rem", lineHeight:1.5,
                    padding:"6px 0", maxHeight:90, overflowY:"auto",
                  }}
                />
                <button onClick={postComment} disabled={!input.trim()||posting}
                  style={{
                    flexShrink:0, width:32, height:32, borderRadius:999, border:"none",
                    background: input.trim()&&!posting ? "#4f46e5" : (darkMode?"#334155":"#e5e7eb"),
                    color: input.trim()&&!posting ? "#fff" : "#9ca3af",
                    cursor: input.trim()&&!posting ? "pointer" : "default",
                    fontSize:"1rem", display:"flex", alignItems:"center", justifyContent:"center",
                    transition:"all .2s", marginBottom:2,
                  }}>
                  {posting ? "…" : "↑"}
                </button>
              </div>
            </div>
          ) : (
            <div style={{textAlign:"center",padding:"8px 0"}}>
              <p style={{color:muted,fontSize:"0.88rem",margin:0}}>
                <a href="/login" style={{color:"#4f46e5",fontWeight:700}}>Sign in</a> to join the conversation.
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes tw-slideup{from{transform:translateY(100%)}to{transform:translateY(0)}}
        @keyframes tw-fadein{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
    </div>
  );
};

export default CommentModal;