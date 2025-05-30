import adminDbConnect from '@/lib/db/adminDb';
import NarrativeTemplateSchema, { INarrativeTemplate } from '@/models/NarrativeTemplate';
import { Model } from 'mongoose';

export class NarrativeTemplateService {
  private static instance: NarrativeTemplateService;
  private model: Model<INarrativeTemplate> | null = null;

  private constructor() {}

  public static getInstance(): NarrativeTemplateService {
    if (!NarrativeTemplateService.instance) {
      NarrativeTemplateService.instance = new NarrativeTemplateService();
    }
    return NarrativeTemplateService.instance;
  }
  private async getModel(): Promise<Model<INarrativeTemplate>> {
    if (!this.model) {
      const connection = await adminDbConnect();
      this.model = connection.models.NarrativeTemplate || 
        connection.model<INarrativeTemplate>('NarrativeTemplate', NarrativeTemplateSchema);
    }
    return this.model;
  }

  /**
   * Get all active narrative templates
   */
  async getAllTemplates(): Promise<INarrativeTemplate[]> {
    try {
      const model = await this.getModel();
      return await model.find({ isActive: true }).sort({ priority: -1, name: 1 });
    } catch (error) {
      console.error('Error fetching narrative templates:', error);
      throw new Error('Failed to fetch narrative templates');
    }
  }

  /**
   * Get narrative templates compatible with a specific category and difficulty
   */  async getCompatibleTemplates(categoryName: string, difficulty: string): Promise<INarrativeTemplate[]> {
    try {
      const model = await this.getModel();
      return await model.find({
        isActive: true,
        $and: [
          {
            $or: [
              { categoryCompatibility: { $in: [categoryName, 'all'] } },
              { categoryCompatibility: { $size: 0 } } // Empty array means compatible with all
            ]
          },
          {
            $or: [
              { difficulty: difficulty },
              { difficulty: 'all' }
            ]
          }
        ]
      }).sort({ priority: -1, name: 1 });
    } catch (error) {
      console.error('Error fetching compatible templates:', error);
      throw new Error('Failed to fetch compatible narrative templates');
    }
  }

  /**
   * Get a random narrative template from compatible ones
   */
  async getRandomTemplate(categoryName: string, difficulty: string): Promise<INarrativeTemplate | null> {
    try {
      const compatibleTemplates = await this.getCompatibleTemplates(categoryName, difficulty);
      if (compatibleTemplates.length === 0) {
        return null;
      }
      
      // Weight selection by priority
      const weightedTemplates = compatibleTemplates.flatMap(template => 
        Array(template.priority).fill(template)
      );
      
      const randomIndex = Math.floor(Math.random() * weightedTemplates.length);
      return weightedTemplates[randomIndex];
    } catch (error) {
      console.error('Error getting random template:', error);
      return null;
    }
  }

  /**
   * Get a narrative template by ID
   */
  async getTemplateById(id: string): Promise<INarrativeTemplate | null> {
    try {
      const model = await this.getModel();
      return await model.findOne({ id, isActive: true });
    } catch (error) {
      console.error('Error fetching template by ID:', error);
      return null;
    }
  }

  /**
   * Create a new narrative template
   */
  async createTemplate(templateData: Partial<INarrativeTemplate>): Promise<INarrativeTemplate> {
    try {
      const model = await this.getModel();
      const template = new model(templateData);
      return await template.save();
    } catch (error) {
      console.error('Error creating narrative template:', error);
      throw new Error('Failed to create narrative template');
    }
  }

  /**
   * Update a narrative template
   */
  async updateTemplate(id: string, updates: Partial<INarrativeTemplate>): Promise<INarrativeTemplate | null> {
    try {
      const model = await this.getModel();
      return await model.findOneAndUpdate(
        { id },
        { ...updates, updatedAt: new Date() },
        { new: true }
      );
    } catch (error) {
      console.error('Error updating narrative template:', error);
      throw new Error('Failed to update narrative template');
    }
  }

