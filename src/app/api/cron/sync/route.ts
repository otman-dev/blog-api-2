import { NextRequest, NextResponse } from 'next/server';
import { cronService } from '../../../../lib/cronService';
import { verifyToken } from '../../../../lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    console.log('Manual sync requested by:', user.email);

    // Sync jobs from cron.org
    const syncResult = await cronService.syncJobs();
    
    if (!syncResult.success) {
      return NextResponse.json({ 
        error: syncResult.error,
        success: false 
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Jobs synced successfully from cron.org',
      data: syncResult.data,
      syncedAt: new Date()
    });
  } catch (error) {
    console.error('Error syncing jobs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
