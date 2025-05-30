/**
 * Seed script for narrative templates
 * Run this script to populate the database with initial narrative templates
 */

const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_ADMIN_URI;

if (!MONGODB_URI) {
  console.error('Error: MONGODB_ADMIN_URI environment variable is not set');
  process.exit(1);
}

// Narrative Template Schema (inline for seeding)
const NarrativeTemplateSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  type: { 
    type: String, 
    required: true, 
    enum: ['narrative', 'problem-solution', 'tutorial', 'case-study', 'comparison', 'journey', 'discovery']
  },
  structure: {
    sections: [{
      name: String,
      purpose: String,
      techniques: [String],
      hooks: [String],
      transitions: [String],
      humanElements: [String]
    }],
    narrativeFlow: [String]
  },
  personalityProfile: {
    tone: String,
    perspective: String,
    experienceLevel: String,
    communicationStyle: String,
    conversationalPhrases: [String],
    personalExamples: [String],
    relatableAnalogies: [String]
  },
  humanizationTechniques: {
    openingHooks: [String],
    conversationalElements: [String],
    personalTouches: [String],
    emotionalConnections: [String]
  },
  difficulty: { 
    type: String, 
    required: true, 
    enum: ['beginner', 'intermediate', 'advanced', 'all'],
    default: 'all'
  },
  categoryCompatibility: [String],
  isActive: { type: Boolean, default: true },
  priority: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

