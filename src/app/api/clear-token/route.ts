import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    success: true,
    message: 'Token cleared successfully',
    instructions: [
      'Clear your browser localStorage by running this in console:',
      'localStorage.removeItem("token");',
      'localStorage.removeItem("user");',
      'window.location.reload();'
    ]
  });
}
