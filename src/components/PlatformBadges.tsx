'use client';

import React, { useEffect, useState } from 'react';
import { PLATFORM_CONFIGS } from '@/types/post';

interface ConnectedAccount {
  id: string;
  platform: string;
  username: string;
  avatar?: string;
}

interface PlatformBadgesProps {
  selectedAccounts: string[];
}

export function PlatformBadges({ selectedAccounts }: PlatformBadgesProps) {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch('/api/social-accounts');
        const data = await response.json();
        if (data.success && Array.isArray(data.accounts)) {
          setAccounts(data.accounts);
        } else {
          console.warn('Invalid accounts data:', data);
          setAccounts([]);
        }
      } catch (error) {
        console.error('Error fetching accounts:', error);
        setAccounts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-sm font-medium text-gray-700">Platforms:</span>
        <div className="flex space-x-2">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse bg-gray-200 rounded px-3 py-1 h-6 w-20"></div>
          ))}
        </div>
      </div>
    );
  }

  // Handle case where accounts is null, undefined, or empty
  if (!accounts || !Array.isArray(accounts)) {
    return (
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-sm font-medium text-gray-700">Platforms:</span>
        <div className="text-sm text-gray-500">No accounts connected</div>
      </div>
    );
  }

  // Handle case where selectedAccounts is null, undefined, or empty
  if (!selectedAccounts || !Array.isArray(selectedAccounts) || selectedAccounts.length === 0) {
    return (
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-sm font-medium text-gray-700">Platforms:</span>
        <div className="text-sm text-gray-500">No accounts selected</div>
      </div>
    );
  }

  // Filter accounts that are selected
  const selectedAccountsData = accounts.filter(account => 
    selectedAccounts.includes(account.id)
  );

  // Group by platform for display
  const platformGroups = selectedAccountsData.reduce((groups, account) => {
    const platform = account.platform;
    if (!groups[platform]) {
      groups[platform] = [];
    }
    groups[platform].push(account);
    return groups;
  }, {} as Record<string, ConnectedAccount[]>);

  if (selectedAccountsData.length === 0) {
    return (
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-sm font-medium text-gray-700">Platforms:</span>
        <span className="text-sm text-gray-500">No platforms selected</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 mb-4">
      <span className="text-sm font-medium text-gray-700">Platforms:</span>
      <div className="flex flex-wrap gap-2">
        {Object.entries(platformGroups).map(([platform, platformAccounts]) => {
          const config = PLATFORM_CONFIGS[platform];
          if (!config) return null;

          return (
            <div key={platform} className="flex items-center space-x-1">
              {/* Platform badge */}
              <div
                className="flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium text-white"
                style={{ backgroundColor: config.color }}
                title={`${config.name} (${platformAccounts.length} account${platformAccounts.length > 1 ? 's' : ''})`}
              >
                <span>{config.icon}</span>
                <span>{config.name}</span>
                {platformAccounts.length > 1 && (
                  <span className="bg-black bg-opacity-20 rounded-full px-1.5 py-0.5 text-xs">
                    {platformAccounts.length}
                  </span>
                )}
              </div>

              {/* Account usernames (show max 2) */}
              <div className="flex space-x-1">
                {platformAccounts.slice(0, 2).map((account, index) => (
                  <span 
                    key={account.id}
                    className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded"
                    title={account.username}
                  >
                    @{account.username.length > 8 ? `${account.username.slice(0, 8)}...` : account.username}
                  </span>
                ))}
                {platformAccounts.length > 2 && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    +{platformAccounts.length - 2} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
