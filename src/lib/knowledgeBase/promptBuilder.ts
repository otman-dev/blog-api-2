import { readFileSync } from 'fs';
import { join } from 'path';
import { Topic, Category } from './loader';

export interface PromptTemplate {
  systemMessage: string;
  mainPrompt: string;
  contentSections: string;
  variables: string[];
}

export class PromptBuilder {
  private knowledgeBasePath: string;
  private templates: Map<string, PromptTemplate> = new Map();

  constructor() {
    this.knowledgeBasePath = join(process.cwd(), 'knowledge-base');
  }
  public buildTutorialPrompt(topic: Topic, category: Category): {
    systemMessage: string;
    userPrompt: string;
  } {
    const template = this.getTutorialTemplate();
    
    // Build content sections based on category requirements
    const contentSections = this.buildContentSections(category);
    
    // Generate tags array
    const tags = this.generateTags(topic);
    
    // Replace variables in template
    const systemMessage = template.systemMessage;
    
    const userPrompt = template.mainPrompt
      .replace(/\{TOPIC\}/g, topic.topic)
      .replace(/\{TIME_TO_COMPLETE\}/g, topic.timeToComplete || '45 minutes')
      .replace(/\{CONTENT_SECTIONS\}/g, contentSections)
      .replace(/\{CATEGORY\}/g, topic.category)
      .replace(/\{TAGS\}/g, JSON.stringify(tags))
      .replace(/\{SPECIFIC_ANGLE\}/g, topic.angle);

    return {
      systemMessage,
      userPrompt
    };
  }

  private getTutorialTemplate(): PromptTemplate {
    if (!this.templates.has('tutorial')) {
      const templatePath = join(this.knowledgeBasePath, 'prompts', 'base-tutorial-template.md');
      const templateContent = readFileSync(templatePath, 'utf-8');
      
      // Parse the template file to extract sections
      const sections = this.parseTemplate(templateContent);
      this.templates.set('tutorial', sections);
    }
    
    return this.templates.get('tutorial')!;
  }
  private parseTemplate(content: string): PromptTemplate {
    // Extract system message
    const systemMatch = content.match(/## System Message\n```\n([\s\S]*?)\n```/);
    const systemMessage = systemMatch ? systemMatch[1].trim() : '';

    // Extract main prompt
    const promptMatch = content.match(/## Main Prompt Structure\n```\n([\s\S]*?)\n```/);
    const mainPrompt = promptMatch ? promptMatch[1].trim() : '';

    // Extract content sections template
    const sectionsMatch = content.match(/## Content Sections Template\n```\n([\s\S]*?)\n```/);
    const contentSections = sectionsMatch ? sectionsMatch[1].trim() : '';

    // Extract variables
    const variableMatches = content.match(/\{[A-Z_]+\}/g) || [];
    const variables = [...new Set(variableMatches)];

    return {
      systemMessage,
      mainPrompt,
      contentSections,
      variables
    };
  }

  private buildContentSections(category: Category): string {
    const sections = [
      "## Prérequis\\n- Liste exacte des outils et versions nécessaires\\n- Commandes de vérification d'installation\\n\\n",
      "## Étape 1: Installation et Setup Initial\\n```bash\\n# Commandes d'installation exactes\\n```\\n\\n",
      "## Étape 2: Configuration de Base\\n```yaml\\n# Fichiers de configuration complets\\n```\\n\\n",
      "## Étape 3: Implémentation Core\\n```javascript\\n// Code source fonctionnel et testé\\n```\\n\\n",
      "## Étape 4: Tests et Validation\\n```bash\\n# Commandes pour tester que tout fonctionne\\n```\\n\\n",
      "## Étape 5: Optimisation et Production\\n- Bonnes pratiques de sécurité\\n- Configuration de monitoring\\n- Gestion des erreurs\\n\\n",
      "## Troubleshooting\\n- Erreurs communes et solutions\\n- Commandes de debugging\\n- Métriques à surveiller\\n\\n",
      "## Next Steps\\n- Fonctionnalités avancées à ajouter\\n- Ressources pour aller plus loin"
    ];

    return sections.join('');
  }

  private generateTags(topic: Topic): string[] {
    const baseTags = ["tutorial", "setup", "guide", "step-by-step", "practical"];
    const topicKeywords = topic.keywords.map(k => k.toLowerCase());
    const difficultyTag = topic.difficulty;
    
    // Combine and deduplicate tags
    const allTags = [...baseTags, ...topicKeywords, difficultyTag];
    return [...new Set(allTags)].slice(0, 8); // Limit to 8 tags
  }
  public buildCustomPrompt(
    topic: Topic,
    category: Category,
    customInstructions?: string
  ): { systemMessage: string; userPrompt: string } {
    const basePrompt = this.buildTutorialPrompt(topic, category);
    
    if (customInstructions) {
      basePrompt.userPrompt += `\n\nINSTRUCTIONS SUPPLÉMENTAIRES:\n${customInstructions}`;
    }

    return basePrompt;
  }
}
