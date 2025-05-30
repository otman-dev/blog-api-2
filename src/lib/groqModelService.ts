import getGroqModelModel, { IGroqModel } from '@/models/GroqModel';
import dbConnect from './db/contentDb';

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
   * @deprecated Seed method is no longer used. Data is now managed directly in MongoDB.
   * This method is kept for backward compatibility but does nothing.
   */
  public async seedModelsFromFile(): Promise<void> {
    console.log('ℹ️ seedModelsFromFile() is deprecated - Groq models are now managed directly in MongoDB');
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
