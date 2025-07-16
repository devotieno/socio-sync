import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

interface PostData {
  id: string;
  userId: string;
  status: string;
  content: string;
  selectedAccounts?: Array<{
    platform: string;
    accountId: string;
  }>;
  analytics?: {
    totalEngagement?: number;
    impressions?: number;
  };
  createdAt: unknown;
  [key: string]: unknown;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's posts
    const postsRef = collection(db, 'posts');
    const postsQuery = query(
      postsRef,
      where('userId', '==', session.user.id),
      orderBy('createdAt', 'desc')
    );
    
    const postsSnapshot = await getDocs(postsQuery);
    const posts: PostData[] = postsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as PostData));

    // Calculate analytics
    const totalPosts = posts.length;
    const publishedPosts = posts.filter(post => post.status === 'published').length;
    const scheduledPosts = posts.filter(post => post.status === 'scheduled').length;
    const draftPosts = posts.filter(post => post.status === 'draft').length;

    // Platform breakdown
    const platformStats = posts.reduce((acc, post) => {
      if (post.selectedAccounts) {
        post.selectedAccounts.forEach((account: { platform: string; accountId: string }) => {
          const platform = account.platform;
          if (!acc[platform]) {
            acc[platform] = { posts: 0, engagement: 0 };
          }
          acc[platform].posts += 1;
          
          // Add mock engagement data (in real app, this would come from social APIs)
          if (post.analytics) {
            acc[platform].engagement += post.analytics.totalEngagement || 0;
          }
        });
      }
      return acc;
    }, {} as Record<string, { posts: number; engagement: number }>);

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentPosts = posts.filter(post => {
      const createdAt = post.createdAt;
      let postDate: Date;
      
      if (createdAt && typeof createdAt === 'object' && 'toDate' in createdAt) {
        // Firebase Timestamp
        const firebaseTimestamp = createdAt as { toDate: () => Date };
        postDate = firebaseTimestamp.toDate();
      } else {
        // String or Date
        postDate = new Date(createdAt as string | Date);
      }
      
      return postDate >= thirtyDaysAgo;
    });

    // Mock engagement metrics (in real app, fetch from social APIs)
    const totalEngagement = posts.reduce((sum, post) => {
      return sum + (post.analytics?.totalEngagement || Math.floor(Math.random() * 100));
    }, 0);

    const totalImpressions = posts.reduce((sum, post) => {
      return sum + (post.analytics?.impressions || Math.floor(Math.random() * 1000));
    }, 0);

    const analytics = {
      overview: {
        totalPosts,
        publishedPosts,
        scheduledPosts,
        draftPosts,
        totalEngagement,
        totalImpressions,
        averageEngagement: totalPosts > 0 ? Math.round(totalEngagement / totalPosts) : 0
      },
      platformBreakdown: Object.entries(platformStats).map(([platform, stats]) => ({
        platform,
        posts: stats.posts,
        engagement: stats.engagement
      })),
      recentActivity: {
        postsLast30Days: recentPosts.length,
        engagementLast30Days: recentPosts.reduce((sum, post) => {
          return sum + (post.analytics?.totalEngagement || Math.floor(Math.random() * 50));
        }, 0)
      },
      topPerformingPosts: posts
        .filter(post => post.status === 'published')
        .map(post => ({
          id: post.id,
          content: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
          platform: post.selectedAccounts?.[0]?.platform || 'unknown',
          engagement: post.analytics?.totalEngagement || Math.floor(Math.random() * 200),
          impressions: post.analytics?.impressions || Math.floor(Math.random() * 2000),
          createdAt: post.createdAt
        }))
        .sort((a, b) => b.engagement - a.engagement)
        .slice(0, 5)
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Analytics overview error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
