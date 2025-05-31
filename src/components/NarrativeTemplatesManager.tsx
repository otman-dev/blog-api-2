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
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

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
      }      if (response.success) {
        await fetchTemplates();
        setEditingTemplate(null);
        setIsFormVisible(false);
      }
    } catch (error) {
      console.error('Error saving template:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteConfirm(null);
    setLoading(true);
    try {
      const response = await apiFetch(`/api/narrative-templates?id=${id}`, {
        method: 'DELETE',
      });

      if (response.success) {
        await fetchTemplates();
      }
    } catch (error) {
      console.error('Error deleting template:', error);
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'narrative': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'problem-solution': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'tutorial': return 'bg-green-100 text-green-800 border-green-200';
      case 'case-study': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'comparison': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'journey': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'discovery': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'narrative': return '📖';
      case 'problem-solution': return '🔧';
      case 'tutorial': return '🎓';
      case 'case-study': return '📊';
      case 'comparison': return '⚖️';
      case 'journey': return '🗺️';
      case 'discovery': return '🔍';
      default: return '📝';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      case 'all': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.categoryCompatibility.some(category => category.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  if (!isVisible) return null;

  return (    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-inkbot-400 to-inkbot-300 bg-clip-text text-transparent">
              Narrative Templates Management
            </h2>
            <p className="text-gray-300 mt-1">Manage your narrative templates and content structures</p>
          </div>
          <button
            onClick={handleAdd}
            className="group relative px-6 py-3 bg-gradient-to-r from-inkbot-500 to-inkbot-400 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-inkbot-300 flex items-center gap-2"
          >
            <span className="text-lg">+</span>
            <span>Add New Template</span>
            <div className="absolute inset-0 bg-gradient-to-r from-inkbot-600 to-inkbot-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10"></div>
          </button>
        </div>

        {/* Search Bar */}
        <div className="mt-4">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search templates, types, or categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-inkbot-500 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
            <span className="text-gray-300">Total Templates:</span>
            <span className="font-semibold ml-1 text-inkbot-400">{templates.length}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
            <span className="text-gray-300">Active:</span>
            <span className="font-semibold ml-1 text-inkbot-400">{templates.filter(t => t.isActive).length}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
            <span className="text-gray-300">Showing:</span>
            <span className="font-semibold ml-1 text-inkbot-400">{filteredTemplates.length}</span>
          </div>
        </div>
      </div>      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20"></div>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-inkbot-500 border-t-transparent absolute top-0"></div>
          </div>
        </div>
      )}

      {/* Templates Grid */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">          {filteredTemplates.length === 0 ? (
            <div className="col-span-full">
              <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-white mb-2">No Narrative Templates Found</h3>
                <p className="text-gray-300 mb-6">
                  {searchTerm ? "No templates match your search criteria." : "Get started by adding your first narrative template."}
                </p>
                {!searchTerm && (
                  <button
                    onClick={handleAdd}
                    className="px-6 py-3 bg-gradient-to-r from-inkbot-500 to-inkbot-400 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    Add Your First Template
                  </button>
                )}
              </div>
            </div>
          ) : (
            filteredTemplates.map((template) => (
              <div
                key={template._id || template.id}
                className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] relative overflow-hidden"
              >
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200/20 to-teal-200/20 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-300"></div>
                
                <div className="relative z-10">                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(template.type)}`}>
                          <span>{getTypeIcon(template.type)}</span>
                          {template.type.replace('-', ' ')}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(template.difficulty)}`}>
                          {template.difficulty}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${template.isActive ? 'bg-green-500/20 text-green-300 border border-green-400/20' : 'bg-red-500/20 text-red-300 border border-red-400/20'}`}>
                          {template.isActive ? '✅ Active' : '❌ Inactive'}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg text-white mb-2 line-clamp-2 group-hover:text-inkbot-400 transition-colors duration-200">
                        {template.name}
                      </h3>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => handleEdit(template)}
                        className="p-2 bg-gradient-to-r from-inkbot-500 to-inkbot-400 text-white rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-inkbot-300"
                        title="Edit template"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(template.id)}
                        className="p-2 bg-gradient-to-r from-red-500 to-red-400 text-white rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-300"
                        title="Delete template"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                      <p className="text-sm text-gray-300 line-clamp-3">
                        {template.description}
                      </p>
                    </div>

                    {/* Categories */}
                    {template.categoryCompatibility.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-400 mb-2">Compatible Categories:</p>
                        <div className="flex flex-wrap gap-1">
                          {template.categoryCompatibility.slice(0, 3).map((category, idx) => (
                            <span
                              key={idx}
                              className="inline-block bg-inkbot-500/20 text-inkbot-300 text-xs px-2 py-1 rounded-full border border-inkbot-400/20"
                            >
                              {category}
                            </span>
                          ))}
                          {template.categoryCompatibility.length > 3 && (
                            <span className="inline-block bg-white/10 text-gray-300 text-xs px-2 py-1 rounded-full border border-white/20">
                              +{template.categoryCompatibility.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="pt-2 border-t border-white/10 flex justify-between items-center">
                      <span className="text-xs text-gray-400 font-mono bg-white/10 px-2 py-1 rounded">
                        ID: {template.id}
                      </span>
                      <span className="text-xs text-inkbot-300 bg-inkbot-500/20 px-2 py-1 rounded-full border border-inkbot-400/20">
                        Priority: {template.priority}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 backdrop-blur-sm rounded-2xl p-6 max-w-md w-full shadow-2xl border border-white/10">
            <div className="text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Template</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete this narrative template? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg font-semibold transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-400 hover:from-red-600 hover:to-red-500 text-white rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {isFormVisible && editingTemplate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-white/10">
            <div className="bg-white/5 backdrop-blur-sm p-6 border-b border-white/10">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-inkbot-400 to-inkbot-300 bg-clip-text text-transparent">
                {editingTemplate._id ? 'Edit Narrative Template' : 'Add New Narrative Template'}
              </h3>
              <p className="text-gray-300 mt-1">
                {editingTemplate._id ? 'Update the template details below' : 'Create a new narrative template for content generation'}
              </p>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.id.trim()) newErrors.id = 'ID is required';
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.priority < 1) newErrors.priority = 'Priority must be at least 1';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleArrayChange = (field: 'categoryCompatibility', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData({ ...formData, [field]: items });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">      {/* Basic Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-white">
            Template ID <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.id}
            onChange={(e) => setFormData({ ...formData, id: e.target.value })}
            className={`w-full px-4 py-3 bg-white/10 border-2 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-inkbot-400/50 focus:border-inkbot-400/50 transition-all duration-200 ${
              errors.id ? 'border-red-400 bg-red-500/10' : 'border-white/20 hover:border-inkbot-400/50'
            }`}
            placeholder="e.g., tutorial-template"
          />
          {errors.id && <p className="text-red-400 text-xs">{errors.id}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-white">
            Template Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`w-full px-4 py-3 bg-white/10 border-2 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-inkbot-400/50 focus:border-inkbot-400/50 transition-all duration-200 ${
              errors.name ? 'border-red-400 bg-red-500/10' : 'border-white/20 hover:border-inkbot-400/50'
            }`}
            placeholder="e.g., Comprehensive Tutorial Template"
          />
          {errors.name && <p className="text-red-400 text-xs">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-white">
            Template Type <span className="text-red-400">*</span>
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 hover:border-inkbot-400/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-inkbot-400/50 focus:border-inkbot-400/50 transition-all duration-200"
          >
            <option value="narrative" className="bg-gray-800 text-white">📖 Narrative</option>
            <option value="problem-solution" className="bg-gray-800 text-white">🔧 Problem-Solution</option>
            <option value="tutorial" className="bg-gray-800 text-white">🎓 Tutorial</option>
            <option value="case-study" className="bg-gray-800 text-white">📊 Case Study</option>
            <option value="comparison" className="bg-gray-800 text-white">⚖️ Comparison</option>
            <option value="journey" className="bg-gray-800 text-white">🗺️ Journey</option>
            <option value="discovery" className="bg-gray-800 text-white">🔍 Discovery</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-white">
            Difficulty Level <span className="text-red-400">*</span>
          </label>
          <select
            value={formData.difficulty}
            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
            className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 hover:border-inkbot-400/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-inkbot-400/50 focus:border-inkbot-400/50 transition-all duration-200"
          >
            <option value="beginner" className="bg-gray-800 text-white">🌱 Beginner</option>
            <option value="intermediate" className="bg-gray-800 text-white">⚡ Intermediate</option>
            <option value="advanced" className="bg-gray-800 text-white">🚀 Advanced</option>
            <option value="all" className="bg-gray-800 text-white">🎯 All Levels</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-white">
            Priority <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            min="1"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
            className={`w-full px-4 py-3 bg-white/10 border-2 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-inkbot-400/50 focus:border-inkbot-400/50 transition-all duration-200 ${
              errors.priority ? 'border-red-400 bg-red-500/10' : 'border-white/20 hover:border-inkbot-400/50'
            }`}
            placeholder="1"
          />
          {errors.priority && <p className="text-red-400 text-xs">{errors.priority}</p>}
          <p className="text-xs text-gray-400">Higher numbers = higher priority</p>
        </div>

        <div className="space-y-2 flex items-center justify-center">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 w-full">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-5 h-5 text-inkbot-400 bg-white/10 border-white/30 rounded focus:ring-inkbot-400/50 focus:ring-2"
              />
              <label htmlFor="isActive" className="ml-3 text-sm font-semibold text-white">
                {formData.isActive ? '✅ Template is Active' : '❌ Template is Inactive'}
              </label>
            </div>
            <p className="text-xs text-gray-400 mt-1">Active templates can be used for content generation</p>
          </div>
        </div>
      </div>      {/* Description */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-white">
          Description <span className="text-red-400">*</span>
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className={`w-full px-4 py-3 bg-white/10 border-2 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-inkbot-400/50 focus:border-inkbot-400/50 transition-all duration-200 resize-none ${
            errors.description ? 'border-red-400 bg-red-500/10' : 'border-white/20 hover:border-inkbot-400/50'
          }`}
          placeholder="Describe the purpose and structure of this narrative template..."
        />
        {errors.description && <p className="text-red-400 text-xs">{errors.description}</p>}
      </div>
      
      {/* Category Compatibility */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-white">
          Category Compatibility
          <span className="text-gray-400 font-normal text-xs ml-1">(comma-separated, leave empty for all categories)</span>
        </label>
        <input
          type="text"
          value={formData.categoryCompatibility.join(', ')}
          onChange={(e) => handleArrayChange('categoryCompatibility', e.target.value)}
          className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 hover:border-inkbot-400/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-inkbot-400/50 focus:border-inkbot-400/50 transition-all duration-200"
          placeholder="e.g., Frontend Engineering, API Design, Testing"
        />
        <p className="text-xs text-gray-400">Specify which content categories this template works best with</p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-white/20">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/30"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 bg-gradient-to-r from-inkbot-500 to-inkbot-400 hover:from-inkbot-600 hover:to-inkbot-500 text-white rounded-xl font-semibold shadow-lg shadow-inkbot-500/20 hover:shadow-xl hover:shadow-inkbot-500/30 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-2 focus:ring-inkbot-400/50 flex items-center justify-center gap-2"
        >
          {loading && (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          )}
          <span>{loading ? 'Saving...' : template._id ? 'Update Template' : 'Create Template'}</span>
        </button>
      </div>
    </form>
  );
}
