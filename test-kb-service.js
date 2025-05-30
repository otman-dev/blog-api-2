require('dotenv').config();

async function testKnowledgeBaseService() {
  try {
    console.log('🧪 Testing KnowledgeBaseService directly...');
    
    // Import the ES modules using dynamic import
    const { KnowledgeBaseService } = await import('./src/lib/knowledgeBase/index.ts');
    
    console.log('📚 Getting KnowledgeBaseService instance...');
    const kbService = KnowledgeBaseService.getInstance();
    
    console.log('📊 Getting knowledge base statistics...');
    const stats = await kbService.getKnowledgeBaseStats();
    console.log('Stats:', stats);
    
    console.log('🎯 Generating minimal prompt configuration...');
    const config = await kbService.generateMinimalHardcodedPrompt();
    
    console.log('✅ Test successful!');
    console.log('Topic:', config.topic?.topic);
    console.log('Category:', config.category?.name);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack:', error.stack);
  }
}

testKnowledgeBaseService();
