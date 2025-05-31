'use client';

import { useState } from 'react';

interface BlogFormProps {
  onSubmit: (data: FormData) => void;
  loading?: boolean;
  initialData?: {
    title?: string;
    content?: string;
    excerpt?: string;
    tags?: string[];
    published?: boolean;
  };
}

interface FormData {
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  published: boolean;
  generateWithGroq?: boolean;
  topic?: string;
  tone?: string;
  length?: string;
}

export default function BlogForm({ onSubmit, loading = false, initialData }: BlogFormProps) {
  const [useGroq, setUseGroq] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: initialData?.title || '',
    content: initialData?.content || '',
    excerpt: initialData?.excerpt || '',
    tags: initialData?.tags || [],
    published: initialData?.published || false,
    topic: '',
    tone: 'professional',
    length: 'medium'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (useGroq) {
      onSubmit({
        ...formData,
        generateWithGroq: true
      });
    } else {
      onSubmit(formData);
    }
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData({ ...formData, tags });
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-white/10">
        <div className="flex items-center mb-6">
          <input
            type="checkbox"
            id="useGroq"
            checked={useGroq}
            onChange={(e) => setUseGroq(e.target.checked)}
            className="mr-2 text-inkbot-500 bg-white/10 border-white/20 rounded focus:ring-inkbot-500"
          />
          <label htmlFor="useGroq" className="text-sm font-medium text-gray-200">
            Generate content using Groq AI
          </label>
        </div>        {useGroq ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-gray-200">
                Topic
              </label>
              <input
                type="text"
                id="topic"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                className="mt-1 block w-full rounded-md bg-white/10 border-white/20 text-white placeholder-gray-400 shadow-sm focus:border-inkbot-500 focus:ring-inkbot-500"
                placeholder="Enter the topic for your blog post"
                required={useGroq}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="tone" className="block text-sm font-medium text-gray-200">
                  Tone
                </label>
                <select
                  id="tone"
                  value={formData.tone}
                  onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="technical">Technical</option>
                  <option value="creative">Creative</option>
                </select>
              </div>

              <div>
                <label htmlFor="length" className="block text-sm font-medium text-gray-700">
                  Length
                </label>
                <select
                  id="length"
                  value={formData.length}
                  onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="short">Short (500-800 words)</option>
                  <option value="medium">Medium (800-1200 words)</option>
                  <option value="long">Long (1200-2000 words)</option>
                </select>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter blog title"
                required={!useGroq}
              />
            </div>

            <div>
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">
                Excerpt
              </label>
              <textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Brief description of the blog post"
                required={!useGroq}
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Content
              </label>
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={12}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Write your blog content here..."
                required={!useGroq}
              />
            </div>
          </div>
        )}

        <div className="mt-4">
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            id="tags"
            value={formData.tags.join(', ')}
            onChange={handleTagsChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="technology, web development, AI"
          />
        </div>

        <div className="mt-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="published"
              checked={formData.published}
              onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="published" className="text-sm font-medium text-gray-700">
              Publish immediately
            </label>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Processing...' : useGroq ? 'Generate Blog' : 'Save Blog'}
          </button>
        </div>
      </div>
    </form>
  );
}
