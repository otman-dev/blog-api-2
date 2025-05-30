import { NextResponse } from 'next/server';
import { TechTopicService } from '@/lib/techTopicService';
import { KnowledgeBaseLoader } from '@/lib/knowledgeBase/loader';

/**
 * GET endpoint to test fetching tech topics from both the file and database
 * This is a public endpoint for testing
 */
export async function GET() {
  try {
    const techTopicService = TechTopicService.getInstance();
    const knowledgeBaseLoader = KnowledgeBaseLoader.getInstance();
    
    // Test 1: Get topics from database via service
    const topicsFromDb = await techTopicService.getAllTopics();
    
    // Test 2: Get topics via KnowledgeBaseLoader (should now use database)
    const topicsFromLoader = await knowledgeBaseLoader.getTopics();
    
    // Test 3: Get a random topic via loader
    const randomTopic = await knowledgeBaseLoader.getRandomTopic();
    
    return NextResponse.json({
      message: 'Tech topics retrieved successfully',
      databaseCount: topicsFromDb.length,
      loaderCount: topicsFromLoader.length,
      randomTopic: {
        id: randomTopic.id,
        title: randomTopic.topic,
        category: randomTopic.category
      }
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error testing tech topics:', error);
    return NextResponse.json(
      { error: 'Failed to test tech topics', details: error.message },
      { status: 500 }
    );
  }
}
