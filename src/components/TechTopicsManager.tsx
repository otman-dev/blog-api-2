'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/apiFetch';
import Pagination from './Pagination';

interface TechTopic {
  _id?: string;
  id: string;
  topic: string;
  category: string;
  angle: string;
  keywords: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeToComplete: string;
  tools: string[];
}

interface TechTopicsManagerProps {
  isVisible: boolean;
}

export default function TechTopicsManager({ isVisible }: TechTopicsManagerProps) {
  const [topics, setTopics] = useState<TechTopic[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingTopic, setEditingTopic] = useState<TechTopic | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const TOPICS_PER_PAGE = 6;

  useEffect(() => {
    if (isVisible) {
      fetchTopics();
    }
  }, [isVisible]);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const response = await apiFetch('/api/tech-topics');
      if (response.success) {
        setTopics(response.data);
      }
    } catch (error) {
      console.error('Error fetching tech topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (topicData: TechTopic) => {
    setLoading(true);
    try {
      let response;
      if (editingTopic && editingTopic._id) {
        // Update existing topic
        response = await apiFetch('/api/tech-topics', {
          method: 'PUT',
          body: JSON.stringify(topicData),
        });
      } else {
        // Create new topic
        response = await apiFetch('/api/tech-topics', {
          method: 'POST',
          body: JSON.stringify(topicData),
        });
      }      if (response.success) {
        await fetchTopics();
        setEditingTopic(null);
        setIsFormVisible(false);
      }
    } catch (error) {
      console.error('Error saving topic:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (id: string) => {
    setDeleteConfirm(null);
    setLoading(true);
    try {
      const response = await apiFetch(`/api/tech-topics?id=${id}`, {
        method: 'DELETE',
      });

      if (response.success) {
        await fetchTopics();
        // Simple success feedback without alert
      }
    } catch (error) {
      console.error('Error deleting topic:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (topic: TechTopic) => {
    setEditingTopic(topic);
    setIsFormVisible(true);
  };
  const handleAdd = () => {
    setEditingTopic({
      id: '',
      topic: '',
      category: '',
      angle: '',
      keywords: [],
      difficulty: 'intermediate',
      timeToComplete: '30 minutes',
      tools: [],
    });
    setIsFormVisible(true);
  };
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/20 text-green-300 border-green-400/30';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30';
      case 'advanced': return 'bg-red-500/20 text-red-300 border-red-400/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '🌱';
      case 'intermediate': return '⚡';
      case 'advanced': return '🚀';
      default: return '📝';
    }
  };
  const filteredTopics = topics.filter(topic =>
    topic.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredTopics.length / TOPICS_PER_PAGE);
  const startIndex = (currentPage - 1) * TOPICS_PER_PAGE;
  const endIndex = startIndex + TOPICS_PER_PAGE;
  const currentTopics = filteredTopics.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of the topics section smoothly
    const topicsSection = document.getElementById('topics-grid');
    if (topicsSection) {
      topicsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Reset to first page when search term or topics change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, topics.length]);
  if (!isVisible) return null;

  return (    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-lg shadow-inkbot-500/10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-inkbot-400 to-inkbot-300 bg-clip-text text-transparent">
              Tech Topics Management
            </h2>
            <p className="text-gray-300 mt-1">Manage your tech topics and learning paths</p>
          </div>
          <button
            onClick={handleAdd}
            className="group relative px-6 py-3 bg-gradient-to-r from-inkbot-500 to-inkbot-400 text-white rounded-xl font-semibold shadow-lg shadow-inkbot-500/20 hover:shadow-xl hover:shadow-inkbot-500/30 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-inkbot-400/50 flex items-center gap-2"
          >
            <span className="text-lg">+</span>
            <span>Add New Topic</span>
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
              placeholder="Search topics, categories, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-inkbot-400/50 focus:border-inkbot-400/50 transition-all duration-200"
            />
          </div>
        </div>        {/* Stats */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
            <span className="text-gray-300">Total Topics:</span>
            <span className="font-semibold ml-1 text-inkbot-400">{topics.length}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
            <span className="text-gray-300">Filtered:</span>
            <span className="font-semibold ml-1 text-inkbot-400">{filteredTopics.length}</span>
          </div>
          {totalPages > 1 && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
              <span className="text-gray-300">Page:</span>
              <span className="font-semibold ml-1 text-inkbot-400">{currentPage} of {totalPages}</span>
            </div>
          )}
        </div>
      </div>      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20"></div>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-inkbot-400 border-t-transparent absolute top-0"></div>
          </div>
        </div>
      )}      {/* Topics Grid */}
      {!loading && (
        <div id="topics-grid" className="space-y-6">
          {/* Topics Count Info */}
          {filteredTopics.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-gray-400">
              <div>
                Showing {startIndex + 1}-{Math.min(endIndex, filteredTopics.length)} of {filteredTopics.length} topics
              </div>
              {totalPages > 1 && (
                <div className="text-right">
                  Page {currentPage} of {totalPages}
                </div>
              )}
            </div>
          )}

          {/* Topics Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTopics.length === 0 ? (
              <div className="col-span-full">
                <div className="text-center py-12 bg-white/10 rounded-2xl border border-white/20">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-xl font-semibold text-white mb-2">No Tech Topics Found</h3>
                  <p className="text-gray-400 mb-6">
                    {searchTerm ? "No topics match your search criteria." : "Get started by adding your first tech topic."}
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={handleAdd}
                      className="px-6 py-3 bg-gradient-to-r from-inkbot-500 to-inkbot-400 text-white rounded-xl font-semibold shadow-lg shadow-inkbot-500/20 hover:shadow-xl hover:shadow-inkbot-500/30 transition-all duration-200 transform hover:scale-105"
                    >
                      Add Your First Topic
                    </button>
                  )}
                </div>
              </div>
            ) : (
              currentTopics.map((topic) => (
                <div
                  key={topic._id || topic.id}
                  className="group bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-lg shadow-inkbot-500/5 hover:shadow-xl hover:shadow-inkbot-500/10 transition-all duration-300 transform hover:scale-[1.02] relative overflow-hidden"
                >
                  {/* Background Decoration */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-inkbot-500/10 to-inkbot-400/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-300"></div>
                  
                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(topic.difficulty)}`}>
                            <span>{getDifficultyIcon(topic.difficulty)}</span>
                            {topic.difficulty}
                          </span>
                          <span className="text-xs text-gray-400 bg-white/10 px-2 py-1 rounded-full">
                            {topic.timeToComplete}
                          </span>
                        </div>
                        <h3 className="font-bold text-lg text-white mb-2 line-clamp-2 group-hover:text-inkbot-300 transition-colors duration-200">
                          {topic.topic}
                        </h3>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={() => handleEdit(topic)}
                          className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg shadow-lg shadow-yellow-500/20 hover:shadow-xl hover:shadow-yellow-500/30 transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                          title="Edit topic"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(topic.id)}
                          className="p-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-400/50"
                          title="Delete topic"
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
                        <p className="text-sm text-gray-300 mb-2">
                          <span className="font-medium text-inkbot-400">Angle:</span> {topic.angle}
                        </p>
                        <p className="text-sm text-gray-300">
                          <span className="font-medium text-inkbot-400">Category:</span> {topic.category}
                        </p>
                      </div>

                      {/* Keywords */}
                      {topic.keywords.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-400 mb-2">Keywords:</p>
                          <div className="flex flex-wrap gap-1">
                            {topic.keywords.slice(0, 4).map((keyword, idx) => (
                              <span
                                key={idx}
                                className="inline-block bg-inkbot-500/20 text-inkbot-300 text-xs px-2 py-1 rounded-full border border-inkbot-400/30"
                              >
                                {keyword}
                              </span>
                            ))}
                            {topic.keywords.length > 4 && (
                              <span className="inline-block bg-white/10 text-gray-400 text-xs px-2 py-1 rounded-full border border-white/20">
                                +{topic.keywords.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Tools */}
                      {topic.tools.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-400 mb-2">Tools:</p>
                          <div className="flex flex-wrap gap-1">
                            {topic.tools.slice(0, 3).map((tool, idx) => (
                              <span
                                key={idx}
                                className="inline-block bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded-full border border-blue-400/30"
                              >
                                {tool}
                              </span>
                            ))}
                            {topic.tools.length > 3 && (
                              <span className="inline-block bg-white/10 text-gray-400 text-xs px-2 py-1 rounded-full border border-white/20">
                                +{topic.tools.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* ID Badge */}
                      <div className="pt-2 border-t border-white/20">
                        <span className="text-xs text-gray-400 font-mono bg-white/10 px-2 py-1 rounded">
                          ID: {topic.id}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && filteredTopics.length > 0 && (
            <div className="mt-8 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                className="w-full max-w-md"
              />
            </div>
          )}
        </div>      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Topic</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete this topic? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg font-semibold transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="px-6 py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-lg font-semibold shadow-lg shadow-red-500/20 transition-all duration-200 transform hover:scale-105"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}      {/* Form Modal */}
      {isFormVisible && editingTopic && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-white/5 backdrop-blur-sm border-b border-white/10 p-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-inkbot-400 to-inkbot-300 bg-clip-text text-transparent">
                {editingTopic._id ? 'Edit Tech Topic' : 'Add New Tech Topic'}
              </h3>
              <p className="text-gray-300 mt-1">
                {editingTopic._id ? 'Update the topic details below' : 'Create a new tech topic for your learning path'}
              </p>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
              <TechTopicForm
                topic={editingTopic}
                onSave={handleSave}
                onCancel={() => {
                  setIsFormVisible(false);
                  setEditingTopic(null);
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

interface TechTopicFormProps {
  topic: TechTopic;
  onSave: (topic: TechTopic) => void;
  onCancel: () => void;
  loading: boolean;
}

function TechTopicForm({ topic, onSave, onCancel, loading }: TechTopicFormProps) {
  const [formData, setFormData] = useState<TechTopic>(topic);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.id.trim()) newErrors.id = 'ID is required';
    if (!formData.topic.trim()) newErrors.topic = 'Topic is required';
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    if (!formData.angle.trim()) newErrors.angle = 'Angle is required';
    if (!formData.timeToComplete.trim()) newErrors.timeToComplete = 'Time to complete is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleArrayChange = (field: 'keywords' | 'tools', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData({ ...formData, [field]: items });
  };

  return (    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      {/* Basic Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-white">
            Topic ID <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.id}
            onChange={(e) => setFormData({ ...formData, id: e.target.value })}
            className={`w-full px-4 py-3 bg-white/10 border-2 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-inkbot-400/50 focus:border-inkbot-400/50 transition-all duration-200 ${
              errors.id ? 'border-red-400 bg-red-500/10' : 'border-white/20 hover:border-inkbot-400/50'
            }`}
            placeholder="e.g., rest-api-nodejs"
          />
          {errors.id && <p className="text-red-400 text-xs">{errors.id}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-white">
            Category <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className={`w-full px-4 py-3 bg-white/10 border-2 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-inkbot-400/50 focus:border-inkbot-400/50 transition-all duration-200 ${
              errors.category ? 'border-red-400 bg-red-500/10' : 'border-white/20 hover:border-inkbot-400/50'
            }`}
            placeholder="e.g., Backend Development"
          />
          {errors.category && <p className="text-red-400 text-xs">{errors.category}</p>}
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
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-white">
            Time to Complete <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.timeToComplete}
            onChange={(e) => setFormData({ ...formData, timeToComplete: e.target.value })}
            className={`w-full px-4 py-3 bg-white/10 border-2 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-inkbot-400/50 focus:border-inkbot-400/50 transition-all duration-200 ${
              errors.timeToComplete ? 'border-red-400 bg-red-500/10' : 'border-white/20 hover:border-inkbot-400/50'
            }`}
            placeholder="e.g., 30 minutes, 2 hours"
          />
          {errors.timeToComplete && <p className="text-red-400 text-xs">{errors.timeToComplete}</p>}
        </div>
      </div>

      {/* Topic Title */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-white">
          Topic Title <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={formData.topic}
          onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
          className={`w-full px-4 py-3 bg-white/10 border-2 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-inkbot-400/50 focus:border-inkbot-400/50 transition-all duration-200 ${
            errors.topic ? 'border-red-400 bg-red-500/10' : 'border-white/20 hover:border-inkbot-400/50'
          }`}
          placeholder="e.g., Building a REST API with Node.js and Express"
        />
        {errors.topic && <p className="text-red-400 text-xs">{errors.topic}</p>}
      </div>

      {/* Angle */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-white">
          Learning Angle <span className="text-red-400">*</span>
        </label>
        <textarea
          value={formData.angle}
          onChange={(e) => setFormData({ ...formData, angle: e.target.value })}
          rows={3}
          className={`w-full px-4 py-3 bg-white/10 border-2 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-inkbot-400/50 focus:border-inkbot-400/50 transition-all duration-200 resize-none ${
            errors.angle ? 'border-red-400 bg-red-500/10' : 'border-white/20 hover:border-inkbot-400/50'
          }`}
          placeholder="Describe the unique perspective or approach for this topic..."
        />
        {errors.angle && <p className="text-red-400 text-xs">{errors.angle}</p>}
      </div>
      
      {/* Keywords and Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-white">
            Keywords
            <span className="text-gray-400 font-normal text-xs ml-1">(comma-separated)</span>
          </label>
          <input
            type="text"
            value={formData.keywords.join(', ')}
            onChange={(e) => handleArrayChange('keywords', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 hover:border-inkbot-400/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-inkbot-400/50 focus:border-inkbot-400/50 transition-all duration-200"
            placeholder="e.g., REST, API, Node.js, Express, HTTP"
          />
          <p className="text-xs text-gray-400">Keywords help with search and categorization</p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-white">
            Tools & Technologies
            <span className="text-gray-400 font-normal text-xs ml-1">(comma-separated)</span>
          </label>
          <input
            type="text"
            value={formData.tools.join(', ')}
            onChange={(e) => handleArrayChange('tools', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 hover:border-inkbot-400/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-inkbot-400/50 focus:border-inkbot-400/50 transition-all duration-200"
            placeholder="e.g., Node.js, Express, Postman, MongoDB"
          />
          <p className="text-xs text-gray-400">List the main tools needed for this topic</p>
        </div>
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
          <span>{loading ? 'Saving...' : topic._id ? 'Update Topic' : 'Create Topic'}</span>
        </button>
      </div>
    </form>
  );
}
