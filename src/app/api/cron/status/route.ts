import { NextRequest, NextResponse } from 'next/server';
import { cronService } from '../../../../lib/cronService';
import { verifyToken } from '../../../../lib/auth';

export async function GET(request: NextRequest) {
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

    const result = await cronService.getJobStatistics();

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      statistics: result.stats
    });
  } catch (error) {
    console.error('Error fetching cron job statistics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
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

    const { jobId, status } = await request.json();

    if (!jobId || !status) {
      return NextResponse.json({ 
        error: 'Job ID and status are required' 
      }, { status: 400 });
    }    // Update job status - we'll need to handle this differently since status isn't in CronJobCreateData
    const getResult = await cronService.getJobById(jobId);
    if (!getResult.success || !getResult.job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Update the job with enabled status based on the status
    const updateData = {
      enabled: status === 'active'
    };

    const result = await cronService.updateJob(jobId, updateData);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      job: result.job,
      message: `Job status updated to ${status}`
    });
  } catch (error) {
    console.error('Error updating cron job status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
