'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { apiFetch } from '@/lib/apiFetch';

export default function HomePage() {
  const { token, isAuthenticated } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (isAuthenticated) {
      fetchPosts();
      checkGenerationStatus();
    }
  }, [isAuthenticated]);  const fetchPosts = async () => {
    try {
      const response = await apiFetch('/api/blogs');
      if (response.success) {
        setPosts(response.data.slice(0, 5)); // Show latest 5 posts
      }    } catch (error) {
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
  };const handleAutoGeneration = async (action: string) => {
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Groq AI Blog Generator
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Système automatisé de génération d'articles sur la construction durable et l'éco-bâtiment
        </p>
      </div>

      {/* Control Panel */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
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

        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => handleAutoGeneration('start')}
            disabled={loading || isGenerating}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Traitement...' : 'Démarrer Auto-Génération'}
          </button>
          
          <button
            onClick={() => handleAutoGeneration('stop')}
            disabled={loading || !isGenerating}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Traitement...' : 'Arrêter Auto-Génération'}
          </button>
          
          <button
            onClick={generateNow}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Génération...' : 'Générer Maintenant'}
          </button>
          
          <button
            onClick={fetchPosts}
            disabled={loading}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            Actualiser
          </button>
        </div>
      </div>

      {/* Recent Posts */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-6">Articles Récents</h2>
        
        {posts.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucun article trouvé</p>
        ) : (
          <div className="space-y-4">
            {posts.map((post: any) => (
              <div key={post._id} className="border-l-4 border-blue-500 pl-4 py-2">
                <h3 className="font-semibold text-lg text-gray-900">{post.title}</h3>
                <p className="text-gray-600 text-sm mb-2">{post.excerpt}</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {post.categories?.map((category: string) => (
                    <span key={category} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {category}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1">
                  {post.tags?.map((tag: string) => (
                    <span key={tag} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(post.createdAt).toLocaleDateString('fr-FR')} - Par {post.author}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
