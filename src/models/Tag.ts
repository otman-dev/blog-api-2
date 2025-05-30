import mongoose, { Schema, Document, Model } from 'mongoose';
import dbConnect from '@/lib/db/contentDb';

export interface ITag extends Document {
  id: string;
  name: string;
  description: string;
  slug: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

const TagSchema = new Schema<ITag>(
  {
    id: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true,
      unique: true
    },
    description: {
      type: String,
      required: true
    },
    slug: {
      type: String,
      required: true,
      unique: true
    },
    color: {
      type: String,
      default: '#3b82f6'
    }
  },
  { 
    timestamps: true 
  }
);

// This ensures we don't create the model multiple times during hot reloads
export default async function getTagModel(): Promise<Model<ITag>> {
  const conn = await dbConnect();
  console.log(`🔄 Getting Tag model on connection: ${conn.name}`);
  
  // Try to get existing model from this connection
  try {
    if (conn.models.Tag) {
      console.log(`✅ Retrieved existing Tag model from connection`);
      return conn.models.Tag as Model<ITag>;
    }
  } catch (error) {
    console.error(`⚠️ Error checking for existing Tag model:`, error);
  }
  
  // Create new model
  console.log(`🆕 Creating new Tag model on connection`);
  const model = conn.model<ITag>('Tag', TagSchema);
  console.log(`✅ Created Tag model with collection name: ${model.collection.name}`);
  
  return model;
}
