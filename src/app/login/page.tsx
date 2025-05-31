'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import InkBotLogo from '@/components/InkBotLogo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();      if (data.success) {
        // Use the AuthProvider login method
        login(data.data.token, data.data.user);
        
        // Redirect to dashboard after successful login
        router.push('/dashboard');
      } else {
        setError(data.message || 'Failed to login. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 relative">
      {/* Dark background with subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-gray-950 to-black/90"></div>
      
      <div className="max-w-md w-full p-8 space-y-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl shadow-2xl relative z-10">

        <div className="text-center">
          <div className="flex justify-center mb-4">
            <InkBotLogo size="lg" className="filter brightness-110" />
          </div>
          <h1 className="text-2xl font-bold text-white">Sign In to InkBot</h1>
          <p className="mt-2 text-gray-600">Access your AI-powered blog dashboard</p>          <p className="mt-2 text-gray-300">Welcome back to your AI content platform</p>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-700/30 p-4 rounded-md">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-200">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-inkbot-500 focus:border-inkbot-500 transition-all duration-200"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-200">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-inkbot-500 focus:border-inkbot-500 transition-all duration-200"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-inkbot-600 hover:bg-inkbot-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-inkbot-500 disabled:opacity-50 transition-all duration-200"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
