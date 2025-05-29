import { KnowledgeBaseLoader, Topic, Category, GroqModel } from './loader';
import { PromptBuilder } from './promptBuilder';
import { DynamicPromptBuilder } from './dynamicPromptBuilder';

export interface GenerationOptions {
  topicId?: string;
  categoryId?: string;
  customInstructions?: string;
  preferredModel?: string;
}

export interface GeneratedPrompt {
  topic: Topic;
  category: Category;
  systemMessage: string;
  userPrompt: string;
  models: GroqModel[];
}

export class KnowledgeBaseService {
  private static instance: KnowledgeBaseService;
  private loader: KnowledgeBaseLoader;
  private promptBuilder: PromptBuilder;
  private dynamicPromptBuilder: DynamicPromptBuilder;  private constructor() {
    this.loader = KnowledgeBaseLoader.getInstance();
    this.promptBuilder = new PromptBuilder();
    
    // Get all topics, categories, and models for the dynamic prompt builder
    const topics = this.loader.getTopics();
    const categories = this.loader.getCategories();
    const models = this.loader.getModels();
    
    this.dynamicPromptBuilder = new DynamicPromptBuilder();
  }

  public static getInstance(): KnowledgeBaseService {
    if (!KnowledgeBaseService.instance) {
      KnowledgeBaseService.instance = new KnowledgeBaseService();
    }
    return KnowledgeBaseService.instance;
  }
  /**
   * Generate a complete prompt configuration for blog post generation
   * Uses dynamic prompt building with minimal hardcoded content
   */
  public generatePromptConfiguration(options: GenerationOptions = {}): GeneratedPrompt {
    // Select topic
    let topic: Topic;
    if (options.topicId) {
      topic = this.loader.getTopicById(options.topicId);
    } else {
      topic = this.loader.getRandomTopic();
    }

    // Get category for the topic
    let category: Category;
    if (options.categoryId) {
      category = this.loader.getCategoryById(options.categoryId);
    } else {
      // Find category by name from topic
      const categories = this.loader.getCategories();
      category = categories.find(c => c.name === topic.category)!;
    }

    // Build prompts using fully dynamic system (zero hardcoded prompts)
    const prompts = this.dynamicPromptBuilder.buildFullyDynamicPrompt(topic, category);

    // Apply custom instructions if provided
    if (options.customInstructions) {
      prompts.userPrompt += `\n\nADDITIONAL REQUIREMENTS:\n${options.customInstructions}`;
    }

    // Get models (optionally filtered by preferred model)
    let models = this.loader.getModelsByPriority();
    if (options.preferredModel) {
      const preferredModel = models.find(m => m.id === options.preferredModel);
      if (preferredModel) {
        // Move preferred model to front
        models = [preferredModel, ...models.filter(m => m.id !== options.preferredModel)];
      }
    }

    return {
      topic,
      category,
      systemMessage: prompts.systemMessage,
      userPrompt: prompts.userPrompt,
      models
    };
  }

