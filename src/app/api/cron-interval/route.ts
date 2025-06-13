import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { MongoClient } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    // Check authentication before proceeding
    try {
      await requireAuth(request);
    } catch (error) {
      console.log('🔍 Authentication failed for cron-interval:', error);
      return NextResponse.json(
        { success: false, error: 'Authentication required. Please log in again.' },
        { status: 401 }
      );
    }

    // Connect to the blog-cron database
    const cronDbUri = process.env.MONGODB_CRON_URI;
    if (!cronDbUri) {
      throw new Error('MONGODB_CRON_URI environment variable is not set');
    }

    const client = new MongoClient(cronDbUri);
    await client.connect();
    const db = client.db('blog-cron');
    
    try {
      // Find the active Blog Auto Generator cron job
      const cronJob = await db.collection('cronjobs').findOne({
        title: 'Blog Auto Generator',
        enabled: true,
        status: 'active'
      });

      if (!cronJob) {
        return NextResponse.json({
          success: false,
          error: 'No active Blog Auto Generator cron job found'
        }, { status: 404 });
      }

      // Calculate interval from the schedule
      const schedule = cronJob.schedule;
      let intervalMinutes = 60; // Default to 60 minutes
      
      if (schedule && schedule.minutes && Array.isArray(schedule.minutes)) {
        // If minutes array has values, calculate the interval
        const minutesCount = schedule.minutes.length;
        if (minutesCount > 0) {
          intervalMinutes = Math.floor(60 / minutesCount);
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          intervalMinutes,
          intervalMs: intervalMinutes * 60 * 1000,
          cronJob: {
            title: cronJob.title,
            enabled: cronJob.enabled,
            status: cronJob.status,
            lastExecution: cronJob.lastExecution,
            nextExecution: cronJob.nextExecution,
            schedule: cronJob.schedule
          }
        }
      });

    } finally {
      await client.close();
    }

  } catch (error) {
    console.error('Error getting cron interval:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get cron interval'
    }, { status: 500 });
  }
}
