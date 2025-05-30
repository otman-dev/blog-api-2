import { KnowledgeBaseLoader, Topic, Category, GroqModel } from './loader';
import { NarrativeTemplateService } from '@/lib/narrativeTemplateService';
import { INarrativeTemplate } from '@/models/NarrativeTemplate';

export interface GenerationOptions {
  topicId?: string;
  categoryId?: string;
  customInstructions?: string;
  preferredModel?: string;
  narrativeTemplateId?: string; // New option for specific template
  useNarrativeTemplates?: boolean; // Flag to enable/disable narrative templates
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
  private narrativeService: NarrativeTemplateService;

  private constructor() {
    this.loader = KnowledgeBaseLoader.getInstance();
    this.narrativeService = NarrativeTemplateService.getInstance();
  }

  public static getInstance(): KnowledgeBaseService {
    if (!KnowledgeBaseService.instance) {
      KnowledgeBaseService.instance = new KnowledgeBaseService();
    }    return KnowledgeBaseService.instance;
  }

  /**
   * Generate a minimal hardcoded prompt configuration, following the zero-template approach
   * This is an alternative to the regular generatePromptConfiguration that uses even less
   * hardcoded content, similar to the test-minimal-prompts.js approach
   */  public async generateMinimalHardcodedPrompt(options: GenerationOptions = {}): Promise<GeneratedPrompt> {
    // Check if narrative templates should be used
    if (options.useNarrativeTemplates !== false) { // Default to true unless explicitly disabled
      return await this.generateNarrativeEnhancedPrompt(options);
    }
    
    // Select topic
    let topic: Topic;
    if (options.topicId) {
      topic = await this.loader.getTopicById(options.topicId);
    } else {
      topic = await this.loader.getRandomTopic();
    }    // Get category for the topic
    let category: Category;
    if (options.categoryId) {
      category = await this.loader.getCategoryById(options.categoryId);
    } else {
      // Find category by name from topic
      const categories = await this.loader.getCategories();
      const foundCategory = categories.find(c => c.name === topic.category);
      if (!foundCategory) {
        console.warn(`⚠️ Category "${topic.category}" not found for topic "${topic.topic}". Using first available category.`);
        category = categories[0];
        if (!category) {
          throw new Error('No categories available in database');
        }
      } else {
        category = foundCategory;
      }
    }
    
    // Get models (optionally filtered by preferred model)
    let models = await this.loader.getModelsByPriority();
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
   * Generate prompts enhanced with narrative templates for more human-like storytelling
   */
  public async generateNarrativeEnhancedPrompt(options: GenerationOptions = {}): Promise<GeneratedPrompt> {
    // Select topic
    let topic: Topic;
    if (options.topicId) {
      topic = await this.loader.getTopicById(options.topicId);
    } else {
      topic = await this.loader.getRandomTopic();
    }

    // Get category for the topic
    let category: Category;
    if (options.categoryId) {
      category = await this.loader.getCategoryById(options.categoryId);
    } else {
      // Find category by name from topic
      const categories = await this.loader.getCategories();
      const foundCategory = categories.find(c => c.name === topic.category);
      if (!foundCategory) {
        console.warn(`⚠️ Category "${topic.category}" not found for topic "${topic.topic}". Using first available category.`);
        category = categories[0];
        if (!category) {
          throw new Error('No categories available in database');
        }
      } else {
        category = foundCategory;
      }
    }
    
    // Get models (optionally filtered by preferred model)
    let models = await this.loader.getModelsByPriority();
    if (options.preferredModel) {
      const preferredModel = models.find(m => m.id === options.preferredModel);
      if (preferredModel) {
        // Move preferred model to front
        models = [preferredModel, ...models.filter(m => m.id !== options.preferredModel)];
      }
    }

    // Get narrative template
    let narrativeTemplate: INarrativeTemplate | null = null;
    if (options.narrativeTemplateId) {
      narrativeTemplate = await this.narrativeService.getTemplateById(options.narrativeTemplateId);
    } else {
      narrativeTemplate = await this.narrativeService.getRandomTemplate(category.name, topic.difficulty);
    }

    // Generate system message with narrative context
    const systemMessage = narrativeTemplate 
      ? this.generateNarrativeSystemMessage(category, narrativeTemplate)
      : this.generateSystemMessage(category);
    
    // Generate user message with narrative structure
    const userPrompt = narrativeTemplate
      ? this.generateNarrativeUserMessage(topic, category, narrativeTemplate, options.customInstructions)
      : this.generateUserMessage(topic, category, options.customInstructions);
    
    return {
      topic,
      category,
      systemMessage,
      userPrompt,
      models
    };
  }

  /**
   * Generate system message enhanced with narrative personality and style
   */
  private generateNarrativeSystemMessage(category: Category, template: INarrativeTemplate): string {
    const personality = template.personalityProfile;
    
    return `You are ${personality.experienceLevel} specializing in ${category.name.toLowerCase()}.

PERSONALITY & VOICE:
- Tone: ${personality.tone}
- Perspective: ${personality.perspective}  
- Communication Style: ${personality.communicationStyle}
- Target Audience: ${category.targetAudience}

STORYTELLING APPROACH:
- Use a ${template.type} narrative structure
- Incorporate ${template.humanizationTechniques.conversationalElements.slice(0, 2).join(' and ')}
- Include ${template.humanizationTechniques.personalTouches.slice(0, 2).join(' and ')}

WRITING GUIDELINES:
- Use these conversational phrases naturally: "${personality.conversationalPhrases.slice(0, 3).join('", "')}"
- Include relatable analogies when explaining complex concepts
- Share personal examples using phrases like: "${personality.personalExamples.slice(0, 2).join('", "')}"
- Create emotional connections through ${template.humanizationTechniques.emotionalConnections.slice(0, 2).join(' and ')}

HUMAN ELEMENTS TO WEAVE IN:
- Start with engaging hooks that draw readers in
- Use inclusive language (we, us, you) to build connection
- Acknowledge challenges and frustrations readers might face
- Celebrate progress and achievements along the way
- Share insights from real experience, not just theoretical knowledge

IMPORTANT: All content must be written in English, regardless of the topic title language.
Translate any non-English topic titles or terms into English in your response.

Output your content as valid JSON with properly escaped special characters.`;
  }

  /**
   * Generate user message with narrative structure and storytelling elements
   */
  private generateNarrativeUserMessage(topic: Topic, category: Category, template: INarrativeTemplate, customInstructions?: string): string {
    // Select random elements from the template
    const selectedHook = this.selectRandomElement(template.humanizationTechniques.openingHooks);
    const selectedPersonalExample = this.selectRandomElement(template.personalityProfile.personalExamples);
    const selectedAnalogy = this.selectRandomElement(template.personalityProfile.relatableAnalogies);
    
    // Build the narrative-enhanced task definition
    const narrativeTaskDefinition = `Create a compelling ${category.name.toLowerCase()} about "${topic.topic}" using the ${template.name} approach.

STORYTELLING FRAMEWORK:
${selectedHook}

NARRATIVE STRUCTURE:
Follow this ${template.type} story flow:
${template.structure.narrativeFlow.map((flow, index) => `${index + 1}. ${flow}`).join('\n')}

CONTENT SECTIONS WITH STORYTELLING GUIDANCE:
${template.structure.sections.map(section => `
## ${section.name}
Purpose: ${section.purpose}
Techniques: ${section.techniques.join(', ')}
Hook options: "${section.hooks.slice(0, 2).join('" or "')}"
Human elements: ${section.humanElements.join(', ')}
`).join('')}`;

    // Build humanization instructions
    const humanizationInstructions = `HUMAN STORYTELLING ELEMENTS:
- Opening: ${selectedHook}
- Include this type of personal touch: ${selectedPersonalExample}
- Use analogies like: ${selectedAnalogy}
- Emotional connections: ${template.humanizationTechniques.emotionalConnections.slice(0, 2).join(' and ')}
- Conversational elements: ${template.humanizationTechniques.conversationalElements.slice(0, 2).join(' and ')}

TONE & VOICE:
- Write as ${template.personalityProfile.experienceLevel}
- Use ${template.personalityProfile.tone} tone throughout
- Communication style: ${template.personalityProfile.communicationStyle}
- Include phrases like: "${template.personalityProfile.conversationalPhrases.slice(0, 3).join('", "')}"`;

    // Build topic-specific requirements
    const topicRequirements = `TOPIC FOCUS:
- Main subject: "${topic.topic}" 
- Specific angle: ${topic.angle || 'practical implementation and real-world usage'}
- Difficulty level: ${topic.difficulty}
- Estimated time: ${topic.timeToComplete}
- Keywords to include: ${topic.keywords.join(', ')}
- Tools to reference: ${topic.tools.join(', ')}
- IMPORTANT: Write the entire content in English, even if the topic contains non-English terms.`;

    // Build quality and format guidelines
    const qualityGuidelines = `QUALITY GUIDELINES:
- Use clear, executable code examples with explanations
- Include practical scenarios and real-world applications
- Provide troubleshooting tips for common issues
- Reference up-to-date technologies and best practices
- Include relevant links to documentation or resources
- Use proper formatting for code, commands, and outputs
- Make complex concepts accessible through storytelling`;

    const outputFormat = `FORMAT REQUIREMENTS:
Return a JSON object with this structure:
{
  "title": "Engaging title in English that reflects the narrative approach",
  "summary": "Brief summary that captures the story and learning journey",
  "difficulty": "${topic.difficulty}",
  "estimatedTime": "${topic.timeToComplete}",
  "content": "Full markdown content following the narrative structure above",
  "excerpt": "Compelling excerpt that hooks readers and reflects the storytelling approach",
  "categories": ["${category.name}"],
  "tags": ["tag1", "tag2", ...],
  "narrativeType": "${template.type}",
  "humanElements": ["elements that make this content feel human and relatable"]
}

ALL content must be in English, including title, summary, content, and excerpt.`;

    // Combine all parts
    let fullPrompt = [
      narrativeTaskDefinition,
      humanizationInstructions, 
      topicRequirements,
      qualityGuidelines,
      outputFormat
    ].join('\n\n');
    
    // Add custom instructions if provided
    if (customInstructions) {
      fullPrompt += `\n\nADDITIONAL REQUIREMENTS:\n${customInstructions}`;
    }
    
    return fullPrompt;
  }

  /**
   * Helper method to select a random element from an array
   */
  private selectRandomElement<T>(array: T[]): T {
    if (!array || array.length === 0) {
      throw new Error('Cannot select from empty array');
    }
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Get available narrative templates
   */
  public async getAvailableNarrativeTemplates(): Promise<INarrativeTemplate[]> {
    return await this.narrativeService.getAllTemplates();
  }

  /**
   * Get narrative templates compatible with a category and difficulty
   */
  public async getCompatibleNarrativeTemplates(categoryName: string, difficulty: string): Promise<INarrativeTemplate[]> {
    return await this.narrativeService.getCompatibleTemplates(categoryName, difficulty);
  }

  /**
   * Get narrative template by ID
   */
  public async getNarrativeTemplateById(id: string): Promise<INarrativeTemplate | null> {
    return await this.narrativeService.getTemplateById(id);
  }

  /**
   * Seed narrative templates in the database
   */
  public async seedNarrativeTemplates(): Promise<void> {
    return await this.narrativeService.seedTemplates();
  }
}