  /**
   * Generate a minimal hardcoded prompt configuration, following the zero-template approach
   * This is an alternative to the regular generatePromptConfiguration that uses even less
   * hardcoded content, similar to the test-minimal-prompts.js approach
   */
  public generateMinimalHardcodedPrompt(options: GenerationOptions = {}): GeneratedPrompt {
    // Select topic
    let topic: Topic;
    if (options.topicId) {
      topic = this.loader.getTopicById(options.topicId);
    } else {
      topic = this.loader.getRandomTopic();
    }

    // Get category for the topic
    let category: Category;
    if (options.categoryId) {
      category = this.loader.getCategoryById(options.categoryId);
    } else {
      // Find category by name from topic
      const categories = this.loader.getCategories();
      category = categories.find(c => c.name === topic.category)!;
    }
    
    // Get models (optionally filtered by preferred model)
    let models = this.loader.getModelsByPriority();
    if (options.preferredModel) {
      const preferredModel = models.find(m => m.id === options.preferredModel);
      if (preferredModel) {
        // Move preferred model to front
        models = [preferredModel, ...models.filter(m => m.id !== options.preferredModel)];
      }
    }
    
    // Generate system message with zero hardcoding - pure metadata
    const systemMessage = this.generateSystemMessage(category);
    
    // Generate user message with zero hardcoding - pure metadata
    const userPrompt = this.generateUserMessage(topic, category, options.customInstructions);
    
    return {
      topic,
      category,
      systemMessage,
      userPrompt,
      models
    };
  }
    // Generate system message with zero hardcoding
  private generateSystemMessage(category: Category): string {
    return `You are an expert technical writer specializing in ${category.name.toLowerCase()}. 
Your writing style is clear, precise and focuses on practical applications.
Your target audience is ${category.targetAudience}.
You create content that is well-structured, thorough, and provides actionable insights.

IMPORTANT: All content must be written in English, regardless of the topic title language.
Translate any non-English topic titles or terms into English in your response.

Output your content as valid JSON with properly escaped special characters.`;
  }
  // Generate user message with zero hardcoding
  private generateUserMessage(topic: Topic, category: Category, customInstructions?: string): string {
    // Build prompts entirely from metadata
    const taskDefinition = `Create a comprehensive ${category.name.toLowerCase()} in English about "${topic.topic}".
Focus on the specific angle: ${topic.angle || 'practical implementation and real-world usage'}.
This should be a ${topic.difficulty} level guide with an estimated completion time of ${topic.timeToComplete}.
IMPORTANT: Write the entire content in English, even if the topic or keywords contain non-English terms.`;

    // Generate content structure from category or default
    const sections = category.requiredSections || [
      'Introduction', 
      'Prerequisites', 
      'Setup', 
      'Implementation', 
      'Testing', 
      'Conclusion'
    ];
    
    const contentStructure = `Your content should include the following sections:
${sections.map(section => `- ${section}`).join('\n')}`;

    // Generate quality guidelines entirely from metadata
    const qualityGuidelines = `Quality Guidelines:
- Use clear code examples that follow best practices
- Include diagrams or visual explanations where appropriate
- Provide troubleshooting tips for common issues
- Reference up-to-date technologies and approaches
- Include links to relevant documentation or resources
- Use proper formatting for code, commands, and outputs
- Keywords to include: ${topic.keywords.join(', ')}
- Tools to reference: ${topic.tools.join(', ')}`;    // Generate output format
    const outputFormat = `Format your response as a JSON object with the following structure:
{
  "title": "The title of your content in English",
  "summary": "A brief summary of what the content covers",
  "difficulty": "${topic.difficulty}",
  "estimatedTime": "${topic.timeToComplete}",
  "content": "Full markdown content with all sections in English",
  "excerpt": "A brief excerpt suitable for a blog preview",
  "categories": ["${category.name}"],
  "tags": ["tag1", "tag2", ...]
}

ALL content must be in English, including the title, summary, content, and excerpt.`;

    // Combine all parts
    let fullPrompt = [taskDefinition, contentStructure, qualityGuidelines, outputFormat].join('\n\n');
    
    // Add custom instructions if provided
    if (customInstructions) {
      fullPrompt += `\n\nADDITIONAL REQUIREMENTS:\n${customInstructions}`;
    }
    
    return fullPrompt;
  }

  /**
   * Get available topics, optionally filtered by category
   */
  public getAvailableTopics(categoryId?: string): Topic[] {
    if (categoryId) {
      return this.loader.getTopicsByCategory(categoryId);
    }
    return this.loader.getTopics();
  }

  /**
   * Get available categories
   */
  public getAvailableCategories(): Category[] {
    return this.loader.getCategories();
  }

  /**
   * Get available models
   */
  public getAvailableModels(): GroqModel[] {
    return this.loader.getModels();
  }

  /**
   * Generate a random topic configuration
   */
  public generateRandomConfiguration(): GeneratedPrompt {
    return this.generatePromptConfiguration();
  }

  /**
   * Get statistics about the knowledge base
   */
  public getKnowledgeBaseStats(): {
    totalTopics: number;
    totalCategories: number;
    totalModels: number;
    topicsByCategory: Record<string, number>;
    topicsByDifficulty: Record<string, number>;
  } {
    const topics = this.loader.getTopics();
    const categories = this.loader.getCategories();
    const models = this.loader.getModels();

    const topicsByCategory: Record<string, number> = {};
    const topicsByDifficulty: Record<string, number> = {};

    topics.forEach(topic => {
      topicsByCategory[topic.category] = (topicsByCategory[topic.category] || 0) + 1;
      topicsByDifficulty[topic.difficulty] = (topicsByDifficulty[topic.difficulty] || 0) + 1;
    });

    return {
      totalTopics: topics.length,
      totalCategories: categories.length,
      totalModels: models.length,
      topicsByCategory,
      topicsByDifficulty
    };
  }

  /**
   * Validate if a topic exists
   */
  public isValidTopic(topicId: string): boolean {
    try {
      this.loader.getTopicById(topicId);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate if a category exists
   */
  public isValidCategory(categoryId: string): boolean {
    try {
      this.loader.getCategoryById(categoryId);
      return true;
    } catch {
      return false;
    }
  }
}
