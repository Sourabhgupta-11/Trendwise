import React, { useEffect, useState } from "react";
import axios from "axios";

const Login = () => {
  const backendURL = process.env.REACT_APP_API_URL;
  const [warming, setWarming] = useState(true);

  // Pre-warm the Render backend the moment this page loads,
  // so by the time the user clicks "Continue with Google" the
  // server is already awake and the OAuth redirect is instant.
  useEffect(() => {
    let cancelled = false;
    axios.get(`${backendURL}/api/ping`, { timeout: 20000 })
      .catch(() => {})
      .finally(() => { if (!cancelled) setWarming(false); });
    return () => { cancelled = true; };
  }, [backendURL]);

  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)",
      display:"flex",alignItems:"center",justifyContent:"center",padding:20,
    }}>
      <div style={{background:"#fff",borderRadius:20,padding:"48px 40px",maxWidth:420,width:"100%",textAlign:"center",boxShadow:"0 25px 60px rgba(0,0,0,.35)"}}>
        <div style={{fontSize:"2.8rem",marginBottom:8}}>🧠</div>
        <h1 style={{fontWeight:800,fontSize:"1.8rem",color:"#4f46e5",margin:"0 0 6px",letterSpacing:"-0.5px"}}>TrendWise</h1>
        <span style={{display:"inline-block",fontSize:"0.72rem",fontWeight:600,color:"#6ee7b7",background:"rgba(110,231,183,.15)",border:"1px solid rgba(110,231,183,.4)",borderRadius:999,padding:"3px 12px",marginBottom:20}}>
          AI-Powered News
        </span>
        <p style={{color:"#6b7280",fontSize:"0.95rem",marginBottom:32,lineHeight:1.6}}>
          Trending topics from India — curated and written by AI, refreshed every day.
        </p>

        <button
          onClick={()=>{ window.location.href=`${backendURL}/api/auth/google`; }}
          disabled={warming}
          style={{
            width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:12,
            padding:"13px 20px",border:"2px solid #e5e7eb",borderRadius:12,
            background: warming ? "#f9fafb" : "#fff",
            fontSize:"0.95rem",fontWeight:600,color: warming ? "#9ca3af" : "#374151",
            cursor: warming ? "default" : "pointer",transition:"all .2s",
          }}
          onMouseEnter={e=>{ if(!warming){ e.currentTarget.style.borderColor="#4f46e5"; e.currentTarget.style.background="#f5f3ff"; }}}
          onMouseLeave={e=>{ if(!warming){ e.currentTarget.style.borderColor="#e5e7eb"; e.currentTarget.style.background="#fff"; }}}
        >
          {warming ? (
            <>
              <span style={{
                width:16,height:16,border:"2px solid #c7c9f5",borderTopColor:"#4f46e5",
                borderRadius:"50%",display:"inline-block",animation:"tw-spin .7s linear infinite",
              }}/>
              Preparing sign-in…
            </>
          ) : (
            <>
              <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" style={{width:20,height:20}}/>
              Continue with Google
            </>
          )}
        </button>

        <div style={{marginTop:28,display:"flex",justifyContent:"center",gap:20,flexWrap:"wrap"}}>
          {["📰 Daily trends","🤖 AI articles","💬 Comments"].map(x=>(
            <span key={x} style={{fontSize:"0.78rem",color:"#9ca3af",fontWeight:500}}>{x}</span>
          ))}
        </div>
        <p style={{marginTop:24,fontSize:"0.73rem",color:"#d1d5db"}}>
          By continuing you agree to TrendWise's Terms &amp; Privacy Policy.
        </p>
      </div>

      <style>{`@keyframes tw-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

export default Login;