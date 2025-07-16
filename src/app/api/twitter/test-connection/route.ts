import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Test Twitter connection for debugging
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's Twitter accounts
    const userDoc = await getDoc(doc(db, 'users', session.user.id));
    const userData = userDoc.data();
    const connectedAccounts = userData?.connectedAccounts || [];
    
    // Find Twitter accounts for this user
    const twitterAccounts = connectedAccounts.filter((account: any) => account.platform === 'twitter');
    
    if (twitterAccounts.length === 0) {
      return NextResponse.json({ error: 'No Twitter accounts connected' }, { status: 404 });
    }

    // Use the default Twitter account or the first one
    const defaultAccount = twitterAccounts.find((account: any) => account.isDefault) || twitterAccounts[0];
    
    console.log('Testing Twitter connection for:', defaultAccount.username);
    console.log('Consumer keys available:', {
      consumerKey: !!process.env.TWITTER_CONSUMER_KEY,
      consumerSecret: !!process.env.TWITTER_CONSUMER_SECRET,
    });
    
    console.log('User tokens:', {
      accessToken: {
        available: !!defaultAccount.accessToken,
        length: defaultAccount.accessToken?.length,
        preview: defaultAccount.accessToken?.substring(0, 10) + '...' + defaultAccount.accessToken?.substring(-5),
      },
      accessSecret: {
        available: !!defaultAccount.refreshToken,
        length: defaultAccount.refreshToken?.length,
        preview: defaultAccount.refreshToken?.substring(0, 10) + '...' + defaultAccount.refreshToken?.substring(-5),
      },
      connectedAt: defaultAccount.connectedAt,
      connectionType: defaultAccount.connectionType,
    });

    const { TwitterApi } = require('twitter-api-v2');
    
    // Test basic client creation
    try {
      const twitterClient = new TwitterApi({
        appKey: process.env.TWITTER_CONSUMER_KEY!,
        appSecret: process.env.TWITTER_CONSUMER_SECRET!,
        accessToken: defaultAccount.accessToken,
        accessSecret: defaultAccount.refreshToken,
      });

      // Test v1.1 credentials verification
      try {
        const credentials = await twitterClient.v1.verifyCredentials();
        return NextResponse.json({
          success: true,
          message: 'Twitter connection successful',
          user: {
            id: credentials.id_str,
            username: credentials.screen_name,
            name: credentials.name,
          },
          api_version: 'v1.1',
        });
      } catch (v1Error: any) {
        console.error('v1.1 test failed:', v1Error);
        
        // Test v2 API
        try {
          const user = await twitterClient.v2.me();
          return NextResponse.json({
            success: true,
            message: 'Twitter connection successful',
            user: {
              id: user.data.id,
              username: user.data.username,
              name: user.data.name,
            },
            api_version: 'v2',
          });
        } catch (v2Error: any) {
          console.error('v2 test failed:', v2Error);
          
          return NextResponse.json({
            error: 'Both API versions failed',
            details: {
              v1_error: v1Error.message,
              v2_error: v2Error.message,
              v1_code: v1Error.code,
              v2_code: v2Error.code,
            },
          }, { status: 401 });
        }
      }
    } catch (clientError: any) {
      console.error('Client creation failed:', clientError);
      return NextResponse.json({
        error: 'Failed to create Twitter client',
        details: clientError.message,
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Test connection error:', error);
    return NextResponse.json({
      error: 'Failed to test Twitter connection',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
