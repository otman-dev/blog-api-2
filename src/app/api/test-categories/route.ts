import { NextResponse } from 'next/server';
import { CategoryService } from '@/lib/categoryService';
import getCategoryModel from '@/models/Category';
import dbConnect from '@/lib/db/contentDb';

export async function GET() {
  try {
    console.log('🔍 Testing category creation...');
    
    // Connect to database manually
    const connection = await dbConnect();
    console.log(`📊 Connected to database: ${connection.name}`);
    
    // Try to list all collections
    if (connection.db) {
      const collections = await connection.db.listCollections().toArray();
      console.log(`📚 Collections in database: ${collections.map(c => c.name).join(', ')}`);
    }
    
    // Get Category model
    const CategoryModel = await getCategoryModel();
    console.log(`🔧 Category model collection name: ${CategoryModel.collection.name}`);
    
    // Test querying categories
    const existingCategories = await CategoryModel.find().lean();
    console.log(`📋 Existing categories count: ${existingCategories.length}`);
    console.log(`📋 Existing categories: ${existingCategories.map(c => c.name).join(', ')}`);
    
    // Test creating a category
    const categoryService = CategoryService.getInstance();
    const testCategoryName = "Test Category " + new Date().toISOString();
    
    console.log(`📝 Creating test category: ${testCategoryName}`);
    const categoryId = await categoryService.ensureCategoryExists(testCategoryName);
    console.log(`✅ Created test category with ID: ${categoryId}`);
    
    // Verify by querying again
    const updatedCategories = await CategoryModel.find().lean();
    console.log(`📋 Updated categories count: ${updatedCategories.length}`);
    
    // Find the created category
    const createdCategory = updatedCategories.find(c => c.name === testCategoryName);
    
    return NextResponse.json({
      success: true,
      database: connection.name,
      collections: connection.db ? await connection.db.listCollections().toArray().then(cols => cols.map(c => c.name)) : [],
      categoryModelCollection: CategoryModel.collection.name,
      existingCategoriesCount: existingCategories.length,
      existingCategories: existingCategories.map(c => ({name: c.name, id: c.id})),
      testCategory: {
        name: testCategoryName,
        id: categoryId
      },
      createdCategory: createdCategory,
      updatedCategoriesCount: updatedCategories.length
    });
  } catch (error) {
    console.error('❌ Error testing category creation:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to test category creation', 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
