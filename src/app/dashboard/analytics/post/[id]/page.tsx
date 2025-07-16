'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { StatusBadge } from '@/components/StatusBadge';
import { PLATFORM_CONFIGS } from '@/types/post';

// Inline utility function for now
function formatDate(date: string | Date | undefined): string {
  if (!date) return 'Unknown';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return 'Invalid date';
  
  return dateObj.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface PostAnalytics {
  id: string;
  totalEngagement: number;
  likes: number;
  shares: number;
  comments: number;
  views: number;
  clickThroughRate: string;
  engagementRate: string;
  platformMetrics: Record<string, any>;
  timeSeriesData: Array<{
    date: string;
    engagement: number;
    views: number;
  }>;
  topPerformingTime: string;
  audienceDemographics: {
    ageGroups: Record<string, number>;
    gender: Record<string, number>;
    topCountries: Array<{
      country: string;
      percentage: number;
    }>;
  };
}

interface PostData {
  id: string;
  content: string;
  status: string;
  createdAt: string;
  publishedAt?: string;
  platforms: string[];
}

export default function PostAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<PostAnalytics | null>(null);
  const [post, setPost] = useState<PostData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [postId, setPostId] = useState<string>('');

  // Resolve params promise
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setPostId(resolvedParams.id);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user && postId) {
      fetchAnalytics();
    }
  }, [session, postId]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/analytics/post/${postId}`);
      const data = await response.json();

      if (data.success) {
        setAnalytics(data.analytics);
        setPost(data.post);
      } else {
        alert('Error fetching analytics: ' + data.error);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      alert('Error fetching analytics');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!session || !analytics || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Analytics Not Available
          </h3>
          <p className="text-gray-500 mb-6">
            Analytics data is not available for this post.
          </p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-800"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Post Analytics</h1>
              <StatusBadge status={post.status as any} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Post Summary */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Post Overview</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <p className="text-gray-900 leading-relaxed mb-4">{post.content}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>Published: {formatDate(post.publishedAt || post.createdAt)}</span>
                <span>Post ID: {post.id}</span>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Platforms</h3>
              <div className="flex flex-wrap gap-2">
                {post.platforms?.map((platform) => {
                  const config = PLATFORM_CONFIGS[platform];
                  if (!config) return null;
                  
                  return (
                    <div
                      key={platform}
                      className="flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium text-white"
                      style={{ backgroundColor: config.color }}
                    >
                      <span>{config.icon}</span>
                      <span>{config.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.views.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Likes</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.likes.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Shares</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.shares.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Comments</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.comments.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Engagement Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Metrics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Engagement Rate</span>
                <span className="text-lg font-semibold text-green-600">{analytics.engagementRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Click-through Rate</span>
                <span className="text-lg font-semibold text-blue-600">{analytics.clickThroughRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Total Engagement</span>
                <span className="text-lg font-semibold text-gray-900">{analytics.totalEngagement.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Best Performing Time</span>
                <span className="text-sm text-gray-900">{analytics.topPerformingTime}</span>
              </div>
            </div>
          </div>

          {/* Platform Breakdown */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Performance</h3>
            <div className="space-y-4">
              {Object.entries(analytics.platformMetrics).map(([platform, metrics]: [string, any]) => {
                const config = PLATFORM_CONFIGS[platform];
                if (!config) return null;

                return (
                  <div key={platform} className="border rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <span style={{ color: config.color }}>{config.icon}</span>
                      <span className="font-medium text-gray-900">{config.name}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Likes: </span>
                        <span className="font-medium">{metrics.likes || metrics.reactions || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Shares: </span>
                        <span className="font-medium">{metrics.shares || metrics.retweets || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Comments: </span>
                        <span className="font-medium">{metrics.comments || metrics.replies || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Views: </span>
                        <span className="font-medium">{metrics.views || 0}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Audience Demographics */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Audience Demographics</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Age Groups */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Age Groups</h4>
              <div className="space-y-2">
                {Object.entries(analytics.audienceDemographics.ageGroups).map(([age, percentage]) => (
                  <div key={age} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{age}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8">{percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gender */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Gender</h4>
              <div className="space-y-2">
                {Object.entries(analytics.audienceDemographics.gender).map(([gender, percentage]) => (
                  <div key={gender} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 capitalize">{gender}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8">{percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Countries */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Top Countries</h4>
              <div className="space-y-2">
                {analytics.audienceDemographics.topCountries.map(({ country, percentage }) => (
                  <div key={country} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{country}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8">{percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
