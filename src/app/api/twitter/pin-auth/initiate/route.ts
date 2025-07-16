import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { TwitterManualAuth } from '@/lib/twitter-manual-auth';

// Initiate PIN-based Twitter authentication
export async function POST(request: NextRequest) {
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
      message: 'Visit the auth URL to get your PIN',
    });

  } catch (error) {
    console.error('Twitter PIN auth initiation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
