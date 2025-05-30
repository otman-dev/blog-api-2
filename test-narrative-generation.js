/**
 * Comprehensive test of the narrative template system with actual blog generation
 * This script demonstrates the difference between traditional and narrative-enhanced content
 */

import { 
  generatePostWithKnowledgeBase, 
  generatePostWithNarrativeTemplate,
  generateTraditionalPost 
} from '../src/lib/groqWithMinimalPrompts.js';
import { KnowledgeBaseService } from '../src/lib/knowledgeBase/index.js';

async function demonstrateNarrativeSystem() {
  console.log('🎭 Demonstrating Narrative Template System for Blog Generation\n');

  try {
    const knowledgeBase = KnowledgeBaseService.getInstance();

    // Step 1: Setup narrative templates
    console.log('1️⃣ Setting up narrative templates...');
    await knowledgeBase.seedNarrativeTemplates();
    const templates = await knowledgeBase.getAvailableNarrativeTemplates();
    console.log(`   ✅ ${templates.length} narrative templates ready\n`);

    // Step 2: Generate traditional blog post
    console.log('2️⃣ Generating traditional blog post...');
    const traditionalPost = await generateTraditionalPost();
    console.log(`   📝 Title: "${traditionalPost.title}"`);
    console.log(`   📏 Content length: ${traditionalPost.content.length} characters`);
    console.log(`   🏷️  Tags: ${traditionalPost.tags.slice(0, 3).join(', ')}...\n`);

    // Step 3: Generate narrative-enhanced blog post
    console.log('3️⃣ Generating narrative-enhanced blog post...');
    const narrativePost = await generatePostWithKnowledgeBase({
      useNarrativeTemplates: true
    });
    console.log(`   📝 Title: "${narrativePost.title}"`);
    console.log(`   📏 Content length: ${narrativePost.content.length} characters`);
    console.log(`   🏷️  Tags: ${narrativePost.tags.slice(0, 3).join(', ')}...`);
    if (narrativePost.narrativeType) {
      console.log(`   📖 Narrative type: ${narrativePost.narrativeType}`);
    }
    if (narrativePost.humanElements) {
      console.log(`   👥 Human elements: ${narrativePost.humanElements.length} elements`);
    }
    console.log('');

    // Step 4: Generate with specific narrative template
    if (templates.length > 0) {
      console.log('4️⃣ Generating with specific narrative template...');
      const specificTemplate = templates[0];
      console.log(`   🎯 Using template: "${specificTemplate.name}" (${specificTemplate.type})`);
      
      const specificPost = await generatePostWithNarrativeTemplate(specificTemplate.id);
      console.log(`   📝 Title: "${specificPost.title}"`);
      console.log(`   📏 Content length: ${specificPost.content.length} characters\n`);
    }

    // Step 5: Compare content styles
    console.log('5️⃣ Content Style Comparison:\n');
    
    console.log('   🔸 TRADITIONAL EXCERPT:');
    console.log('   ' + traditionalPost.excerpt.substring(0, 150) + '...\n');
    
    console.log('   🔹 NARRATIVE EXCERPT:');
    console.log('   ' + narrativePost.excerpt.substring(0, 150) + '...\n');

    // Step 6: Analyze content differences
    console.log('6️⃣ Analysis Results:');
    
    const traditionalWords = traditionalPost.content.split(/\s+/).length;
    const narrativeWords = narrativePost.content.split(/\s+/).length;
    
    // Look for human elements in content
    const humanIndicators = [
      'I', 'we', 'you', 'our', 'my', 'experience', 'remember', 'story', 
      'journey', 'struggle', 'challenge', 'discover', 'realize', 'learn'
    ];
    
    const traditionalHumanScore = countHumanElements(traditionalPost.content, humanIndicators);
    const narrativeHumanScore = countHumanElements(narrativePost.content, humanIndicators);
    
    console.log(`   📊 Word count - Traditional: ${traditionalWords}, Narrative: ${narrativeWords}`);
    console.log(`   👥 Human elements - Traditional: ${traditionalHumanScore}, Narrative: ${narrativeHumanScore}`);
    console.log(`   📈 Narrative improvement: ${Math.round(((narrativeHumanScore - traditionalHumanScore) / Math.max(traditionalHumanScore, 1)) * 100)}% more human elements`);

    // Step 7: Template compatibility test
    console.log('\n7️⃣ Template Compatibility Test:');
    const categories = await knowledgeBase.getAvailableCategories();
    
    for (const category of categories.slice(0, 3)) { // Test first 3 categories
      const compatibleTemplates = await knowledgeBase.getCompatibleNarrativeTemplates(
        category.name, 
        'intermediate'
      );
      console.log(`   📁 ${category.name}: ${compatibleTemplates.length} compatible templates`);
    }

    // Final summary
    console.log('\n✨ NARRATIVE TEMPLATE SYSTEM SUMMARY:');
    console.log(`   • ${templates.length} narrative templates available`);
    console.log(`   • Average content length increase: ${Math.round(((narrativeWords - traditionalWords) / traditionalWords) * 100)}%`);
    console.log(`   • Human element enhancement: ${Math.round(((narrativeHumanScore - traditionalHumanScore) / Math.max(traditionalHumanScore, 1)) * 100)}%`);
    console.log('   • Storytelling, personality, and human connection integrated ✅');
    console.log('   • Ready for production use! 🚀\n');

    console.log('🎉 Narrative template system demonstration completed successfully!');

  } catch (error) {
    console.error('❌ Demonstration failed:', error);
    console.error(error.stack);
    process.exit(1);
  }

  process.exit(0);
}

function countHumanElements(content, indicators) {
  const lowerContent = content.toLowerCase();
  return indicators.reduce((count, indicator) => {
    const regex = new RegExp(`\\b${indicator}\\b`, 'g');
    const matches = lowerContent.match(regex);
    return count + (matches ? matches.length : 0);
  }, 0);
}

// Run the demonstration
demonstrateNarrativeSystem();
