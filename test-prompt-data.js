require('dotenv').config();
const mongoose = require('mongoose');

// Test the database collections directly
async function testDatabaseIntegration() {
  try {
    console.log('🧪 Testing database integration for prompt builder...\n');
    
    // Database URIs
    const MONGODB_URI = process.env.MONGODB_URI;
    const MONGODB_ADMIN_URI = process.env.MONGODB_ADMIN_URI;
    
    console.log('📊 Testing database connections...');
    
    // Test categories (otman-blog)
    console.log('1. Testing categories collection...');
    const blogConn = await mongoose.createConnection(MONGODB_URI).asPromise();
    const categories = await blogConn.db.collection('categories').find().toArray();
    console.log(`   ✅ Categories: ${categories.length} found`);
    console.log(`   📝 Sample: ${categories[0]?.name} (${categories[0]?.id})`);
    await blogConn.close();
    
    // Test tech topics and models (blog-api)
    console.log('\n2. Testing tech topics and groq models...');
    const adminConn = await mongoose.createConnection(MONGODB_ADMIN_URI).asPromise();
    
    const topics = await adminConn.db.collection('techtopics').find().toArray();
    console.log(`   ✅ Tech topics: ${topics.length} found`);
    console.log(`   📝 Sample: ${topics[0]?.topic?.substring(0, 60)}...`);
    console.log(`   🏷️  Category: ${topics[0]?.category}`);
    
    const models = await adminConn.db.collection('groqmodels').find().sort({ priority: 1 }).toArray();
    console.log(`   ✅ Groq models: ${models.length} found`);
    console.log(`   📝 Primary model: ${models[0]?.name} (Priority: ${models[0]?.priority})`);
    
    await adminConn.close();
    
    // Test data relationships
    console.log('\n3. Testing data relationships...');
    const topicCategories = [...new Set(topics.map(t => t.category))];
    const categoryNames = categories.map(c => c.name);
    
    console.log(`   📚 Available categories: ${categoryNames.length}`);
    console.log(`   🎯 Topic categories: ${topicCategories.length}`);
    
    // Find exact matches
    const exactMatches = categoryNames.filter(cat => topicCategories.includes(cat));
    console.log(`   ✅ Exact matches: ${exactMatches.length}`);
    console.log(`   📋 Examples: ${exactMatches.slice(0, 3).join(', ')}`);
    
    // Test topic selection simulation
    console.log('\n4. Testing topic selection simulation...');
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    const matchingCategory = categories.find(c => c.name === randomTopic.category);
    
    console.log(`   🎲 Random topic: ${randomTopic.topic.substring(0, 50)}...`);
    console.log(`   🏷️  Topic category: ${randomTopic.category}`);
    console.log(`   🔍 Matching category: ${matchingCategory ? 'Found' : 'Not found'}`);
    
    if (matchingCategory) {
      console.log(`   ✅ Category match: ${matchingCategory.name} (${matchingCategory.id})`);
    }
    
    // Summary
    console.log('\n📊 Integration Summary:');
    console.log(`   ✅ Categories: ${categories.length} from otman-blog database`);
    console.log(`   ✅ Tech Topics: ${topics.length} from blog-api database`);  
    console.log(`   ✅ Groq Models: ${models.length} from blog-api database`);
    console.log(`   ✅ Category-Topic matches: ${exactMatches.length}/${categoryNames.length}`);
    
    if (categories.length > 0 && topics.length > 0 && models.length > 0 && exactMatches.length > 0) {
      console.log('\n🎉 Database integration is READY for prompt builder!');
      console.log('   All collections are properly populated and connected');
    } else {
      console.log('\n⚠️  Some issues detected that might affect prompt generation');
    }
    
  } catch (error) {
    console.error('❌ Error testing database integration:', error);
  }
}

testDatabaseIntegration();
