import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { SocialMediaPost } from '@/types/post';

// This endpoint processes scheduled posts that are due for publishing
export async function POST(request: NextRequest) {
  try {
    const { authorization } = Object.fromEntries(request.headers.entries());
    
    // Simple API key check for cron jobs (you can make this more secure)
    const cronApiKey = process.env.CRON_API_KEY || 'dev-cron-key';
    if (authorization !== `Bearer ${cronApiKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    console.log('Processing scheduled posts at:', now.toISOString());
    
    // Query for scheduled posts that are due
    // Note: We'll get ALL scheduled posts and filter in code due to Firestore date comparison issues
    const postsQuery = query(
      collection(db, 'posts'),
      where('status', '==', 'scheduled')
    );
    
    const querySnapshot = await getDocs(postsQuery);
    const allScheduledPosts = querySnapshot.docs.map(doc => ({
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
        
        // Update post status to published
        await updateDoc(doc(db, 'posts', post.id), {
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
          await updateDoc(doc(db, 'posts', post.id), {
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
          await updateDoc(doc(db, 'posts', post.id), {
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
    
    // Query for scheduled posts (get all and filter client-side)
    const postsQuery = query(
      collection(db, 'posts'),
      where('status', '==', 'scheduled')
    );
    
    const querySnapshot = await getDocs(postsQuery);
    const allScheduledPosts = querySnapshot.docs.map(doc => ({
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
