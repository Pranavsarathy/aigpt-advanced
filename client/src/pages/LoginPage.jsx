import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Mail, Lock } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from '../firebase';
import '../index.css';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleOAuthLogin = async (provider) => {
    try {
      if (!auth) {
        throw new Error("Firebase is not configured correctly. Check your .env file.");
      }
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Save basic auth state in local storage to bypass backend DB for MVP
      localStorage.setItem('token', user.accessToken);
      localStorage.setItem('userId', user.uid);
      
      navigate('/chat');
    } catch (err) {
      console.error("OAuth error:", err);
      setError(err.message || 'Authentication failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          // Save token and redirect
          localStorage.setItem('token', data.token);
          localStorage.setItem('userId', data.userId);
          navigate('/chat');
        } else {
          // Switch to login mode after successful registration
          setIsLogin(true);
          alert("Registration successful! Please log in.");
        }
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError('Could not connect to server. Is MongoDB running?');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <img src="/logo.png" alt="AI LEXER Logo" style={{ width: 48, height: 48, borderRadius: 12, marginBottom: 12 }} />
          <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p>Your intelligent AI LEXER</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="oauth-buttons">
          <button type="button" className="oauth-btn google-btn" onClick={() => handleOAuthLogin(googleProvider)}>
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google Logo" className="oauth-icon" />
            Continue with Google
          </button>
          
          <button type="button" className="oauth-btn facebook-btn" onClick={() => handleOAuthLogin(facebookProvider)}>
            <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook Logo" className="oauth-icon" />
            Continue with Facebook
          </button>
        </div>

        <div className="divider">
          <span>or continue with email</span>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <Mail size={18} className="input-icon" />
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="input-group">
            <Lock size={18} className="input-icon" />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="login-btn">
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span onClick={() => setIsLogin(!isLogin)} className="toggle-auth">
              {isLogin ? 'Sign Up' : 'Log In'}
            </span>
          </p>
          <button className="skip-btn" onClick={() => navigate('/chat')}>
            Skip for now (Anonymous Mode)
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
