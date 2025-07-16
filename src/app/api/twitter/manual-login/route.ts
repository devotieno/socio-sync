import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { TwitterManualAuth } from '@/lib/twitter-manual-auth';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Manual Twitter login with username/password
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    // Initialize Twitter manual authentication
    const twitterAuth = new TwitterManualAuth();
    
    // For backward compatibility, redirect to PIN-based auth
    const authResult = await twitterAuth.initiateAuth();

    if (!authResult.success) {
      return NextResponse.json({ 
        error: authResult.error || 'Authentication failed' 
      }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      message: 'Please use PIN-based authentication for security',
      requiresPIN: true,
      authUrl: authResult.authUrl,
      requestToken: authResult.requestToken,
      requestTokenSecret: authResult.requestTokenSecret,
    });

  } catch (error) {
    console.error('Manual Twitter login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
