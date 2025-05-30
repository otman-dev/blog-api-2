import getTechTopicModel, { ITechTopic } from '@/models/TechTopic';
import dbConnect from './db/contentDb';

export class TechTopicService {
  private static instance: TechTopicService;
  
  private constructor() {}

  public static getInstance(): TechTopicService {
    if (!TechTopicService.instance) {
      TechTopicService.instance = new TechTopicService();
    }
    return TechTopicService.instance;
  }
  /**
   * @deprecated Seed method is no longer used. Data is now managed directly in MongoDB.
   * This method is kept for backward compatibility but does nothing.
   */
  public async seedTopicsFromFile(): Promise<void> {
    console.log('ℹ️ seedTopicsFromFile() is deprecated - tech topics are now managed directly in MongoDB');
  }

  /**
   * Get all tech topics from the database
   * @returns Array of tech topics
   */
  public async getAllTopics(): Promise<ITechTopic[]> {
    try {
      await dbConnect();
      const TechTopicModel = await getTechTopicModel();
      return await TechTopicModel.find().lean();
    } catch (error) {
      console.error('❌ Error getting tech topics:', error);
      throw error;
    }
  }

  /**
   * Get a random tech topic from the database
   * @returns A random tech topic
   */
  public async getRandomTopic(): Promise<ITechTopic> {
    try {
      await dbConnect();
      const TechTopicModel = await getTechTopicModel();
      
      // Count total documents
      const count = await TechTopicModel.countDocuments();
      
      // Get a random document
      const random = Math.floor(Math.random() * count);
      const topic = await TechTopicModel.findOne().skip(random).lean();
      
      if (!topic) {
        throw new Error('No tech topics found in database');
      }
      
      return topic;
    } catch (error) {
      console.error('❌ Error getting random tech topic:', error);
      throw error;
    }
  }

  /**
   * Get tech topics by category
   * @param categoryName The category name
   * @returns Array of tech topics in the category
   */
  public async getTopicsByCategory(categoryName: string): Promise<ITechTopic[]> {
    try {
      await dbConnect();
      const TechTopicModel = await getTechTopicModel();
      return await TechTopicModel.find({ category: categoryName }).lean();
    } catch (error) {
      console.error(`❌ Error getting tech topics for category ${categoryName}:`, error);
      throw error;
    }
  }

  /**
   * Get a tech topic by ID
   * @param topicId The topic ID
   * @returns The tech topic
   */
  public async getTopicById(topicId: string): Promise<ITechTopic | null> {
    try {
      await dbConnect();
      const TechTopicModel = await getTechTopicModel();
      return await TechTopicModel.findOne({ id: topicId }).lean();
    } catch (error) {
      console.error(`❌ Error getting tech topic with ID ${topicId}:`, error);
      throw error;
    }
  }
}
