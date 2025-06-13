import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    
    if (auth) {
      return NextResponse.json({
        success: true,
        valid: true,
        user: auth.user
      });
    } else {
      return NextResponse.json({
        success: true,
        valid: false,
        message: 'Token is invalid or expired'
      });
    }
  } catch (error) {
    return NextResponse.json({
      success: true,
      valid: false,
      message: 'Token validation failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
