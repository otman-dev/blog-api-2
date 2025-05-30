const { KnowledgeBaseService } = require('./src/lib/knowledgeBase/index.ts');

async function testPromptBuilderPipeline() {
  try {
    console.log('🧪 Testing complete prompt builder pipeline with database collections...\n');
    
    const kbService = KnowledgeBaseService.getInstance();
    
    // Test 1: Get statistics to verify all collections are accessible
    console.log('📊 Getting knowledge base statistics...');
    const stats = await kbService.getKnowledgeBaseStats();
    console.log('Statistics:', {
      totalTopics: stats.totalTopics,
      totalCategories: stats.totalCategories,
      totalModels: stats.totalModels,
      categoriesWithTopics: Object.keys(stats.topicsByCategory).length,
      difficultyLevels: Object.keys(stats.topicsByDifficulty)
    });
    
    if (stats.totalTopics === 0 || stats.totalCategories === 0 || stats.totalModels === 0) {
      throw new Error('❌ One or more collections are empty!');
    }
    
    console.log('✅ All collections have data\n');
    
    // Test 2: Generate a complete prompt configuration
    console.log('🎯 Generating prompt configuration...');
    const promptConfig = await kbService.generatePromptConfiguration();
    
    console.log('📋 Generated Configuration:');
    console.log(`  Topic: ${promptConfig.topic.topic}`);
    console.log(`  Category: ${promptConfig.category.name}`);
    console.log(`  Difficulty: ${promptConfig.topic.difficulty}`);
    console.log(`  Time to Complete: ${promptConfig.topic.timeToComplete}`);
    console.log(`  Keywords: ${promptConfig.topic.keywords.join(', ')}`);
    console.log(`  Available Models: ${promptConfig.models.length}`);
    console.log(`  Primary Model: ${promptConfig.models[0]?.name}`);
    
    // Test 3: Show system and user prompts (first 200 chars)
    console.log('\n📝 Generated Prompts:');
    console.log(`  System Message: ${promptConfig.systemMessage.substring(0, 200)}...`);
    console.log(`  User Prompt: ${promptConfig.userPrompt.substring(0, 200)}...`);
    
    // Test 4: Test with specific category
    console.log('\n🎯 Testing with specific category (DevOps & CI/CD)...');
    const devopsConfig = await kbService.generatePromptConfiguration({
      categoryId: 'devops-cicd'
    });
    console.log(`  DevOps Topic: ${devopsConfig.topic.topic}`);
    console.log(`  Category Match: ${devopsConfig.category.name}`);
    
    // Test 5: Get available categories and models
    console.log('\n📚 Available Resources:');
    const categories = await kbService.getAvailableCategories();
    const models = await kbService.getAvailableModels();
    
    console.log(`  Categories: ${categories.slice(0, 5).map(c => c.name).join(', ')}... (${categories.length} total)`);
    console.log(`  Models: ${models.slice(0, 3).map(m => m.name).join(', ')}... (${models.length} total)`);
    
    console.log('\n✅ Complete prompt builder pipeline test PASSED!');
    console.log('🎉 All three database collections are working correctly:');
    console.log(`   - Categories: ${stats.totalCategories} from otman-blog database`);
    console.log(`   - Tech Topics: ${stats.totalTopics} from blog-api database`);
    console.log(`   - Groq Models: ${stats.totalModels} from blog-api database`);
    
  } catch (error) {
    console.error('❌ Test FAILED:', error);
    process.exit(1);
  }
}

testPromptBuilderPipeline();
