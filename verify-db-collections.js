// Script to test accessing both tech topics and Groq models from the database
require('dotenv').config();
const { MongoClient } = require('mongodb');

async function main() {
  // Get MongoDB connection string from environment variables
  const uri = process.env.MONGODB_ADMIN_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MongoDB URI environment variable is not set');
    process.exit(1);
  }

  // Database name
  const dbName = process.env.MONGODB_DB_NAME || 'blog-api';
  
  // Create MongoDB client
  const client = new MongoClient(uri);

  try {
    // Connect to MongoDB
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    // Get database
    const db = client.db(dbName);
    
    // Check tech topics collection
    const techTopicsCollection = db.collection('techtopics');
    const techTopicCount = await techTopicsCollection.countDocuments();
    console.log(`📊 Tech topics in database: ${techTopicCount}`);
    
    if (techTopicCount > 0) {
      const sampleTopic = await techTopicsCollection.findOne();
      console.log('\n📝 Sample tech topic:');
      console.log(`  ID: ${sampleTopic.id}`);
      console.log(`  Topic: ${sampleTopic.topic}`);
      console.log(`  Category: ${sampleTopic.category}`);
    }
    
    // Check Groq models collection
    const groqModelsCollection = db.collection('groqmodels');
    const groqModelCount = await groqModelsCollection.countDocuments();
    console.log(`\n📊 Groq models in database: ${groqModelCount}`);
    
    if (groqModelCount > 0) {
      const sampleModel = await groqModelsCollection.findOne();
      console.log('\n📝 Sample Groq model:');
      console.log(`  ID: ${sampleModel.id}`);
      console.log(`  Name: ${sampleModel.name}`);
      console.log(`  Priority: ${sampleModel.priority}`);
      
      // Get models sorted by priority
      const prioritizedModels = await groqModelsCollection
        .find()
        .sort({ priority: 1 })
        .toArray();
      
      console.log('\n🔢 Models sorted by priority:');
      prioritizedModels.forEach(model => {
        console.log(`  ${model.priority}. ${model.id} (${model.name})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

main().catch(console.error);
