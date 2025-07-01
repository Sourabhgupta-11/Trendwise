import React from 'react';

const Login = () => {
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5050/api/auth/google';
  };

  return (
    <div className="container-fluid min-vh-100 d-flex justify-content-center align-items-center bg-light">
      <div
        className="card shadow-lg p-5 text-center"
        style={{ maxWidth: '500px', width: '100%', borderRadius: '16px' }}
      >
        <div className="mb-4">
          <h1 className="fw-bold" style={{ color: '#0d6efd' }}>TrendWise</h1>
          <p className="text-muted fs-6">
            Discover AI-curated trending content. Sign in to explore the world!
          </p>
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
    </div>
  );
};

export default Login;
