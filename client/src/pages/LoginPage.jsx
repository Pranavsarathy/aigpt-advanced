import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Menu, X } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from '../firebase';
import '../index.css';

const videos = [
  { url: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_081127_0992a171-d3c6-4978-8213-0ec5df8b6d63.mp4', label: 'Golden Hour' },
  { url: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_092026_dd05b805-ea0f-40b2-8c52-332b88502592.mp4', label: 'Still Water' },
  { url: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_081042_df7202bf-bd80-4b2b-bbc6-1f09ba2870e9.mp4', label: 'Deep Woods' },
  { url: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_080959_4cac5234-3573-464e-a5b7-76b94b8a7d61.mp4', label: 'Quiet Dawn' }
];

export default function LoginPage() {
  const [activeVideo, setActiveVideo] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auth State
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleVideoSwitch = (index) => {
    if (activeVideo === index || isTransitioning) return;
    setIsTransitioning(true);
    setActiveVideo(index);
    setTimeout(() => setIsTransitioning(false), 1000);
  };

  // Automatically cycle videos every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveVideo((prev) => {
        const next = (prev + 1) % videos.length;
        setIsTransitioning(true);
        setTimeout(() => setIsTransitioning(false), 1000);
        return next;
      });
    }, 8000);
    return () => clearInterval(interval);
  }, [videos.length]);

  const isDarkMode = activeVideo === 2; // Deep Woods triggers dark text mode

  // Auth Functions
  const handleOAuthLogin = async (provider) => {
    try {
      if (!auth) throw new Error("Firebase is not configured correctly. Check your .env file.");
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
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
          localStorage.setItem('token', data.token);
          localStorage.setItem('userId', data.userId);
          navigate('/chat');
        } else {
          setIsLogin(true);
          alert("Registration successful! Please log in.");
        }
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError('Could not connect to server.');
    }
  };

  return (
    <section className="relative w-full h-screen overflow-hidden bg-black text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>
      
      {/* Background Videos Layer */}
      <div className="absolute inset-0 w-full h-full z-0">
        {videos.map((vid, index) => (
          <video
            key={index}
            src={vid.url}
            autoPlay
            muted
            loop
            playsInline
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${activeVideo === index ? 'opacity-100' : 'opacity-0'}`}
          />
        ))}
      </div>

      {/* Transparent PNG Overlay Layer */}
      <div className="absolute inset-0 w-full h-full z-[1] pointer-events-none">
        <img 
          src="https://soft-zoom-63098134.figma.site/_assets/v11/0b4a435b2df2747593c43d7a1c9b4578f7d8d90c.png" 
          alt="Overlay" 
          className="absolute inset-0 w-full h-full object-cover animate-train-bob"
        />
      </div>

      {/* Content Layer */}
      <div className="relative z-[2] flex flex-col h-full px-6 py-6 sm:px-12 sm:py-8 transition-colors duration-700" style={{ color: isDarkMode ? '#182C41' : 'white' }}>
        
        {/* Navigation */}
        <nav className="flex justify-between items-center w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="OMNIAI Logo" className="w-8 h-8 rounded-lg" />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wider" style={{ color: 'white' }}>OMNIAI</h1>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex liquid-glass items-center rounded-full px-2 py-1">
            <div className="flex items-center gap-6 px-6 system-ui text-sm text-white/90">
              <a href="#" className="hover:text-white transition-colors">How It Works</a>
              <a href="#" className="hover:text-white transition-colors">Features</a>
              <a href="#" className="hover:text-white transition-colors">Community</a>
            </div>
            <button onClick={() => navigate('/chat')} className="bg-white text-black system-ui font-medium text-sm rounded-full px-6 py-2.5 hover:scale-105 transition-transform duration-300 ml-2">
              Skip for now
            </button>
          </div>

          {/* Mobile Nav Button */}
          <button 
            className="md:hidden liquid-glass rounded-full p-3 text-white relative w-12 h-12 flex items-center justify-center z-50"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <div className="relative w-6 h-6">
              <Menu className={`absolute inset-0 transition-all duration-300 ${mobileMenuOpen ? 'rotate-90 scale-75 opacity-0' : 'rotate-0 scale-100 opacity-100'}`} />
              <X className={`absolute inset-0 transition-all duration-300 ${mobileMenuOpen ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 opacity-0'}`} />
            </div>
          </button>
        </nav>

        {/* Mobile Menu Overlay */}
        <div className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-500 md:hidden ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          <div className="flex flex-col items-center justify-center h-full gap-8">
            <a href="#" className={`text-white text-3xl system-ui transition-all duration-500 delay-100 ${mobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>How It Works</a>
            <a href="#" className={`text-white text-3xl system-ui transition-all duration-500 delay-150 ${mobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>Features</a>
            <a href="#" className={`text-white text-3xl system-ui transition-all duration-500 delay-200 ${mobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>Community</a>
            <button 
              onClick={() => navigate('/chat')} 
              className={`mt-8 bg-white text-black system-ui font-medium text-xl rounded-full px-10 py-4 transition-all duration-500 delay-300 ${mobileMenuOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
            >
              Skip for now
            </button>
          </div>
        </div>

        {/* Hero Content (Login Form) */}
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-xl mx-auto text-center mt-12 sm:mt-0">
          <div className="liquid-glass rounded-3xl p-8 sm:p-12 w-full flex flex-col items-center">
            
            <h2 className="text-4xl sm:text-5xl mb-2 transition-colors duration-700 w-full text-center" style={{ color: isDarkMode ? '#182C41' : 'white' }}>
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="system-ui text-sm sm:text-base mb-8 transition-colors duration-700 opacity-80" style={{ color: isDarkMode ? '#182C41' : 'white' }}>
              Step into your intelligent workspace
            </p>

            {error && <div className="system-ui text-sm bg-red-500/20 text-red-100 border border-red-500/30 px-4 py-2 rounded-lg mb-6 w-full text-center">{error}</div>}

            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
              <div className="relative w-full">
                <Mail size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-700 ${isDarkMode ? 'text-[#182C41]' : 'text-white/70'}`} />
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                  className={`w-full bg-white/5 border border-white/20 rounded-xl py-3 pl-12 pr-4 system-ui text-sm focus:outline-none focus:border-white/50 transition-all placeholder:text-white/50 ${isDarkMode ? 'text-[#182C41] border-[#182C41]/20 placeholder:text-[#182C41]/50 focus:border-[#182C41]/50' : 'text-white'}`}
                />
              </div>
              <div className="relative w-full">
                <Lock size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-700 ${isDarkMode ? 'text-[#182C41]' : 'text-white/70'}`} />
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  className={`w-full bg-white/5 border border-white/20 rounded-xl py-3 pl-12 pr-4 system-ui text-sm focus:outline-none focus:border-white/50 transition-all placeholder:text-white/50 ${isDarkMode ? 'text-[#182C41] border-[#182C41]/20 placeholder:text-[#182C41]/50 focus:border-[#182C41]/50' : 'text-white'}`}
                />
              </div>
              <button 
                type="submit" 
                className={`w-full system-ui font-medium text-sm rounded-xl py-3 mt-2 transition-all hover:scale-[1.02] ${isDarkMode ? 'bg-[#182C41] text-white' : 'bg-white text-black'}`}
              >
                {isLogin ? 'Sign In' : 'Sign Up'}
              </button>
            </form>

            <div className="w-full flex items-center gap-4 my-6 opacity-60">
              <div className={`flex-1 h-px ${isDarkMode ? 'bg-[#182C41]' : 'bg-white'}`}></div>
              <span className="system-ui text-xs">OR</span>
              <div className={`flex-1 h-px ${isDarkMode ? 'bg-[#182C41]' : 'bg-white'}`}></div>
            </div>

            <div className="flex w-full gap-4">
              <button 
                type="button" 
                onClick={() => handleOAuthLogin(googleProvider)}
                className={`flex-1 flex justify-center items-center gap-2 bg-white/5 border rounded-xl py-2.5 transition-all hover:bg-white/10 ${isDarkMode ? 'border-[#182C41]/20' : 'border-white/20'}`}
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
              </button>
              <button 
                type="button" 
                onClick={() => handleOAuthLogin(facebookProvider)}
                className={`flex-1 flex justify-center items-center gap-2 bg-white/5 border rounded-xl py-2.5 transition-all hover:bg-white/10 ${isDarkMode ? 'border-[#182C41]/20' : 'border-white/20'}`}
              >
                <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" className="w-5 h-5" />
              </button>
            </div>

            <p className="system-ui text-sm mt-8">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => setIsLogin(!isLogin)} 
                className={`font-semibold underline underline-offset-4 hover:opacity-80 transition-opacity ${isDarkMode ? 'text-[#182C41]' : 'text-white'}`}
              >
                {isLogin ? 'Sign Up' : 'Log In'}
              </button>
            </p>
            
          </div>
        </div>

        {/* Video Switcher */}
        <div className="w-full flex justify-center gap-4 sm:gap-8 pb-8 pt-4">
          {videos.map((vid, idx) => {
            const isActive = activeVideo === idx;
            return (
              <button
                key={idx}
                onClick={() => handleVideoSwitch(idx)}
                disabled={isTransitioning}
                className={`system-ui text-xs sm:text-sm transition-all duration-300 pb-1 border-b-2 ${
                  isActive 
                    ? `border-current opacity-100 font-medium ${isDarkMode ? 'text-[#182C41]' : 'text-white'}`
                    : `border-transparent opacity-50 hover:opacity-80 ${isDarkMode ? 'text-[#182C41]' : 'text-white'}`
                }`}
              >
                {vid.label}
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
}
