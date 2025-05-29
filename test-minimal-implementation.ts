/**
 * Test script for the minimal hardcoded prompts implementation
 * 
 * This script tests the generation of a blog post using the new
 * minimal hardcoded prompts approach.
 */

import { generatePostWithKnowledgeBase } from './src/lib/groqWithMinimalPrompts';

async function testMinimalPromptsImplementation() {
  console.log('🧪 Testing Blog Generation with Minimal Hardcoded Prompts\n');
  
  try {
    console.log('📝 Generating a blog post...\n');
    
    const post = await generatePostWithKnowledgeBase({
      options: {
        customInstructions: "Make the tutorial extremely practical with lots of code examples."
      }
    });
    
    console.log('\n✅ Successfully generated blog post:\n');
    console.log(`Title: ${post.title}`);
    console.log(`Excerpt: ${post.excerpt}`);
    console.log(`Categories: ${post.categories.join(', ')}`);
    console.log(`Tags: ${post.tags.join(', ')}`);
    console.log(`Content length: ${post.content.length} characters`);
    
    // Print the first 300 characters of content
    console.log('\nContent preview:');
    console.log('----------------');
    console.log(post.content.substring(0, 300) + '...');
    console.log('----------------\n');
    
    console.log('🎉 Test completed successfully!');
    console.log('The Knowledge Base system is working with minimal hardcoded prompts.');
    
  } catch (error) {
    console.error('❌ Error generating blog post:', error);
    process.exit(1);
  }
}

// Check if GROQ_API_KEY is set
if (!process.env.GROQ_API_KEY) {
  console.error('❌ GROQ_API_KEY environment variable is not set');
  console.log('Please set your GROQ API key with:');
  console.log('  export GROQ_API_KEY=your-api-key');
  process.exit(1);
}

// Run the test
testMinimalPromptsImplementation();
