const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

async function checkCategories() {
  try {
    console.log('✅ Connecting to MongoDB (otman-blog database)...');
    await mongoose.connect(MONGODB_URI);
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(`📚 Collections in otman-blog database: ${collections.map(c => c.name).join(', ')}`);
    
    // Check if categories collection exists
    const categoriesCollection = db.collection('categories');
    const categoryCount = await categoriesCollection.countDocuments();
    console.log(`📊 Categories in database: ${categoryCount}`);
    
    if (categoryCount > 0) {
      // Get a sample category
      const sampleCategory = await categoriesCollection.findOne();
      console.log('\n📝 Sample category:');
      console.log(`  ID: ${sampleCategory.id || sampleCategory._id}`);
      console.log(`  Name: ${sampleCategory.name}`);
      console.log(`  Description: ${sampleCategory.description}`);
      
      // Get all categories
      const allCategories = await categoriesCollection.find().toArray();
      console.log('\n🏷️ All categories:');
      allCategories.forEach((cat, index) => {
        console.log(`  ${index + 1}. ${cat.name} (${cat.id || cat._id})`);
      });
    } else {
      console.log('⚠️ No categories found in database');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    console.log('🔌 Disconnecting from MongoDB...');
    await mongoose.disconnect();
  }
}

checkCategories();
