import { NextRequest, NextResponse } from 'next/server';

// Debug endpoint to verify Twitter OAuth configuration
export async function GET(request: NextRequest) {
  try {
    const debugInfo = {
      environment: {
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        TWITTER_CLIENT_ID: process.env.TWITTER_CLIENT_ID ? 'SET' : 'NOT SET',
        TWITTER_CLIENT_SECRET: process.env.TWITTER_CLIENT_SECRET ? 'SET' : 'NOT SET',
      },
      expectedCallbackUrl: `${process.env.NEXTAUTH_URL}/api/twitter/link/callback`,
      currentUrl: request.url,
      headers: {
        host: request.headers.get('host'),
        origin: request.headers.get('origin'),
        referer: request.headers.get('referer'),
      }
    };

    return NextResponse.json(debugInfo, { status: 200 });
    
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { error: 'Debug failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
