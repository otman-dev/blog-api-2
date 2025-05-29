// Simple test script for groqWithMinimalPrompts
// Run with: node test-run.js

// Import the groqWithMinimalPrompts module
const { generateRandomPost } = require('./src/lib/groqWithMinimalPrompts');

async function runTest() {
  try {
    console.log('🧪 Testing minimal prompts implementation...');
    
    // Call the function
    const post = await generateRandomPost();
    
    // Log the result
    console.log('✅ Success! Generated post:');
    console.log(`Title: ${post.title}`);
    console.log(`Content length: ${post.content.length} characters`);
    console.log(`Categories: ${post.categories.join(', ')}`);
    console.log(`Tags: ${post.tags.join(', ')}`);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

runTest();
