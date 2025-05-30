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

  /**
   * Create a new Groq model
   * @param modelData The model data
   * @returns The created model
   */
  public async createModel(modelData: Partial<IGroqModel>): Promise<IGroqModel> {
    try {
      await dbConnect();
      const GroqModelModel = await getGroqModelModel();
      const model = new GroqModelModel(modelData);
      return await model.save();
    } catch (error) {
      console.error('❌ Error creating Groq model:', error);
      throw error;
    }
  }

  /**
   * Update a Groq model
   * @param modelId The model ID
   * @param updateData The data to update
   * @returns The updated model
   */
  public async updateModel(modelId: string, updateData: Partial<IGroqModel>): Promise<IGroqModel | null> {
    try {
      await dbConnect();
      const GroqModelModel = await getGroqModelModel();
      return await GroqModelModel.findOneAndUpdate(
        { id: modelId },
        { ...updateData, updatedAt: new Date() },
        { new: true }
      ).lean();
    } catch (error) {
      console.error(`❌ Error updating Groq model ${modelId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a Groq model
   * @param modelId The model ID
   * @returns Success boolean
   */
  public async deleteModel(modelId: string): Promise<boolean> {
    try {
      await dbConnect();
      const GroqModelModel = await getGroqModelModel();
      const result = await GroqModelModel.deleteOne({ id: modelId });
      return result.deletedCount > 0;
    } catch (error) {
      console.error(`❌ Error deleting Groq model ${modelId}:`, error);
      throw error;
    }
  }
}

// Export convenience functions for direct use
const groqModelService = GroqModelService.getInstance();

export const getGroqModels = () => groqModelService.getAllModels();
export const getGroqModelById = (id: string) => groqModelService.getModelById(id);
export const createGroqModel = (data: Partial<IGroqModel>) => groqModelService.createModel(data);
export const updateGroqModel = (id: string, data: Partial<IGroqModel>) => groqModelService.updateModel(id, data);
export const deleteGroqModel = (id: string) => groqModelService.deleteModel(id);
