'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ComingSoonPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

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

      const data = await response.json();

      if (data.success) {
        setMessage('Thank you! We\'ll notify you when we launch.');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Logo/Brand */}
        <div className="mb-8">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
            BlogAI
          </h1>
          <p className="text-xl md:text-2xl text-blue-200 mb-8">
            AI-Powered Blog Platform
          </p>
        </div>

        {/* Coming Soon Message */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-white/20">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Coming Soon
          </h2>
          <p className="text-lg text-blue-100 mb-6">
            We're building something amazing! Get ready for the future of AI-powered content creation.
          </p>
          
          {/* Email Signup */}
          <form onSubmit={handleEmailSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {isSubmitting ? 'Submitting...' : 'Notify Me'}
              </button>
            </div>
          </form>

          {message && (
            <p className={`mt-4 text-sm ${
              message.includes('Thank you') ? 'text-green-300' : 'text-red-300'
            }`}>
              {message}
            </p>
          )}
        </div>

        {/* Features Preview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="text-blue-400 text-3xl mb-3">🤖</div>
            <h3 className="text-white font-semibold mb-2">AI Content Generation</h3>
            <p className="text-blue-200 text-sm">Automated blog posts powered by advanced AI</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="text-blue-400 text-3xl mb-3">⚡</div>
            <h3 className="text-white font-semibold mb-2">Smart Automation</h3>
            <p className="text-blue-200 text-sm">Scheduled content creation and publishing</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="text-blue-400 text-3xl mb-3">📊</div>
            <h3 className="text-white font-semibold mb-2">Analytics Dashboard</h3>
            <p className="text-blue-200 text-sm">Comprehensive insights and performance metrics</p>
          </div>
        </div>

        {/* Admin Login Link */}
        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center text-blue-300 hover:text-blue-200 transition-colors duration-200 text-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Admin Access
          </Link>
        </div>
      </div>
    </div>
  );
}
