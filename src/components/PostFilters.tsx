'use client';

import React, { useState } from 'react';
import { PLATFORM_CONFIGS } from '@/types/post';

// PostFilters component with required properties to match state
interface PostFiltersProps {
  filters: {
    status: string;
    platform: string;
    dateRange: string;
    search: string;
    media: string;
    engagement: string;
    sortBy: string;
    author: string;
    hasAnalytics: string;
  };
  onFiltersChange: (filters: PostFiltersProps['filters']) => void;
  totalPosts: number;
}

export function PostFilters({ filters, onFiltersChange, totalPosts }: PostFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      status: 'all',
      platform: 'all',
      dateRange: 'all',
      search: '',
      media: 'all',
      engagement: 'all',
      sortBy: 'newest',
      author: 'all',
      hasAnalytics: 'all',
    });
  };

  const hasActiveFilters = filters.status !== 'all' || 
                          filters.platform !== 'all' || 
                          filters.dateRange !== 'all' || 
                          filters.search !== '' ||
                          filters.media !== 'all' ||
                          filters.engagement !== 'all' ||
                          filters.author !== 'all' ||
                          filters.hasAnalytics !== 'all';

  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search posts by content..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => updateFilter('status', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 min-w-[120px]"
              >
                <option value="all">All Status</option>
                <option value="draft">📝 Draft</option>
                <option value="scheduled">⏰ Scheduled</option>
                <option value="published">✅ Published</option>
                <option value="failed">❌ Failed</option>
              </select>
            </div>

            {/* Platform Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
              <select
                value={filters.platform}
                onChange={(e) => updateFilter('platform', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 min-w-[120px]"
              >
                <option value="all">All Platforms</option>
                {Object.values(PLATFORM_CONFIGS).map((platform) => (
                  <option key={platform.id} value={platform.id}>
                    {platform.icon} {platform.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => updateFilter('dateRange', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 min-w-[120px]"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>

            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              <span>Advanced</span>
              <svg 
                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center space-x-3">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-800 font-medium"
              >
                Clear filters
              </button>
            )}
            <div className="text-sm text-gray-500">
              {totalPosts} post{totalPosts !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* With Media Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Media</label>
                <select
                  value={filters.media}
                  onChange={(e) => updateFilter('media', e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 w-full"
                >
                  <option value="all">All Posts</option>
                  <option value="with-media">With Media</option>
                  <option value="without-media">Text Only</option>
                  <option value="images">Images Only</option>
                  <option value="videos">Videos Only</option>
                </select>
              </div>

              {/* Engagement Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Engagement</label>
                <select
                  value={filters.engagement}
                  onChange={(e) => updateFilter('engagement', e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 w-full"
                >
                  <option value="all">All Posts</option>
                  <option value="high">High Engagement</option>
                  <option value="medium">Medium Engagement</option>
                  <option value="low">Low Engagement</option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => updateFilter('sortBy', e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 w-full"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="engagement">Highest Engagement</option>
                  <option value="alphabetical">Alphabetical</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-3 flex flex-wrap gap-2">
            {filters.status !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Status: {filters.status}
                <button 
                  onClick={() => updateFilter('status', 'all')}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.platform !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Platform: {PLATFORM_CONFIGS[filters.platform]?.name || filters.platform}
                <button 
                  onClick={() => updateFilter('platform', 'all')}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.dateRange !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Date: {filters.dateRange}
                <button 
                  onClick={() => updateFilter('dateRange', 'all')}
                  className="ml-1 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.search && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Search: &quot;{filters.search}&quot;
                <button 
                  onClick={() => updateFilter('search', '')}
                  className="ml-1 text-yellow-600 hover:text-yellow-800"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
