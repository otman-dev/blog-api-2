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
      frequency = 'daily', 
      publishTime = '08:00',
      platforms = ['website'],
      contentFilters = {}
    } = await request.json();

    const [hours, minutes] = publishTime.split(':').map(Number);

    // Create a publishing automation cron job
    const jobData = {
      title: `Content Publishing - ${frequency}`,
      url: `${request.nextUrl.origin}/api/cron/publish`,
      category: 'publishing' as const,
      priority: 'high' as const,
      enabled: true,
      saveResponses: true,
      schedule: {
        timezone: 'UTC',
        hours: [hours],
        mdays: frequency === 'monthly' ? [1, 15] : [-1], // 1st and 15th for monthly
        minutes: [minutes],
        months: [-1],
        wdays: frequency === 'weekly' ? [1, 3, 5] : [-1] // Mon, Wed, Fri for weekly
      },
      requestMethod: 1, // POST
      extendedData: {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          platforms,
          contentFilters,
          frequency,
          publishTime
        })
      },
      notification: {
        onFailure: true,
        onSuccess: true, // Important for publishing
        onDisable: true
      },
      maxRetries: 3,
      createdBy: user.email,
      metadata: {
        description: `Automated content publishing running ${frequency} at ${publishTime}`,
        tags: ['publishing', 'content', 'automation', frequency],
        automationType: 'content-publishing',
        platforms
      }
    };

    const result = await cronService.createJob(jobData);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      job: result.job,
      message: `Content publishing automation created with ${frequency} frequency at ${publishTime}`
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating content publishing automation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
