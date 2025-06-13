'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { apiFetch } from '@/lib/apiFetch';
import { useRouter } from 'next/navigation';
import GroqModelsManager from '@/components/GroqModelsManager';
import NarrativeTemplatesManager from '@/components/NarrativeTemplatesManager';
import TechTopicsManager from '@/components/TechTopicsManager';
import AutomationManager from '@/components/AutomationManager';
import InkBotLogo from '@/components/InkBotLogo';

export default function DashboardPage() {
  const { token, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [intervalText, setIntervalText] = useState('Loading...');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modern SVG Icon Component
  const TabIcon = ({ type, className = "w-5 h-5" }: { type: string; className?: string }) => {
    switch (type) {
      case 'overview':        return (
          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'groq-models':        return (
          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      case 'narrative-templates':        return (
          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );      case 'tech-topics':        return (
          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'automation':
        return (
          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return <span className={className}>?</span>;
    }
  };
  const tabs = [
    { id: 'overview', name: 'Overview', shortName: 'Dashboard' },
    { id: 'groq-models', name: 'Groq Models', shortName: 'Models' },
    { id: 'narrative-templates', name: 'Narrative Templates', shortName: 'Templates' },
    { id: 'tech-topics', name: 'Tech Topics', shortName: 'Topics' },
    { id: 'automation', name: 'Automation', shortName: 'Cron Jobs' }
  ];

  useEffect(() => {    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchPosts();
    checkGenerationStatus();
    fetchCronInterval();
  }, [isAuthenticated, router]);

  const fetchPosts = async () => {
    try {
      const response = await apiFetch('/api/blogs');
      if (response.success) {
        setPosts(response.data.slice(0, 5)); // Show latest 5 posts
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };
  const checkGenerationStatus = async () => {
    try {
      const response = await apiFetch('/api/automation-state');
      if (response.success) {
        setIsGenerating(response.data.isActive);
        setIntervalText(`${response.data.intervalMinutes} minutes`);
        console.log('✅ Loaded automation state from database:', response.data.isActive);
      } else if (response.error && response.error.includes('Authentication required')) {
        console.log('🔒 Authentication expired, logging out...');
        logout();
      }
    } catch (error) {
      console.error('Error checking automation state:', error);
      // If it's a network error or other issue, don't auto-logout
    }
  };

  const fetchCronInterval = async () => {
    try {
      const response = await apiFetch('/api/cron-interval');
      if (response.success) {
        const { intervalMinutes } = response.data;
        if (intervalMinutes === 1) {
          setIntervalText('1 minute');
        } else if (intervalMinutes < 60) {
          setIntervalText(`${intervalMinutes} minutes`);
        } else {
          const hours = Math.floor(intervalMinutes / 60);
          const mins = intervalMinutes % 60;
          if (mins === 0) {
            setIntervalText(hours === 1 ? '1 hour' : `${hours} hours`);
          } else {
            setIntervalText(`${hours}h ${mins}min`);
          }
        }
        console.log('✅ Loaded cron interval:', intervalMinutes, 'minutes');
      } else {
        console.warn('Failed to fetch cron interval, using default');
        setIntervalText('10 minutes');
      }
    } catch (error) {
      console.error('Error fetching cron interval:', error);
      setIntervalText('10 minutes'); // Fallback
    }
  };

  const handleAutoGeneration = async (action: string) => {
    setLoading(true);
    try {
      const data = await apiFetch('/api/auto-generate', {
        method: 'POST',
        body: JSON.stringify({ 
          action,
          intervalMinutes: 10 
        }),
      });
      
      if (data.success) {
        // Refresh the state from database instead of assuming the action result
        await checkGenerationStatus();
        alert(data.message);
        if (action === 'generate-now') {
          setTimeout(fetchPosts, 2000); // Refresh posts after generation
        }
      }
    } catch (error) {
      console.error('Error controlling auto-generation:', error);
      alert('Error occurred');
    } finally {
      setLoading(false);
    }  };
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-inkbot-500 mx-auto"></div>
          <p className="mt-4 text-gray-300">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 overflow-x-hidden relative">
      {/* Dark background with subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-gray-950 to-black/90"></div>
      
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-12 relative z-10">        {/* Header */}
        <div className="text-center mb-8 lg:mb-12">
          <div className="flex justify-center mb-6">
            <InkBotLogo size="xl" className="filter brightness-110 drop-shadow-2xl" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-inkbot-200 to-white bg-clip-text text-transparent mb-4">
            InkBot Dashboard
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Intelligent article generation system with complete model and template management
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/10 mb-8">          {/* Mobile Hamburger Menu */}
          <div className="md:hidden">
            <div className="flex items-center justify-between p-4 border-b border-white/10">              <div className="flex items-center gap-2">
                <TabIcon type={tabs.find(tab => tab.id === activeTab)?.id || 'overview'} className="w-5 h-5" />
                <h2 className="font-semibold text-white">{tabs.find(tab => tab.id === activeTab)?.name}</h2>
              </div>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-300 hover:text-white"
                aria-label="Toggle menu"
              >
                <svg
                  className={`w-6 h-6 transition-transform duration-200 ${mobileMenuOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
              {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
              <div className="bg-white/5 backdrop-blur-sm border-b border-white/10">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`${
                      activeTab === tab.id
                        ? 'bg-inkbot-600/20 text-inkbot-300 border-l-4 border-inkbot-500'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    } w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200`}                  >
                    <TabIcon type={tab.id} className="w-5 h-5" />
                    <span className="font-medium">{tab.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>          {/* Desktop Tab Navigation */}
          <div className="hidden md:block border-b border-white/10">
            <nav className="flex justify-center w-full" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}                  className={`${
                    activeTab === tab.id
                      ? 'border-inkbot-500 text-inkbot-300 bg-inkbot-600/20'
                      : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-white/20'
                  } flex-1 lg:flex-none min-w-0 py-4 px-4 lg:px-6 border-b-2 font-medium text-sm transition-all duration-200 flex items-center justify-center gap-3 group`}
                  title={tab.name}
                  aria-label={tab.name}                >                  <TabIcon type={tab.id} className="w-5 h-5 lg:w-6 lg:h-6 group-hover:scale-110 transition-transform duration-200" />
                  <span className="hidden md:inline lg:inline">{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-2 sm:p-4 lg:p-8 overflow-x-hidden">
            {activeTab === 'overview' && (
              <div className="space-y-6 sm:space-y-8">
                {/* Control Panel */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/10 p-3 sm:p-6 lg:p-8 overflow-hidden">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-inkbot-500 to-inkbot-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white">Panneau de Contrôle</h2>
                  </div>
                  
                  {/* Status Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-300">Statut</h3>
                        <div className={`w-3 h-3 rounded-full ${isGenerating ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                      </div>
                      <p className={`text-xl font-bold ${isGenerating ? 'text-green-400' : 'text-red-400'}`}>
                        {isGenerating ? '🟢 Actif' : '🔴 Arrêté'}
                      </p>
                    </div>
                    
                    <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-300">Intervalle</h3>
                        <svg className="w-5 h-5 text-inkbot-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-xl font-bold text-inkbot-400">{intervalText}</p>
                    </div>
                    
                    <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 shadow-sm sm:col-span-2 lg:col-span-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-300">Posts Total</h3>
                        <svg className="w-5 h-5 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>                      <p className="text-xl font-bold text-accent-purple">{posts.length}+</p>
                    </div>
                  </div>                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                    <button
                      onClick={() => handleAutoGeneration(isGenerating ? 'stop' : 'start')}
                      disabled={loading}
                      className={`group relative px-3 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 ${
                        isGenerating
                          ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-red-500/20'
                          : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-green-500/20'
                      } ${loading ? 'opacity-50 cursor-not-allowed scale-100' : 'shadow-lg hover:shadow-xl'}`}
                    >
                      <span className="flex items-center justify-center gap-1 sm:gap-2">
                        {loading ? (
                          <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        ) : isGenerating ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M6 20l4-16m4 16l4-16" />
                          </svg>
                        )}                        <span className="hidden sm:inline">
                          {loading ? 'Loading...' : isGenerating ? 'Stop' : 'Start'}
                        </span>
                        <span className="sm:hidden text-xs">
                          {loading ? '...' : isGenerating ? 'Stop' : 'Start'}
                        </span>
                      </span>
                    </button>                    <button
                      onClick={fetchPosts}
                      className="group relative px-3 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl shadow-gray-500/20"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>                        <span className="hidden sm:inline">Refresh</span>
                        <span className="sm:hidden text-xs">↻</span>
                      </span>
                    </button>                    <button
                      onClick={() => handleAutoGeneration('generate-now')}
                      disabled={loading}
                      className="group relative px-3 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-inkbot-500 to-inkbot-600 hover:from-inkbot-600 hover:to-inkbot-700 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl shadow-inkbot-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 col-span-2 lg:col-span-1"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>                        <span className="hidden sm:inline">
                          {loading ? 'Generating...' : 'Generate Now'}
                        </span>
                        <span className="sm:hidden text-xs">
                          {loading ? '...' : 'Generate'}
                        </span>
                      </span>
                    </button>
                  </div>
                </div>                {/* Recent Posts */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/10 p-3 sm:p-6 lg:p-8 overflow-hidden">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-inkbot-500 to-inkbot-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white">Recent Articles</h2>
                  </div>
                    {posts.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>                      <p className="text-white text-lg font-medium mb-2">No articles generated yet</p>
                      <p className="text-gray-400">Click "Generate Now" to create your first article</p>
                    </div>
                  ) : (                    <div className="space-y-4">
                      {posts.map((post: any, index: number) => (
                        <div key={post._id || index} className="group bg-white/5 backdrop-blur-sm border-l-4 border-inkbot-500 p-6 rounded-xl shadow-sm hover:shadow-xl hover:shadow-inkbot-500/20 transition-all duration-300 hover:transform hover:scale-[1.02] border border-white/10">
                          <h3 className="font-bold text-lg text-white mb-3 group-hover:text-inkbot-300 transition-colors">
                            {post.title || 'Title not available'}
                          </h3>
                          <p className="text-gray-300 mb-4 leading-relaxed">
                            {post.content ? post.content.substring(0, 200) + '...' : 'Content not available'}
                          </p>
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-sm text-gray-400">
                            <span className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US') : 'Unknown date'}
                            </span>
                            <span className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                              {post.category || 'Uncategorized'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}            {activeTab === 'groq-models' && <GroqModelsManager isVisible={true} />}
            {activeTab === 'narrative-templates' && <NarrativeTemplatesManager isVisible={true} />}
            {activeTab === 'tech-topics' && <TechTopicsManager isVisible={true} />}
            {activeTab === 'automation' && <AutomationManager />}
          </div>
        </div>
      </div>
    </div>
  );
}
