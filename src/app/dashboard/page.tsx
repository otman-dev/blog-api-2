'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { apiFetch } from '@/lib/apiFetch';
import { useRouter } from 'next/navigation';
import GroqModelsManager from '@/components/GroqModelsManager';
import NarrativeTemplatesManager from '@/components/NarrativeTemplatesManager';
import TechTopicsManager from '@/components/TechTopicsManager';

export default function DashboardPage() {
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchPosts();
    checkGenerationStatus();
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
        console.log('✅ Loaded automation state from database:', response.data.isActive);
      }
    } catch (error) {
      console.error('Error checking automation state:', error);
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
    }
  };

  const generateNow = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ generateWithGroq: true }),
      });

      const data = await response.json();
      if (data.success) {
        alert('New post generated successfully!');
        fetchPosts();
      }
    } catch (error) {
      console.error('Error generating post:', error);
      alert('Error generating post');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          AI Blog Generator Dashboard
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Système automatisé de génération d'articles avec gestion complète
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {[
              { id: 'overview', name: '📊 Vue d\'ensemble', icon: '📊' },
              { id: 'groq-models', name: '🤖 Modèles Groq', icon: '🤖' },
              { id: 'narrative-templates', name: '📝 Templates Narratifs', icon: '📝' },
              { id: 'tech-topics', name: '🔧 Sujets Tech', icon: '🔧' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm transition-colors`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div>
              {/* Control Panel */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Panneau de Contrôle</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-700">Statut</h3>
                    <p className={`text-lg font-bold ${isGenerating ? 'text-green-600' : 'text-red-600'}`}>
                      {isGenerating ? '🟢 Actif' : '🔴 Arrêté'}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-700">Intervalle</h3>
                    <p className="text-lg font-bold text-blue-600">10 minutes</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-700">Posts Total</h3>
                    <p className="text-lg font-bold text-purple-600">{posts.length}+</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <button
                    onClick={() => handleAutoGeneration(isGenerating ? 'stop' : 'start')}
                    disabled={loading}
                    className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                      isGenerating
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {loading ? 'Chargement...' : isGenerating ? 'Arrêter' : 'Démarrer'}
                  </button>

                  <button
                    onClick={() => handleAutoGeneration('generate-now')}
                    disabled={loading}
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Génération...' : 'Générer Maintenant'}
                  </button>

                  <button
                    onClick={generateNow}
                    disabled={loading}
                    className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Génération...' : 'Post Manuel'}
                  </button>

                  <button
                    onClick={fetchPosts}
                    className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
                  >
                    Actualiser
                  </button>
                </div>
              </div>

              {/* Recent Posts */}
              <div>
                <h2 className="text-2xl font-semibold mb-6">Articles Récents</h2>
                {posts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-lg">Aucun article généré pour le moment</p>
                    <p className="text-gray-400 mt-2">Cliquez sur "Générer Maintenant" pour créer votre premier article</p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {posts.map((post: any, index: number) => (
                      <div key={post._id || index} className="border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 rounded-r-lg">
                        <h3 className="font-semibold text-lg text-gray-800 mb-2">
                          {post.title || 'Titre non disponible'}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2">
                          {post.content ? post.content.substring(0, 200) + '...' : 'Contenu non disponible'}
                        </p>
                        <div className="flex justify-between items-center text-sm text-gray-500">
                          <span>📅 {post.createdAt ? new Date(post.createdAt).toLocaleDateString('fr-FR') : 'Date inconnue'}</span>
                          <span>🏷️ {post.category || 'Non catégorisé'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}          {activeTab === 'groq-models' && <GroqModelsManager isVisible={true} />}
          {activeTab === 'narrative-templates' && <NarrativeTemplatesManager isVisible={true} />}
          {activeTab === 'tech-topics' && <TechTopicsManager isVisible={true} />}
        </div>
      </div>
    </div>
  );
}
