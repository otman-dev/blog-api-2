/**
 * Script to verify category compatibility between narrative templates and database categories
 */

const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection strings
const MONGODB_URI = process.env.MONGODB_URI; // otman-blog database
const MONGODB_ADMIN_URI = process.env.MONGODB_ADMIN_URI; // blog-api database

if (!MONGODB_URI || !MONGODB_ADMIN_URI) {
  console.error('Error: MONGODB_URI and MONGODB_ADMIN_URI environment variables must be set');
  process.exit(1);
}

// Category Schema for otman-blog
const CategorySchema = new mongoose.Schema({
  name: String,
  slug: String,
  description: String,
}, { collection: 'categories' });

// Narrative Template Schema for blog-api
const NarrativeTemplateSchema = new mongoose.Schema({
  id: String,
  name: String,
  categoryCompatibility: [String],
  // ... other fields
});

async function verifyCategoryCompatibility() {
  console.log('🔍 Verifying category compatibility...');
  
  try {
    // Connect to otman-blog database
    const conn1 = await mongoose.createConnection(MONGODB_URI);
    console.log('📦 Connected to otman-blog database');
    
    const Category = conn1.model('Category', CategorySchema);
    const categories = await Category.find({}).select('name');
    const categoryNames = categories.map(cat => cat.name).filter(name => name);
    
    console.log(`\n📊 Found ${categoryNames.length} categories in otman-blog:`);
    categoryNames.forEach(name => console.log(`  - ${name}`));
    
    // Connect to blog-api database
    const conn2 = await mongoose.createConnection(MONGODB_ADMIN_URI);
    console.log('\n📦 Connected to blog-api database');
    
    const NarrativeTemplate = conn2.model('NarrativeTemplate', NarrativeTemplateSchema);
    const templates = await NarrativeTemplate.find({}).select('name categoryCompatibility');
    
    console.log(`\n📝 Found ${templates.length} narrative templates:`);
    
    let allValid = true;
    const allUsedCategories = new Set();
    
    templates.forEach(template => {
      console.log(`\n🎭 Template: ${template.name}`);
      console.log(`   Categories: ${template.categoryCompatibility.join(', ')}`);
      
      const invalidCategories = template.categoryCompatibility.filter(cat => !categoryNames.includes(cat));
      
      if (invalidCategories.length > 0) {
        console.log(`   ❌ Invalid categories: ${invalidCategories.join(', ')}`);
        allValid = false;
      } else {
        console.log(`   ✅ All categories valid`);
      }
      
      template.categoryCompatibility.forEach(cat => allUsedCategories.add(cat));
    });
    
    console.log(`\n📋 Summary:`);
    console.log(`   Total categories in database: ${categoryNames.length}`);
    console.log(`   Categories used in templates: ${allUsedCategories.size}`);
    console.log(`   Unused categories: ${categoryNames.filter(cat => !allUsedCategories.has(cat)).join(', ')}`);
    
    if (allValid) {
      console.log(`\n✅ All category compatibility is valid!`);
    } else {
      console.log(`\n❌ Some category compatibility issues found!`);
    }
    
    await conn1.close();
    await conn2.close();
    
  } catch (error) {
    console.error('❌ Error verifying categories:', error);
    process.exit(1);
  }
}

verifyCategoryCompatibility();
