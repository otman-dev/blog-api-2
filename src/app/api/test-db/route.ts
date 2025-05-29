import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';

export async function GET() {
  try {
    await dbConnect();
    console.log('✅ MongoDB connection successful!');
    
    return NextResponse.json({
      success: true,
      message: 'MongoDB connection successful!'
    });
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'MongoDB connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
