'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FaTwitter, FaCheck, FaTimes, FaPlus } from 'react-icons/fa';
import TwitterPinAuth from './TwitterPinAuth';

interface TwitterAccountData {
  id: string;
  accountId: string;
  username: string;
  name: string;
  profile_image_url?: string;
  followers_count?: number;
  following_count?: number;
  connected_at?: string;
  isDefault?: boolean;
}

export default function TwitterAccount() {
  const [accounts, setAccounts] = useState<TwitterAccountData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showPinAuth, setShowPinAuth] = useState(false);

  // Real authentication check
  const { data: session, status } = useSession();
  const isAuthenticated = !!session;
  const isLoading = status === 'loading';

  useEffect(() => {
    if (isAuthenticated) {
      checkTwitterAccount();
    }
  }, [isAuthenticated]);

  // Handle Twitter connection callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('twitter_connected') === 'true') {
      // User just connected Twitter, refresh the account info
      checkTwitterAccount();
      // Clean up URL
      window.history.replaceState({}, document.title, '/dashboard/accounts');
    }
  }, []);

  const checkTwitterAccount = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/twitter/account');
      
      if (response.ok) {
        const data = await response.json();
        setAccounts(data.accounts || []);
      } else if (response.status === 404) {
        // No accounts connected
        setAccounts([]);
      } else {
        // Try to get error details from response
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.error || errorData?.details || 'Failed to check Twitter accounts';
        console.warn('Twitter account check failed:', errorMessage);
        setAccounts([]); // Set empty accounts instead of throwing
        setError(`Unable to load Twitter accounts: ${errorMessage}`);
      }
    } catch (err) {
      console.error('Error checking Twitter accounts:', err);
      setAccounts([]); // Set empty accounts on error
      setError(err instanceof Error ? err.message : 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const connectToTwitter = async () => {
    if (!session?.user?.id) {
      window.location.href = '/auth/signin';
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);
      
      // Call our custom linking API to get Twitter OAuth URL
      const response = await fetch('/api/twitter/link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get Twitter auth URL');
      }

      const { authUrl } = await response.json();
      
      // Redirect to Twitter OAuth
      window.location.href = authUrl;
    } catch (err) {
      console.error('Error connecting to Twitter:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect to Twitter');
      setIsConnecting(false);
    }
  };

  const disconnectTwitter = async (accountId: string) => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/twitter/account?accountId=${accountId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to disconnect Twitter account');
      }

      // Remove the account from the local state
      setAccounts(prev => prev.filter(acc => acc.accountId !== accountId));
    } catch (err) {
      console.error('Error disconnecting Twitter:', err);
      setError(err instanceof Error ? err.message : 'Failed to disconnect Twitter account');
    } finally {
      setLoading(false);
    }
  };

  const setDefaultAccount = async (accountId: string) => {
    try {
      const response = await fetch('/api/twitter/account/default', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accountId }),
      });

      if (!response.ok) {
        throw new Error('Failed to set default account');
      }

      // Update local state
      setAccounts(prev => prev.map(acc => ({
        ...acc,
        isDefault: acc.accountId === accountId
      })));
    } catch (err) {
      console.error('Error setting default account:', err);
      setError(err instanceof Error ? err.message : 'Failed to set default account');
    }
  };

  const handleManualLoginSuccess = () => {
    // Refresh the accounts list after successful manual login
    checkTwitterAccount();
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <FaTwitter className="text-blue-500 text-2xl mr-3" />
          <h3 className="text-lg font-semibold">Twitter</h3>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <FaTwitter className="text-blue-500 text-2xl mr-3" />
          <h3 className="text-lg font-semibold">Twitter</h3>
        </div>
        <p className="text-gray-600 mb-4">Please sign in to connect your Twitter account.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FaTwitter className="text-blue-500 text-2xl mr-3" />
          <h3 className="text-lg font-semibold">Twitter</h3>
        </div>
        {accounts.length > 0 && (
          <div className="flex items-center text-green-600">
            <FaCheck className="mr-1" />
            <span className="text-sm">{accounts.length} account{accounts.length > 1 ? 's' : ''} connected</span>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex items-center">
            <FaTimes className="text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {accounts.length > 0 ? (
        <div className="space-y-4">
          {accounts.map((account, index) => (
            <div key={account.accountId} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={account.profile_image_url || '/default-avatar.png'}
                    alt={account.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold">{account.name}</h4>
                      {account.isDefault && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          Default
                        </span>
                      )}
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        account.id.includes('manual_') 
                          ? 'bg-green-100 text-green-800' 
                          : account.id.includes('_') && account.id.split('_').length > 2
                          ? 'bg-green-100 text-green-800'  // PIN auth accounts
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {account.id.includes('manual_') || (account.id.includes('_') && account.id.split('_').length > 2)
                          ? 'Real Auth' 
                          : 'OAuth'}
                      </span>
                    </div>
                    <p className="text-gray-600">@{account.username}</p>
                    {account.followers_count !== undefined && (
                      <p className="text-sm text-gray-500">
                        {account.followers_count.toLocaleString()} followers
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {!account.isDefault && accounts.length > 1 && (
                    <button
                      onClick={() => setDefaultAccount(account.accountId)}
                      className="text-sm text-blue-600 hover:text-blue-800 px-2 py-1 rounded border border-blue-300 hover:border-blue-500"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => disconnectTwitter(account.accountId)}
                    disabled={loading}
                    className="text-sm text-red-600 hover:text-red-800 px-2 py-1 rounded border border-red-300 hover:border-red-500 disabled:opacity-50"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          <button
            onClick={() => setShowPinAuth(true)}
            disabled={isConnecting}
            className="w-full py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center border-2 border-dashed border-blue-300 bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium"
          >
            <FaPlus className="mr-2" />
            Connect X Account
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-600 text-center mb-6">
            Connect your X account to start posting and managing your tweets with full analytics access.
          </p>
          
          <button
            onClick={() => setShowPinAuth(true)}
            disabled={isConnecting}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center font-semibold"
          >
            <FaTwitter className="mr-2" />
            Connect X Account
          </button>
          
          <p className="text-xs text-gray-500 text-center mt-4">
            Secure PIN-based authentication with full access to post analytics and metrics.
          </p>
        </div>
      )}

      <TwitterPinAuth
        isOpen={showPinAuth}
        onClose={() => setShowPinAuth(false)}
        onSuccess={handleManualLoginSuccess}
      />
    </div>
  );
}
