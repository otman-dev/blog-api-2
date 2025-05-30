import getTagModel from '@/models/Tag';
import dbConnect from './db/contentDb';

export class TagService {
  private static instance: TagService;
  
  private constructor() {}

  public static getInstance(): TagService {
    if (!TagService.instance) {
      TagService.instance = new TagService();
    }
    return TagService.instance;
  }

  /**
   * Ensures a tag exists in the database, based on the tag name
   * If it doesn't exist, it will be created
   * @param tagName The name of the tag
   * @returns The tag ID from the database
   */
  public async ensureTagExists(tagName: string): Promise<string> {
    try {
      console.log(`🔍 Checking if tag "${tagName}" exists in database...`);
      
      // Connect to database
      const connection = await dbConnect();
      console.log(`📊 Connected to database: ${connection.name}`);
      
      // Get Tag model
      const TagModel = await getTagModel();
      
      // Check if tag already exists in database
      const existingTag = await TagModel.findOne({ name: tagName });
      
      if (existingTag) {
        console.log(`✅ Tag "${tagName}" already exists in database with ID: ${existingTag.id}`);
        return existingTag.id;
      }
      
      console.log(`🆕 Tag "${tagName}" not found in database, will create it`);
      
      // Create a new tag
      const slug = this.generateSlug(tagName);
      const newTag = new TagModel({
        id: slug,
        name: tagName,
        description: `Articles related to ${tagName}`,
        slug: slug,
        color: this.getRandomColor()
      });
      
      console.log(`📝 About to save new tag:`, JSON.stringify(newTag.toObject()));
      
      try {
        const savedTag = await newTag.save();
        console.log(`✅ Created new tag "${tagName}" in database with ID: ${savedTag.id}`);
        return savedTag.id;
      } catch (saveError) {
        console.error(`❌ Error saving tag:`, saveError);
        throw saveError;
      }
    } catch (error) {
      console.error(`❌ Error ensuring tag "${tagName}" exists:`, error);
      throw error;
    }
  }
  
  /**
   * Ensures all tags from an array exist in the database
   * @param tagNames Array of tag names
   * @returns Array of tag IDs from the database
   */
  public async ensureTagsExist(tagNames: string[]): Promise<string[]> {
    const tagIds: string[] = [];
    
    for (const tagName of tagNames) {
      try {
        const tagId = await this.ensureTagExists(tagName);
        tagIds.push(tagId);
      } catch (error) {
        console.error(`Failed to process tag "${tagName}":`, error);
        // Continue with other tags even if one fails
      }
    }
    
    return tagIds;
  }
  
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')  // Remove special characters
      .replace(/[\s_]+/g, '-')    // Replace spaces and underscores with hyphens
      .replace(/-+/g, '-')       // Remove consecutive hyphens
      .trim();                   // Remove whitespace from both ends
  }
  
  private getRandomColor(): string {
    const colors = [
      '#3b82f6', // blue
      '#f97316', // orange
      '#10b981', // green
      '#8b5cf6', // purple
      '#ec4899', // pink
      '#14b8a6', // teal
      '#f59e0b', // amber
      '#ef4444', // red
      '#6366f1', // indigo
      '#84cc16'  // lime
    ];
    
    return colors[Math.floor(Math.random() * colors.length)];
  }
}
