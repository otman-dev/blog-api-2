import getTechTopicModel, { ITechTopic } from '@/models/TechTopic';
import dbConnect from './db/contentDb';
import { readFileSync } from 'fs';
import { join } from 'path';

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
   * Seed the database with tech topics from the JSON file
   * This is used during initialization or when updating topics
   */
  public async seedTopicsFromFile(): Promise<void> {
    try {
      console.log('🌱 Seeding tech topics from file...');
      
      // Read topics from the JSON file
      const topicsPath = join(process.cwd(), 'knowledge-base', 'topics', 'tech-topics.json');
      const fileTopics = JSON.parse(readFileSync(topicsPath, 'utf-8'));
      
      console.log(`📄 Read ${fileTopics.length} topics from file`);
      
      // Connect to database
      await dbConnect();
      const TechTopicModel = await getTechTopicModel();
      
      // Get existing topics from database
      const existingTopics = await TechTopicModel.find();
      const existingIds = new Set(existingTopics.map(topic => topic.id));
      
      console.log(`💾 Found ${existingTopics.length} existing topics in database`);
      
      // Insert new topics
      let insertedCount = 0;
      let updatedCount = 0;
      
      for (const topic of fileTopics) {
        if (existingIds.has(topic.id)) {
          // Update existing topic
          await TechTopicModel.updateOne(
            { id: topic.id },
            { $set: topic }
          );
          updatedCount++;
        } else {
          // Insert new topic
          await TechTopicModel.create(topic);
          insertedCount++;
        }
      }
      
      console.log(`✅ Seeded tech topics: ${insertedCount} inserted, ${updatedCount} updated`);
    } catch (error) {
      console.error('❌ Error seeding tech topics:', error);
      throw error;
    }
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