  /**
   * Deactivate a narrative template (soft delete)
   */
  async deactivateTemplate(id: string): Promise<boolean> {
    try {
      const model = await this.getModel();
      const result = await model.updateOne(
        { id },
        { isActive: false, updatedAt: new Date() }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error deactivating narrative template:', error);
      return false;
    }
  }

  /**
   * Get templates by type
   */
  async getTemplatesByType(type: string): Promise<INarrativeTemplate[]> {
    try {
      const model = await this.getModel();
      return await model.find({ type, isActive: true }).sort({ priority: -1, name: 1 });
    } catch (error) {
      console.error('Error fetching templates by type:', error);
      throw new Error('Failed to fetch templates by type');
    }
  }

  /**
   * Seed initial narrative templates
   */
  async seedTemplates(): Promise<void> {
    try {
      const model = await this.getModel();
      const existingCount = await model.countDocuments();
      
      if (existingCount > 0) {
        console.log('📝 Narrative templates already exist, skipping seed');
        return;
      }

      console.log('🌱 Seeding narrative templates...');
      await this.createInitialTemplates();
      console.log('✅ Narrative templates seeded successfully');
    } catch (error) {
      console.error('Error seeding narrative templates:', error);
      throw new Error('Failed to seed narrative templates');
    }
  }

  private async createInitialTemplates(): Promise<void> {
    const templates = this.getInitialTemplateData();
    const model = await this.getModel();
    
    for (const template of templates) {
      await model.create(template);
    }
  }

  private getInitialTemplateData() {
    return [
      {
        id: 'problem-solution-developer',
        name: 'Developer Problem-Solution Story',
        description: 'A narrative that starts with a relatable developer problem and walks through the solution journey',
        type: 'problem-solution',
        structure: {
          sections: [
            {
              name: 'The Problem Hook',
              purpose: 'Open with a relatable developer frustration or challenge',
              techniques: ['personal anecdote', 'shared pain point', 'statistics'],
              hooks: [
                'Ever spent hours debugging something that should have taken minutes?',
                'Picture this: it\'s Friday afternoon, your code was working perfectly, and then...',
                'We\'ve all been there - staring at an error message that makes no sense'
              ],
              transitions: [
                'Sound familiar?',
                'If you\'ve felt this frustration, you\'re not alone',
                'I\'ve been in your shoes'
              ],
              humanElements: [
                'Share the emotional impact of the problem',
                'Acknowledge the reader\'s potential frustration',
                'Use inclusive language like "we" and "us"'
              ]
            },
            {
              name: 'Why This Matters',
              purpose: 'Explain the real-world impact and importance of solving this problem',
              techniques: ['cost analysis', 'productivity impact', 'team implications'],
              hooks: [
                'The hidden cost of this problem might surprise you',
                'Here\'s what this really means for your project timeline',
                'This isn\'t just about code - it\'s about sanity'
              ],
              transitions: [
                'Let me put this in perspective',
                'Here\'s the bigger picture',
                'The real impact goes beyond just the technical side'
              ],
              humanElements: [
                'Connect to broader developer experience',
                'Mention team dynamics and collaboration',
                'Reference career growth and learning'
              ]
            },
            {
              name: 'The Discovery Journey',
              purpose: 'Walk through how the solution was discovered or researched',
              techniques: ['trial and error', 'research process', 'eureka moments'],
              hooks: [
                'After trying everything in Stack Overflow...',
                'The breakthrough came when I realized...',
                'Sometimes the solution is hiding in plain sight'
              ],
              transitions: [
                'That\'s when I discovered',
                'The game-changer was',
                'Everything clicked when'
              ],
              humanElements: [
                'Share the learning process honestly',
                'Include failed attempts and wrong turns',
                'Celebrate the "aha!" moment'
              ]
            },
            {
              name: 'The Solution in Action',
              purpose: 'Present the practical solution with code and implementation details',
              techniques: ['step-by-step implementation', 'code examples', 'best practices'],
              hooks: [
                'Here\'s the solution that saved my sanity',
                'This approach changed everything',
                'The implementation is simpler than you might think'
              ],
              transitions: [
                'Let\'s dive into the implementation',
                'Here\'s how to make this work',
                'Time to roll up our sleeves'
              ],
              humanElements: [
                'Acknowledge complexity where it exists',
                'Provide encouragement during difficult parts',
                'Share personal insights from implementation'
              ]
            },
            {
              name: 'Lessons and Next Steps',
              purpose: 'Share key takeaways and guide readers on their next actions',
              techniques: ['key insights', 'common pitfalls', 'future considerations'],
              hooks: [
                'If I could go back and tell my past self one thing...',
                'The most important lesson from this experience',
                'Here\'s what I wish I knew before starting'
              ],
              transitions: [
                'Looking back on this journey',
                'The key takeaway is',
                'Moving forward, remember'
              ],
              humanElements: [
                'Connect back to the reader\'s journey',
                'Encourage continued learning',
                'Build confidence for tackling similar problems'
              ]
            }
          ],
          narrativeFlow: [
            'Hook with relatable problem',
            'Build empathy and connection',
            'Establish the stakes',
            'Share the discovery journey',
            'Present the solution',
            'Empower the reader'
          ]
        },
        personalityProfile: {
          tone: 'conversational and encouraging',
          perspective: 'experienced developer who remembers being a beginner',
          experienceLevel: 'senior developer with battle scars',
          communicationStyle: 'friendly mentor sharing hard-won knowledge',
          conversationalPhrases: [
            'Let me be honest with you',
            'Here\'s the thing nobody tells you',
            'I wish someone had told me this earlier',
            'Trust me on this one',
            'Between you and me'
          ],
          personalExamples: [
            'In my last project, we ran into exactly this issue...',
            'I remember when our team faced this same problem...',
            'A colleague once showed me this trick...',
            'After making this mistake myself...',
            'When I was learning this concept...'
          ],
          relatableAnalogies: [
            'Think of it like organizing your closet - everything needs a place',
            'It\'s like cooking - you need the right ingredients in the right order',
            'Imagine you\'re building with LEGO blocks...',
            'It\'s similar to planning a road trip...',
            'Picture debugging like being a detective...'
          ]
        },
        humanizationTechniques: {
          openingHooks: [
            'Start with a frustrating scenario',
            'Use a surprising statistic',
            'Begin with a confession or mistake',
            'Open with a relatable question'
          ],
          conversationalElements: [
            'Use rhetorical questions throughout',
            'Include parenthetical thoughts',
            'Add occasional humor (professional)',
            'Use second person (you/your) frequently'
          ],
          personalTouches: [
            'Share a relevant mistake or learning moment',
            'Include what surprised you during learning',
            'Mention tools or resources that helped you',
            'Reference real projects or experiences'
          ],
          emotionalConnections: [
            'Acknowledge the frustration of debugging',
            'Celebrate small victories along the way',
            'Recognize the satisfaction of solving problems',
            'Connect to the joy of learning new things'
          ]
        },
        difficulty: 'all',
        categoryCompatibility: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Web Development', 'Programming'],
        isActive: true,
        priority: 3
      },
      {
        id: 'tutorial-journey-guide',
        name: 'Learning Journey Tutorial',
        description: 'A tutorial that feels like a guided learning journey with a mentor',
        type: 'tutorial',
        structure: {
          sections: [
            {
              name: 'Setting the Stage',
              purpose: 'Create context and set expectations for the learning journey',
              techniques: ['goal setting', 'motivation building', 'expectation management'],
              hooks: [
                'Ready to level up your skills?',
                'By the end of this guide, you\'ll be able to...',
                'This tutorial will take you from confused to confident'
              ],
              transitions: [
                'Let\'s start this journey together',
                'Here\'s what we\'re going to build',
                'Our destination is'
              ],
              humanElements: [
                'Acknowledge the learning challenge',
                'Build excitement about the outcome',
                'Set realistic expectations'
              ]
            },
            {
              name: 'Foundation Building',
              purpose: 'Establish necessary background knowledge and setup',
              techniques: ['prerequisite check', 'environment setup', 'basic concepts'],
              hooks: [
                'Before we dive in, let\'s make sure we\'re on the same page',
                'Think of this as laying the foundation for a house',
                'These basics will save you headaches later'
              ],
              transitions: [
                'Now that we have our foundation',
                'With these basics in place',
                'Ready to build on this knowledge?'
              ],
              humanElements: [
                'Reassure about the necessity of fundamentals',
                'Connect to real-world applications',
                'Encourage patience with the process'
              ]
            },
            {
              name: 'Progressive Discovery',
              purpose: 'Introduce concepts progressively with hands-on practice',
              techniques: ['incremental learning', 'practice exercises', 'concept building'],
              hooks: [
                'Here\'s where things get interesting',
                'Time to get our hands dirty',
                'Let\'s see this concept in action'
              ],
              transitions: [
                'Building on what we just learned',
                'The next piece of the puzzle is',
                'Now let\'s add another layer'
              ],
              humanElements: [
                'Celebrate progress at each step',
                'Acknowledge when things get challenging',
                'Provide encouragement during difficult concepts'
              ]
            },
            {
              name: 'Integration and Practice',
              purpose: 'Combine learned concepts into practical applications',
              techniques: ['project building', 'real-world scenarios', 'problem solving'],
              hooks: [
                'Time to put it all together',
                'Here\'s where everything clicks',
                'Let\'s build something real'
              ],
              transitions: [
                'Combining everything we\'ve learned',
                'This is where practice meets theory',
                'Watch how these concepts work together'
              ],
              humanElements: [
                'Acknowledge the complexity of integration',
                'Celebrate the achievement of building something real',
                'Connect to professional development goals'
              ]
            },
            {
              name: 'Mastery and Beyond',
              purpose: 'Reinforce learning and provide paths for continued growth',
              techniques: ['knowledge reinforcement', 'advanced topics preview', 'next steps'],
              hooks: [
                'Look how far you\'ve come!',
                'You\'re now equipped to tackle...',
                'The journey doesn\'t end here'
              ],
              transitions: [
                'Reflecting on what you\'ve accomplished',
                'Looking ahead to your next challenge',
                'Armed with this knowledge'
              ],
              humanElements: [
                'Celebrate the learning achievement',
                'Build confidence for future challenges',
                'Connect to continued learning journey'
              ]
            }
          ],
          narrativeFlow: [
            'Build excitement and context',
            'Establish solid foundations',
            'Progress through concepts systematically',
            'Apply knowledge practically',
            'Celebrate mastery and inspire continuation'
          ]
        },
        personalityProfile: {
          tone: 'encouraging and patient',
          perspective: 'experienced mentor guiding a protégé',
          experienceLevel: 'teacher with deep understanding of learning challenges',
          communicationStyle: 'patient instructor who remembers what it\'s like to learn',
          conversationalPhrases: [
            'Don\'t worry if this seems overwhelming at first',
            'You\'re doing great - this part trips everyone up',
            'Take your time with this concept',
            'It\'s okay to go back and review',
            'Every expert was once a beginner'
          ],
          personalExamples: [
            'When I was learning this, I made the same mistake...',
            'My students often ask about this exact point...',
            'I\'ve seen many developers struggle with this concept...',
            'After teaching this for years, I\'ve found...',
            'The most common question I get is...'
          ],
          relatableAnalogies: [
            'Learning this is like learning to ride a bike...',
            'Think of code architecture like city planning...',
            'Debugging is like being a medical detective...',
            'Writing clean code is like writing a clear recipe...',
            'Version control is like having a time machine...'
          ]
        },
        humanizationTechniques: {
          openingHooks: [
            'Build excitement about learning outcomes',
            'Connect to career advancement goals',
            'Share the satisfaction of mastering new skills',
            'Reference the empowerment of understanding'
          ],
          conversationalElements: [
            'Check in with reader understanding regularly',
            'Acknowledge when concepts are challenging',
            'Provide reassurance and encouragement',
            'Use inclusive learning language'
          ],
          personalTouches: [
            'Share teaching experiences and insights',
            'Include common student questions and concerns',
            'Reference learning milestones and celebrations',
            'Connect to broader educational philosophy'
          ],
          emotionalConnections: [
            'Acknowledge the vulnerability of learning',
            'Celebrate breakthrough moments',
            'Recognize the courage to try new things',
            'Connect to the pride of accomplishment'
          ]
        },
        difficulty: 'all',
        categoryCompatibility: ['all'],
        isActive: true,
        priority: 2
      },
      {
        id: 'case-study-analysis',
        name: 'Real-World Case Study',
        description: 'A detailed analysis of real-world implementation with lessons learned',
        type: 'case-study',
        structure: {
          sections: [
            {
              name: 'The Challenge Unveiled',
              purpose: 'Present a real-world scenario that required a technical solution',
              techniques: ['scenario description', 'stakeholder analysis', 'constraint identification'],
              hooks: [
                'When the CEO walked into our dev room at 9 PM...',
                'The notification that broke our production server...',
                'Sometimes the best learning comes from near disasters'
              ],
              transitions: [
                'Here\'s what we were dealing with',
                'The situation was more complex than it appeared',
                'Let me paint the full picture'
              ],
              humanElements: [
                'Describe the pressure and stakes involved',
                'Include the human cost of the problem',
                'Show the team dynamics at play'
              ]
            },
            {
              name: 'Investigation and Discovery',
              purpose: 'Detail the process of understanding and diagnosing the problem',
              techniques: ['root cause analysis', 'data gathering', 'hypothesis testing'],
              hooks: [
                'The first clue came from an unexpected place...',
                'Our assumptions were completely wrong',
                'The real problem was hiding beneath the surface'
              ],
              transitions: [
                'As we dug deeper',
                'The investigation revealed',
                'Pattern recognition led us to'
              ],
              humanElements: [
                'Share the detective work and collaboration',
                'Include false starts and wrong turns',
                'Highlight team problem-solving dynamics'
              ]
            },
            {
              name: 'Solution Architecture',
              purpose: 'Explain the chosen solution and implementation approach',
              techniques: ['design decisions', 'trade-off analysis', 'implementation strategy'],
              hooks: [
                'The solution we chose surprised everyone',
                'Sometimes the best approach is the simplest one',
                'We had to think outside the conventional wisdom'
              ],
              transitions: [
                'Our approach was to',
                'The key insight that shaped our solution',
                'We decided to take a different path'
              ],
              humanElements: [
                'Explain the human factors in decision-making',
                'Include discussions and debates within the team',
                'Show how constraints shaped creativity'
              ]
            },
            {
              name: 'Implementation Reality',
              purpose: 'Share the actual implementation with real challenges and adaptations',
              techniques: ['development process', 'obstacle handling', 'iterative improvement'],
              hooks: [
                'Implementation never goes exactly as planned',
                'The first version taught us more than we expected',
                'Reality has a way of humbling your best designs'
              ],
              transitions: [
                'As we built this solution',
                'The implementation phase revealed',
                'Working through the actual code showed us'
              ],
              humanElements: [
                'Share the human side of development struggles',
                'Include team learning and adaptation',
                'Show how problems became opportunities'
              ]
            },
            {
              name: 'Results and Reflection',
              purpose: 'Analyze outcomes and extract actionable lessons',
              techniques: ['impact measurement', 'lesson extraction', 'future applications'],
              hooks: [
                'Six months later, here\'s what we learned',
                'The results exceeded our expectations',
                'If we had to do it again, here\'s what we\'d change'
              ],
              transitions: [
                'Looking back on this experience',
                'The biggest takeaway was',
                'What this taught us about'
              ],
              humanElements: [
                'Reflect on personal and team growth',
                'Share the satisfaction of solving real problems',
                'Connect to broader professional development'
              ]
            }
          ],
          narrativeFlow: [
            'Set the stage with real stakes',
            'Share the journey of discovery',
            'Explain the solution with context',
            'Show real implementation challenges',
            'Extract lasting wisdom'
          ]
        },
        personalityProfile: {
          tone: 'reflective and analytical',
          perspective: 'seasoned professional sharing war stories',
          experienceLevel: 'battle-tested engineer with perspective',
          communicationStyle: 'thoughtful storyteller extracting wisdom from experience',
          conversationalPhrases: [
            'Looking back, I realize',
            'What we didn\'t anticipate was',
            'The lesson here is clear',
            'If I were to do this again',
            'This experience taught me'
          ],
          personalExamples: [
            'In our production environment, we discovered...',
            'Our team\'s approach to this problem was...',
            'The client\'s reaction when we deployed...',
            'After six months of using this solution...',
            'When we presented this to stakeholders...'
          ],
          relatableAnalogies: [
            'Building this was like renovating a house while living in it...',
            'Debugging production issues is like surgery on a moving patient...',
            'Scaling architecture is like expanding a city\'s infrastructure...',
            'Code refactoring is like organizing a library...',
            'Team coordination is like conducting an orchestra...'
          ]
        },
        humanizationTechniques: {
          openingHooks: [
            'Start with a dramatic moment or crisis',
            'Begin with an unexpected discovery',
            'Open with a surprising outcome',
            'Start with a moment of realization'
          ],
          conversationalElements: [
            'Include internal team discussions',
            'Share decision-making processes',
            'Reveal behind-the-scenes challenges',
            'Show the human side of technical work'
          ],
          personalTouches: [
            'Share specific moments of insight',
            'Include collaborative problem-solving stories',
            'Reference client or user reactions',
            'Connect to professional growth moments'
          ],
          emotionalConnections: [
            'Acknowledge the stress of real-world pressure',
            'Celebrate collaborative problem-solving',
            'Recognize the satisfaction of delivering solutions',
            'Connect to the pride of professional growth'
          ]
        },
        difficulty: 'intermediate',
        categoryCompatibility: ['all'],
        isActive: true,
        priority: 2
      }
    ];
  }
}

// Export convenience functions for direct use
const narrativeTemplateService = NarrativeTemplateService.getInstance();

export const getNarrativeTemplates = () => narrativeTemplateService.getAllTemplates();
export const getNarrativeTemplateById = (id: string) => narrativeTemplateService.getTemplateById(id);
export const createNarrativeTemplate = (data: Partial<INarrativeTemplate>) => narrativeTemplateService.createTemplate(data);
export const updateNarrativeTemplate = (id: string, data: Partial<INarrativeTemplate>) => narrativeTemplateService.updateTemplate(id, data);
export const deleteNarrativeTemplate = (id: string) => narrativeTemplateService.deactivateTemplate(id);

export default NarrativeTemplateService;
