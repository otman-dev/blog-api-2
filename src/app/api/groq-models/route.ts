import { NextRequest, NextResponse } from 'next/server';
import { getGroqModels, createGroqModel, updateGroqModel, deleteGroqModel } from '@/lib/groqModelService';

export async function GET() {
  try {
    const models = await getGroqModels();
    return NextResponse.json({ 
      success: true, 
      data: models 
    });
  } catch (error) {
    console.error('Error fetching GroqModels:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch GroqModels' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const model = await createGroqModel(data);
    return NextResponse.json({ 
      success: true, 
      data: model,
      message: 'GroqModel created successfully' 
    });
  } catch (error) {
    console.error('Error creating GroqModel:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create GroqModel' },
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
        { success: false, error: 'Model ID is required' },
        { status: 400 }
      );
    }

    const model = await updateGroqModel(id, updateData);
    return NextResponse.json({ 
      success: true, 
      data: model,
      message: 'GroqModel updated successfully' 
    });
  } catch (error) {
    console.error('Error updating GroqModel:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update GroqModel' },
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
        { success: false, error: 'Model ID is required' },
        { status: 400 }
      );
    }

    await deleteGroqModel(id);
    return NextResponse.json({ 
      success: true,
      message: 'GroqModel deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting GroqModel:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete GroqModel' },
      { status: 500 }
    );
  }
}
