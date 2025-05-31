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

    const { frequency = 'daily', topics = [], models = [] } = await request.json();

    // Create a content generation cron job
    const jobData = {
      title: `Content Generation - ${frequency}`,
      url: `${request.nextUrl.origin}/api/auto-generate`,
      category: 'content' as const,
      priority: 'high' as const,
      enabled: true,
      saveResponses: true,
      schedule: {
        timezone: 'UTC',
        hours: frequency === 'daily' ? [9] : [-1], // 9 AM daily or every hour
        mdays: [-1],
        minutes: frequency === 'hourly' ? [0] : [0],
        months: [-1],
        wdays: frequency === 'weekly' ? [1] : [-1] // Monday for weekly
      },
      requestMethod: 1, // POST
      extendedData: {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'start',
          intervalMinutes: frequency === 'hourly' ? 60 : 1440, // 1 hour or 24 hours
          topics,
          models
        })
      },
      notification: {
        onFailure: true,
        onSuccess: false,
        onDisable: true
      },
      maxRetries: 3,
      createdBy: user.email,
      metadata: {
        description: `Automated content generation running ${frequency}`,
        tags: ['content', 'automation', frequency],
        automationType: 'content-generation'
      }
    };

    const result = await cronService.createJob(jobData);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      job: result.job,
      message: `Content generation automation created with ${frequency} frequency`
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating content generation automation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
