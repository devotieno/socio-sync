import { adminDb } from '@/lib/firebase-admin';
import { SocialMediaPost } from '@/types/post';
import { TwitterApi } from 'twitter-api-v2';

// Function to fetch and store Twitter analytics
async function fetchAndStoreTwitterAnalytics(
  tweetId: string, 
  postId: string, 
  userId: string, 
  twitterAccount: any
) {
  try {
    console.log(`Fetching analytics for tweet ${tweetId}...`);
    
    // Create Twitter client
    let twitterClient;
    const isOAuth1 = twitterAccount.connectionType === 'pin_auth' || 
                     twitterAccount.accessToken.includes('-');
    
    if (isOAuth1) {
      twitterClient = new TwitterApi({
        appKey: process.env.TWITTER_CONSUMER_KEY!,
        appSecret: process.env.TWITTER_CONSUMER_SECRET!,
        accessToken: twitterAccount.accessToken,
        accessSecret: twitterAccount.refreshToken,
      });
    } else {
      twitterClient = new TwitterApi(twitterAccount.accessToken);
    }
    
    // Fetch tweet with metrics (using non-public metrics requires OAuth 1.0a or OAuth 2.0 user context)
    const tweet = await twitterClient.v2.singleTweet(tweetId, {
      'tweet.fields': ['public_metrics', 'non_public_metrics', 'organic_metrics', 'created_at'],
    });
    
    if (!tweet.data) {
      console.error('No tweet data returned from Twitter API');
      return;
    }
    
    const metrics = tweet.data.public_metrics as any || {};
    const nonPublicMetrics = tweet.data.non_public_metrics as any || {};
    const organicMetrics = tweet.data.organic_metrics as any || {};
    
    // Store analytics in Firestore
    const analyticsData = {
      postId,
      userId,
      tweetId,
      platform: 'twitter',
      accountId: twitterAccount.accountId,
      accountUsername: twitterAccount.username,
      // Public metrics (available to everyone)
      likes: metrics.like_count || 0,
      retweets: metrics.retweet_count || 0,
      replies: metrics.reply_count || 0,
      quotes: metrics.quote_count || 0,
      bookmarks: metrics.bookmark_count || 0,
      // Non-public metrics (available to tweet owner)
      impressions: nonPublicMetrics.impression_count || organicMetrics.impression_count || 0,
      urlClicks: nonPublicMetrics.url_link_clicks || organicMetrics.url_link_clicks || 0,
      userProfileClicks: nonPublicMetrics.user_profile_clicks || organicMetrics.user_profile_clicks || 0,
      // Metadata
      fetchedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Save to Firestore
    await adminDb.collection('postAnalytics').doc(postId).set(analyticsData, { merge: true });
    console.log(`Analytics stored for tweet ${tweetId}`);
    
  } catch (error) {
    console.error('Error fetching/storing Twitter analytics:', error);
    // Don't throw - analytics fetch shouldn't fail the post
  }
}

// Function to refresh Twitter OAuth 2.0 token
async function refreshTwitterToken(refreshToken: string, userId: string, accountId: string) {
  try {
    console.log('Attempting to refresh Twitter token...');
    
    const clientId = process.env.TWITTER_CLIENT_ID!;
    const clientSecret = process.env.TWITTER_CLIENT_SECRET!;
    
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
    const response = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Token refresh failed:', errorData);
      throw new Error(`Failed to refresh token: ${response.statusText}`);
    }
    
    const tokenData = await response.json();
    console.log('Token refreshed successfully');
    
    // Update the token in Firestore
    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      if (userData?.connectedAccounts) {
        const updatedAccounts = userData.connectedAccounts.map((acc: any) => {
          if (acc.accountId === accountId) {
            return {
              ...acc,
              accessToken: tokenData.access_token,
              refreshToken: tokenData.refresh_token || refreshToken, // Use new refresh token if provided
            };
          }
          return acc;
        });
        
        await adminDb.collection('users').doc(userId).update({
          connectedAccounts: updatedAccounts,
        });
      }
    }
    
    return {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token || refreshToken,
    };
  } catch (error) {
    console.error('Error refreshing Twitter token:', error);
    throw error;
  }
}

