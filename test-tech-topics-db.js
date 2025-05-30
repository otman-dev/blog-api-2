import { TechTopicService } from './src/lib/techTopicService';
import { KnowledgeBaseLoader } from './src/lib/knowledgeBase/loader';

/**
 * Simple script to test the tech topics database migration
 * Run with: node -r @swc-node/register test-tech-topics-db.js
 */
async function main() {
  try {
    console.log('🔄 Testing tech topics database integration...');
    
    // 1. First, get topics from the JSON file through the loader
    const loader = KnowledgeBaseLoader.getInstance();
    const fileTopics = await loader.getTopics();
    console.log(`📄 Found ${fileTopics.length} topics from the KnowledgeBaseLoader`);
    
    // 2. Get a sample topic through the loader 
    const sampleTopic = await loader.getRandomTopic();
    console.log('📋 Sample topic from loader:');
    console.log(`   ID: ${sampleTopic.id}`);
    console.log(`   Title: ${sampleTopic.topic}`);
    console.log(`   Category: ${sampleTopic.category}`);
    
    // 3. Get topics directly from the database through the service
    const service = TechTopicService.getInstance();
    const dbTopics = await service.getAllTopics();
    console.log(`💾 Found ${dbTopics.length} topics directly from database`);
    
    // 4. Get a specific topic by ID
    if (sampleTopic && sampleTopic.id) {
      const dbTopic = await service.getTopicById(sampleTopic.id);
      console.log('📋 Same topic from database:');
      console.log(`   ID: ${dbTopic?.id}`);
      console.log(`   Title: ${dbTopic?.topic}`);
      console.log(`   Category: ${dbTopic?.category}`);
    }
    
    // 5. Test the random topic function
    const randomTopic = await service.getRandomTopic();
    console.log('🎲 Random topic from database:');
    console.log(`   ID: ${randomTopic.id}`);
    console.log(`   Title: ${randomTopic.topic}`);
    console.log(`   Category: ${randomTopic.category}`);
    
    console.log('✅ Tech topics database integration test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing tech topics database integration:', error);
    process.exit(1);
  }
}

main();
