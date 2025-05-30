import getCategoryModel from '@/models/Category';
import dbConnect from './db/contentDb';
import { readFileSync } from 'fs';
import { join } from 'path';

export interface KBCategory {
  id: string;
  name: string;
  description: string;
  targetAudience?: string;
  contentStyle?: string;
  averageLength?: string;
  requiredSections?: string[];
}

export class CategoryService {
  private static instance: CategoryService;
  
  private constructor() {
    // No dependencies needed
  }

  public static getInstance(): CategoryService {
    if (!CategoryService.instance) {
      CategoryService.instance = new CategoryService();
    }
    return CategoryService.instance;
  }

  /**
   * Ensures a category exists in the database, based on the category name
   * If it doesn't exist, it will be created from the knowledge base data
   * @param categoryName The name of the category (e.g. "DevOps & CI/CD")
   * @returns The category ID from the database
   */  public async ensureCategoryExists(categoryName: string): Promise<string> {
    try {
      console.log(`🔍 Checking if category "${categoryName}" exists in database...`);
        // Connect to database
      const connection = await dbConnect();
      console.log(`📊 Connected to database: ${connection.name}`);
      if (connection.db) {
        const collections = await connection.db.listCollections().toArray();
        console.log(`📚 Collections in database: ${collections.map(c => c.name).join(', ')}`);
      }
      
      // Get Category model
      const CategoryModel = await getCategoryModel();
      console.log(`🔧 Category model collection name: ${CategoryModel.collection.name}`);
      
      // Check if category already exists in database
      const existingCategory = await CategoryModel.findOne({ name: categoryName });
      
      if (existingCategory) {
        console.log(`✅ Category "${categoryName}" already exists in database with ID: ${existingCategory.id}`);
        return existingCategory.id;
      }
        console.log(`🆕 Category "${categoryName}" not found in database, will create it`);
      
      // Category doesn't exist, find it in the knowledge base file
      const categoriesPath = join(process.cwd(), 'knowledge-base', 'categories', 'categories.json');
      const categoriesData = readFileSync(categoriesPath, 'utf-8');
      const allKbCategories = JSON.parse(categoriesData);
      console.log(`📚 Found ${allKbCategories.length} categories in knowledge base`);
      
      const kbCategory = allKbCategories.find((c: KBCategory) => c.name === categoryName);
      
      if (!kbCategory) {
        console.warn(`⚠️ Category "${categoryName}" not found in knowledge base, creating minimal version`);
        
        // Create a minimal category based on the name
        const slug = this.generateSlug(categoryName);
        const newCategory = new CategoryModel({
          id: slug,
          name: categoryName,
          description: `Articles related to ${categoryName}`,
          slug: slug,
          color: this.getRandomColor()
        });
        
        console.log(`📝 About to save minimal category:`, JSON.stringify(newCategory.toObject()));
        
        try {
          const savedCategory = await newCategory.save();
          console.log(`✅ Created new minimal category "${categoryName}" in database with ID: ${savedCategory.id}`);
          
          // Verify category was saved
          const checkCategory = await CategoryModel.findById(savedCategory._id);
          console.log(`🔍 Verification check result: ${checkCategory ? 'Category found' : 'Category not found'}`);
          
          return savedCategory.id;
        } catch (saveError) {
          console.error(`❌ Error saving minimal category:`, saveError);
          throw saveError;
        }
      }
      
      console.log(`🔍 Found category "${categoryName}" in knowledge base with ID: ${kbCategory.id}`);
      
      // Create category from knowledge base data
      const newCategory = new CategoryModel({
        id: kbCategory.id,
        name: kbCategory.name,
        description: kbCategory.description,
        slug: kbCategory.id,
        color: this.getColor(kbCategory) || this.getRandomColor(),
        targetAudience: kbCategory.targetAudience,
        contentStyle: kbCategory.contentStyle,
        averageLength: kbCategory.averageLength,
        requiredSections: kbCategory.requiredSections,
      });
      
      console.log(`📝 About to save category from knowledge base:`, JSON.stringify(newCategory.toObject()));
      
      try {
        const savedCategory = await newCategory.save();
        console.log(`✅ Created new category "${categoryName}" in database from knowledge base with ID: ${savedCategory.id}`);
        
        // Verify category was saved
        const checkCategory = await CategoryModel.findById(savedCategory._id);
        console.log(`🔍 Verification check result: ${checkCategory ? 'Category found' : 'Category not found'}`);
        
        return savedCategory.id;
      } catch (saveError) {
        console.error(`❌ Error saving category from knowledge base:`, saveError);
        throw saveError;
      }
    } catch (error) {
      console.error(`❌ Error ensuring category "${categoryName}" exists:`, error);
      throw error;
    }
  }
  
