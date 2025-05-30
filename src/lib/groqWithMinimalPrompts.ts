import Groq from 'groq-sdk';
import { KnowledgeBaseService, GenerationOptions } from './knowledgeBase';

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
 * Enhanced blog post generation using Knowledge Base system with minimal hardcoding
 * This uses the pure metadata-driven approach with zero hardcoded templates
 */
export async function generatePostWithKnowledgeBase(
  request: PostGenerationRequest = {}
): Promise<GeneratedPost> {
  const knowledgeBase = KnowledgeBaseService.getInstance();
    // Generate prompt configuration using knowledge base with minimal hardcoding
  // This uses the pure metadata-driven approach with zero hardcoded templates
  const config = await knowledgeBase.generateMinimalHardcodedPrompt(request.options);
  
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
        model: model.name,
        temperature: model.temperature,
        max_tokens: model.maxTokens,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error(`No response from Groq API with model ${model.name}`);
      }

      console.log(`📝 Raw response from ${model.name}:`, response.substring(0, 200) + '...');

      // Parse and clean the JSON response
      const blogData = await parseAndCleanResponse(response, model.name);
      
      // Validate the response structure
      if (!blogData.title || !blogData.content || !blogData.excerpt) {
        throw new Error(`Invalid response structure from model ${model.name}`);
      }

      // Ensure categories and tags are arrays
      if (!Array.isArray(blogData.categories)) {
        blogData.categories = [config.category.name];
      }
      if (!Array.isArray(blogData.tags)) {
        blogData.tags = config.topic.keywords.concat(["tutorial", "practical"]);
      }

      console.log(`✅ Successfully generated post with model: ${model.name}`);
      console.log(`📊 Stats: ${blogData.content.length} characters, ${blogData.categories.length} categories, ${blogData.tags.length} tags`);
      
      return blogData;

    } catch (error) {
      console.error(`❌ Error with model ${model.name}:`, error);
      // Continue to next model
    }
  }

  // If all models fail, throw error
  throw new Error('Failed to generate blog content with any available model');
}

/**
 * Legacy function that maintains backward compatibility
 * This is a drop-in replacement for the original generateRandomPost()
 */
export async function generateRandomPost(): Promise<GeneratedPost> {
  return generatePostWithKnowledgeBase({});
}

/**
 * Helper function to parse and clean API response
 */
async function parseAndCleanResponse(response: string, modelName: string): Promise<GeneratedPost> {
  try {
    // Remove any non-JSON text before or after the JSON object
    let jsonStr = response.trim();
    
    // Find first { and last }
    const firstBrace = jsonStr.indexOf('{');
    const lastBrace = jsonStr.lastIndexOf('}');
    
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
    }
    
    // Try to parse the JSON
    const parsed = JSON.parse(jsonStr);
    
    // Make sure we have the required fields
    if (!parsed.title || !parsed.content) {
      throw new Error(`Missing required fields in response from model ${modelName}`);
    }
    
    // Fill in any missing fields with defaults
    return {
      title: parsed.title,
      content: parsed.content,
      excerpt: parsed.excerpt || parsed.summary || parsed.title,
      categories: Array.isArray(parsed.categories) ? parsed.categories : [parsed.categories].filter(Boolean),
      tags: Array.isArray(parsed.tags) ? parsed.tags : [parsed.tags].filter(Boolean)
    };
  } catch (error) {
    console.error(`Failed to parse response from ${modelName}:`, error);
    console.error('Response sample:', response.substring(0, 500) + '...');
    
    // Try a more aggressive cleanup approach
    try {
      console.log('🔧 Attempting aggressive JSON cleanup...');
      let cleanedJson = response.trim();
      
      // Extract JSON more aggressively
      const match = cleanedJson.match(/\{[\s\S]*\}/);
      if (match) {
        cleanedJson = match[0];
      }
      
      // Step 1: Fix common JSON formatting issues
      cleanedJson = cleanedJson
        .replace(/,(\s*[}\]])/g, '$1')  // Remove trailing commas
        .replace(/\n/g, '\\n')          // Escape newlines
        .replace(/\r/g, '\\r')          // Escape carriage returns  
        .replace(/\t/g, '\\t')          // Escape tabs
        .replace(/\f/g, '\\f')          // Escape form feeds
        .replace(/\b/g, '\\b');         // Escape backspaces
      
      // Step 2: Try parsing again
      let parsed = JSON.parse(cleanedJson);
      
      if (!parsed.title || !parsed.content) {
        throw new Error('Missing required fields after first cleanup');
      }
      
      console.log('✅ Successfully parsed JSON after first cleanup attempt');
      
      return {
        title: parsed.title,
        content: parsed.content,
        excerpt: parsed.excerpt || parsed.summary || parsed.title,
        categories: Array.isArray(parsed.categories) ? parsed.categories : [parsed.categories].filter(Boolean),
        tags: Array.isArray(parsed.tags) ? parsed.tags : [parsed.tags].filter(Boolean)
      };
    } catch (secondError) {
      console.error('🔧 First cleanup failed, trying extreme cleanup:', secondError);
      
      // Step 3: Last resort - very aggressive cleanup
      try {
        let extremeCleanup = response.trim();
        
        // Extract just the JSON part
        const jsonMatch = extremeCleanup.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          extremeCleanup = jsonMatch[0];
        }
        
        // Replace all problematic characters with safe alternatives
        extremeCleanup = extremeCleanup
          .replace(/[\n\r\t\f\b]/g, ' ')  // Replace all control chars with spaces
          .replace(/\s+/g, ' ')           // Collapse multiple spaces
          .replace(/,(\s*[}\]])/g, '$1')  // Remove trailing commas
          .replace(/\\\\/g, '\\');        // Fix double escapes
        
        const parsed = JSON.parse(extremeCleanup);
        
        if (!parsed.title || !parsed.content) {
          throw new Error('Missing required fields after extreme cleanup');
        }
        
        console.log('✅ Successfully parsed JSON after extreme cleanup');
        
        return {
          title: parsed.title,
          content: parsed.content,
          excerpt: parsed.excerpt || parsed.summary || parsed.title,
          categories: Array.isArray(parsed.categories) ? parsed.categories : [parsed.categories].filter(Boolean),
          tags: Array.isArray(parsed.tags) ? parsed.tags : [parsed.tags].filter(Boolean)
        };
      } catch (thirdError) {
        console.error('❌ All cleanup attempts failed:', thirdError);
        throw new Error(`Failed to parse response from ${modelName} after all cleanup attempts`);
      }
    }
  }
}