async function seedNarrativeTemplates() {
  console.log('🌱 Starting narrative templates seed...');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('📦 Connected to MongoDB');

    // Get or create the model
    const NarrativeTemplate = mongoose.models.NarrativeTemplate || 
      mongoose.model('NarrativeTemplate', NarrativeTemplateSchema);    // Check if templates already exist
    const existingCount = await NarrativeTemplate.countDocuments();
    if (existingCount > 0) {
      console.log('📝 Existing narrative templates found. Replacing with improved versions...');
      await NarrativeTemplate.deleteMany({});
      console.log('🗑️ Cleared existing templates');
    }

    // Create initial templates
    const templates = getInitialTemplateData();
    
    for (const template of templates) {
      await NarrativeTemplate.create(template);
      console.log(`  ✅ Created template: ${template.name}`);
    }
    
    // Verify the seed
    const finalCount = await NarrativeTemplate.countDocuments();
    console.log(`✅ Successfully seeded ${finalCount} narrative templates`);
    
    console.log('\n🎉 Narrative templates seed completed successfully!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding narrative templates:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

function getInitialTemplateData() {
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
          }
        ],
        narrativeFlow: [
          'Hook with relatable problem',
          'Build empathy and connection',
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
      categoryCompatibility: ['Frontend Engineering', 'API Design', 'Testing', 'DevOps & CI/CD'],
      isActive: true,
      priority: 3
    },
    {
      id: 'discovery-journey-explorer',
      name: 'Discovery Journey Explorer',
      description: 'An exploration narrative that takes readers on a journey of discovering new technologies or concepts',
      type: 'discovery',
      structure: {
        sections: [
          {
            name: 'The Curiosity Spark',
            purpose: 'Ignite curiosity about a new technology or approach',
            techniques: ['curiosity building', 'problem identification', 'future visioning'],
            hooks: [
              'What if I told you there\'s a better way to handle this?',
              'I stumbled upon something that completely changed how I think about...',
              'The other day, I discovered something that blew my mind'
            ],
            transitions: [
              'Let me show you what I found',
              'This discovery changed everything',
              'Here\'s where it gets interesting'
            ],
            humanElements: [
              'Share the excitement of discovery',
              'Express genuine curiosity and wonder',
              'Invite readers into the exploration mindset'
            ]
          },
          {
            name: 'The Exploration Adventure',
            purpose: 'Take readers through the discovery process with hands-on exploration',
            techniques: ['guided exploration', 'progressive revelation', 'interactive discovery'],
            hooks: [
              'Let\'s explore this together',
              'Time to roll up our sleeves and dig deeper',
              'The real magic happens when you try it yourself'
            ],
            transitions: [
              'Now let\'s see what happens when...',
              'The plot thickens as we discover...',
              'But wait, there\'s more'
            ],
            humanElements: [
              'Share moments of surprise and delight',
              'Acknowledge the thrill of learning',
              'Celebrate breakthrough moments together'
            ]
          }
        ],
        narrativeFlow: [
          'Spark curiosity and wonder',
          'Guide through discovery process',
          'Reveal key insights together',
          'Inspire continued exploration'
        ]
      },
      personalityProfile: {
        tone: 'enthusiastic and curious',
        perspective: 'passionate explorer sharing discoveries',
        experienceLevel: 'experienced developer with insatiable curiosity',
        communicationStyle: 'excited friend sharing cool discoveries',
        conversationalPhrases: [
          'You won\'t believe what I just figured out',
          'This is going to blow your mind',
          'I\'ve been experimenting with this and...',
          'The more I dig into this, the more fascinating it gets',
          'I had to share this discovery with you'
        ],
        personalExamples: [
          'Last week I was experimenting with...',
          'While building my side project, I discovered...',
          'I was reading about this new approach and...',
          'A fellow developer introduced me to...',
          'During a recent code review, I learned...'
        ],
        relatableAnalogies: [
          'It\'s like finding a secret passage in a familiar building',
          'Think of it as discovering a new route that cuts your commute in half',
          'It\'s like upgrading from a bicycle to a sports car',
          'Imagine finding the perfect tool you didn\'t know existed',
          'It\'s like discovering a cheat code for real life'
        ]
      },
      humanizationTechniques: {
        openingHooks: [
          'Share a moment of genuine surprise',
          'Express authentic excitement about discovery',
          'Connect to universal curiosity',
          'Use anticipation-building language'
        ],
        conversationalElements: [
          'Use exclamation points appropriately for excitement',
          'Include "aha!" moments and revelations',
          'Share the emotional journey of discovery',
          'Use collaborative language like "let\'s explore"'
        ],
        personalTouches: [
          'Share the actual discovery moment',
          'Include what led to the exploration',
          'Mention unexpected findings along the way',
          'Reference the impact on personal projects'
        ],
        emotionalConnections: [
          'Capture the thrill of discovery',
          'Acknowledge the satisfaction of understanding',
          'Celebrate the joy of learning something new',
          'Connect to the passion for continuous improvement'
        ]
      },
      difficulty: 'all',
      categoryCompatibility: ['Frontend Engineering', 'API Design', 'Cloud Architecture', 'Infrastructure'],
      isActive: true,
      priority: 4
    },
    {
      id: 'battle-tested-case-study',
      name: 'Battle-Tested Case Study',
      description: 'A real-world case study showcasing lessons learned from production challenges',
      type: 'case-study',
      structure: {
        sections: [
          {
            name: 'The War Story Setup',
            purpose: 'Set the scene with a real production challenge or project',
            techniques: ['context setting', 'stakes establishment', 'dramatic tension'],
            hooks: [
              'At 3 AM, our production server started throwing errors...',
              'It was supposed to be a simple feature addition. It wasn\'t.',
              'Sometimes the best lessons come from the biggest disasters'
            ],
            transitions: [
              'Here\'s what happened',
              'Let me paint the picture',
              'The situation was this'
            ],
            humanElements: [
              'Share the pressure and responsibility felt',
              'Acknowledge the human cost of technical decisions',
              'Express vulnerability about challenges faced'
            ]
          },
          {
            name: 'The Battle and Lessons',
            purpose: 'Walk through the challenge, solution, and key learnings',
            techniques: ['detailed analysis', 'lesson extraction', 'wisdom sharing'],
            hooks: [
              'Here\'s what we learned the hard way',
              'The solution wasn\'t what we expected',
              'If I could go back and do it again...'
            ],
            transitions: [
              'The key insight was',
              'What we discovered changed everything',
              'The real lesson here is'
            ],
            humanElements: [
              'Share the emotional journey of problem-solving',
              'Acknowledge team dynamics and collaboration',
              'Express gratitude for lessons learned'
            ]
          }
        ],
        narrativeFlow: [
          'Set dramatic context and stakes',
          'Navigate through the challenge',
          'Extract valuable lessons',
          'Apply wisdom to future scenarios'
        ]
      },
      personalityProfile: {
        tone: 'seasoned and reflective',
        perspective: 'battle-tested veteran sharing war stories',
        experienceLevel: 'senior developer with production scars',
        communicationStyle: 'wise mentor sharing hard-earned wisdom',
        conversationalPhrases: [
          'If there\'s one thing I\'ve learned...',
          'In hindsight, we should have...',
          'The mistake we made was thinking...',
          'What I wish I knew then was...',
          'The real kicker was when...'
        ],
        personalExamples: [
          'In our production environment, we discovered...',
          'During a critical deployment, we realized...',
          'While scaling our application, we hit a wall when...',
          'Our team learned the hard way that...',
          'A late-night debugging session taught us...'
        ],
        relatableAnalogies: [
          'It\'s like performing surgery while the patient is awake',
          'Think of it as rebuilding the airplane while flying',
          'It\'s like being a firefighter and detective simultaneously',
          'Imagine trying to change the tires on a moving car',
          'It\'s like conducting an orchestra during an earthquake'
        ]
      },
      humanizationTechniques: {
        openingHooks: [
          'Start with a high-stakes scenario',
          'Use dramatic but realistic situations',
          'Share moments of genuine concern or pressure',
          'Connect to universal professional experiences'
        ],
        conversationalElements: [
          'Include moments of uncertainty and doubt',
          'Share internal thought processes during crisis',
          'Use reflective and contemplative language',
          'Acknowledge mistakes and imperfect decisions'
        ],
        personalTouches: [
          'Share specific details from real experiences',
          'Include team member perspectives and contributions',
          'Reference actual metrics and business impact',
          'Mention personal growth from the experience'
        ],
        emotionalConnections: [
          'Acknowledge the stress of production issues',
          'Celebrate team resilience and problem-solving',
          'Recognize the satisfaction of overcoming challenges',
          'Connect to professional growth and maturity'
        ]
      },
      difficulty: 'intermediate',
      categoryCompatibility: ['DevOps & CI/CD', 'Database Engineering', 'Frontend Engineering', 'Security', 'Infrastructure'],
      isActive: true,
      priority: 5
    },
    {
      id: 'friendly-comparison-guide',
      name: 'Friendly Comparison Guide',
      description: 'A balanced comparison that helps readers make informed decisions without bias',
      type: 'comparison',
      structure: {
        sections: [
          {
            name: 'The Decision Dilemma',
            purpose: 'Present the comparison context and why the choice matters',
            techniques: ['context setting', 'decision framing', 'empathy building'],
            hooks: [
              'Choosing between X and Y? You\'re not alone in this dilemma',
              'I get asked this question at least once a week...',
              'The eternal debate: which one should you actually use?'
            ],
            transitions: [
              'Let\'s break this down together',
              'Here\'s my honest take on both',
              'I\'ve used both extensively, so let me share'
            ],
            humanElements: [
              'Acknowledge the difficulty of making decisions',
              'Express empathy for the choice paralysis',
              'Share the importance of making informed decisions'
            ]
          },
          {
            name: 'The Fair Comparison',
            purpose: 'Present balanced analysis with real-world context and recommendations',
            techniques: ['objective analysis', 'use case mapping', 'practical recommendations'],
            hooks: [
              'Here\'s what each excels at',
              'Let me give you the honest pros and cons',
              'The truth is, it depends on your specific situation'
            ],
            transitions: [
              'For your use case, consider this',
              'The deciding factor is usually',
              'My recommendation would be'
            ],
            humanElements: [
              'Share personal preferences and reasoning',
              'Acknowledge that there\'s no perfect solution',
              'Express confidence in reader\'s ability to choose'
            ]
          }
        ],
        narrativeFlow: [
          'Acknowledge the decision challenge',
          'Present fair and balanced analysis',
          'Provide contextual recommendations',
          'Empower confident decision making'
        ]
      },
      personalityProfile: {
        tone: 'balanced and helpful',
        perspective: 'experienced advisor who\'s tried everything',
        experienceLevel: 'polyglot developer with broad experience',
        communicationStyle: 'honest consultant providing unbiased advice',
        conversationalPhrases: [
          'In my experience with both...',
          'I\'ve seen teams succeed with either approach',
          'The honest truth is...',
          'If I had to pick one for my own project...',
          'Here\'s what I\'ve observed in practice'
        ],
        personalExamples: [
          'In our last project, we chose X because...',
          'I\'ve worked with teams that swear by Y...',
          'When consulting for different companies, I\'ve seen...',
          'My personal preference has evolved from...',
          'After using both in production environments...'
        ],
        relatableAnalogies: [
          'It\'s like choosing between a sports car and an SUV',
          'Think of it as picking the right tool for the job',
          'It\'s similar to choosing between a restaurant and cooking at home',
          'Like selecting the perfect hiking trail for your skill level',
          'It\'s like choosing between different workout routines'
        ]
      },
      humanizationTechniques: {
        openingHooks: [
          'Acknowledge the common decision struggle',
          'Express understanding of choice paralysis',
          'Share the desire to make the right choice',
          'Connect to professional growth considerations'
        ],
        conversationalElements: [
          'Use fair and balanced language throughout',
          'Acknowledge strengths of all options',
          'Avoid absolute statements or strong bias',
          'Include nuanced perspectives and trade-offs'
        ],
        personalTouches: [
          'Share evolution of personal preferences over time',
          'Include real project experiences and outcomes',
          'Reference team dynamics and organizational factors',
          'Mention lessons learned from different choices'
        ],
        emotionalConnections: [
          'Acknowledge the anxiety of making wrong choices',
          'Celebrate the wisdom that comes from experience',
          'Recognize that different solutions work for different people',
          'Connect to the confidence that comes from informed decisions'
        ]
      },
      difficulty: 'all',
      categoryCompatibility: ['Cloud Architecture', 'Infrastructure', 'API Architecture', 'Distributed Architecture'],
      isActive: true,
      priority: 4
    },
    {
      id: 'beginners-journey-guide',
      name: 'Beginner\'s Journey Guide',
      description: 'A gentle, encouraging journey designed specifically for those starting their coding adventure',
      type: 'journey',
      structure: {
        sections: [
          {
            name: 'Welcome to the Journey',
            purpose: 'Create a warm, welcoming environment for beginners',
            techniques: ['encouragement building', 'expectation setting', 'fear reduction'],
            hooks: [
              'Starting your coding journey? Welcome to the adventure!',
              'Every expert was once a beginner - including me',
              'You\'re about to embark on one of the most rewarding learning experiences'
            ],
            transitions: [
              'Let me be your guide on this journey',
              'Together, we\'ll take this step by step',
              'I\'ll be right here with you'
            ],
            humanElements: [
              'Acknowledge the courage it takes to start',
              'Express genuine excitement for their journey',
              'Share the universal nature of the learning experience'
            ]
          },
          {
            name: 'Building Confidence Through Practice',
            purpose: 'Guide beginners through practical exercises with plenty of encouragement',
            techniques: ['confidence building', 'hands-on practice', 'celebration of progress'],
            hooks: [
              'You\'re doing better than you think',
              'Look how far you\'ve come already!',
              'This next step is going to feel really good'
            ],
            transitions: [
              'Now let\'s build on that success',
              'Ready for the next exciting step?',
              'You\'ve got this - let\'s keep going'
            ],
            humanElements: [
              'Celebrate every small victory',
              'Acknowledge when things feel difficult',
              'Provide reassurance and perspective'
            ]
          }
        ],
        narrativeFlow: [
          'Welcome and encourage',
          'Build confidence through small wins',
          'Expand knowledge gradually',
          'Celebrate growth and progress'
        ]
      },
      personalityProfile: {
        tone: 'warm and encouraging',
        perspective: 'patient mentor who loves teaching beginners',
        experienceLevel: 'experienced teacher with beginner\'s mindset',
        communicationStyle: 'supportive coach cheering from the sidelines',
        conversationalPhrases: [
          'You\'re doing amazing!',
          'Don\'t worry - this confused me at first too',
          'Every developer has been exactly where you are',
          'I believe in you, and here\'s why...',
          'You\'ve got the most important skill: curiosity'
        ],
        personalExamples: [
          'When I was starting out, I remember feeling...',
          'My first programming teacher told me...',
          'I\'ve taught hundreds of beginners, and you know what they all have in common?',
          'The mistake I made when learning was...',
          'What I wish someone had told me on day one...'
        ],
        relatableAnalogies: [
          'Learning to code is like learning a new language',
          'Think of programming like following a recipe',
          'It\'s like learning to drive - scary at first, natural later',
          'Imagine coding as building with digital LEGO blocks',
          'It\'s like learning to play a musical instrument'
        ]
      },
      humanizationTechniques: {
        openingHooks: [
          'Acknowledge the bravery of starting something new',
          'Express genuine excitement about their potential',
          'Share the transformative power of coding',
          'Connect to universal learning experiences'
        ],
        conversationalElements: [
          'Use encouraging and supportive language',
          'Frequently check in on understanding',
          'Provide multiple explanations for complex concepts',
          'Use positive reinforcement throughout'
        ],
        personalTouches: [
          'Share personal learning struggles and breakthroughs',
          'Include stories of successful students',
          'Reference the joy of teaching and watching growth',
          'Connect to broader educational philosophy'
        ],
        emotionalConnections: [
          'Acknowledge the vulnerability of learning',
          'Celebrate courage to try new things',
          'Recognize the excitement of possibility',
          'Connect to the pride of achievement'
        ]
      },
      difficulty: 'beginner',
      categoryCompatibility: ['Frontend Engineering', 'API Design', 'WebAssembly', 'Testing'],
      isActive: true,
      priority: 5
    },
    {
      id: 'tech-storyteller-narrative',
      name: 'Tech Storyteller Narrative',
      description: 'A compelling story-driven approach that weaves technical concepts into engaging narratives',
      type: 'narrative',
      structure: {
        sections: [
          {
            name: 'The Story Hook',
            purpose: 'Open with a compelling story that draws readers in',
            techniques: ['story telling', 'character development', 'narrative tension'],
            hooks: [
              'Let me tell you a story about a developer named Sarah...',
              'Picture this: a small startup, tight deadline, impossible requirements',
              'It was the kind of bug that makes you question everything you know about programming'
            ],
            transitions: [
              'But here\'s where the story gets interesting',
              'What happened next changed everything',
              'Little did they know, this was just the beginning'
            ],
            humanElements: [
              'Create relatable characters and situations',
              'Build emotional investment in the outcome',
              'Use narrative tension to maintain engagement'
            ]
          },
          {
            name: 'The Technical Journey',
            purpose: 'Weave technical content seamlessly into the story narrative',
            techniques: ['technical storytelling', 'concept integration', 'story resolution'],
            hooks: [
              'Here\'s where the technical magic happened',
              'The solution was elegant in its simplicity',
              'What our hero discovered changed the game'
            ],
            transitions: [
              'As the pieces fell into place',
              'The breakthrough moment came when',
              'And that\'s when everything clicked'
            ],
            humanElements: [
              'Maintain character perspective throughout technical explanations',
              'Show the human impact of technical decisions',
              'Celebrate the satisfaction of problem solving'
            ]
          }
        ],
        narrativeFlow: [
          'Establish compelling characters and conflict',
          'Develop tension through technical challenges',
          'Reveal solutions through character actions',
          'Conclude with satisfaction and learning'
        ]
      },
      personalityProfile: {
        tone: 'engaging and dramatic',
        perspective: 'storyteller who sees drama in everyday development',
        experienceLevel: 'experienced developer with narrative flair',
        communicationStyle: 'captivating narrator bringing tech to life',
        conversationalPhrases: [
          'Here\'s where the plot thickens',
          'Little did our protagonist know...',
          'The twist in this story is...',
          'Against all odds, they discovered...',
          'And that\'s when the magic happened'
        ],
        personalExamples: [
          'I once worked with a team that faced this exact scenario...',
          'This reminds me of a project where we had to...',
          'The most dramatic debugging session I ever witnessed...',
          'There was this one time when everything went wrong, but then...',
          'I\'ll never forget the day we discovered...'
        ],
        relatableAnalogies: [
          'It\'s like a detective story, but with code',
          'Think of it as a hero\'s journey through technical challenges',
          'It\'s like watching a master chef work under pressure',
          'Imagine a puzzle where each piece reveals the bigger picture',
          'It\'s like watching an artist create a masterpiece'
        ]
      },
      humanizationTechniques: {
        openingHooks: [
          'Start with dramatic or intriguing scenarios',
          'Use character-driven opening lines',
          'Create immediate narrative tension',
          'Connect to universal human experiences'
        ],
        conversationalElements: [
          'Use narrative devices like foreshadowing',
          'Include dialogue and character interactions',
          'Build suspense around technical revelations',
          'Use descriptive and engaging language'
        ],
        personalTouches: [
          'Draw from real team dynamics and personalities',
          'Include authentic project pressures and constraints',
          'Reference actual breakthrough moments and celebrations',
          'Share the emotional journey of technical work'
        ],
        emotionalConnections: [
          'Create empathy for characters facing challenges',
          'Build anticipation for problem resolution',
          'Celebrate collective achievements and breakthroughs',
          'Connect to the drama inherent in creative problem-solving'
        ]
      },
      difficulty: 'all',
      categoryCompatibility: ['Platform Engineering', 'Resilience Engineering', 'Distributed Architecture', 'Infrastructure'],
      isActive: true,
      priority: 3
    }
  ];
}

// Run the seed function
seedNarrativeTemplates();
