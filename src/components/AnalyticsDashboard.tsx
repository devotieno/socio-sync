'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChartBarIcon, ArrowTrendingUpIcon, UserGroupIcon, HeartIcon, ChatBubbleLeftIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { SocialMediaPost } from '@/types/post';

interface PostAnalytics {
  postId: string;
  platform: string;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
  engagementRate: number;
  reach: number;
  lastUpdated: Date;
}

interface AnalyticsSummary {
  totalPosts: number;
  totalImpressions: number;
  totalEngagements: number;
  averageEngagementRate: number;
  topPerformingPost: {
    id: string;
    content: string;
    engagementRate: number;
  } | null;
  platformBreakdown: {
    platform: string;
    posts: number;
    engagements: number;
  }[];
}

// Force TypeScript refresh - using exact SocialMediaPost type
interface AnalyticsProps {
  className?: string;
  posts: SocialMediaPost[];
}

export function AnalyticsDashboard({ className = '', posts }: AnalyticsProps) {
  const [analytics, setAnalytics] = useState<PostAnalytics[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/analytics/overview');
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      
      const data = await response.json();
      
      // Transform the API response to match our component structure
      const transformedSummary: AnalyticsSummary = {
        totalPosts: data.totalPosts || 0,
        totalImpressions: data.totalImpressions || 0,
        totalEngagements: data.totalEngagement || 0,
        averageEngagementRate: data.averageEngagement || 0,
        topPerformingPost: data.topPosts?.[0] ? {
          id: data.topPosts[0].id,
          content: data.topPosts[0].content,
          engagementRate: data.topPosts[0].engagement || 0
        } : null,
        platformBreakdown: data.platformBreakdown?.map((p: any) => ({
          platform: p.platform,
          posts: p.count,
          engagements: Math.floor((p.count * data.averageEngagement) || 0)
        })) || []
      };
      
      setSummary(transformedSummary);
      
      // Fetch real analytics data for individual posts
      const postAnalytics: PostAnalytics[] = [];
      
      for (const post of posts.slice(0, 5)) {
        if (!post.id) continue;
        
        try {
          const analyticsResponse = await fetch(`/api/analytics/post/${post.id}`);
          if (analyticsResponse.ok) {
            const analyticsData = await analyticsResponse.json();
            
            if (analyticsData.analytics) {
              const engagement = (analyticsData.analytics.likes || 0) + 
                               (analyticsData.analytics.retweets || 0) + 
                               (analyticsData.analytics.replies || 0) + 
                               (analyticsData.analytics.bookmarks || 0);
              
              const engagementRate = analyticsData.analytics.impressions > 0
                ? (engagement / analyticsData.analytics.impressions) * 100
                : 0;
              
              postAnalytics.push({
                postId: post.id,
                platform: post.platforms?.[0] || 'twitter',
                impressions: analyticsData.analytics.impressions || 0,
                likes: analyticsData.analytics.likes || 0,
                comments: analyticsData.analytics.replies || 0,
                shares: analyticsData.analytics.retweets || 0,
                clicks: analyticsData.analytics.urlClicks || 0,
                engagementRate,
                reach: analyticsData.analytics.impressions || 0,
                lastUpdated: new Date()
              });
            }
          }
        } catch (err) {
          console.error(`Error fetching analytics for post ${post.id}:`, err);
        }
      }
      
      setAnalytics(postAnalytics);
      
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  }, [posts]);

  useEffect(() => {
    fetchAnalytics();
    
    // Auto-refresh analytics every 30 seconds
    const refreshInterval = setInterval(() => {
      console.log('Auto-refreshing analytics...');
      fetchAnalytics();
    }, 30000); // 30 seconds
    
    // Cleanup interval on unmount
    return () => clearInterval(refreshInterval);
  }, [fetchAnalytics]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (isLoading) {
    return (
      <div className={`backdrop-blur-xl bg-slate-800/30 border border-slate-700/50 rounded-2xl shadow-lg shadow-black/20 p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-outfit font-semibold text-white">Analytics Overview</h2>
          <ArrowPathIcon className="w-5 h-5 text-slate-400 animate-spin" />
        </div>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-slate-700/50 rounded h-20"></div>
            ))}
          </div>
          <div className="h-32 bg-slate-700/50 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className={`backdrop-blur-xl bg-slate-800/30 border border-slate-700/50 rounded-2xl shadow-lg shadow-black/20 p-6 ${className}`}>
        <div className="text-center py-8">
          <ChartBarIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-outfit font-medium text-white mb-2">Analytics Unavailable</h3>
          <p className="text-slate-400 mb-4">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-white text-black rounded-lg font-semibold hover:shadow-xl hover:shadow-white/20 hover:scale-105 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`backdrop-blur-xl bg-slate-800/30 border border-slate-700/50 rounded-2xl shadow-lg shadow-black/20 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-outfit font-semibold text-white">Analytics Overview</h2>
        <button
          onClick={fetchAnalytics}
          className="p-2 text-slate-400 hover:text-white transition-colors"
          title="Refresh analytics"
        >
          <ArrowPathIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-3 sm:p-4">
          <div className="flex items-center">
            <ChartBarIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 mr-2 sm:mr-3" />
            <div>
              <p className="text-xs sm:text-sm font-medium text-blue-300">Total Posts</p>
              <p className="text-lg sm:text-2xl font-bold text-white">{summary?.totalPosts || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-3 sm:p-4">
          <div className="flex items-center">
            <UserGroupIcon className="w-6 h-6 sm:w-8 sm:h-8 text-green-400 mr-2 sm:mr-3" />
            <div>
              <p className="text-xs sm:text-sm font-medium text-green-300">Total Impressions</p>
              <p className="text-lg sm:text-2xl font-bold text-white">{formatNumber(summary?.totalImpressions || 0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-900/30 border border-purple-700/50 rounded-lg p-3 sm:p-4">
          <div className="flex items-center">
            <HeartIcon className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 mr-2 sm:mr-3" />
            <div>
              <p className="text-xs sm:text-sm font-medium text-purple-300">Total Engagements</p>
              <p className="text-lg sm:text-2xl font-bold text-white">{formatNumber(summary?.totalEngagements || 0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-900/30 border border-orange-700/50 rounded-lg p-3 sm:p-4">
          <div className="flex items-center">
            <ArrowTrendingUpIcon className="w-6 h-6 sm:w-8 sm:h-8 text-orange-400 mr-2 sm:mr-3" />
            <div>
              <p className="text-xs sm:text-sm font-medium text-orange-300">Avg. Engagement Rate</p>
              <p className="text-lg sm:text-2xl font-bold text-white">{summary?.averageEngagementRate?.toFixed(1) || 0}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Post */}
      {summary?.topPerformingPost && (
        <div className="mb-6">
          <h3 className="text-md font-outfit font-medium text-white mb-3">Top Performing Post</h3>
          <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-slate-700/50 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-white mb-2">{summary.topPerformingPost.content}</p>
                <div className="flex items-center space-x-4 text-xs text-slate-400">
                  <span>Engagement Rate: {summary.topPerformingPost.engagementRate.toFixed(1)}%</span>
                </div>
              </div>
              <div className="ml-4">
                <ArrowTrendingUpIcon className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Posts Performance */}
      {analytics.length > 0 && (
        <div>
          <h3 className="text-md font-outfit font-medium text-white mb-3">Recent Posts Performance</h3>
          <div className="space-y-3">
            {analytics.slice(0, 3).map((post) => (
              <div key={post.postId} className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs px-2 py-1 bg-blue-900/50 text-blue-400 border border-blue-700/50 rounded capitalize">
                      {post.platform}
                    </span>
                    <span className="text-sm text-slate-300">
                      {formatNumber(post.impressions)} impressions
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-slate-400">
                    <span className="flex items-center">
                      <HeartIcon className="w-3 h-3 mr-1" />
                      {post.likes}
                    </span>
                    <span className="flex items-center">
                      <ChatBubbleLeftIcon className="w-3 h-3 mr-1" />
                      {post.comments}
                    </span>
                    <span>{post.engagementRate.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
