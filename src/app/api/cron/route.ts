import { NextRequest, NextResponse } from 'next/server';
import AutoPostService from '@/lib/autoPostService';

// This endpoint is designed to be called by external cron services
export async function POST(request: NextRequest) {
  try {
    const autoService = AutoPostService.getInstance();
    
    // Check if automation is enabled in database
    const status = await autoService.getStatus();
    
    if (!status.isRunning) {
      return NextResponse.json({
        success: true,
        message: 'Automation is disabled - no post generated',
        skipped: true
      });
    }

    // Generate post if automation is active
    await autoService.createAutomaticPost();
    
    return NextResponse.json({
      success: true,
      message: 'Cron job executed - new post generated',
      generated: true,
      totalPosts: status.totalPosts
    });

  } catch (error) {
    console.error('Error in cron job:', error);
    return NextResponse.json(
      { success: false, error: 'Cron job failed' },
      { status: 500 }
    );
  }
}

// Optional: Allow GET for testing
export async function GET() {
  try {
    const autoService = AutoPostService.getInstance();
    const status = await autoService.getStatus();
    
    return NextResponse.json({
      success: true,
      data: {
        isActive: status.isRunning,
        totalPosts: status.totalPosts,
        lastGenerated: status.lastGenerated,
        message: 'Cron endpoint is ready'
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to check status' },
      { status: 500 }
    );
  }
}
