import { NextRequest, NextResponse } from 'next/server';
import { getNarrativeTemplates, createNarrativeTemplate, updateNarrativeTemplate, deleteNarrativeTemplate, getNarrativeTemplateById } from '@/lib/narrativeTemplateService';

export async function GET() {
  try {
    const templates = await getNarrativeTemplates();
    return NextResponse.json({ 
      success: true, 
      data: templates 
    });
  } catch (error) {
    console.error('Error fetching NarrativeTemplates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch NarrativeTemplates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const template = await createNarrativeTemplate(data);
    return NextResponse.json({ 
      success: true, 
      data: template,
      message: 'NarrativeTemplate created successfully' 
    });
  } catch (error) {
    console.error('Error creating NarrativeTemplate:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create NarrativeTemplate' },
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
        { success: false, error: 'Template ID is required' },
        { status: 400 }
      );
    }

    const template = await updateNarrativeTemplate(id, updateData);
    return NextResponse.json({ 
      success: true, 
      data: template,
      message: 'NarrativeTemplate updated successfully' 
    });
  } catch (error) {
    console.error('Error updating NarrativeTemplate:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update NarrativeTemplate' },
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
        { success: false, error: 'Template ID is required' },
        { status: 400 }
      );
    }

    await deleteNarrativeTemplate(id);
    return NextResponse.json({ 
      success: true,
      message: 'NarrativeTemplate deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting NarrativeTemplate:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete NarrativeTemplate' },
      { status: 500 }
    );
  }
}
