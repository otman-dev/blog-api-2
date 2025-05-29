import { NextRequest, NextResponse } from 'next/server';
import { getAutomationState, setAutomationState } from '../../../models/AutomationState';
import { requireAuth } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    // Check authentication before proceeding
    try {
      await requireAuth(request);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const state = await getAutomationState();
    return NextResponse.json({
      success: true,
      data: {
        isActive: state.isActive,
        lastUpdated: state.lastUpdated,
        lastPostGenerated: state.lastPostGenerated,
        totalPostsGenerated: state.totalPostsGenerated,
        interval: state.interval
      }
    });
  } catch (error) {
    console.error('Error getting automation state:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get automation state'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { isActive } = body;

    if (typeof isActive !== 'boolean') {
      return NextResponse.json({
        success: false,
        error: 'isActive must be a boolean'
      }, { status: 400 });
    }

    const state = await setAutomationState(isActive);
    
    return NextResponse.json({
      success: true,
      data: {
        isActive: state.isActive,
        lastUpdated: state.lastUpdated,
        lastPostGenerated: state.lastPostGenerated,
        totalPostsGenerated: state.totalPostsGenerated,
        interval: state.interval
      }
    });
  } catch (error) {
    console.error('Error setting automation state:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to set automation state'
    }, { status: 500 });
  }
}
