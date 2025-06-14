'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/apiFetch';
import Pagination from './Pagination';

interface GroqModel {
  _id?: string;
  id: string;
  name: string;
  priority: number;
  tokensPerMinute: number;
  dailyLimit: string | number;
  bestFor: string[];
  temperature: number;
  maxTokens: number;
}

interface GroqModelsManagerProps {
  isVisible: boolean;
}

export default function GroqModelsManager({ isVisible }: GroqModelsManagerProps) {
  const [models, setModels] = useState<GroqModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingModel, setEditingModel] = useState<GroqModel | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const MODELS_PER_PAGE = 6;

  useEffect(() => {
    if (isVisible) {
      fetchModels();
    }
  }, [isVisible]);

  const fetchModels = async () => {
    setLoading(true);
    try {
      const response = await apiFetch('/api/groq-models');
      if (response.success) {
        setModels(response.data);
      }
    } catch (error) {
      console.error('Error fetching Groq models:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (modelData: GroqModel) => {
    setLoading(true);
    try {
      let response;
      if (editingModel && editingModel._id) {
        // Update existing model
        response = await apiFetch('/api/groq-models', {
          method: 'PUT',
          body: JSON.stringify(modelData),
        });
      } else {
        // Create new model
        response = await apiFetch('/api/groq-models', {
          method: 'POST',
          body: JSON.stringify(modelData),
        });
      }      if (response.success) {
        await fetchModels();
        setEditingModel(null);
        setIsFormVisible(false);
        
        const modelName = editingModel ? editingModel.name : (document.querySelector('input[placeholder="Model Name"]') as HTMLInputElement)?.value || 'model';
        const action = editingModel ? 'updated' : 'created';
        alert(`✅ Groq Model ${action} successfully!\n\n📝 Model: ${modelName}\n🎯 This model is now available for blog post generation.`);
      } else {
        const errorMsg = response.error || 'Unknown error occurred';
        alert(`❌ Failed to save Groq model\n\n💡 Please check:\n• Model name is unique\n• All required fields are filled\n• You have proper permissions\n\nError: ${errorMsg}`);
      }
    } catch (error) {
      console.error('Error saving model:', error);
      const errorMsg = error instanceof Error ? error.message : 'Network error';
      alert(`❌ Network error while saving model\n\n🔗 Connection issue detected. Please:\n• Check your internet connection\n• Refresh the page and try again\n• Contact support if the problem persists\n\nTechnical details: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (id: string) => {
    // Get model name for better confirmation message
    const modelToDelete = models.find(m => m._id === id);
    const modelName = modelToDelete?.name || 'this model';
    
    if (!confirm(`🗑️ Delete Groq Model: "${modelName}"?\n\n⚠️ This action cannot be undone.\n✅ The model will be removed from your blog generation options.\n\nAre you sure you want to continue?`)) return;

    setLoading(true);
    try {
      const response = await apiFetch(`/api/groq-models?id=${id}`, {
        method: 'DELETE',
      });

      if (response.success) {
        await fetchModels();
        alert(`✅ Model deleted successfully!\n\n📝 "${modelName}" has been removed from your available models.\n🎯 This model is no longer available for blog post generation.`);
      } else {
        const errorMsg = response.error || 'Unknown error occurred';
        alert(`❌ Failed to delete model\n\n💡 Possible reasons:\n• The model is currently in use\n• You don't have deletion permissions\n• Server error occurred\n\nError: ${errorMsg}`);
      }
    } catch (error) {
      console.error('Error deleting model:', error);
      const errorMsg = error instanceof Error ? error.message : 'Network error';
      alert(`❌ Network error while deleting model\n\n🔗 Connection issue detected. Please:\n• Check your internet connection\n• Refresh the page and try again\n• The model might still exist - check the list\n\nTechnical details: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (model: GroqModel) => {
    setEditingModel(model);
    setIsFormVisible(true);
  };
  const handleAdd = () => {
    setEditingModel({
      id: '',
      name: '',
      priority: 1,
      tokensPerMinute: 6000,
      dailyLimit: 'unlimited',
      bestFor: [],
      temperature: 0.7,
      maxTokens: 4000,
    });
    setIsFormVisible(true);
  };

  // Pagination calculations
  const totalPages = Math.ceil(models.length / MODELS_PER_PAGE);
  const startIndex = (currentPage - 1) * MODELS_PER_PAGE;
  const endIndex = startIndex + MODELS_PER_PAGE;
  const currentModels = models.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of the models section smoothly
    const modelsSection = document.getElementById('models-grid');
    if (modelsSection) {
      modelsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Reset to first page when models change
  useEffect(() => {
    setCurrentPage(1);
  }, [models.length]);

  if (!isVisible) return null;
  return (
    <div className="space-y-6">      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-inkbot-500 to-inkbot-400 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>            <h2 className="text-2xl font-bold text-white">Groq Models</h2>
            <p className="text-gray-300">Manage AI models for content generation</p>
          </div>
        </div>
        
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-inkbot-500 to-inkbot-400 hover:from-inkbot-600 hover:to-inkbot-500 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl shadow-inkbot-500/20"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>          <span className="hidden sm:inline">New Model</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 animate-spin text-inkbot-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-gray-300 font-medium">Loading models...</span>
          </div>
        </div>
      )}      {/* Models Grid */}
      {!loading && models.length > 0 && (
        <div id="models-grid" className="space-y-6">
          {/* Models Count Info */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-gray-400">
            <div>
              Showing {startIndex + 1}-{Math.min(endIndex, models.length)} of {models.length} models
            </div>
            {totalPages > 1 && (
              <div className="text-right">
                Page {currentPage} of {totalPages}
              </div>
            )}
          </div>

          {/* Models Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {currentModels.map((model) => (
              <div key={model._id || model.id} className="group bg-white/5 backdrop-blur-sm rounded-2xl shadow-lg border border-white/10 p-6 hover:shadow-xl transition-all duration-300 hover:transform hover:scale-[1.02]">
                {/* Model Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-inkbot-400 transition-colors">
                      {model.name}
                    </h3>
                    <p className="text-sm text-gray-400 font-mono bg-white/10 px-2 py-1 rounded">
                      {model.id}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <button
                      onClick={() => handleEdit(model)}
                      className="p-2 text-gray-400 hover:text-inkbot-400 hover:bg-white/10 rounded-lg transition-all duration-200"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(model.id)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Model Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gradient-to-br from-inkbot-500/20 to-inkbot-400/20 p-3 rounded-xl border border-inkbot-400/20">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-inkbot-400">Priorité</span>
                      <div className={`w-2 h-2 rounded-full ${model.priority >= 8 ? 'bg-green-500' : model.priority >= 5 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                    </div>
                    <span className="text-lg font-bold text-white">{model.priority}</span>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-3 rounded-xl border border-green-400/20">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-green-400">Tokens/min</span>
                      <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <span className="text-lg font-bold text-white">{model.tokensPerMinute.toLocaleString()}</span>
                  </div>
                </div>

                {/* Model Details */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Limite quotidienne:</span>
                    <span className="font-semibold text-white">{model.dailyLimit}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Température:</span>
                    <span className="font-semibold text-white">{model.temperature}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Max Tokens:</span>
                    <span className="font-semibold text-white">{model.maxTokens.toLocaleString()}</span>
                  </div>
                </div>

                {/* Best For Tags */}
                {model.bestFor && model.bestFor.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <span className="text-xs font-medium text-gray-400 mb-2 block">Ideal for:</span>
                    <div className="flex flex-wrap gap-1">
                      {model.bestFor.slice(0, 3).map((tag, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-inkbot-500/20 text-inkbot-300 border border-inkbot-400/20">
                          {tag}
                        </span>
                      ))}
                      {model.bestFor.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/10 text-gray-300 border border-white/20">
                          +{model.bestFor.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                className="w-full max-w-md"
              />
            </div>
          )}
        </div>
      )}{/* Empty State */}
      {!loading && models.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No models configured</h3>
          <p className="text-gray-400 mb-6">Commencez par ajouter votre premier modèle Groq</p>
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-inkbot-500 to-inkbot-400 hover:from-inkbot-600 hover:to-inkbot-500 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl shadow-inkbot-500/20"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Ajouter un modèle
          </button>
        </div>
      )}      {/* Form Modal */}
      {isFormVisible && editingModel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
            <div className="sticky top-0 bg-gray-900/90 backdrop-blur-sm border-b border-white/10 px-6 py-4 rounded-t-2xl">
              <h3 className="text-xl font-bold text-white">
                {editingModel._id ? 'Edit Model' : 'New Model'}
              </h3>
            </div>
            <div className="p-6">
              <GroqModelForm
                model={editingModel}
                onSave={handleSave}
                onCancel={() => {
                  setIsFormVisible(false);
                  setEditingModel(null);
                }}
                loading={loading}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface GroqModelFormProps {
  model: GroqModel;
  onSave: (model: GroqModel) => void;
  onCancel: () => void;
  loading: boolean;
}

function GroqModelForm({ model, onSave, onCancel, loading }: GroqModelFormProps) {
  const [formData, setFormData] = useState<GroqModel>(model);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleArrayChange = (field: 'bestFor', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData({ ...formData, [field]: items });
  };
  return (    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-300">ID du modèle</label>
          <input
            type="text"
            value={formData.id}
            onChange={(e) => setFormData({ ...formData, id: e.target.value })}
            required
            className="w-full px-4 py-3 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-inkbot-500 focus:border-transparent transition-all duration-200 bg-white/10 focus:bg-white/20 text-white placeholder-gray-400"
            placeholder="llama-3.1-70b-versatile"
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-300">Nom du modèle</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full px-4 py-3 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-inkbot-500 focus:border-transparent transition-all duration-200 bg-white/10 focus:bg-white/20 text-white placeholder-gray-400"
            placeholder="Llama 3.1 70B Versatile"
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-300">Priorité</label>
          <input
            type="number"
            min="1"
            max="10"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
            required
            className="w-full px-4 py-3 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-inkbot-500 focus:border-transparent transition-all duration-200 bg-white/10 focus:bg-white/20 text-white placeholder-gray-400"
          />
          <p className="text-xs text-gray-400">1 = faible, 10 = élevée</p>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-300">Tokens par minute</label>
          <input
            type="number"
            value={formData.tokensPerMinute}
            onChange={(e) => setFormData({ ...formData, tokensPerMinute: parseInt(e.target.value) })}
            required
            className="w-full px-4 py-3 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-inkbot-500 focus:border-transparent transition-all duration-200 bg-white/10 focus:bg-white/20 text-white placeholder-gray-400"
            placeholder="6000"
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-300">Limite quotidienne</label>
          <input
            type="text"
            value={formData.dailyLimit}
            onChange={(e) => setFormData({ ...formData, dailyLimit: e.target.value })}
            required
            className="w-full px-4 py-3 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-inkbot-500 focus:border-transparent transition-all duration-200 bg-white/10 focus:bg-white/20 text-white placeholder-gray-400"
            placeholder="unlimited ou 100000"
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-300">Température</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="2"
            value={formData.temperature}
            onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
            required
            className="w-full px-4 py-3 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-inkbot-500 focus:border-transparent transition-all duration-200 bg-white/10 focus:bg-white/20 text-white placeholder-gray-400"
            placeholder="0.7"
          />
          <p className="text-xs text-gray-400">0.0 = déterministe, 2.0 = créatif</p>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-300">Tokens maximum</label>
          <input
            type="number"
            value={formData.maxTokens}
            onChange={(e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value) })}
            required
            className="w-full px-4 py-3 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-inkbot-500 focus:border-transparent transition-all duration-200 bg-white/10 focus:bg-white/20 text-white placeholder-gray-400"
            placeholder="4000"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-300">Ideal for (comma separated)</label>
        <input
          type="text"
          value={formData.bestFor.join(', ')}
          onChange={(e) => handleArrayChange('bestFor', e.target.value)}
          className="w-full px-4 py-3 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-inkbot-500 focus:border-transparent transition-all duration-200 bg-white/10 focus:bg-white/20 text-white placeholder-gray-400"
          placeholder="génération de code, explications, écriture créative"
        />
        <p className="text-xs text-gray-400">Describe the optimal use cases for this model</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-white/10">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 bg-white/10 hover:bg-white/20 text-gray-300 rounded-xl font-semibold transition-all duration-200 order-2 sm:order-1"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-inkbot-500 to-inkbot-400 hover:from-inkbot-600 hover:to-inkbot-500 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl shadow-inkbot-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 order-1 sm:order-2"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Enregistrement...
            </span>
          ) : (
            'Save'
          )}
        </button>
      </div>
    </form>
  );
}
