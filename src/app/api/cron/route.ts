import { NextRequest, NextResponse } from 'next/server';
import AutoPostService from '@/lib/autoPostService';

// Secret API key for cron job authentication
const CRON_API_KEY = process.env.CRON_API_KEY || 'default-cron-secret-key-please-change';

// This endpoint is designed to be called by external cron services
export async function POST(request: NextRequest) {
  try {
    // API key authentication
    const apiKey = request.headers.get('x-api-key');
    
    // Check if API key is valid
    if (apiKey !== CRON_API_KEY) {
      console.log('⚠️ Invalid API key used for cron job');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
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

// Optional: Allow GET for testing - also secured with API key
export async function GET(request: NextRequest) {
  try {
    // API key authentication
    const apiKey = request.headers.get('x-api-key');
    
    // Check if API key is valid
    if (apiKey !== CRON_API_KEY) {
      console.log('⚠️ Invalid API key used for cron job status check');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const autoService = AutoPostService.getInstance();
    const status = await autoService.getStatus();
    
    return NextResponse.json({
      success: true,
      data: {
        isActive: status.isRunning,
        totalPosts: status.totalPosts,
        lastGenerated: status.lastGenerated,
      }
    });
  } catch (error) {
    console.error('Error getting cron status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get cron status' },
      { status: 500 }
    );
  }
}
