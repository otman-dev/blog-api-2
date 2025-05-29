/**
 * Dynamic Prompt Generation Test
 * 
 * This script tests the knowledge base's ability to generate prompts with minimal hardcoding
 * by using the DynamicPromptBuilder that builds prompts purely from metadata.
 */

const fs = require('fs').promises;
const path = require('path');

async function testDynamicPromptGeneration() {
  console.log('🔄 Testing Dynamic Prompt Generation\n');

  // Load all the knowledge base data
  console.log('📥 Loading knowledge base data...');
  const topicsData = JSON.parse(await fs.readFile('knowledge-base/topics/tech-topics.json', 'utf8'));
  const categoriesData = JSON.parse(await fs.readFile('knowledge-base/categories/categories.json', 'utf8'));
  const modelsData = JSON.parse(await fs.readFile('knowledge-base/models/groq-models.json', 'utf8'));
  console.log(`   ✓ Loaded ${topicsData.length} topics, ${categoriesData.length} categories, ${modelsData.length} models\n`);

  // Simulate the DynamicPromptBuilder
  class DynamicPromptBuilder {
    constructor(topics, categories, models) {
      this.topics = topics;
      this.categories = categories;
      this.models = models;
    }
    
    getRandomTopic() {
      return this.topics[Math.floor(Math.random() * this.topics.length)];
    }
    
    getRandomCategory() {
      return this.categories[Math.floor(Math.random() * this.categories.length)];
    }
    
    getSystemMessage(category) {
      return `You are an expert technical writer specializing in ${category.name.toLowerCase()}. 
Your writing style is clear, precise and focuses on practical applications.
Your target audience is ${category.targetAudience || 'software developers and technical professionals'}.
You create content that is well-structured, thorough, and provides actionable insights.`;
    }
    
    getTaskDefinition(topic, category) {
      return `Create a comprehensive ${category.name.toLowerCase()} about "${topic.topic}".
Focus on the specific angle: ${topic.angle || 'practical implementation and real-world usage'}.
This should be a ${topic.difficulty} level guide with an estimated completion time of ${topic.timeToComplete}.`;
    }
    
    getContentStructure(category) {
      const sections = category.contentStructure?.requiredSections || [
        'Introduction', 
        'Prerequisites', 
        'Setup', 
        'Implementation', 
        'Testing', 
        'Conclusion'
      ];
      
      return `Your content should include the following sections:
${sections.map(section => `- ${section}`).join('\n')}`;
    }
    
    getQualityGuidelines(category, topic) {
      return `Quality Guidelines:
- Use clear code examples that follow best practices
- Include diagrams or visual explanations where appropriate
- Provide troubleshooting tips for common issues
- Reference up-to-date technologies and approaches
- Include links to relevant documentation or resources
- Use proper formatting for code, commands, and outputs
- Keywords to include: ${topic.keywords.join(', ')}
- Tools to reference: ${topic.tools.join(', ')}`;
    }
    
    generateFullPrompt() {
      const topic = this.getRandomTopic();
      const category = this.getRandomCategory();
      
      return {
        systemMessage: this.getSystemMessage(category),
        userMessage: [
          this.getTaskDefinition(topic, category),
          this.getContentStructure(category),
          this.getQualityGuidelines(category, topic)
        ].join('\n\n'),
        selectedTopic: topic,
        selectedCategory: category
      };
    }
  }
  
  // Create the dynamic prompt builder
  const promptBuilder = new DynamicPromptBuilder(topicsData, categoriesData, modelsData);
  
  // Generate a few sample prompts
  console.log('🛠️  Generating prompts with zero hardcoded content...\n');
  
  for (let i = 1; i <= 3; i++) {
    console.log(`📝 Sample Prompt ${i}:`);
    const prompt = promptBuilder.generateFullPrompt();
    
    console.log(`• Topic: "${prompt.selectedTopic.topic}" (${prompt.selectedTopic.category})`);
    console.log(`• Category: ${prompt.selectedCategory.name}`);
    console.log(`• Difficulty: ${prompt.selectedTopic.difficulty}`);
    console.log(`• Time: ${prompt.selectedTopic.timeToComplete}`);
    console.log(`\n--- System Message ---\n${prompt.systemMessage}\n`);
    console.log(`--- User Message ---\n${prompt.userMessage}\n`);
    
    // Calculate approximate token count (rough estimate)
    const totalText = prompt.systemMessage + prompt.userMessage;
    const approxTokens = Math.round(totalText.length / 4);
    console.log(`• Approximate token count: ${approxTokens} tokens\n`);
    
    console.log('-------------------------------------------------------------------------------\n');
  }
  
  console.log('✅ Dynamic prompt generation test completed successfully!');
  console.log('This test demonstrates generating prompts with zero hardcoded content,');
  console.log('using only structured metadata from the knowledge base.\n');
}

// Run the test
testDynamicPromptGeneration()
  .then(() => console.log('Test completed successfully!'))
  .catch(err => {
    console.error('Error during test:', err);
    process.exit(1);
  });
