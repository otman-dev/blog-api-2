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
      mongoose.model('NarrativeTemplate', NarrativeTemplateSchema);

    // Check if templates already exist
    const existingCount = await NarrativeTemplate.countDocuments();
    if (existingCount > 0) {
      console.log('📝 Narrative templates already exist, skipping seed');
      await mongoose.disconnect();
      return;
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
          }
        ],
        narrativeFlow: [
          'Build excitement and context',
          'Progress through concepts systematically',
          'Apply knowledge practically',
          'Celebrate mastery'
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
    }
  ];
}

// Run the seed function
seedNarrativeTemplates();
