'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SocialMediaPost } from '@/types/post';
import { PostCard } from '@/components/PostCard';
import { PostFilters } from '@/components/PostFilters';
import { PostDetailsModal } from '@/components/PostDetailsModal';
import { BulkActions } from '@/components/BulkActions';
import { RateLimitDisplay } from '@/components/RateLimitDisplay';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';

export default function PostsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<SocialMediaPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<SocialMediaPost | null>(null);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [viewMode, setViewMode] = useState<'posts' | 'analytics'>('posts');
  const [filters, setFilters] = useState({
    status: 'all',
    platform: 'all',
    dateRange: 'all',
    search: '',
    media: 'all',
    engagement: 'all',
    sortBy: 'newest',
    author: 'all',
    hasAnalytics: 'all'
  });

  useEffect(() => {
    if (status === 'loading') {
      console.log('Authentication is loading...');
      return;
    }
    
    if (status === 'unauthenticated') {
      console.log('User is not authenticated, redirecting to signin');
      router.push('/auth/signin');
      return;
    }
    
    if (status === 'authenticated' && session?.user) {
      console.log('User is authenticated:', session.user.id);
    }
  }, [status, router, session]);

  useEffect(() => {
    if (session?.user) {
      fetchPosts();
    }
  }, [session]);

  // Debug session state
  useEffect(() => {
    console.log('Session status:', status);
    console.log('Session data:', session);
    if (session?.user) {
      console.log('User ID:', session.user.id);
    }
  }, [session, status]);

  // Add session test function
  const testSession = async () => {
    try {
      const response = await fetch('/api/debug/session');
      const data = await response.json();
      console.log('Session test result:', data);
    } catch (error) {
      console.error('Session test error:', error);
    }
  };

  // Test API connectivity
  const testApiHealth = async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      console.log('Health check result:', data);
      alert(`API Health: ${data.success ? 'Working' : 'Failed'} - Check console for details`);
    } catch (error) {
      console.error('Health check error:', error);
      alert('API Health: Failed - Check console for details');
    }
  };

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching posts from /api/posts...');
      
      const response = await fetch('/api/posts');
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      // Check if response is HTML instead of JSON
      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);
      
      if (!contentType || !contentType.includes('application/json')) {
        console.error('API returned HTML instead of JSON. Response:', response.status, response.statusText);
        const htmlText = await response.text();
        console.error('HTML Response (first 500 chars):', htmlText.substring(0, 500));
        
        // Try to determine if this is a 404 or authentication issue
        if (htmlText.includes('404') || htmlText.includes('Not Found')) {
          throw new Error('API endpoint not found. Please check if the development server is running correctly.');
        } else if (htmlText.includes('signin') || htmlText.includes('login')) {
          throw new Error('Authentication required. Please log in again.');
        } else {
          throw new Error('API returned HTML instead of JSON. Check console for details.');
        }
      }
      
      const data = await response.json();
      console.log('API Response data:', data);

      if (data.success) {
        setPosts(data.posts);
      } else {
        console.error('API returned error:', data.error);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      // Show user-friendly error
      alert(`Error loading posts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort posts
  const filteredPosts = useMemo(() => {
    let filtered = [...posts];

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(post => post.status === filters.status);
    }

    // Platform filter
    if (filters.platform !== 'all') {
      filtered = filtered.filter(post => 
        post.selectedAccounts?.some(accountId => 
          // This would need to be enhanced with actual account data lookup
          accountId.includes(filters.platform)
        ) || post.platforms?.includes(filters.platform)
      );
    }

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(post =>
        post.content.toLowerCase().includes(searchTerm)
      );
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          filterDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(post => {
        const postDate = new Date(post.createdAt);
        return postDate >= filterDate;
      });
    }

    // Media filter
    if (filters.media !== 'all') {
      switch (filters.media) {
        case 'with-media':
          filtered = filtered.filter(post => post.mediaFiles && post.mediaFiles.length > 0);
          break;
        case 'without-media':
          filtered = filtered.filter(post => !post.mediaFiles || post.mediaFiles.length === 0);
          break;
        case 'images':
          filtered = filtered.filter(post => 
            post.mediaFiles?.some(media => media.type === 'image')
          );
          break;
        case 'videos':
          filtered = filtered.filter(post => 
            post.mediaFiles?.some(media => media.type === 'video')
          );
          break;
      }
    }

    // Engagement filter (for published posts)
    if (filters.engagement !== 'all') {
      filtered = filtered.filter(post => {
        if (!post.analytics) return false;
        const engagement = post.analytics.engagement;
        switch (filters.engagement) {
          case 'high': return engagement >= 5;
          case 'medium': return engagement >= 2 && engagement < 5;
          case 'low': return engagement < 2;
          default: return true;
        }
      });
    }

    // Analytics filter
    if (filters.hasAnalytics !== 'all') {
      switch (filters.hasAnalytics) {
        case 'yes':
          filtered = filtered.filter(post => post.analytics && Object.keys(post.analytics).length > 0);
          break;
        case 'no':
          filtered = filtered.filter(post => !post.analytics || Object.keys(post.analytics).length === 0);
          break;
      }
    }

    // Author filter (if you have user data)
    if (filters.author !== 'all') {
      // This would filter by specific author/user if you have multi-user support
      // For now, skip since all posts are from the current user
    }

    // Sort posts
    switch (filters.sortBy) {
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'engagement':
        filtered.sort((a, b) => (b.analytics?.engagement || 0) - (a.analytics?.engagement || 0));
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.content.localeCompare(b.content));
        break;
      default: // newest
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return filtered;
  }, [posts, filters]);

  const handlePostSelect = (postId: string, selected: boolean) => {
    if (selected) {
      setSelectedPosts(prev => [...prev, postId]);
    } else {
      setSelectedPosts(prev => prev.filter(id => id !== postId));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedPosts(filteredPosts.map(post => post.id!));
    } else {
      setSelectedPosts([]);
    }
  };

  const handlePostEdit = (post: SocialMediaPost) => {
    // Navigate to edit page with post data
    router.push(`/dashboard/posts/create?edit=${post.id}`);
  };

  const handlePostDelete = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      });

      // Check if response is HTML instead of JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Delete API returned HTML instead of JSON. Response:', response.status, response.statusText);
        const htmlText = await response.text();
        console.error('HTML Response:', htmlText.substring(0, 500));
        alert('Error: API returned invalid response. Check console for details.');
        return;
      }

      if (response.ok) {
        const result = await response.json();
        setPosts(prev => prev.filter(post => post.id !== postId));
        setSelectedPosts(prev => prev.filter(id => id !== postId));
      } else {
        const error = await response.json();
        alert(`Error deleting post: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Error deleting post. Please try again.');
    }
  };

  const handlePostRetry = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/retry`, {
        method: 'POST',
      });

      // Check if response is HTML instead of JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Retry API returned HTML instead of JSON. Response:', response.status, response.statusText);
        const htmlText = await response.text();
        console.error('HTML Response:', htmlText.substring(0, 500));
        alert('Error: API returned invalid response. Check console for details.');
        return;
      }

      if (response.ok) {
        const result = await response.json();
        // Refresh posts to get updated status
        fetchPosts();
        alert('Post retry initiated successfully!');
      } else {
        const error = await response.json();
        alert(`Error retrying post: ${error.error}`);
      }
    } catch (error) {
      console.error('Error retrying post:', error);
      alert('Error retrying post. Please try again.');
    }
  };

  const handleViewDetails = (post: SocialMediaPost) => {
    setSelectedPost(post);
    setShowDetailsModal(true);
  };

  const handleViewAnalytics = (post: SocialMediaPost) => {
    router.push(`/dashboard/analytics/post/${post.id}`);
  };

  // Show loading state while authentication is being checked
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // Show message if not authenticated
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Not authenticated. Redirecting to login...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
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
              <h1 className="text-2xl font-bold text-gray-900">Posts Management</h1>
              <span className="text-sm text-gray-500">
                {filteredPosts.length} of {posts.length} post{posts.length !== 1 ? 's' : ''}
              </span>
              
              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('posts')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'posts'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Posts
                </button>
                <button
                  onClick={() => setViewMode('analytics')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'analytics'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Analytics
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Debug button (temporary) */}
              <button
                onClick={testSession}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
              >
                Debug Session
              </button>
              
              {/* API Health Check button (temporary) */}
              <button
                onClick={testApiHealth}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
              >
                API Health Check
              </button>
              
              {/* Bulk selection toggle */}
              {filteredPosts.length > 0 && (
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={selectedPosts.length === filteredPosts.length && filteredPosts.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Select all</span>
                </label>
              )}
              
              {/* Debug buttons (remove in production) */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={testApiHealth}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                >
                  Test API
                </button>
                <button
                  onClick={testSession}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                >
                  Test Session
                </button>
              </div>
              
              <Link
                href="/dashboard/posts/create"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Create Post</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Filters - Only show for posts view */}
      {viewMode === 'posts' && (
        <PostFilters 
          filters={filters}
          onFiltersChange={setFilters}
          totalPosts={filteredPosts.length}
        />
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === 'analytics' ? (
          /* Analytics View */
          <AnalyticsDashboard posts={posts} />
        ) : (
          /* Posts View */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <RateLimitDisplay className="sticky top-4" />
            </div>
            
            {/* Posts Content */}
            <div className="lg:col-span-3">
              {/* Bulk Actions */}
              <BulkActions
                selectedPosts={selectedPosts}
                posts={filteredPosts}
                onClearSelection={() => setSelectedPosts([])}
                onRefresh={fetchPosts}
              />

              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading posts...</p>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">
                    {posts.length === 0 ? '📝' : '🔍'}
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    {posts.length === 0 ? 'No Posts Yet' : 'No Posts Found'}
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    {posts.length === 0 
                      ? 'Create your first post to start sharing content across your social media platforms.'
                      : 'Try adjusting your filters to find the posts you\'re looking for.'
                    }
                  </p>
                  {posts.length === 0 ? (
                    <Link
                      href="/dashboard/posts/create"
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Create Your First Post
                    </Link>
                  ) : (
                    <button
                      onClick={() => setFilters({
                        status: 'all',
                        platform: 'all',
                        dateRange: 'all',
                        search: '',
                        media: 'all',
                        engagement: 'all',
                        sortBy: 'newest',
                        author: 'all',
                        hasAnalytics: 'all'
                      })}
                      className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                    >
                      Clear All Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredPosts.map((post) => (
                    <div key={post.id} className="relative">
                      {/* Selection checkbox */}
                      <div className="absolute -left-8 top-6 z-10">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedPosts.includes(post.id!)}
                            onChange={(e) => handlePostSelect(post.id!, e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </label>
                      </div>
                      
                      <PostCard
                        post={post}
                        onEdit={handlePostEdit}
                        onDelete={handlePostDelete}
                        onRetry={handlePostRetry}
                        onViewDetails={handleViewDetails}
                        onViewAnalytics={handleViewAnalytics}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Post Details Modal */}
      {selectedPost && (
        <PostDetailsModal
          post={selectedPost}
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedPost(null);
          }}
          onEdit={handlePostEdit}
          onDelete={handlePostDelete}
        />
      )}
    </div>
  );
}
