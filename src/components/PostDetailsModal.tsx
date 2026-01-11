'use client';

import React from 'react';
import { SocialMediaPost } from '@/types/post';
import { StatusBadge } from '@/components/StatusBadge';
import { PlatformBadges } from '@/components/PlatformBadges';
import { MediaPreview } from '@/components/MediaPreview';

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

interface PostDetailsModalProps {
  post: SocialMediaPost;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (post: SocialMediaPost) => void;
  onDelete?: (postId: string) => void;
}

export function PostDetailsModal({ 
  post, 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete 
}: PostDetailsModalProps) {
  if (!isOpen) return null;

  const handleEdit = () => {
    onEdit?.(post);
    onClose();
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      onDelete?.(post.id!);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold text-gray-900">Post Details</h2>
            <StatusBadge status={post.status} />
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Post Content */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Content</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                {post.content}
              </p>
            </div>
          </div>

          {/* Platforms */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Publishing Platforms</h3>
            <PlatformBadges selectedAccounts={post.selectedAccounts || []} />
          </div>

          {/* Media Files */}
          {post.mediaFiles && post.mediaFiles.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Media Files</h3>
              <MediaPreview mediaFiles={post.mediaFiles} maxDisplay={8} />
            </div>
          )}

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">Created</h3>
              <p className="text-sm text-gray-600">{formatDate(post.createdAt)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">Last Updated</h3>
              <p className="text-sm text-gray-600">{formatDate(post.updatedAt)}</p>
            </div>
            {post.scheduledAt && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Scheduled For</h3>
                <p className="text-sm text-gray-600">{formatDate(post.scheduledAt)}</p>
              </div>
            )}
            {post.publishedAt && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Published</h3>
                <p className="text-sm text-gray-600">{formatDate(post.publishedAt)}</p>
              </div>
            )}
          </div>

          {/* Analytics Summary */}
          {post.analytics && post.status === 'published' && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Analytics Summary</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{post.analytics.likes}</div>
                    <div className="text-sm text-gray-600">Likes</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{post.analytics.shares}</div>
                    <div className="text-sm text-gray-600">Shares</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{post.analytics.comments}</div>
                    <div className="text-sm text-gray-600">Comments</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">{post.analytics.views}</div>
                    <div className="text-sm text-gray-600">Views</div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <div className="text-lg font-semibold text-gray-800">
                    Engagement Rate: {post.analytics.engagement.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Post ID */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-1">Post ID</h3>
            <p className="text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded">
              {post.id}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end items-center p-6 border-t bg-gray-50">
          <div className="flex space-x-3">
            {post.status === 'published' && (
              <button
                onClick={() => window.open(`/dashboard/analytics/post/${post.id}`, '_blank')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>View Analytics</span>
              </button>
            )}
            
            {onDelete && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Delete</span>
              </button>
            )}
            
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
