import { readFileSync } from 'fs';
import { join } from 'path';
import { Topic, Category, KnowledgeBaseLoader } from './loader';

export interface DynamicPromptComponents {
  systemRole: string;
  taskDefinition: string;
  outputFormat: string;
  contentStructure: string[];
  constraints: string[];
  qualityGuidelines: string[];
}

export class DynamicPromptBuilder {
  private knowledgeBasePath: string;
  private loader: KnowledgeBaseLoader;

  constructor() {
    this.knowledgeBasePath = join(process.cwd(), 'knowledge-base');
    this.loader = KnowledgeBaseLoader.getInstance();
  }

  /**
   * Builds a completely dynamic prompt with zero hardcoded text
   * Everything is generated based on topic and category metadata
   */
  public buildFullyDynamicPrompt(topic: Topic, category: Category): {
    systemMessage: string;
    userPrompt: string;
  } {
    const components = this.generatePromptComponents(topic, category);
    
    const systemMessage = this.buildSystemMessage(components);
    const userPrompt = this.buildUserPrompt(topic, category, components);

    return { systemMessage, userPrompt };
  }

  private generatePromptComponents(topic: Topic, category: Category): DynamicPromptComponents {
    return {
      systemRole: this.generateSystemRole(category),
      taskDefinition: this.generateTaskDefinition(topic, category),
      outputFormat: this.generateOutputFormat(),
      contentStructure: this.generateContentStructure(category),
      constraints: this.generateConstraints(topic),
      qualityGuidelines: this.generateQualityGuidelines(category)
    };
  }
  private generateSystemRole(category: Category): string {
    // Generate system role purely from category metadata with zero hardcoding
    return `You are an expert technical writer specializing in ${category.name.toLowerCase()}. 
Your writing style is clear, precise and focuses on practical applications.
Your target audience is ${category.targetAudience}.
You create content that is well-structured, thorough, and provides actionable insights.`;
  }
  private generateTaskDefinition(topic: Topic, category: Category): string {
    return `Create a comprehensive ${category.name.toLowerCase()} about "${topic.topic}".
Focus on the specific angle: ${topic.angle || 'practical implementation and real-world usage'}.
This should be a ${topic.difficulty} level guide with an estimated completion time of ${topic.timeToComplete}.`;
  }
  private generateOutputFormat(): string {
    // Generate output format with minimal hardcoding
    return `Format your response as a JSON object with the following structure:
{
  "title": "The title of your content",
  "summary": "A brief summary of what the content covers",
  "difficulty": "beginner|intermediate|advanced",
  "estimatedTime": "Estimated time to complete in minutes",
  "prerequisites": ["prerequisite1", "prerequisite2", ...],
  "sections": [
    {
      "title": "Section Title",
      "content": "Markdown content for this section"
    }
  ],
  "conclusion": "Conclusion text",
  "resources": [
    {
      "title": "Resource title",
      "url": "URL to the resource"
    }
  ]
}`;
  }
  private generateContentStructure(category: Category): string[] {
    // Use category's required sections if available, or provide minimal default sections
    if (category.requiredSections && category.requiredSections.length > 0) {
      return category.requiredSections;
    }
    
    // Minimal default sections
    return [
      'Introduction', 
      'Prerequisites', 
      'Setup', 
      'Implementation', 
      'Testing', 
      'Conclusion'
    ];
  }  private generateConstraints(topic: Topic): string[] {
    // Generate constraints based solely on topic difficulty with minimal hardcoding
    const baseConstraints = [
      'Provide complete, working code examples',
      'Include exact command-line instructions',
      'Specify tool versions and dependencies'
    ];

    // Simple difficulty-based constraints
    const difficultyConstraints: Record<string, string[]> = {
      'beginner': [
        'Explain concepts clearly for beginners',
        'Provide detailed step-by-step instructions',
        'Assume minimal prior knowledge'
      ],
      'intermediate': [
        'Balance theory with practical implementation',
        'Include best practices and common patterns',
        'Address typical challenges and solutions'
      ],
      'advanced': [
        'Cover advanced implementation details',
        'Include scalability and security considerations',
        'Discuss architectural trade-offs'
      ]
    };

    return [...baseConstraints, ...(difficultyConstraints[topic.difficulty] || [])];
  }  private generateQualityGuidelines(category: Category): string[] {
    // Generate minimal quality guidelines based on category metadata
    return [
      `Content style: ${category.contentStyle || 'Clear and instructive'}`,
      `Target audience: ${category.targetAudience || 'Technical professionals'}`,
      `Target length: ${category.averageLength || '2000-3000 words'}`,
      'Use clear code examples that follow best practices',
      'Include diagrams or visual explanations where appropriate',
      'Provide troubleshooting tips for common issues',
      'Reference up-to-date technologies and approaches'
    ];
  }

  private buildSystemMessage(components: DynamicPromptComponents): string {
    return `${components.systemRole}

CRITICAL OUTPUT REQUIREMENT: ${components.outputFormat}`;
  }

  private buildUserPrompt(topic: Topic, category: Category, components: DynamicPromptComponents): string {
    const jsonStructure = this.generateJsonStructure(topic, category);
    
    return `${components.taskDefinition}

CONTENT REQUIREMENTS:
${components.contentStructure.map(item => `• ${item}`).join('\n')}

TECHNICAL CONSTRAINTS:
${components.constraints.map(item => `• ${item}`).join('\n')}

QUALITY GUIDELINES:
${components.qualityGuidelines.map(item => `• ${item}`).join('\n')}

FOCUS AREA: ${topic.angle}

REQUIRED TOOLS/TECHNOLOGIES: ${topic.tools.join(', ')}

TARGET KEYWORDS: ${topic.keywords.join(', ')}

OUTPUT FORMAT:
${jsonStructure}

Generate the tutorial following these specifications exactly. Return only the JSON object.`;
  }

  private generateJsonStructure(topic: Topic, category: Category): string {
    const tags = this.generateDynamicTags(topic);
    
    return `{
  "title": "${topic.topic}: Complete ${category.name.includes('Tutorial') ? 'Guide' : 'Tutorial'}",
  "content": "# ${topic.topic}\\n\\n## Quick Overview\\n[Brief description and what readers will accomplish]\\n\\n## Prerequisites\\n[Required tools, knowledge, and setup]\\n\\n## Implementation\\n[Step-by-step instructions with complete code examples]\\n\\n## Testing & Validation\\n[How to verify the implementation works]\\n\\n## Production Considerations\\n[Best practices and optimization tips]\\n\\n## Troubleshooting\\n[Common issues and solutions]\\n\\n## Next Steps\\n[Advanced features and further learning]",
  "excerpt": "Learn ${topic.topic.toLowerCase()} with this ${topic.difficulty}-level tutorial. Complete implementation in ${topic.timeToComplete}.",
  "categories": ["${category.name}"],
  "tags": ${JSON.stringify(tags)}
}`;
  }

  private generateDynamicTags(topic: Topic): string[] {
    const baseTags = ['tutorial', 'practical', topic.difficulty];
    const keywordTags = topic.keywords.map(k => k.toLowerCase().replace(/[^a-z0-9]/g, '-'));
    const toolTags = topic.tools.map(t => t.toLowerCase().replace(/[^a-z0-9]/g, '-'));
    
    return [...new Set([...baseTags, ...keywordTags, ...toolTags])].slice(0, 8);
  }
}
