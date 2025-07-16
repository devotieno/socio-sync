'use client';

import React, { useState } from 'react';
import { SocialMediaPost } from '@/types/post';

interface BulkActionsProps {
  selectedPosts: string[];
  posts: SocialMediaPost[];
  onClearSelection: () => void;
  onRefresh: () => void;
}

export function BulkActions({ 
  selectedPosts, 
  posts, 
  onClearSelection, 
  onRefresh 
}: BulkActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [action, setAction] = useState<string>('');

  if (selectedPosts.length === 0) return null;

  const selectedPostsData = posts.filter(post => selectedPosts.includes(post.id!));
  const canDelete = selectedPostsData.every(post => 
    post.status === 'draft' || post.status === 'scheduled' || post.status === 'failed'
  );
  const canRetry = selectedPostsData.every(post => post.status === 'failed');

  const handleBulkAction = async (actionType: string) => {
    if (!confirm(`Are you sure you want to ${actionType} ${selectedPosts.length} post(s)?`)) {
      return;
    }

    setIsLoading(true);
    setAction(actionType);

    try {
      const promises = selectedPosts.map(async (postId) => {
        switch (actionType) {
          case 'delete':
            return fetch(`/api/posts/${postId}`, { method: 'DELETE' });
          case 'retry':
            return fetch(`/api/posts/${postId}/retry`, { method: 'POST' });
          default:
            throw new Error(`Unknown action: ${actionType}`);
        }
      });

      const results = await Promise.allSettled(promises);
      const successes = results.filter(result => result.status === 'fulfilled').length;
      const failures = results.length - successes;

      if (successes > 0) {
        // Show success message
        const message = `${successes} post(s) ${actionType === 'delete' ? 'deleted' : 'retried'} successfully${failures > 0 ? `, ${failures} failed` : ''}`;
        // You could integrate with a toast notification system here
        alert(message);
        onRefresh();
        onClearSelection();
      } else {
        alert(`Failed to ${actionType} posts. Please try again.`);
      }

    } catch (error) {
      console.error(`Error performing bulk ${actionType}:`, error);
      alert(`Error performing bulk ${actionType}. Please try again.`);
    } finally {
      setIsLoading(false);
      setAction('');
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-600 rounded-sm flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-sm font-medium text-blue-900">
              {selectedPosts.length} post{selectedPosts.length !== 1 ? 's' : ''} selected
            </span>
          </div>

          <div className="flex space-x-2">
            {canDelete && (
              <button
                onClick={() => handleBulkAction('delete')}
                disabled={isLoading}
                className={`px-3 py-1 text-sm font-medium rounded ${
                  isLoading && action === 'delete'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                } transition-colors flex items-center space-x-1`}
              >
                {isLoading && action === 'delete' ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border border-gray-500 border-t-transparent"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Delete</span>
                  </>
                )}
              </button>
            )}

            {canRetry && (
              <button
                onClick={() => handleBulkAction('retry')}
                disabled={isLoading}
                className={`px-3 py-1 text-sm font-medium rounded ${
                  isLoading && action === 'retry'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-yellow-600 text-white hover:bg-yellow-700'
                } transition-colors flex items-center space-x-1`}
              >
                {isLoading && action === 'retry' ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border border-gray-500 border-t-transparent"></div>
                    <span>Retrying...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Retry</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <button
          onClick={onClearSelection}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Clear selection
        </button>
      </div>

      {/* Action Status Messages */}
      {selectedPostsData.length > 0 && (
        <div className="mt-2 text-xs text-blue-700">
          {canDelete && `${selectedPostsData.filter(p => p.status === 'draft' || p.status === 'scheduled' || p.status === 'failed').length} posts can be deleted`}
          {canDelete && canRetry && ' • '}
          {canRetry && `${selectedPostsData.filter(p => p.status === 'failed').length} failed posts can be retried`}
        </div>
      )}
    </div>
  );
}
