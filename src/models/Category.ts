import mongoose, { Schema, Document, Model } from 'mongoose';
import dbConnect from '@/lib/db/contentDb';

export interface ICategory extends Document {
  id: string;
  name: string;
  description: string;
  slug: string;
  color: string;
  targetAudience?: string;
  contentStyle?: string;
  averageLength?: string;
  requiredSections?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
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
    },
    targetAudience: String,
    contentStyle: String,
    averageLength: String,
    requiredSections: [String],
  },
  { 
    timestamps: true 
  }
);

// This ensures we don't create the model multiple times during hot reloads
export default async function getCategoryModel(): Promise<Model<ICategory>> {
  const conn = await dbConnect();
  console.log(`🔄 Getting Category model on connection: ${conn.name}`);
  
  // Try to get existing model from this connection
  try {
    if (conn.models.Category) {
      console.log(`✅ Retrieved existing Category model from connection`);
      return conn.models.Category as Model<ICategory>;
    }
  } catch (error) {
    console.error(`⚠️ Error checking for existing Category model:`, error);
  }
  
  // Create new model
  console.log(`🆕 Creating new Category model on connection`);
  const model = conn.model<ICategory>('Category', CategorySchema);
  console.log(`✅ Created Category model with collection name: ${model.collection.name}`);
  
  return model;
}
