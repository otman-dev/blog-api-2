import { NextRequest, NextResponse } from 'next/server';
import { getTechTopics, createTechTopic, updateTechTopic, deleteTechTopic } from '@/lib/techTopicService';

export async function GET() {
  try {
    const topics = await getTechTopics();
    return NextResponse.json({ 
      success: true, 
      data: topics 
    });
  } catch (error) {
    console.error('Error fetching TechTopics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch TechTopics' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const topic = await createTechTopic(data);
    return NextResponse.json({ 
      success: true, 
      data: topic,
      message: 'TechTopic created successfully' 
    });
  } catch (error) {
    console.error('Error creating TechTopic:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create TechTopic' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Topic ID is required' },
        { status: 400 }
      );
    }

    const topic = await updateTechTopic(id, updateData);
    return NextResponse.json({ 
      success: true, 
      data: topic,
      message: 'TechTopic updated successfully' 
    });
  } catch (error) {
    console.error('Error updating TechTopic:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update TechTopic' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Topic ID is required' },
        { status: 400 }
      );
    }

    await deleteTechTopic(id);
    return NextResponse.json({ 
      success: true,
      message: 'TechTopic deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting TechTopic:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete TechTopic' },
      { status: 500 }
    );
  }
}
