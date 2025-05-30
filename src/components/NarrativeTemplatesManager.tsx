'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/apiFetch';

interface NarrativeTemplate {
  _id?: string;
  id: string;
  name: string;
  description: string;
  type: 'narrative' | 'problem-solution' | 'tutorial' | 'case-study' | 'comparison' | 'journey' | 'discovery';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'all';
  categoryCompatibility: string[];
  isActive: boolean;
  priority: number;
}

interface NarrativeTemplatesManagerProps {
  isVisible: boolean;
}

export default function NarrativeTemplatesManager({ isVisible }: NarrativeTemplatesManagerProps) {
  const [templates, setTemplates] = useState<NarrativeTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NarrativeTemplate | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  useEffect(() => {
    if (isVisible) {
      fetchTemplates();
    }
  }, [isVisible]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await apiFetch('/api/narrative-templates');
      if (response.success) {
        setTemplates(response.data);
      }
    } catch (error) {
      console.error('Error fetching narrative templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (templateData: NarrativeTemplate) => {
    setLoading(true);
    try {
      let response;
      if (editingTemplate && editingTemplate._id) {
        // Update existing template
        response = await apiFetch('/api/narrative-templates', {
          method: 'PUT',
          body: JSON.stringify(templateData),
        });
      } else {
        // Create new template
        response = await apiFetch('/api/narrative-templates', {
          method: 'POST',
          body: JSON.stringify(templateData),
        });
      }

      if (response.success) {
        await fetchTemplates();
        setEditingTemplate(null);
        setIsFormVisible(false);
        alert(response.message || 'Operation successful');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Error saving template');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    setLoading(true);
    try {
      const response = await apiFetch(`/api/narrative-templates?id=${id}`, {
        method: 'DELETE',
      });

      if (response.success) {
        await fetchTemplates();
        alert(response.message || 'Template deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Error deleting template');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (template: NarrativeTemplate) => {
    setEditingTemplate(template);
    setIsFormVisible(true);
  };

  const handleAdd = () => {
    setEditingTemplate({
      id: '',
      name: '',
      description: '',
      type: 'narrative',
      difficulty: 'intermediate',
      categoryCompatibility: [],
      isActive: true,
      priority: 1,
    });
    setIsFormVisible(true);
  };

  if (!isVisible) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Narrative Templates Management</h2>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
        >
          Add New Template
        </button>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      )}

      {/* Templates List */}
      <div className="grid gap-4 mb-6">
        {templates.map((template) => (
          <div key={template._id || template.id} className="border rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-lg">{template.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${template.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {template.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <span><strong>Type:</strong> {template.type}</span>
                  <span><strong>Difficulty:</strong> {template.difficulty}</span>
                  <span><strong>Priority:</strong> {template.priority}</span>
                  <span><strong>ID:</strong> {template.id}</span>
                </div>
                <div className="mt-2">
                  <strong>Categories:</strong> {template.categoryCompatibility.join(', ') || 'All'}
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleEdit(template)}
                  className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(template.id)}
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
      {isFormVisible && editingTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">
              {editingTemplate._id ? 'Edit Template' : 'Add New Template'}
            </h3>
            <NarrativeTemplateForm
              template={editingTemplate}
              onSave={handleSave}
              onCancel={() => {
                setIsFormVisible(false);
                setEditingTemplate(null);
              }}
              loading={loading}
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface NarrativeTemplateFormProps {
  template: NarrativeTemplate;
  onSave: (template: NarrativeTemplate) => void;
  onCancel: () => void;
  loading: boolean;
}

function NarrativeTemplateForm({ template, onSave, onCancel, loading }: NarrativeTemplateFormProps) {
  const [formData, setFormData] = useState<NarrativeTemplate>(template);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleArrayChange = (field: 'categoryCompatibility', value: string) => {
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
          <label className="block text-sm font-medium mb-1">Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="narrative">Narrative</option>
            <option value="problem-solution">Problem-Solution</option>
            <option value="tutorial">Tutorial</option>
            <option value="case-study">Case Study</option>
            <option value="comparison">Comparison</option>
            <option value="journey">Journey</option>
            <option value="discovery">Discovery</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Difficulty</label>
          <select
            value={formData.difficulty}
            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="all">All</option>
          </select>
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
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="mr-2"
          />
          <label htmlFor="isActive" className="text-sm font-medium">Active</label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Category Compatibility (comma-separated)</label>
        <input
          type="text"
          value={formData.categoryCompatibility.join(', ')}
          onChange={(e) => handleArrayChange('categoryCompatibility', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Frontend Engineering, API Design, Testing"
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
