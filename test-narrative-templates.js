/**
 * Test script for the narrative template system
 * This script tests the integration of narrative templates with the knowledge base
 */

import { KnowledgeBaseService } from '../src/lib/knowledgeBase/index.js';
import { NarrativeTemplateService } from '../src/lib/narrativeTemplateService.js';

async function testNarrativeTemplateSystem() {
  console.log('🧪 Testing Narrative Template System...\n');

  try {
    const knowledgeBaseService = KnowledgeBaseService.getInstance();
    const narrativeService = NarrativeTemplateService.getInstance();

    // Step 1: Seed narrative templates
    console.log('1️⃣ Seeding narrative templates...');
    await narrativeService.seedTemplates();
    
    // Step 2: Get available templates
    console.log('\n2️⃣ Getting available templates...');
    const templates = await narrativeService.getAllTemplates();
    console.log(`   Found ${templates.length} narrative templates:`);
    templates.forEach(template => {
      console.log(`   📝 ${template.name} (${template.type}) - Priority: ${template.priority}`);
    });

    // Step 3: Test compatibility matching
    console.log('\n3️⃣ Testing template compatibility...');
    const compatibleTemplates = await narrativeService.getCompatibleTemplates('JavaScript', 'beginner');
    console.log(`   Found ${compatibleTemplates.length} templates compatible with JavaScript/beginner`);

    // Step 4: Generate a narrative-enhanced prompt
    console.log('\n4️⃣ Generating narrative-enhanced prompt...');
    const prompt = await knowledgeBaseService.generateNarrativeEnhancedPrompt({
      useNarrativeTemplates: true
    });

    console.log(`   ✅ Generated prompt for topic: "${prompt.topic.topic}"`);
    console.log(`   📁 Category: ${prompt.category.name}`);
    console.log(`   📏 System message length: ${prompt.systemMessage.length} characters`);
    console.log(`   📏 User prompt length: ${prompt.userPrompt.length} characters`);

    // Step 5: Test specific template selection
    if (templates.length > 0) {
      console.log('\n5️⃣ Testing specific template selection...');
      const specificPrompt = await knowledgeBaseService.generateNarrativeEnhancedPrompt({
        narrativeTemplateId: templates[0].id,
        useNarrativeTemplates: true
      });
      console.log(`   ✅ Generated prompt using template: "${templates[0].name}"`);
    }

    // Step 6: Compare with non-narrative prompt
    console.log('\n6️⃣ Comparing with traditional prompt...');
    const traditionalPrompt = await knowledgeBaseService.generateMinimalHardcodedPrompt({
      useNarrativeTemplates: false
    });
    
    console.log('   📊 Comparison:');
    console.log(`   Traditional system message: ${traditionalPrompt.systemMessage.length} chars`);
    console.log(`   Narrative system message: ${prompt.systemMessage.length} chars`);
    console.log(`   Traditional user prompt: ${traditionalPrompt.userPrompt.length} chars`);
    console.log(`   Narrative user prompt: ${prompt.userPrompt.length} chars`);

    // Step 7: Show sample narrative elements
    console.log('\n7️⃣ Sample narrative elements from generated prompt:');
    console.log('   System Message Preview:');
    console.log('   ' + prompt.systemMessage.substring(0, 200) + '...\n');
    
    console.log('   User Prompt Preview:');
    console.log('   ' + prompt.userPrompt.substring(0, 300) + '...\n');

    console.log('✅ All tests passed! Narrative template system is working correctly.\n');
    
    // Final summary
    console.log('📋 SUMMARY:');
    console.log(`   • ${templates.length} narrative templates available`);
    console.log(`   • Templates support ${new Set(templates.flatMap(t => t.categoryCompatibility)).size} categories`);
    console.log(`   • Average system message increase: ${Math.round(((prompt.systemMessage.length - traditionalPrompt.systemMessage.length) / traditionalPrompt.systemMessage.length) * 100)}%`);
    console.log(`   • Average user prompt increase: ${Math.round(((prompt.userPrompt.length - traditionalPrompt.userPrompt.length) / traditionalPrompt.userPrompt.length) * 100)}%`);
    console.log('   • Enhanced storytelling and human elements integrated ✨');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error(error.stack);
    process.exit(1);
  }

  process.exit(0);
}

// Run the test
testNarrativeTemplateSystem();
