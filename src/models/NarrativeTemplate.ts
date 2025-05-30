import mongoose, { Schema, Document } from 'mongoose';

export interface IStorySection {
  name: string;
  purpose: string;
  techniques: string[];
  hooks: string[];
  transitions: string[];
  humanElements: string[];
}

export interface IPersonalityProfile {
  tone: string;
  perspective: string;
  experienceLevel: string;
  communicationStyle: string;
  conversationalPhrases: string[];
  personalExamples: string[];
  relatableAnalogies: string[];
}

export interface INarrativeTemplate extends Document {
  id: string;
  name: string;
  description: string;
  type: 'narrative' | 'problem-solution' | 'tutorial' | 'case-study' | 'comparison' | 'journey' | 'discovery';
  structure: {
    sections: IStorySection[];
    narrativeFlow: string[];
  };
  personalityProfile: IPersonalityProfile;
  humanizationTechniques: {
    openingHooks: string[];
    conversationalElements: string[];
    personalTouches: string[];
    emotionalConnections: string[];
  };
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'all';
  categoryCompatibility: string[]; // Compatible category names
  isActive: boolean;
  priority: number; // Higher number = higher priority for selection
  createdAt: Date;
  updatedAt: Date;
}

const StorySection = new Schema<IStorySection>({
  name: { type: String, required: true },
  purpose: { type: String, required: true },
  techniques: [{ type: String }],
  hooks: [{ type: String }],
  transitions: [{ type: String }],
  humanElements: [{ type: String }]
});

const PersonalityProfile = new Schema<IPersonalityProfile>({
  tone: { type: String, required: true },
  perspective: { type: String, required: true },
  experienceLevel: { type: String, required: true },
  communicationStyle: { type: String, required: true },
  conversationalPhrases: [{ type: String }],
  personalExamples: [{ type: String }],
  relatableAnalogies: [{ type: String }]
});

const NarrativeTemplateSchema = new Schema<INarrativeTemplate>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  type: { 
    type: String, 
    required: true, 
    enum: ['narrative', 'problem-solution', 'tutorial', 'case-study', 'comparison', 'journey', 'discovery']
  },
  structure: {
    sections: [StorySection],
    narrativeFlow: [{ type: String }]
  },
  personalityProfile: PersonalityProfile,
  humanizationTechniques: {
    openingHooks: [{ type: String }],
    conversationalElements: [{ type: String }],
    personalTouches: [{ type: String }],
    emotionalConnections: [{ type: String }]
  },
  difficulty: { 
    type: String, 
    required: true, 
    enum: ['beginner', 'intermediate', 'advanced', 'all'],
    default: 'all'
  },
  categoryCompatibility: [{ type: String }],
  isActive: { type: Boolean, default: true },
  priority: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
NarrativeTemplateSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default NarrativeTemplateSchema;