export async function publishToSocialMedia(postId: string, postData: Omit<SocialMediaPost, 'id'>, userId: string) {
  console.log('Publishing to social media:', { postId, userId, selectedAccounts: postData.selectedAccounts });
  
  let connectedAccounts: any[] = [];

  // First, try to get user's connected accounts from the socialAccounts collection
  const accountsSnapshot = await adminDb
    .collection('socialAccounts')
    .where('userId', '==', userId)
    .where('isActive', '==', true)
    .get();

  accountsSnapshot.forEach((doc) => {
    const data = doc.data();
    connectedAccounts.push({
      id: doc.id,
      accountId: doc.id, // Use document ID as accountId
      ...data,
    });
  });

  // If no accounts found in socialAccounts, check users collection for connectedAccounts
  if (connectedAccounts.length === 0) {
    console.log('No accounts found in socialAccounts, checking users collection...');
    const userDoc = await adminDb.collection('users').doc(userId).get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      
      if (userData?.connectedAccounts && Array.isArray(userData.connectedAccounts)) {
        console.log('Found connectedAccounts in users collection:', userData.connectedAccounts);
        connectedAccounts = userData.connectedAccounts.map((account: any) => ({
          id: account.accountId,
          accountId: account.accountId,
          platform: account.platform,
          username: account.username || account.displayName,
          accessToken: account.accessToken,
          refreshToken: account.refreshToken,
          isActive: true,
          ...account
        }));
      }
    }
  }
  
  console.log('Connected accounts found:', connectedAccounts.length);
  console.log('Connected accounts:', connectedAccounts);
  
  // Filter accounts to only those selected for this post
  const selectedConnectedAccounts = connectedAccounts.filter((account: any) => 
    postData.selectedAccounts.includes(account.accountId) || postData.selectedAccounts.includes(account.id)
  );
  
  console.log('Selected connected accounts:', selectedConnectedAccounts);
  
  if (selectedConnectedAccounts.length === 0) {
    // Check if the user has any accounts at all
    if (connectedAccounts.length === 0) {
      throw new Error('No social media accounts connected. Please connect at least one account to publish posts.');
    } else {
      throw new Error(`No valid accounts found for the selected account IDs: ${postData.selectedAccounts.join(', ')}. Available accounts: ${connectedAccounts.map((a: any) => a.accountId || a.id).join(', ')}`);
    }
  }
  
  // Group accounts by platform
  const accountsByPlatform = selectedConnectedAccounts.reduce((acc: any, account: any) => {
    if (!acc[account.platform]) {
      acc[account.platform] = [];
    }
    acc[account.platform].push(account);
    return acc;
  }, {});
  
  // Publish to each platform with the specific accounts
  for (const [platform, accounts] of Object.entries(accountsByPlatform)) {
    try {
      if (platform === 'twitter') {
        await publishToTwitterAccounts(postData, accounts as any[], postId, userId);
      } else {
        console.log(`Publishing to ${platform} not supported (Twitter-only app)`);
      }
    } catch (error) {
      console.error(`Error publishing to ${platform}:`, error);
      throw error;
    }
  }
}

async function publishToTwitterAccounts(postData: Omit<SocialMediaPost, 'id'>, twitterAccounts: any[], postId: string, userId: string) {
  const results: Array<{ account: string; success: boolean; tweetId?: string; error?: string }> = [];
  
  for (const account of twitterAccounts) {
    try {
      console.log(`Publishing to Twitter account: ${account.username}`);
      const result = await publishToSingleTwitterAccount(postData, account);
      results.push({ 
        account: account.username, 
        success: true,
        tweetId: result.tweetId 
      });
      
      // Fetch and store analytics for this tweet
      if (result.tweetId) {
        await fetchAndStoreTwitterAnalytics(result.tweetId, postId, userId, account);
      }
    } catch (error: any) {
      console.error(`Error publishing to Twitter account ${account.username}:`, error);
      results.push({ 
        account: account.username, 
        success: false, 
        error: error.message 
      });
    }
  }
  
  // Check if any published successfully
  const successfulPublishes = results.filter(r => r.success);
  const failedPublishes = results.filter(r => !r.success);
  
  if (successfulPublishes.length === 0 && failedPublishes.length > 0) {
    // All failed, throw the first error (likely rate limit)
    throw new Error(failedPublishes[0].error);
  } else if (failedPublishes.length > 0) {
    // Some succeeded, some failed - log the failures but don't throw
    console.warn(`Some Twitter publishes failed:`, failedPublishes);
  }
  
  return results;
}

