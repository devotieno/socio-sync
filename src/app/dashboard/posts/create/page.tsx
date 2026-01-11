'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import PostCreator from '@/components/PostCreator';
import { PostFormData } from '@/types/post';

export default function CreatePostPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [connectedAccounts, setConnectedAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchConnectedAccounts();
    }
  }, [session]);

  const fetchConnectedAccounts = async () => {
    try {
      setIsLoadingAccounts(true);
      console.log('Fetching connected accounts...'); // Debug log
      
      // Fetch accounts from the unified social accounts endpoint
      const response = await fetch('/api/social-accounts');
      const data = await response.json();
      
      console.log('Social accounts API response:', data); // Debug log
      
      if (data.success && data.accounts) {
        // Transform accounts to the expected format
        const accounts = data.accounts.map((account: any) => ({
          accountId: account.id,
          platform: account.platform,
          username: account.username || account.displayName,
          email: account.email,
          avatar: account.avatar || account.profileImage,
          isDefault: account.isDefault || false,
          connectedAt: account.connectedAt
        }));
        
        console.log('Transformed accounts:', accounts); // Debug log
        setConnectedAccounts(accounts);
      } else {
        console.log('No accounts found or API error:', data);
        setConnectedAccounts([]);
      }
    } catch (error) {
      console.error('Error fetching connected accounts:', error);
      setConnectedAccounts([]);
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  const handlePostSubmit = async (data: PostFormData) => {
    try {
      setIsLoading(true);
      
      // Get platforms from selected accounts
      const selectedAccountsData = connectedAccounts.filter(acc => 
        data.selectedAccounts.includes(acc.accountId)
      );
      const platforms = [...new Set(selectedAccountsData.map(acc => acc.platform))];
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('content', data.content);
      formData.append('platforms', JSON.stringify(platforms));
      formData.append('selectedAccounts', JSON.stringify(data.selectedAccounts));
      formData.append('publishNow', data.publishNow.toString());
      
      if (data.scheduledAt) {
        formData.append('scheduledAt', data.scheduledAt.toISOString());
      }

      // Add media files
      if (data.mediaFiles) {
        data.mediaFiles.forEach((file, index) => {
          formData.append('mediaFiles', file);
        });
      }

      const response = await fetch('/api/posts', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (result.error?.includes('No social media accounts connected')) {
          alert('Please connect at least one social media account before creating posts. Go to Settings > Social Accounts to connect your accounts.');
        } else if (result.error?.includes('No valid accounts found')) {
          alert('The selected accounts are not valid. Please select different accounts or reconnect your social media accounts.');
        } else if (result.error?.includes('rate limit exceeded')) {
          alert('Social media API rate limit exceeded. Your post has been saved and will be published automatically when the rate limit resets.');
        } else {
          alert(`Error: ${result.error || 'Failed to create post'}`);
        }
        throw new Error(result.error || 'Failed to create post');
      }

      // Show success message and redirect
      alert(result.message);
      router.push('/dashboard/posts');

    } catch (error) {
      console.error('Error creating post:', error);
      alert(error instanceof Error ? error.message : 'Failed to create post');
    } finally {
      setIsLoading(false);
    }
  };

  const debugAccounts = async () => {
    try {
      const response = await fetch('/api/debug/accounts');
      const data = await response.json();
      console.log('Debug accounts result:', data);
      alert(`Found ${data.accountsFound} connected accounts. Check console for details.`);
    } catch (error) {
      console.error('Debug accounts error:', error);
      alert('Failed to debug accounts. Check console for details.');
    }
  };

  if (status === 'loading' || isLoadingAccounts) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="backdrop-blur-xl bg-slate-800/30 border border-slate-700/50 rounded-2xl px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-outfit font-bold text-white">Create New Post</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-400">
              {connectedAccounts.length} account{connectedAccounts.length !== 1 ? 's' : ''} connected
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div>
        {connectedAccounts.length === 0 ? (
          <div className="backdrop-blur-xl bg-slate-800/30 border border-slate-700/50 rounded-2xl text-center py-12">
            <div className="text-6xl mb-4">🔗</div>
            <h3 className="text-xl font-outfit font-medium text-white mb-2">
              No Twitter/X Accounts Connected
            </h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              You need to connect at least one Twitter/X account before you can create posts.
            </p>
            <button
              onClick={() => router.push('/dashboard/accounts')}
              className="px-6 py-3 bg-white text-black rounded-lg font-semibold hover:shadow-xl hover:shadow-white/20 hover:scale-105 transition-all"
            >
              Connect Twitter/X Account
            </button>
          </div>
        ) : (
          <PostCreator
            onSubmit={handlePostSubmit}
            isLoading={isLoading}
            connectedAccounts={connectedAccounts}
          />
        )}
      </div>

      {/* Footer */}
      <div className="backdrop-blur-xl bg-slate-800/30 border border-slate-700/50 rounded-2xl mt-12 px-6 py-6">
        <div className="flex justify-center items-center space-x-6 text-sm text-slate-400">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>All systems operational</span>
          </div>
          <div>•</div>
          <div>𝕏ync v1.0</div>
        </div>
      </div>
    </div>
  );
}
