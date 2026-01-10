'use client';

import React, { useState } from 'react';
import { ConnectedAccount } from '../types/auth';
import { PostFormData } from '@/types/post';
import PlatformSelector from '@/components/PlatformSelector';
import MediaUpload from '@/components/MediaUpload';
import ScheduleSelector from '@/components/ScheduleSelector';
import CharacterCounter from '@/components/CharacterCounter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

interface PostCreatorProps {
  connectedAccounts: ConnectedAccount[];
  onSubmit: (data: PostFormData) => Promise<void>;
  isLoading?: boolean;
}

// Platform configurations
const PLATFORM_CONFIGS = {
  twitter: { characterLimit: 280 },
  facebook: { characterLimit: 63206 },
  instagram: { characterLimit: 2200 },
  linkedin: { characterLimit: 3000 }
};

export default function PostCreator({ connectedAccounts, onSubmit, isLoading = false }: PostCreatorProps) {
  const [content, setContent] = useState('');
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [publishNow, setPublishNow] = useState(true);
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get platforms from selected accounts
  const getSelectedPlatforms = () => {
    const selectedAccountsData = connectedAccounts.filter(acc => 
      selectedAccounts.includes(acc.accountId)
    );
    return [...new Set(selectedAccountsData.map(acc => acc.platform))];
  };

  // Get character limit for selected platforms
  const getCharacterLimit = () => {
    const platforms = getSelectedPlatforms();
    if (platforms.length === 0) return 280;
    return Math.min(...platforms.map(p => PLATFORM_CONFIGS[p as keyof typeof PLATFORM_CONFIGS]?.characterLimit || 280));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!content.trim()) {
      setError('Post content is required');
      return;
    }

    if (selectedAccounts.length === 0) {
      setError('Please select at least one account to post to');
      return;
    }

    if (!publishNow && !scheduledAt) {
      setError('Please select a scheduled time or choose to publish now');
      return;
    }

    const characterLimit = getCharacterLimit();
    if (content.length > characterLimit) {
      setError(`Post content exceeds character limit of ${characterLimit}`);
      return;
    }

    try {
      const formData: PostFormData = {
        content: content.trim(),
        selectedAccounts,
        mediaFiles,
        publishNow,
        scheduledAt: publishNow ? null : scheduledAt,
      };

      await onSubmit(formData);

      // Reset form on success
      setContent('');
      setSelectedAccounts([]);
      setMediaFiles([]);
      setPublishNow(true);
      setScheduledAt(null);
    } catch (error) {
      console.error('Error submitting post:', error);
      setError(error instanceof Error ? error.message : 'Failed to create post');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto backdrop-blur-xl bg-slate-800/30 border border-slate-700/50 rounded-2xl shadow-lg shadow-black/20">
      <div className="px-6 py-4 border-b border-slate-700/50">
        <h2 className="text-xl font-outfit font-semibold text-white">Create New Post</h2>
      </div>
      <div className="p-6 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="border border-red-500/50 text-red-400 bg-red-950/30 rounded-lg p-4">
              {error}
            </div>
          )}

          <PlatformSelector
            connectedAccounts={connectedAccounts}
            selectedAccounts={selectedAccounts}
            onAccountsChange={setSelectedAccounts}
          />

          <div className="space-y-2">
            <label htmlFor="content" className="block text-sm font-medium text-white">
              Post Content
            </label>
            <div className="relative">
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full p-3 bg-slate-900/50 border border-slate-700/50 text-white placeholder-slate-500 rounded-lg resize-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all"
                rows={4}
                disabled={isLoading}
              />
              <div className="absolute bottom-2 right-2">
                <CharacterCounter
                  content={content}
                  limit={getCharacterLimit()}
                  selectedPlatforms={getSelectedPlatforms()}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Media Files (Optional)
            </label>
            <MediaUpload
              files={mediaFiles}
              onFilesChange={setMediaFiles}
              selectedPlatforms={getSelectedPlatforms()}
              maxFiles={4}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="publishTime"
                  checked={publishNow}
                  onChange={() => setPublishNow(true)}
                  disabled={isLoading}
                  className="h-4 w-4 text-white focus:ring-white/20 border-slate-600 bg-slate-900/50"
                />
                <span className="text-sm font-medium text-white">Publish Now</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="publishTime"
                  checked={!publishNow}
                  onChange={() => setPublishNow(false)}
                  disabled={isLoading}
                  className="h-4 w-4 text-white focus:ring-white/20 border-slate-600 bg-slate-900/50"
                />
                <span className="text-sm font-medium text-white">Schedule for Later</span>
              </label>
            </div>

            {!publishNow && (
              <ScheduleSelector
                onDateTimeChange={(date) => setScheduledAt(date)}
              />
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || selectedAccounts.length === 0 || !content.trim()}
            className="w-full px-6 py-3 bg-white text-black rounded-lg font-semibold hover:shadow-xl hover:shadow-white/20 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
          >
            {isLoading ? 'Creating Post...' : publishNow ? 'Publish Now' : 'Schedule Post'}
          </button>
        </form>
      </div>
    </div>
  );
}
