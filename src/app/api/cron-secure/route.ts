import { NextResponse } from 'next/server';
import AutoPostService from '@/lib/autoPostService';

// Secret API key - set this in your Vercel environment variables
const API_KEY = process.env.CRON_API_KEY || 'temporary-dev-cron-api-key';

/**
 * Endpoint for secure cron job access using API key
 * This endpoint bypasses JWT authentication for automated scheduling
 */
export async function GET(request: Request) {
  try {
    // Get the API key from the request header or query parameter
    const apiKey = request.headers.get('x-api-key') || 
                 new URL(request.url).searchParams.get('key');
    
    // Check if API key is valid
    if (apiKey !== API_KEY) {
      console.log('⚠️ Unauthorized cron access attempt');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    console.log('🔄 Authorized cron job execution started');
    const autoService = AutoPostService.getInstance();
    
    // Check if automation is enabled in database
    const status = await autoService.getStatus();
    
    if (!status.isRunning) {
      console.log('ℹ️ Cron job triggered but automation is disabled');
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
  } catch (error: any) {
    console.error('❌ Error in cron job:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate post' },
      { status: 500 }
    );
  }
}
