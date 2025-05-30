import getGroqModelModel, { IGroqModel } from '@/models/GroqModel';
import dbConnect from './db/contentDb';
import { readFileSync } from 'fs';
import { join } from 'path';

export class GroqModelService {
  private static instance: GroqModelService;
  
  private constructor() {}

  public static getInstance(): GroqModelService {
    if (!GroqModelService.instance) {
      GroqModelService.instance = new GroqModelService();
    }
    return GroqModelService.instance;
  }

  /**
   * Seed the database with Groq models from the JSON file
   * This is used during initialization or when updating models
   */
  public async seedModelsFromFile(): Promise<void> {
    try {
      console.log('🌱 Seeding Groq models from file...');
      
      // Read models from the JSON file
      const modelsPath = join(process.cwd(), 'knowledge-base', 'models', 'groq-models.json');
      const fileModels = JSON.parse(readFileSync(modelsPath, 'utf-8'));
      
      console.log(`📄 Read ${fileModels.length} models from file`);
      
      // Connect to database
      await dbConnect();
      const GroqModelModel = await getGroqModelModel();
      
      // Get existing models from database
      const existingModels = await GroqModelModel.find();
      const existingIds = new Set(existingModels.map(model => model.id));
      
      console.log(`💾 Found ${existingModels.length} existing models in database`);
      
      // Insert new models
      let insertedCount = 0;
      let updatedCount = 0;
      
      for (const model of fileModels) {
        if (existingIds.has(model.id)) {
          // Update existing model
          await GroqModelModel.updateOne(
            { id: model.id },
            { $set: model }
          );
          updatedCount++;
        } else {
          // Insert new model
          await GroqModelModel.create(model);
          insertedCount++;
        }
      }
      
      console.log(`✅ Seeded Groq models: ${insertedCount} inserted, ${updatedCount} updated`);
    } catch (error) {
      console.error('❌ Error seeding Groq models:', error);
      throw error;
    }
  }

  /**
   * Get all Groq models from the database
   * @returns Array of Groq models
   */
  public async getAllModels(): Promise<IGroqModel[]> {
    try {
      await dbConnect();
      const GroqModelModel = await getGroqModelModel();
      return await GroqModelModel.find().lean();
    } catch (error) {
      console.error('❌ Error getting Groq models:', error);
      throw error;
    }
  }
  
  /**
   * Get models sorted by priority (lower numbers first)
   */
  public async getModelsByPriority(): Promise<IGroqModel[]> {
    try {
      await dbConnect();
      const GroqModelModel = await getGroqModelModel();
      return await GroqModelModel.find().sort({ priority: 1 }).lean();
    } catch (error) {
      console.error('❌ Error getting models by priority:', error);
      throw error;
    }
  }

  /**
   * Get a Groq model by ID
   * @param modelId The model ID
   * @returns The Groq model
   */
  public async getModelById(modelId: string): Promise<IGroqModel | null> {
    try {
      await dbConnect();
      const GroqModelModel = await getGroqModelModel();
      return await GroqModelModel.findOne({ id: modelId }).lean();
    } catch (error) {
      console.error(`❌ Error getting Groq model with ID ${modelId}:`, error);
      throw error;
    }
  }
}
