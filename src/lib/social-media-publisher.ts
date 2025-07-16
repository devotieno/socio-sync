import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { SocialMediaPost } from '@/types/post';
import { TwitterApi } from 'twitter-api-v2';

export async function publishToSocialMedia(postId: string, postData: Omit<SocialMediaPost, 'id'>, userId: string) {
  console.log('Publishing to social media:', { postId, userId, selectedAccounts: postData.selectedAccounts });
  
  let connectedAccounts: any[] = [];

  // First, try to get user's connected accounts from the socialAccounts collection
  const accountsQuery = query(
    collection(db, 'socialAccounts'),
    where('userId', '==', userId),
    where('isActive', '==', true)
  );

  const querySnapshot = await getDocs(accountsQuery);

  querySnapshot.forEach((doc) => {
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
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
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
      switch (platform) {
        case 'twitter':
          await publishToTwitterAccounts(postData, accounts as any[]);
          break;
        case 'facebook':
          await publishToFacebookAccounts(postData, accounts as any[]);
          break;
        case 'instagram':
          await publishToInstagramAccounts(postData, accounts as any[]);
          break;
        case 'linkedin':
          await publishToLinkedInAccounts(postData, accounts as any[]);
          break;
        default:
          console.log(`Publishing to ${platform} not yet implemented`);
      }
    } catch (error) {
      console.error(`Error publishing to ${platform}:`, error);
      throw error;
    }
  }
}

async function publishToTwitterAccounts(postData: Omit<SocialMediaPost, 'id'>, twitterAccounts: any[]) {
  const results: Array<{ account: string; success: boolean; error?: string }> = [];
  
  for (const account of twitterAccounts) {
    try {
      console.log(`Publishing to Twitter account: ${account.username}`);
      await publishToSingleTwitterAccount(postData, account);
      results.push({ account: account.username, success: true });
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

    // For Twitter OAuth 2.0 (Bearer token), we might need different handling
    // First, try with the accessToken as Bearer token
    let twitterClient;
    
    if (twitterAccount.refreshToken) {
      // OAuth 1.0a flow
      console.log('Using OAuth 1.0a tokens');
      twitterClient = new TwitterApi({
        appKey: process.env.TWITTER_CONSUMER_KEY!,
        appSecret: process.env.TWITTER_CONSUMER_SECRET!,
        accessToken: twitterAccount.accessToken,
        accessSecret: twitterAccount.refreshToken,
      });
    } else {
      // OAuth 2.0 flow (Bearer token)
      console.log('Using OAuth 2.0 bearer token');
      twitterClient = new TwitterApi(twitterAccount.accessToken);
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
      
      throw new Error(`Twitter client configuration failed: ${clientError.message || 'Unknown error'}`);
    }
    
    // Prepare tweet data
    const tweetData: any = {
      text: postData.content,
    };
    
    // Handle media files if present
    if (postData.mediaFiles && postData.mediaFiles.length > 0) {
      const mediaIds: string[] = [];
      
      for (const mediaFile of postData.mediaFiles) {
        if (mediaFile.type === 'image') {
          try {
            // Download the image from Firebase Storage
            const response = await fetch(mediaFile.url);
            const buffer = await response.arrayBuffer();
            
            // Upload to Twitter
            const mediaUpload = await twitterClient.v1.uploadMedia(Buffer.from(buffer), {
              mimeType: 'image/jpeg',
            });
            
            mediaIds.push(mediaUpload);
          } catch (mediaError: any) {
            console.error('Error uploading media to Twitter:', mediaError);
            
            // Handle rate limit for media upload
            if (mediaError.code === 429 || mediaError.status === 429) {
              throw new Error('Twitter API rate limit exceeded during media upload. Please try again later.');
            }
            
            // Continue without this media file for other errors
          }
        }
      }
      
      if (mediaIds.length > 0) {
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

async function publishToFacebookAccounts(postData: Omit<SocialMediaPost, 'id'>, facebookAccounts: any[]) {
  // Placeholder for Facebook publishing
  for (const account of facebookAccounts) {
    console.log(`Publishing to Facebook account: ${account.username || account.accountId}`);
    // TODO: Implement Facebook API posting
  }
}

async function publishToInstagramAccounts(postData: Omit<SocialMediaPost, 'id'>, instagramAccounts: any[]) {
  // Placeholder for Instagram publishing
  for (const account of instagramAccounts) {
    console.log(`Publishing to Instagram account: ${account.username || account.accountId}`);
    // TODO: Implement Instagram API posting
  }
}

async function publishToLinkedInAccounts(postData: Omit<SocialMediaPost, 'id'>, linkedinAccounts: any[]) {
  // Placeholder for LinkedIn publishing
  for (const account of linkedinAccounts) {
    console.log(`Publishing to LinkedIn account: ${account.username || account.accountId}`);
    // TODO: Implement LinkedIn API posting
  }
}
