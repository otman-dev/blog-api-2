import mongoose, { Schema, Document, Model } from 'mongoose';
import adminDbConnect from '@/lib/db/adminDb';

export interface ITechTopic extends Document {
  id: string;
  topic: string;
  category: string;
  angle: string;
  keywords: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeToComplete: string;
  tools: string[];
}

const TechTopicSchema = new Schema<ITechTopic>(
  {
    id: {
      type: String,
      required: true,
      unique: true
    },
    topic: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    angle: {
      type: String,
      required: true
    },
    keywords: {
      type: [String],
      default: []
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate'
    },
    timeToComplete: {
      type: String,
      default: '30 minutes'
    },
    tools: {
      type: [String],
      default: []
    }
  },
  { 
    timestamps: true 
  }
);

// This ensures we don't create the model multiple times during hot reloads
export default async function getTechTopicModel(): Promise<Model<ITechTopic>> {
  const conn = await adminDbConnect();
  console.log(`🔄 Getting TechTopic model on connection: ${conn.name}`);
  
  // Try to get existing model from this connection
  try {
    if (conn.models.TechTopic) {
      console.log(`✅ Retrieved existing TechTopic model from connection`);
      return conn.models.TechTopic as Model<ITechTopic>;
    }
  } catch (error) {
    console.error(`⚠️ Error checking for existing TechTopic model:`, error);
  }
  
  // Create new model
  console.log(`🆕 Creating new TechTopic model on connection`);
  const model = conn.model<ITechTopic>('TechTopic', TechTopicSchema);
  console.log(`✅ Created TechTopic model with collection name: ${model.collection.name}`);
  
  return model;
}
