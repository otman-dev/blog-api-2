import { NextRequest, NextResponse } from 'next/server';
import { KnowledgeBaseService } from '@/lib/knowledgeBase';

export async function GET() {
  try {
    const knowledgeBaseService = KnowledgeBaseService.getInstance();
    
    // Get all available narrative templates
    const templates = await knowledgeBaseService.getAvailableNarrativeTemplates();
    
    return NextResponse.json({
      success: true,
      count: templates.length,
      templates: templates.map(template => ({
        id: template.id,
        name: template.name,
        description: template.description,
        type: template.type,
        difficulty: template.difficulty,
        categoryCompatibility: template.categoryCompatibility,
        priority: template.priority,
        isActive: template.isActive
      }))
    });
  } catch (error) {
    console.error('Error fetching narrative templates:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch narrative templates',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    const knowledgeBaseService = KnowledgeBaseService.getInstance();

    switch (action) {
      case 'seed':
        await knowledgeBaseService.seedNarrativeTemplates();
        return NextResponse.json({
          success: true,
          message: 'Narrative templates seeded successfully'
        });

      case 'test-generation':
        const { topicId, categoryId, narrativeTemplateId } = params;
        const prompt = await knowledgeBaseService.generateNarrativeEnhancedPrompt({
          topicId,
          categoryId,
          narrativeTemplateId,
          useNarrativeTemplates: true
        });
        
        return NextResponse.json({
          success: true,
          prompt: {
            topic: prompt.topic.topic,
            category: prompt.category.name,
            systemMessageLength: prompt.systemMessage.length,
            userPromptLength: prompt.userPrompt.length,
            systemMessage: prompt.systemMessage,
            userPrompt: prompt.userPrompt
          }
        });

      case 'get-compatible':
        const { categoryName, difficulty } = params;
        const compatibleTemplates = await knowledgeBaseService.getCompatibleNarrativeTemplates(
          categoryName, 
          difficulty
        );
        
        return NextResponse.json({
          success: true,
          count: compatibleTemplates.length,
          templates: compatibleTemplates.map(template => ({
            id: template.id,
            name: template.name,
            type: template.type,
            priority: template.priority
          }))
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in narrative templates API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'API operation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
