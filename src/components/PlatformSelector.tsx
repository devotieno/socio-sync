'use client';

import React from 'react';
import { ConnectedAccount } from '../types/auth';

interface PlatformSelectorProps {
  connectedAccounts: ConnectedAccount[];
  selectedAccounts: string[];
  onAccountsChange: (accountIds: string[]) => void;
}

// Platform configuration for Twitter/X
const PLATFORM_CONFIGS = {
  twitter: {
    name: 'X (Twitter)',
    color: 'bg-blue-500',
    icon: '𝕏',
    characterLimit: 280
  },
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
        <h3 className="text-lg font-outfit font-semibold text-white">Select Twitter Account</h3>
        <div className="p-4 bg-slate-900/50 border border-slate-700/50 rounded-lg text-center text-slate-400">
          No Twitter account connected. 
          <br />
          Please connect your Twitter/X account in the Accounts section first.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-outfit font-semibold text-white">Select Twitter Accounts</h3>
      <div className="space-y-3">
        {Object.entries(accountsByPlatform).map(([platform, accounts]) => {
          const config = PLATFORM_CONFIGS[platform as keyof typeof PLATFORM_CONFIGS];
          const platformAccountIds = (accounts as ConnectedAccount[]).map((acc: ConnectedAccount) => acc.accountId);
          const allPlatformSelected = platformAccountIds.every((id: string) => selectedAccounts.includes(id));
          const somePlatformSelected = platformAccountIds.some((id: string) => selectedAccounts.includes(id));
          
          return (
            <div key={platform} className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4 space-y-3">
              {/* Platform header with toggle all */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{config?.icon || '📱'}</span>
                  <span className="font-medium text-white">{config?.name || platform}</span>
                  <span className="text-sm text-slate-400">({accounts.length} account{accounts.length > 1 ? 's' : ''})</span>
                </div>
                <button
                  type="button"
                  onClick={() => handlePlatformToggle(platform)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                    allPlatformSelected
                      ? 'bg-white text-black hover:shadow-lg hover:shadow-white/20'
                      : somePlatformSelected
                      ? 'bg-white/70 text-black hover:bg-white'
                      : 'bg-slate-700 text-white hover:bg-slate-600'
                  }`}
                >
                  {allPlatformSelected ? 'All Selected' : somePlatformSelected ? 'Some Selected' : 'Select All'}
                </button>
              </div>
              
              {/* Individual accounts */}
              <div className="pl-6 space-y-2">
                {(accounts as ConnectedAccount[]).map((account: ConnectedAccount) => (
                  <label key={account.accountId} className="flex items-center space-x-3 cursor-pointer hover:bg-slate-800/50 p-2 rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedAccounts.includes(account.accountId)}
                      onChange={() => handleAccountToggle(account.accountId)}
                      className="h-4 w-4 text-white focus:ring-white/20 border-slate-600 bg-slate-900/50 rounded"
                    />
                    <div className="flex items-center space-x-2">
                      {account.avatar && (
                        <img 
                          src={account.avatar} 
                          alt={account.username}
                          className="w-6 h-6 rounded-full"
                        />
                      )}
                      <span className="text-sm font-medium text-white">{account.username}</span>
                      {account.isDefault && (
                        <span className="text-xs bg-green-900/50 text-green-400 px-2 py-0.5 rounded border border-green-700/50">
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
        <div className="mt-4 p-3 bg-slate-900/50 border border-slate-700/50 rounded-lg">
          <p className="text-sm text-white">
            <strong>{selectedAccounts.length}</strong> account{selectedAccounts.length > 1 ? 's' : ''} selected for posting
          </p>
        </div>
      )}
    </div>
  );
}
