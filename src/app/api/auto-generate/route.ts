import { NextRequest, NextResponse } from 'next/server';
import AutoPostService from '@/lib/autoPostService';

export async function POST(request: NextRequest) {
  try {
    const autoService = AutoPostService.getInstance();
    const body = await request.json();
    const { action, intervalMinutes } = body;

    switch (action) {
      case 'start':
        autoService.startAutoGeneration(intervalMinutes || 3);
        return NextResponse.json({
          success: true,
          message: `Automatic post generation started every ${intervalMinutes || 3} minutes`
        });

      case 'stop':
        autoService.stopAutoGeneration();
        return NextResponse.json({
          success: true,
          message: 'Automatic post generation stopped'
        });

      case 'generate-now':
        await autoService.createAutomaticPost();
        return NextResponse.json({
          success: true,
          message: 'New post generated successfully'
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in auto-generation API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const autoService = AutoPostService.getInstance();
    const status = autoService.getStatus();
    
    return NextResponse.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error getting auto-generation status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get status' },
      { status: 500 }
    );
  }
}
