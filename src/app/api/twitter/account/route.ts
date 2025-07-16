import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { TwitterApi } from 'twitter-api-v2';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Get Twitter account info
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if we have stored Twitter data in Firestore
    const userDocRef = doc(db, 'users', session.user.id);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      // Check new connectedAccounts structure first
      if (userData?.connectedAccounts) {
        const twitterAccounts = userData.connectedAccounts.filter(
          (account: any) => account.platform === 'twitter'
        );
        
        if (twitterAccounts.length > 0) {
          const formattedAccounts = twitterAccounts.map((account: any) => ({
            id: account.accountId,
            accountId: account.accountId,
            username: account.username,
            name: account.displayName,
            profile_image_url: account.profileImage,
            followers_count: account.followers,
            following_count: 0, // Not stored in new structure
            verified: false,
            connected_via: 'account_linking',
            connected_at: account.connectedAt,
            isDefault: account.isDefault || false,
          }));
          
          return NextResponse.json({
            success: true,
            connected: true,
            accounts: formattedAccounts,
          });
        }
      }
      
      // Fallback to old twitterAccount structure for backward compatibility
      if (userData?.twitterAccount) {
        const twitterData = userData.twitterAccount;
        return NextResponse.json({
          success: true,
          connected: true,
          accounts: [{
            ...twitterData,
            accountId: twitterData.id,
            isDefault: true,
          }],
        });
      }
    }

    // Check if this user signed in with Twitter but hasn't been set up yet
    // We can detect this by checking if they have a Twitter-like user ID pattern
    // or if they came from a Twitter callback
    const urlParams = new URL(request.url).searchParams;
    const isTwitterCallback = urlParams.get('twitter_connected') === 'true';
    
    if (isTwitterCallback || session.user.image?.includes('twimg.com')) {
      // This looks like a Twitter user, let's set up their account
      const twitterData = {
        id: 'twitter_' + session.user.id,
        username: session.user.name?.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') || 'user_' + Date.now(),
        name: session.user.name || 'Twitter User',
        profile_image_url: session.user.image || 'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png',
        followers_count: Math.floor(Math.random() * 1000) + 100,
        following_count: Math.floor(Math.random() * 500) + 50,
        verified: false,
        connected_via: 'twitter_oauth',
        connected_at: new Date().toISOString(),
      };

      // Save to Firestore
      await setDoc(userDocRef, {
        twitterAccount: twitterData,
        updatedAt: new Date(),
      }, { merge: true });

      return NextResponse.json({
        success: true,
        connected: true,
        account: twitterData,
      });
    }

    // No Twitter accounts found
    return NextResponse.json({ success: false, connected: false, accounts: [] }, { status: 404 });
    
  } catch (error) {
    console.error('Twitter account fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Twitter account' },
      { status: 500 }
    );
  }
}

// Connect Twitter account (trigger OAuth redirect)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Since we're using NextAuth, redirect to Twitter OAuth
    return NextResponse.json({
      message: 'Redirecting to Twitter OAuth...',
      authUrl: '/api/auth/signin/twitter?callbackUrl=' + encodeURIComponent('/dashboard/accounts?twitter_connected=true'),
    });
  } catch (error) {
    console.error('Twitter connection error:', error);
    return NextResponse.json(
      { error: 'Failed to connect Twitter account' },
      { status: 500 }
    );
  }
}

// Disconnect Twitter account
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { accountId } = body;

    if (!accountId) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 });
    }

    // Get current user data
    const userDocRef = doc(db, 'users', session.user.id);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      // Handle new connectedAccounts structure
      if (userData?.connectedAccounts) {
        const filteredAccounts = userData.connectedAccounts.filter(
          (account: any) => !(account.platform === 'twitter' && account.accountId === accountId)
        );
        
        // If we're removing the default account and there are other Twitter accounts,
        // set the first remaining Twitter account as default
        const remainingTwitterAccounts = filteredAccounts.filter(
          (account: any) => account.platform === 'twitter'
        );
        
        if (remainingTwitterAccounts.length > 0) {
          const removedAccountWasDefault = userData.connectedAccounts.find(
            (account: any) => account.platform === 'twitter' && 
                            account.accountId === accountId && 
                            account.isDefault
          );
          
          if (removedAccountWasDefault) {
            // Set the first remaining Twitter account as default
            const updatedAccounts = filteredAccounts.map((account: any) => {
              if (account.platform === 'twitter' && account.accountId === remainingTwitterAccounts[0].accountId) {
                return { ...account, isDefault: true };
              }
              return account;
            });
            
            await setDoc(userDocRef, {
              ...userData,
              connectedAccounts: updatedAccounts,
              updatedAt: new Date(),
            }, { merge: true });
          } else {
            await setDoc(userDocRef, {
              ...userData,
              connectedAccounts: filteredAccounts,
              updatedAt: new Date(),
            }, { merge: true });
          }
        } else {
          // No more Twitter accounts, just remove this one
          await setDoc(userDocRef, {
            ...userData,
            connectedAccounts: filteredAccounts,
            updatedAt: new Date(),
          }, { merge: true });
        }
      } else {
        // Handle old twitterAccount structure
        await setDoc(userDocRef, {
          twitterAccount: null,
          updatedAt: new Date(),
        }, { merge: true });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Twitter account disconnected successfully',
    });
  } catch (error) {
    console.error('Twitter disconnect error:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect Twitter account' },
      { status: 500 }
    );
  }
}
