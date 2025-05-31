'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import InkBotLogo from '@/components/InkBotLogo';

export default function ComingSoonPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  
  // Countdown state
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Set your launch date here (example: June 30, 2025)
  const launchDate = new Date('2025-06-30T00:00:00').getTime();

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = launchDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [launchDate]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await fetch('/api/newsletter-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();      if (data.success) {
        setMessage('Thank you! We\'ll notify you when InkBot launches.');
        setEmail('');
      } else {
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setMessage('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 relative">
      {/* Subtle background effects that won't interfere with logo */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-gray-950 to-black/90"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-inkbot-900/10 to-transparent"></div>
      
      <div className="max-w-4xl w-full text-center relative z-10">        {/* Logo/Brand */}
        <div className="mb-12 animate-slide-up">
          <div className="flex justify-center mb-10">
            <InkBotLogo size="xl" className="drop-shadow-2xl filter brightness-110" />
          </div>
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 text-shadow">
            <span className="bg-gradient-to-r from-white via-inkbot-200 to-white bg-clip-text text-transparent">
              InkBot
            </span>
          </h1>          <p className="text-2xl md:text-3xl text-gray-300 mb-12 font-light">
            AI-Powered Blog Generation Platform
          </p>
        </div>        {/* Coming Soon Message */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-10 mb-12 animate-slide-up shadow-2xl">
          <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
            Coming Soon
          </h2>
          
          {/* Countdown Timer */}
          <div className="mb-8">
            <p className="text-lg text-gray-300 mb-6">Launch countdown:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-lg mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl md:text-3xl font-bold text-inkbot-300">{timeLeft.days}</div>
                <div className="text-sm text-gray-400 uppercase tracking-wider">Days</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl md:text-3xl font-bold text-inkbot-300">{timeLeft.hours}</div>
                <div className="text-sm text-gray-400 uppercase tracking-wider">Hours</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl md:text-3xl font-bold text-inkbot-300">{timeLeft.minutes}</div>
                <div className="text-sm text-gray-400 uppercase tracking-wider">Minutes</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl md:text-3xl font-bold text-inkbot-300">{timeLeft.seconds}</div>
                <div className="text-sm text-gray-400 uppercase tracking-wider">Seconds</div>
              </div>
            </div>
          </div>
          
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            We're building something amazing! Get ready for the future of AI-powered content creation with InkBot.
          </p>
            {/* Email Signup */}
          <form onSubmit={handleEmailSubmit} className="max-w-lg mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-inkbot-500 focus:border-inkbot-500 transition-all duration-200 backdrop-blur-sm"
              />              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-inkbot-600 hover:bg-inkbot-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-inkbot transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Notify Me'}
              </button>
            </div>
          </form>          {message && (
            <p className={`mt-6 text-sm font-medium ${
              message.includes('Thank you') ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              {message}
            </p>
          )}
        </div>        {/* Features Preview */}
        <div className="grid md:grid-cols-3 gap-8 mb-12 animate-slide-up">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center group shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="text-inkbot-400 text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🤖</div>
            <h3 className="text-white font-bold text-xl mb-3">AI Content Generation</h3>
            <p className="text-gray-300 leading-relaxed">Automated blog posts powered by advanced AI technology</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center group shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="text-accent-orange text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">⚡</div>
            <h3 className="text-white font-bold text-xl mb-3">Smart Automation</h3>
            <p className="text-gray-300 leading-relaxed">Scheduled content creation and intelligent publishing</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center group shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="text-accent-emerald text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">📊</div>
            <h3 className="text-white font-bold text-xl mb-3">Analytics Dashboard</h3>
            <p className="text-gray-300 leading-relaxed">Comprehensive insights and performance metrics</p>
          </div>
        </div>        {/* Admin Login Link */}
        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center text-inkbot-300 hover:text-inkbot-200 transition-colors duration-200 text-lg font-medium group"
          >
            <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Admin Access
          </Link>
        </div>
      </div>
    </div>
  );
}
