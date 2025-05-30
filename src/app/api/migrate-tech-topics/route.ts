import { NextRequest, NextResponse } from 'next/server';
import { TechTopicService } from '@/lib/techTopicService';
import { KnowledgeBaseLoader } from '@/lib/knowledgeBase/loader';
import { authenticateRequest } from '@/lib/middleware';

/**
 * POST endpoint to migrate tech topics from JSON file to MongoDB
 * This should be a protected endpoint that only admins can access
 */
export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and admin
    const authResult = await authenticateRequest(request);
    if (!authResult?.user?.email || authResult.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      );
    }

    // Start migration
    const techTopicService = TechTopicService.getInstance();
    await techTopicService.seedTopicsFromFile();

    return NextResponse.json(
      { message: 'Tech topics migrated successfully from JSON file to MongoDB' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error migrating tech topics:', error);
    return NextResponse.json(
      { error: 'Failed to migrate tech topics', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to verify tech topics in the database
 */
export async function GET() {
  try {
    const techTopicService = TechTopicService.getInstance();
    const topics = await techTopicService.getAllTopics();

    return NextResponse.json({
      message: 'Tech topics retrieved successfully',
      count: topics.length,
      topics: topics.map(topic => ({
        id: topic.id,
        topic: topic.topic,
        category: topic.category
      }))
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error retrieving tech topics:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve tech topics', details: error.message },
      { status: 500 }
    );
  }
}
