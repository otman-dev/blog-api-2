import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Debug API endpoint called');
    
    // Check environment variables
    const hasMongodbUri = !!process.env.MONGODB_URI;
    const hasMongodbCronUri = !!process.env.MONGODB_CRON_URI;
    const hasCronApiKey = !!process.env.CRON_ORG_API_KEY;
    
    console.log('Environment check:', {
      hasMongodbUri,
      hasMongodbCronUri,
      hasCronApiKey,
      nodeEnv: process.env.NODE_ENV
    });

    // Try to import and test database connection
    let dbConnectionStatus = 'unknown';
    let dbError = null;
      try {
      const { connectToCronDB } = await import('../../../lib/db/cronDb');
      const connection = await connectToCronDB();
      dbConnectionStatus = connection.readyState === 1 ? 'connected' : 'disconnected';
    } catch (err) {
      dbConnectionStatus = 'error';
      dbError = err instanceof Error ? err.message : 'Unknown error';
      console.error('DB connection error:', err);
    }

    // Try to initialize cronService
    let cronServiceStatus = 'unknown';
    let cronServiceError = null;    try {
      const { cronService } = await import('../../../lib/cronService');
      await cronService.getJobStatistics();
      cronServiceStatus = 'initialized';
    } catch (err) {
      cronServiceStatus = 'error';
      cronServiceError = err instanceof Error ? err.message : 'Unknown error';
      console.error('CronService error:', err);
    }

    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: {
        hasMongodbUri,
        hasMongodbCronUri,
        hasCronApiKey,
        nodeEnv: process.env.NODE_ENV
      },
      database: {
        status: dbConnectionStatus,
        error: dbError
      },
      cronService: {
        status: cronServiceStatus,
        error: cronServiceError
      }
    };

    console.log('Debug info:', debugInfo);

    return NextResponse.json({
      success: true,
      debug: debugInfo
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Debug endpoint failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
