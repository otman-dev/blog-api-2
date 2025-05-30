import { readFileSync } from 'fs';
import { join } from 'path';
import { TechTopicService } from '@/lib/techTopicService';
import { GroqModelService } from '@/lib/groqModelService';
import { CategoryService } from '@/lib/categoryService';
import { ITechTopic } from '@/models/TechTopic';
import { IGroqModel } from '@/models/GroqModel';

// Aliasing interfaces for backward compatibility
export type Topic = ITechTopic;
export type GroqModel = IGroqModel;

export interface Category {
  id: string;
  name: string;
  description: string;
  targetAudience: string;
  contentStyle: string;
  averageLength: string;
  requiredSections: string[];
}

export class KnowledgeBaseLoader {
  private static instance: KnowledgeBaseLoader;  private knowledgeBasePath: string;
  private topics: Topic[] | null = null;
  private categories: Category[] | null = null;
  private models: GroqModel[] | null = null;
  private techTopicService: TechTopicService;
  private groqModelService: GroqModelService;
  private categoryService: CategoryService;

  private constructor() {
    this.knowledgeBasePath = join(process.cwd(), 'knowledge-base');
    this.techTopicService = TechTopicService.getInstance();
    this.groqModelService = GroqModelService.getInstance();
    this.categoryService = CategoryService.getInstance();
  }

  public static getInstance(): KnowledgeBaseLoader {
    if (!KnowledgeBaseLoader.instance) {
      KnowledgeBaseLoader.instance = new KnowledgeBaseLoader();
    }
    return KnowledgeBaseLoader.instance;
  }

  public async getTopics(): Promise<Topic[]> {
    try {
      // Get topics from the database using TechTopicService
      return await this.techTopicService.getAllTopics();
    } catch (error) {
      console.error('❌ Error loading topics from database, falling back to file:', error);
      // Fallback to file-based loading if database fails
      if (!this.topics) {
        // Load main topics
        const topicsPath = join(this.knowledgeBasePath, 'topics', 'tech-topics.json');
        const topicsData = readFileSync(topicsPath, 'utf-8');
        this.topics = JSON.parse(topicsData);
      }
      return this.topics!;
    }
  }
  public async getCategories(): Promise<Category[]> {
    try {
      // Get categories from the database using CategoryService
      return await this.categoryService.getAllCategories() as Category[];
    } catch (error) {
      console.error('❌ Error loading categories from database, falling back to file:', error);
      // Fallback to file-based loading if database fails
      if (!this.categories) {
        const categoriesPath = join(this.knowledgeBasePath, 'categories', 'categories.json');
        const categoriesData = readFileSync(categoriesPath, 'utf-8');
        this.categories = JSON.parse(categoriesData);
      }
      return this.categories!;
    }
  }
  public async getModels(): Promise<GroqModel[]> {
    try {
      // Get models from the database using GroqModelService
      return await this.groqModelService.getAllModels();
    } catch (error) {
      console.error('❌ Error loading models from database, falling back to file:', error);
      // Fallback to file-based loading if database fails
      if (!this.models) {
        const modelsPath = join(this.knowledgeBasePath, 'models', 'groq-models.json');
        const modelsData = readFileSync(modelsPath, 'utf-8');
        this.models = JSON.parse(modelsData);
      }
      return this.models!;
    }
  }
  public async getRandomTopic(): Promise<Topic> {
    try {
      // Use TechTopicService to get a random topic
      return await this.techTopicService.getRandomTopic();
    } catch (error) {
      console.error('❌ Error getting random topic from database, falling back to file:', error);
      // Fallback to file-based method
      const topics = await this.getTopics();
      return topics[Math.floor(Math.random() * topics.length)];
    }
  }
  public async getTopicsByCategory(categoryId: string): Promise<Topic[]> {
    const categories = await this.getCategories();
    const category = categories.find(c => c.id === categoryId);
    
    if (!category) {
      throw new Error(`Category not found: ${categoryId}`);
    }

    try {
      // Get all topics from database then filter
      const topics = await this.getTopics();
      return topics.filter(topic => 
        topic.category === category.name || 
        // Also match if the category ID in the category list matches the topic's category with spaces removed and lowercased
        category.name.toLowerCase().replace(/\s+/g, '-').includes(topic.category.toLowerCase().replace(/\s+/g, '-')) ||
        topic.category.toLowerCase().replace(/\s+/g, '-').includes(category.name.toLowerCase().replace(/\s+/g, '-'))
      );
    } catch (error) {
      console.error(`❌ Error getting topics for category ${categoryId}:`, error);
      throw error;
    }
  }
  public async getCategoryById(categoryId: string): Promise<Category> {
    try {
      // Use CategoryService to get a category by ID
      const category = await this.categoryService.getCategoryById(categoryId) as Category;
      if (!category) {
        throw new Error(`Category not found: ${categoryId}`);
      }
      return category;
    } catch (error) {
      console.error(`❌ Error getting category with ID ${categoryId} from database, falling back to file:`, error);
      // Fallback to file-based method
      const categories = await this.getCategories();
      const category = categories.find(c => c.id === categoryId);
      
      if (!category) {
        throw new Error(`Category not found: ${categoryId}`);
      }

      return category;
    }
  }
  public async getModelsByPriority(): Promise<GroqModel[]> {
    try {
      // Get models sorted by priority directly from the service
      return await this.groqModelService.getModelsByPriority();
    } catch (error) {
      console.error('❌ Error getting models by priority from database, falling back to file:', error);
      // Fallback to file-based method
      const models = await this.getModels();
      return [...models].sort((a, b) => a.priority - b.priority);
    }
  }

  public async getTopicById(topicId: string): Promise<Topic> {
    try {
      // Use TechTopicService to get a topic by ID
      const topic = await this.techTopicService.getTopicById(topicId);
      if (!topic) {
        throw new Error(`Topic not found: ${topicId}`);
      }
      return topic;
    } catch (error) {
      console.error(`❌ Error getting topic with ID ${topicId} from database, falling back to file:`, error);
      // Fallback to file-based method
      const topics = await this.getTopics();
      const topic = topics.find(t => t.id === topicId);
      
      if (!topic) {
        throw new Error(`Topic not found: ${topicId}`);
      }

      return topic;
    }
  }
}
