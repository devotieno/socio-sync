import { NextRequest, NextResponse } from 'next/server';
import { SocialMediaPost } from '@/types/post';

// This endpoint processes scheduled posts that are due for publishing
export async function POST(request: NextRequest) {
  try {
    const { authorization } = Object.fromEntries(request.headers.entries());
    
    // Check for Vercel Cron Secret or fallback to API key
    const vercelCronSecret = process.env.CRON_SECRET;
    const cronApiKey = process.env.CRON_API_KEY || 'dev-cron-key';
    
    // Verify authorization
    const isAuthorized = 
      (vercelCronSecret && authorization === `Bearer ${vercelCronSecret}`) ||
      authorization === `Bearer ${cronApiKey}`;
    
    if (!isAuthorized) {
      console.error('Unauthorized cron request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    console.log('Processing scheduled posts at:', now.toISOString());
    
    // Check if Firebase Admin credentials are configured
    const hasAdminCredentials = process.env.FIREBASE_PROJECT_ID && 
                                process.env.FIREBASE_CLIENT_EMAIL && 
                                process.env.FIREBASE_PRIVATE_KEY;
    
    if (!hasAdminCredentials) {
      console.warn('⚠️  Firebase Admin SDK not configured. Scheduled posts will not work until you add credentials.');
      return NextResponse.json({
        error: 'Firebase Admin SDK not configured',
        message: 'Please add FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY to .env.local',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
    try {
      // Dynamic import Firebase Admin
      const admin = await import('firebase-admin');
      
      // Initialize Firebase Admin if not already initialized
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          }),
        });
      }
      
      // Use Firebase Admin SDK for server-side operations (bypasses security rules)
      const db = admin.firestore();
    
      // Query for scheduled posts that are due
      const postsSnapshot = await db
        .collection('posts')
        .where('status', '==', 'scheduled')
        .get();
    
      const allScheduledPosts = postsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as (SocialMediaPost & { id: string })[];
    
      console.log(`Found ${allScheduledPosts.length} total scheduled posts`);
    
      // Filter posts that are actually due (client-side filtering)
      const duePosts = allScheduledPosts.filter(post => {
        if (!post.scheduledAt) return false;
      
        // Handle both Firestore Timestamp and Date objects
        let scheduledDate: Date;
        if (typeof post.scheduledAt === 'object' && 'toDate' in post.scheduledAt) {
          // Firestore Timestamp
          scheduledDate = (post.scheduledAt as any).toDate();
        } else if (post.scheduledAt instanceof Date) {
          scheduledDate = post.scheduledAt;
        } else {
          // String date
          scheduledDate = new Date(post.scheduledAt as string);
        }
      
        return scheduledDate <= now;
      });
    
      console.log(`Found ${duePosts.length} posts actually due for publishing`);
    
    const results = [];
    
    for (const post of duePosts) {
      try {
        console.log(`Publishing post ${post.id} scheduled for ${post.scheduledAt}`);
        
        // Import the publishing function from the shared utility
        const { publishToSocialMedia } = await import('@/lib/social-media-publisher');
        
        // Validate post data
        if (!post.selectedAccounts || post.selectedAccounts.length === 0) {
          throw new Error('No selected accounts found for post');
        }
        
        if (!post.userId) {
          throw new Error('No user ID found for post');
        }
        
        // Publish the post
        console.log(`Publishing to accounts:`, post.selectedAccounts);
        await publishToSocialMedia(post.id, post, post.userId);
        
        // Update post status to published using Admin SDK
        const admin = await import('firebase-admin');
        const db = admin.firestore();
        await db.collection('posts').doc(post.id).update({
          status: 'published',
          publishedAt: now,
          updatedAt: now
        });
        
        results.push({
          postId: post.id,
          status: 'published',
          publishedAt: now
        });
        
        console.log(`Successfully published post ${post.id}`);
        
      } catch (error) {
        console.error(`Error publishing post ${post.id}:`, error);
        
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // Check if it's a rate limit error
        if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
          console.log(`Rate limit hit for post ${post.id}, will retry later`);
          
          // Don't mark as failed, leave as scheduled for retry
          // Just add a retry count or delay the next attempt
          const admin = await import('firebase-admin');
          const db = admin.firestore();
          await db.collection('posts').doc(post.id).update({
            retryCount: ((post as any).retryCount || 0) + 1,
            lastRetryAt: now,
            updatedAt: now
          });
          
          results.push({
            postId: post.id,
            status: 'rate_limited',
            error: 'Rate limit exceeded, will retry later',
            retryCount: ((post as any).retryCount || 0) + 1
          });
        } else {
          // For other errors, mark as failed
          const admin = await import('firebase-admin');
          const db = admin.firestore();
          await db.collection('posts').doc(post.id).update({
            status: 'failed',
            updatedAt: now,
            failureReason: errorMessage
          });
          
          results.push({
            postId: post.id,
            status: 'failed',
            error: errorMessage
          });
        }
      }
    }
    
    return NextResponse.json({
      processed: duePosts.length,
      results
    });
    
    } catch (firebaseError) {
      console.error('Firebase error in scheduled posts:', firebaseError);
      return NextResponse.json({
        error: 'Internal server error',
        details: 'Missing or insufficient permissions.',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Error processing scheduled posts:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Also allow GET for testing purposes
export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    console.log('Checking for scheduled posts at:', now.toISOString());
    
    // Check if Firebase Admin credentials are configured
    const hasAdminCredentials = process.env.FIREBASE_PROJECT_ID && 
                                process.env.FIREBASE_CLIENT_EMAIL && 
                                process.env.FIREBASE_PRIVATE_KEY;
    
    if (!hasAdminCredentials) {
      console.warn('⚠️  Firebase Admin SDK not configured');
      return NextResponse.json({
        error: 'Firebase Admin SDK not configured',
        message: 'Please add credentials to .env.local',
      }, { status: 500 });
    }
    
    try {
      // Dynamic import Firebase Admin
      const admin = await import('firebase-admin');
      
      // Use Firebase Admin SDK for server-side operations
      const db = admin.firestore();
    
      // Query for scheduled posts (get all and filter client-side)
      const postsSnapshot = await db
        .collection('posts')
        .where('status', '==', 'scheduled')
        .get();
    
      const allScheduledPosts = postsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
    
    // Filter posts that are actually due
    const duePosts = allScheduledPosts.filter(post => {
      if (!post.scheduledAt) return false;
      
      let scheduledDate: Date;
      if (typeof post.scheduledAt === 'object' && 'toDate' in post.scheduledAt) {
        scheduledDate = (post.scheduledAt as any).toDate();
      } else if (post.scheduledAt instanceof Date) {
        scheduledDate = post.scheduledAt;
      } else {
        scheduledDate = new Date(post.scheduledAt as string);
      }
      
      return scheduledDate <= now;
    });
    
    return NextResponse.json({
      message: `Found ${duePosts.length} posts due for publishing out of ${allScheduledPosts.length} total scheduled posts`,
      totalScheduled: allScheduledPosts.length,
      due: duePosts.length,
      posts: duePosts.map((post: any) => ({
        id: post.id,
        content: post.content?.substring(0, 100) + '...',
        scheduledAt: post.scheduledAt,
        platforms: post.platforms,
        selectedAccounts: post.selectedAccounts
      }))
    });
    
    } catch (firebaseError) {
      console.error('Firebase error in GET scheduled posts:', firebaseError);
      return NextResponse.json({
        error: 'Internal server error',
        details: 'Missing or insufficient permissions.',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Error checking scheduled posts:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
