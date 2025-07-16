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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Post</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert className="border-red-500 text-red-700 bg-red-50">
              {error}
            </Alert>
          )}

          <PlatformSelector
            connectedAccounts={connectedAccounts}
            selectedAccounts={selectedAccounts}
            onAccountsChange={setSelectedAccounts}
          />

          <div className="space-y-2">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Post Content
            </label>
            <div className="relative">
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <label className="block text-sm font-medium text-gray-700">
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
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="publishTime"
                  checked={publishNow}
                  onChange={() => setPublishNow(true)}
                  disabled={isLoading}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">Publish Now</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="publishTime"
                  checked={!publishNow}
                  onChange={() => setPublishNow(false)}
                  disabled={isLoading}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">Schedule for Later</span>
              </label>
            </div>

            {!publishNow && (
              <ScheduleSelector
                onDateTimeChange={(date) => setScheduledAt(date)}
              />
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading || selectedAccounts.length === 0 || !content.trim()}
            className="w-full"
          >
            {isLoading ? 'Creating Post...' : publishNow ? 'Publish Now' : 'Schedule Post'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
