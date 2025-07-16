import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Test endpoint called');
    return NextResponse.json({ 
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'API is working'
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
