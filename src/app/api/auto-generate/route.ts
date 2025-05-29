import { NextRequest, NextResponse } from 'next/server';
import AutoPostService from '@/lib/autoPostService';
import { requireAuth } from '@/lib/middleware';

export async function POST(request: NextRequest) {
  try {
    // Check authentication before proceeding
    try {
      await requireAuth(request);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const autoService = AutoPostService.getInstance();
    const body = await request.json();
    const { action, intervalMinutes } = body;

    switch (action) {      
      case 'start':
        await autoService.startAutoGeneration(intervalMinutes || 10);
        return NextResponse.json({
          success: true,
          message: `Automatic post generation started every ${intervalMinutes || 10} minutes`
        });

      case 'stop':
        await autoService.stopAutoGeneration();
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

      case 'cron-generate':
        // Special action for cron services - checks database state first
        const status = await autoService.getStatus();
        if (status.isRunning) {
          await autoService.createAutomaticPost();
          return NextResponse.json({
            success: true,
            message: 'Cron: New post generated'
          });
        } else {
          return NextResponse.json({
            success: true,
            message: 'Cron: Automation is disabled, no post generated'
          });
        }

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
    const status = await autoService.getStatus();
    
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
