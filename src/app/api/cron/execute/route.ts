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

    const { jobId } = await request.json();

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    const result = await cronService.executeJob(jobId, 'manual');

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      execution: result.execution,
      message: 'Job execution initiated'
    });
  } catch (error) {
    console.error('Error executing cron job:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
