'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/apiFetch';

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
      }

      if (response.success) {
        await fetchTopics();
        setEditingTopic(null);
        setIsFormVisible(false);
        alert(response.message || 'Operation successful');
      }
    } catch (error) {
      console.error('Error saving topic:', error);
      alert('Error saving topic');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this topic?')) return;

    setLoading(true);
    try {
      const response = await apiFetch(`/api/tech-topics?id=${id}`, {
        method: 'DELETE',
      });

      if (response.success) {
        await fetchTopics();
        alert(response.message || 'Topic deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting topic:', error);
      alert('Error deleting topic');
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

  if (!isVisible) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Tech Topics Management</h2>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
        >
          Add New Topic
        </button>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      )}

      {/* Topics List */}
      <div className="grid gap-4 mb-6">
        {topics.map((topic) => (
          <div key={topic._id || topic.id} className="border rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{topic.topic}</h3>
                <p className="text-sm text-gray-600 mb-2">{topic.angle}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-2">
                  <span><strong>Category:</strong> {topic.category}</span>
                  <span><strong>Difficulty:</strong> {topic.difficulty}</span>
                  <span><strong>Time:</strong> {topic.timeToComplete}</span>
                  <span><strong>ID:</strong> {topic.id}</span>
                </div>
                <div className="text-sm mb-1">
                  <strong>Keywords:</strong> {topic.keywords.join(', ') || 'None'}
                </div>
                <div className="text-sm">
                  <strong>Tools:</strong> {topic.tools.join(', ') || 'None'}
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleEdit(topic)}
                  className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(topic.id)}
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
      {isFormVisible && editingTopic && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">
              {editingTopic._id ? 'Edit Topic' : 'Add New Topic'}
            </h3>
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleArrayChange = (field: 'keywords' | 'tools', value: string) => {
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
          <label className="block text-sm font-medium mb-1">Category</label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Time to Complete</label>
          <input
            type="text"
            value={formData.timeToComplete}
            onChange={(e) => setFormData({ ...formData, timeToComplete: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 30 minutes, 1 hour"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Topic</label>
        <input
          type="text"
          value={formData.topic}
          onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Building a REST API with Node.js and Express"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Angle</label>
        <textarea
          value={formData.angle}
          onChange={(e) => setFormData({ ...formData, angle: e.target.value })}
          required
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="The unique perspective or approach for this topic"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Keywords (comma-separated)</label>
        <input
          type="text"
          value={formData.keywords.join(', ')}
          onChange={(e) => handleArrayChange('keywords', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., REST, API, Node.js, Express, HTTP"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Tools (comma-separated)</label>
        <input
          type="text"
          value={formData.tools.join(', ')}
          onChange={(e) => handleArrayChange('tools', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Node.js, Express, Postman, MongoDB"
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
