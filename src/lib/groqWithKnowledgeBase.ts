import Groq from 'groq-sdk';
import { KnowledgeBaseService, GenerationOptions } from './knowledgeBase';
import { CategoryService } from './categoryService';
import { TagService } from './tagService';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface PostGenerationRequest {
  topic?: string;
  category?: string;
  options?: GenerationOptions;
}

export interface GeneratedPost {
  title: string;
  content: string;
  excerpt: string;
  categories: string[];
  tags: string[];
}

/**
 * Enhanced blog post generation using Knowledge Base system
 * This replaces the hardcoded approach in the original groq.ts
 */
export async function generatePostWithKnowledgeBase(
  request: PostGenerationRequest = {}
): Promise<GeneratedPost> {
  const knowledgeBase = KnowledgeBaseService.getInstance();
  
  // Generate prompt configuration using knowledge base
  const config = await knowledgeBase.generatePromptConfiguration(request.options);
  
  console.log(`🎯 Selected topic: ${config.topic.topic}`);
  console.log(`📁 Category: ${config.category.name}`);
  console.log(`⏱️  Expected time: ${config.topic.timeToComplete}`);
  console.log(`🎛️  Difficulty: ${config.topic.difficulty}`);

  // Try models in priority order
  for (const model of config.models) {
    try {
      console.log(`🔄 Trying model: ${model.name}`);
      
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: config.systemMessage
          },
          {
            role: "user",
            content: config.userPrompt
          }
        ],
        model: model.id,
        temperature: model.temperature,
        max_tokens: model.maxTokens,
        top_p: 1,
        stop: null
      });

      // Extract and clean the completion
      const response = completion.choices[0]?.message?.content || '';
      const blogData = await parseAndCleanResponse(response, model.name);
      
      // Ensure the category from the knowledge base is included
      if (blogData && blogData.categories) {
        if (!blogData.categories.includes(config.category.name)) {
          blogData.categories.push(config.category.name);
        }
      } else {
        blogData.categories = [config.category.name];
      }
        // Ensure all categories exist in the database
      const categoryService = CategoryService.getInstance();
      await categoryService.ensureCategoriesExist(blogData.categories);
      
      // Ensure all tags exist in the database
      const tagService = TagService.getInstance();
      await tagService.ensureTagsExist(blogData.tags);
      
      console.log(`✅ Successfully generated post with model: ${model.name}`);
      return blogData;
    } catch (error) {
      console.error(`❌ Error with model ${model.id}:`, error);
      // Continue to next model in priority order
    }
  }
  
  throw new Error('All models failed to generate content');
}

/**
 * Legacy function that maintains backward compatibility
 * This is a drop-in replacement for the original generateRandomPost()
 */
export async function generateRandomPost(): Promise<GeneratedPost> {
  return generatePostWithKnowledgeBase();
}

/**
 * Parse and clean JSON response from Groq API
 * Reuses the existing robust parsing logic from the original implementation
 */
async function parseAndCleanResponse(response: string, modelName: string): Promise<GeneratedPost> {
  console.log(`🧹 Starting JSON cleanup for ${modelName}...`);
  
  // Remove markdown code blocks if present
  let jsonString = response;
  if (jsonString.includes('```json')) {
    jsonString = jsonString.replace(/```json\s*/g, '').replace(/\s*```/g, '');
  }
  if (jsonString.includes('```')) {
    jsonString = jsonString.replace(/```\s*/g, '').replace(/\s*```/g, '');
  }
  
  // Find the first { and last } to extract just the JSON object
  const firstBrace = jsonString.indexOf('{');
  const lastBrace = jsonString.lastIndexOf('}');
  
  if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
    console.error(`❌ No valid JSON structure found in response from ${modelName}`);
    throw new Error(`No valid JSON structure found in response from ${modelName}`);
  }
  
  jsonString = jsonString.substring(firstBrace, lastBrace + 1);
  
  // Clean control characters and normalize line endings
  jsonString = jsonString
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // Remove control characters
  
  // Fix common JSON syntax issues
  jsonString = jsonString
    .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
    .replace(/([{,]\s*)(\w+)(\s*):/g, '$1"$2"$3:') // Quote unquoted keys
    .trim();
    
  console.log(`🧹 Cleaned JSON for ${modelName}:`, jsonString.substring(0, 200) + '...');
  
  let blogData: GeneratedPost;
  try {
    blogData = JSON.parse(jsonString) as GeneratedPost;
    console.log(`✅ Successfully parsed JSON for ${modelName}`);
  } catch (parseError) {
    console.error(`JSON parse error for ${modelName}:`, parseError);
    
    // Advanced JSON repair attempt
    try {
      const repairedJson = repairBrokenJSON(jsonString);
      blogData = JSON.parse(repairedJson) as GeneratedPost;
      console.log(`✅ Repaired and parsed JSON for ${modelName}`);
    } catch (repairError) {
      console.error(`JSON repair failed for ${modelName}:`, repairError);
      console.error(`Raw response causing parse error:`, response.substring(0, 1000) + '...');
      throw repairError;
    }
  }
  
  return blogData;
}

/**
 * Advanced JSON repair function for common syntax issues
 * Reused from original implementation
 */
function repairBrokenJSON(jsonString: string): string {
  let repaired = jsonString;
  
  try {
    // Step 1: Fix unescaped newlines in string values
    repaired = repaired.replace(/"([^"]*)\n([^"]*)"(?=\s*[,\]}])/g, (match, before, after) => {
      return `"${before}\\n${after}"`;
    });
    
    // Step 2: Fix unescaped quotes within string values
    repaired = repaired.replace(/"([^"]*)"([^"]*)"([^"]*)"(?=\s*[,\]}])/g, '"$1\\"$2\\"$3"');
    
    // Step 3: Fix unescaped tabs and other whitespace
    repaired = repaired.replace(/\t/g, '\\t');
    
    // Step 4: Fix multiline string values that span multiple lines
    repaired = repaired.replace(/"([^"]*(?:\n[^"]*)*)"(?=\s*[,\]}])/g, (match, content) => {
      const escapedContent = content
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t')
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"');
      return `"${escapedContent}"`;
    });
    
    // Step 5: Remove any remaining control characters
    repaired = repaired.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    
    // Step 6: Fix trailing commas
    repaired = repaired.replace(/,(\s*[}\]])/g, '$1');
    
    // Step 7: Ensure proper JSON structure
    if (!repaired.trim().startsWith('{')) {
      repaired = '{' + repaired;
    }
    if (!repaired.trim().endsWith('}')) {
      repaired = repaired + '}';
    }
    
    return repaired;
  } catch (error) {
    console.error('Error in repairBrokenJSON:', error);
    return jsonString; // Return original if repair fails
  }
}
