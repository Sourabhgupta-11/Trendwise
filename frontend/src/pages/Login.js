import React from 'react';

const Login = () => {
  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth route
    window.location.href = 'http://localhost:5050/api/auth/google';
  };

  return (
    <div className="container-fluid min-vh-100 d-flex justify-content-center align-items-center bg-light">
      <div
        className="card shadow p-4 text-center"
        style={{ maxWidth: '400px', width: '100%', borderRadius: '12px' }}
      >
        <img
          src="/logo.png"
          alt="TrendWise Logo"
          style={{ width: '50px', marginBottom: '15px' }}
        />
        <h3 className="mb-2">Welcome to TrendWise</h3>
        <p className="text-muted mb-4 small">Sign in with Google to continue</p>

        <button
          onClick={handleGoogleLogin}
          className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2"
        >
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google icon"
            style={{ width: '20px', height: '20px' }}
          />
          <span>Sign in with Google</span>
        </button>
      </div>
    </div>
  );
};

export default Login;
