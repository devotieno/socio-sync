'use client';

import React from 'react';
import { ConnectedAccount } from '../types/auth';

interface PlatformSelectorProps {
  connectedAccounts: ConnectedAccount[];
  selectedAccounts: string[];
  onAccountsChange: (accountIds: string[]) => void;
}

// Platform configurations for styling and limits
const PLATFORM_CONFIGS = {
  twitter: {
    name: 'Twitter',
    color: 'bg-blue-500',
    icon: '🐦',
    characterLimit: 280
  },
  facebook: {
    name: 'Facebook',
    color: 'bg-blue-600',
    icon: '📘',
    characterLimit: 63206
  },
  instagram: {
    name: 'Instagram',
    color: 'bg-pink-500',
    icon: '📷',
    characterLimit: 2200
  },
  linkedin: {
    name: 'LinkedIn',
    color: 'bg-blue-700',
    icon: '💼',
    characterLimit: 3000
  }
};

export default function PlatformSelector({ 
  connectedAccounts, 
  selectedAccounts, 
  onAccountsChange 
}: PlatformSelectorProps) {
  // Group accounts by platform
  const accountsByPlatform = connectedAccounts.reduce((acc, account) => {
    if (!acc[account.platform]) {
      acc[account.platform] = [];
    }
    acc[account.platform].push(account);
    return acc;
  }, {} as Record<string, ConnectedAccount[]>);

  const handleAccountToggle = (accountId: string) => {
    const updatedAccounts = selectedAccounts.includes(accountId)
      ? selectedAccounts.filter(id => id !== accountId)
      : [...selectedAccounts, accountId];
    onAccountsChange(updatedAccounts);
  };

  const handlePlatformToggle = (platform: string) => {
    const platformAccounts = accountsByPlatform[platform] || [];
    const platformAccountIds = platformAccounts.map((acc: ConnectedAccount) => acc.accountId);
    const allPlatformSelected = platformAccountIds.every((id: string) => selectedAccounts.includes(id));
    
    if (allPlatformSelected) {
      // Deselect all accounts for this platform
      const updatedAccounts = selectedAccounts.filter((id: string) => !platformAccountIds.includes(id));
      onAccountsChange(updatedAccounts);
    } else {
      // Select all accounts for this platform
      const newAccounts = platformAccountIds.filter((id: string) => !selectedAccounts.includes(id));
      onAccountsChange([...selectedAccounts, ...newAccounts]);
    }
  };

  if (connectedAccounts.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Select Platforms</h3>
        <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
          No social media accounts connected. 
          <br />
          Please connect your accounts in settings first.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Select Accounts</h3>
      <div className="space-y-3">
        {Object.entries(accountsByPlatform).map(([platform, accounts]) => {
          const config = PLATFORM_CONFIGS[platform as keyof typeof PLATFORM_CONFIGS];
          const platformAccountIds = (accounts as ConnectedAccount[]).map((acc: ConnectedAccount) => acc.accountId);
          const allPlatformSelected = platformAccountIds.every((id: string) => selectedAccounts.includes(id));
          const somePlatformSelected = platformAccountIds.some((id: string) => selectedAccounts.includes(id));
          
          return (
            <div key={platform} className="border rounded-lg p-4 space-y-3">
              {/* Platform header with toggle all */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{config?.icon || '📱'}</span>
                  <span className="font-medium">{config?.name || platform}</span>
                  <span className="text-sm text-gray-500">({accounts.length} account{accounts.length > 1 ? 's' : ''})</span>
                </div>
                <button
                  type="button"
                  onClick={() => handlePlatformToggle(platform)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    allPlatformSelected
                      ? 'bg-blue-600 text-white'
                      : somePlatformSelected
                      ? 'bg-blue-200 text-blue-800'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {allPlatformSelected ? 'All Selected' : somePlatformSelected ? 'Some Selected' : 'Select All'}
                </button>
              </div>
              
              {/* Individual accounts */}
              <div className="pl-6 space-y-2">
                {(accounts as ConnectedAccount[]).map((account: ConnectedAccount) => (
                  <label key={account.accountId} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedAccounts.includes(account.accountId)}
                      onChange={() => handleAccountToggle(account.accountId)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="flex items-center space-x-2">
                      {account.avatar && (
                        <img 
                          src={account.avatar} 
                          alt={account.username}
                          className="w-6 h-6 rounded-full"
                        />
                      )}
                      <span className="text-sm font-medium">{account.username}</span>
                      {account.isDefault && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                          Default
                        </span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      
      {selectedAccounts.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>{selectedAccounts.length}</strong> account{selectedAccounts.length > 1 ? 's' : ''} selected for posting
          </p>
        </div>
      )}
    </div>
  );
}
