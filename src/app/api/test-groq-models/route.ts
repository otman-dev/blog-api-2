import { NextResponse } from 'next/server';
import { GroqModelService } from '@/lib/groqModelService';
import { KnowledgeBaseLoader } from '@/lib/knowledgeBase/loader';

/**
 * GET endpoint to test fetching Groq models from both the file and database
 * This is a public endpoint for testing
 */
export async function GET() {
  try {
    const groqModelService = GroqModelService.getInstance();
    const knowledgeBaseLoader = KnowledgeBaseLoader.getInstance();
    
    // Test 1: Get models from database via service
    const modelsFromDb = await groqModelService.getAllModels();
    
    // Test 2: Get models via KnowledgeBaseLoader (should now use database)
    const modelsFromLoader = await knowledgeBaseLoader.getModels();
    
    // Test 3: Get models by priority
    const modelsByPriority = await groqModelService.getModelsByPriority();
    
    return NextResponse.json({
      message: 'Groq models retrieved successfully',
      databaseCount: modelsFromDb.length,
      loaderCount: modelsFromLoader.length,
      modelIds: modelsByPriority.map(model => model.id),
      sampleModel: modelsFromDb.length > 0 ? {
        id: modelsFromDb[0].id,
        name: modelsFromDb[0].name,
        priority: modelsFromDb[0].priority,
      } : null
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error testing Groq models:', error);
    return NextResponse.json(
      { error: 'Failed to test Groq models', details: error.message },
      { status: 500 }
    );
  }
}
