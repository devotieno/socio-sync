import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const threadsAppId = process.env.THREADS_APP_ID;
  
  if (!threadsAppId) {
    return NextResponse.json({ error: 'Threads app configuration missing' }, { status: 500 });
  }

  // Generate state parameter for security
  const state = Math.random().toString(36).substring(2, 15);
  
  // Store state in session or database for verification
  // For simplicity, we'll use a basic approach here
  
  const scopes = [
    'threads_basic',
    'threads_content_publish',
    'threads_manage_insights'
  ].join(',');

  const authUrl = new URL('https://threads.net/oauth/authorize');
  authUrl.searchParams.set('client_id', threadsAppId);
  authUrl.searchParams.set('redirect_uri', `${process.env.NEXTAUTH_URL}/api/threads/callback`);
  authUrl.searchParams.set('scope', scopes);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('state', state);

  return NextResponse.redirect(authUrl.toString());
}
