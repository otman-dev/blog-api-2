import { NextRequest, NextResponse } from 'next/server';
import { cronService } from '../../../../../lib/cronService';
import { verifyToken } from '../../../../../lib/auth';

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

    const { 
      frequency = 'weekly', 
      maintenanceTasks = ['cleanup', 'optimize', 'backup'],
      runTime = '02:00' // 2 AM by default
    } = await request.json();

    const [hours, minutes] = runTime.split(':').map(Number);

    // Create a database maintenance cron job
    const jobData = {
      title: `Database Maintenance - ${frequency}`,
      url: `${request.nextUrl.origin}/api/cron/maintenance`,
      category: 'maintenance' as const,
      priority: 'medium' as const,
      enabled: true,
      saveResponses: true,
      schedule: {
        timezone: 'UTC',
        hours: [hours],
        mdays: frequency === 'monthly' ? [1] : [-1], // 1st of month for monthly
        minutes: [minutes],
        months: [-1],
        wdays: frequency === 'weekly' ? [0] : [-1] // Sunday for weekly
      },
      requestMethod: 1, // POST
      extendedData: {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tasks: maintenanceTasks,
          frequency
        })
      },
      notification: {
        onFailure: true,
        onSuccess: true, // Important for maintenance tasks
        onDisable: true
      },
      maxRetries: 2,
      createdBy: user.email,
      metadata: {
        description: `Automated database maintenance running ${frequency} at ${runTime}`,
        tags: ['maintenance', 'database', 'automation', frequency],
        automationType: 'database-maintenance',
        tasks: maintenanceTasks
      }
    };

    const result = await cronService.createJob(jobData);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      job: result.job,
      message: `Database maintenance automation created with ${frequency} frequency at ${runTime}`
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating database maintenance automation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
