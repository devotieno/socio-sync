import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use Firebase Admin SDK
    const admin = await import('firebase-admin');
    
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    }

    const db = admin.firestore();

    // Fetch all posts for the user
    const postsSnapshot = await db
      .collection('posts')
      .where('userId', '==', session.user.id)
      .get();

    const posts = postsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Calculate analytics
    const totalPosts = posts.length;
    const publishedPosts = posts.filter((p: any) => p.status === 'published').length;
    const scheduledPosts = posts.filter((p: any) => p.status === 'scheduled').length;
    const draftPosts = posts.filter((p: any) => p.status === 'draft').length;

    // Fetch analytics data from Firestore
    const analyticsSnapshot = await db
      .collection('postAnalytics')
      .where('userId', '==', session.user.id)
      .get();

    const analyticsData = analyticsSnapshot.docs.map(doc => doc.data());

    // Calculate engagement metrics
    let totalEngagement = 0;
    let totalImpressions = 0;
    let postsWithAnalytics = 0;

    analyticsData.forEach((analytics: any) => {
      const engagement = (analytics.likes || 0) + (analytics.retweets || 0) + 
                        (analytics.replies || 0) + (analytics.bookmarks || 0);
      totalEngagement += engagement;
      totalImpressions += analytics.impressions || 0;
      if (analytics.impressions > 0) postsWithAnalytics++;
    });

    const averageEngagement = postsWithAnalytics > 0 
      ? ((totalEngagement / totalImpressions) * 100) 
      : 0;

    // Find top performing post
    const topPost = analyticsData
      .map((analytics: any) => {
        const engagement = (analytics.likes || 0) + (analytics.retweets || 0) + 
                          (analytics.replies || 0) + (analytics.bookmarks || 0);
        const engagementRate = analytics.impressions > 0 
          ? (engagement / analytics.impressions) * 100 
          : 0;
        return {
          ...analytics,
          totalEngagement: engagement,
          engagementRate
        };
      })
      .sort((a: any, b: any) => b.engagementRate - a.engagementRate)[0];

    // Get post content for top post
    let topPostData = null;
    if (topPost) {
      const postDoc = await db.collection('posts').doc(topPost.postId).get();
      if (postDoc.exists) {
        topPostData = {
          id: postDoc.id,
          content: postDoc.data()?.content || '',
          engagement: topPost.engagementRate,
          impressions: topPost.impressions || 0,
          createdAt: postDoc.data()?.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
        };
      }
    }

    // Platform breakdown
    const platformCounts: { [key: string]: number } = {};
    posts.forEach((post: any) => {
      if (post.platforms && Array.isArray(post.platforms)) {
        post.platforms.forEach((platform: string) => {
          platformCounts[platform] = (platformCounts[platform] || 0) + 1;
        });
      }
    });

    const platformBreakdown = Object.entries(platformCounts).map(([platform, count]) => ({
      platform,
      count,
      percentage: totalPosts > 0 ? Math.round((count / totalPosts) * 100) : 0
    }));

    const analyticsResponse = {
      totalPosts,
      publishedPosts,
      scheduledPosts,
      draftPosts,
      platformBreakdown,
      totalEngagement,
      totalImpressions,
      averageEngagement: Math.round(averageEngagement * 10) / 10,
      engagementGrowth: 0, // Would need historical data to calculate
      topPosts: topPostData ? [topPostData] : []
    };

    return NextResponse.json(analyticsResponse);

  } catch (error) {
    console.error('Analytics overview error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
