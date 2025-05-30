import mongoose, { Schema, Document, Model } from 'mongoose';
import adminDbConnect from '@/lib/db/adminDb';

export interface IGroqModel extends Document {
  id: string;
  name: string;
  priority: number;
  tokensPerMinute: number;
  dailyLimit: string | number;
  bestFor: string[];
  temperature: number;
  maxTokens: number;
  createdAt: Date;
  updatedAt: Date;
}

const GroqModelSchema = new Schema<IGroqModel>(
  {
    id: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true
    },
    priority: {
      type: Number,
      required: true
    },
    tokensPerMinute: {
      type: Number,
      required: true
    },
    dailyLimit: {
      type: Schema.Types.Mixed, // String or Number
      required: true
    },
    bestFor: {
      type: [String],
      default: []
    },
    temperature: {
      type: Number,
      required: true
    },
    maxTokens: {
      type: Number,
      required: true
    }
  },
  { 
    timestamps: true 
  }
);

// This ensures we don't create the model multiple times during hot reloads
export default async function getGroqModelModel(): Promise<Model<IGroqModel>> {
  const conn = await adminDbConnect();
  console.log(`🔄 Getting GroqModel model on connection: ${conn.name}`);
  
  // Try to get existing model from this connection
  try {
    if (conn.models.GroqModel) {
      console.log(`✅ Retrieved existing GroqModel model from connection`);
      return conn.models.GroqModel as Model<IGroqModel>;
    }
  } catch (error) {
    console.error(`⚠️ Error checking for existing GroqModel model:`, error);
  }
  
  // Create new model
  console.log(`🆕 Creating new GroqModel model on connection`);
  const model = conn.model<IGroqModel>('GroqModel', GroqModelSchema);
  console.log(`✅ Created GroqModel model with collection name: ${model.collection.name}`);
  
  return model;
}
