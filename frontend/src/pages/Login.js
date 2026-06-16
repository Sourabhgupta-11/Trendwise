import React from 'react';

const Login = () => {
  const backendURL=process.env.REACT_APP_API_URL
  const handleGoogleLogin = () => {
    window.location.href = `${backendURL}/api/auth/google`;
  };

  return (
      <div className="container-fluid min-vh-100 d-flex justify-content-center align-items-center"
        style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
        <div className="card shadow-lg p-5 text-center"
          style={{ maxWidth: '440px', width: '100%', borderRadius: '20px', border: 'none' }}>
          <h1 className="fw-bold mb-1" style={{ color: '#4f46e5' }}>🧠 TrendWise</h1>
          <p className="text-muted mb-4">AI-curated trending news, updated daily</p>
        </div>

        <hr />

        <div className="mt-4">
          <button
            onClick={handleGoogleLogin}
            className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2"
            style={{ padding: '10px 16px', fontSize: '16px' }}
          >
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google"
              style={{ width: '20px', height: '20px' }}
            />
            <span>Continue with Google</span>
          </button>
        </div>

        <div className="mt-4">
          <small className="text-muted">
            By continuing, you agree to TrendWise's Terms and Privacy Policy.
          </small>
        </div>
      </div>
  );
};

export default Login;
