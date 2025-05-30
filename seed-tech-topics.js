// Script to seed tech topics from JSON to MongoDB
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

// MongoDB connection settings
const uri = process.env.MONGODB_ADMIN_URI;
const dbName = process.env.MONGODB_DB_NAME || 'blog-api';
const collectionName = 'techtopics'; // The collection name for tech topics

async function seedTechTopics() {
  if (!uri) {
    console.error('❌ MONGODB_URI environment variable is not set');
    process.exit(1);
  }

  // Read tech topics from JSON file
  const topicsPath = path.join(__dirname, 'knowledge-base', 'topics', 'tech-topics.json');
  
  try {
    // Read and parse the JSON file
    const fileContent = fs.readFileSync(topicsPath, 'utf8');
    const techTopics = JSON.parse(fileContent);
    
    console.log(`📄 Read ${techTopics.length} tech topics from JSON file`);
    
    // Connect to MongoDB
    const client = new MongoClient(uri);
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    // Get database and collection
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    
    // Check if collection is empty
    const count = await collection.countDocuments();
    console.log(`📊 Current tech topics in database: ${count}`);
    
    // Insert or update tech topics
    let inserted = 0;
    let updated = 0;
    
    for (const topic of techTopics) {
      // Add timestamps
      const topicWithTimestamps = {
        ...topic,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Check if topic already exists
      const existingTopic = await collection.findOne({ id: topic.id });
      
      if (existingTopic) {
        // Update existing topic
        await collection.updateOne(
          { id: topic.id },
          { $set: { ...topicWithTimestamps, updatedAt: new Date() } }
        );
        updated++;
      } else {
        // Insert new topic
        await collection.insertOne(topicWithTimestamps);
        inserted++;
      }
    }
    
    console.log(`✅ Seeding completed: ${inserted} inserted, ${updated} updated`);
    
    // Verify the final count
    const finalCount = await collection.countDocuments();
    console.log(`📊 Total tech topics in database after seeding: ${finalCount}`);
    
    // Close the connection
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error seeding tech topics:', error);
    process.exit(1);
  }
}

// Execute the seeding
seedTechTopics().catch(console.error);
