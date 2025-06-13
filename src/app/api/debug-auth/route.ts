import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  console.log('🔍 Debug auth endpoint called');
  
  // Log all headers
  const headers = Object.fromEntries(request.headers.entries());
  console.log('🔍 Request headers:', headers);
  
  // Try to authenticate
  try {
    const auth = await authenticateRequest(request);
    console.log('🔍 Authentication result:', auth);
    
    if (auth) {
      return NextResponse.json({
        success: true,
        message: 'Authentication successful',
        user: auth.user
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Authentication failed - no auth returned'
      });
    }
  } catch (error) {
    console.error('🔍 Authentication error:', error);
    return NextResponse.json({
      success: false,
      message: 'Authentication error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
