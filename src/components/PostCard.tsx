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
    <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-3 sm:p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <StatusBadge status={post.status} />
              <span className="text-xs sm:text-sm font-inter text-gray-400">
                {dateInfo.label} {formatDate(dateInfo.date)}
              </span>
            </div>
            
            <div className="flex items-start justify-between gap-3">
              <div 
                className="flex-1 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <p className="text-gray-100 font-inter text-sm sm:text-[15px] leading-relaxed">
                  {isExpanded ? post.content : truncateContent(post.content, 150)}
                  {post.content.length > 150 && (
                    <button className="ml-2 text-blue-400 hover:text-blue-300 text-xs sm:text-sm font-medium">
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

        {/* Platform Badges */}
        <PlatformBadges selectedAccounts={post.selectedAccounts || []} />

        {/* Media Files */}
        {post.mediaFiles && post.mediaFiles.length > 0 && (
          <MediaPreview mediaFiles={post.mediaFiles} />
        )}

        {/* Analytics Preview */}
        {post.analytics && post.status === 'published' && (
          <div className="mt-3 p-3 bg-gray-800 border border-gray-700 rounded">
            <h4 className="text-sm font-outfit font-semibold text-gray-200 mb-2">Stats</h4>
            <div className="grid grid-cols-4 gap-3 text-center">
              <div>
                <div className="text-lg font-outfit font-bold text-gray-100">{post.analytics.likes}</div>
                <div className="text-xs font-inter text-gray-400">Likes</div>
              </div>
              <div>
                <div className="text-lg font-outfit font-bold text-gray-100">{post.analytics.shares}</div>
                <div className="text-xs font-inter text-gray-400">Shares</div>
              </div>
              <div>
                <div className="text-lg font-outfit font-bold text-gray-100">{post.analytics.comments}</div>
                <div className="text-xs font-inter text-gray-400">Comments</div>
              </div>
              <div>
                <div className="text-lg font-outfit font-bold text-gray-100">{post.analytics.views}</div>
                <div className="text-xs font-inter text-gray-400">Views</div>
              </div>
            </div>
            {onViewAnalytics && (
              <button 
                onClick={() => onViewAnalytics(post)}
                className="mt-2 text-sm font-medium text-blue-400 hover:text-blue-300"
              >
                View details →
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {post.status === 'failed' && (
        <div className="px-4 py-2 bg-gray-800 border-t border-gray-700 rounded-b-lg flex justify-between items-center">
          <div className="text-xs font-medium text-red-400 bg-red-950 border border-red-900 px-2 py-1 rounded">
            Publishing failed
          </div>
        </div>
      )}
    </div>
  );
}