async function publishToSingleTwitterAccount(postData: Omit<SocialMediaPost, 'id'>, twitterAccount: any) {
  try {
    console.log('Starting Twitter publishing...');
    console.log('Environment check:');
    console.log('TWITTER_CONSUMER_KEY:', process.env.TWITTER_CONSUMER_KEY ? 'Set' : 'Not set');
    console.log('TWITTER_CONSUMER_SECRET:', process.env.TWITTER_CONSUMER_SECRET ? 'Set' : 'Not set');
    console.log('Publishing to Twitter:', postData.content);
    
    console.log('Using Twitter account:', twitterAccount);
    console.log('Access token available:', !!twitterAccount.accessToken);
    console.log('Refresh token available:', !!twitterAccount.refreshToken);
    
    if (!twitterAccount.accessToken) {
      throw new Error('Twitter account missing access token. Please reconnect your Twitter account.');
    }

    // Detect authentication type and create appropriate client
    let twitterClient;
    let currentAccessToken = twitterAccount.accessToken;
    const isOAuth1 = twitterAccount.connectionType === 'pin_auth' || 
                     twitterAccount.accessToken.includes('-'); // OAuth 1.0a tokens have format: userId-token
    
    if (isOAuth1) {
      // OAuth 1.0a flow (PIN-based authentication)
      console.log('Using OAuth 1.0a authentication');
      
      if (!process.env.TWITTER_CONSUMER_KEY || !process.env.TWITTER_CONSUMER_SECRET) {
        throw new Error('Twitter consumer credentials not configured');
      }
      
      twitterClient = new TwitterApi({
        appKey: process.env.TWITTER_CONSUMER_KEY,
        appSecret: process.env.TWITTER_CONSUMER_SECRET,
        accessToken: twitterAccount.accessToken,
        accessSecret: twitterAccount.refreshToken, // In OAuth 1.0a, this is actually the access token secret
      });
      
      console.log('OAuth 1.0a client created successfully');
    } else {
      // OAuth 2.0 flow - PKCE
      console.log('Using OAuth 2.0 bearer token');
      twitterClient = new TwitterApi(currentAccessToken);
    }
    
    // Test the client first
    try {
      const user = await twitterClient.v2.me();
      console.log('Twitter API v2 connection successful, user:', user.data.username);
    } catch (clientError: any) {
      console.error('Twitter client test failed:', clientError);
      
      // Handle rate limit specifically
      if (clientError.code === 429 || clientError.status === 429) {
        console.error('Rate limit hit during authentication test');
        throw new Error('Twitter API rate limit exceeded. Please try again later.');
      }
      
      // Handle 401 - token expired, try to refresh
      if (clientError.code === 401 || clientError.status === 401) {
        if (twitterAccount.refreshToken && postData.userId) {
          console.log('Access token expired, attempting refresh...');
          try {
            const refreshedTokens = await refreshTwitterToken(
              twitterAccount.refreshToken, 
              postData.userId, 
              twitterAccount.accountId
            );
            currentAccessToken = refreshedTokens.accessToken;
            twitterClient = new TwitterApi(currentAccessToken);
            
            // Test again with new token
            const user = await twitterClient.v2.me();
            console.log('Twitter API v2 connection successful after refresh, user:', user.data.username);
          } catch (refreshError) {
            console.error('Failed to refresh token:', refreshError);
            throw new Error('Twitter access token expired and refresh failed. Please reconnect your Twitter account.');
          }
        } else {
          throw new Error('Twitter access token expired. Please reconnect your Twitter account.');
        }
      } else {
        throw new Error(`Twitter client configuration failed: ${clientError.message || 'Unknown error'}`);
      }
    }
    
    // Prepare tweet data
    const tweetData: any = {
      text: postData.content,
    };
    
    // Handle media files if present
    if (postData.mediaFiles && postData.mediaFiles.length > 0) {
      console.log(`Processing ${postData.mediaFiles.length} media files for Twitter upload...`);
      const mediaIds: string[] = [];
      
      for (const mediaFile of postData.mediaFiles) {
        try {
          console.log(`Downloading media from: ${mediaFile.url}`);
          // Download the image from Firebase Storage
          const response = await fetch(mediaFile.url);
          if (!response.ok) {
            throw new Error(`Failed to download media: ${response.statusText}`);
          }
          
          const buffer = await response.arrayBuffer();
          const bufferData = Buffer.from(buffer);
          console.log(`Media downloaded, size: ${bufferData.length} bytes`);
          
          // For OAuth 2.0, we need to use Twitter API v1.1 for media upload
          // but we need OAuth 1.0a credentials. Since we're using OAuth 2.0,
          // we'll use the v1 upload with the bearer token
          try {
            // Determine mime type from file URL or default to image/jpeg
            let mimeType = 'image/jpeg';
            if (mediaFile.url.includes('.png')) mimeType = 'image/png';
            else if (mediaFile.url.includes('.gif')) mimeType = 'image/gif';
            else if (mediaFile.url.includes('.webp')) mimeType = 'image/webp';
            
            console.log(`Uploading to Twitter with mime type: ${mimeType}`);
            
            // Upload using v1 API (works with OAuth 2.0 bearer token)
            const mediaId = await twitterClient.v1.uploadMedia(bufferData, { 
              mimeType,
              target: 'tweet',
            });
            
            console.log(`Media uploaded successfully to Twitter, media_id: ${mediaId}`);
            mediaIds.push(mediaId);
          } catch (uploadError: any) {
            console.error('Error uploading media to Twitter v1:', uploadError);
            
            // Handle rate limit for media upload
            if (uploadError.code === 429 || uploadError.status === 429) {
              throw new Error('Twitter API rate limit exceeded during media upload. Please try again later.');
            }
            
            // Log the full error for debugging
            console.error('Upload error details:', {
              code: uploadError.code,
              status: uploadError.status,
              message: uploadError.message,
              data: uploadError.data,
            });
            
            throw new Error(`Failed to upload media to Twitter: ${uploadError.message || 'Unknown error'}`);
          }
        } catch (mediaError: any) {
          console.error('Error processing media file:', mediaError);
          // For 403 errors (permission issues), warn but continue without media
          if (mediaError.message && mediaError.message.includes('403')) {
            console.warn('Media upload not permitted (403). Posting without media. Please check your Twitter app permissions.');
            // Continue to post without this media
          } else {
            throw mediaError; // Re-throw for other errors
          }
        }
      }
      
      if (mediaIds.length > 0) {
        console.log(`Adding ${mediaIds.length} media IDs to tweet:`, mediaIds);
        tweetData.media = { media_ids: mediaIds };
      }
    }
    
    // Post the tweet with rate limit handling
    try {
      const tweet = await twitterClient.v2.tweet(tweetData);
      console.log('Tweet posted successfully:', tweet.data.id);
      return { success: true, tweetId: tweet.data.id };
    } catch (tweetError: any) {
      console.error('Error posting tweet:', tweetError);
      
      // Handle rate limit specifically
      if (tweetError.code === 429 || tweetError.status === 429) {
        // Extract rate limit information if available
        const resetTime = tweetError.rateLimit?.reset || Math.floor(Date.now() / 1000) + 900; // Default 15 min
        const resetDate = new Date(resetTime * 1000);
        
        console.log('Rate limit hit. Reset time:', resetDate.toISOString());
        
        // Return a more user-friendly error with timing information
        const waitMinutes = Math.ceil((resetDate.getTime() - Date.now()) / (1000 * 60));
        throw new Error(`Twitter API rate limit exceeded for @${twitterAccount.username}. Please wait ${waitMinutes} minutes before posting again. Rate limit resets at ${resetDate.toLocaleTimeString()}.`);
      }
      
      // Handle other Twitter API errors
      if (tweetError.data && tweetError.data.errors) {
        const errorMessages = tweetError.data.errors.map((e: any) => e.message).join(', ');
        throw new Error(`Twitter API error for @${twitterAccount.username}: ${errorMessages}`);
      }
      
      throw new Error(`Failed to post tweet to @${twitterAccount.username}: ${tweetError.message || 'Unknown error'}`);
    }
    
  } catch (error) {
    console.error('Error posting to Twitter:', error);
    throw error; // Re-throw to preserve the specific error message
  }
}
