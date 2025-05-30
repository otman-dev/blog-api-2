/**
 * Script to check categories in otman-blog database
 */

const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection string for otman-blog database
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI environment variable is not set');
  process.exit(1);
}

// Category Schema (basic for reading)
const CategorySchema = new mongoose.Schema({
  name: String,
  slug: String,
  description: String,
  // Add other fields as they exist in the database
}, { collection: 'categories' });

async function checkCategories() {
  console.log('🔍 Checking categories in otman-blog database...');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('📦 Connected to MongoDB (otman-blog)');

    // Get the Category model
    const Category = mongoose.model('Category', CategorySchema);
    
    // Find all categories
    const categories = await Category.find({}).select('name slug description');
    
    console.log(`\n📊 Found ${categories.length} categories:`);
    console.log('=====================================');
    
    categories.forEach((category, index) => {
      console.log(`${index + 1}. Name: "${category.name}"`);
      if (category.slug) console.log(`   Slug: "${category.slug}"`);
      if (category.description) console.log(`   Description: "${category.description}"`);
      console.log('---');
    });
    
    // Extract just the names for easy reference
    const categoryNames = categories.map(cat => cat.name).filter(name => name);
    console.log('\n📝 Category names for reference:');
    console.log(JSON.stringify(categoryNames, null, 2));
    
    await mongoose.disconnect();
    console.log('\n✅ Check completed');
    
  } catch (error) {
    console.error('❌ Error checking categories:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

checkCategories();
