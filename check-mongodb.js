// Simple script to directly check MongoDB collections
// Run with: node check-mongodb.js
require('dotenv').config();
const { MongoClient } = require('mongodb');

async function main() {
  // Get MongoDB connection string from environment variables
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI environment variable is not set');
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
    
    // List all collections
    console.log(`📋 Collections in database '${dbName}':`);
    const collections = await db.listCollections().toArray();
    collections.forEach(collection => {
      console.log(`  - ${collection.name}`);
    });
    
    // Check for TechTopics collection specifically
    const techTopicsCollection = collections.find(c => 
      c.name.toLowerCase() === 'techtopics' || 
      c.name.toLowerCase() === 'tech-topics' || 
      c.name.toLowerCase() === 'tech_topics' ||
      c.name.toLowerCase() === 'techtopic'
    );
    
    if (techTopicsCollection) {
      console.log(`\n✅ Found tech topics collection: ${techTopicsCollection.name}`);
      
      // Count documents in the collection
      const topicsCollection = db.collection(techTopicsCollection.name);
      const count = await topicsCollection.countDocuments();
      console.log(`📊 Total tech topics: ${count}`);
      
      if (count > 0) {
        // Show some example documents
        const examples = await topicsCollection.find().limit(3).toArray();
        console.log('\n📝 Example tech topics:');
        examples.forEach((doc, index) => {
          console.log(`\nDocument ${index + 1}:`);
          console.log(`  ID: ${doc.id}`);
          console.log(`  Topic: ${doc.topic}`);
          console.log(`  Category: ${doc.category}`);
        });
      }
    } else {
      console.log('\n❌ Tech topics collection not found!');
      
      // Check if there are any tech-related collections
      const possibleCollections = collections.filter(c => 
        c.name.toLowerCase().includes('tech') || 
        c.name.toLowerCase().includes('topic')
      );
      
      if (possibleCollections.length > 0) {
        console.log('🔍 Found possibly related collections:');
        possibleCollections.forEach(c => console.log(`  - ${c.name}`));
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

main().catch(console.error);
