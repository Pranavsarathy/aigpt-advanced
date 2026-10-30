import { useMemo, useState, useEffect } from 'react';
import { Mail, Lock, LogIn, ExternalLink } from 'lucide-react';

export default function App() {
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Generate realistic glowing stars with randomized positions and twinkling speeds
  const stars = useMemo(() => {
    return Array.from({ length: 150 }).map((_, i) => {
      const size = Math.random() * 2 + 1; // 1px to 3px
      return (
        <div
          key={i}
          className="absolute rounded-full bg-white z-0 pointer-events-none"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${size}px`,
            height: `${size}px`,
            opacity: Math.random() * 0.8 + 0.2,
            boxShadow: `0 0 ${size * 4}px ${size * 1.5}px rgba(255, 255, 255, 0.8)`,
            animation: `twinkle ${Math.random() * 4 + 2}s infinite ease-in-out alternate`,
            animationDelay: `${Math.random() * 2}s`
          }}
        />
      );
    });
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-white font-sans flex flex-col items-center justify-center cursor-crosshair">
      {/* Interactive Glowing Cursor Spotlight */}
      <div 
        className="pointer-events-none fixed inset-0 z-50 transition-opacity duration-300 mix-blend-screen"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.07), transparent 40%)`
        }}
      />
      {/* Trailing Cursor Ring */}
      <div
        className="pointer-events-none fixed z-50 w-8 h-8 border border-white/40 rounded-full transition-all duration-150 ease-out hidden sm:block"
        style={{
          left: `${mousePos.x}px`,
          top: `${mousePos.y}px`,
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 0 10px rgba(255,255,255,0.2)'
        }}
      />
      {/* Background Video (z-0) with Night Effect Filters */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 brightness-[0.35] contrast-125 hue-rotate-180 saturate-50"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_094145_4a271a6c-3869-4f1c-8aa7-aeb0cb227994.mp4"
      />

      {/* Realistic Glowing Stars (z-0) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none mix-blend-screen">
        {stars}
      </div>

      {/* Bottom Blur Overlay (z-1) */}
      <div 
        className="absolute inset-0 z-1 pointer-events-none backdrop-blur-xl"
        style={{
          WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 45%)',
          maskImage: 'linear-gradient(to top, black 0%, transparent 45%)'
        }}
      />

      {/* Login Card (z-10) */}
      <div 
        className="animate-blur-fade-up relative z-10 w-full max-w-md mx-4 p-8 rounded-2xl liquid-glass flex flex-col items-center"
        style={{ animationDelay: '200ms' }}
      >
        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-6 border border-white/20 shadow-lg">
          <Lock className="w-8 h-8 text-white" />
        </div>
        
        <h1 className="text-3xl font-semibold mb-2 tracking-tight">Welcome Back</h1>
        <p className="text-gray-400 text-sm mb-8 text-center">Enter your credentials to access the secure system.</p>

        <form className="w-full flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
          {/* Email Input */}
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="w-5 h-5 text-gray-400" />
            </div>
            <input 
              type="email" 
              placeholder="Email Address" 
              className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 focus:bg-white/10 transition-colors placeholder:text-gray-500 text-white"
            />
          </div>

          {/* Password Input */}
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="w-5 h-5 text-gray-400" />
            </div>
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 focus:bg-white/10 transition-colors placeholder:text-gray-500 text-white"
            />
          </div>

          {/* Login Button */}
          <button 
            type="submit"
            className="w-full mt-4 bg-white text-black font-semibold rounded-xl py-3 flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
          >
            <LogIn className="w-5 h-5" />
            Sign In
          </button>
        </form>

        <div className="w-full h-px bg-white/10 my-8"></div>

        {/* Skip to Traffic Detection Button */}
        <a 
          href="http://localhost:8501" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full liquid-glass rounded-xl py-3 flex items-center justify-center gap-2 hover:bg-white/10 transition-colors text-sm font-medium border border-white/20"
        >
          Skip to Smart Traffic Detection
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
