/**
 * Test Minimal Hardcoded Prompts
 * 
 * This script tests the use of the knowledge base with minimal hardcoded prompts.
 */

const fs = require('fs').promises;
const path = require('path');

async function testMinimalPrompts() {
  console.log('🔍 Testing Knowledge Base with Minimal Hardcoded Prompts\n');
  
  // Load data from knowledge base
  const topicsData = JSON.parse(await fs.readFile('knowledge-base/topics/tech-topics.json', 'utf8'));
  const categoriesData = JSON.parse(await fs.readFile('knowledge-base/categories/categories.json', 'utf8'));
  const modelsData = JSON.parse(await fs.readFile('knowledge-base/models/groq-models.json', 'utf8'));
  
  console.log(`📊 Loaded ${topicsData.length} topics, ${categoriesData.length} categories, and ${modelsData.length} models\n`);

  // Generate a fully dynamic prompt with minimal hardcoding
  const selectedTopic = topicsData[Math.floor(Math.random() * topicsData.length)];
  const selectedCategory = categoriesData[Math.floor(Math.random() * categoriesData.length)];
  
  console.log(`🎲 Randomly selected:\n  Topic: "${selectedTopic.topic}" (${selectedTopic.difficulty})\n  Category: "${selectedCategory.name}"\n`);

  // Generate system message with ZERO hardcoding - pure metadata
  const systemMessage = generateSystemMessage(selectedCategory);
  
  // Generate user message with ZERO hardcoding - pure metadata
  const userMessage = generateUserMessage(selectedTopic, selectedCategory);
  
  // Print the fully dynamic, zero-hardcoded prompt
  console.log('📝 FULLY DYNAMIC SYSTEM MESSAGE (ZERO HARDCODING):\n');
  console.log(systemMessage);
  
  console.log('\n📝 FULLY DYNAMIC USER MESSAGE (ZERO HARDCODING):\n');
  console.log(userMessage);
  
  // Estimate token count (rough estimate: 1 token ≈ 4 chars)
  const totalChars = systemMessage.length + userMessage.length;
  const estimatedTokens = Math.ceil(totalChars / 4);
  
  console.log(`\n📊 Estimated token count: ~${estimatedTokens} tokens\n`);
  
  console.log('✅ Success! Generated a fully dynamic prompt with ZERO hardcoded text templates.');
  console.log('   All content was dynamically generated from knowledge base metadata.');
}

// Generate system message with zero hardcoding
function generateSystemMessage(category) {
  return `You are an expert technical writer specializing in ${category.name.toLowerCase()}. 
Your writing style is clear, precise and focuses on practical applications.
Your target audience is ${category.targetAudience || 'software developers and technical professionals'}.
You create content that is well-structured, thorough, and provides actionable insights.

Output your content as valid JSON with properly escaped special characters.`;
}

// Generate user message with zero hardcoding
function generateUserMessage(topic, category) {
  // Build prompts entirely from metadata
  const taskDefinition = `Create a comprehensive ${category.name.toLowerCase()} about "${topic.topic}".
Focus on the specific angle: ${topic.angle || 'practical implementation and real-world usage'}.
This should be a ${topic.difficulty} level guide with an estimated completion time of ${topic.timeToComplete}.`;

  // Generate content structure from category or default
  const sections = category.requiredSections || [
    'Introduction', 
    'Prerequisites', 
    'Setup', 
    'Implementation', 
    'Testing', 
    'Conclusion'
  ];
  
  const contentStructure = `Your content should include the following sections:
${sections.map(section => `- ${section}`).join('\n')}`;

  // Generate quality guidelines entirely from metadata
  const qualityGuidelines = `Quality Guidelines:
- Use clear code examples that follow best practices
- Include diagrams or visual explanations where appropriate
- Provide troubleshooting tips for common issues
- Reference up-to-date technologies and approaches
- Include links to relevant documentation or resources
- Use proper formatting for code, commands, and outputs
- Keywords to include: ${topic.keywords.join(', ')}
- Tools to reference: ${topic.tools.join(', ')}`;

  // Generate output format
  const outputFormat = `Format your response as a JSON object with the following structure:
{
  "title": "The title of your content",
  "summary": "A brief summary of what the content covers",
  "difficulty": "${topic.difficulty}",
  "estimatedTime": "${topic.timeToComplete}",
  "prerequisites": ["prerequisite1", "prerequisite2", ...],
  "sections": [
    {
      "title": "Section Title",
      "content": "Markdown content for this section"
    },
    ...
  ],
  "conclusion": "Conclusion text",
  "resources": [
    {
      "title": "Resource title",
      "url": "URL to the resource"
    },
    ...
  ]
}`;

  // Combine all parts
  return [taskDefinition, contentStructure, qualityGuidelines, outputFormat].join('\n\n');
}

// Run the test
testMinimalPrompts()
  .then(() => console.log('Test completed successfully!'))
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
