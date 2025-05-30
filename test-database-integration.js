require('dotenv').config();
const mongoose = require('mongoose');

// Database connections
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_ADMIN_URI = process.env.MONGODB_ADMIN_URI;

async function testDatabaseCollections() {
  try {
    console.log('🧪 Testing database collections directly...\n');
    
    // Test otman-blog database (categories)
    console.log('📊 Testing otman-blog database (categories)...');
    const blogConn = await mongoose.createConnection(MONGODB_URI).asPromise();
    const categoriesCollection = blogConn.db.collection('categories');
    const categoryCount = await categoriesCollection.countDocuments();
    const sampleCategory = await categoriesCollection.findOne();
    
    console.log(`  Categories: ${categoryCount}`);
    console.log(`  Sample: ${sampleCategory?.name} (${sampleCategory?.id})`);
    await blogConn.close();
    
    // Test blog-api database (tech topics and groq models)
    console.log('\n📊 Testing blog-api database (tech topics & groq models)...');
    const adminConn = await mongoose.createConnection(MONGODB_ADMIN_URI).asPromise();
    
    const techTopicsCollection = adminConn.db.collection('techtopics');
    const topicCount = await techTopicsCollection.countDocuments();
    const sampleTopic = await techTopicsCollection.findOne();
    
    const groqModelsCollection = adminConn.db.collection('groqmodels');
    const modelCount = await groqModelsCollection.countDocuments();
    const sampleModel = await groqModelsCollection.findOne();
    
    console.log(`  Tech Topics: ${topicCount}`);
    console.log(`  Sample Topic: ${sampleTopic?.topic} (${sampleTopic?.id})`);
    console.log(`  Groq Models: ${modelCount}`);
    console.log(`  Sample Model: ${sampleModel?.name} (${sampleModel?.id})`);
    
    await adminConn.close();
    
    // Test data integration
    console.log('\n🔗 Testing data integration...');
    
    if (categoryCount > 0 && topicCount > 0 && modelCount > 0) {
      console.log('✅ All three collections have data and are accessible!');
      console.log('🎉 Database configuration is correct:');
      console.log(`   - Categories (${categoryCount}): otman-blog database`);
      console.log(`   - Tech Topics (${topicCount}): blog-api database`);
      console.log(`   - Groq Models (${modelCount}): blog-api database`);
      
      // Test category-topic matching
      const blogConn2 = await mongoose.createConnection(MONGODB_URI).asPromise();
      const adminConn2 = await mongoose.createConnection(MONGODB_ADMIN_URI).asPromise();
      
      const categories = await blogConn2.db.collection('categories').find().toArray();
      const topics = await adminConn2.db.collection('techtopics').find().toArray();
      
      console.log('\n🏷️ Category-Topic matching:');
      const categoryNames = categories.map(c => c.name);
      const topicCategories = [...new Set(topics.map(t => t.category))];
      
      console.log(`  Available categories: ${categoryNames.slice(0, 3).join(', ')}... (${categoryNames.length} total)`);
      console.log(`  Topic categories: ${topicCategories.slice(0, 3).join(', ')}... (${topicCategories.length} total)`);
      
      // Find matching categories
      const matches = categoryNames.filter(cat => topicCategories.includes(cat));
      console.log(`  Matching categories: ${matches.length}/${categoryNames.length}`);
      console.log(`  Examples: ${matches.slice(0, 3).join(', ')}`);
      
      await blogConn2.close();
      await adminConn2.close();
      
    } else {
      console.log('❌ One or more collections are empty!');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Test FAILED:', error);
    process.exit(1);
  }
}

testDatabaseCollections();
