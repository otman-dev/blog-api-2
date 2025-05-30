'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/apiFetch';

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
      }

      if (response.success) {
        await fetchModels();
        setEditingModel(null);
        setIsFormVisible(false);
        alert(response.message || 'Operation successful');
      }
    } catch (error) {
      console.error('Error saving model:', error);
      alert('Error saving model');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this model?')) return;

    setLoading(true);
    try {
      const response = await apiFetch(`/api/groq-models?id=${id}`, {
        method: 'DELETE',
      });

      if (response.success) {
        await fetchModels();
        alert(response.message || 'Model deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting model:', error);
      alert('Error deleting model');
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

  if (!isVisible) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Groq Models Management</h2>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
        >
          Add New Model
        </button>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      )}

      {/* Models List */}
      <div className="grid gap-4 mb-6">
        {models.map((model) => (
          <div key={model._id || model.id} className="border rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{model.name}</h3>
                <p className="text-sm text-gray-600">ID: {model.id}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm">
                  <span><strong>Priority:</strong> {model.priority}</span>
                  <span><strong>Tokens/min:</strong> {model.tokensPerMinute}</span>
                  <span><strong>Daily Limit:</strong> {model.dailyLimit}</span>
                  <span><strong>Temperature:</strong> {model.temperature}</span>
                </div>
                <div className="mt-2">
                  <strong>Best For:</strong> {model.bestFor.join(', ')}
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleEdit(model)}
                  className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(model.id)}
                  className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {isFormVisible && editingModel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">
              {editingModel._id ? 'Edit Model' : 'Add New Model'}
            </h3>
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">ID</label>
          <input
            type="text"
            value={formData.id}
            onChange={(e) => setFormData({ ...formData, id: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Priority</label>
          <input
            type="number"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tokens Per Minute</label>
          <input
            type="number"
            value={formData.tokensPerMinute}
            onChange={(e) => setFormData({ ...formData, tokensPerMinute: parseInt(e.target.value) })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Daily Limit</label>
          <input
            type="text"
            value={formData.dailyLimit}
            onChange={(e) => setFormData({ ...formData, dailyLimit: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Temperature</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="2"
            value={formData.temperature}
            onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Max Tokens</label>
          <input
            type="number"
            value={formData.maxTokens}
            onChange={(e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value) })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Best For (comma-separated)</label>
        <input
          type="text"
          value={formData.bestFor.join(', ')}
          onChange={(e) => handleArrayChange('bestFor', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., code generation, explanations, creative writing"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
}
