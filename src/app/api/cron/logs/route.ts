import { NextRequest, NextResponse } from 'next/server';
import { cronService } from '../../../../lib/cronService';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Logs API called:', request.url);
    console.log('🔍 Request headers:', Object.fromEntries(request.headers.entries()));
    
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const limit = parseInt(searchParams.get('limit') || '50');

    console.log('🔍 Logs API params:', { jobId, limit });

    let result;
      if (jobId) {
      // Get history for specific job
      console.log('🔍 Getting history for job:', jobId);
      result = await cronService.getJobHistory(jobId, limit);
    } else {
      // Get all executions if no specific job is requested
      console.log('🔍 Getting all executions, limit:', limit);
      result = await cronService.getAllExecutions(limit);
    }

    console.log('🔍 Logs API result:', { 
      success: result.success, 
      executionCount: result.executions?.length,
      hasError: !!result.error 
    });    if (!result.success) {
      console.error('🚨 Logs API error:', result.error);
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }

    console.log('✅ Logs API success, returning executions:', result.executions?.length);
    return NextResponse.json({
      success: true,
      executions: result.executions || []
    });  } catch (error) {
    console.error('🚨 Error fetching cron job logs:', error);
    console.error('🚨 Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}