  /**
   * Ensures all categories from an array exist in the database
   * @param categoryNames Array of category names
   * @returns Array of category IDs from the database
   */
  public async ensureCategoriesExist(categoryNames: string[]): Promise<string[]> {
    const categoryIds: string[] = [];
    
    for (const categoryName of categoryNames) {
      try {
        const categoryId = await this.ensureCategoryExists(categoryName);
        categoryIds.push(categoryId);
      } catch (error) {
        console.error(`Failed to process category "${categoryName}":`, error);
        // Continue with other categories even if one fails
      }
    }
    
    return categoryIds;
  }
  
  /**
   * Seed the database with categories from the JSON file 
   * This is used during initialization or when updating categories
   */
  public async seedCategoriesFromFile(): Promise<void> {
    try {
      console.log('🌱 Seeding categories from file...');
      
      // Read categories from the JSON file
      const categoriesPath = join(process.cwd(), 'knowledge-base', 'categories', 'categories.json');
      const categoriesData = readFileSync(categoriesPath, 'utf-8');
      const fileCategories = JSON.parse(categoriesData);
      
      console.log(`📄 Read ${fileCategories.length} categories from file`);
      
      // Connect to database
      await dbConnect();
      const CategoryModel = await getCategoryModel();
      
      // Get existing categories from database
      const existingCategories = await CategoryModel.find();
      const existingIds = new Set(existingCategories.map(category => category.id));
      
      console.log(`💾 Found ${existingCategories.length} existing categories in database`);
      
      // Insert new categories
      let insertedCount = 0;
      let updatedCount = 0;
      
      for (const category of fileCategories) {
        // Ensure it has required fields
        const processedCategory = {
          ...category,
          description: category.description || `Category for ${category.name} content`,
          slug: category.slug || category.name.toLowerCase().replace(/\s+/g, '-'),
        };
        
        if (existingIds.has(category.id)) {
          // Update existing category
          await CategoryModel.updateOne(
            { id: category.id },
            { $set: processedCategory }
          );
          updatedCount++;
        } else {
          // Insert new category
          await CategoryModel.create(processedCategory);
          insertedCount++;
        }
      }
      
      console.log(`✅ Seeded categories: ${insertedCount} inserted, ${updatedCount} updated`);
    } catch (error) {
      console.error('❌ Error seeding categories:', error);
      throw error;
    }
  }

  /**
   * Get all categories from the database
   * @returns Array of categories
   */
  public async getAllCategories(): Promise<any[]> {
    try {
      await dbConnect();
      const CategoryModel = await getCategoryModel();
      return await CategoryModel.find().lean();
    } catch (error) {
      console.error('❌ Error getting all categories:', error);
      throw error;
    }
  }
  
  /**
   * Get a category by ID
   * @param categoryId The category ID
   * @returns The category or null if not found
   */
  public async getCategoryById(categoryId: string): Promise<any | null> {
    try {
      await dbConnect();
      const CategoryModel = await getCategoryModel();
      return await CategoryModel.findOne({ id: categoryId }).lean();
    } catch (error) {
      console.error(`❌ Error getting category with ID ${categoryId}:`, error);
      throw error;
    }
  }
  
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')  // Remove special characters
      .replace(/[\s_]+/g, '-')    // Replace spaces and underscores with hyphens
      .replace(/-+/g, '-')       // Remove consecutive hyphens
      .trim();                   // Remove whitespace from both ends
  }
  
  private getColor(category: KBCategory): string | undefined {
    // @ts-ignore - we added color in the categories.json file
    return category.color;
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
