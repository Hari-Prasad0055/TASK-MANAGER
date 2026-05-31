import React, { useState } from 'react';
import { Store, Lock, User, Eye, EyeOff, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';

export default function Auth({ onAuthSuccess, onGuestLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const validateForm = () => {
    if (!username.trim() || !password) {
      setErrorMsg('Please fill in all fields.');
      return false;
    }
    if (username.length < 3) {
      setErrorMsg('Username must be at least 3 characters long.');
      return false;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return false;
    }
    if (!isLogin && password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
      const endpoint = isLogin 
        ? `${cleanBase}/api/auth/login` 
        : `${cleanBase}/api/auth/register`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      // Successful Auth
      onAuthSuccess(data.token, data.user);
    } catch (err) {
      console.error('Auth error:', err);
      setErrorMsg(err.message || 'Connection lost. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-background-decor">
        <div className="decor-circle circle-1"></div>
        <div className="decor-circle circle-2"></div>
      </div>

      <div className="auth-card">
        {/* Brand Header */}
        <div className="auth-brand">
          <div className="auth-logo">
            <Store size={26} className="auth-logo-icon" />
          </div>
          <div>
            <h1 className="auth-title">ProdMarket</h1>
            <span className="auth-tagline">Productivity Exchange</span>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab-btn ${isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(true);
              setErrorMsg('');
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${!isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(false);
              setErrorMsg('');
            }}
          >
            Create Account
          </button>
        </div>

        <div className="auth-form-container">
          <div className="auth-header-desc">
            <Sparkles size={16} className="text-teal" />
            <span>
              {isLogin
                ? 'Sign in to access your cloud-synchronized focus planner.'
                : 'Create an account to backup your schedules in the cloud database.'}
            </span>
          </div>

          {errorMsg && (
            <div className="auth-error-banner">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Username Input */}
            <div className="auth-group">
              <label className="auth-label">Username</label>
              <div className="auth-input-wrapper">
                <User size={16} className="auth-input-icon" />
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  className="auth-input"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="auth-group">
              <label className="auth-label">Password</label>
              <div className="auth-input-wrapper">
                <Lock size={16} className="auth-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="auth-input"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="auth-visibility-btn"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password (Register Only) */}
            {!isLogin && (
              <div className="auth-group animate-slide-down">
                <label className="auth-label">Confirm Password</label>
                <div className="auth-input-wrapper">
                  <Lock size={16} className="auth-input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Repeat your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    className="auth-input"
                    required
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button type="submit" disabled={loading} className="auth-submit-btn">
              {loading ? (
                <span className="auth-spinner"></span>
              ) : (
                <>
                  <span>{isLogin ? 'Sign In to Dashboard' : 'Complete Registration'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="auth-divider">
            <span className="auth-divider-line"></span>
            <span className="auth-divider-text">OR</span>
            <span className="auth-divider-line"></span>
          </div>

          {/* Guest Access Option */}
          <button
            type="button"
            onClick={onGuestLogin}
            disabled={loading}
            className="auth-guest-btn"
          >
            Continue as Guest (Offline Local Mode)
          </button>
        </div>
      </div>

      <style>{`
        .auth-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          width: 100vw;
          background-color: var(--bg-primary);
          position: fixed;
          top: 0;
          left: 0;
          z-index: 10000;
          overflow-y: auto;
          padding: 1.5rem;
        }

        .auth-background-decor {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          overflow: hidden;
          z-index: 1;
          pointer-events: none;
        }

        .decor-circle {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.15;
        }

        .circle-1 {
          width: 300px;
          height: 300px;
          background-color: var(--brand-primary);
          top: 15%;
          left: 10%;
        }

        .circle-2 {
          width: 400px;
          height: 400px;
          background-color: #0ea5e9;
          bottom: 10%;
          right: 10%;
        }

        .auth-card {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg), 0 30px 60px -20px rgba(0, 0, 0, 0.05);
          width: 100%;
          max-width: 450px;
          position: relative;
          z-index: 5;
          overflow: hidden;
          animation: slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .auth-brand {
          display: flex;
          align-items: center;
          gap: 0.875rem;
          padding: 2rem 2rem 1.5rem;
          border-bottom: 1px solid var(--border-color);
        }

        .auth-logo {
          background: linear-gradient(135deg, var(--brand-primary) 0%, #0ea5e9 100%);
          color: white;
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(13, 148, 136, 0.2);
        }

        .auth-logo-icon {
          color: white;
        }

        .auth-title {
          font-family: var(--font-display);
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1;
        }

        .auth-tagline {
          font-size: 0.725rem;
          color: var(--text-muted);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .auth-tabs {
          display: flex;
          background-color: var(--bg-primary);
          border-bottom: 1px solid var(--border-color);
        }

        .auth-tab-btn {
          flex: 1;
          border: none;
          background: transparent;
          font-family: var(--font-sans);
          font-size: 0.875rem;
          font-weight: 600;
          padding: 1rem;
          cursor: pointer;
          color: var(--text-muted);
          transition: var(--transition-smooth);
          position: relative;
        }

        .auth-tab-btn.active {
          color: var(--brand-primary);
          background-color: var(--bg-secondary);
        }

        .auth-tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 100%;
          height: 2px;
          background-color: var(--brand-primary);
        }

        .auth-form-container {
          padding: 2rem;
        }

        .auth-header-desc {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.4;
          margin-bottom: 1.5rem;
        }

        .auth-header-desc svg {
          flex-shrink: 0;
          margin-top: 0.125rem;
        }

        .auth-error-banner {
          background-color: #fff1f2;
          border: 1px solid rgba(225, 29, 72, 0.15);
          color: #be123c;
          border-radius: var(--radius-sm);
          padding: 0.75rem 1rem;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.25rem;
          animation: shake-anim 0.3s ease-in-out;
        }

        .auth-error-banner svg {
          flex-shrink: 0;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .auth-group {
          display: flex;
          flex-direction: column;
        }

        .auth-label {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-secondary);
          margin-bottom: 0.375rem;
        }

        .auth-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .auth-input-icon {
          position: absolute;
          left: 0.875rem;
          color: var(--text-muted);
          pointer-events: none;
        }

        .auth-input {
          font-family: var(--font-sans);
          width: 100%;
          padding: 0.675rem 0.875rem 0.675rem 2.25rem;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          background-color: white;
          color: var(--text-primary);
          font-size: 0.875rem;
          transition: var(--transition-smooth);
        }

        .auth-input:focus {
          outline: none;
          border-color: var(--brand-primary);
          box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.12);
        }

        .auth-visibility-btn {
          position: absolute;
          right: 0.875rem;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition-smooth);
        }

        .auth-visibility-btn:hover {
          color: var(--text-primary);
        }

        .auth-submit-btn {
          font-family: var(--font-sans);
          font-weight: 600;
          font-size: 0.875rem;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-sm);
          background-color: var(--brand-primary);
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: var(--transition-smooth);
          box-shadow: 0 4px 10px rgba(13, 148, 136, 0.15);
          margin-top: 0.5rem;
        }

        .auth-submit-btn:hover:not(:disabled) {
          background-color: var(--brand-primary-hover);
          box-shadow: 0 4px 14px rgba(13, 148, 136, 0.3);
          transform: translateY(-1px);
        }

        .auth-submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .auth-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 0.8s linear infinite;
        }

        .auth-divider {
          display: flex;
          align-items: center;
          margin: 1.5rem 0;
          gap: 1rem;
        }

        .auth-divider-line {
          flex: 1;
          height: 1px;
          background-color: var(--border-color);
        }

        .auth-divider-text {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.05em;
        }

        .auth-guest-btn {
          font-family: var(--font-sans);
          font-weight: 500;
          font-size: 0.85rem;
          padding: 0.675rem 1rem;
          border-radius: var(--radius-sm);
          background-color: transparent;
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
          cursor: pointer;
          width: 100%;
          transition: var(--transition-smooth);
        }

        .auth-guest-btn:hover:not(:disabled) {
          border-color: var(--text-muted);
          color: var(--text-primary);
          background-color: var(--bg-primary);
        }

        .animate-slide-down {
          animation: slide-down 0.2s ease-out;
        }

        @keyframes slide-down {
          from { transform: translateY(-8px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @keyframes shake-anim {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-4px); }
          40%, 80% { transform: translateX(4px); }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
