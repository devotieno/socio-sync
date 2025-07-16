import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';
import axios from 'axios';

admin.initializeApp();

const db = admin.firestore();

// Scheduled function to process pending posts
export const processScheduledPosts = onSchedule({ schedule: 'every 1 minutes' }, async (event) => {
    console.log('Processing scheduled posts...');
    
    const now = new Date();
    const scheduledPosts = await db
      .collection('posts')
      .where('status', '==', 'scheduled')
      .where('scheduledTime', '<=', now)
      .get();

    const batch = db.batch();
    
    for (const doc of scheduledPosts.docs) {
      const post = doc.data();
      try {
        // Publish to selected platforms
        const results = await publishToSocialMedia(post);
        
        batch.update(doc.ref, {
          status: 'published',
          publishedAt: now,
          publishResults: results,
        });
        
        console.log(`Published post ${doc.id} to ${post.platforms.join(', ')}`);
      } catch (error: any) {
        console.error(`Failed to publish post ${doc.id}:`, error);
        
        batch.update(doc.ref, {
          status: 'failed',
          error: error?.message || 'Unknown error',
        });
      }
    }
    
    await batch.commit();
  });

// Function to publish to social media platforms
async function publishToSocialMedia(post: any) {
  const results: any = {};
  
  for (const platform of post.platforms) {
    try {
      switch (platform) {
        case 'twitter':
          results.twitter = await publishToTwitter(post);
          break;
        case 'facebook':
          results.facebook = await publishToFacebook(post);
          break;
        case 'instagram':
          results.instagram = await publishToInstagram(post);
          break;
        case 'linkedin':
          results.linkedin = await publishToLinkedIn(post);
          break;
        case 'tiktok':
          results.tiktok = await publishToTikTok(post);
          break;
        case 'threads':
          results.threads = await publishToThreads(post);
          break;
        case 'youtube':
          results.youtube = await publishToYouTube(post);
          break;
      }
    } catch (error: any) {
      results[platform] = { error: error?.message || 'Unknown error' };
    }
  }
  
  return results;
}

