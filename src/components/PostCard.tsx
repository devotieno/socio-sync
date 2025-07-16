'use client';

import React, { useState } from 'react';
import { SocialMediaPost, PLATFORM_CONFIGS } from '@/types/post';
import { PostActionsMenu } from '@/components/PostActionsMenu';
import { MediaPreview } from '@/components/MediaPreview';
import { StatusBadge } from '@/components/StatusBadge';
import { PlatformBadges } from '@/components/PlatformBadges';

// Inline utility functions for now
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

function truncateContent(content: string, maxLength: number = 100): string {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength).trim() + '...';
}

interface PostCardProps {
  post: SocialMediaPost;
  onEdit?: (post: SocialMediaPost) => void;
  onDelete?: (postId: string) => void;
  onRetry?: (postId: string) => void;
  onViewDetails?: (post: SocialMediaPost) => void;
  onViewAnalytics?: (post: SocialMediaPost) => void;
}

export function PostCard({ 
  post, 
  onEdit, 
  onDelete, 
  onRetry, 
  onViewDetails, 
  onViewAnalytics 
}: PostCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getDateInfo = () => {
    switch (post.status) {
      case 'scheduled':
        return {
          label: 'Scheduled for',
          date: post.scheduledAt,
          className: 'text-yellow-600'
        };
      case 'published':
        return {
          label: 'Published',
          date: post.publishedAt,
          className: 'text-green-600'
        };
      case 'failed':
        return {
          label: 'Failed',
          date: post.updatedAt,
          className: 'text-red-600'
        };
      default:
        return {
          label: 'Created',
          date: post.createdAt,
          className: 'text-gray-600'
        };
    }
  };

  const dateInfo = getDateInfo();

  return (
    <div className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <StatusBadge status={post.status} />
              <span className={`text-sm ${dateInfo.className}`}>
                {dateInfo.label} {formatDate(dateInfo.date)}
              </span>
            </div>
            
            <div className="flex items-start justify-between">
              <div 
                className="flex-1 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <p className="text-gray-900 text-lg leading-relaxed">
                  {isExpanded ? post.content : truncateContent(post.content, 150)}
                  {post.content.length > 150 && (
                    <button className="ml-2 text-blue-600 hover:text-blue-800 font-medium text-sm">
                      {isExpanded ? 'Show less' : 'Show more'}
                    </button>
                  )}
                </p>
              </div>
              
              <PostActionsMenu
                post={post}
                onEdit={onEdit}
                onDelete={onDelete}
                onRetry={onRetry}
                onViewDetails={onViewDetails}
                onViewAnalytics={onViewAnalytics}
              />
            </div>
          </div>
        </div>

        {/* Platforms */}
        <PlatformBadges selectedAccounts={post.selectedAccounts || []} />

        {/* Media Files */}
        {post.mediaFiles && post.mediaFiles.length > 0 && (
          <MediaPreview mediaFiles={post.mediaFiles} />
        )}

        {/* Analytics Preview */}
        {post.analytics && post.status === 'published' && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Stats</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-xl font-bold text-blue-600">{post.analytics.likes}</div>
                <div className="text-xs text-gray-500">Likes</div>
              </div>
              <div>
                <div className="text-xl font-bold text-green-600">{post.analytics.shares}</div>
                <div className="text-xs text-gray-500">Shares</div>
              </div>
              <div>
                <div className="text-xl font-bold text-purple-600">{post.analytics.comments}</div>
                <div className="text-xs text-gray-500">Comments</div>
              </div>
              <div>
                <div className="text-xl font-bold text-orange-600">{post.analytics.views}</div>
                <div className="text-xs text-gray-500">Views</div>
              </div>
            </div>
            {onViewAnalytics && (
              <button 
                onClick={() => onViewAnalytics(post)}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View detailed analytics →
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t rounded-b-lg flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Post ID: {post.id}
        </div>
        {post.status === 'failed' && (
          <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
            Publishing failed - check error details
          </div>
        )}
      </div>
    </div>
  );
}
