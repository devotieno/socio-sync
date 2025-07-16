'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  DocumentPlusIcon,
  ChartBarIcon,
  UsersIcon,
  CalendarIcon,
  EyeIcon,
  HeartIcon,
  ShareIcon,
  ChatBubbleLeftIcon,
} from '@heroicons/react/24/outline';
import { formatNumber, formatRelativeTime, getPlatformIcon } from '@/utils/helpers';
import { DashboardStats, Post } from '@/types';

export default function Dashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    publishedPosts: 0,
    scheduledPosts: 0,
    totalViews: 0,
    totalLikes: 0,
    totalShares: 0,
    connectedAccounts: 0,
  });
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch dashboard data
    const fetchDashboardData = async () => {
      try {
        // This would be replaced with actual API calls
        // For now, using mock data
        setStats({
          totalPosts: 125,
          publishedPosts: 98,
          scheduledPosts: 27,
          totalViews: 15420,
          totalLikes: 2380,
          totalShares: 456,
          connectedAccounts: 3,
        });

        setRecentPosts([
          {
            id: '1',
            userId: session?.user?.id || '',
            content: 'Just launched our new product! 🚀 Check it out and let us know what you think!',
            platforms: ['twitter', 'linkedin'],
            status: 'published',
            publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            createdAt: new Date(),
            updatedAt: new Date(),
            analytics: {
              twitter: {
                views: 1250,
                likes: 45,
                shares: 12,
                comments: 8,
                lastUpdated: new Date(),
              },
              linkedin: {
                views: 890,
                likes: 23,
                shares: 5,
                comments: 4,
                lastUpdated: new Date(),
              },
            },
          },
          // Add more mock posts...
        ]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [session]);

  const statCards = [
    {
      title: 'Total Posts',
      value: stats.totalPosts,
      icon: DocumentPlusIcon,
      color: 'bg-blue-500',
      href: '/dashboard/posts',
    },
    {
      title: 'Published',
      value: stats.publishedPosts,
      icon: ChartBarIcon,
      color: 'bg-green-500',
      href: '/dashboard/analytics',
    },
    {
      title: 'Scheduled',
      value: stats.scheduledPosts,
      icon: CalendarIcon,
      color: 'bg-yellow-500',
      href: '/dashboard/scheduled',
    },
    {
      title: 'Connected Accounts',
      value: stats.connectedAccounts,
      icon: UsersIcon,
      color: 'bg-purple-500',
      href: '/dashboard/accounts',
    },
  ];

  const analyticsCards = [
    {
      title: 'Total Views',
      value: formatNumber(stats.totalViews),
      icon: EyeIcon,
      change: '+12.5%',
      changeType: 'positive',
    },
    {
      title: 'Total Likes',
      value: formatNumber(stats.totalLikes),
      icon: HeartIcon,
      change: '+8.2%',
      changeType: 'positive',
    },
    {
      title: 'Total Shares',
      value: formatNumber(stats.totalShares),
      icon: ShareIcon,
      change: '+5.4%',
      changeType: 'positive',
    },
    {
      title: 'Comments',
      value: formatNumber(324),
      icon: ChatBubbleLeftIcon,
      change: '+18.7%',
      changeType: 'positive',
    },
  ];

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {session?.user?.name?.split(' ')[0] || 'User'}! 👋
        </h1>
        <p className="text-blue-100">
          Here's what's happening with your social media presence today.
        </p>
      </div>

      {/* Quick Stats */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${card.color}`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Analytics Cards */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {analyticsCards.map((card) => (
            <div
              key={card.title}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <p className={`text-sm ${
                    card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {card.change} from last month
                  </p>
                </div>
                <div className="p-2 bg-gray-100 rounded-lg">
                  <card.icon className="h-6 w-6 text-gray-600" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/dashboard/posts/create"
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-center"
          >
            <DocumentPlusIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Create New Post</h3>
            <p className="text-gray-600">Share your content across multiple platforms</p>
          </Link>

          <Link
            href="/dashboard/posts"
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-center"
          >
            <CalendarIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Posts</h3>
            <p className="text-gray-600">Plan your content calendar</p>
          </Link>

          <Link
            href="/dashboard/accounts"
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-center"
          >
            <UsersIcon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Accounts</h3>
            <p className="text-gray-600">Connect more social media accounts</p>
          </Link>
        </div>
      </div>

      {/* Recent Posts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Posts</h2>
          <Link
            href="/dashboard/posts"
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            View all posts
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {recentPosts.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {recentPosts.slice(0, 5).map((post) => (
                <div key={post.id} className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-1">
                      <p className="text-gray-900 mb-2">{post.content}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          {post.platforms.map((platform) => (
                            <span key={platform} className="text-lg">
                              {getPlatformIcon(platform)}
                            </span>
                          ))}
                        </div>
                        <span>{formatRelativeTime(post.publishedAt || post.createdAt)}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          post.status === 'published' 
                            ? 'bg-green-100 text-green-800'
                            : post.status === 'scheduled'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {post.status}
                        </span>
                      </div>
                      {post.analytics && (
                        <div className="flex items-center space-x-6 mt-3 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <EyeIcon className="h-4 w-4" />
                            <span>
                              {formatNumber(
                                Object.values(post.analytics).reduce(
                                  (total, analytics) => total + (analytics.views || 0),
                                  0
                                )
                              )}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <HeartIcon className="h-4 w-4" />
                            <span>
                              {formatNumber(
                                Object.values(post.analytics).reduce(
                                  (total, analytics) => total + (analytics.likes || 0),
                                  0
                                )
                              )}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <ShareIcon className="h-4 w-4" />
                            <span>
                              {formatNumber(
                                Object.values(post.analytics).reduce(
                                  (total, analytics) => total + (analytics.shares || 0),
                                  0
                                )
                              )}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <DocumentPlusIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No posts yet</p>
              <p className="mt-1">Create your first post to get started!</p>
              <Link
                href="/dashboard/create"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Create Post
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
