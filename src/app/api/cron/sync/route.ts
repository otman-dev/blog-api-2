import { NextRequest, NextResponse } from 'next/server';
import { cronService } from '../../../../lib/cronService';
import { verifyToken } from '../../../../lib/auth';

export async function POST(request: NextRequest) {
  console.log('=== SYNC API STARTED ===');
  try {
    console.log('Sync API called');
    
    // Verify authentication
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      console.log('No token provided');
      const errorResponse = { error: 'Unauthorized', success: false };
      console.log('Returning error response:', errorResponse);
      return NextResponse.json(errorResponse, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      console.log('Invalid token');
      const errorResponse = { error: 'Invalid token', success: false };
      console.log('Returning error response:', errorResponse);
      return NextResponse.json(errorResponse, { status: 401 });
    }

    console.log('Manual sync requested by:', user.email);
    console.log('Starting cronService.syncJobs()...');

    // Sync jobs from cron.org
    const syncResult = await cronService.syncJobs();
    
    console.log('Sync result received:', { success: syncResult.success, error: syncResult.error, dataKeys: Object.keys(syncResult.data || {}) });
    
    if (!syncResult.success) {
      const errorResponse = { 
        error: syncResult.error || 'Sync failed',
        success: false 
      };
      console.log('Returning sync error:', errorResponse);
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const successResponse = {
      success: true,
      message: 'Jobs synced successfully from cron.org',
      data: syncResult.data || { jobsSynced: 0, executionsSynced: 0 },
      syncedAt: new Date().toISOString()
    };
    
    console.log('Returning success response:', successResponse);
    console.log('=== SYNC API COMPLETED SUCCESSFULLY ===');
    
    return NextResponse.json(successResponse);
  } catch (error) {
    console.error('=== SYNC API ERROR ===');
    console.error('Error syncing jobs:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    
    const errorResponse = { 
      error: error instanceof Error ? error.message : 'Internal server error',
      success: false 
    };
    
    console.log('Returning catch error response:', errorResponse);
    console.log('=== SYNC API COMPLETED WITH ERROR ===');
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
