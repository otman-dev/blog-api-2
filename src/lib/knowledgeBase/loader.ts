import { readFileSync } from 'fs';
import { join } from 'path';

export interface Topic {
  id: string;
  topic: string;
  category: string;
  angle: string;
  keywords: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeToComplete: string;
  tools: string[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  targetAudience: string;
  contentStyle: string;
  averageLength: string;
  requiredSections: string[];
}

export interface GroqModel {
  id: string;
  name: string;
  priority: number;
  tokensPerMinute: number;
  dailyLimit: string | number;
  bestFor: string[];
  temperature: number;
  maxTokens: number;
}

export class KnowledgeBaseLoader {
  private static instance: KnowledgeBaseLoader;
  private knowledgeBasePath: string;
  private topics: Topic[] | null = null;
  private categories: Category[] | null = null;
  private models: GroqModel[] | null = null;

  private constructor() {
    this.knowledgeBasePath = join(process.cwd(), 'knowledge-base');
  }

  public static getInstance(): KnowledgeBaseLoader {
    if (!KnowledgeBaseLoader.instance) {
      KnowledgeBaseLoader.instance = new KnowledgeBaseLoader();
    }
    return KnowledgeBaseLoader.instance;
  }

  public getTopics(): Topic[] {
    if (!this.topics) {
      // Load main topics
      const topicsPath = join(this.knowledgeBasePath, 'topics', 'tech-topics.json');
      const topicsData = readFileSync(topicsPath, 'utf-8');
      const mainTopics = JSON.parse(topicsData);
      
      // Load supplemental topics if available
      try {
        const supplementalTopicsPath = join(this.knowledgeBasePath, 'topics', 'supplemental-topics.json');
        const supplementalTopicsData = readFileSync(supplementalTopicsPath, 'utf-8');
        const supplementalTopics = JSON.parse(supplementalTopicsData);
        
        // Combine topics from both files
        this.topics = [...mainTopics, ...supplementalTopics];
      } catch (error) {
        // If supplemental topics file doesn't exist or is empty, just use main topics
        this.topics = mainTopics;
      }
    }
    return this.topics!;
  }

  public getCategories(): Category[] {
    if (!this.categories) {
      const categoriesPath = join(this.knowledgeBasePath, 'categories', 'categories.json');
      const categoriesData = readFileSync(categoriesPath, 'utf-8');
      this.categories = JSON.parse(categoriesData);
    }
    return this.categories!;
  }

  public getModels(): GroqModel[] {
    if (!this.models) {
      const modelsPath = join(this.knowledgeBasePath, 'models', 'groq-models.json');
      const modelsData = readFileSync(modelsPath, 'utf-8');
      this.models = JSON.parse(modelsData);
    }
    return this.models!;
  }

  public getRandomTopic(): Topic {
    const topics = this.getTopics();
    return topics[Math.floor(Math.random() * topics.length)];
  }

  public getTopicsByCategory(categoryId: string): Topic[] {
    const topics = this.getTopics();
    const categories = this.getCategories();
    const category = categories.find(c => c.id === categoryId);
    
    if (!category) {
      throw new Error(`Category not found: ${categoryId}`);
    }

    return topics.filter(topic => 
      topic.category === category.name || 
      // Also match if the category ID in the category list matches the topic's category with spaces removed and lowercased
      category.name.toLowerCase().replace(/\s+/g, '-').includes(topic.category.toLowerCase().replace(/\s+/g, '-')) ||
      topic.category.toLowerCase().replace(/\s+/g, '-').includes(category.name.toLowerCase().replace(/\s+/g, '-'))
    );
  }

  public getCategoryById(categoryId: string): Category {
    const categories = this.getCategories();
    const category = categories.find(c => c.id === categoryId);
    
    if (!category) {
      throw new Error(`Category not found: ${categoryId}`);
    }

    return category;
  }

  public getModelsByPriority(): GroqModel[] {
    const models = this.getModels();
    return [...models].sort((a, b) => a.priority - b.priority);
  }

  public getTopicById(topicId: string): Topic {
    const topics = this.getTopics();
    const topic = topics.find(t => t.id === topicId);
    
    if (!topic) {
      throw new Error(`Topic not found: ${topicId}`);
    }

    return topic;
  }
}
