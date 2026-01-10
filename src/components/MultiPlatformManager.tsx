'use client';

import React, { useState, useEffect } from 'react';
import { PLATFORM_CONFIGS } from '@/types/post';
import { PlusIcon, CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ConnectedAccount {
  id: string;
  platform: string;
  name: string;
  avatar?: string;
  isConnected: boolean;
  accessToken?: string;
  additionalData?: any;
}

interface MultiPlatformManagerProps {
  onAccountsChange?: (accounts: ConnectedAccount[]) => void;
}

export function MultiPlatformManager({ onAccountsChange }: MultiPlatformManagerProps) {
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const platforms = Object.values(PLATFORM_CONFIGS);

  useEffect(() => {
    // Load connected accounts from localStorage or API
    const savedAccounts = localStorage.getItem('connectedAccounts');
    if (savedAccounts) {
      try {
        const accounts = JSON.parse(savedAccounts);
        setConnectedAccounts(accounts);
        onAccountsChange?.(accounts);
      } catch (error) {
        console.error('Failed to load connected accounts:', error);
      }
    }
  }, [onAccountsChange]);

  const saveAccounts = (accounts: ConnectedAccount[]) => {
    setConnectedAccounts(accounts);
    localStorage.setItem('connectedAccounts', JSON.stringify(accounts));
    onAccountsChange?.(accounts);
  };

  const connectPlatform = async (platformId: string) => {
    setIsConnecting(platformId);
    setError(null);

    try {
      // Handle Twitter differently since it uses PIN-based auth
      if (platformId === 'twitter') {
        // Redirect to Twitter account management page instead
        window.location.href = '/dashboard/accounts?tab=twitter';
        return;
      }

      // Get auth URL for other platforms
      const authResponse = await fetch(`/api/${platformId}/auth`);
      if (!authResponse.ok) {
        const errorData = await authResponse.json().catch(() => null);
        throw new Error(errorData?.error || `Failed to get ${platformId} auth URL`);
      }

      const authData = await authResponse.json();
      
      // Open OAuth popup
      const popup = window.open(
        authData.authUrl,
        `${platformId}_auth`,
        'width=600,height=700,scrollbars=yes,resizable=yes'
      );

      // Listen for OAuth completion
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          setIsConnecting(null);
          
          // Check if authentication was successful
          setTimeout(() => {
            checkAuthCompletion(platformId);
          }, 1000);
        }
      }, 1000);

    } catch (error) {
      console.error(`Failed to connect ${platformId}:`, error);
      setError(`Failed to connect to ${platformId}`);
      setIsConnecting(null);
    }
  };

  const checkAuthCompletion = async (platformId: string) => {
    try {
      // This would typically check your backend for successful authentication
      // For now, we'll simulate a successful connection
      const newAccount: ConnectedAccount = {
        id: `${platformId}_${Date.now()}`,
        platform: platformId,
        name: `${PLATFORM_CONFIGS[platformId].name} Account`,
        isConnected: true,
      };

      const updatedAccounts = [...connectedAccounts, newAccount];
      saveAccounts(updatedAccounts);
    } catch (error) {
      console.error(`Failed to verify ${platformId} connection:`, error);
      setError(`Failed to verify ${platformId} connection`);
    }
  };

  const disconnectAccount = (accountId: string) => {
    const updatedAccounts = connectedAccounts.filter(account => account.id !== accountId);
    saveAccounts(updatedAccounts);
  };

  const getConnectedAccount = (platformId: string) => {
    return connectedAccounts.find(account => account.platform === platformId);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Connected Platforms</h3>
        <span className="text-sm text-gray-500">
          {connectedAccounts.length} of {platforms.length} platforms connected
        </span>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
          <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {platforms.map((platform) => {
          const connectedAccount = getConnectedAccount(platform.id);
          const isConnectingPlatform = isConnecting === platform.id;

          return (
            <div
              key={platform.id}
              className={`relative p-4 border rounded-lg transition-all ${ 
                connectedAccount 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold"
                    style={{ backgroundColor: platform.color }}
                  >
                    {platform.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{platform.name}</h4>
                    {connectedAccount && (
                      <p className="text-sm text-gray-600">{connectedAccount.name}</p>
                    )}
                  </div>
                </div>

                {connectedAccount ? (
                  <div className="flex items-center space-x-2">
                    <CheckIcon className="w-5 h-5 text-green-600" />
                    <button
                      onClick={() => disconnectAccount(connectedAccount.id)}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => connectPlatform(platform.id)}
                    disabled={isConnectingPlatform}
                    className={`flex items-center space-x-1 px-3 py-1 text-sm rounded-md transition-colors ${
                      isConnectingPlatform
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isConnectingPlatform ? (
                      <>
                        <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <>
                        <PlusIcon className="w-4 h-4" />
                        <span>Connect</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Platform capabilities */}
              <div className="mt-3 flex flex-wrap gap-1">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  Max {platform.maxCharacters} chars
                </span>
                {platform.supportsMedia && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    Media support
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {connectedAccounts.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Next Steps</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Create posts and select which platforms to publish to</li>
            <li>• Schedule posts across multiple platforms simultaneously</li>
            <li>• View unified analytics across all connected platforms</li>
          </ul>
        </div>
      )}
    </div>
  );
}
