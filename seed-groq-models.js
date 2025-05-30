// Script to seed Groq models from JSON to MongoDB
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

// MongoDB connection settings - using the admin URI as specified
const uri = process.env.MONGODB_ADMIN_URI;
const dbName = process.env.MONGODB_DB_NAME || 'blog-api';
const collectionName = 'groqmodels'; // The collection name for Groq models

async function seedGroqModels() {
  if (!uri) {
    console.error('❌ MONGODB_ADMIN_URI environment variable is not set');
    process.exit(1);
  }

  // Read Groq models from JSON file
  const modelsPath = path.join(__dirname, 'knowledge-base', 'models', 'groq-models.json');
  
  try {
    // Read and parse the JSON file
    const fileContent = fs.readFileSync(modelsPath, 'utf8');
    const groqModels = JSON.parse(fileContent);
    
    console.log(`📄 Read ${groqModels.length} Groq models from JSON file`);
    
    // Connect to MongoDB
    const client = new MongoClient(uri);
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    // Get database and collection
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    
    // Check if collection is empty
    const count = await collection.countDocuments();
    console.log(`📊 Current Groq models in database: ${count}`);
    
    // Insert or update Groq models
    let inserted = 0;
    let updated = 0;
    
    for (const model of groqModels) {
      // Add timestamps
      const modelWithTimestamps = {
        ...model,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Check if model already exists
      const existingModel = await collection.findOne({ id: model.id });
      
      if (existingModel) {
        // Update existing model
        await collection.updateOne(
          { id: model.id },
          { $set: { ...modelWithTimestamps, updatedAt: new Date() } }
        );
        updated++;
      } else {
        // Insert new model
        await collection.insertOne(modelWithTimestamps);
        inserted++;
      }
    }
    
    console.log(`✅ Seeding completed: ${inserted} inserted, ${updated} updated`);
    
    // Verify the final count
    const finalCount = await collection.countDocuments();
    console.log(`📊 Total Groq models in database after seeding: ${finalCount}`);
    
    // Close the connection
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error seeding Groq models:', error);
    process.exit(1);
  }
}

// Execute the seeding
seedGroqModels().catch(console.error);
