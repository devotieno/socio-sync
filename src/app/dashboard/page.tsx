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
          <div className="h-8 bg-slate-800 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="backdrop-blur-xl bg-slate-800/50 border border-slate-700/50 p-6 rounded-xl">
                <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-slate-700 rounded w-1/2"></div>
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
      <div className="backdrop-blur-xl bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 shadow-2xl shadow-black/50">
        <h1 className="text-2xl font-outfit font-bold mb-2 text-white">
          Welcome back, {session?.user?.name?.split(' ')[0] || 'User'}! 👋
        </h1>
        <p className="text-slate-300">
          Here's what's happening with your Twitter/X presence today.
        </p>
      </div>

      {/* Quick Stats */}
      <div>
        <h2 className="text-lg font-outfit font-semibold text-white mb-4">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="backdrop-blur-xl bg-slate-800/50 border border-slate-700/50 p-6 rounded-xl shadow-lg shadow-black/20 hover:shadow-2xl hover:shadow-black/30 transition-all hover:scale-105"
            >
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${card.color}`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-400">{card.title}</p>
                  <p className="text-2xl font-bold text-white">{card.value}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Analytics Cards */}
      <div>
        <h2 className="text-lg font-outfit font-semibold text-white mb-4">Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {analyticsCards.map((card) => (
            <div
              key={card.title}
              className="backdrop-blur-xl bg-slate-800/50 border border-slate-700/50 p-6 rounded-xl shadow-lg shadow-black/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">{card.title}</p>
                  <p className="text-2xl font-bold text-white">{card.value}</p>
                  <p className={`text-sm ${
                    card.changeType === 'positive' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {card.change} from last month
                  </p>
                </div>
                <div className="p-2 bg-slate-700/50 rounded-lg">
                  <card.icon className="h-6 w-6 text-slate-300" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-outfit font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/dashboard/posts/create"
            className="backdrop-blur-xl bg-slate-800/50 border border-slate-700/50 p-6 rounded-xl shadow-lg shadow-black/20 hover:shadow-2xl hover:shadow-black/30 transition-all hover:scale-105 text-center"
          >
            <DocumentPlusIcon className="h-12 w-12 text-white mx-auto mb-4" />
            <h3 className="text-lg font-outfit font-semibold text-white mb-2">Create New Post</h3>
            <p className="text-slate-400">Share your content on Twitter/X</p>
          </Link>

          <Link
            href="/dashboard/posts"
            className="backdrop-blur-xl bg-slate-800/50 border border-slate-700/50 p-6 rounded-xl shadow-lg shadow-black/20 hover:shadow-2xl hover:shadow-black/30 transition-all hover:scale-105 text-center"
          >
            <CalendarIcon className="h-12 w-12 text-white mx-auto mb-4" />
            <h3 className="text-lg font-outfit font-semibold text-white mb-2">Manage Posts</h3>
            <p className="text-slate-400">Plan your content calendar</p>
          </Link>

          <Link
            href="/dashboard/accounts"
            className="backdrop-blur-xl bg-slate-800/50 border border-slate-700/50 p-6 rounded-xl shadow-lg shadow-black/20 hover:shadow-2xl hover:shadow-black/30 transition-all hover:scale-105 text-center"
          >
            <UsersIcon className="h-12 w-12 text-white mx-auto mb-4" />
            <h3 className="text-lg font-outfit font-semibold text-white mb-2">Manage Accounts</h3>
            <p className="text-slate-400">Connect your Twitter/X accounts</p>
          </Link>
        </div>
      </div>

      {/* Recent Posts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-outfit font-semibold text-white">Recent Posts</h2>
          <Link
            href="/dashboard/posts"
            className="text-white hover:text-slate-300 font-medium text-sm transition-colors"
          >
            View all posts
          </Link>
        </div>
        <div className="backdrop-blur-xl bg-slate-800/50 border border-slate-700/50 rounded-2xl shadow-lg shadow-black/20">
          {recentPosts.length > 0 ? (
            <div className="divide-y divide-slate-700/50">
              {recentPosts.slice(0, 5).map((post) => (
                <div key={post.id} className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-1">
                      <p className="text-white mb-2">{post.content}</p>
                      <div className="flex items-center space-x-4 text-sm text-slate-400">
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
                            ? 'bg-green-900/50 text-green-300 border border-green-700'
                            : post.status === 'scheduled'
                            ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-700'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}>
                          {post.status}
                        </span>
                      </div>
                      {post.analytics && (
                        <div className="flex items-center space-x-6 mt-3 text-sm text-slate-400">
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
            <div className="p-6 text-center text-slate-400">
              <DocumentPlusIcon className="h-12 w-12 mx-auto mb-4 text-slate-600" />
              <p className="text-lg font-medium text-white">No posts yet</p>
              <p className="mt-1">Create your first post to get started!</p>
              <Link
                href="/dashboard/create"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-black bg-white hover:shadow-xl hover:shadow-white/20 hover:scale-105 transition-all"
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
