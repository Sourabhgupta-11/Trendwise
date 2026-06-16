import React from "react";

const Login = () => {
  const backendURL = process.env.REACT_APP_API_URL;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
    }}>
      <div style={{
        background: "#fff",
        borderRadius: "20px",
        padding: "48px 40px",
        maxWidth: "420px",
        width: "100%",
        textAlign: "center",
        boxShadow: "0 25px 60px rgba(0,0,0,0.35)",
      }}>
        {/* Logo */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ fontSize: "2.8rem", marginBottom: "8px" }}>🧠</div>
          <h1 style={{ fontWeight: 800, fontSize: "1.8rem", color: "#4f46e5", margin: 0, letterSpacing: "-0.5px" }}>
            TrendWise
          </h1>
          <span style={{
            display: "inline-block", marginTop: "8px",
            fontSize: "0.72rem", fontWeight: 600, color: "#6ee7b7",
            background: "rgba(110,231,183,0.15)", border: "1px solid rgba(110,231,183,0.4)",
            borderRadius: "999px", padding: "3px 10px",
          }}>
            AI-Powered News
          </span>
        </div>

        <p style={{ color: "#6b7280", fontSize: "0.95rem", marginBottom: "32px", lineHeight: "1.6" }}>
          Discover what India is talking about — trending topics curated and written by AI, refreshed daily.
        </p>

        <button
          onClick={() => { window.location.href = `${backendURL}/api/auth/google`; }}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            padding: "13px 20px",
            border: "2px solid #e5e7eb",
            borderRadius: "12px",
            background: "#fff",
            fontSize: "0.95rem",
            fontWeight: 600,
            color: "#374151",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#4f46e5"; e.currentTarget.style.background = "#f5f3ff"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.background = "#fff"; }}
        >
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google"
            style={{ width: "20px", height: "20px" }}
          />
          Continue with Google
        </button>

        {/* Feature bullets */}
        <div style={{ marginTop: "32px", display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
          {["📰 Daily trends", "🤖 AI articles", "💬 Comments"].map((item) => (
            <span key={item} style={{ fontSize: "0.78rem", color: "#9ca3af", fontWeight: 500 }}>
              {item}
            </span>
          ))}
        </div>

        <p style={{ marginTop: "24px", fontSize: "0.75rem", color: "#d1d5db" }}>
          By continuing, you agree to TrendWise's Terms and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default Login;