// Twitter/X publishing
async function publishToTwitter(post: any) {
  const userAccount = await getUserSocialAccount(post.userId, 'twitter');
  
  const tweetData: any = {
    text: post.content,
  };
  
  if (post.mediaUrls && post.mediaUrls.length > 0) {
    // Upload media first
    const mediaIds = await uploadTwitterMedia(post.mediaUrls, userAccount.accessToken);
    tweetData.media = { media_ids: mediaIds };
  }
  
  const response = await axios.post(
    'https://api.twitter.com/2/tweets',
    tweetData,
    {
      headers: {
        'Authorization': `Bearer ${userAccount.accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );
  
  return {
    success: true,
    tweetId: response.data.data.id,
    url: `https://twitter.com/user/status/${response.data.data.id}`,
  };
}

// Facebook publishing
async function publishToFacebook(post: any) {
  const userAccount = await getUserSocialAccount(post.userId, 'facebook');
  
  const postData: any = {
    message: post.content,
    access_token: userAccount.accessToken,
  };
  
  if (post.mediaUrls && post.mediaUrls.length > 0) {
    postData.url = post.mediaUrls[0]; // Facebook auto-detects media from URL
  }
  
  const response = await axios.post(
    `https://graph.facebook.com/v18.0/${userAccount.pageId}/feed`,
    postData
  );
  
  return {
    success: true,
    postId: response.data.id,
    url: `https://facebook.com/${response.data.id}`,
  };
}

// Instagram publishing
async function publishToInstagram(post: any) {
  const userAccount = await getUserSocialAccount(post.userId, 'instagram');
  
  if (!post.mediaUrls || post.mediaUrls.length === 0) {
    throw new Error('Instagram posts require media');
  }
  
  // Create media container
  const containerResponse = await axios.post(
    `https://graph.facebook.com/v18.0/${userAccount.accountId}/media`,
    {
      image_url: post.mediaUrls[0],
      caption: post.content,
      access_token: userAccount.accessToken,
    }
  );
  
  // Publish the container
  const publishResponse = await axios.post(
    `https://graph.facebook.com/v18.0/${userAccount.accountId}/media_publish`,
    {
      creation_id: containerResponse.data.id,
      access_token: userAccount.accessToken,
    }
  );
  
  return {
    success: true,
    postId: publishResponse.data.id,
    url: `https://instagram.com/p/${publishResponse.data.id}`,
  };
}

// LinkedIn publishing
async function publishToLinkedIn(post: any) {
  const userAccount = await getUserSocialAccount(post.userId, 'linkedin');
  
  const postData: any = {
    author: `urn:li:person:${userAccount.personId}`,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: {
          text: post.content,
        },
        shareMediaCategory: post.mediaUrls && post.mediaUrls.length > 0 ? 'IMAGE' : 'NONE',
      },
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
    },
  };
  
  if (post.mediaUrls && post.mediaUrls.length > 0) {
    // Upload media to LinkedIn first
    const mediaAssets = await uploadLinkedInMedia(post.mediaUrls, userAccount.accessToken);
    postData.specificContent['com.linkedin.ugc.ShareContent'].media = mediaAssets;
  }
  
  const response = await axios.post(
    'https://api.linkedin.com/v2/ugcPosts',
    postData,
    {
      headers: {
        'Authorization': `Bearer ${userAccount.accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );
  
  return {
    success: true,
    postId: response.data.id,
    url: `https://linkedin.com/feed/update/${response.data.id}`,
  };
}

// TikTok publishing (placeholder - requires specific implementation)
async function publishToTikTok(post: any) {
  // TikTok API implementation would go here
  throw new Error('TikTok publishing not yet implemented');
}

// Threads publishing (placeholder - API not yet available)
async function publishToThreads(post: any) {
  // Threads API implementation would go here when available
  throw new Error('Threads publishing not yet implemented');
}

// YouTube publishing (for video content)
async function publishToYouTube(post: any) {
  const userAccount = await getUserSocialAccount(post.userId, 'youtube');
  
  if (!post.mediaUrls || post.mediaUrls.length === 0) {
    throw new Error('YouTube posts require video content');
  }
  
  // YouTube video upload is complex and requires multipart form data
  // This is a simplified example - full implementation would handle video upload
  const response = await axios.post(
    'https://www.googleapis.com/youtube/v3/videos',
    {
      snippet: {
        title: post.title || 'Untitled Video',
        description: post.content,
        tags: post.tags || [],
        categoryId: '22', // People & Blogs
      },
      status: {
        privacyStatus: 'public',
      },
    },
    {
      headers: {
        'Authorization': `Bearer ${userAccount.accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );
  
  return {
    success: true,
    videoId: response.data.id,
    url: `https://youtube.com/watch?v=${response.data.id}`,
  };
}

// Helper functions
async function getUserSocialAccount(userId: string, platform: string) {
  const accountDoc = await db
    .collection('socialAccounts')
    .where('userId', '==', userId)
    .where('platform', '==', platform)
    .where('isConnected', '==', true)
    .limit(1)
    .get();
  
  if (accountDoc.empty) {
    throw new Error(`No connected ${platform} account found for user ${userId}`);
  }
  
  return accountDoc.docs[0].data();
}

async function uploadTwitterMedia(mediaUrls: string[], accessToken: string) {
  // Implementation for uploading media to Twitter
  // This would involve downloading the media and uploading to Twitter's media endpoint
  return [];
}

async function uploadLinkedInMedia(mediaUrls: string[], accessToken: string) {
  // Implementation for uploading media to LinkedIn
  // This would involve registering assets and uploading media
  return [];
}

// Analytics collection function
export const collectAnalytics = onSchedule({ schedule: 'every 24 hours' }, async (event) => {
    console.log('Collecting analytics data...');
    
    const publishedPosts = await db
      .collection('posts')
      .where('status', '==', 'published')
      .where('publishedAt', '>=', new Date(Date.now() - 24 * 60 * 60 * 1000))
      .get();
    
    for (const doc of publishedPosts.docs) {
      const post = doc.data();
      try {
        const analytics = await getPostAnalytics(post);
        
        await db.collection('analytics').doc(doc.id).set({
          postId: doc.id,
          userId: post.userId,
          platforms: post.platforms,
          metrics: analytics,
          collectedAt: new Date(),
        });
        
        console.log(`Collected analytics for post ${doc.id}`);
      } catch (error: any) {
        console.error(`Failed to collect analytics for post ${doc.id}:`, error);
      }
    }
  });

async function getPostAnalytics(post: any) {
  const analytics: any = {};
  
  for (const platform of post.platforms) {
    try {
      switch (platform) {
        case 'twitter':
          analytics.twitter = await getTwitterAnalytics(post);
          break;
        case 'facebook':
          analytics.facebook = await getFacebookAnalytics(post);
          break;
        case 'instagram':
          analytics.instagram = await getInstagramAnalytics(post);
          break;
        case 'linkedin':
          analytics.linkedin = await getLinkedInAnalytics(post);
          break;
      }
    } catch (error: any) {
      analytics[platform] = { error: error?.message || 'Unknown error' };
    }
  }
  
  return analytics;
}

async function getTwitterAnalytics(post: any) {
  // Implementation for fetching Twitter analytics
  return {
    likes: 0,
    retweets: 0,
    replies: 0,
    impressions: 0,
  };
}

async function getFacebookAnalytics(post: any) {
  // Implementation for fetching Facebook analytics
  return {
    likes: 0,
    shares: 0,
    comments: 0,
    reach: 0,
  };
}

async function getInstagramAnalytics(post: any) {
  // Implementation for fetching Instagram analytics
  return {
    likes: 0,
    comments: 0,
    saves: 0,
    reach: 0,
  };
}

async function getLinkedInAnalytics(post: any) {
  // Implementation for fetching LinkedIn analytics
  return {
    likes: 0,
    shares: 0,
    comments: 0,
    impressions: 0,
  };
}
