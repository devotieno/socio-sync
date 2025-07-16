'use client';

import React, { useState, useEffect } from 'react';
import { PLATFORM_CONFIGS } from '@/types/post';
import { PaperAirplaneIcon, CalendarIcon, PhotoIcon, VideoCameraIcon } from '@heroicons/react/24/outline';

interface PlatformPostData {
  platform: string;
  content: string;
  enabled: boolean;
  customizations?: {
    hashtags?: string[];
    mentions?: string[];
    mediaUrl?: string;
  };
}

interface MultiPlatformPostCreatorProps {
  onPostCreated?: (posts: PlatformPostData[]) => void;
}

export function MultiPlatformPostCreator({ onPostCreated }: MultiPlatformPostCreatorProps) {
  const [baseContent, setBaseContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [platformPosts, setPlatformPosts] = useState<PlatformPostData[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState<any[]>([]);

  const platforms = Object.values(PLATFORM_CONFIGS);

  useEffect(() => {
    // Load connected accounts
    const savedAccounts = localStorage.getItem('connectedAccounts');
    if (savedAccounts) {
      try {
        const accounts = JSON.parse(savedAccounts);
        setConnectedAccounts(accounts);
        
        // Initialize platform posts for connected accounts
        const initialPosts = accounts.map((account: any) => ({
          platform: account.platform,
          content: baseContent,
          enabled: true,
        }));
        setPlatformPosts(initialPosts);
      } catch (error) {
        console.error('Failed to load connected accounts:', error);
      }
    }
  }, [baseContent]);

  const updatePlatformContent = (platform: string, content: string) => {
    setPlatformPosts(prev => prev.map(post => 
      post.platform === platform 
        ? { ...post, content }
        : post
    ));
  };

  const togglePlatform = (platform: string) => {
    setPlatformPosts(prev => prev.map(post => 
      post.platform === platform 
        ? { ...post, enabled: !post.enabled }
        : post
    ));
  };

  const getCharacterCount = (content: string, platform: string) => {
    const config = PLATFORM_CONFIGS[platform];
    return {
      current: content.length,
      max: config.maxCharacters,
      remaining: config.maxCharacters - content.length,
      isOverLimit: content.length > config.maxCharacters,
    };
  };

  const handleBaseContentChange = (content: string) => {
    setBaseContent(content);
    // Update all platform contents
    setPlatformPosts(prev => prev.map(post => ({
      ...post,
      content: content,
    })));
  };

  const createPosts = async () => {
    setIsPosting(true);
    const enabledPosts = platformPosts.filter(post => post.enabled);
    const results = [];

    try {
      for (const post of enabledPosts) {
        const account = connectedAccounts.find(acc => acc.platform === post.platform);
        if (!account) continue;

        try {
          const postData = {
            content: post.content,
            mediaUrl: mediaUrl || undefined,
            scheduledTime: scheduledTime || undefined,
            // Platform-specific data
            ...(post.platform === 'facebook' && {
              pageId: account.additionalData?.pageId,
              pageAccessToken: account.additionalData?.pageAccessToken,
            }),
            ...(post.platform === 'instagram' && {
              instagramAccountId: account.additionalData?.instagramAccountId,
              mediaType: mediaUrl?.includes('.mp4') ? 'VIDEO' : 'IMAGE',
            }),
            ...(post.platform === 'linkedin' && {
              authorId: account.additionalData?.authorId,
              organizationId: account.additionalData?.organizationId,
            }),
          };

          const response = await fetch(`/api/${post.platform}/post`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...postData,
              accessToken: account.accessToken,
            }),
          });

          const result = await response.json();
          results.push({
            platform: post.platform,
            success: response.ok,
            data: result,
          });
        } catch (error) {
          console.error(`Failed to post to ${post.platform}:`, error);
          results.push({
            platform: post.platform,
            success: false,
            error: error,
          });
        }
      }

      onPostCreated?.(enabledPosts);
      
      // Reset form if all posts were successful
      if (results.every(r => r.success)) {
        setBaseContent('');
        setMediaUrl('');
        setScheduledTime('');
      }

    } catch (error) {
      console.error('Failed to create posts:', error);
    } finally {
      setIsPosting(false);
    }

    return results;
  };

  const connectedPlatforms = connectedAccounts.map(acc => acc.platform);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Multi-Platform Post</h3>
        
        {/* Base Content Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Post Content
          </label>
          <textarea
            value={baseContent}
            onChange={(e) => handleBaseContentChange(e.target.value)}
            placeholder="What's on your mind? This content will be adapted for each platform..."
            className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
        </div>

        {/* Media Upload */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Media URL (optional)
            </label>
            <div className="relative">
              <input
                type="url"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
              <PhotoIcon className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Schedule (optional)
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
              <CalendarIcon className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Platform-Specific Customizations */}
      <div className="space-y-4 mb-6">
        <h4 className="font-medium text-gray-900">Platform Customizations</h4>
        
        {platformPosts.map((post) => {
          const config = PLATFORM_CONFIGS[post.platform];
          const charCount = getCharacterCount(post.content, post.platform);
          const isConnected = connectedPlatforms.includes(post.platform);

          if (!isConnected) return null;

          return (
            <div
              key={post.platform}
              className={`border rounded-lg p-4 ${ 
                post.enabled ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={post.enabled}
                    onChange={() => togglePlatform(post.platform)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: config.color }}
                  >
                    {config.icon}
                  </div>
                  <span className="font-medium text-gray-900">{config.name}</span>
                </div>
                
                <div className={`text-sm ${ 
                  charCount.isOverLimit ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {charCount.current}/{charCount.max}
                </div>
              </div>

              {post.enabled && (
                <div>
                  <textarea
                    value={post.content}
                    onChange={(e) => updatePlatformContent(post.platform, e.target.value)}
                    placeholder={`Customize content for ${config.name}...`}
                    className={`w-full h-24 p-3 border rounded-lg resize-none ${ 
                      charCount.isOverLimit 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                  />
                  
                  {/* Platform-specific features */}
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                    {config.supportsMedia && (
                      <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full">
                        ✓ Media supported
                      </span>
                    )}
                    {post.platform === 'twitter' && (
                      <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                        ✓ Thread support
                      </span>
                    )}
                    {post.platform === 'linkedin' && (
                      <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                        ✓ Professional network
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Post Actions */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {platformPosts.filter(p => p.enabled).length} platforms selected
        </div>
        
        <button
          onClick={createPosts}
          disabled={isPosting || platformPosts.filter(p => p.enabled).length === 0 || !baseContent.trim()}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${ 
            isPosting || platformPosts.filter(p => p.enabled).length === 0 || !baseContent.trim()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isPosting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Posting...</span>
            </>
          ) : (
            <>
              <PaperAirplaneIcon className="w-5 h-5" />
              <span>{scheduledTime ? 'Schedule Posts' : 'Post Now'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
