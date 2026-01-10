import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { TwitterManualAuth } from '@/lib/twitter-manual-auth';

// Get Twitter authentication URL for OAuth flow
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Initialize Twitter manual authentication
    const twitterAuth = new TwitterManualAuth();
    
    // Initiate PIN-based authentication
    const authResult = await twitterAuth.initiateAuth();

    if (!authResult.success) {
      return NextResponse.json({ 
        error: authResult.error || 'Failed to initiate authentication' 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      authUrl: authResult.authUrl,
      requestToken: authResult.requestToken,
      requestTokenSecret: authResult.requestTokenSecret,
    });

  } catch (error) {
    console.error('Twitter auth error:', error);
    return NextResponse.json({ 
      error: 'Failed to get Twitter auth URL',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
