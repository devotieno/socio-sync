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
        totalPosts: data.overview.totalPosts,
        totalImpressions: data.overview.totalImpressions,
        totalEngagements: data.overview.totalEngagement,
        averageEngagementRate: data.overview.averageEngagement,
        topPerformingPost: data.topPerformingPosts[0] ? {
          id: data.topPerformingPosts[0].id,
          content: data.topPerformingPosts[0].content,
          engagementRate: data.topPerformingPosts[0].engagement
        } : null,
        platformBreakdown: data.platformBreakdown
      };
      
      setSummary(transformedSummary);
      
      // For individual post analytics, we'll use mock data for now
      // In a real app, you'd fetch individual analytics for each post
      const mockAnalytics: PostAnalytics[] = posts.slice(0, 5).map((post, index) => ({
        postId: post.id || `mock-post-${index}`,
        platform: post.platforms?.[0] || 'unknown',
        impressions: Math.floor(Math.random() * 5000) + 100,
        likes: Math.floor(Math.random() * 200) + 10,
        comments: Math.floor(Math.random() * 50) + 1,
        shares: Math.floor(Math.random() * 30) + 1,
        clicks: Math.floor(Math.random() * 100) + 5,
        engagementRate: Math.random() * 10,
        reach: Math.floor(Math.random() * 3000) + 50,
        lastUpdated: new Date()
      }));
      
      setAnalytics(mockAnalytics);
      
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  }, [posts]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Analytics Overview</h2>
          <ArrowPathIcon className="w-5 h-5 text-gray-400 animate-spin" />
        </div>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-gray-200 rounded h-20"></div>
            ))}
          </div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="text-center py-8">
          <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Unavailable</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Analytics Overview</h2>
        <button
          onClick={fetchAnalytics}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          title="Refresh analytics"
        >
          <ArrowPathIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <ChartBarIcon className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-blue-600">Total Posts</p>
              <p className="text-2xl font-bold text-blue-900">{summary?.totalPosts || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center">
            <UserGroupIcon className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-green-600">Total Impressions</p>
              <p className="text-2xl font-bold text-green-900">{formatNumber(summary?.totalImpressions || 0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center">
            <HeartIcon className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-purple-600">Total Engagements</p>
              <p className="text-2xl font-bold text-purple-900">{formatNumber(summary?.totalEngagements || 0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center">
            <ArrowTrendingUpIcon className="w-8 h-8 text-orange-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-orange-600">Avg. Engagement Rate</p>
              <p className="text-2xl font-bold text-orange-900">{summary?.averageEngagementRate?.toFixed(1) || 0}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Breakdown */}
      {summary?.platformBreakdown && summary.platformBreakdown.length > 0 && (
        <div className="mb-6">
          <h3 className="text-md font-medium text-gray-900 mb-3">Platform Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {summary.platformBreakdown.map((platform) => (
              <div key={platform.platform} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 capitalize">{platform.platform}</span>
                  <span className="text-lg font-bold text-gray-900">{platform.posts}</span>
                </div>
                <div className="mt-1">
                  <span className="text-xs text-gray-500">{formatNumber(platform.engagements)} engagements</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Performing Post */}
      {summary?.topPerformingPost && (
        <div className="mb-6">
          <h3 className="text-md font-medium text-gray-900 mb-3">Top Performing Post</h3>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-700 mb-2">{summary.topPerformingPost.content}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>Engagement Rate: {summary.topPerformingPost.engagementRate.toFixed(1)}%</span>
                </div>
              </div>
              <div className="ml-4">
                <ArrowTrendingUpIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Posts Analytics */}
      {analytics.length > 0 && (
        <div>
          <h3 className="text-md font-medium text-gray-900 mb-3">Recent Posts Performance</h3>
          <div className="space-y-3">
            {analytics.slice(0, 3).map((post) => (
              <div key={post.postId} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded capitalize">
                      {post.platform}
                    </span>
                    <span className="text-sm text-gray-600">
                      {formatNumber(post.impressions)} impressions
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
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
